import React from 'react';
import { motion } from 'framer-motion';
import { useBus } from '../context/BusContext';

interface BusSelectorProps {
  onSelect?: (busId: number | string) => void;
  gridSize?: number;
  animate?: boolean;
}

const BusSelector: React.FC<BusSelectorProps> = ({ 
  onSelect, 
  gridSize = 5,
  animate = true
}) => {
  const { selectedBus, setSelectedBus } = useBus();
  
  const handleBusSelect = (busId: number | string) => {
    // For the BITM variant, we'll use 17 as the numeric ID for backward compatibility
    const numericBusId = typeof busId === 'string' && busId === "15 (BITM Variant)" ? 17 : 
                         typeof busId === 'string' ? parseInt(busId) : busId;
    
    setSelectedBus(numericBusId);
    if (onSelect) {
      onSelect(busId);
    }
  };
  
  // Updated to include all buses (1-16, 15 (BITM Variant), 20) - removed bus 17
  const busNumbers: (number | string)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, "15 BITM", 16, 20];
  
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center"></h2>
      <div 
        className="grid grid-cols-4 gap-2 md:gap-3"
      >
        {busNumbers.map((busId) => (
          <motion.button
            key={typeof busId === 'string' ? busId : busId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square flex items-center justify-center text-lg font-medium rounded-xl 
              ${(typeof busId === 'string' && busId === "15 (BITM Variant)" && selectedBus === 17) || 
                 (typeof busId === 'number' && selectedBus === busId)
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              } transition-all duration-200`}
            onClick={() => handleBusSelect(busId)}
            initial={animate ? { opacity: 0, y: 20 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ 
              duration: 0.3, 
              delay: animate ? (typeof busId === 'number' ? busId : 17) * 0.01 : 0
            }}
          >
            {typeof busId === 'string' ? busId : busId}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BusSelector;