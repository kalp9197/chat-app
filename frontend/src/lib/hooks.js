import { useEffect, useState, useRef, useCallback } from "react";
import axios from "../lib/axios";
import { listenForNotifications } from "../services/notificationService";

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationUnsubscribeRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/direct-messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.data) {
        setMessages(
          data.data.map((msg) => ({
            ...msg,
            isMe: msg.sender_uuid === localStorage.getItem("userUuid"),
          }))
        );
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

    notificationUnsubscribeRef.current = listenForNotifications((payload) => {
      if (
        payload?.data?.type === "chat_message" &&
        payload?.data?.chatId === chatId
      ) {
        fetchMessages();
      }
    });

    return () => notificationUnsubscribeRef.current?.();
  }, [chatId, fetchMessages]);

  return { messages, loading, error, fetchMessages };
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Error updating status:", err);
      }
    };

    updateStatus(true);

    intervalRef.current = setInterval(() => updateStatus(true), 60000);

    const handleVisibilityChange = () => updateStatus(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      updateStatus(false);
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);
};

export const useUserStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`/api/v1/users/${userId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data?.data) {
          setIsOnline(data.data.online);
          setLastSeen(
            data.data.last_seen ? new Date(data.data.last_seen) : null
          );
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    };

    fetchStatus();
  }, [userId]);

  return { isOnline, lastSeen };
};
