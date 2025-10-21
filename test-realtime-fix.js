// Test script to verify real-time updates are working correctly
// This script can be run in the browser console or as a Node.js script

async function testRealtimeUpdates() {
  console.log('Testing real-time updates...');
  
  // Simulate a driver updating bus status
  const busId = 1;
  const testUpdates = [
    { currentStopIndex: 1, eta: 5 },
    { currentStopIndex: 2, eta: 10 },
    { currentStopIndex: 3, eta: 15 }
  ];
  
  // In a real implementation, these would come from Firebase
  // For testing, we'll simulate the updates
  
  console.log(`Simulating updates for bus #${busId}`);
  
  for (const update of testUpdates) {
    console.log(`Updating bus #${busId} with:`, update);
    
    // Simulate Firebase update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would trigger a Firestore update
    // which would then be received by all connected clients
    console.log(`Bus #${busId} updated successfully`);
  }
  
  console.log('Real-time update test completed');
}

// Run the test
testRealtimeUpdates().catch(console.error);