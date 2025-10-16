import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, Firestore } from 'firebase/firestore';
import { busRoutes, drivers } from '../data/busRoutes';
import { BusData } from '../types';

/**
 * Script to initialize buses with latest route data
 * Run this to ensure all buses have the correct route information
 */
const initializeBuses = async () => {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return;
    }

    console.log('Initializing buses with latest route data...');
    
    // Clear existing data first
    const busesCollection = collection(db as Firestore, 'buses');
    const snapshot = await getDocs(busesCollection);
    
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${snapshot.size} existing bus documents`);
    
    // Initialize buses with latest route data
    const busIds = Object.keys(busRoutes).map(Number);
    
    for (const busId of busIds) {
      const route = busRoutes[busId];
      const driver = drivers.find(d => d.bus === busId);
      
      const busData: BusData = {
        id: busId,
        currentStopIndex: 0,
        eta: null,
        route: route.map(stop => ({ ...stop, completed: false })),
        etaRequests: [],
        notifications: [],
        totalDistance: 0,
        currentDriver: driver ? {
          uid: driver.email,
          email: driver.email,
          name: driver.name
        } : undefined
      };
      
      const busRef = doc(db as Firestore, 'buses', busId.toString());
      await setDoc(busRef, busData);
      
      console.log(`Initialized bus ${busId} with ${route.length} stops`);
    }
    
    console.log(`Successfully initialized ${busIds.length} buses!`);
  } catch (error) {
    console.error('Error initializing buses:', error);
  }
};

// Import deleteDoc
import { deleteDoc } from 'firebase/firestore';

// Run the function if this script is executed directly
if (typeof window === 'undefined') {
  initializeBuses();
}

export default initializeBuses;