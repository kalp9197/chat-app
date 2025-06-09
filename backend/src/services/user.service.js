import { prisma } from "../config/database.config.js";
import * as notificationService from "./notification.service.js";

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
        online: true,
        last_seen: true,
      },
    });
    return users;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};

// Update user's online status and last seen timestamp
export const updateUserStatus = async (userId, isOnline) => {
  try {
    const data = {
      online: isOnline,
    };

    // If going offline, update last_seen to current time
    if (!isOnline) {
      data.last_seen = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        online: true,
        last_seen: true,
      },
    });

    // Send status update notification to all users
    await notificationService.sendStatusUpdateNotification(
      userId,
      updatedUser.online,
      updatedUser.last_seen
    );

    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status");
  }
};

// Get user's status (online and last_seen)
export const getUserStatus = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        online: true,
        last_seen: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw new Error("Failed to fetch user status");
  }
};
