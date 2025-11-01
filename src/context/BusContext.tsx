import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc,
  updateDoc,
  getDoc,
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';
import { BusData, BusStop, EtaRequest, Notification, BusLog } from '../types';
import { busRoutes, drivers } from '../data/busRoutes';
import { formatTime } from '../utils/geofence';
import { toast } from 'react-hot-toast';
import quotaManager from '../utils/quotaManager';

// Simplified bus state structure for Firebase
interface BusState {
  id: number;
  currentStopIndex: number;
  eta: number | null;
  routeCompleted: boolean;
  lastUpdated: string;
  studentCount: number; // Add student count to bus state
}

interface BusContextType {
  buses: Record<number, BusData>;
  selectedBus: number | null;
  setSelectedBus: (busId: number | null) => void;
  moveToNextStop: (busId: number) => void;
  moveToPreviousStop: (busId: number) => void;
  setEta: (busId: number, minutes: number) => void;
  resetBusProgress: (busId: number) => void;
  getFormattedTime: () => string;
  requestStop: (busId: number) => void;
  reverseRoute: () => void;
  updateStudentCount: (busId: number, count: number) => void; // Add this line
  loading: boolean;
  firebaseConnected: boolean;
  firebaseError: string | null;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Record<number, BusData>>({});
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionRetryCount = useRef(0);
  const isInitializedRef = useRef(false);
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedBusesRef = useRef<Set<number>>(new Set());
  const activeListenersRef = useRef<Set<number>>(new Set());
  
  // Rate limiting for Firebase updates
  const updateQueueRef = useRef<Array<{busId: number, updates: Partial<BusState>}>>([]);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_THROTTLE = 1000; // Reduced to 1 second for better real-time updates
  
