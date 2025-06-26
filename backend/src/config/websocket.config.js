import { WebSocketServer } from 'ws';

let wssInstance;

export const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  wssInstance = wss;

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
};

export const broadcast = (data) => {
  if (!wssInstance) return;
  const message = JSON.stringify(data);
  wssInstance.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};
