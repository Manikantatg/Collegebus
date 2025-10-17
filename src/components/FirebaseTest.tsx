import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [testData, setTestData] = useState<any[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('Testing Firebase connection...');
        
        // Test writing data
        const docRef = await addDoc(collection(db as any, 'test'), {
          message: 'Test data from FirebaseTest component',
          timestamp: new Date().toISOString()
        });
        
        setStatus(`Successfully wrote test document with ID: ${docRef.id}`);
        
        // Test reading data
        const querySnapshot = await getDocs(collection(db as any, 'test'));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        
        setTestData(data);
        setStatus(`Successfully read ${data.length} documents from test collection`);
      } catch (error) {
        console.error('Firebase test error:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    if (db) {
      testFirebase();
    } else {
      setStatus('Firebase not initialized');
    }
  }, []);

  return (
    <div className="p-4 bg-yellow-100 rounded-lg">
      <h2 className="text-lg font-bold mb-2">Firebase Connection Test</h2>
      <p className="mb-2">Status: {status}</p>
      {testData.length > 0 && (
        <div>
          <h3 className="font-medium">Test Data:</h3>
          <ul className="list-disc pl-5">
            {testData.map((item) => (
              <li key={item.id}>
                {item.message} - {item.timestamp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;