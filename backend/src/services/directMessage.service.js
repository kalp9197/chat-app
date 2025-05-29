import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const sendDirectMessage = async (messageData) => {
  try {
    const message = await prisma.directMessage.create({
      data: messageData,
    });
    return message;
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw error;
  }
};

export const getDirectMessages = async (userId1, userId2) => {
  try {
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 },
        ],
      },
      orderBy: {
        created_at: "asc",
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar_url: true },
        },
        receiver: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });
    return messages;
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};
