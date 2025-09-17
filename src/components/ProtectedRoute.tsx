import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ADMIN_EMAILS = [
  'admin@ku.com',
  'tgmanikanta11@gmail.com'
  // Add more admin emails as needed
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/driver-login" />;
  }

  if (adminOnly && !ADMIN_EMAILS.includes(user.email || '')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;