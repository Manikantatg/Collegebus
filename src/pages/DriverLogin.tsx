import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, ArrowLeft, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BusSelector from '../components/BusSelector';
import { useAuth } from '../context/AuthContext';

const DriverLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      setIsAuthenticated(true);
      toast.success('Login successful! Please select your bus number.');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Invalid email format');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusSelection = () => {
    if (!selectedBusId) {
      toast.error('Please select a bus number');
      return;
    }
    
    toast.success(`Welcome! Redirecting to Bus #${selectedBusId} dashboard...`);
    navigate(`/driver-dashboard/${selectedBusId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-4">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white mr-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-white">Driver Login</h1>
              <p className="text-blue-100 text-sm">Access your dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {!isAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="mani@ku.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary w-full mt-6 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Bus size={20} className="mr-2" />
                    Sign in
                  </span>
                )}
              </motion.button>
            </form>
          ) : (
            /* Bus Selection */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  Welcome Back! 👋
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Please select your bus number to continue
                </p>
              </div>

              <BusSelector 
                onSelect={setSelectedBusId} 
                gridSize={6}
                animate={true}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBusSelection}
                disabled={!selectedBusId}
                className={`btn w-full mt-6 ${
                  selectedBusId 
                    ? 'btn-success' 
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {selectedBusId ? (
                  <span className="flex items-center justify-center">
                    <Bus size={20} className="mr-2" />
                    Access Bus #{selectedBusId} Dashboard
                  </span>
                ) : (
                  <span>Select a bus number first</span>
                )}
              </motion.button>

              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setEmail('');
                  setPassword('');
                  setSelectedBusId(null);
                }}
                className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                ← Back to login
              </button>
            </motion.div>
          )}

          {/* Demo Credentials */}
          <motion.div 
            className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              🚀 Demo Credentials:
            </h4>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p><strong>Email:</strong> ramesh@gmail.com</p>
              <p><strong>Password:</strong> driver123</p>
              <p className="text-blue-600 dark:text-blue-400 mt-2">
                💡 All drivers use password: driver123
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-400/10 rounded-full"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400/10 rounded-full"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

export default DriverLogin;