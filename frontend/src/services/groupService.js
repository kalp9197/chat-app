import axios from "@/lib/axios";

// Get all groups for the logged-in user
export const getAllGroups = async () => {
  try {
    const response = await axios.get("/groups");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

// Get a specific group by UUID
export const getGroupByUuid = async (uuid) => {
  try {
    const response = await axios.get(`/groups/${uuid}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching group ${uuid}:`, error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (name) => {
  try {
    const response = await axios.post("/groups", { name });
    return response.data.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Update an existing group
export const updateGroup = async (uuid, groupData) => {
  try {
    const response = await axios.put(`/groups/${uuid}`, groupData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating group ${uuid}:`, error);
    throw error;
  }
};

// Delete a group
export const deleteGroup = async (uuid) => {
  try {
    await axios.delete(`/groups/${uuid}`);
    return true;
  } catch (error) {
    console.error(`Error deleting group ${uuid}:`, error);
    throw error;
  }
}; 