const VITE_WS_URL = import.meta.env.VITE_WS_URL;

let socket = null;
const listeners = new Map();

const connect = () => {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  socket = new WebSocket(VITE_WS_URL);

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type && listeners.has(data.type)) {
        listeners.get(data.type).forEach((callback) => callback(data.payload));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    // Optional: implement reconnection logic
    socket = null;
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

const on = (eventName, callback) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(callback);
};

const off = (eventName, callback) => {
  if (listeners.has(eventName)) {
    listeners.get(eventName).delete(callback);
  }
};

export const websocketService = {
  connect,
  on,
  off,
};
