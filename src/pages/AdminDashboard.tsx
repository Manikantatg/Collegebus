import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BarChart3, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import LiveMap from '../components/admin/LiveMap';
import BusStats from '../components/admin/BusStats';
import LogCalendar from '../components/admin/LogCalendar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '', icon: Map, label: 'Live Tracking' },
    { path: 'stats', icon: BarChart3, label: 'Statistics' },
    { path: 'logs', icon: CalendarIcon, label: 'Logs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200 }}
        animate={{ x: isSidebarOpen ? 0 : -200 }}
        className="w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col"
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Admin Dashboard
          </h1>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={`/admin/${item.path}`}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === `/admin/${item.path}`
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon size={18} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => logout()}
          className="m-6 flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="" element={<LiveMap />} />
          <Route path="stats" element={<BusStats />} />
          <Route path="logs" element={<LogCalendar />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;