import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusProvider } from './context/BusContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import DriverLogin from './pages/DriverLogin';
import AdminLogin from './pages/AdminLogin';
import SecurityLogin from './pages/SecurityLogin';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Handle Netlify routing
const basename = process.env.NODE_ENV === 'production' ? '/' : '/';

function App() {
  return (
    <AuthProvider>
      <BusProvider>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/driver-login" element={<DriverLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/security-login" element={<SecurityLogin />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route 
              path="/driver-dashboard/:busId" 
              element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security" 
              element={
                <ProtectedRoute securityOnly>
                  <SecurityDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Catch all route for Netlify */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </BusProvider>
    </AuthProvider>
  );
}

export default App;