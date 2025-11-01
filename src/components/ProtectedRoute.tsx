import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_CREDENTIALS, SECURITY_CREDENTIALS } from '../data/busRoutes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  securityOnly?: boolean;
}

const ADMIN_EMAILS = [
  'admin@ku.com',
  'tgmanikanta11@gmail.com',
  ADMIN_CREDENTIALS.email // Include the admin email from busRoutes
  // Add more admin emails as needed
];

const SECURITY_EMAIL = SECURITY_CREDENTIALS.email;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false, securityOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Special case: if accessing security dashboard without being logged in,
  // redirect to security login page
  if (securityOnly && !user) {
    // Check if there's a special flag in sessionStorage indicating security login
    const isSecurityLogin = sessionStorage.getItem('securityLogin') === 'true';
    if (isSecurityLogin) {
      // Clear the flag
      sessionStorage.removeItem('securityLogin');
      // Allow access (in a real app, we would have proper authentication)
      return <>{children}</>;
    }
    return <Navigate to="/security-login" />;
  }

  if (!user) {
    return <Navigate to="/driver-login" />;
  }

  // Check if this is the security user (case-insensitive comparison)
  const isSecurityUser = user.email && user.email.toLowerCase() === SECURITY_EMAIL.toLowerCase();

  // Check if this is the security dashboard route
  if (securityOnly) {
    if (!isSecurityUser) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  }

  // Check if this is an admin-only route
  if (adminOnly && !ADMIN_EMAILS.includes(user.email || '')) {
    // If it's the security user, redirect to security dashboard
    if (isSecurityUser) {
      return <Navigate to="/security" />;
    }
    return <Navigate to="/" />;
  }

  // If security user tries to access non-admin/non-security routes, redirect to security dashboard
  if (!adminOnly && !securityOnly && isSecurityUser) {
    return <Navigate to="/security" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;