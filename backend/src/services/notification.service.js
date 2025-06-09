import { prisma } from "../config/database.config.js";
import { messaging } from "../config/firebase.config.js";

export const saveFcmToken = async (userId, fcmToken) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fcm_token: fcmToken },
    });
    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

export const sendNotification = async (receiverId, title, body, data = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { fcm_token: true },
    });

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

export const sendNewMessageNotification = async (message) => {
  try {
    const sender = await prisma.user.findUnique({
      where: { id: message.sender_id },
      select: { name: true, uuid: true },
    });

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

// Send status update notification to all users
export const sendStatusUpdateNotification = async (
  userId,
  isOnline,
  lastSeen
) => {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, uuid: true },
    });

    if (!user) {
      console.log("User not found");
      return false;
    }

    // Get all other users with FCM tokens
    const recipients = await prisma.user.findMany({
      where: {
        id: { not: userId },
        fcm_token: { not: null },
      },
      select: {
        id: true,
        fcm_token: true,
      },
    });

    if (!recipients.length) {
      console.log("No recipients to notify for status update.");
      return true;
    }

    const tokens = recipients.map((r) => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) {
      console.log("No valid FCM tokens found for status update recipients.");
      return true;
    }

    const statusData = {
      type: "user_status",
      userId: userId.toString(), // Ensure userId is a string
      userUuid: user.uuid, // Should be a string
      isOnline: isOnline.toString(), // Ensure isOnline is a string
      lastSeen: lastSeen ? lastSeen.toISOString() : "", // Ensure lastSeen is a string or empty string
    };

    // Send silent notification (data-only)
    const fcmMessage = {
      tokens: tokens,
      data: statusData,
    };

    await messaging.sendMulticast(fcmMessage);
    return true;
  } catch (error) {
    console.error("Error sending status notification:", error);
    return false;
  }
};
