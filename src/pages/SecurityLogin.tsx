import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SECURITY_CREDENTIALS } from '../data/busRoutes';

const SecurityLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try to login with Firebase
      await login(email, password);
      // If successful, navigate to security dashboard
      navigate('/security');
    } catch (err) {
      // If Firebase login fails, check if it's the hardcoded credentials
      if (email.toLowerCase() === SECURITY_CREDENTIALS.email.toLowerCase() && password === SECURITY_CREDENTIALS.password) {
        // Set a flag in sessionStorage to indicate security login
        sessionStorage.setItem('securityLogin', 'true');
        // For the security user, we'll simulate login by directly navigating
        navigate('/security');
        return;
      }
      // Otherwise, let the error show
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 rounded-t-xl">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white mr-4"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-bold text-white">Security Login</h1>
          </div>
        </div>
        
        <div className="p-8">
          {authError && (
            <motion.div 
              className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="security@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-full mt-8 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Shield size={20} className="mr-2" />
                  Sign in
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="font-medium mb-2">Security Personnel Credentials:</p>
            <p className="mb-1">Email: <span className="font-mono">{SECURITY_CREDENTIALS.email}</span></p>
            <p>Password: <span className="font-mono">{SECURITY_CREDENTIALS.password}</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityLogin;