import { db } from '../firebase';
import { collection, getDocs, deleteDoc, Firestore } from 'firebase/firestore';

/**
 * Script to clear old bus data from Firebase
 * Run this when routes have been updated to ensure clean data
 */
const clearOldData = async () => {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return;
    }

    console.log('Clearing old bus data from Firebase...');
    
    // Get all bus documents
    const busesCollection = collection(db as Firestore, 'buses');
    const snapshot = await getDocs(busesCollection);
    
    // Delete all bus documents
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${snapshot.size} bus documents`);
    console.log('Old data cleared successfully!');
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
};

// Run the function if this script is executed directly
if (typeof window === 'undefined') {
  clearOldData();
}

export default clearOldData;