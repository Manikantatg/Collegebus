import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc,
  updateDoc,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { db } from '../firebase';
import { BusData, BusStop, EtaRequest, Notification, Location } from '../types';
import { busRoutes, drivers } from '../data/busRoutes';
import { formatTime } from '../utils/geofence';
import { toast } from 'react-hot-toast';

// Simplified bus state structure for Firebase
interface BusState {
  id: number;
  currentStopIndex: number;
  eta: number | null;
  routeCompleted: boolean;
  lastUpdated: string;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
    speed: number | null;
  };
  currentDriver?: {
    uid: string;
    email: string;
    name: string;
  };
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
  logDriverAttendance: (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number; speed: number | null }) => Promise<void>;
  updateDriverLocation: (busId: number, location: { lat: number; lng: number; speed: number | null }) => void;
  reverseRoute: () => void;
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
  
  // Initialize buses with hardcoded routes - RUN ONLY ONCE
  useEffect(() => {
    const initializeBuses = () => {
      const busesMap: Record<number, BusData> = {};
      
      // Create buses from hardcoded data
      Object.keys(busRoutes).forEach(busIdStr => {
        const busId = parseInt(busIdStr);
        const route = busRoutes[busId];
        const driver = drivers.find(d => d.bus === busId);
        
        busesMap[busId] = {
          id: busId,
          currentStopIndex: 0,
          eta: null,
          route: route.map(stop => ({ ...stop, completed: false })),
          etaRequests: [],
          notifications: [],
          totalDistance: 0,
          routeCompleted: false
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
    };
  }, []);

  // Firebase listener for bus states only (with better error handling and real-time optimization)
  useEffect(() => {
    if (!db) return;

    // Clear any existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const setupListener = () => {
      try {
        console.log('Setting up Firebase listener...');
        const unsubscribe = onSnapshot(
          collection(db as Firestore, 'busStates'),
          {
            // Include metadata changes to better handle connection state
            includeMetadataChanges: true // Enable for better real-time detection
          },
          (snapshot) => {
            try {
              console.log('Received snapshot with', snapshot.docChanges().length, 'changes');
              let hasUpdates = false;
              const updatedBuses: Record<number, Partial<BusData>> = {};
              
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified' || change.type === 'added') {
                  const busState = change.doc.data() as BusState;
                  const busId = busState.id;
                  
                  // Get the initial route from our local buses state
                  const localBus = buses[busId];
                  if (localBus) {
                    console.log('Processing update for bus', busId, 'with stop index', busState.currentStopIndex);
                    // Prepare update for this bus
                    const updates: Partial<BusData> = {
                      currentStopIndex: busState.currentStopIndex,
                      eta: busState.eta,
                      route: localBus.route.map((stop, index) => ({
                        ...stop,
                        completed: index < busState.currentStopIndex
                      })),
                      routeCompleted: busState.routeCompleted || false
                    };
                    
                    // Add driver information if available
                    if (busState.currentDriver) {
                      updates.currentDriver = busState.currentDriver;
                    }
                    
                    // Add location information if available
                    if (busState.currentLocation) {
                      updates.currentLocation = {
                        lat: busState.currentLocation.lat,
                        lng: busState.currentLocation.lng,
                        timestamp: busState.currentLocation.timestamp,
                        speed: busState.currentLocation.speed || 0
                      };
                    }
                    
                    updatedBuses[busId] = updates;
                    hasUpdates = true;
                  }
                }
              });
              
              // Apply all updates at once
              if (hasUpdates) {
                console.log('Applying updates to buses:', Object.keys(updatedBuses));
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
              }
              
              setFirebaseConnected(true);
              setFirebaseError(null);
              connectionRetryCount.current = 0; // Reset retry count on successful connection
              
              // Clear any retry timeout on successful connection
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
              }
            } catch (error: any) {
              console.error('Error processing bus state updates:', error);
              setFirebaseError(`Update Error: ${error.message || 'Failed to process updates'}`);
            }
          },
          (error: any) => {
            console.error('Error listening to bus states:', error);
            setFirebaseError(`Listener Error: ${error.message || 'Failed to listen for updates'}`);
            setFirebaseConnected(false);
            
            // Provide more specific error handling for permissions issues
            if (error.code === 'permission-denied') {
              setFirebaseError('Permission Error: Please check Firebase security rules');
              console.error('Firebase permission denied. Check security rules.');
            }
            
            // Implement exponential backoff for reconnection
            if (connectionRetryCount.current < 5) { // Limit retries to prevent infinite loop
              connectionRetryCount.current += 1;
              const retry = () => {
                console.log('Retrying Firebase connection... Attempt', connectionRetryCount.current);
                setupListener();
              };
              
              // Retry after 2 seconds, then 4, then 8, up to 30 seconds
              const retryDelay = Math.min(2000 * Math.pow(2, connectionRetryCount.current - 1), 30000);
              console.log('Scheduling retry in', retryDelay, 'ms');
              retryTimeoutRef.current = setTimeout(retry, retryDelay);
            } else {
              console.error('Max retry attempts reached. Stopping reconnection attempts.');
              setFirebaseError('Max retry attempts reached. Please refresh the page to reconnect.');
            }
          }
        );
        
        unsubscribeRef.current = unsubscribe;
      } catch (error: any) {
        console.error('Error setting up Firebase listener:', error);
        setFirebaseError(`Setup Error: ${error.message || 'Failed to setup listener'}`);
        setFirebaseConnected(false);
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
        retryTimeoutRef.current = null;
      }
    };
  }, [db]); // Remove buses dependency to prevent re-subscription

  // Initialize bus states in Firebase (with better error handling) - RUN ONLY ONCE
  useEffect(() => {
    if (!db || Object.keys(buses).length === 0 || isInitializedRef.current) return;

    const initializeBusStates = async () => {
      try {
        console.log('Initializing bus states in Firebase');
        const promises = Object.values(buses).map(async (bus) => {
          const busState: BusState = {
            id: bus.id,
            currentStopIndex: bus.currentStopIndex,
            eta: bus.eta,
            routeCompleted: bus.routeCompleted || false,
            lastUpdated: new Date().toISOString()
          };
          
          if (db) {
            // Use setDoc with merge to avoid overwriting existing data
            await setDoc(doc(db as Firestore, 'busStates', bus.id.toString()), busState, { merge: true });
          }
        });
        
        await Promise.allSettled(promises); // Use allSettled to prevent one failure from stopping all
        console.log('Bus states initialized successfully');
        setFirebaseConnected(true);
        setFirebaseError(null);
        isInitializedRef.current = true; // Mark as initialized
      } catch (error: any) {
        console.error('Error initializing bus states:', error);
        setFirebaseError(`Initialization Error: ${error.message || 'Failed to initialize bus states'}`);
      }
    };

    initializeBusStates();
  }, [buses, db]);

  const getFormattedTime = (): string => {
    return formatTime(new Date());
  };

  // Update bus state in Firebase - OPTIMIZED FOR REAL-TIME UPDATES
  const updateBusStateInFirebase = async (busId: number, updates: Partial<BusState>) => {
    if (!db || !firebaseConnected) {
      console.warn('Firebase not connected, skipping update for bus', busId);
      // Try to reconnect
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    try {
      console.log('Updating Firebase state for bus', busId, 'with updates:', updates);
      const busRef = doc(db as Firestore, 'busStates', busId.toString());
      
      // Use setDoc with merge for faster updates and to avoid conflicts
      await setDoc(busRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      setFirebaseError(null);
      console.log('Firebase update successful for bus', busId);
    } catch (error: any) {
      console.error(`Error updating bus state ${busId}:`, error);
      setFirebaseError(`Update Error: ${error.message || 'Failed to update bus state'}`);
      
      // If it's a permission error, show a more user-friendly message
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your credentials.');
      } else if (error.code === 'resource-exhausted') {
        toast.error('Too many requests. Please wait before trying again.');
      }
    }
  };

  const logDriverAttendance = async (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number; speed: number | null }) => {
    try {
      const driver = drivers.find(d => d.bus === busId);
      if (!driver) return;

      const formattedTime = getFormattedTime();
      
      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          if (type === 'entry') {
            updatedBuses[busId] = {
              ...updatedBuses[busId],
              currentDriver: {
                uid: driver.email,
                email: driver.email,
                name: driver.name
              },
              currentLocation: {
                lat: location.lat,
                lng: location.lng,
                timestamp: new Date().toISOString(),
                speed: location.speed || 0
              }
            };
          } else {
            updatedBuses[busId] = {
              ...updatedBuses[busId],
              currentDriver: undefined,
              currentLocation: undefined
            };
          }
          
          // Add notification (only once)
          const newNotification: Notification = {
            type: 'update',
            message: `Driver ${type === 'entry' ? 'started' : 'ended'} shift at ${formattedTime}`,
            timestamp: formattedTime
          };
          
          // Prevent duplicate notifications
          const existingNotification = updatedBuses[busId].notifications.find(
            n => n.message === newNotification.message && n.timestamp === newNotification.timestamp
          );
          
          if (!existingNotification) {
            updatedBuses[busId].notifications.unshift(newNotification);
            // Keep only the latest 5 notifications
            if (updatedBuses[busId].notifications.length > 5) {
              updatedBuses[busId].notifications = updatedBuses[busId].notifications.slice(0, 5);
            }
          }
        }
        return updatedBuses;
      });

      // Update Firebase with driver attendance - IMMEDIATE UPDATE
      if (type === 'entry') {
        await updateBusStateInFirebase(busId, {
          currentDriver: {
            uid: driver.email,
            email: driver.email,
            name: driver.name
          },
          currentLocation: {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
            speed: location.speed || 0
          }
        });
      } else {
        await updateBusStateInFirebase(busId, {
          currentDriver: undefined,
          currentLocation: undefined
        });
      }

      toast.success(`Driver ${type} logged successfully`);
    } catch (error: any) {
      console.error('Error logging driver attendance:', error);
      setFirebaseError(`Attendance Error: ${error.message || 'Failed to log attendance'}`);
      toast.error('Failed to log attendance');
    }
  };

  // Update driver location continuously
  const updateDriverLocation = async (busId: number, location: { lat: number; lng: number; speed: number | null }) => {
    try {
      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          updatedBuses[busId] = {
            ...updatedBuses[busId],
            currentLocation: {
              lat: location.lat,
              lng: location.lng,
              timestamp: new Date().toISOString(),
              speed: location.speed || 0
            }
          };
        }
        return updatedBuses;
      });

      // Update Firebase with new location - IMMEDIATE UPDATE
      await updateBusStateInFirebase(busId, {
        currentLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
          speed: location.speed || 0
        }
      });
    } catch (error: any) {
      console.error('Error updating driver location:', error);
      setFirebaseError(`Location Error: ${error.message || 'Failed to update location'}`);
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

          // Add notification (only once)
          const newNotification: Notification = {
            type: 'update',
            message: `Bus arrived at ${currentStop.name}`,
            timestamp: formattedTime
          };
          
          // Prevent duplicate notifications
          const existingNotification = updatedBuses[busId].notifications.find(
            n => n.message === newNotification.message && n.timestamp === newNotification.timestamp
          );
          
          if (!existingNotification) {
            updatedBuses[busId].notifications.unshift(newNotification);
            // Keep only the latest 5 notifications
            if (updatedBuses[busId].notifications.length > 5) {
              updatedBuses[busId].notifications = updatedBuses[busId].notifications.slice(0, 5);
            }
          }
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

          // Add notification (only once)
          const newNotification: Notification = {
            type: 'update',
            message: `Bus returned to ${previousStop.name}`,
            timestamp: formattedTime
          };
          
          // Prevent duplicate notifications
          const existingNotification = updatedBuses[busId].notifications.find(
            n => n.message === newNotification.message && n.timestamp === newNotification.timestamp
          );
          
          if (!existingNotification) {
            updatedBuses[busId].notifications.unshift(newNotification);
            // Keep only the latest 5 notifications
            if (updatedBuses[busId].notifications.length > 5) {
              updatedBuses[busId].notifications = updatedBuses[busId].notifications.slice(0, 5);
            }
          }
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

      const nextStopName = bus.route[bus.currentStopIndex + 1]?.name || 'next stop';
      const formattedTime = getFormattedTime();

      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          updatedBuses[busId] = {
            ...updatedBuses[busId],
            eta: minutes
          };

          // Add ETA request (only once)
          const newEtaRequest: EtaRequest = {
            stopIndex: bus.currentStopIndex,
            minutes: minutes,
            timestamp: formattedTime,
            nextStop: nextStopName
          };
          
          // Prevent duplicate ETA requests
          const existingRequest = updatedBuses[busId].etaRequests.find(
            r => r.stopIndex === newEtaRequest.stopIndex && r.minutes === newEtaRequest.minutes
          );
          
          if (!existingRequest) {
            updatedBuses[busId].etaRequests.unshift(newEtaRequest);
            // Keep only the latest 5 requests
            if (updatedBuses[busId].etaRequests.length > 5) {
              updatedBuses[busId].etaRequests = updatedBuses[busId].etaRequests.slice(0, 5);
            }
          }

          // Add notification (only once)
          const newNotification: Notification = {
            type: 'eta',
            message: `ETA to ${nextStopName}: ${minutes} minutes`,
            timestamp: formattedTime
          };
          
          // Prevent duplicate notifications
          const existingNotification = updatedBuses[busId].notifications.find(
            n => n.message === newNotification.message && n.timestamp === newNotification.timestamp
          );
          
          if (!existingNotification) {
            updatedBuses[busId].notifications.unshift(newNotification);
            // Keep only the latest 5 notifications
            if (updatedBuses[busId].notifications.length > 5) {
              updatedBuses[busId].notifications = updatedBuses[busId].notifications.slice(0, 5);
            }
          }
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

  const requestStop = async (busId: number) => {
    try {
      const formattedTime = getFormattedTime();

      // Update local state
      setBuses(prev => {
        const updatedBuses = { ...prev };
        if (updatedBuses[busId]) {
          const newNotification: Notification = {
            type: 'request',
            message: '5-minute stop requested by student',
            timestamp: formattedTime
          };
          
          // Prevent duplicate notifications
          const existingNotification = updatedBuses[busId].notifications.find(
            n => n.message === newNotification.message && n.timestamp === newNotification.timestamp
          );
          
          if (!existingNotification) {
            updatedBuses[busId].notifications.unshift(newNotification);
            // Keep only the latest 5 notifications
            if (updatedBuses[busId].notifications.length > 5) {
              updatedBuses[busId].notifications = updatedBuses[busId].notifications.slice(0, 5);
            }
          }
        }
        return updatedBuses;
      });

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
            routeCompleted: false
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
        logDriverAttendance,
        updateDriverLocation,
        reverseRoute,
        loading,
        firebaseConnected,
        firebaseError
      }}
    >
      {children}
    </BusContext.Provider>
  );
};