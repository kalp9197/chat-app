import { useState, useEffect } from 'react';
import {
  initializeNotifications,
  listenForNotifications,
  triggerTestNotification,
} from '../services/notificationService';
import { useAuth } from './useAuth';

export const useNotification = () => {
  const [initialized, setInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [notificationToken, setNotificationToken] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const initNotifications = async () => {
      if (!user || initialized) return;

      try {
        if (!('Notification' in window)) {
          setError('Notifications not supported in this browser');
          return;
        }

        setPermissionStatus(Notification.permission);

        if (Notification.permission === 'denied') {
          setError('Notification permission denied');
          return;
        }

        const token = await initializeNotifications();
        if (token) {
          setNotificationToken(token);
          setInitialized(true);
        } else {
          setError('Failed to get notification token');
        }
      } catch (err) {
        setError(err.message || 'Error initializing notifications');
      }
    };

    initNotifications();
  }, [user, initialized]);

  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const token = await initializeNotifications();
        if (token) {
          setNotificationToken(token);
          setInitialized(true);
          return true;
        }
      }

      return false;
    } catch (err) {
      setError(err.message || 'Error requesting notification permission');
      return false;
    }
  };

  const sendTestNotification = async (title, body) => {
    try {
      return await triggerTestNotification(title, body);
    } catch (err) {
      setError(err.message || 'Error sending test notification');
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;

    if (Notification.permission === 'granted') {
      setPermissionStatus('granted');
    }
  }, [user]);

  return {
    initialized,
    permissionStatus,
    notificationToken,
    error,
    requestPermission,
    sendTestNotification,
    listenForNotifications,
  };
};
