import axios from "@/lib/axios";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

const getFileType = (file) => {
  if (file.type.startsWith("image/")) {
    const extension = file.name.split(".").pop().toLowerCase();
    return `image/${extension}`;
  }

  return `application/${file.name.split(".").pop().toLowerCase()}`;
};

export const uploadFileAndSend = async (file, chatType, chatId) => {
  const base64Data = await fileToBase64(file);

  const payload = {
    data: base64Data,
    type: getFileType(file),
    fileName: file.name,
    ...(chatType === "direct" && { receiver_uuid: chatId }),
    ...(chatType === "group" && { group_uuid: chatId }),
  };

  const response = await axios.post("/upload", payload);
  return response.data.data;
};
