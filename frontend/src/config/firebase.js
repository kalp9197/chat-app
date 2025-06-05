import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

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

// Asynchronously check for support and initialize messaging
const initializeFCM = async () => {
  if (messagingInstance) return messagingInstance; // Already initialized

  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      console.log("Firebase Messaging is supported and initialized.");
    } else {
      console.log("Firebase Messaging is not supported in this browser.");
      messagingInstance = null;
    }
  } catch (error) {
    console.error("Error checking FCM support or initializing messaging:", error);
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
    console.warn("Firebase Messaging not available, cannot request permission.");
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error("VAPID key is missing in environment variables");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        return token;
      } else {
        console.error("Failed to get FCM token");
      }
    } else {
      console.warn("Notification permission denied");
    }
    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

export const onMessageListener = async (callback) => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn("Firebase Messaging not available, cannot set up onMessage listener.");
    return () => {}; // Return a no-op unsubscriber function
  }
  console.log("Setting up foreground message listener...");
  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    if (callback) {
      callback(payload);
    }
  });
  // onMessage returns an unsubscribe function. 
  // The component using this listener should handle unsubscribing on unmount.
};
