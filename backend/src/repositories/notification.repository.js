import { prisma } from "../config/database.config.js";

export const updateUserFcmToken = async (userId, fcmToken) => {
  return prisma.user.update({
    where: { id: userId },
    data: { fcm_token: fcmToken },
  });
};

export const findUserWithFcmToken = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { fcm_token: true },
  });
};

export const findUserWithName = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, uuid: true },
  });
};
