import axios from "../lib/axios";
import {
  requestNotificationPermission,
  onMessageListener,
  firebaseConfigForSW,
} from "../config/firebase";

// Keep a registry of notification callbacks
const notificationCallbacks = new Set();

export const saveFcmToken = async (token) => {
  try {
    // Your axios baseURL is set to http://localhost:8000/api/v1 in .env
    // So we only need to add the path after /api/v1
    await axios.post("/notifications/token", { fcm_token: token });
    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return false;
  }
};

export const initializeNotifications = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
        }
      );

      // Pass Firebase config to the service worker
      if (registration.active) {
        registration.active.postMessage({
          type: "FIREBASE_CONFIG",
          config: firebaseConfigForSW,
        });
      } else {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "SW_READY") {
            event.source.postMessage({
              type: "FIREBASE_CONFIG",
              config: firebaseConfigForSW,
            });
          }
        });
      }

      // Request notification permission and get FCM token
      const token = await requestNotificationPermission();

      if (token) {
        await saveFcmToken(token);

        // Set up global notification listener
        setupGlobalNotificationListener();

        return token;
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  } else {
    console.warn("Service workers not supported in this browser");
  }
  return null;
};

// Global notification handler that distributes notifications to all registered callbacks
const handleGlobalNotification = (payload) => {
  // Share the notification with all registered callbacks
  notificationCallbacks.forEach((callback) => {
    try {
      callback(payload);
    } catch (error) {
      console.error("Error in notification callback:", error);
    }
  });
};

// Set up a single global message listener
export const setupGlobalNotificationListener = () => {
  // We only set this up once
  if (setupGlobalNotificationListener.initialized) return;

  // Set up a single listener for all components
  onMessageListener()
    .then(handleGlobalNotification)
    .catch((error) => {
      console.error("Error in global message listener:", error);

      // Try to recreate the listener after an error
      setTimeout(setupGlobalNotificationListener, 5000);
    });

  setupGlobalNotificationListener.initialized = true;
};

// Each component can register its callback
export const listenForNotifications = (callback) => {
  if (!callback || typeof callback !== "function") {
    return () => {}; // Return empty unsubscribe function
  }

  // Add this callback to our registry
  notificationCallbacks.add(callback);

  // Return an unsubscribe function
  return () => {
    notificationCallbacks.delete(callback);
  };
};

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post("/notifications/test", { title, body });
    return true;
  } catch (error) {
    console.error("Error sending test notification:", error);
    return false;
  }
};
