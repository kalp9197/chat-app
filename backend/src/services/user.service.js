import { userRepository } from '../repositories/index.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';

//get all users except the current user
export const getAllUsers = async (currentUserId) => {
  try {
    const users = await userRepository.findAllUsersExcept(currentUserId);
    return users;
  } catch {
    throw new ApiError('Failed to fetch users', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
