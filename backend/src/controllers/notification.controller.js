import { HTTP_STATUS } from "../constants/statusCodes.js";
import * as notificationService from "../services/notification.service.js";

export const saveUserToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "FCM token is required",
      });
    }

    await notificationService.saveFcmToken(userId, fcm_token);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Title and body are required",
      });
    }

    const result = await notificationService.sendNotification(
      userId,
      title,
      body,
      { type: "test_notification" }
    );

    if (result) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Test notification sent",
      });
    } else {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Failed to send notification",
      });
    }
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
