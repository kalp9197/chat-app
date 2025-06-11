import { prisma } from "../config/database.config.js";

export const findAllUsersExcept = async (userId) => {
  return prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
    },
  });
};

export const findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
    },
  });
};

export const findUserByUuid = async (userUuid) => {
  return prisma.user.findUnique({
    where: { uuid: userUuid },
    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
    },
  });
};
