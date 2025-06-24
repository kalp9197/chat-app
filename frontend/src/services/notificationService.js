import axios from '@/lib/axios';
import { onMessageListener } from '../config/firebase';

let notificationCallbacks = new Set();

export const saveFcmToken = async (token) => {
  await axios.post('/notifications/token', { fcm_token: token });
};

export const initializeNotifications = async () => {
  if (!('serviceWorker' in navigator)) return null;
  let token = null;
  if (window.firebase && window.firebase.messaging) {
    try {
      token = await window.firebase.messaging().getToken();
    } catch {
      /* ignore */
    }
  }
  if (!token && window.Notification && window.Notification.permission === 'granted') {
    try {
      const { default: firebase } = await import('firebase/compat/app');
      await import('firebase/compat/messaging');
      const messaging = firebase.messaging();
      token = await messaging.getToken();
    } catch {
      /* ignore */
    }
  }
  if (token) {
    await saveFcmToken(token);
    return token;
  }
  return null;
};

const handleGlobalNotification = (payload) => {
  notificationCallbacks.forEach((cb) => cb(payload));
};

let unsubscribeGlobalListener = null;

export const setupGlobalNotificationListener = () => {
  if (setupGlobalNotificationListener.initialized && unsubscribeGlobalListener) return;

  unsubscribeGlobalListener?.();
  unsubscribeGlobalListener = onMessageListener(handleGlobalNotification);
  setupGlobalNotificationListener.initialized = !!unsubscribeGlobalListener;
};
setupGlobalNotificationListener.initialized = false;

export const teardownGlobalNotificationListener = () => {
  unsubscribeGlobalListener?.();
  unsubscribeGlobalListener = null;
  setupGlobalNotificationListener.initialized = false;
};

export const listenForNotifications = (callback) => {
  notificationCallbacks.add(callback);
  return () => notificationCallbacks.delete(callback);
};

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post('/notifications/test', { title, body });
  } catch {
    /* ignore */
  }
};
