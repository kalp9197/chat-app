import { prisma } from '../config/database.config.js';

//find all users except the current user
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

//find a user by id
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

//find a user by uuid
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
