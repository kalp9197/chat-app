import * as directMessageService from "../services/directMessage.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

// Send a new message (direct or group)
export const sendMessage = async (req, res) => {
  try {
    const { receiver_uuid, group_uuid, content, message_type } = req.body;
    const sender_id = req.user.id;

    const messageData = {
      sender_id,
      receiver_uuid, // Will be null for group messages
      group_uuid, // Will be null for direct messages
      content,
      message_type,
    };

    const message = await directMessageService.sendMessage(messageData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (
      error.message === "Receiver not found" ||
      error.message === "Group not found or access denied"
    ) {
      statusCode = HTTP_STATUS.NOT_FOUND;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Get messages between users
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_uuid } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit;

    const result = await directMessageService.getDirectMessages(
      sender_id,
      receiver_uuid,
      limit,
      offset
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.messages,
      pagination: {
        total: result.totalCount,
        page,
        limit,
        hasMore: offset + result.messages.length < result.totalCount,
      },
    });
  } catch (error) {
    if (error.message === "Receiver not found") {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Receiver not found",
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
