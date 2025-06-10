import { useEffect, useState, useRef, useCallback } from "react";
import { listenForNotifications } from "../services/notificationService";
import { getMessagesBetweenUsers } from "../services/messageService";

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationUnsubscribeRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const messagesData = await getMessagesBetweenUsers(chatId);
      
      if (messagesData) {
        setMessages(
          messagesData.map((msg) => ({
            ...msg,
            isMe: msg.sender_uuid === localStorage.getItem("userUuid"),
          }))
        );
      }
      setError(null);
    } catch (err) {
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
