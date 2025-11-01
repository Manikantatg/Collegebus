import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

interface BusLogEntry {
  id: string;
  busId: number;
  timestamp: string;
  type: 'entry' | 'exit';
  recordedBy: string;
}

const SecurityLogs: React.FC = () => {
  const [busLogs, setBusLogs] = useState<BusLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<BusLogEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'exit'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Load logs from localStorage with real-time updates
  useEffect(() => {
    const loadLogs = () => {
      const savedLogs = localStorage.getItem('busLogs');
      if (savedLogs) {
        try {
          const parsedLogs = JSON.parse(savedLogs);
          // Sort logs by timestamp (newest first)
          const sortedLogs = parsedLogs.sort((a: BusLogEntry, b: BusLogEntry) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setBusLogs(sortedLogs);
        } catch (e) {
          console.error('Error parsing logs:', e);
        }
      }
    };

    loadLogs();
    
    // Set up polling to check for new logs every 3 seconds for real-time updates
    const interval = setInterval(loadLogs, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter logs based on type and date
  useEffect(() => {
    let result = [...busLogs];
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(log => log.type === filterType);
    }
    
    // Filter by date
    if (selectedDate) {
      result = result.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === selectedDate;
      });
    }
    
    // Sort by timestamp (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredLogs(result);
  }, [busLogs, filterType, selectedDate]);

  const formatLogTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Get unique dates for the date picker
  const getUniqueDates = () => {
    const dates = busLogs.map(log => new Date(log.timestamp).toISOString().split('T')[0]);
    return [...new Set(dates)].sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium">Security Logs</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bus entry and exit records
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                  filterType === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('entry')}
                className={`px-3 py-1 text-sm font-medium ${
                  filterType === 'entry'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Entry
              </button>
              <button
                onClick={() => setFilterType('exit')}
                className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                  filterType === 'exit'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Exit
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1"
            >
              <option value="">All Dates</option>
              {getUniqueDates().map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Entry Logs Section */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-md font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
            <LogIn size={16} />
            Entry Logs
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full ml-2">
              {filteredLogs.filter(log => log.type === 'entry').length}
            </span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {filteredLogs.filter(log => log.type === 'entry').length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <p>No entry logs found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredLogs.filter(log => log.type === 'entry').map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-bold">#{log.busId}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Bus {log.busId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatLogTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {log.recordedBy}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Exit Logs Section */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-md font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
            <LogOut size={16} />
            Exit Logs
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-1 rounded-full ml-2">
              {filteredLogs.filter(log => log.type === 'exit').length}
            </span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {filteredLogs.filter(log => log.type === 'exit').length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <p>No exit logs found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredLogs.filter(log => log.type === 'exit').map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 font-bold">#{log.busId}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Bus {log.busId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatLogTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {log.recordedBy}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;