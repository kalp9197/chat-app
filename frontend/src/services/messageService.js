import axios from '../lib/axios';

export const sendMessage = async (chatType, chatId, content, messageType = 'text') => {
  if (!content.trim()) return null;

  const payload = {
    content: content.trim(),
    message_type: messageType,
  };

  if (chatType === 'direct') {
    payload.receiver_uuid = chatId;
  } else if (chatType === 'group') {
    payload.group_uuid = chatId;
  }

  const response = await axios.post('/direct-messages', payload);

  return response.data.data;
};

export const getMessagesBetweenUsers = async (receiverUuid, page = 0, limit = 10) => {
  const response = await axios.get(`/direct-messages/${receiverUuid}?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const deleteMessage = async (messageUuid) => {
  const response = await axios.delete(`/direct-messages/message/${messageUuid}`);
  return response.data;
};
