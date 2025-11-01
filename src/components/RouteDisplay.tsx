import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusStop } from '../types';
import { Bus } from 'lucide-react';

interface RouteDisplayProps {
  route: BusStop[];
  currentStopIndex: number;
  eta: number | null;
  // Remove atStop prop
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({ 
  route, 
  currentStopIndex,
  eta
  // Remove atStop prop
}) => {
  // Memoize the progress height calculation
  const progressHeight = useMemo(() => {
    return route.length > 1 
      ? `calc(${Math.max(0, currentStopIndex * 100 / (route.length - 1))}% - 12px)` 
      : '0%';
  }, [route.length, currentStopIndex]);

  // Memoize the bus position calculation
  const busPosition = useMemo(() => {
    return route.length > 1 
      ? `calc(${currentStopIndex * 100 / (route.length - 1)}% - 4px + 24px)` 
      : '24px';
  }, [route.length, currentStopIndex]);

  return (
    <div className="w-full">
      <div className="relative flex flex-col space-y-1">
        {/* Vertical progress bar */}
        <div className="absolute left-3 top-6 bottom-6 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        
        {/* Completed progress */}
        <motion.div 
          className="absolute left-3 top-6 w-1 bg-green-500 rounded-full z-10"
          initial={{ height: 0 }}
          animate={{ 
            height: progressHeight
          }}
          transition={{ duration: 0.5 }}
        ></motion.div>
        
        {/* Bus icon - only show when there's a valid current stop */}
        {currentStopIndex >= 0 && currentStopIndex < route.length && route.length > 0 && (
          <motion.div 
            className="absolute left-0 z-20 text-amber-500"
            initial={{ top: '24px' }}
            animate={{ 
              top: busPosition
            }}
            transition={{ duration: 0.8, type: "spring", stiffness: 300, damping: 30 }}
          >
            <span className="text-xl">🚌</span>
          </motion.div>
        )}
        
        {/* Stops */}
        {route.map((stop, index) => {
          const isPast = index < currentStopIndex;
          const isCurrent = index === currentStopIndex;
          const isFuture = index > currentStopIndex;
          
          return (
            <motion.div 
              key={index}
              className={`grid-stop relative pl-8 py-3 ${
                isPast 
                  ? 'grid-stop-past' 
                  : isCurrent 
                  ? 'grid-stop-current' 
                  : 'grid-stop-future'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Circle marker */}
              <div 
                className={`absolute left-2.5 top-4 w-2 h-2 rounded-full z-20 ${
                  isPast 
                    ? 'bg-green-500' 
                    : isCurrent 
                    ? 'bg-blue-500 animate-pulse-slow' 
                    : 'bg-slate-400 dark:bg-slate-600'
                }`}
              ></div>
              
              {/* Stop name with emoji */}
              <div className="flex flex-col">
                <div className="text-sm md:text-base font-medium">{stop.name}</div>
                
                {/* Show scheduled time for all stops */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  📅 Scheduled: {stop.scheduledTime}
                </div>
                
                {/* Show actual arrival time for completed stops */}
                {stop.completed && stop.actualTime && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✅ Arrived: {stop.actualTime}
                  </div>
                )}
                
                {/* Show ETA for current stop */}
                {isCurrent && eta !== null && (
                  <AnimatePresence>
                    <motion.div 
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      ⏱️ ETA: {eta} min
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteDisplay;