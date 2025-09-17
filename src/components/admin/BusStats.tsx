import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, Calendar, Users } from 'lucide-react';
import { useBus } from '../../context/BusContext';
import { drivers } from '../../data/busRoutes';

const BusStats: React.FC = () => {
  const { buses } = useBus();

  const stats = {
    totalBuses: Object.keys(buses).length,
    activeBuses: Object.values(buses).filter(bus => bus.currentDriver).length,
    totalDrivers: drivers.length,
    activeDrivers: new Set(Object.values(buses)
      .filter(bus => bus.currentDriver)
      .map(bus => bus.currentDriver?.email)).size
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Bus Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Buses',
            value: stats.totalBuses,
            icon: Bus,
            color: 'blue'
          },
          {
            title: 'Active Buses',
            value: stats.activeBuses,
            icon: Clock,
            color: 'green'
          },
          {
            title: 'Total Drivers',
            value: stats.totalDrivers,
            icon: Users,
            color: 'purple'
          },
          {
            title: 'Active Drivers',
            value: stats.activeDrivers,
            icon: Calendar,
            color: 'amber'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon size={24} className={`text-${stat.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Buses List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Active Buses</h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Bus ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Object.values(buses)
                  .filter(bus => bus.currentDriver)
                  .map((bus) => (
                    <tr key={bus.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">Bus #{bus.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{bus.currentDriver?.name}</p>
                            <p className="text-xs text-slate-500">{bus.currentDriver?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bus.currentLocation ? (
                          <div className="text-sm">
                            <p>Lat: {bus.currentLocation.lat.toFixed(6)}</p>
                            <p>Lng: {bus.currentLocation.lng.toFixed(6)}</p>
                            {bus.currentLocation.speed && (
                              <p className="text-slate-500">
                                {(bus.currentLocation.speed * 3.6).toFixed(1)} km/h
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No location data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
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

export default BusStats;