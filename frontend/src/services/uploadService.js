import axios from '@/lib/axios';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });

const getFileType = (file) => {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  return 'application/octet-stream';
};

export const uploadFileAndSend = async (file, chatType, chatId) => {
  const data = await fileToBase64(file);
  const type = getFileType(file);
  const fileName = file.name;
  const payload = { data, type, fileName };
  if (chatType === 'direct') payload.receiver_uuid = chatId;
  if (chatType === 'group') payload.group_uuid = chatId;
  const response = await axios.post('/upload', payload);
  return response.data.data;
};
