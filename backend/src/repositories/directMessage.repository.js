import { prisma } from "../config/database.config.js";

export const findUserByUuid = async (uuid) => {
  return prisma.user.findUnique({
    where: { uuid },
    select: { id: true },
  });
};

export const createMessage = async (messageData) => {
  return prisma.message.create({
    data: {
      sender_id: messageData.sender_id,
      receiver_id: messageData.receiver_id,
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
};

export const findMessages = async (
  senderId,
  receiverId,
  limit = 10,
  offset = 0
) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId },
      ],
    },
    orderBy: {
      created_at: "desc",
    },
    skip: offset,
    take: limit,
    select: {
      id: true,
      content: true,
      created_at: true,
      message_type: true,
      sender: {
        select: { id: true, uuid: true, name: true },
      },
      receiver: {
        select: { id: true, uuid: true, name: true },
      },
    },
  });

  return messages;
};

export const countMessages = async (senderId, receiverId) => {
  return prisma.message.count({
    where: {
      OR: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId },
      ],
    },
  });
};
