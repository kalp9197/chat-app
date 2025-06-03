import { create } from 'zustand';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../config/firebase';
import axios from '../utils/axios';
import { useAuth } from './auth';

export const useChatStore = create((set, get) => ({
  activeChat: null,
  messages: [],
  users: [],
  loading: false,
  error: null,

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchUsers: async () => {
    try {
      set({ loading: true });
      const token = useAuth.getState().token;
      const response = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ users: response.data.users });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content, receiverUuid) => {
    try {
      const token = useAuth.getState().token;
      const user = useAuth.getState().user;
      
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

      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  listenToMessages: (otherUserUuid) => {
    const user = useAuth.getState().user;
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
      }
    });
  },

  updateUserStatus: (status) => {
    const user = useAuth.getState().user;
    if (user) {
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