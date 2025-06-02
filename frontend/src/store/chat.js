import { create } from 'zustand';
import { ref, onValue, set, push } from 'firebase/database';
import { db } from '../config/firebase';
import axios from '../utils/axios';
import { useAuth } from './auth';

export const useChatStore = create((set, get) => ({
  activeChat: null,
  messages: [],
  chats: [],
  loading: false,
  error: null,

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchChats: async () => {
    try {
      set({ loading: true });
      const token = useAuth.getState().token;
      const response = await axios.get('/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ chats: response.data.chats });
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
        receiver_uuid: receiverUuid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Push to Firebase for real-time
      const chatRef = ref(db, `chats/${user.uuid}_${receiverUuid}`);
      await push(chatRef, {
        content,
        sender_uuid: user.uuid,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  listenToMessages: (otherUserUuid) => {
    const user = useAuth.getState().user;
    const chatRef = ref(db, `chats/${user.uuid}_${otherUserUuid}`);
    
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data);
        set({ messages });
      }
    });
  },

  updateUserStatus: (status) => {
    const user = useAuth.getState().user;
    if (user) {
      const userStatusRef = ref(db, `status/${user.uuid}`);
      set(userStatusRef, {
        online: status,
        lastSeen: Date.now()
      });
    }
  }
}));