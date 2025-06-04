import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/token", authMiddleware, notificationController.saveUserToken);

router.post(
  "/test",
  authMiddleware,
  notificationController.sendTestNotification
);

export default router;
