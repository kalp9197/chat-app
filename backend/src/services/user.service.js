import { userRepository } from "../repositories/index.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { apiError } from "../utils/apiError.js";

export const getAllUsers = async (currentUserId) => {
  try {
    const users = await userRepository.findAllUsersExcept(currentUserId);
    return users;
  } catch {
    throw new apiError(
      "Failed to fetch users",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
