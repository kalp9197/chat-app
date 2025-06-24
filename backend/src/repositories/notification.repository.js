import { prisma } from '../config/database.config.js';

//update a user's fcm token
export const updateUserFcmToken = async (userId, fcmToken) => {
  return prisma.user.update({
    where: { id: userId },
    data: { fcm_token: fcmToken },
  });
};

//find a user with their fcm token
export const findUserWithFcmToken = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { fcm_token: true },
  });
};

//find a user with their name and uuid
export const findUserWithName = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, uuid: true },
  });
};
