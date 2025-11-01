import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PhoneCall, RefreshCw, Clock, Wifi, WifiOff, AlertTriangle, Bus } from 'lucide-react';
import BusSelector from '../components/BusSelector';
import RouteDisplay from '../components/RouteDisplay';
import { useBus } from '../context/BusContext';
import { drivers } from '../data/busRoutes';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { buses, selectedBus, setSelectedBus, firebaseConnected, firebaseError } = useBus();
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
  }, [buses, selectedBus]);
  
  // Memoize selected bus data to prevent unnecessary re-renders
  const busData = useMemo(() => {
    return selectedBus ? buses[selectedBus] : null;
  }, [buses, selectedBus]);
  
  const driverData = useMemo(() => {
    return selectedBus ? drivers.find(driver => driver.bus === selectedBus) : null;
  }, [selectedBus]);

  // Render content based on state
  const renderContent = () => {
    // Handle case where buses data might not be loaded yet
    if (!buses || Object.keys(buses).length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading bus data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
          <div className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="mr-4 text-slate-600 dark:text-slate-300"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Student Dashboard</h1>
                </div>
              </div>
              
              {selectedBus && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg"
                >
                  <Bus size={18} className="mr-2" />
                  <span className="font-medium">Bus #{selectedBus}</span>
                </motion.div>
              )}
            </div>
          </div>
        </header>
        
        {/* Connection Status */}
        <div className="px-6 pt-6">
          <div className={`mb-6 flex items-center p-4 rounded-lg ${
            firebaseError 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
              : firebaseConnected 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
          }`}>
            {firebaseError ? (
              <>
                <AlertTriangle size={20} className="mr-3" />
                <span className="font-medium">Firebase Error: {firebaseError}</span>
              </>
            ) : firebaseConnected ? (
              <>
                <Wifi size={20} className="mr-3" />
                <span className="font-medium">Connected to real-time data system</span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="mr-3" />
                <span className="font-medium">Data connection failed</span>
              </>
            )}
          </div>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg"
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
        
        <main className="px-6 pb-8">
          {!selectedBus ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto card"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Select Your Bus</h2>
              <BusSelector />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Bus route information */}
                {busData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Bus Route</h2>
                      
                      <div className="flex gap-3">
                        {busData.eta !== null && (
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                            ETA: {busData.eta} min
                          </div>
                        )}
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-full text-xs">
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
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
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
                        <Clock size={20} className="text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                {/* Driver information */}
                {driverData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
                  >
                    <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{driverData.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{driverData.phone}</p>
                      </div>
                      <button
                        className="btn btn-primary py-2 px-4"
                        onClick={() => window.location.href = `tel:${driverData.phone}`}
                      >
                        <PhoneCall size={18} className="mr-2" />
                        <span>Contact</span>
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      className="w-full btn btn-secondary py-3"
                      onClick={() => setSelectedBus(null)}
                    >
                      <RefreshCw size={18} className="mr-2" />
                      Change Bus
                    </button>
                  </div>
                </motion.div>
                
                {/* Bus Statistics */}
                {busData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                  >
                    <h3 className="text-lg font-semibold mb-4">Bus Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Students</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{busData.studentCount || 0}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Stops</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{busData.route.length}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
          <div className="px-6">
            <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
            <p className="text-red-500 mt-1">CSE C Sec Batch 24-25</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </footer>
      </div>
    );
  };

  return renderContent();
};

export default StudentDashboard;