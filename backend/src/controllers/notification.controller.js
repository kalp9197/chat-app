import { HTTP_STATUS } from '../constants/statusCodes.js';
import * as notificationService from '../services/notification.service.js';
import { ApiError } from '../errors/apiError.js';

//save a user's fcm token
export const saveUserToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await notificationService.saveFcmToken(userId, fcm_token);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'FCM token saved successfully',
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//send a test notification
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    const result = await notificationService.sendNotification(userId, title, body, {
      type: 'test_notification',
    });

    if (result) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Test notification sent',
      });
    } else {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to send notification',
      });
    }
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
