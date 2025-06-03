import * as userService from "../services/user.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await userService.getAllUsers(currentUserId);
    
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};