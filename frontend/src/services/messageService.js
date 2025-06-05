import axios from "../lib/axios";

export const sendMessage = async (chatId, userId, content) => {
  if (!content.trim()) return null;

  const response = await axios.post("/api/v1/direct-messages", {
    content: content.trim(),
    chat_id: chatId,
    receiver_uuid: chatId.split("_").find((id) => id !== userId),
  });

  return response.data.data;
};

export const createChatRoom = async (participants) => {
  const response = await axios.post("/api/v1/chats", {
    participant_uuid: participants.find(
      (uuid) => uuid !== localStorage.getItem("userUuid")
    ),
  });

  return response.data.data;
};
