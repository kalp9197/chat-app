import { notificationRepository } from "../repositories/index.js";
import { messaging } from "../config/firebase.config.js";

/**
 * Save FCM token for a user
 * @param {number} userId //user id
 * @param {string} fcmToken //FCM token
 * @returns {Promise<boolean>} //return true if success
 */
export const saveFcmToken = async (userId, fcmToken) => {
  try {
    await notificationRepository.updateUserFcmToken(userId, fcmToken);
    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

/**
 * Send a notification to a user
 * @param {number} receiverId //user id
 * @param {string} title //notification title
 * @param {string} body //notification body
 * @param {Object} data //notification data
 * @returns {Promise<boolean>} //return true if success
 */
export const sendNotification = async (receiverId, title, body, data = {}) => {
  try {
    const user = await notificationRepository.findUserWithFcmToken(receiverId);

    if (!user || !user.fcm_token) {
      console.log("User has no FCM token");
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

    const response = await messaging.send(message);
    console.log("Successfully sent notification:", response);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

/**
 * Send a new message notification
 * @param {Object} message
 * @returns {Promise<boolean>}
 */
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
      chatId: `user-${sender.uuid}`, // Format to match frontend chat ID format
    };

    return await sendNotification(message.receiver_id, title, body, data);
  } catch (error) {
    console.error("Error sending new message notification:", error);
    return false;
  }
};
