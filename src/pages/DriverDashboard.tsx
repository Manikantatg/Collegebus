import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Play, Store as Stop, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import RouteDisplay from '../components/RouteDisplay';
import DriverActions from '../components/DriverActions';
import EtaRequests from '../components/EtaRequests';
import { useBus } from '../context/BusContext';

interface LocationData {
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: string;
}

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { busId } = useParams<{ busId: string }>();
  const { buses, setSelectedBus, moveToNextStop, moveToPreviousStop, setEta, resetBusProgress, getFormattedTime, logDriverAttendance, updateDriverLocation, firebaseConnected, firebaseError } = useBus();
  
  const [isTracking, setIsTracking] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);
  
  useEffect(() => {
    if (busId) {
      setSelectedBus(parseInt(busId));
    }
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [busId, setSelectedBus, watchId]);

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    try {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed,
            timestamp: new Date().toISOString()
          };

          setLocationData(newLocation);
          setLocationError(null);

          const busIdNum = parseInt(busId!);

          // Log driver entry only once when tracking starts
          if (!isTracking) {
            setIsTracking(true);
            await logDriverAttendance(busIdNum, 'entry', newLocation);
          } 
          // Update location continuously but with optimized frequency for real-time updates
          else if (Date.now() - lastLocationUpdate > 5000) { // Update every 5 seconds for better real-time sync
            setLastLocationUpdate(Date.now());
            await updateDriverLocation(busIdNum, newLocation);
          }
        },
        (error) => {
          setLocationError(`Error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Reduced timeout for faster responses
          maximumAge: 10000 // Reduced maximum age for fresher data
        }
      );

      setWatchId(id);
    } catch (error) {
      setLocationError(`Failed to start tracking: ${error}`);
    }
  };

  useEffect(() => {
    startTracking();
    
    // Cleanup function
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const stopTracking = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    if (locationData) {
      await logDriverAttendance(parseInt(busId!), 'exit', locationData);
    }
    
    setIsTracking(false);
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
              <span>Connected to data system</span>
            </>
          ) : (
            <>
              <WifiOff size={18} className="mr-2" />
              <span>Data connection failed</span>
            </>
          )}
        </div>

        {locationError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {locationError}
          </div>
        )}

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
    </div>
  );
};

export default DriverDashboard;