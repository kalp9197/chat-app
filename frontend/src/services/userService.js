import axios from "@/lib/axios";

// Get all users
export const getAllUsers = async () => {
  const response = await axios.get("/users");
  
  // Handle different possible response structures
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data.users && Array.isArray(response.data.users)) {
    return response.data.users;
  } else if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // If none of the above, return empty array
  return [];
}; 