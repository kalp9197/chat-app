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
        uuid: true,
        content: true,
        created_at: true,
        message_type: true,
        is_active: true,
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

//find a message by uuid
export const findMessageByUuid = async (uuid) => {
  return prisma.message.findUnique({
    where: { uuid, is_active: 1 },
    include: {
      sender: { select: { uuid: true, name: true } },
      receiver: { select: { id: true, uuid: true } },
      group: {
        select: {
          name: true,
          uuid: true,
          memberships: {
            select: { user_id: true },
          },
        },
      },
    },
  });
};

//delete a message by uuid
export const deleteMessageByUuid = async (uuid) => {
  return prisma.message.update({
    where: { uuid },
    data: { is_active: 0 },
  });
};
