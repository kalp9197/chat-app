import * as notificationService from "./notification.service.js";
import {
  directMessageRepository,
  groupRepository,
} from "../repositories/index.js";

const sendDirectMessage = async (messageData) => {
  const receiver = await directMessageRepository.findUserByUuid(
    messageData.receiver_uuid
  );
  if (!receiver) {
    throw new Error("Receiver not found");
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
  if (!group) throw new Error("Group not found or access denied");

  const savedMessage = await groupRepository.sendMessageToGroup(
    group.id,
    {
      content: messageData.content,
      message_type: messageData.message_type,
    },
    messageData.sender_id
  );

  // Notify group members
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

/**
 * Send a new message (direct or group)
 * @param {Object} messageData // message data
 * @returns {Promise<Object>} // return message
 */
export const sendMessage = async (messageData) => {
  try {
    if (messageData.group_uuid) {
      return await sendMessageToGroup(messageData);
    } else if (messageData.receiver_uuid) {
      return await sendDirectMessage(messageData);
    } else {
      throw new Error("Missing receiver_uuid or group_uuid");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get direct messages between users
 * @param {number} sender_id //sender id
 * @param {string} receiver_uuid //receiver uuid
 * @param {number} [limit=10] //limit
 * @param {number} [offset=0] //offset
 * @returns {Promise<{ messages: Object[], totalCount: number }>} //return messages and total count
 */
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
      throw new Error("Receiver not found");
    }

    const messages = await directMessageRepository.findMessages(
      sender_id,
      receiver.id,
      limit,
      offset
    );

    // Get total count for pagination info
    const totalCount = await directMessageRepository.countMessages(
      sender_id,
      receiver.id
    );

    return {
      messages: messages.reverse(), // Reverse to get back to ascending order after getting most recent messages
      totalCount,
    };
  } catch (error) {
    console.error("Error getting direct messages:", error);
    throw error;
  }
};
