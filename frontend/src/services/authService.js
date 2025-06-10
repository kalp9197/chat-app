import axios from "@/lib/axios";

// Register a new user
export const registerUser = async (name, email, password) => {
  const response = await axios.post("/auth/register", { name, email, password });
  return response.data;
};

// Login a user
export const loginUser = async (email, password) => {
  const response = await axios.post("/auth/login", { email, password });
  return response.data;
};

// Check if user is authenticated
export const checkAuth = async () => {
  const response = await axios.get("/auth/check-auth");
  return response.data;
}; 