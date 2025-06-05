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
    console.log('[Service Worker] Received background message:', payload);
    
    // Extract data properly from either payload format
    const data = payload.data || {};
    const notification = payload.notification || {};
    
    // Default notification title and body
    let notificationTitle = notification.title || "New Message";
    let notificationBody = notification.body || "You have a new message";
    
    // Generate URL based on notification type
    let url = "/";
    if (data.type === "chat_message" && data.chatId) {
      url = `/chat/${data.chatId}`;
    }
    
    // Notification options with additional data
    const notificationOptions = {
      body: notificationBody,
      icon: "/notification-icon.png",
      badge: "/badge-icon.png",
      data: {
        ...data,
        url: url,
      },
      // Show message immediately with high priority
      tag: data.messageId || `msg-${Date.now()}`, // Use unique tag or group by conversation
      renotify: true,
      requireInteraction: true,
    };
    
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
  
  // Get URL from notification data or fallback to root
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || "/";

  // Handle chat message notifications specially
  const isChatMessage = notificationData.type === "chat_message";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing client to focus
      for (const client of clientList) {
        // For chat messages, match any client with the chat path
        if (isChatMessage && client.url.includes("/chat")) {
          return client.focus().then(() => {
            // Navigate to the specific chat if necessary
            return client.navigate(urlToOpen);
          });
        }
        // For other notifications, exact URL match
        else if (client.url === urlToOpen && "focus" in client) {
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
