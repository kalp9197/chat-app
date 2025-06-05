import axios from "../lib/axios";
import {
  requestNotificationPermission,
  onMessageListener,
  firebaseConfigForSW,
} from "../config/firebase";

const notificationCallbacks = new Set();

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
  notificationCallbacks.forEach((cb) => cb(payload));
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

export const triggerTestNotification = async (title, body) => {
  try {
    await axios.post("/notifications/test", { title, body });
    return true;
  } catch {
    return false;
  }
};
