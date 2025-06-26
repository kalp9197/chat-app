import app from './app.js';
import { PORT } from './constants/env.js';
import http from 'http';
import { initializeWebSocket } from './config/websocket.config.js';

const port = PORT;

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
