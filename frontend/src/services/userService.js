import axios from '@/lib/axios';

export const getAllUsers = async () => {
  const response = await axios.get('/users');
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data.users && Array.isArray(response.data.users)) {
    return response.data.users;
  } else if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
};
