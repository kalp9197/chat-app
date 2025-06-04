import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import { useAuth } from "@/store/auth";
import NotificationBanner from "@/components/NotificationBanner";
import { initializeNotifications } from "@/services/notificationService";

function AuthRoute({ children }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);


  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);


  const token = useAuth((s) => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      // init notifications
      
      const initTimer = setTimeout(() => {
        initializeNotifications()
          .then(() => {})
          .catch(() => {
            // init error
          });
      }, 2000); // delay ensures auth
      
      return () => clearTimeout(initTimer);
    }
  }, [isAuthenticated, token]);

  return (
    <div className="min-h-screen">
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
