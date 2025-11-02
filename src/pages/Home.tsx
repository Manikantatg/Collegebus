import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bus, 
  User,
  Shield,
  Lock
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [busClickCount, setBusClickCount] = useState(0);
  const [showAdminSecurity, setShowAdminSecurity] = useState(false);
  
  // Handle bus emoji clicks
  const handleBusClick = () => {
    const newCount = busClickCount + 1;
    setBusClickCount(newCount);
    
    if (newCount === 3) {
      setShowAdminSecurity(true);
      setBusClickCount(0);
    }
  };
  
  // Admin/Security login screen
  if (showAdminSecurity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600">
            Admin & Security
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-md">
            Access restricted areas
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary text-lg py-5 flex-1"
            onClick={() => navigate('/admin-login')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Lock size={24} />
            <span className="font-medium">Admin Login</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary text-lg py-5 flex-1"
            onClick={() => navigate('/security-login')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Shield size={24} />
            <span className="font-medium">Security Login</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          onClick={() => setShowAdminSecurity(false)}
        >
          Back to main screen
        </motion.button>
      </div>
    );
  }
  
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
        <p 
          className="text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-md cursor-pointer"
          onClick={handleBusClick}
        >
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
        <p>📚 Made possible by <a href="https://https://chat.whatsapp.com/F3dWIW12gXJ6yaVYscyDjJ" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
        <p className="mt-1 text-red-500">CSE C Sec Batch 24-25</p>
        <p className="mt-1">.</p>
      </motion.div>
    </div>
  );
};

export default Home;