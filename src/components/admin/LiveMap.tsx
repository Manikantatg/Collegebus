import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, WifiOff, AlertTriangle, Bus } from 'lucide-react';
import { useBus } from '../../context/BusContext';
import { BusData } from '../../types';
import { formatTime } from '../../utils/geofence';

const LiveMap: React.FC = () => {
  const { buses, loading, firebaseConnected, firebaseError } = useBus();
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for accurate arrival time calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-select first bus if none is selected and update selected bus when buses change
  useEffect(() => {
    if (Object.keys(buses).length > 0) {
      if (!selectedBus) {
        // Auto-select first bus if none is selected
        const firstBus = Object.values(buses)[0];
        setSelectedBus(firstBus);
      } else {
        // Update selected bus data when buses change
        const updatedBus = buses[selectedBus.id];
        if (updatedBus) {
          setSelectedBus(updatedBus);
        }
      }
    }
  }, [buses, selectedBus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate estimated arrival time for each stop
  const calculateArrivalTime = (bus: BusData, stopIndex: number) => {
    if (stopIndex < bus.currentStopIndex) return 'Arrived';
    if (stopIndex === bus.currentStopIndex) return 'Now';
    
    // Simple estimation: assume 2 minutes per stop
    const stopsAway = stopIndex - bus.currentStopIndex;
    const minutesAway = stopsAway * 2;
    
    // If bus has ETA set, use that instead
    if (bus.eta !== null && bus.eta !== undefined) {
      const adjustedStopsAway = stopIndex - bus.currentStopIndex;
      const totalTime = bus.eta;
      const timePerStop = totalTime / (bus.route.length - bus.currentStopIndex - 1);
      const estimatedMinutes = Math.round(adjustedStopsAway * timePerStop);
      const arrivalTime = new Date(currentTime.getTime() + estimatedMinutes * 60000);
      return formatTime(arrivalTime);
    }
    
    const arrivalTime = new Date(currentTime.getTime() + minutesAway * 60000);
    return formatTime(arrivalTime);
  };

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
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Active Buses</h2>
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <Bus size={20} className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Bus {bus.id}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {bus.route[bus.currentStopIndex]?.name || 'Route Started'}
                      </p>
                    </div>
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

        {/* Route Visualization - Increased height and removed timestamps */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">
            {selectedBus ? `Bus ${selectedBus.id} Route` : 'Route Visualization'}
          </h2>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg h-[calc(100vh-200px)] overflow-y-auto">
            {selectedBus ? (
              <div className="p-4">
                <div className="space-y-3">
                  {selectedBus.route.map((stop, index) => {
                    const arrivalTime = calculateArrivalTime(selectedBus, index);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg text-left relative ${
                          index < selectedBus.currentStopIndex
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : index === selectedBus.currentStopIndex
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-l-4 border-blue-500'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {/* Removed the time display from the right side */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{stop.name}</div>
                            <div className="text-sm mt-1">{stop.scheduledTime}</div>
                          </div>
                          {/* Removed arrival time display on the right side */}
                        </div>
                        {index < selectedBus.route.length - 1 && (
                          <div className="absolute left-4 top-full h-3 w-0.5 bg-slate-400 dark:bg-slate-500"></div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Select a bus to view its route
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;