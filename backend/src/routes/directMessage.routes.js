import express from "express";
import * as directMessageController from "../controllers/directMessage.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateSendMessage,
  validateGetMessages,
  validateMessageOwnership,
} from "../validations/directMessage.validations.js";

const router = express.Router();

// Send a new direct message
router.post(
  "/",
  authMiddleware,
  validateSendMessage,
  directMessageController.sendNewDirectMessage
);

// Get messages between two users
router.get(
  "/:userId2",
  authMiddleware,
  validateGetMessages,
  validateMessageOwnership,
  directMessageController.getMessagesBetweenUsers
);

export default router;
