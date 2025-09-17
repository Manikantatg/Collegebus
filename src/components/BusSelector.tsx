import React from 'react';
import { motion } from 'framer-motion';
import { useBus } from '../context/BusContext';

interface BusSelectorProps {
  onSelect?: (busId: number) => void;
  gridSize?: number;
  animate?: boolean;
}

const BusSelector: React.FC<BusSelectorProps> = ({ 
  onSelect, 
  gridSize = 5,
  animate = true
}) => {
  const { selectedBus, setSelectedBus } = useBus();
  
  const handleBusSelect = (busId: number) => {
    setSelectedBus(busId);
    if (onSelect) {
      onSelect(busId);
    }
  };
  
  const busNumbers = Array.from({ length: 16 }, (_, i) => i + 1);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Select Bus Number</h2>
      <div 
        className="grid grid-cols-4 gap-2 md:gap-3"
      >
        {busNumbers.map((busId) => (
          <motion.button
            key={busId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square flex items-center justify-center text-lg font-medium rounded-xl 
              ${selectedBus === busId 
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              } transition-all duration-200`}
            onClick={() => handleBusSelect(busId)}
            initial={animate ? { opacity: 0, y: 20 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ 
              duration: 0.3, 
              delay: animate ? busId * 0.01 : 0
            }}
          >
            {busId}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BusSelector;