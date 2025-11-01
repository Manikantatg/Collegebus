import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EtaRequest, Notification } from '../types';
import { Search, User } from 'lucide-react';

interface EtaRequestsProps {
  requests: EtaRequest[];
  notifications: Notification[];
  studentCount: number;
  busId: number; // Add busId to show bus-specific mock data
}

const EtaRequests: React.FC<EtaRequestsProps> = ({ requests, notifications, studentCount, busId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{name: string, validDate: string} | null>(null);
  
  // Mock student data for each bus with card IDs that can be 1-5 digits
  const getMockStudents = (busId: number) => {
    const studentData: Record<number, Array<{cardId: string, name: string, validDate: string}>> = {
      1: [
        { cardId: '1', name: 'Alice Johnson', validDate: '2025-12-31' },
        { cardId: '12', name: 'Bob Smith', validDate: '2025-11-30' },
        { cardId: '123', name: 'Charlie Brown', validDate: '2026-01-15' },
        { cardId: '1234', name: 'Diana Miller', validDate: '2025-10-20' },
        { cardId: '12345', name: 'Edward Wilson', validDate: '2026-03-10' }
      ],
      2: [
        { cardId: '2', name: 'Fiona Davis', validDate: '2025-12-31' },
        { cardId: '23', name: 'George Thompson', validDate: '2025-11-30' },
        { cardId: '234', name: 'Helen Garcia', validDate: '2026-01-15' },
        { cardId: '2345', name: 'Ian Martinez', validDate: '2025-10-20' },
        { cardId: '23456', name: 'Julia Anderson', validDate: '2026-03-10' }
      ],
      3: [
        { cardId: '3', name: 'Kevin Lee', validDate: '2025-12-31' },
        { cardId: '34', name: 'Laura Clark', validDate: '2025-11-30' },
        { cardId: '345', name: 'Michael Rodriguez', validDate: '2026-01-15' },
        { cardId: '3456', name: 'Nina Lewis', validDate: '2025-10-20' },
        { cardId: '34567', name: 'Oliver Walker', validDate: '2026-03-10' }
      ],
      4: [
        { cardId: '4', name: 'Paul Hall', validDate: '2025-12-31' },
        { cardId: '45', name: 'Queen King', validDate: '2025-11-30' },
        { cardId: '456', name: 'Robert Wright', validDate: '2026-01-15' },
        { cardId: '4567', name: 'Sarah Young', validDate: '2025-10-20' },
        { cardId: '45678', name: 'Thomas Scott', validDate: '2026-03-10' }
      ],
      5: [
        { cardId: '5', name: 'Uma Green', validDate: '2025-12-31' },
        { cardId: '56', name: 'Victor Hall', validDate: '2025-11-30' },
        { cardId: '567', name: 'Wendy Allen', validDate: '2026-01-15' },
        { cardId: '5678', name: 'Xavier Nelson', validDate: '2025-10-20' },
        { cardId: '56789', name: 'Yara Carter', validDate: '2026-03-10' }
      ],
      // Default data for other buses
      0: [
        { cardId: '9', name: 'Zack Moore', validDate: '2025-12-31' },
        { cardId: '98', name: 'Amy Turner', validDate: '2025-11-30' },
        { cardId: '987', name: 'Ben Parker', validDate: '2026-01-15' },
        { cardId: '9876', name: 'Cara Evans', validDate: '2025-10-20' },
        { cardId: '98765', name: 'Dan Phillips', validDate: '2026-03-10' }
      ]
    };
    
    return studentData[busId] || studentData[0];
  };
  
  const mockStudents = getMockStudents(busId);
  
  const handleSearch = () => {
    if (!searchTerm) return;
    
    // Allow card IDs from 1 to 5 digits
    if (!/^\d{1,5}$/.test(searchTerm)) {
      setSearchResult({
        name: 'Invalid card ID',
        validDate: 'Card ID must be 1-5 digits'
      });
      return;
    }
    
    const student = mockStudents.find(s => s.cardId === searchTerm);
    if (student) {
      setSearchResult({
        name: student.name,
        validDate: student.validDate
      });
    } else {
      setSearchResult({
        name: 'Student not found',
        validDate: ''
      });
    }
  };
  
  return (
    <div className="card h-full overflow-auto">
      <h3 className="text-lg font-medium mb-4">Bus Information</h3>
      
      {/* Student Count Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
        <div>
          <div>
            <p className="text-sm opacity-90">Students on board</p>
            <p className="text-3xl font-bold">{studentCount || 0}</p>
          </div>
          <User size={32} className="opacity-90" />
        </div>
      </div>
      
      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Search Student by Card ID
        </label>
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter card ID (1-5 digits)"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="btn btn-primary"
          >
            <Search size={16} />
          </motion.button>
        </div>
        
        {searchResult && (
          <motion.div 
            className="mt-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">{searchResult.name}</p>
            {searchResult.validDate && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Valid until: {searchResult.validDate}
              </p>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Bus-specific student list */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Students on this bus</h4>
        <div>
          {mockStudents.map((student, index) => (
            <motion.div
              key={index}
              className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <span className="font-medium">{student.name}</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  ID: {student.cardId}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Valid until: {student.validDate}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EtaRequests;