import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import AuthRoute from "@/components/auth/AuthRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationBanner from "@/components/common/NotificationBanner";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  // Use notification hook to manage notification setup
  const { initialized, permissionStatus, requestPermission } = useNotification();
  const isAuthenticated = useAuth(state => state.isAuthenticated);
  
  // Request notification permission when user is authenticated
  useEffect(() => {
    if (isAuthenticated && permissionStatus === 'default' && !initialized) {
      // Request permission with a short delay after login
      const permissionTimer = setTimeout(() => {
        requestPermission();
      }, 2000);
      
      return () => clearTimeout(permissionTimer);
    }
  }, [isAuthenticated, permissionStatus, initialized, requestPermission]);

  return (
    <div className="min-h-screen">
      <BrowserRouter>
        {/* Include the notification banner for foreground notifications */}
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
          {/* Redirect all other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
