import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, User, LogIn, LogOut } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface BusLogEntry {
  id: string;
  busId: number;
  timestamp: string;
  type: 'entry' | 'exit';
  recordedBy: string;
}

const LogCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [busLogs, setBusLogs] = useState<BusLogEntry[]>([]);
  
  // Load logs from localStorage (in a real app, this would come from Firebase)
  useEffect(() => {
    const loadLogs = () => {
      const savedLogs = localStorage.getItem('busLogs');
      if (savedLogs) {
        setBusLogs(JSON.parse(savedLogs));
      }
    };

    loadLogs();
    
    // Set up polling to check for new logs every 5 seconds
    const interval = setInterval(loadLogs, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter logs for the selected date
  const filteredLogs = busLogs.filter(log => 
    isSameDay(parseISO(log.timestamp), selectedDate)
  );
  
  // Group logs by bus
  const logsByBus = filteredLogs.reduce((acc, log) => {
    if (!acc[log.busId]) {
      acc[log.busId] = [];
    }
    acc[log.busId].push(log);
    return acc;
  }, {} as Record<number, BusLogEntry[]>);
  
  // Calculate statistics
  const entryCount = filteredLogs.filter(log => log.type === 'entry').length;
  const exitCount = filteredLogs.filter(log => log.type === 'exit').length;
  const uniqueBuses = new Set(filteredLogs.map(log => log.busId)).size;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar size={24} className="mr-2" />
          Security Logs Calendar
        </h2>
        
        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(parseISO(e.target.value))}
            className="w-full md:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <BusIcon className="text-blue-500 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Buses</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{uniqueBuses}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <LogIn size={20} className="text-green-500 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Entries</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{entryCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <LogOut size={20} className="text-red-500 dark:text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Exits</span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">{exitCount}</p>
          </div>
        </div>
        
        {/* Logs List */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            Activity Logs for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.keys(logsByBus).length > 0 ? (
              Object.entries(logsByBus).map(([busId, logs]) => (
                <motion.div
                  key={busId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg">Bus #{busId}</h4>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {logs.length} activities
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-600 last:border-0">
                        <div className="flex items-center">
                          {log.type === 'entry' ? (
                            <LogIn size={16} className="text-green-500 dark:text-green-400 mr-2" />
                          ) : (
                            <LogOut size={16} className="text-red-500 dark:text-red-400 mr-2" />
                          )}
                          <span className={`font-medium ${
                            log.type === 'entry' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {log.type === 'entry' ? 'Entry' : 'Exit'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {format(parseISO(log.timestamp), 'h:mm a')}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            by {log.recordedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No logs found for this date
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Daily Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Bus Entries</h4>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{entryCount}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Total entries today</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Bus Exits</h4>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">{exitCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Total exits today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple bus icon component
const BusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-4a1 1 0 00-.293-.707l-4-4A1 1 0 0016 4H3z" />
  </svg>
);

export default LogCalendar;