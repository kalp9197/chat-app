import { prisma } from "../config/database.config.js";

export const getAllUsers = async (currentUserId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        online: true,
        last_seen: true
      }
    });
    return users;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};