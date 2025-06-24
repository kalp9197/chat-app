import axios from '../lib/axios';

export const getAllGroups = async () => {
  const response = await axios.get('/groups');
  return response.data.data || [];
};

export const getGroupByUuid = async (uuid, page = 0, limit = 10) => {
  const response = await axios.get(`/groups/${uuid}?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const createGroup = async (name, members = []) => {
  const response = await axios.post('/groups', { name, members });
  return response.data.data;
};

export const updateGroup = async (uuid, groupData) => {
  const response = await axios.put(`/groups/${uuid}`, groupData);
  return response.data.data;
};

export const deleteGroup = async (uuid) => {
  await axios.delete(`/groups/${uuid}`);
  return true;
};

export const addGroupMembers = async (uuid, members) => {
  const response = await axios.post(`/groups/${uuid}/members`, { members });
  return response.data.data;
};
