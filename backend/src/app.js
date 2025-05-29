import express from "express";
import authRoutes from "./routes/auth.route.js";
import { configureServer } from "./config/server.config.js";

const app = express();

configureServer(app);

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
