import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PhoneCall, RefreshCw, Clock, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import BusSelector from '../components/BusSelector';
import RouteDisplay from '../components/RouteDisplay';
import { useBus } from '../context/BusContext';
import { drivers } from '../data/busRoutes';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { buses, selectedBus, setSelectedBus, requestStop, firebaseConnected, firebaseError } = useBus();
  const [showNotification, setShowNotification] = useState<string | null>(null);
  
  // Watch for updates to show notifications
  useEffect(() => {
    if (!selectedBus) return;
    
    const bus = buses[selectedBus];
    if (!bus) return;
    
    const latestNotification = bus.notifications?.[0]; // Get the most recent notification
    
    if (latestNotification) {
      setShowNotification(latestNotification.message);
      
      const timer = setTimeout(() => {
        setShowNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [buses, selectedBus]); // This dependency array is correct for real-time updates
  
  // Add a more efficient re-render trigger for route updates
  const busData = selectedBus ? buses[selectedBus] : null;
  const driverData = selectedBus ? drivers.find(driver => driver.bus === selectedBus) : null;
  
  // Create a unique key for the RouteDisplay component to force re-render on updates
  const routeDisplayKey = selectedBus && busData 
    ? `${selectedBus}-${busData.currentStopIndex}-${busData.eta}-${busData.routeCompleted}` 
    : 'no-bus';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mr-3 text-slate-600 dark:text-slate-300"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Student Dashboard</h1>
            </div>
          </div>
          
          {selectedBus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1 rounded-full shadow-sm"
            >
              <span className="text-sm font-medium">Bus #{selectedBus}</span>
            </motion.div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-xl">
        {/* Connection Status */}
        <div className={`mb-4 flex items-center p-3 rounded-lg ${
          firebaseError 
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
            : firebaseConnected 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
        }`}>
          {firebaseError ? (
            <>
              <AlertTriangle size={18} className="mr-2" />
              <span>Firebase Error: {firebaseError}</span>
            </>
          ) : firebaseConnected ? (
            <>
              <Wifi size={18} className="mr-2" />
              <span>Connected to data system</span>
            </>
          ) : (
            <>
              <WifiOff size={18} className="mr-2" />
              <span>Data connection failed</span>
            </>
          )}
        </div>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-center font-medium">
                🔔 {showNotification}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedBus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-center mb-6">Select Your Bus</h2>
            <BusSelector />
          </motion.div>
        ) : (
          <>
            {/* Bus route information */}
            {busData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-4"
                key={routeDisplayKey} // Use the optimized key for better re-rendering
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Bus Route</h2>
                  
                  <div className="flex gap-2">
                    {busData.eta !== null && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        ETA: {busData.eta} min
                      </div>
                    )}
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                      Live
                    </div>
                  </div>
                </div>
                
                <RouteDisplay
                  route={busData.route}
                  currentStopIndex={busData.currentStopIndex}
                  eta={busData.eta}
                />
                
                {/* Current Status */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Current Status:</p>
                      <p className="font-medium">
                        {busData.currentStopIndex < busData.route.length 
                          ? `En route to ${busData.route[busData.currentStopIndex]?.name || 'Unknown'}`
                          : 'Route completed'
                        }
                      </p>
                    </div>
                    <Clock size={16} className="text-slate-400" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Driver information */}
            {driverData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
              >
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Driver Information</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{driverData.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{driverData.phone}</p>
                    {busData?.currentDriver && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">🟢 Driver is on duty</p>
                    )}
                  </div>
                  <button
                    className="btn btn-outline py-2 text-sm"
                    onClick={() => window.location.href = `mailto:${driverData.email}`}
                  >
                    <PhoneCall size={16} />
                    <span>Contact Driver</span>
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Change bus button */}
            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline inline-flex items-center"
                onClick={() => setSelectedBus(null)}
              >
                <RefreshCw size={18} className="mr-2" />
                Change Bus
              </motion.button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;