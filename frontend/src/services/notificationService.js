
import axios from '../lib/axios';
import { requestNotificationPermission, onMessageListener, firebaseConfigForSW } from '../config/firebase';


export const saveFcmToken = async (token) => {
  try {
    // Your axios baseURL is set to http://localhost:8000/api in .env
    // So we only need to add the path after /api
    const response = await axios.post('/v1/notifications/token', { fcm_token: token });
    console.log('FCM token saved successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};


export const initializeNotifications = async () => {

  if ('serviceWorker' in navigator) {
    try {

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered');
      

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
        console.log('FCM Token:', token);

        await saveFcmToken(token);
        return token;
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.warn('Push notifications not supported in this browser');
  }
  return null;
};


export const setupForegroundNotifications = (callback) => {
  return onMessageListener()
    .then((payload) => {
      console.log('Received foreground message:', payload);
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
      return payload;
    })
    .catch((err) => {
      console.error('Error receiving message:', err);
      return null;
    });
};

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post('/api/notifications/test', { title, body });
    return true;
  } catch (error) {
    console.error('Error triggering test notification:', error);
    return false;
  }
};
