import { prisma } from "../config/database.config.js";

export const sendDirectMessage = async (messageData) => {
  try {
    // First get the receiver's ID from their UUID
    const receiver = await prisma.user.findUnique({
      where: { uuid: messageData.receiver_uuid },
      select: { id: true }
    });

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const message = await prisma.directMessage.create({
      data: {
        sender_id: messageData.sender_id,
        receiver_id: receiver.id,
        content: messageData.content,
        message_type: messageData.message_type || 'text'
      },
      include: {
        sender: {
          select: { id: true, uuid: true, name: true }
        },
        receiver: {
          select: { id: true, uuid: true, name: true }
        }
      }
    });
    return message;
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw error;
  }
};

export const getDirectMessages = async (sender_id, receiver_uuid) => {
  try {
    // First get the receiver's ID from their UUID
    const receiver = await prisma.user.findUnique({
      where: { uuid: receiver_uuid },
      select: { id: true }
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
        created_at: "asc",
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
    return messages;
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};

