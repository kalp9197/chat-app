import { prisma } from '../config/database.config.js';

//create a new user
export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

//find a user by email
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};
