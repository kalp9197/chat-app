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
      .then(() => {
        console.log("Service Worker registered successfully");
      })
      .catch(() => {
        console.log("Service Worker registration failed");
      });
  });
}
