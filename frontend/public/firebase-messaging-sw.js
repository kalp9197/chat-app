/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDbcq4vj1qPIUHR4jNq-4HpdqQ94YNTwsc",
  authDomain: "chatapp5503.firebaseapp.com",
  projectId: "chatapp5503",
  storageBucket: "chatapp5503.appspot.com",
  messagingSenderId: "957776005516",
  appId: "1:957776005516:web:868e7aadba0f111bf0aea9",
  vapidKey: "BAU9dLojWgLiAeaZ2fUYuwUniwbQ_CmElRdu2cSqn4zgvcp7tTq7BqPXd18J1akxmjwnO5YVadnUZI8Sz50ViRI",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch {
  // Messaging init failed
}

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const notification = payload.notification || {};

    let notificationTitle = notification.title || "New Message";
    let notificationBody = notification.body || "You have a new message";

    let url = "/";
    if (data.type === "chat_message" && data.chatId) {
      url = `/chat/${data.chatId}`;
    }

    const notificationOptions = {
      body: notificationBody,
      icon: "/notification-icon.png",
      badge: "/badge-icon.png",
      data: {
        ...data,
        url: url,
      },
      tag: data.messageId || `msg-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "SW_READY" });
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || "/";
  const isChatMessage = notificationData.type === "chat_message";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (isChatMessage && client.url.includes("/chat")) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          } else if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("message", (event) => {
  if (
    event.data &&
    event.data.type === "FIREBASE_CONFIG" &&
    event.data.config
  ) {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config);
    }
    try {
      messaging = firebase.messaging();
    } catch {
      // Error re-initializing messaging
    }
    event.source?.postMessage?.({ type: "SW_FIREBASE_INITIALIZED" });
  }
});
