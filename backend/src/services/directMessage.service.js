import * as notificationService from "./notification.service.js";
import { directMessageRepository } from "../repositories/index.js";

/**
 * Send a new direct message
 * @param {Object} messageData //message data
 * @returns {Promise<Object>} //return message
 */
export const sendDirectMessage = async (messageData) => {
  try {
    const receiver = await directMessageRepository.findUserByUuid(
      messageData.receiver_uuid
    );

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const message = await directMessageRepository.createMessage({
      sender_id: messageData.sender_id,
      receiver_id: receiver.id,
      content: messageData.content,
      message_type: messageData.message_type || "text",
    });

    await notificationService.sendNewMessageNotification(message);

    return message;
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw error;
  }
};

/**
 * Get direct messages between users
 * @param {number} sender_id //sender id
 * @param {string} receiver_uuid //receiver uuid
 * @param {number} [limit=10] //limit
 * @param {number} [offset=0] //offset
 * @returns {Promise<{ messages: Object[], totalCount: number }>} //return messages and total count
 */
export const getDirectMessages = async (
  sender_id,
  receiver_uuid,
  limit = 10,
  offset = 0
) => {
  try {
    const receiver =
      await directMessageRepository.findUserByUuid(receiver_uuid);

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const messages = await directMessageRepository.findMessages(
      sender_id,
      receiver.id,
      limit,
      offset
    );

    // Get total count for pagination info
    const totalCount = await directMessageRepository.countMessages(
      sender_id,
      receiver.id
    );

    return {
      messages: messages.reverse(), // Reverse to get back to ascending order after getting most recent messages
      totalCount,
    };
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};
