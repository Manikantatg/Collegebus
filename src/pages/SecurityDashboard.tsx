import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, LogOut, Clock, Calendar, LogInIcon, LogOutIcon, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useBus } from '../context/BusContext';
import { useAuth } from '../context/AuthContext';

interface BusLogEntry {
  id: string;
  busId: number;
  timestamp: string;
  type: 'entry' | 'exit';
  recordedBy: string;
}

const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buses, firebaseConnected, firebaseError } = useBus();
  const [busLogs, setBusLogs] = useState<BusLogEntry[]>([]);
  const [logType, setLogType] = useState<'entry' | 'exit'>('entry');
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'exit'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      // Check if there's a security login flag
      const isSecurityLogin = sessionStorage.getItem('securityLogin') === 'true';
      if (!isSecurityLogin) {
        navigate('/security-login');
      }
    }
  }, [user, navigate]);

  // Get bus numbers from the buses context
  const busNumbers = Object.keys(buses).map(Number).sort((a, b) => a - b);

  // Load existing logs from localStorage with real-time updates
  useEffect(() => {
    const loadLogs = () => {
      const savedLogs = localStorage.getItem('busLogs');
      if (savedLogs) {
        try {
          setBusLogs(JSON.parse(savedLogs));
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

  const handleBusLog = (busId: number) => {
    const newLog: BusLogEntry = {
      id: Date.now().toString(),
      busId,
      timestamp: new Date().toISOString(),
      type: logType,
      recordedBy: user?.email || 'Security Guard'
    };

    // Update local state immediately
    const updatedLogs = [newLog, ...busLogs];
    setBusLogs(updatedLogs);
    
    // Save to localStorage for persistence
    localStorage.setItem('busLogs', JSON.stringify(updatedLogs));
  };

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

  const handleLogout = () => {
    // Clear the security login flag
    sessionStorage.removeItem('securityLogin');
    navigate('/');
  };

  // Filter logs based on type and date
  const filteredLogs = busLogs.filter(log => {
    // Filter by type
    if (filterType !== 'all' && log.type !== filterType) {
      return false;
    }
    
    // Filter by date
    if (selectedDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate === selectedDate;
    }
    
    return true;
  });

  // Get unique dates for the date picker
  const getUniqueDates = () => {
    const dates = busLogs.map(log => new Date(log.timestamp).toISOString().split('T')[0]);
    return [...new Set(dates)].sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  // Don't render anything if user is not authenticated and we're still checking
  if (!user && sessionStorage.getItem('securityLogin') !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                <Bus size={20} className="text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Security Dashboard</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bus Entry/Exit Tracking</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Connection Status */}
      <div className="px-6 pt-6">
        <div className={`mb-6 flex items-center p-4 rounded-lg ${
          firebaseError 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : firebaseConnected 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {firebaseError ? (
            <>
              <AlertTriangle size={16} className="mr-3" />
              <span className="font-medium text-sm">Firebase Error: {firebaseError}</span>
            </>
          ) : firebaseConnected ? (
            <>
              <Wifi size={16} className="mr-3" />
              <span className="font-medium text-sm">Connected to real-time data system</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="mr-3" />
              <span className="font-medium text-sm">Data connection failed</span>
            </>
          )}
        </div>
      </div>
      
      <main className="px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Selection Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
            >
              <h2 className="text-xl font-semibold mb-6">Record Bus Movement</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Log Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLogType('entry')}
                    className={`py-4 px-4 rounded-lg transition-colors flex flex-col items-center justify-center ${
                      logType === 'entry'
                        ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <LogInIcon size={20} className="text-slate-600 dark:text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Entry</span>
                  </button>
                  <button
                    onClick={() => setLogType('exit')}
                    className={`py-4 px-4 rounded-lg transition-colors flex flex-col items-center justify-center ${
                      logType === 'exit'
                        ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <LogOutIcon size={20} className="text-slate-600 dark:text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Exit</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {busNumbers.map(busId => (
                  <motion.button
                    key={busId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBusLog(busId)}
                    className="py-5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-sm hover:shadow transition-all border border-slate-200 dark:border-slate-600"
                  >
                    <div className="font-medium text-sm">Bus {busId}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            {/* Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 mt-6"
            >
              <h3 className="text-lg font-semibold mb-5">Filter Logs</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Log Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`py-3 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'all'
                          ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType('entry')}
                      className={`py-3 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'entry'
                          ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Entry
                    </button>
                    <button
                      onClick={() => setFilterType('exit')}
                      className={`py-3 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'exit'
                          ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Exit
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      <span>Select Date</span>
                    </div>
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2.5 text-sm"
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
            </motion.div>
          </div>
          
          {/* Logs Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Bus Logs</h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredLogs.length} logs
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Clock size={40} className="mx-auto mb-4 opacity-50" />
                    <p className="text-base">No bus logs recorded yet</p>
                    <p className="text-sm mt-2">Select a bus and record its movement</p>
                  </div>
                ) : (
                  filteredLogs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                            log.type === 'entry'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {log.type === 'entry' ? (
                              <LogInIcon size={18} />
                            ) : (
                              <LogOutIcon size={18} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900 dark:text-white">Bus {log.busId}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {log.type === 'entry' ? 'Entered Campus' : 'Exited Campus'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm text-slate-900 dark:text-white">{formatLogTime(log.timestamp)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            by {log.recordedBy}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        <div className="px-6">
          <p>Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets Opportunity</p>
          <p className="text-red-500 mt-1">CSE C Sec Batch 24-25</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default SecurityDashboard;