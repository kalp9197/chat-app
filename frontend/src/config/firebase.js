import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
let messagingInstance = null;

const initializeFCM = async () => {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
    } else {
      messagingInstance = null;
    }
  } catch {
    messagingInstance = null;
  }
  return messagingInstance;
};

export const getMessagingInstance = async () => {
  return await initializeFCM();
};

export const firebaseConfigForSW = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const requestNotificationPermission = async () => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        return null;
      }
      const token = await getToken(messaging, { vapidKey });
      return token || null;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export const onMessageListener = async (callback) => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return () => {};
  }
  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      if (callback) callback(payload);
    });
    return unsubscribe;
  } catch {
    return () => {};
  }
};