  // Initialize buses with hardcoded routes - RUN ONLY ONCE
  useEffect(() => {
    const initializeBuses = () => {
      const busesMap: Record<number, BusData> = {};
      
      // Create buses from hardcoded data
      Object.keys(busRoutes).forEach(busIdStr => {
        const busId = parseInt(busIdStr);
        const route = busRoutes[busId];
        const driver = drivers.find(d => d.bus === busId);
        
        // Generate a random student count between 0 and 50
        const randomStudentCount = Math.floor(Math.random() * 51);
        
        busesMap[busId] = {
          id: busId,
          currentStopIndex: 0,
          eta: null,
          route: route.map(stop => ({ ...stop, completed: false })),
          etaRequests: [],
          notifications: [],
          totalDistance: 0,
          routeCompleted: false,
          studentCount: randomStudentCount, // Initialize with random student count
          atStop: false // Initialize atStop property
        };
      });
      
      setBuses(busesMap);
      setLoading(false);
    };

    initializeBuses();
    
    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      // Clear the update queue
      updateQueueRef.current = [];
    };
  }, []);

  // Firebase listener for bus states - OPTIMIZED FOR REAL-TIME UPDATES
  useEffect(() => {
    if (!db || Object.keys(buses).length === 0) return;

    // Clear any existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Clear any existing connection check interval
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }

    const setupListener = () => {
      try {
        // For student use case: Listen to all buses to ensure any selected bus is available
        // This is more efficient than constantly subscribing/unsubscribing
        const unsubscribe = onSnapshot(
          collection(db as Firestore, 'busStates'),
          {
            includeMetadataChanges: false // Disable metadata changes to reduce unnecessary updates
          },
          (snapshot) => {
            try {
              let hasUpdates = false;
              const updatedBuses: Record<number, Partial<BusData>> = {};
              
              // Process all documents in the snapshot
              snapshot.forEach((doc) => {
                const busStateData = doc.data() as BusState;
                const busId = parseInt(doc.id);
                
                // Get the initial route from our local buses state
                const localBus = buses[busId];
                if (localBus) {
                  // Only update if there are actual changes
                  if (localBus.currentStopIndex !== busStateData.currentStopIndex || 
                      localBus.eta !== busStateData.eta || 
                      localBus.routeCompleted !== busStateData.routeCompleted ||
                      localBus.studentCount !== busStateData.studentCount) {
                    
                    // Prepare update for this bus
                    const updates: Partial<BusData> = {
                      currentStopIndex: busStateData.currentStopIndex,
                      eta: busStateData.eta,
                      route: localBus.route.map((stop, index) => ({
                        ...stop,
                        completed: index < busStateData.currentStopIndex
                      })),
                      routeCompleted: busStateData.routeCompleted || false,
                      studentCount: busStateData.studentCount || localBus.studentCount
                    };
                    
                    updatedBuses[busId] = updates;
                    hasUpdates = true;
                  }
                }
              });
              
              // Apply all updates at once
              if (hasUpdates) {
                setBuses(prev => {
                  const newBuses = { ...prev };
                  Object.keys(updatedBuses).forEach(busIdStr => {
                    const busId = parseInt(busIdStr);
                    const updates = updatedBuses[busId];
                    if (newBuses[busId] && updates) {
                      newBuses[busId] = {
                        ...newBuses[busId],
                        ...updates
                      } as BusData;
                    }
                  });
                  return newBuses;
                });
                
                // Update connection status
                if (!firebaseConnected) {
                  setFirebaseConnected(true);
                  setFirebaseError(null);
                }
              }
            } catch (err) {
              console.error('Error processing bus state snapshot:', err);
              setFirebaseError('Error processing real-time updates');
            }
          },
          (error) => {
            console.error('Firebase listener error:', error);
            setFirebaseConnected(false);
            setFirebaseError('Failed to connect to real-time updates');
            
            // Retry connection with exponential backoff
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            
            const retryDelay = Math.min(1000 * Math.pow(2, connectionRetryCount.current), 30000); // Max 30 seconds
            connectionRetryCount.current++;
            
            retryTimeoutRef.current = setTimeout(() => {
              setupListener();
            }, retryDelay);
          }
        );
        
        // Set the unsubscribe function
        unsubscribeRef.current = unsubscribe;
        
        // Set up periodic connection check
        connectionCheckIntervalRef.current = setInterval(() => {
          if (!firebaseConnected) {
            setupListener();
          }
        }, 30000); // Check every 30 seconds
        
        // Reset retry count on successful connection
        connectionRetryCount.current = 0;
        
      } catch (err) {
        console.error('Error setting up Firebase listener:', err);
        setFirebaseConnected(false);
        setFirebaseError('Failed to initialize real-time updates');
      }
    };

    setupListener();
    
    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current);
      }
    };
  }, [buses, firebaseConnected]);

  // Initialize bus states in Firebase (with better error handling) - RUN ONLY ONCE
  useEffect(() => {
    if (!db || Object.keys(buses).length === 0 || isInitializedRef.current) return;

    const initializeBusStates = async () => {
      try {
        const promises = Object.values(buses).map(async (bus) => {
          // Only initialize buses that haven't been initialized yet
          if (!initializedBusesRef.current.has(bus.id)) {
            const busRef = doc(db as Firestore, 'busStates', bus.id.toString());
            const busDoc = await getDoc(busRef);
            
            if (!busDoc.exists()) {
              // Use only essential fields for Firebase initialization
              const busState = {
                id: bus.id,
                currentStopIndex: bus.currentStopIndex,
                eta: bus.eta,
                routeCompleted: bus.routeCompleted || false,
                studentCount: bus.studentCount,
                lastUpdated: new Date().toISOString()
              };
              
              await setDoc(busRef, busState, { merge: true });
            }
            
            // Mark this bus as initialized
            initializedBusesRef.current.add(bus.id);
          }
        });
        
        await Promise.allSettled(promises);
        setFirebaseConnected(true);
        setFirebaseError(null);
        isInitializedRef.current = true;
      } catch (error: any) {
        console.error('Error initializing bus states:', error);
        setFirebaseError(`Initialization Error: ${error.message || 'Failed to initialize bus states'}`);
      }
    };

    const timer = setTimeout(() => {
      initializeBusStates();
    }, 100);

    return () => clearTimeout(timer);
  }, [buses, db]);

  const getFormattedTime = (): string => {
    return formatTime(new Date());
  };

  // Update bus state in Firebase - OPTIMIZED FOR REAL-TIME UPDATES WITH IMPROVED RATE LIMITING
  const updateBusStateInFirebase = async (busId: number, updates: Partial<BusState>) => {
    if (!db) {
      console.warn('Firebase not initialized');
      return;
    }

    try {
      // For critical real-time updates, try to process immediately if possible
      if (quotaManager.canProcessImmediately()) {
        const busRef = doc(db as Firestore, 'busStates', busId.toString());
        
        // Only include fields that are actually being updated
        const firebaseUpdates: any = {
          lastUpdated: new Date().toISOString()
        };
        
        if (updates.currentStopIndex !== undefined) {
          firebaseUpdates.currentStopIndex = updates.currentStopIndex;
        }
        if (updates.eta !== undefined) {
          firebaseUpdates.eta = updates.eta;
        }
        if (updates.routeCompleted !== undefined) {
          firebaseUpdates.routeCompleted = updates.routeCompleted;
        }
        if (updates.studentCount !== undefined) {
          firebaseUpdates.studentCount = updates.studentCount;
        }
        
        // Only update if there are actual changes
        if (Object.keys(firebaseUpdates).length > 1) { // More than just lastUpdated
          await setDoc(busRef, firebaseUpdates, { merge: true });
        }
        
        setFirebaseError(null);
      } else {
        // Use the quota manager to queue and rate-limit the update
        await quotaManager.queueUpdate(async () => {
          const busRef = doc(db as Firestore, 'busStates', busId.toString());
          
          // Only include fields that are actually being updated
          const firebaseUpdates: any = {
            lastUpdated: new Date().toISOString()
          };
          
          if (updates.currentStopIndex !== undefined) {
            firebaseUpdates.currentStopIndex = updates.currentStopIndex;
          }
          if (updates.eta !== undefined) {
            firebaseUpdates.eta = updates.eta;
          }
          if (updates.routeCompleted !== undefined) {
            firebaseUpdates.routeCompleted = updates.routeCompleted;
          }
          if (updates.studentCount !== undefined) {
            firebaseUpdates.studentCount = updates.studentCount;
          }
          
          // Only update if there are actual changes
          if (Object.keys(firebaseUpdates).length > 1) { // More than just lastUpdated
            await setDoc(busRef, firebaseUpdates, { merge: true });
          }
          
          return true;
        });
      }
      
      setFirebaseError(null);
    } catch (error: any) {
      console.error(`Error updating bus state ${busId}:`, error);
      setFirebaseError(`Update Error: ${error.message || 'Failed to update bus state'}`);
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your credentials.');
      } else if (error.code === 'resource-exhausted') {
        toast.error('Quota exceeded. Please wait before trying again.');
        quotaManager.clearQueue();
      }
    }
  };

  const moveToNextStop = async (busId: number) => {
    try {
      const bus = buses[busId];
      if (!bus || bus.currentStopIndex >= bus.route.length - 1) return;

      const currentStop = bus.route[bus.currentStopIndex];
      const formattedTime = getFormattedTime();

      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          // Mark current stop as completed
          const updatedRoute = [...updatedBuses[busId].route];
          updatedRoute[bus.currentStopIndex] = {
            ...updatedRoute[bus.currentStopIndex],
            completed: true,
            actualTime: formattedTime
          };

          updatedBuses[busId] = {
            ...updatedBuses[busId],
            currentStopIndex: bus.currentStopIndex + 1,
            eta: null,
            route: updatedRoute,
            routeCompleted: bus.currentStopIndex + 1 >= bus.route.length
          };
        }
        return updatedBuses;
      });

      // Update Firebase state - IMMEDIATE UPDATE FOR REAL-TIME SYNC
      await updateBusStateInFirebase(busId, {
        currentStopIndex: bus.currentStopIndex + 1,
        eta: null,
        routeCompleted: bus.currentStopIndex + 1 >= bus.route.length
      });

      toast.success('Moved to next stop');
    } catch (error: any) {
      console.error('Error moving to next stop:', error);
      setFirebaseError(`Navigation Error: ${error.message || 'Failed to move to next stop'}`);
      toast.error('Failed to update stop');
    }
  };

  const moveToPreviousStop = async (busId: number) => {
    try {
      const bus = buses[busId];
      if (!bus || bus.currentStopIndex <= 0) return;

      const previousStopIndex = bus.currentStopIndex - 1;
      const previousStop = bus.route[previousStopIndex];
      const formattedTime = getFormattedTime();

      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          // Mark previous stop as not completed
          const updatedRoute = [...updatedBuses[busId].route];
          updatedRoute[previousStopIndex] = {
            ...updatedRoute[previousStopIndex],
            completed: false,
            actualTime: undefined
          };

          updatedBuses[busId] = {
            ...updatedBuses[busId],
            currentStopIndex: previousStopIndex,
            eta: null,
            route: updatedRoute,
            routeCompleted: false
          };
        }
        return updatedBuses;
      });

      // Update Firebase state - IMMEDIATE UPDATE FOR REAL-TIME SYNC
      await updateBusStateInFirebase(busId, {
        currentStopIndex: previousStopIndex,
        eta: null,
        routeCompleted: false
      });

      toast.success('Returned to previous stop');
    } catch (error: any) {
      console.error('Error moving to previous stop:', error);
      setFirebaseError(`Navigation Error: ${error.message || 'Failed to return to previous stop'}`);
      toast.error('Failed to update stop');
    }
  };

  const setEta = async (busId: number, minutes: number) => {
    try {
      const bus = buses[busId];
      if (!bus) return;

      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          updatedBuses[busId] = {
            ...updatedBuses[busId],
            eta: minutes
          };
        }
        return updatedBuses;
      });

      // Update Firebase state - IMMEDIATE UPDATE FOR REAL-TIME SYNC
      await updateBusStateInFirebase(busId, {
        eta: minutes
      });

      toast.success('ETA set successfully');
    } catch (error: any) {
      console.error('Error setting ETA:', error);
      setFirebaseError(`ETA Error: ${error.message || 'Failed to set ETA'}`);
      toast.error('Failed to set ETA');
    }
  };

  // Add function to update student count
  const updateStudentCount = async (busId: number, count: number) => {
    try {
      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          updatedBuses[busId] = {
            ...updatedBuses[busId],
            studentCount: Math.max(0, count) // Ensure count is not negative
          };
        }
        return updatedBuses;
      });

      // Update Firebase state for real-time sync
      await updateBusStateInFirebase(busId, {
        studentCount: Math.max(0, count)
      });

      toast.success('Student count updated');
    } catch (error: any) {
      console.error('Error updating student count:', error);
      toast.error('Failed to update student count');
    }
  };

  const requestStop = async (busId: number) => {
    try {
      toast.success('Stop request sent to driver');
    } catch (error: any) {
      console.error('Error requesting stop:', error);
      setFirebaseError(`Request Error: ${error.message || 'Failed to request stop'}`);
      toast.error('Failed to request stop');
    }
  };

  const resetBusProgress = async (busId: number) => {
    try {
      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          const resetRoute = updatedBuses[busId].route.map(stop => ({
            ...stop,
            completed: false,
            actualTime: undefined
          }));

          updatedBuses[busId] = {
            ...updatedBuses[busId],
            currentStopIndex: 0,
            eta: null,
            route: resetRoute,
            etaRequests: [],
            notifications: [],
            routeCompleted: false
          };
        }
        return updatedBuses;
      });

      // Update Firebase state - IMMEDIATE UPDATE FOR REAL-TIME SYNC
      await updateBusStateInFirebase(busId, {
        currentStopIndex: 0,
        eta: null,
        routeCompleted: false
      });

      toast.success('Route reset successfully');
    } catch (error: any) {
      console.error('Error resetting bus progress:', error);
      setFirebaseError(`Reset Error: ${error.message || 'Failed to reset route'}`);
      toast.error('Failed to reset route');
    }
  };

  const reverseRoute = async () => {
    try {
      setBuses(prev => {
        const updatedBuses = { ...prev };
        Object.keys(updatedBuses).forEach(busIdStr => {
          const busId = parseInt(busIdStr);
          const bus = updatedBuses[busId];
          
          // Reverse the route
          const reversedRoute = [...bus.route].reverse();
          
          updatedBuses[busId] = {
            ...bus,
            currentStopIndex: 0,
            route: reversedRoute,
            routeCompleted: false,
            atStop: false // Reset atStop flag when reversing route
          };
        });
        return updatedBuses;
      });

      toast.success('All routes reversed');
    } catch (error: any) {
      console.error('Error reversing routes:', error);
      setFirebaseError(`Reverse Error: ${error.message || 'Failed to reverse routes'}`);
      toast.error('Failed to reverse routes');
    }
  };

  return (
    <BusContext.Provider
      value={{
        buses,
        selectedBus,
        setSelectedBus,
        moveToNextStop,
        moveToPreviousStop,
        setEta,
        resetBusProgress,
        getFormattedTime,
        requestStop,
        reverseRoute,
        updateStudentCount, // Add the new function to the context value
        loading,
        firebaseConnected,
        firebaseError
      }}
    >
      {children}
    </BusContext.Provider>
  );
};