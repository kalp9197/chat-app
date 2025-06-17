import axios from "@/lib/axios";

// Get all groups for the logged-in user
export const getAllGroups = async () => {
  const response = await axios.get("/groups");
  return response.data.data || [];
};

// Get a specific group by UUID with pagination
export const getGroupByUuid = async (uuid, page = 0, limit = 10) => {
  const response = await axios.get(`/groups/${uuid}`, {
    params: { page, limit },
  });
  return response.data.data;
};

// Create a new group
export const createGroup = async (name, members = []) => {
  const response = await axios.post("/groups", { name, members });
  return response.data.data;
};

// Update an existing group
export const updateGroup = async (uuid, groupData) => {
  const response = await axios.put(`/groups/${uuid}`, groupData);
  return response.data.data;
};

// Delete a group
export const deleteGroup = async (uuid) => {
  await axios.delete(`/groups/${uuid}`);
  return true;
};

// Add members to group
export const addGroupMembers = async (uuid, members) => {
  const response = await axios.post(`/groups/${uuid}/members`, { members });
  return response.data.data;
};
