import express from "express";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.routes.js";
import directMessageRoutes from "./routes/directMessage.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { configureServer } from "./config/server.config.js";

const app = express();

configureServer(app);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/direct-messages", directMessageRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
