import * as notificationService from "./notification.service.js";
import {
  directMessageRepository,
  groupRepository,
} from "../repositories/index.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { ApiError } from "../utils/apiError.js";

const sendDirectMessage = async (messageData) => {
  const receiver = await directMessageRepository.findUserByUuid(
    messageData.receiver_uuid
  );
  if (!receiver) {
    throw new ApiError("Receiver not found", HTTP_STATUS.NOT_FOUND);
  }

  const message = await directMessageRepository.createMessage({
    sender_id: messageData.sender_id,
    receiver_id: receiver.id,
    content: messageData.content,
    message_type: messageData.message_type || "text",
  });

  await notificationService.sendNewMessageNotification(message);
  return message;
};

const sendMessageToGroup = async (messageData) => {
  const group = await groupRepository.findGroupByUuid(
    messageData.group_uuid,
    messageData.sender_id
  );
  if (!group)
    throw new ApiError(
      "Group not found or access denied",
      HTTP_STATUS.NOT_FOUND
    );

  const savedMessage = await groupRepository.sendMessageToGroup(
    group.id,
    {
      content: messageData.content,
      message_type: messageData.message_type,
    },
    messageData.sender_id
  );

  try {
    const title = `New message in ${group.name}`;
    const body = savedMessage.content.substring(0, 100);
    const notificationData = {
      messageId: savedMessage.id.toString(),
      senderId: savedMessage.sender_id.toString(),
      type: "chat_message",
      chatId: `group-${group.uuid}`,
    };

    for (const member of group.memberships) {
      if (member.user_id !== messageData.sender_id) {
        await notificationService.sendNotification(
          member.user_id,
          title,
          body,
          notificationData
        );
      }
    }
  } catch (error) {
    console.error("Failed to send group message notifications", error);
  }

  return savedMessage;
};

export const sendMessage = async (messageData) => {
  try {
    if (messageData.group_uuid) {
      return await sendMessageToGroup(messageData);
    } else if (messageData.receiver_uuid) {
      return await sendDirectMessage(messageData);
    } else {
      throw new ApiError(
        "Missing receiver_uuid or group_uuid",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getDirectMessages = async (
  sender_id,
  receiver_uuid,
  limit = 10,
  offset = 0
) => {
  try {
    const receiver =
      await directMessageRepository.findUserByUuid(receiver_uuid);

    if (!receiver) {
      throw new ApiError("Receiver not found", HTTP_STATUS.NOT_FOUND);
    }

    const messages = await directMessageRepository.findMessages(
      sender_id,
      receiver.id,
      limit,
      offset
    );

    const totalCount = await directMessageRepository.countMessages(
      sender_id,
      receiver.id
    );

    return {
      messages: messages.reverse(),
      totalCount,
    };
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};
