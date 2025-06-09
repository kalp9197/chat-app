import * as userService from "../services/user.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await userService.getAllUsers(currentUserId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user's online status
export const updateStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;

    if (isOnline === undefined) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "isOnline parameter is required",
      });
    }

    await userService.updateUserStatus(userId, isOnline);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's status
export const getStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "User ID is required",
      });
    }

    const status = await userService.getUserStatus(userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      status,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
