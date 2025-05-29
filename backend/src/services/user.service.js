import { prisma } from '../config/prisma.config.js';

export const findUserById = async (id) => prisma.user.findUnique({ where: { id } });

export const updateUser = async (id, data) => prisma.user.update({ where: { id }, data });

export const deleteUser = async (id) => prisma.user.delete({ where: { id } });

export const listUsers = async (skip = 0, take = 10) => prisma.user.findMany({
  skip,
  take,
  select: {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true
  }
});
