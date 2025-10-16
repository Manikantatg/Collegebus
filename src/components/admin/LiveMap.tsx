import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useBus } from '../../context/BusContext';
import { BusData } from '../../types';

const LiveMap: React.FC = () => {
  const { buses, loading, firebaseConnected, firebaseError } = useBus();
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`flex items-center p-4 rounded-lg ${
        firebaseError 
          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
          : firebaseConnected 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      }`}>
        {firebaseError ? (
          <>
            <AlertTriangle size={20} className="mr-2" />
            <span>Firebase Error: {firebaseError}</span>
          </>
        ) : firebaseConnected ? (
          <>
            <Wifi size={20} className="mr-2" />
            <span>Connected to Firebase</span>
          </>
        ) : (
          <>
            <WifiOff size={20} className="mr-2" />
            <span>Firebase connection failed - using local data</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bus List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Active Buses</h2>
          <div className="space-y-3">
            {Object.values(buses).map((bus) => (
              <motion.div
                key={bus.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBus(bus)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedBus?.id === bus.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white">Bus {bus.id}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {bus.route[bus.currentStopIndex]?.name || 'Unknown location'}
                    </p>
                  </div>
                  <MapPin size={20} className="text-blue-500" />
                </div>
                {bus.eta && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    ETA: {bus.eta} minutes
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            {selectedBus ? `Bus ${selectedBus.id} Route` : 'Route Map'}
          </h2>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg h-96 flex items-center justify-center">
            {selectedBus ? (
              <div className="text-center">
                <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-2">
                  Bus {selectedBus.id} Route Visualization
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedBus.route.map((stop, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-left ${
                        index < selectedBus.currentStopIndex
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : index === selectedBus.currentStopIndex
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{stop.name}</span>
                        <span>{stop.scheduledTime}</span>
                      </div>
                      {stop.actualTime && (
                        <div className="text-sm mt-1">Actual: {stop.actualTime}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                Select a bus to view its route
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;