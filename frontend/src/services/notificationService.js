
import axios from '../lib/axios';
import { requestNotificationPermission, onMessageListener, firebaseConfigForSW } from '../config/firebase';


export const saveFcmToken = async (token) => {
  try {
    // Your axios baseURL is set to http://localhost:8000/api/v1 in .env
    // So we only need to add the path after /api/v1
    await axios.post('/notifications/token', { fcm_token: token });
    return true;
  } catch {
    // Silent fail for FCM token errors
    return false;
  }
};


export const initializeNotifications = async () => {

  if ('serviceWorker' in navigator) {
    try {

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      

      if (registration.active) {

        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfigForSW
        });
      } else {

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_READY') {
            event.source.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfigForSW
            });
          }
        });
      }
      

      const token = await requestNotificationPermission();
      
      if (token) {

        await saveFcmToken(token);
        return token;
      }
    } catch {
      // Silent fail for service worker registration
    }
  } else {
    // Push notifications not supported
  }
  return null;
};


export const setupForegroundNotifications = (callback) => {
  return onMessageListener()
    .then((payload) => {
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
      return payload;
    })
    .catch(() => {
      // Silent fail for message errors
      return null;
    });
};

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post('/notifications/test', { title, body });
    return true;
  } catch {
    // Silent fail for test notification errors
    return false;
  }
};
