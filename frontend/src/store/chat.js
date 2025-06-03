import { create } from 'zustand';
import axios from '../lib/axios';
import { useAuth } from './auth';

export const useChat = create((set, get) => ({
  messages: [],
  chats: [],
  activeChat: null,
  users: [],
  loading: false,
  error: null,
  messagePollingInterval: null,

  setActiveChat: (chat) => {
    const { messagePollingInterval } = get();
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval);
    }

    set({ activeChat: chat, messages: [] });

    if (chat) {
      get().fetchMessages(chat.id);
      
      const intervalId = setInterval(() => {
        get().fetchMessages(chat.id);
      }, 5000);
      
      set({ messagePollingInterval: intervalId });
    }
  },

  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const token = useAuth.getState().token;
      const response = await axios.get("/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ users: response.data.users });
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to fetch chats:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    const user = useAuth.getState().user;
    const token = useAuth.getState().token;
    if (!user || !chatId) return;

    try {
      const response = await axios.get(`/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const messages = response.data.data.map(msg => ({
          ...msg,
          isMe: msg.sender_uuid === user.uuid
        }));
        
        set({ messages });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ error: error.message });
    }
  },

  sendMessage: async (content, chatId, receiverUuid) => {
    const user = useAuth.getState().user;
    const token = useAuth.getState().token;
    
    if (!user || !content.trim()) return;

    try {
      const response = await axios.post(
        "/messages",
        {
          content: content.trim(),
          chat_id: chatId,
          receiver_uuid: receiverUuid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  updateUserStatus: async (status) => {
    const user = useAuth.getState().user;
    const token = useAuth.getState().token;
    
    if (user) {
      try {
        await axios.post(
          '/users/status',
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    }
  }
}));