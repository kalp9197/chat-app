import { prisma } from "../config/database.config.js";
import * as notificationService from "./notification.service.js";

export const sendDirectMessage = async (messageData) => {
  try {
    const receiver = await prisma.user.findUnique({
      where: { uuid: messageData.receiver_uuid },
      select: { id: true },
    });

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const message = await prisma.directMessage.create({
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

    const messages = await prisma.directMessage.findMany({
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
    const totalCount = await prisma.directMessage.count({
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
