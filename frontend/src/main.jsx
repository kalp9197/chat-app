import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Mount React App
createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);

// Register Service Worker after the app mounts
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "✅ Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error);
      });
  });
}
