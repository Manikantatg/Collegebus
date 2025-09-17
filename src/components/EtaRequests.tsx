import React from 'react';
import { motion } from 'framer-motion';
import { EtaRequest, Notification } from '../types';
import { Clock, Bell } from 'lucide-react';

interface EtaRequestsProps {
  requests: EtaRequest[];
  notifications: Notification[];
}

const EtaRequests: React.FC<EtaRequestsProps> = ({ requests, notifications }) => {
  if (notifications.length === 0) {
    return (
      <div className="card h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Bell size={24} className="mx-auto mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full overflow-auto">
      <h3 className="text-lg font-medium mb-4">Recent Updates</h3>
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            className={`p-3 rounded-lg ${
              notification.type === 'eta' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : notification.type === 'request'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-start gap-2">
              {notification.type === 'eta' ? (
                <Clock size={16} className="mt-1" />
              ) : (
                <Bell size={16} className="mt-1" />
              )}
              <div className="flex-1">
                <div className="text-sm">{notification.message}</div>
                <div className="text-xs opacity-75 mt-1">{notification.timestamp}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EtaRequests;