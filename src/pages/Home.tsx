import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, User } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600">
          Campus Bus Tracker
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-md">
          Live bus locations & ETAs for college students 🚍
        </p>
      </motion.div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-lg py-5 flex-1"
          onClick={() => navigate('/student-dashboard')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <User size={24} />
          <span className="font-medium">Student</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-secondary text-lg py-5 flex-1"
          onClick={() => navigate('/driver-login')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Bus size={24} />
          <span className="font-medium">Driver</span>
        </motion.button>
      </div>

      <motion.div
        className="mt-16 text-center text-sm text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>📚 Made possible by Doutly — Where Curiosity Meets 💰 Opportunity</p>
        <p className="mt-2">v1.0.0</p>
      </motion.div>
    </div>
  );
};

export default Home;