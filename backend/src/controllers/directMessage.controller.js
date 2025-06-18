import * as directMessageService from "../services/directMessage.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { ApiError } from "../utils/apiError.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiver_uuid, group_uuid, content, message_type } = req.body;
    const sender_id = req.user.id;

    const messageData = {
      sender_id,
      receiver_uuid,
      group_uuid,
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
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

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
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
