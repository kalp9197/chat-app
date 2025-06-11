import { prisma } from "../config/database.config.js";

export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};
