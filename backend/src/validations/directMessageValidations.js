import { body, param } from 'express-validator';

export const validateSendMessage = [
  body('receiver_uuid')
    .notEmpty().withMessage('Receiver UUID is required')
    .isUUID(4).withMessage('Receiver UUID must be a valid UUID'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Content must be a string'),
  body('message_type')
    .optional()
    .isString().withMessage('Message type must be a string')
    .isIn(['text', 'image', 'file']).withMessage('Invalid message type'),
];

export const validateGetMessages = [
  param('receiver_uuid')
    .notEmpty().withMessage('Receiver UUID is required')
    .isUUID(4).withMessage('Receiver UUID must be a valid UUID'),
];

export const validateMessageOwnership = [
  param('receiver_uuid')
    .notEmpty().withMessage('Receiver UUID is required')
    .isUUID(4).withMessage('Receiver UUID must be a valid UUID'),
];
