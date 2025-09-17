import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusProvider } from './context/BusContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import DriverLogin from './pages/DriverLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BusProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/driver-login" element={<DriverLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
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
          </Routes>
        </Router>
      </BusProvider>
    </AuthProvider>
  );
}

export default App;