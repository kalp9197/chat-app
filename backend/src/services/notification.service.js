import { prisma } from "../config/database.config.js";
import { messaging } from "../config/firebase.config.js";


export const saveFcmToken = async (userId, fcmToken) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fcm_token: fcmToken }
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
      select: { fcm_token: true }
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
          Urgency: 'high'
        },
        notification: {
          icon: '/notification-icon.png',
          click_action: `${process.env.ORIGIN_URL}/chat`,
        },
        fcm_options: {
          link: `${process.env.ORIGIN_URL}/chat`
        }
      }
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
      select: { name: true }
    });


    const title = `New message from ${sender.name}`;
    const body = message.content.length > 100 
      ? `${message.content.substring(0, 97)}...` 
      : message.content;
    

    const data = {
      messageId: message.id.toString(),
      senderId: message.sender_id.toString(),
      type: 'new_message'
    };


    return await sendNotification(message.receiver_id, title, body, data);
  } catch (error) {
    console.error("Error sending new message notification:", error);
    return false;
  }
};
