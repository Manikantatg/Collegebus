import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  setDoc,
  query,
  orderBy,
  limit,
  CollectionReference,
  DocumentReference,
  Firestore
} from 'firebase/firestore';
import { db } from '../firebase';
import { BusData, BusStop, EtaRequest, Notification, Location } from '../types';
import { busRoutes, drivers } from '../data/busRoutes';
import { formatTime } from '../utils/geofence';
import { toast } from 'react-hot-toast';

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
  logDriverAttendance: (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number }) => Promise<void>;
  reverseRoute: () => void;
  loading: boolean;
  firebaseConnected: boolean;
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

  // Initialize buses with data from Firebase or fallback to hardcoded data
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeBuses = async () => {
      try {
        if (!db) {
          console.warn("Firebase not initialized, using local data");
          loadLocalData();
          return;
        }

        // Try to connect to Firebase
        const busesCollection = collection(db as Firestore, 'buses');
        const busesQuery = query(busesCollection, orderBy('id'), limit(20));
        
        unsubscribe = onSnapshot(busesQuery, 
          (snapshot) => {
            const busesMap: Record<number, BusData> = {};
            
            if (snapshot.empty) {
              // No data in Firebase, initialize with local data
              loadLocalData();
              syncLocalDataToFirebase();
            } else {
              // Load data from Firebase
              snapshot.forEach((doc) => {
                const data = doc.data();
                busesMap[data.id] = {
                  ...data,
                  id: data.id,
                  currentStopIndex: data.currentStopIndex || 0,
                  eta: data.eta || null,
                  route: data.route || [],
                  etaRequests: data.etaRequests || [],
                  notifications: data.notifications || []
                } as BusData;
              });
              
              setBuses(busesMap);
              setFirebaseConnected(true);
            }
            
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching buses from Firebase:", error);
            console.warn("Using local data as fallback");
            loadLocalData();
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error initializing buses:", error);
        console.warn("Using local data as fallback");
        loadLocalData();
        setLoading(false);
      }
    };

    const loadLocalData = () => {
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
          route: route,
          etaRequests: [],
          notifications: [],
          totalDistance: 0
        };
      });
      
      setBuses(busesMap);
    };

    const syncLocalDataToFirebase = async () => {
      try {
        if (!db) return;
        
        Object.values(buses).forEach(async (bus) => {
          try {
            const busRef = doc(db as Firestore, 'buses', bus.id.toString());
            await setDoc(busRef, bus, { merge: true });
          } catch (error) {
            console.error(`Error syncing bus ${bus.id} to Firebase:`, error);
          }
        });
        
        setFirebaseConnected(true);
      } catch (error) {
        console.error("Error syncing local data to Firebase:", error);
      }
    };

    initializeBuses();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Real-time listener for individual bus updates
  useEffect(() => {
    if (!db) return;

    const unsubscribeFunctions: (() => void)[] = [];
    
    // Create a listener for each bus
    Object.keys(buses).forEach(busIdStr => {
      const busId = parseInt(busIdStr);
      const busDocRef = doc(db as Firestore, 'buses', busId.toString());
      
      const unsubscribe = onSnapshot(busDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setBuses(prevBuses => ({
            ...prevBuses,
            [busId]: {
              ...data,
              id: data.id,
              currentStopIndex: data.currentStopIndex || 0,
              eta: data.eta || null,
              route: data.route || [],
              etaRequests: data.etaRequests || [],
              notifications: data.notifications || []
            } as BusData
          }));
        }
      }, (error) => {
        console.error(`Error listening to bus ${busId} updates:`, error);
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });

    // Cleanup all listeners on unmount
    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [buses, db]);

  const getFormattedTime = (): string => {
    return formatTime(new Date());
  };

  const updateBusInFirebase = async (busId: number, updates: Partial<BusData>) => {
    if (!db || !firebaseConnected) return;

    try {
      const busRef = doc(db as Firestore, 'buses', busId.toString());
      await updateDoc(busRef, updates);
    } catch (error) {
      console.error(`Error updating bus ${busId} in Firebase:`, error);
    }
  };

  const logDriverAttendance = async (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number }) => {
    try {
      const driver = drivers.find(d => d.bus === busId);
      if (!driver) return;

      const formattedTime = formatTime(new Date());
      
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
                speed: 0
              }
            };
          } else {
            updatedBuses[busId] = {
              ...updatedBuses[busId],
              currentDriver: undefined,
              currentLocation: undefined
            };
          }
          
          // Add notification
          const newNotification: Notification = {
            type: 'update',
            message: `Driver ${type === 'entry' ? 'started' : 'ended'} shift at ${formattedTime}`,
            timestamp: formattedTime
          };
          
          updatedBuses[busId].notifications.unshift(newNotification);
        }
        return updatedBuses;
      });

      // Update Firebase
      await updateBusInFirebase(busId, {
        currentDriver: type === 'entry' ? {
          uid: driver.email,
          email: driver.email,
          name: driver.name
        } : undefined,
        currentLocation: type === 'entry' ? {
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
          speed: 0
        } : undefined
      });

      toast.success(`Driver ${type} logged successfully`);
    } catch (error) {
      console.error('Error logging driver attendance:', error);
      toast.error('Failed to log attendance');
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
            route: updatedRoute
          };

          // Add notification
          const newNotification: Notification = {
            type: 'update',
            message: `Bus arrived at ${currentStop.name}`,
            timestamp: formattedTime
          };
          
          updatedBuses[busId].notifications.unshift(newNotification);
        }
        return updatedBuses;
      });

      // Update Firebase
      await updateBusInFirebase(busId, {
        currentStopIndex: bus.currentStopIndex + 1,
        eta: null,
        route: bus.route.map((stop, index) => 
          index === bus.currentStopIndex 
            ? { ...stop, completed: true, actualTime: formattedTime } 
            : stop
        )
      });

      toast.success('Moved to next stop');
    } catch (error) {
      console.error('Error moving to next stop:', error);
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
            route: updatedRoute
          };

          // Add notification
          const newNotification: Notification = {
            type: 'update',
            message: `Bus returned to ${previousStop.name}`,
            timestamp: formattedTime
          };
          
          updatedBuses[busId].notifications.unshift(newNotification);
        }
        return updatedBuses;
      });

      // Update Firebase
      await updateBusInFirebase(busId, {
        currentStopIndex: previousStopIndex,
        eta: null,
        route: bus.route.map((stop, index) => 
          index === previousStopIndex 
            ? { ...stop, completed: false, actualTime: undefined } 
            : stop
        )
      });

      toast.success('Returned to previous stop');
    } catch (error) {
      console.error('Error moving to previous stop:', error);
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

          // Add ETA request
          const newEtaRequest: EtaRequest = {
            stopIndex: bus.currentStopIndex,
            minutes: minutes,
            timestamp: formattedTime,
            nextStop: nextStopName
          };
          
          updatedBuses[busId].etaRequests.unshift(newEtaRequest);

          // Add notification
          const newNotification: Notification = {
            type: 'eta',
            message: `ETA to ${nextStopName}: ${minutes} minutes`,
            timestamp: formattedTime
          };
          
          updatedBuses[busId].notifications.unshift(newNotification);
        }
        return updatedBuses;
      });

      // Update Firebase
      await updateBusInFirebase(busId, {
        eta: minutes
      });

      toast.success('ETA set successfully');
    } catch (error) {
      console.error('Error setting ETA:', error);
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
          
          updatedBuses[busId].notifications.unshift(newNotification);
        }
        return updatedBuses;
      });

      // Update Firebase
      const bus = buses[busId];
      if (bus) {
        await updateBusInFirebase(busId, {
          notifications: bus.notifications
        });
      }

      toast.success('Stop request sent to driver');
    } catch (error) {
      console.error('Error requesting stop:', error);
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
            notifications: []
          };
        }
        return updatedBuses;
      });

      // Update Firebase
      const bus = buses[busId];
      if (bus) {
        await updateBusInFirebase(busId, {
          currentStopIndex: 0,
          eta: null,
          route: bus.route.map(stop => ({
            ...stop,
            completed: false,
            actualTime: undefined
          })),
          etaRequests: [],
          notifications: []
        });
      }

      toast.success('Route reset successfully');
    } catch (error) {
      console.error('Error resetting bus progress:', error);
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
            route: reversedRoute
          };
        });
        return updatedBuses;
      });

      // Update Firebase for all buses
      Object.values(buses).forEach(async (bus) => {
        await updateBusInFirebase(bus.id, {
          currentStopIndex: 0,
          route: [...bus.route].reverse()
        });
      });

      toast.success('All routes reversed');
    } catch (error) {
      console.error('Error reversing routes:', error);
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
        reverseRoute,
        loading,
        firebaseConnected
      }}
    >
      {children}
    </BusContext.Provider>
  );
};