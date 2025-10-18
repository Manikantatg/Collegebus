import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, User } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { useBus } from '../../context/BusContext';

const LogCalendar: React.FC = () => {
  const { buses } = useBus();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate sample logs for demonstration (in a real app, this would come from Firebase)
  const generateSampleLogs = () => {
    const logs = [];
    const busIds = Object.keys(buses);
    
    // Generate 10 sample logs for the selected date
    for (let i = 0; i < 10; i++) {
      const busId = parseInt(busIds[Math.floor(Math.random() * busIds.length)]);
      const hour = Math.floor(Math.random() * 12) + 6; // Between 6 AM and 6 PM
      const minute = Math.floor(Math.random() * 60);
      
      logs.push({
        id: `log-${i}`,
        busId,
        driverId: `driver-${busId}`,
        driverEmail: `driver${busId}@example.com`,
        timestamp: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute).toISOString(),
        type: Math.random() > 0.5 ? 'entry' : 'exit'
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const logs = generateSampleLogs();
  
  // Filter logs for the selected date
  const filteredLogs = logs.filter(log => 
    isSameDay(parseISO(log.timestamp), selectedDate)
  );
  
  // Calculate driver statistics
  const driverStats = Object.values(buses).map(bus => {
    const driverLogs = logs.filter(log => log.busId === bus.id);
    const workingDays = new Set(driverLogs.map(log => 
      format(parseISO(log.timestamp), 'yyyy-MM-dd')
    )).size;
    
    return {
      email: `driver${bus.id}@example.com`,
      name: `Driver ${bus.id}`,
      workingDays,
      nonWorkingDays: 0 // Simplified for this example
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar size={24} className="mr-2" />
          Driver Logs
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
        
        {/* Logs List */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            Activity Logs for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium">Bus #{log.busId}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Driver: {log.driverEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.type === 'entry' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}>
                        {log.type === 'entry' ? 'Shift Started' : 'Shift Ended'}
                      </span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {format(parseISO(log.timestamp), 'h:mm a')}
                      </p>
                    </div>
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

        {/* Driver Statistics */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Driver Statistics
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700">
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Working Days</th>
                  <th className="px-4 py-2 text-left">Non-Working Days</th>
                </tr>
              </thead>
              <tbody>
                {driverStats.map((driver) => (
                  <tr key={driver.email} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-2">
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-slate-500">{driver.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {driver.workingDays} days
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {driver.nonWorkingDays} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogCalendar;