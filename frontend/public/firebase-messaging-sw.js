/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// OPTIONAL: Replace this with your config dynamically if you want.
// Otherwise, hardcoding is fine if you know it's public.
const firebaseConfig = {
  apiKey: "AIzaSyDbcq4vj1qPIUHR4jNq-4HpdqQ94YNTwsc",
  authDomain: "chatapp5503.firebaseapp.com",
  projectId: "chatapp5503",
  storageBucket: "chatapp5503.appspot.com",
  messagingSenderId: "957776005516",
  appId: "1:957776005516:web:868e7aadba0f111bf0aea9",
  vapidKey: "BAU9dLojWgLiAeaZ2fUYuwUniwbQ_CmElRdu2cSqn4zgvcp7tTq7BqPXd18J1akxmjwnO5YVadnUZI8Sz50ViRI",
};

// Init Firebase app (prevent duplicate init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Init Messaging
let messaging = null;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.error("FCM messaging init error:", err);
}

// Handle background push
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    // Show notification
    const notificationTitle = payload.notification?.title || "New Message";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new message",
      icon: "/notification-icon.png", // Absolute path recommended
      badge: "/badge-icon.png",
      data: payload.data || {}, // Keep any custom data
      // Add any additional options here
    };
    console.log('[Service Worker] Received background message: ', payload);
    // IMPORTANT: Return the promise from showNotification to ensure the SW stays active.
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .catch(err => {
        console.error('[Service Worker] Error showing notification:', err);
      });
  });
}

// Send "ready" message to client on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "SW_READY" });
      });
    })
  );
});

// Notification click event - open or focus window, optionally with deep link
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/"; // Set url in notification payload

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus if already open
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// (OPTIONAL) Listen for config from client for dynamic config, else use above
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG" && event.data.config) {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config);
    }
    // (Re)initialize messaging
    try {
      messaging = firebase.messaging();
    } catch (err) {
      console.error("Error re-initializing messaging:", err);
    }
    // Acknowledge
    event.source?.postMessage?.({ type: "SW_FIREBASE_INITIALIZED" });
  }
});
