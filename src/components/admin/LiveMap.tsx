import React from 'react';
import { motion } from 'framer-motion';
import { useBus } from '../../context/BusContext';
import { drivers } from '../../data/busRoutes';
import { MapPin, Navigation } from 'lucide-react';

const LiveMap: React.FC = () => {
  const { buses, reverseRoute } = useBus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Active Buses
        </h2>
        <button
          onClick={reverseRoute}
          className="btn btn-primary flex items-center gap-2"
        >
          <Navigation size={18} />
          Reverse Routes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Object.values(buses).filter(bus => bus.currentDriver).map((bus) => {
          const driver = drivers.find(d => d.bus === bus.id);
          return (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-green-200 dark:border-green-800"
            >
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-green-800 dark:text-green-400">Bus #{bus.id}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400 rounded-full">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {driver && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{driver.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{driver.phone}</p>
                  </div>
                )}
                
                {bus.currentLocation && (
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                      <MapPin size={14} className="mr-1" />
                      <span>Current Location:</span>
                    </div>
                    <div className="text-xs font-mono bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      <p>Lat: {bus.currentLocation.lat.toFixed(6)}</p>
                      <p>Lng: {bus.currentLocation.lng.toFixed(6)}</p>
                      {bus.currentLocation.speed && (
                        <p>Speed: {(bus.currentLocation.speed * 3.6).toFixed(1)} km/h</p>
                      )}
                    </div>
                  </div>
                )}
                
                {bus.lastLog && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <p>Last Update: {new Date(bus.lastLog.timestamp).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMap;