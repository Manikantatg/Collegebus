import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Bus,
  Shield,
  Wifi,
  WifiOff,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import BusStats from '../components/admin/BusStats';
import LiveMap from '../components/admin/LiveMap';
import LogCalendar from '../components/admin/LogCalendar';
import SecurityLogs from '../components/admin/SecurityLogs';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseConnected, firebaseError } = useBus();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Tracking', icon: Map },
    { id: 'logs', label: 'Security Logs', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <BusStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <Map size={20} />
                    <span>Live Tracking</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <FileText size={20} />
                    <span>Security Logs</span>
                  </button>
                  <button 
                    onClick={() => navigate('/driver-login')}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <Bus size={20} />
                    <span>Driver Login</span>
                  </button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card lg:col-span-2"
              >
                <h3 className="text-xl font-bold mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                        <Wifi size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Connection</p>
                        <p className="font-bold text-lg">
                          {firebaseConnected ? 'Connected' : 'Disconnected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mr-4">
                        <Bus size={24} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Buses</p>
                        <p className="font-bold text-lg">All Operational</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
                    <div className="flex items-center">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mr-4">
                        <Shield size={24} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Security</p>
                        <p className="font-bold text-lg">Monitoring</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        );
      case 'map':
        return <LiveMap />;
      case 'logs':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SecurityLogs />
            <LogCalendar />
          </div>
        );
      default:
        return <BusStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="responsive-container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4 p-2 rounded-lg hover:bg-white/10"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-lg mr-4">
                  <Bus size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-blue-100">Bus Tracking System</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
            >
              <LogOut size={18} className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Connection Status */}
      <div className="responsive-container py-4">
        <div className={`mb-6 flex items-center p-4 rounded-lg ${
          firebaseError 
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
            : firebaseConnected 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
        }`}>
          {firebaseError ? (
            <>
              <AlertTriangle size={20} className="mr-3" />
              <span className="font-medium">Firebase Error: {firebaseError}</span>
            </>
          ) : firebaseConnected ? (
            <>
              <Wifi size={20} className="mr-3" />
              <span className="font-medium">Connected to real-time data system</span>
            </>
          ) : (
            <>
              <WifiOff size={20} className="mr-3" />
              <span className="font-medium">Data connection failed</span>
            </>
          )}
        </div>
      </div>

      <div className="responsive-container py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            >
              <div 
                className="bg-white dark:bg-gray-800 w-64 h-full p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-8 pt-4">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg mr-3">
                    <Bus size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
                </div>
                
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="card sticky top-6">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg mr-3">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="responsive-container">
          <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
          <p className="mt-1">CSE C Sec Batch 24-25</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;