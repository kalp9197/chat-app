import { create } from "zustand";
import axios from "../lib/axios";
import { useAuth } from "./auth";

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

      // poll every 10s
      const intervalId = setInterval(() => {
        get().fetchNewMessages(chat.id);
      }, 10000);

      set({ messagePollingInterval: intervalId });
    }
  },
  
  // stop polling
  stopMessagePolling: () => {
    const { messagePollingInterval } = get();
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval);
      set({ messagePollingInterval: null });
    }
  },
  
  // fetch new messages only
  fetchNewMessages: async (chatId) => {
    if (!chatId) return;
    
    try {
      const user = useAuth.getState().user;
      if (!user) return;
      
      let receiverUuid = chatId;
      if (chatId.startsWith('user-')) {
        receiverUuid = chatId.replace('user-', '');
      }
      
      const response = await axios.get(`/direct-messages/${receiverUuid}`);
      
      if (response.data && response.data.success) {
        const newMessages = response.data.directMessages || [];
        const currentMessages = get().messages;
        
        // update when new messages
        if (newMessages.length > currentMessages.length) {
          set({ messages: newMessages });
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
      // ignore error state
    }
  },

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const token = useAuth.getState().token;
      // temporary /users endpoint to list chats
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        // convert users to chat objects
        const users = response.data.users || [];

        const chats = users.map(user => ({
          id: `user-${user.uuid}`,
          name: user.name,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          receiver_uuid: user.uuid,
          otherUser: user,
          last_message: "",
          updated_at: user.updated_at || new Date().toISOString(),
        }));
        
        set({ chats });
        return chats;
      } else {
        set({ chats: [] });
        return [];
      }
    } catch (error) {
      set({ error: error.message });

    } finally {
      set({ loading: false });
    }
  },

  fetchAllUsers: async () => {
    try {
      set({ loading: true, error: null });
      // token via interceptor
      
      const response = await axios.get("/users");

      // get users or []
      const users = response.data?.users || [];
      set({ users });

      return users;
    } catch (error) {
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    const user = useAuth.getState().user;
    if (!user || !chatId) return;

    try {
      set({ loading: true, error: null });
      
      // extract receiver UUID
      let receiverUuid = chatId;
      if (chatId.startsWith('user-')) {
        receiverUuid = chatId.replace('user-', '');
      }
      
      // get messages for receiver
      const response = await axios.get(`/direct-messages/${receiverUuid}`);

      if (response.data && response.data.success) {
        // map to message format
        const messages = response.data.data || [];
        set({
          messages: messages.map((message) => ({
            id: message.id,
            text: message.content,
            sender: message.sender_uuid,
            // validate timestamp
            timestamp: new Date(message.created_at).toISOString(),
          })),
        });
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content, chatId, receiverUuid) => {
    const user = useAuth.getState().user;

    if (!user || !content.trim()) return;
    
    // derive receiver UUID
    let receiver = receiverUuid;
    if (!receiver && chatId && chatId.startsWith('user-')) {
      receiver = chatId.replace('user-', '');
    }
    
    // send via direct-messages
    const response = await axios.post(
      "/direct-messages",
      {
        content: content.trim(),
        receiver_uuid: receiver,
      }
      // headers handled by interceptor
    );

    return response.data.data;
  },

  updateUserStatus: async (status) => {
    const user = useAuth.getState().user;
    if (user) {
      try {
        // backend endpoint missing
        // await axios.post('/users/status', { status });
        return status; // silence unused param
      } catch {
        // ignore error
      }
    }
  },

  startChat: async (otherUser) => {
    try {
      const user = useAuth.getState().user;
      const token = useAuth.getState().getToken(); // token from store

      if (!user || !otherUser) {

        return null;
      }

      if (!token) {

        return null;
      }



      // reuse existing chat
      const existingChat = get().chats.find(
        (chat) => chat.receiver_uuid === otherUser.uuid
      );

      if (existingChat) {

        get().setActiveChat(existingChat);
        return existingChat;
      }

      // create chat in backend
      // explicit auth header
      const response = await axios.post(
        "/direct-messages",
        { receiver_uuid: otherUser.uuid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // id from uuid
      let chatId = `user-${otherUser.uuid}`;

      // use backend id
      if (response.data && response.data.success && response.data.data && response.data.data.id) {
        chatId = response.data.data.id;
      }

      // build chat object
      const newChat = {
        id: chatId,
        name: otherUser.name,
        avatar:
          otherUser.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
        receiver_uuid: otherUser.uuid,
        otherUser: otherUser,
        last_message: "",
        updated_at: new Date().toISOString(),
      };

      // store chat
      set((state) => ({
        chats: [newChat, ...state.chats],
      }));


      get().setActiveChat(newChat);

      return newChat;
    } catch {
      return null;
    }
  },
}));
