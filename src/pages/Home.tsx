import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, User, Shield, Lock, MapPin, Clock, Users, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  // Features data for Bento grid
  const features = [
    {
      icon: <Bus className="h-8 w-8 text-blue-600" />,
      title: "Real-time Tracking",
      description: "Live bus locations with accurate ETAs"
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Route Visualization",
      description: "Interactive maps showing all bus routes"
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Schedule Management",
      description: "Up-to-date timetables and notifications"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Student Safety",
      description: "Secure tracking and emergency alerts"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Analytics Dashboard",
      description: "Performance metrics and insights"
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Security Monitoring",
      description: "Campus entry/exit tracking system"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="responsive-container section-padding">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 swiss-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Campus Bus Tracker
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Streamlined transportation management for students, drivers, and administrators
          </motion.p>
          
          {/* Role Selection Bento Grid */}
          <motion.div 
            className="bento-grid mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div 
              className="bento-item cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              onClick={() => navigate('/student-dashboard')}
            >
              <div className="p-6">
                <User className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Student Portal</h3>
                <p className="opacity-90">Track buses and plan your journey</p>
              </div>
            </div>
            
            <div 
              className="bento-item cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white"
              onClick={() => navigate('/driver-login')}
            >
              <div className="p-6">
                <Bus className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Driver Dashboard</h3>
                <p className="opacity-90">Manage routes and update progress</p>
              </div>
            </div>
            
            <div 
              className="bento-item cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              onClick={() => navigate('/admin-login')}
            >
              <div className="p-6">
                <Lock className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Administrator</h3>
                <p className="opacity-90">Monitor system and manage data</p>
              </div>
            </div>
            
            <div 
              className="bento-item cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
              onClick={() => navigate('/security-login')}
            >
              <div className="p-6">
                <Shield className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Security</h3>
                <p className="opacity-90">Track campus entry and exit logs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="responsive-container">
          <div className="text-center mb-16">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Our comprehensive bus tracking system provides everything you need for efficient campus transportation
            </p>
          </div>
          
          <div className="bento-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bento-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-6">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="responsive-container section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
            <div className="text-gray-600 dark:text-gray-400">Active Buses</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1500+</div>
            <div className="text-gray-600 dark:text-gray-400">Daily Students</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="responsive-container">
          <p>📚 Made possible by <a href="https://doutly.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Doutly</a> — Where Curiosity Meets 💰 Opportunity</p>
          <p className="mt-2">CSE C Sec Batch 24-25</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;