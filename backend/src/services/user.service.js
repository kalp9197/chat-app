import { userRepository } from "../repositories/index.js";

/**
 * Get all users
 * @param {number} currentUserId
 * @returns {Promise<Object[]>} //return users
 */
export const getAllUsers = async (currentUserId) => {
  try {
    const users = await userRepository.findAllUsersExcept(currentUserId);
    return users;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};
