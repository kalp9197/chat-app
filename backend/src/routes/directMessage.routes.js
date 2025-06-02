import express from "express";
import * as directMessageController from "../controllers/directMessage.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/directMessageValidations.js";
const router = express.Router();

// Send a new direct message
router.post(
  "/",
  authMiddleware,
  validate(Validation.validateSendMessage),
  directMessageController.sendNewDirectMessage
);

// Get messages between two users
router.get(
  "/:receiver_uuid",
  authMiddleware,
  validate(Validation.validateGetMessages),
  validate(Validation.validateMessageOwnership),
  directMessageController.getMessagesBetweenUsers
);

export default router;
