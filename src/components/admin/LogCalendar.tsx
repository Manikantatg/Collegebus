import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useBus } from '../../context/BusContext';
import { drivers } from '../../data/busRoutes';
import type { BusLog } from '../../types';

const LogCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { buses } = useBus();

  // Filter logs for selected date
  const logsForDate = Object.values(buses).reduce<BusLog[]>((acc, bus) => {
    if (bus.lastLog && format(new Date(bus.lastLog.timestamp), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      acc.push(bus.lastLog);
    }
    return acc;
  }, []);

  // Calculate driver statistics
  const driverStats = drivers.map(driver => {
    const driverLogs = Object.values(buses).reduce<BusLog[]>((acc, bus) => {
      if (bus.lastLog && bus.lastLog.driverEmail === driver.email) {
        acc.push(bus.lastLog);
      }
      return acc;
    }, []);

    const workingDays = new Set(
      driverLogs.map(log => format(new Date(log.timestamp), 'yyyy-MM-dd'))
    ).size;

    return {
      ...driver,
      workingDays,
      nonWorkingDays: 30 - workingDays // Assuming 30 days period
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full"
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarIcon size={20} className="mr-2" />
            Logs for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          <div className="space-y-4">
            {logsForDate.length > 0 ? (
              logsForDate.map((log, index) => (
                <motion.div
                  key={`${log.busId}-${log.timestamp}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Bus #{log.busId}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Driver: {log.driverEmail}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.type === 'entry' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.type === 'entry' ? 'Entry' : 'Exit'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {format(new Date(log.timestamp), 'h:mm a')}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {log.location.lat.toFixed(6)}, {log.location.lng.toFixed(6)}
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