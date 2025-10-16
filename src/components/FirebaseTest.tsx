import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        if (!db) {
          setConnectionStatus('Firebase not initialized');
          return;
        }

        // Test Firestore connection
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setConnectionStatus('Firebase connected successfully');
      } catch (err: any) {
        console.error('Firebase connection test failed:', err);
        setConnectionStatus('Firebase connection failed');
        setError(err.message || 'Unknown error');
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Firebase Connection Test</h2>
      <div className={`p-2 rounded ${connectionStatus === 'Firebase connected successfully' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        Status: {connectionStatus}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded">
          Error: {error}
        </div>
      )}
      <div className="mt-2 text-sm text-gray-600">
        <p>Auth initialized: {auth ? 'Yes' : 'No'}</p>
        <p>DB initialized: {db ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default FirebaseTest;