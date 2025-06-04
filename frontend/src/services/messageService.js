import axios from "../lib/axios";

export const sendMessage = async (chatId, userId, content) => {
  if (!content.trim()) return null;

  try {
    const response = await axios.post("/api/v1/direct-messages", {
      content: content.trim(),
      chat_id: chatId,
      receiver_uuid: chatId.split("_").find((id) => id !== userId),
    });

    return response.data.data;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};

export const createChatRoom = async (participants) => {
  try {
    const response = await axios.post("/api/v1/chats", {
      participant_uuid: participants.find(
        (uuid) => uuid !== localStorage.getItem("userUuid")
      ),
    });

    return response.data.data;
  } catch (error) {
    console.error("Failed to create chat room:", error);
    throw error;
  }
};
