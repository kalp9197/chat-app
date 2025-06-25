import express from 'express';
import * as directMessageController from '../controllers/directMessage.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as Validation from '../validations/directMessageValidations.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validate(Validation.validateSendMessage),
  directMessageController.sendMessage,
);

router.get(
  '/:receiver_uuid',
  authMiddleware,
  validate(Validation.validateGetMessages),
  validate(Validation.validateMessageOwnership),
  directMessageController.getMessagesBetweenUsers,
);

router.delete(
  '/message/:message_uuid',
  authMiddleware,
  validate(Validation.validateDeleteMessage),
  directMessageController.deleteMessage,
);

export default router;
