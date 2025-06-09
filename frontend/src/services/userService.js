import axios from "../lib/axios";

// Update user's online status
export const updateUserStatus = async (isOnline) => {
  try {
    await axios.post("/users/status", { isOnline });
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

// Get a user's status
export const getUserStatus = async (userId) => {
  try {
    const response = await axios.get(`/users/status/${userId}`);
    return response.data.status;
  } catch (error) {
    console.error("Error getting user status:", error);
    return null;
  }
};

// Format last seen time to human readable format
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Unknown";

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return lastSeenDate.toLocaleDateString();
  }
};
