import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface DriverActionsProps {
  onDone: () => void;
  onWrong: () => void;
  onEta: (minutes: number) => void;
  onReset: () => void;
  stopName: string;
  currentTime: string;
}

const DriverActions: React.FC<DriverActionsProps> = ({ 
  onDone, 
  onWrong, 
  onEta,
  onReset,
  stopName,
  currentTime
}) => {
  return (
    <div className="w-full">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Current Stop: {stopName}</h3>
          <span className="text-sm text-slate-500">{currentTime}</span>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-success flex-1"
              onClick={onDone}
            >
              <CheckCircle size={20} />
              <span>Done</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-danger flex-1"
              onClick={onWrong}
            >
              <XCircle size={20} />
              <span>Wrong</span>
            </motion.button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center">
              <Clock size={16} className="mr-1" /> Set ETA to Next Stop:
            </h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline py-2"
              onClick={() => onEta(2)}
            >
              2️⃣ min
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline py-2"
              onClick={() => onEta(5)}
            >
              5️⃣ min
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline py-2"
              onClick={() => onEta(10)}
            >
              🔟 min
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-warning"
          onClick={onReset}
        >
          🧹 Reset Route
        </motion.button>
      </div>
    </div>
  );
};

export default DriverActions;