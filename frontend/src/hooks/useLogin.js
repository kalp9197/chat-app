import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import axios from "@/lib/axios";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/auth/login", { email, password });

      // Extract token from different response formats
      let user = null;
      let token = null;

      if (response.data) {
        // Check token location
        if (response.data.token) {
          token = response.data.token;
        } else if (response.data.data && response.data.data.token) {
          token = response.data.data.token;
        } else if (response.data.accessToken) {
          token = response.data.accessToken;
        }

        // Extract user data
        if (response.data.user) {
          user = response.data.user;
        } else if (response.data.data && response.data.data.user) {
          user = response.data.data.user;
        }
      }

      if (!token) {
        throw new Error("No token received from server");
      }

      login(user, token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  };
}
