import { prisma } from "../config/database.config.js";

/**
 * Get all users
 * @param {number} currentUserId
 * @returns {Promise<Object[]>} //return users
 */
export const getAllUsers = async (currentUserId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
      },
    });
    return users;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};
