import axios from "../lib/axios";

export const sendMessage = async (receiverUuid, content) => {
  if (!content.trim()) return null;

  const response = await axios.post("/direct-messages", {
    content: content.trim(),
    receiver_uuid: receiverUuid
  });

  return response.data.data;
};

export const getMessagesBetweenUsers = async (receiverUuid, page = 0) => {
  const response = await axios.get(`/direct-messages/${receiverUuid}?page=${page}`);
  return response.data.data || [];
};
