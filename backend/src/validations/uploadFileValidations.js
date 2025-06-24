import { body } from 'express-validator';

export const validateUploadFile = [
  body('data').notEmpty().withMessage('File is required'),
  body('type').notEmpty().withMessage('File type is required'),
  body('fileName').notEmpty().withMessage('File name is required'),
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
];
