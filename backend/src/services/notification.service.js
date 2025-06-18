import { notificationRepository } from "../repositories/index.js";
import { messaging } from "../config/firebase.config.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { apiError } from "../utils/apiError.js";

export const saveFcmToken = async (userId, fcmToken) => {
  try {
    await notificationRepository.updateUserFcmToken(userId, fcmToken);
    return true;
  } catch {
    throw new apiError(
      "Error saving FCM token",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const sendNotification = async (receiverId, title, body, data = {}) => {
  try {
    const user = await notificationRepository.findUserWithFcmToken(receiverId);

    if (!user || !user.fcm_token) {
      return false;
    }

    const message = {
      token: user.fcm_token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          icon: "/notification-icon.png",
          click_action: `${process.env.ORIGIN_URL}/chat`,
        },
        fcm_options: {
          link: `${process.env.ORIGIN_URL}/chat`,
        },
      },
    };

    await messaging.send(message);
    return true;
  } catch {
    throw new apiError(
      "Error sending notification",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const sendNewMessageNotification = async (message) => {
  try {
    const sender = await notificationRepository.findUserWithName(
      message.sender_id
    );

    const title = `New message from ${sender.name}`;
    const body =
      message.content.length > 100
        ? `${message.content.substring(0, 97)}...`
        : message.content;

    const data = {
      messageId: message.id.toString(),
      senderId: message.sender_id.toString(),
      senderUuid: sender.uuid,
      type: "chat_message",
      chatId: `user-${sender.uuid}`,
    };

    return await sendNotification(message.receiver_id, title, body, data);
  } catch {
    throw new apiError(
      "Error sending new message notification",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
