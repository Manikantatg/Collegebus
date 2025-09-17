import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { busRoutes } from '../data/busRoutes';

async function initializeBuses() {
  try {
    for (const busId in busRoutes) {
      const busData = {
        id: parseInt(busId),
        currentStopIndex: 0,
        eta: null,
        route: busRoutes[parseInt(busId)],
        etaRequests: [],
        notifications: [],
        currentLocation: null,
        currentDriver: null,
        lastLog: null,
        isActive: false
      };

      await setDoc(doc(db, 'buses', busId), busData);
      console.log(`Bus ${busId} initialized successfully`);
    }
    
    console.log('All buses initialized successfully');
  } catch (error) {
    console.error('Error initializing buses:', error);
  }
}

// Run the initialization
initializeBuses();