// Script to clear Firebase busStates collection for a fresh start

// This script should be run in the browser console or as part of a Node.js script
// with proper Firebase admin credentials

console.log('=== Firebase Data Clearing Script ===');

/*
INSTRUCTIONS:

This script will help clear the existing busStates data in Firebase to ensure
a clean start with the fixed initialization logic.

If running in the browser console, make sure you have the Firebase SDK loaded:

1. Open your browser's developer console
2. Navigate to your application
3. Run the following code:

// Get reference to the busStates collection
const db = firebase.firestore();
const busStatesRef = db.collection('busStates');

// Delete all documents in the collection
busStatesRef.get().then((querySnapshot) => {
  const batch = db.batch();
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  return batch.commit();
}).then(() => {
  console.log('All busStates documents deleted successfully');
}).catch((error) => {
  console.error('Error deleting busStates documents:', error);
});

ALTERNATIVE APPROACH:

If you prefer to clear data for specific buses only:

// Delete specific bus documents
const busIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const db = firebase.firestore();

busIds.forEach(busId => {
  db.collection('busStates').doc(busId.toString()).delete()
    .then(() => {
      console.log(`Bus ${busId} document deleted successfully`);
    })
    .catch((error) => {
      console.error(`Error deleting bus ${busId} document:`, error);
    });
});

AFTER RUNNING THIS SCRIPT:

1. Refresh all browser windows/tabs
2. The initialization logic will now properly check if bus states exist before initializing
3. Real-time updates should work correctly across different devices

IMPORTANT:
- Make sure you really want to delete this data before running the script
- In a production environment, you would want to be more careful about data deletion
- Consider backing up important data before running these operations
*/

console.log('To run this script, copy the code from the comments above and execute in your browser console.');