import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import AuthRoute from '@/components/auth/AuthRoute';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotificationBanner from '@/components/common/NotificationBanner';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  // Notification permission logic
  const { initialized, permissionStatus, requestPermission } = useNotification();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && permissionStatus === 'default' && !initialized) {
      const timer = setTimeout(requestPermission, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, permissionStatus, initialized, requestPermission]);

  return (
    <div className="min-h-screen">
      {/* App routes and notification banner */}
      <BrowserRouter>
        <NotificationBanner />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
