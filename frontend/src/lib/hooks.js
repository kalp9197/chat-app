import { useEffect, useState, useRef, useCallback } from "react";
import axios from "../lib/axios";

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`/api/v1/direct-messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        const messagesList = response.data.data.map((msg) => ({
          ...msg,
          isMe: msg.sender_uuid === localStorage.getItem("userUuid"),
        }));
        setMessages(messagesList);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    fetchMessages();

    intervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chatId, fetchMessages]);

  return { messages, loading, error };
};

export const useOnlineStatus = (userId) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const updateStatus = async (status) => {
      try {
        await axios.post(
          "/api/v1/users/status",
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error updating status:", err);
      }
    };

    updateStatus(true);

    intervalRef.current = setInterval(() => updateStatus(true), 60000); // Every minute

    const handleVisibilityChange = () => {
      updateStatus(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      updateStatus(false); // Set offline when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);
};

export const useUserStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchStatus = async () => {
      try {
        const response = await axios.get(`/api/v1/users/${userId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          setIsOnline(response.data.data.online);
          if (response.data.data.last_seen) {
            setLastSeen(new Date(response.data.data.last_seen));
          }
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    };

    fetchStatus();

    intervalRef.current = setInterval(fetchStatus, 15000); // Every 15 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  return { isOnline, lastSeen };
};
