import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, LogOut, Clock, Calendar, LogInIcon, LogOutIcon, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useBus } from '../context/BusContext';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/geofence';

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
  const [recordingBus, setRecordingBus] = useState<number | null>(null);
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

  // Load existing logs from localStorage (in a real app, this would come from Firebase)
  useEffect(() => {
    const savedLogs = localStorage.getItem('busLogs');
    if (savedLogs) {
      setBusLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('busLogs', JSON.stringify(busLogs));
  }, [busLogs]);

  const handleBusLog = (busId: number) => {
    const newLog: BusLogEntry = {
      id: Date.now().toString(),
      busId,
      timestamp: new Date().toISOString(),
      type: logType,
      recordedBy: user?.email || 'Security Guard'
    };

    setBusLogs(prev => [newLog, ...prev]);
    setRecordingBus(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md">
        <div className="responsive-container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <Bus size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Security Dashboard</h1>
                <p className="text-purple-100">Bus Entry/Exit Tracking</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Connection Status */}
      <div className="responsive-container py-4">
        <div className={`mb-6 flex items-center p-4 rounded-lg ${
          firebaseError 
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
            : firebaseConnected 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
        }`}>
          {firebaseError ? (
            <>
              <AlertTriangle size={20} className="mr-3" />
              <span className="font-medium">Firebase Error: {firebaseError}</span>
            </>
          ) : firebaseConnected ? (
            <>
              <Wifi size={20} className="mr-3" />
              <span className="font-medium">Connected to real-time data system</span>
            </>
          ) : (
            <>
              <WifiOff size={20} className="mr-3" />
              <span className="font-medium">Data connection failed</span>
            </>
          )}
        </div>
      </div>
      
      <main className="responsive-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Selection Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6">Record Bus Movement</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Log Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLogType('entry')}
                    className={`py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      logType === 'entry'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <LogInIcon size={20} className="mr-2" />
                    <span>Entry</span>
                  </button>
                  <button
                    onClick={() => setLogType('exit')}
                    className={`py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      logType === 'exit'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <LogOutIcon size={20} className="mr-2" />
                    <span>Exit</span>
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
                    className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <div className="font-bold text-lg">Bus {busId}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            {/* Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mt-6"
            >
              <h3 className="text-xl font-bold mb-4">Filter Logs</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Log Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`py-2 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType('entry')}
                      className={`py-2 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'entry'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Entry
                    </button>
                    <button
                      onClick={() => setFilterType('exit')}
                      className={`py-2 px-3 text-sm font-medium rounded-lg ${
                        filterType === 'exit'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Exit
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Select Date</span>
                    </div>
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5"
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
              className="card"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recent Bus Logs</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredLogs.length} logs
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No bus logs recorded yet</p>
                    <p className="text-sm mt-2">Select a bus and record its movement</p>
                  </div>
                ) : (
                  filteredLogs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-lg border-l-4 ${
                        log.type === 'entry'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                            log.type === 'entry'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {log.type === 'entry' ? (
                              <LogInIcon size={24} />
                            ) : (
                              <LogOutIcon size={24} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-lg">Bus {log.busId}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {log.type === 'entry' ? 'Entered Campus' : 'Exited Campus'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatLogTime(log.timestamp)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
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
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="responsive-container">
          <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
          <p className="mt-1">CSE C Sec Batch 24-25</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default SecurityDashboard;