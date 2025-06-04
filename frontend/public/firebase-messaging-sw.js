/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

let firebaseConfig = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    firebaseConfig = event.data.config;

    if (firebaseConfig) {
      firebase.initializeApp(firebaseConfig);

      initializeMessaging();
    }

    event.source.postMessage({ type: "SW_FIREBASE_INITIALIZED" });
  }
});

self.clients.matchAll().then((clients) => {
  if (clients && clients.length) {
    clients.forEach((client) => {
      client.postMessage({ type: "SW_READY" });
    });
  }
});

setTimeout(() => {
  if (!firebaseConfig) {
    firebaseConfig = {
      apiKey: "AIzaSyDbcq4vj1qPIUHR4jNq-4HpdqQ94YNTwsc",
      authDomain: "chatapp5503.firebaseapp.com",
      projectId: "chatapp5503",
      storageBucket: "chatapp5503.firebasestorage.app",
      messagingSenderId: "957776005516",
      appId: "1:957776005516:web:868e7aadba0f111bf0aea9",
    };
    firebase.initializeApp(firebaseConfig);

    initializeMessaging();
  }
}, 3000); // Wait 3 seconds for the config before falling back

let messaging = null;

function initializeMessaging() {
  if (!messaging) {
    try {
      messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        const notificationTitle = payload.notification?.title || "New Message";
        const notificationOptions = {
          body: payload.notification?.body || "You have a new message",
          icon: "/notification-icon.png", // Replace with your notification icon
          badge: "/badge-icon.png", // Replace with your badge icon
          data: payload.data,
        };

        self.registration.showNotification(
          notificationTitle,
          notificationOptions
        );
      });

      return true;
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
      return false;
    }
  }
  return !!messaging;
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      })
  );
});
