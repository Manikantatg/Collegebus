import React from 'react';
import { Users, MapPin, Clock } from 'lucide-react';
import { useBus } from '../../context/BusContext';

const BusStats: React.FC = () => {
  const { buses } = useBus();
  
  // Calculate statistics
  const totalBuses = Object.keys(buses).length;
  const activeBuses = Object.values(buses).filter(bus => bus.currentStopIndex > 0).length;
  const completedRoutes = Object.values(buses).filter(bus => bus.routeCompleted).length;
  
  // Get buses with active drivers
  const busesWithDrivers = Object.values(buses).filter(bus => bus.currentStopIndex > 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MapPin size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Buses</h3>
              <p className="text-2xl font-bold">{totalBuses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Routes</h3>
              <p className="text-2xl font-bold">{activeBuses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Routes</h3>
              <p className="text-2xl font-bold">{completedRoutes}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Buses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium">Active Buses</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {busesWithDrivers
                  .map((bus) => (
                    <tr key={bus.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Bus #{bus.id}</p>
                            <p className="text-sm text-slate-500">
                              Stop {bus.currentStopIndex + 1} of {bus.route.length}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              Driver {bus.id}
                            </p>
                          </div>
                        </div>
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