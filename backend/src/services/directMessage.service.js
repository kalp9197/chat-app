import { prisma } from "../config/database.config.js";
import * as notificationService from "./notification.service.js";

/**
 * Send a new direct message
 * @param {Object} messageData //message data
 * @returns {Promise<Object>} //return message
 */
export const sendDirectMessage = async (messageData) => {
  try {
    const receiver = await prisma.user.findUnique({
      where: { uuid: messageData.receiver_uuid },
      select: { id: true },
    });

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const message = await prisma.message.create({
      data: {
        sender_id: messageData.sender_id,
        receiver_id: receiver.id,
        content: messageData.content,
        message_type: messageData.message_type || "text",
      },
      include: {
        sender: {
          select: { id: true, uuid: true, name: true },
        },
        receiver: {
          select: { id: true, uuid: true, name: true },
        },
      },
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
    const receiver = await prisma.user.findUnique({
      where: { uuid: receiver_uuid },
      select: { id: true },
    });

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: sender_id, receiver_id: receiver.id },
          { sender_id: receiver.id, receiver_id: sender_id },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
      skip: offset,
      take: limit,
      include: {
        sender: {
          select: { id: true, uuid: true, name: true },
        },
        receiver: {
          select: { id: true, uuid: true, name: true },
        },
      },
    });

    // Get total count for pagination info
    const totalCount = await prisma.message.count({
      where: {
        OR: [
          { sender_id: sender_id, receiver_id: receiver.id },
          { sender_id: receiver.id, receiver_id: sender_id },
        ],
      },
    });

    return {
      messages: messages.reverse(), // Reverse to get back to ascending order after getting most recent messages
      totalCount,
    };
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};
