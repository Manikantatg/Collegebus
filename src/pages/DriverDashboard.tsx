import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Play, Store as Stop, Wifi, WifiOff, AlertTriangle, Bus, MapPin, Clock } from 'lucide-react';
import RouteDisplay from '../components/RouteDisplay';
import DriverActions from '../components/DriverActions';
import EtaRequests from '../components/EtaRequests';
import { useBus } from '../context/BusContext';
import { toast } from 'react-hot-toast';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { busId } = useParams<{ busId: string }>();
  const { buses, selectedBus, setSelectedBus, moveToNextStop, moveToPreviousStop, setEta, resetBusProgress, getFormattedTime, firebaseConnected, firebaseError, updateStudentCount } = useBus();
  
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    if (busId) {
      // Check if busId is the BITM variant
      if (busId === "15 (BITM Variant)") {
        setSelectedBus(17); // Use 17 as the numeric ID for BITM variant
      } else {
        setSelectedBus(parseInt(busId));
      }
    }
  }, [busId, setSelectedBus]);

  const stopTracking = async () => {
    navigate('/driver-login');
  };
  
  // Determine the bus ID to use for accessing bus data
  let busIdKey: number | string | null = null;
  if (busId === "15 (BITM Variant)") {
    busIdKey = 17; // Use 17 as the numeric ID for BITM variant
  } else if (busId) {
    busIdKey = parseInt(busId);
  }
  
  const busData = busIdKey !== null && buses ? buses[busIdKey as number] : null;
  
  // Watch for Firebase errors to show quota exceeded messages
  useEffect(() => {
    if (firebaseError && firebaseError.includes('Quota')) {
      toast.error('Quota exceeded. Updates may be delayed. Please wait before making more changes.');
    }
  }, [firebaseError]);

  // Determine what to render based on state
  const renderContent = () => {
    // Handle case where buses data might not be loaded yet
    if (!buses || Object.keys(buses).length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading bus data...</p>
          </div>
        </div>
      );
    }
    
    if (!busIdKey || !busData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center p-8 card">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {!busIdKey ? 'Invalid Bus ID' : 'Bus Data Not Found'}
            </h2>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/driver-login')}
            >
              Return to Login
            </button>
          </div>
        </div>
      );
    }
    
    const currentStopName = busData.route[busData.currentStopIndex]?.name || 'Route Completed';
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md sticky top-0 z-10">
          <div className="py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="mr-4"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div>
                  <h1 className="text-xl font-bold">Driver Dashboard</h1>
                  <p className="text-blue-100">
                    Bus #{busId === "15 (BITM Variant)" ? "15 (BITM Variant)" : busIdKey}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4"
                onClick={stopTracking}
              >
                <Stop size={18} className="mr-2" />
                End Shift
              </motion.button>
            </div>
          </div>
        </header>
        


        <main className="px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >

                
                <RouteDisplay
                  route={busData.route}
                  currentStopIndex={busData.currentStopIndex}
                  eta={busData.eta}
                />
              </motion.div>
            </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DriverActions
                  onDone={() => moveToNextStop(busId || busIdKey || 0)}
                  onWrong={() => moveToPreviousStop(busId || busIdKey || 0)}
                  onEta={(minutes) => setEta(busId || busIdKey || 0, minutes)}
                  onReset={() => {
                    if (confirm('Are you sure you want to reset all progress for this route?')) {
                      resetBusProgress(busId || busIdKey || 0);
                    }
                  }}
                  stopName={currentStopName}
                  currentTime={getFormattedTime()}
                  isRouteCompleted={busData.currentStopIndex >= busData.route.length}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <EtaRequests 
                  requests={busData.etaRequests}
                  notifications={busData.notifications || []}
                  studentCount={busData.studentCount || 0}
                  busId={busIdKey || 0}
                />
              </motion.div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
          <div className="px-6">
            <p>📚 Made possible by <a href="https://https://chat.whatsapp.com/F3dWIW12gXJ6yaVYscyDjJ" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
            <p className="text-red-500 mt-1">CSE C Sec Batch 24-25</p>
            <p className="mt-1">.</p>
          </div>
        </footer>
      </div>
    );
  };

  return renderContent();
};

export default DriverDashboard;