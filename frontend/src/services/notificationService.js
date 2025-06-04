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

// Store the unsubscribe function for the global listener
let unsubscribeGlobalListener = null;

// Set up a single global message listener
export const setupGlobalNotificationListener = () => {
  // If already initialized and listener exists, don't re-initialize without teardown
  if (setupGlobalNotificationListener.initialized && unsubscribeGlobalListener) {
    console.log("Global notification listener is already active.");
    return;
  }

  // If a previous listener exists (e.g., from a hot reload or previous init), clean it up
  if (unsubscribeGlobalListener) {
    console.log("Cleaning up previous global notification listener.");
    unsubscribeGlobalListener();
    unsubscribeGlobalListener = null;
  }

  console.log("Setting up global notification listener...");
  // Pass handleGlobalNotification as the callback directly
  // onMessageListener from firebase.js now returns the unsubscribe function
  unsubscribeGlobalListener = onMessageListener(handleGlobalNotification);

  if (unsubscribeGlobalListener) {
    console.log("Global notification listener set up successfully.");
    setupGlobalNotificationListener.initialized = true;
  } else {
    // This might occur if onMessageListener itself had an issue setting up (though unlikely with current Firebase SDK)
    console.error("Failed to set up global notification listener.");
    setupGlobalNotificationListener.initialized = false;
  }
};
setupGlobalNotificationListener.initialized = false; // Initialize the static property

// Function to tear down the global listener (e.g., on logout)
export const teardownGlobalNotificationListener = () => {
  if (unsubscribeGlobalListener) {
    console.log("Tearing down global notification listener.");
    unsubscribeGlobalListener();
    unsubscribeGlobalListener = null;
    setupGlobalNotificationListener.initialized = false;
  }
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
