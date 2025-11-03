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
      
      {/* Connection Status - Removed as per requirements */}
      {/* <div className="px-6 pt-6">
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
      </div> */}
      
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
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <LogInIcon size={20} className="text-green-600 dark:text-green-400 mb-2" />
                    <span className="text-sm font-medium">Bus Entry</span>
                  </button>
                  <button
                    onClick={() => setLogType('exit')}
                    className={`py-4 px-4 rounded-lg transition-colors flex flex-col items-center justify-center ${
                      logType === 'exit'
                        ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <LogOutIcon size={20} className="text-red-600 dark:text-red-400 mb-2" />
                    <span className="text-sm font-medium">Bus Exit</span>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Bus
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2">
                  {busNumbers.map(busId => (
                    <button
                      key={busId}
                      onClick={() => handleBusLog(busId)}
                      className="aspect-square flex items-center justify-center text-sm font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {busId}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Logs Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Logs</h2>
                
                <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'entry' | 'exit')}
                    className="text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                  >
                    <option value="all">All Logs</option>
                    <option value="entry">Entry Only</option>
                    <option value="exit">Exit Only</option>
                  </select>
                  
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                  >
                    <option value="">All Dates</option>
                    {getUniqueDates().map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No logs recorded yet</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-4 rounded-lg border ${
                        log.type === 'entry' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            {log.type === 'entry' ? (
                              <LogInIcon size={16} className="text-green-600 dark:text-green-400 mr-2" />
                            ) : (
                              <LogOutIcon size={16} className="text-red-600 dark:text-red-400 mr-2" />
                            )}
                            <span className={`font-medium ${
                              log.type === 'entry' 
                                ? 'text-green-700 dark:text-green-300' 
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              Bus #{log.busId} {log.type === 'entry' ? 'Entered' : 'Exited'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Recorded by {log.recordedBy}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatLogTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        <div className="px-6">
          <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
          <p className="text-red-500 mt-1">CSE C Sec Batch 23-24</p>
          <p className="mt-1">.</p>
        </div>
      </footer>
    </div>
  );
};

export default SecurityDashboard;