import * as notificationService from './notification.service.js';
import { directMessageRepository, groupRepository } from '../repositories/index.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../../public');

//send a direct message
const sendDirectMessage = async (messageData) => {
  const receiver = await directMessageRepository.findUserByUuid(messageData.receiver_uuid);
  if (!receiver) {
    throw new ApiError('Receiver not found', HTTP_STATUS.NOT_FOUND);
  }

  const message = await directMessageRepository.createMessage({
    sender_id: messageData.sender_id,
    receiver_id: receiver.id,
    content: messageData.content,
    message_type: messageData.message_type || 'text',
    file_path: messageData.file_path,
  });

  await notificationService.sendNewMessageNotification(message);
  return message;
};

//send a message to a group
const sendMessageToGroup = async (messageData) => {
  const group = await groupRepository.findGroupByUuid(
    messageData.group_uuid,
    messageData.sender_id,
  );
  if (!group) throw new ApiError('Group not found or access denied', HTTP_STATUS.NOT_FOUND);

  const savedMessage = await groupRepository.sendMessageToGroup(
    group.id,
    {
      content: messageData.content,
      message_type: messageData.message_type,
      file_path: messageData.file_path,
    },
    messageData.sender_id,
  );

  try {
    const title = `New message in ${group.name}`;
    const body = savedMessage.content.substring(0, 100);
    const notificationData = {
      messageId: savedMessage.id.toString(),
      senderId: savedMessage.sender_id.toString(),
      type: 'chat_message',
      chatId: `group-${group.uuid}`,
    };

    for (const member of group.memberships) {
      if (member.user_id !== messageData.sender_id) {
        await notificationService.sendNotification(member.user_id, title, body, notificationData);
      }
    }
  } catch (error) {
    console.error('Failed to send group message notifications', error);
  }

  return savedMessage;
};

//send a message to a user or group
export const sendMessage = async (messageData) => {
  try {
    if (messageData.group_uuid) {
      return await sendMessageToGroup(messageData);
    } else if (messageData.receiver_uuid) {
      return await sendDirectMessage(messageData);
    } else {
      throw new ApiError('Missing receiver_uuid or group_uuid', HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

//get direct messages between two users
export const getDirectMessages = async (sender_id, receiver_uuid, limit = 10, offset = 0) => {
  try {
    const receiver = await directMessageRepository.findUserByUuid(receiver_uuid);

    if (!receiver) {
      throw new ApiError('Receiver not found', HTTP_STATUS.NOT_FOUND);
    }

    const { messages, totalCount } = await directMessageRepository.findMessages(
      sender_id,
      receiver.id,
      limit,
      offset,
    );

    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        if (message.is_active === 0) {
          return {
            ...message,
            content: 'This message was deleted',
            message_type: 'text',
          };
        }
        if (message.message_type === 'file') {
          let content;
          try {
            content = JSON.parse(message.content);
          } catch (e) {
            console.error(
              `Failed to parse message content for message ${message.id}: ${e.message}`,
            );
            return {
              ...message,
              content: {
                fileName: 'Invalid File',
                error: 'Corrupted message data',
              },
            };
          }
          if (content.filePath) {
            try {
              const fullPath = path.join(PUBLIC_DIR, content.filePath);
              const fileData = await fs.readFile(fullPath);
              content.data = fileData.toString('base64');

              delete content.filePath;
            } catch (err) {
              console.error(`Failed to read file for message ${message.id}: ${err.message}`);
              content.data = null;
              content.error = 'File not found';
              delete content.filePath;
            }
          }
          return { ...message, content };
        }
        return message;
      }),
    );
    return {
      messages: processedMessages.reverse(),
      totalCount,
    };
  } catch (error) {
    console.error('Error getting direct messages:', error);
    throw error;
  }
};

//delete a message
export const deleteMessage = async (messageUuid, userId) => {
  const message = await directMessageRepository.findMessageByUuid(messageUuid);

  if (!message) {
    throw new ApiError('Message not found', HTTP_STATUS.NOT_FOUND);
  }

  if (message.sender_id !== userId) {
    throw new ApiError('You are not authorized to delete this message', HTTP_STATUS.FORBIDDEN);
  }

  await directMessageRepository.deleteMessageByUuid(messageUuid);

  // Send silent notification about deletion
  try {
    const notificationData = {
      type: 'delete_message',
      messageUuid: message.uuid,
    };

    if (message.receiver_id) {
      // Direct message
      notificationData.chatId = `user-${message.sender.uuid}`;
      await notificationService.sendNotification(
        message.receiver_id,
        '', // Title not needed for silent
        '', // Body not needed for silent
        notificationData,
        true, // silent
      );
    } else if (message.group_id && message.group?.memberships) {
      // Group message
      notificationData.chatId = `group-${message.group.uuid}`;

      for (const member of message.group.memberships) {
        if (member.user_id !== userId) {
          await notificationService.sendNotification(
            member.user_id,
            '', // Title not needed for silent
            '', // Body not needed for silent
            notificationData,
            true, // silent
          );
        }
      }
    }
  } catch (error) {
    console.error(`Failed to send delete notification for message ${messageUuid}:`, error);
  }
};
