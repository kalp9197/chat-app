import express from 'express';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.routes.js';
import directMessageRoutes from './routes/directMessage.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import groupRoutes from './routes/group.routes.js';
import uploadRoutes from './routes/upload.route.js';
import { configureServer } from './config/server.config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configureServer(app);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/direct-messages', directMessageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
