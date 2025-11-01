import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, MapPin, Clock } from 'lucide-react';
import { useBus } from '../../context/BusContext';

const BusStats: React.FC = () => {
  const { buses } = useBus();
  
  // Calculate statistics
  const totalBuses = Object.keys(buses).length;
  const activeBuses = Object.values(buses).filter(bus => !bus.routeCompleted).length;
  const totalStops = Object.values(buses).reduce((acc, bus) => acc + bus.route.length, 0);
  const totalStudents = Object.values(buses).reduce((acc, bus) => acc + (bus.studentCount || 0), 0);
  
  const stats = [
    { 
      title: 'Total Buses', 
      value: totalBuses, 
      icon: Bus, 
      color: 'from-blue-500 to-blue-600',
      description: 'All operational buses'
    },
    { 
      title: 'Active Buses', 
      value: activeBuses, 
      icon: Bus, 
      color: 'from-green-500 to-green-600',
      description: 'Currently running buses'
    },
    { 
      title: 'Total Stops', 
      value: totalStops, 
      icon: MapPin, 
      color: 'from-purple-500 to-purple-600',
      description: 'Across all routes'
    },
    { 
      title: 'Students', 
      value: totalStudents, 
      icon: Users, 
      color: 'from-orange-500 to-orange-600',
      description: 'Currently on buses'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
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
            <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BusStats;