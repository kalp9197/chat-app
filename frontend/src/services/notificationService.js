import axios from "../lib/axios";
import {
  requestNotificationPermission,
  onMessageListener,
  firebaseConfigForSW,
} from "../config/firebase";

const notificationCallbacks = new Set();
const statusCallbacks = new Set(); // For status update callbacks

export const saveFcmToken = async (token) => {
  try {
    await axios.post("/notifications/token", { fcm_token: token });
    return true;
  } catch {
    return false;
  }
};

export const initializeNotifications = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );

      const sendConfig = () =>
        registration.active?.postMessage({
          type: "FIREBASE_CONFIG",
          config: firebaseConfigForSW,
        });

      if (registration.active) {
        sendConfig();
      } else {
        navigator.serviceWorker.addEventListener(
          "message",
          ({ data, source }) => {
            if (data?.type === "SW_READY")
              source.postMessage({
                type: "FIREBASE_CONFIG",
                config: firebaseConfigForSW,
              });
          }
        );
      }

      const token = await requestNotificationPermission();
      if (token) {
        await saveFcmToken(token);
        setupGlobalNotificationListener();
        return token;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const handleGlobalNotification = (payload) => {
  // Handle user status updates separately
  if (payload?.data?.type === "user_status") {
    handleStatusUpdate(payload.data);
    return;
  }

  // Handle other notifications
  notificationCallbacks.forEach((cb) => cb(payload));
};

// Process user status updates
const handleStatusUpdate = (data) => {
  const statusData = {
    userId: data.userId,
    userUuid: data.userUuid,
    isOnline: data.isOnline === "true", // Convert string back to boolean
    lastSeen: data.lastSeen ? new Date(data.lastSeen) : null,
  };

  statusCallbacks.forEach((cb) => cb(statusData));
};

let unsubscribeGlobalListener = null;

export const setupGlobalNotificationListener = () => {
  if (setupGlobalNotificationListener.initialized && unsubscribeGlobalListener)
    return;

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
  if (typeof callback !== "function") return () => {};
  notificationCallbacks.add(callback);
  return () => notificationCallbacks.delete(callback);
};

// Listen for status updates
export const listenForStatusUpdates = (callback) => {
  if (typeof callback !== "function") return () => {};
  statusCallbacks.add(callback);
  return () => statusCallbacks.delete(callback);
};

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post("/notifications/test", { title, body });
    return true;
  } catch {
    return false;
  }
};
