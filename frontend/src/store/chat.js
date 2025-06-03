<<<<<<< HEAD
import { create } from 'zustand';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../config/firebase';
import axios from '../utils/axios';
import { useAuth } from './auth';
=======
import { create } from "zustand";
import axios from "../lib/axios";
import { useAuth } from "./auth";
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)

export const useChatStore = create((set, get) => ({
  activeChat: null,
  messages: [],
<<<<<<< HEAD
=======
  chats: [],
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)
  users: [],
  loading: false,
  searchingUsers: false,
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
<<<<<<< HEAD
      const response = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
=======
      const response = await axios.get("/chats", {
        headers: { Authorization: `Bearer ${token}` },
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)
      });
      set({ users: response.data.users });
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to fetch chats:", error);
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content, receiverUuid) => {
    try {
      const token = useAuth.getState().token;
      const user = useAuth.getState().user;
<<<<<<< HEAD
      
      // Save to MySQL through API
      const response = await axios.post('/direct-messages', {
        content,
        receiver_uuid: receiverUuid,
        message_type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Push to Firebase for real-time
      const chatId = [user.uuid, receiverUuid].sort().join('_');
      const chatRef = ref(db, `chats/${chatId}`);
      await push(chatRef, {
        content,
        sender_uuid: user.uuid,
        timestamp: serverTimestamp()
      });
=======

      if (!user || !content.trim()) return;

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: content.trim(),
        sender_uuid: user.uuid,
        receiver_uuid: receiverUuid,
        created_at: new Date().toISOString(),
        isMe: true,
        pending: true
      };
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)

      set(state => ({
        messages: [...state.messages, tempMessage]
      }));

      const response = await axios.post(
        "/api/v1/direct-messages",
        {
          content,
          receiver_uuid: receiverUuid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === tempMessage.id ? { ...response.data.data, isMe: true } : msg
        )
      }));

      return response.data.data;
    } catch (error) {
      set(state => ({
        messages: state.messages.filter(msg => !msg.pending),
        error: error.message
      }));
      console.error("Failed to send message:", error);
      throw new Error(error.message);
    }
  },

  fetchMessages: async (chatId) => {
    const user = useAuth.getState().user;
<<<<<<< HEAD
    const chatId = [user.uuid, otherUserUuid].sort().join('_');
    const chatRef = ref(db, `chats/${chatId}`);
    
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
          timestamp: value.timestamp || Date.now()
        })).sort((a, b) => a.timestamp - b.timestamp);
        set({ messages });
      } else {
        set({ messages: [] });
=======
    const token = useAuth.getState().token;
    if (!user || !chatId) return;

    try {
      set({ loading: true });
      
      const response = await axios.get(
        `/api/v1/direct-messages/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data && response.data.data) {
        const messages = response.data.data.map(msg => ({
          ...msg,
          isMe: msg.sender_uuid === user.uuid
        }));
        
        const currentMessages = get().messages;
        const lastCurrentId = currentMessages.length > 0 ? 
          currentMessages[currentMessages.length - 1].id : null;
        const lastNewId = messages.length > 0 ? 
          messages[messages.length - 1].id : null;
          
        if (lastCurrentId !== lastNewId || currentMessages.length !== messages.length) {
          set({ messages });
        }
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateUserStatus: async (status) => {
    const user = useAuth.getState().user;
    const token = useAuth.getState().token;
    
    if (user) {
<<<<<<< HEAD
      const userStatusRef = ref(db, `status/${user.uuid}`);
      set(userStatusRef, {
        online: status,
        lastSeen: serverTimestamp()
      });
    }
  },

  listenToUserStatus: (userUuid, callback) => {
    const statusRef = ref(db, `status/${userUuid}`);
    return onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      callback(status);
    });
  }
}));
=======
      try {
        await axios.post(
          "/api/v1/users/status",
          { status },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  },

  
  cleanup: () => {
    const { messagePollingInterval } = get();
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval);
      set({ messagePollingInterval: null });
    }
  },

  
  searchUsers: async (query) => {
    try {
      set({ searchingUsers: true, error: null });
      const token = useAuth.getState().token;
      const response = await axios.get(
        `/api/v1/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ users: response.data.data || [] });
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to search users:", error);
    } finally {
      set({ searchingUsers: false });
    }
  },

  
  startChat: async (otherUser) => {
    try {
      const token = useAuth.getState().token;
      const user = useAuth.getState().user;

      if (!user || !otherUser) return;

      const existingChat = get().chats.find(
        (chat) =>
          chat.participants?.includes(otherUser.uuid) ||
          chat.receiver_uuid === otherUser.uuid ||
          chat.otherUser?.uuid === otherUser.uuid
      );

      if (existingChat) {
        get().setActiveChat(existingChat);
        return existingChat;
      }

      const response = await axios.post(
        "/api/v1/chats",
        {
          participant_uuid: otherUser.uuid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newChat = {
        id: response.data.data.id,
        name: otherUser.name,
        avatar:
          otherUser.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
        receiver_uuid: otherUser.uuid,
        otherUser: otherUser,
        last_message: "",
        updated_at: new Date().toISOString(),
        unread_count: 0,
      };

      set((state) => ({
        chats: [newChat, ...state.chats],
      }));

      get().setActiveChat(newChat);

      return newChat;
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to start chat:", error);
      throw error;
    }
  },
}));
>>>>>>> a8c0883 (refactor(notifications): migrate from Firebase Realtime DB to FCM)
