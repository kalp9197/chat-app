import { body, param } from 'express-validator';

export const validateSendMessage = [
  body('receiver_uuid').optional().isUUID(4).withMessage('Receiver UUID must be a valid UUID'),
  body('group_uuid').optional().isUUID(4).withMessage('Group UUID must be a valid UUID'),
  body().custom((value, { req }) => {
    const { receiver_uuid, group_uuid } = req.body;
    if (!receiver_uuid && !group_uuid) {
      throw new Error('Either receiver_uuid or group_uuid is required');
    }
    if (receiver_uuid && group_uuid) {
      throw new Error('Cannot provide both receiver_uuid and group_uuid');
    }
    return true;
  }),
  body('content').notEmpty().withMessage('Content is required'),
  body('message_type')
    .optional()
    .isString()
    .withMessage('Message type must be a string')
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
];

export const validateGetMessages = [
  param('receiver_uuid')
    .notEmpty()
    .withMessage('Receiver UUID is required')
    .withMessage('Receiver UUID must be a valid UUID'),
];

export const validateMessageOwnership = [
  param('receiver_uuid')
    .notEmpty()
    .withMessage('Receiver UUID is required')
    .withMessage('Receiver UUID must be a valid UUID'),
];
