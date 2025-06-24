import { prisma } from '../config/database.config.js';

//find a user by uuid
export const findUserByUuid = async (uuid) => {
  return prisma.user.findUnique({
    where: { uuid },
    select: { id: true },
  });
};

//create a new message
export const createMessage = async (messageData) => {
  return prisma.message.create({
    data: {
      sender_id: messageData.sender_id,
      receiver_id: messageData.receiver_id,
      content: messageData.content,
      message_type: messageData.message_type || 'text',
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

//find messages between two users
export const findMessages = async (senderId, receiverId, limit = 10, offset = 0) => {
  const whereClause = {
    OR: [
      { sender_id: senderId, receiver_id: receiverId },
      { sender_id: receiverId, receiver_id: senderId },
    ],
  };

  const [messages, totalCount] = await prisma.$transaction([
    prisma.message.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
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
    }),
    prisma.message.count({ where: whereClause }),
  ]);

  return { messages, totalCount };
};
