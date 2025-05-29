import { body, param, query } from 'express-validator';
import { validationResult } from 'express-validator';

export const validateSendMessage = [
  body('receiver_id')
    .notEmpty().withMessage('Receiver ID is required')
    .isInt({ min: 1 }).withMessage('Receiver ID must be a positive integer')
    .toInt(),
  body('content')
    .if((value, { req }) => !req.body.file_url)
    .notEmpty().withMessage('Content is required when no file is attached'),
  body('message_type')
    .optional()
    .isString().withMessage('Message type must be a string'),
  body('file_url')
    .optional()
    .isURL().withMessage('File URL must be a valid URL'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateGetMessages = [
  param('userId2')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateMessageOwnership = [
  (req, res, next) => {
    if (req.user.id === parseInt(req.params.userId2)) {
      return res.status(400).json({ 
        errors: [{
          msg: 'Cannot fetch messages with yourself using this endpoint',
          param: 'userId2'
        }]
      });
    }
    next();
  }
];
