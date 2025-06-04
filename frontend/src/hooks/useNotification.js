import { useState, useEffect } from "react";
import {
  initializeNotifications,
  listenForNotifications,
  triggerTestNotification,
} from "../services/notificationService";
import { useAuth } from "./useAuth";

// This hook provides application-wide notification functionality
export const useNotification = () => {
  const [initialized, setInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");
  const [notificationToken, setNotificationToken] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Initialize notifications when the user logs in
  useEffect(() => {
    const initNotifications = async () => {
      if (!user || initialized) return;

      try {
        // Check browser support for notifications
        if (!("Notification" in window)) {
          setError("Notifications not supported in this browser");
          return;
        }

        // Check current permission status
        setPermissionStatus(Notification.permission);

        // If already denied, don't try to initialize
        if (Notification.permission === "denied") {
          setError("Notification permission denied");
          return;
        }

        // Initialize notifications and get token
        const token = await initializeNotifications();
        if (token) {
          setNotificationToken(token);
          setInitialized(true);
        } else {
          setError("Failed to get notification token");
        }
      } catch (err) {
        setError(err.message || "Error initializing notifications");
      }
    };

    initNotifications();
  }, [user, initialized]);

  // Request permission for notifications
  const requestPermission = async () => {
    try {
      if (!("Notification" in window)) {
        throw new Error("Notifications not supported");
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        // Re-initialize notifications after permission is granted
        const token = await initializeNotifications();
        if (token) {
          setNotificationToken(token);
          setInitialized(true);
          return true;
        }
      }

      return false;
    } catch (err) {
      setError(err.message || "Error requesting notification permission");
      return false;
    }
  };

  // Send a test notification
  const sendTestNotification = async (title, body) => {
    try {
      return await triggerTestNotification(title, body);
    } catch (err) {
      setError(err.message || "Error sending test notification");
      return false;
    }
  };

  // Check if we're initialized on mount
  useEffect(() => {
    if (!user) return;

    // Check if notifications are already initialized by checking permission
    if (Notification.permission === "granted") {
      setPermissionStatus("granted");
    }
  }, [user]);

  return {
    initialized,
    permissionStatus,
    notificationToken,
    error,
    requestPermission,
    sendTestNotification,
    // Pass through the listener function for components to use
    listenForNotifications,
  };
};
