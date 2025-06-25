import axios from '@/lib/axios';
import { onMessageListener, requestNotificationPermission } from '../config/firebase';

let notificationCallbacks = new Set();

export const saveFcmToken = async (token) => {
  await axios.post('/notifications/token', { fcm_token: token });
};

export const initializeNotifications = async () => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const token = await requestNotificationPermission();
    if (token) {
      await saveFcmToken(token);
      setupGlobalNotificationListener();
      return token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const handleGlobalNotification = (payload) => {
  notificationCallbacks.forEach((cb) => cb(payload));
};

let unsubscribeGlobalListener = null;

export const setupGlobalNotificationListener = () => {
  if (setupGlobalNotificationListener.initialized && unsubscribeGlobalListener) {
    return;
  }
  unsubscribeGlobalListener?.();
  onMessageListener(handleGlobalNotification)
    .then((unsubscribe) => {
      unsubscribeGlobalListener = unsubscribe;
      setupGlobalNotificationListener.initialized = !!unsubscribe;
    })
    .catch(() => {
      setupGlobalNotificationListener.initialized = false;
    });
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
  } catch (error) {
    // ignore
  }
};
