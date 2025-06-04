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

      // Set up polling with a longer interval and smart updates
      const intervalId = setInterval(() => {
        get().fetchNewMessages(chat.id);
      }, 10000); // Increased to 10 seconds

      set({ messagePollingInterval: intervalId });
    }
  },
  
  // Cleanly stop message polling
  stopMessagePolling: () => {
    const { messagePollingInterval } = get();
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval);
      set({ messagePollingInterval: null });
    }
  },
  
  // Only fetch new messages without replacing the entire message list
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
        
        // Only update if there are new messages
        if (newMessages.length > currentMessages.length) {
          set({ messages: newMessages });
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
      // Don't update error state to avoid UI disruption
    }
  },

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const token = useAuth.getState().token;
      // Using /users endpoint instead since there's no dedicated chats/direct-messages list endpoint
      // This will fetch all users that can be used to initiate chats
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        // Convert users to a format that resembles chats for the UI
        const users = response.data.users || [];
        
        // Transform users into chat-like objects
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
      // Interceptor will automatically handle the token
      
      const response = await axios.get("/users");

      // Safely extract users from response, defaulting to empty array
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
      
      // Extract receiver UUID from chat ID if it starts with 'user-'
      let receiverUuid = chatId;
      if (chatId.startsWith('user-')) {
        receiverUuid = chatId.replace('user-', '');
      }
      
      // Use the direct-messages endpoint with the receiver UUID
      const response = await axios.get(`/direct-messages/${receiverUuid}`);

      if (response.data && response.data.success) {
        // Map the response data to our message format
        const messages = response.data.data || [];
        set({
          messages: messages.map((message) => ({
            id: message.id,
            text: message.content,
            sender: message.sender_uuid,
            // Ensure timestamp is a valid date
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
    
    // Extract receiver UUID from chatId if no explicit receiverUuid is provided
    let receiver = receiverUuid;
    if (!receiver && chatId && chatId.startsWith('user-')) {
      receiver = chatId.replace('user-', '');
    }
    
    // Use the direct-messages endpoint instead of messages
    const response = await axios.post(
      "/direct-messages",
      {
        content: content.trim(),
        receiver_uuid: receiver,
      }
      // No need to specify headers here, interceptor handles it
    );

    return response.data.data;
  },

  updateUserStatus: async (status) => {
    const user = useAuth.getState().user;
    if (user) {
      try {
        // For now, silently fail as the backend endpoint doesn't exist yet
        // We'll need to add this endpoint to the backend
        // Comment out unused status to fix lint error
        // await axios.post('/users/status', { status });
        return status; // Return status to avoid unused parameter warning
      } catch {
        // Silent fail
      }
    }
  },

  startChat: async (otherUser) => {
    try {
      const user = useAuth.getState().user;
      const token = useAuth.getState().getToken(); // Use getToken method for better token access

      if (!user || !otherUser) {

        return null;
      }

      if (!token) {

        return null;
      }



      // Check if we already have a chat with this user
      const existingChat = get().chats.find(
        (chat) => chat.receiver_uuid === otherUser.uuid
      );

      if (existingChat) {

        get().setActiveChat(existingChat);
        return existingChat;
      }

      // Create a new chat in the backend


      // Explicitly add the Authorization header for this critical request
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

      // Generate a consistent ID format using the user's UUID
      let chatId = `user-${otherUser.uuid}`;
      
      // If the backend returns an ID, use that instead
      if (response.data && response.data.success && response.data.data && response.data.data.id) {
        chatId = response.data.data.id;
      }

      // Create a new chat object for the UI
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

      // Add to chats list
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
