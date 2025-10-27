import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Play, Store as Stop, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import RouteDisplay from '../components/RouteDisplay';
import DriverActions from '../components/DriverActions';
import EtaRequests from '../components/EtaRequests';
import { useBus } from '../context/BusContext';
import { toast } from 'react-hot-toast';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { busId } = useParams<{ busId: string }>();
  const { buses, setSelectedBus, moveToNextStop, moveToPreviousStop, setEta, resetBusProgress, getFormattedTime, firebaseConnected, firebaseError } = useBus();
  
  useEffect(() => {
    if (busId) {
      setSelectedBus(parseInt(busId));
    }
  }, [busId, setSelectedBus]);

  const stopTracking = async () => {
    navigate('/driver-login');
  };
  
  const busIdNum = busId ? parseInt(busId) : null;
  const busData = busIdNum ? buses[busIdNum] : null;
  
  if (!busIdNum || !busData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            {!busIdNum ? 'Invalid Bus ID' : 'Bus Data Not Found'}
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
  
  // Watch for Firebase errors to show quota exceeded messages
  useEffect(() => {
    if (firebaseError && firebaseError.includes('Quota')) {
      toast.error('Quota exceeded. Updates may be delayed. Please wait before making more changes.');
    }
  }, [firebaseError]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="mr-3"
                onClick={() => navigate('/')}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold">Driver Dashboard</h1>
                <p className="text-sm text-blue-100">Bus #{busIdNum}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn bg-red-500 hover:bg-red-600 text-white"
              onClick={stopTracking}
            >
              <Stop size={18} className="mr-2" />
              End Shift
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
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
              <span>Connected to real-time data system</span>
            </>
          ) : (
            <>
              <WifiOff size={18} className="mr-2" />
              <span>Data connection failed</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card h-full"
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
                onDone={() => moveToNextStop(busIdNum)}
                onWrong={() => moveToPreviousStop(busIdNum)}
                onEta={(minutes) => setEta(busIdNum, minutes)}
                onReset={() => {
                  if (confirm('Are you sure you want to reset all progress for this route?')) {
                    resetBusProgress(busIdNum);
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
              className="h-[calc(100vh-24rem)]"
            >
              <EtaRequests 
                requests={busData.etaRequests}
                notifications={busData.notifications || []}
              />
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
        <p className="mt-1">CSE C Sec Batch 24-25</p>
        <p className="mt-1">v1.0.0</p>
      </footer>
    </div>
  );
};

export default DriverDashboard;