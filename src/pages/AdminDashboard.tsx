import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
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
  Users
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
  const { buses, firebaseConnected, firebaseError } = useBus();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busLogs, setBusLogs] = useState<any[]>([]);

  // Load logs from localStorage with real-time updates
  useEffect(() => {
    const loadLogs = () => {
      const savedLogs = localStorage.getItem('busLogs');
      if (savedLogs) {
        try {
          const parsedLogs = JSON.parse(savedLogs);
          // Sort logs by timestamp (newest first)
          const sortedLogs = parsedLogs.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setBusLogs(sortedLogs);
        } catch (e) {
          console.error('Error parsing logs:', e);
        }
      }
    };

    loadLogs();
    
    // Set up polling to check for new logs every 10 seconds for real-time updates
    const interval = setInterval(loadLogs, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Tracking', icon: Map },
    { id: 'logs', label: 'Security Logs', icon: FileText },
  ];

  // Calculate stats from real-time data
  const totalBuses = Object.keys(buses).length;
  const activeBuses = Object.values(buses).filter(bus => bus.currentStopIndex > 0).length;
  const totalStops = Object.values(buses).reduce((acc, bus) => acc + bus.route.length, 0);
  const totalStudents = Object.values(buses).reduce((acc, bus) => acc + (bus.studentCount || 0), 0);

  const stats = [
    { 
      title: 'Total Buses', 
      value: totalBuses, 
      icon: Bus, 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',  
      description: 'All operational buses' 
    },
    { 
      title: 'Active Buses', 
      value: activeBuses, 
      icon: Bus, 
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      description: 'Currently running buses'
    },
    { 
      title: 'Total Stops', 
      value: totalStops, 
      icon: MapPin, 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      description: 'Across all routes'     
    },
    { 
      title: 'Students', 
      value: totalStudents, 
      icon: Users, 
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      description: 'Currently on buses'    
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
              >
                <h3 className="text-xl font-semibold mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Map size={24} className="text-slate-600 dark:text-slate-400 mb-3" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">Live Tracking</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <FileText size={24} className="text-slate-600 dark:text-slate-400 mb-3" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">Security Logs</span>
                  </button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
              >
                <h3 className="text-xl font-semibold mb-5">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Wifi size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Connection</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {firebaseConnected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Bus size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Buses</p>
                      <p className="font-medium text-slate-900 dark:text-white">{activeBuses} of {totalBuses} Operational</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Security</p>
                      <p className="font-medium text-slate-900 dark:text-white">Monitoring {busLogs.length} Logs</p>
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
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                  <Bus size={20} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bus Tracking System</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Connection Status */}
      <div className="px-6 pt-6">
        <div className={`mb-6 flex items-center p-4 rounded-lg ${
          firebaseError 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : firebaseConnected 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {firebaseError ? (
            <>
              <AlertTriangle size={16} className="mr-3" />
              <span className="font-medium text-sm">Firebase Error: {firebaseError}</span>
            </>
          ) : firebaseConnected ? (
            <>
              <Wifi size={16} className="mr-3" />
              <span className="font-medium text-sm">Connected to real-time data system</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="mr-3" />
              <span className="font-medium text-sm">Data connection failed</span>
            </>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 m-6">
            <div className="flex items-center mb-6">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                <Shield size={16} className="text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Admin Panel</h2>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 pb-8">
          {/* Mobile Sidebar */}
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
                  className="bg-white dark:bg-slate-800 w-64 h-full p-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center mb-6 pt-4">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                      <Bus size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Admin Panel</h2>
                  </div>
                  
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        <div className="px-6">
          <p>Made possible by <a href="https://https://chat.whatsapp.com/F3dWIW12gXJ6yaVYscyDjJ" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Doutly</a> — Where Curiosity Meets Opportunity</p>
          <p className="text-red-500 mt-1">CSE C Sec Batch 24-25</p>
          <p className="mt-1">.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;