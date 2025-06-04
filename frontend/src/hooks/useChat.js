import { create } from "zustand";
import axios from "../lib/axios";
import { useAuth } from "./useAuth";

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

      // Set up immediate polling for new messages
      const intervalId = setInterval(() => {
        get().fetchNewMessages(chat.id);
      }, 3000); // Poll every 3 seconds instead of 10 seconds

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
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const response = await axios.get(`/direct-messages/${receiverUuid}`);

      if (response.data) {
        // Handle different response structures by checking what's available
        let rawMessages = [];

        // Option 1: data is directly in response.data
        if (Array.isArray(response.data)) {
          rawMessages = response.data;
        }
        // Option 2: data is in response.data.data
        else if (Array.isArray(response.data.data)) {
          rawMessages = response.data.data;
        }
        // Option 3: data is in response.data.directMessages
        else if (Array.isArray(response.data.directMessages)) {
          rawMessages = response.data.directMessages;
        }

        // Map messages to our format - preserving the original structure for correct sender identification
        const formattedMessages = rawMessages.map((message) => ({
          id:
            message.id || message.uuid || `msg-${Date.now()}-${Math.random()}`,
          text: message.content || message.text || "",
          content: message.content || message.text || "",
          sender: message.sender || {
            uuid: message.sender_uuid,
            name: message.sender_name,
          },
          // Keep the original sender object for proper identification
          senderName: message.sender?.name || message.sender_name || "",
          timestamp: message.created_at || message.timestamp || Date.now(),
          // Keep raw data for debugging
          _raw: message,
        }));

        // Only update if we have new messages
        const currentMessages = get().messages;
        if (formattedMessages.length > currentMessages.length) {
          set({ messages: formattedMessages });
        }
      }
    } catch {
      // Silent error handling to prevent UI disruption
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
        const chats = users.map((user) => ({
          id: `user-${user.uuid}`,
          name: user.name,
          avatar:
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
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
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      // Use the direct-messages endpoint with the receiver UUID
      const response = await axios.get(`/direct-messages/${receiverUuid}`);

      if (response.data) {
        // Handle different response structures by checking what's available
        let rawMessages = [];

        // Option 1: data is directly in response.data
        if (Array.isArray(response.data)) {
          rawMessages = response.data;
        }
        // Option 2: data is in response.data.data
        else if (Array.isArray(response.data.data)) {
          rawMessages = response.data.data;
        }
        // Option 3: data is in response.data.directMessages
        else if (Array.isArray(response.data.directMessages)) {
          rawMessages = response.data.directMessages;
        }

        // Map messages to our format - preserving the original structure for correct sender identification
        const formattedMessages = rawMessages.map((message) => ({
          id:
            message.id || message.uuid || `msg-${Date.now()}-${Math.random()}`,
          text: message.content || message.text || "",
          content: message.content || message.text || "",
          sender: message.sender || {
            uuid: message.sender_uuid,
            name: message.sender_name,
          },
          // Keep the original sender object for proper identification
          senderName: message.sender?.name || message.sender_name || "",
          timestamp: message.created_at || message.timestamp || Date.now(),
          // Keep raw data for debugging
          _raw: message,
        }));

        set({ messages: formattedMessages });
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Handle message sending with immediate local update
  sendMessage: async (content, chatId, receiverUuid) => {
    const user = useAuth.getState().user;

    if (!user || !content.trim()) return;

    // Extract receiver UUID from chatId if no explicit receiverUuid is provided
    let receiver = receiverUuid;
    if (!receiver && chatId && chatId.startsWith("user-")) {
      receiver = chatId.replace("user-", "");
    }

    try {
      // Optimistically add the message to the UI first
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        text: content.trim(),
        content: content.trim(),
        sender: {
          uuid: user.uuid,
          name: user.name,
        },
        senderName: user.name || "",
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        isPending: true,
      };

      // Add the message to the local state immediately
      set((state) => ({
        messages: [...state.messages, tempMessage],
      }));

      // Send the actual API request
      const response = await axios.post("/direct-messages", {
        content: content.trim(),
        receiver_uuid: receiver,
      });

      // If successful, update the temp message with the real one from the server if available
      if (response.data && response.data.data) {
        const serverMessage = response.data.data;
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId
              ? {
                  id: serverMessage.id || tempId,
                  text: serverMessage.content || m.text,
                  content: serverMessage.content || m.content,
                  sender: serverMessage.sender || {
                    uuid: serverMessage.sender_uuid || user.uuid,
                    name: serverMessage.sender_name || user.name,
                  },
                  senderName: serverMessage.sender?.name || user.name,
                  timestamp: new Date(
                    serverMessage.created_at || m.timestamp
                  ).toISOString(),
                  created_at: serverMessage.created_at || m.created_at,
                  isPending: false,
                }
              : m
          ),
        }));
      } else {
        // Just mark the message as not pending if no server data
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId ? { ...m, isPending: false } : m
          ),
        }));
      }

      return response.data.data;
    } catch (error) {
      // If there was an error, mark the message as failed
      set((state) => ({
        messages: state.messages.map((m) =>
          /* eslint-disable */
          m.id === tempId ? { ...m, isPending: false, failed: true } : m
        ),
        error: error.message,
      }));
      return null;
    }
  },

  updateUserStatus: async (status) => {
    const user = useAuth.getState().user;
    if (user) {
      try {
        // Silent fail as the backend endpoint doesn't exist yet
        return status;
      } catch {
        // Silent fail
      }
    }
  },

  startChat: async (otherUser) => {
    try {
      const user = useAuth.getState().user;
      const token = useAuth.getState().getToken();

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

      if (response.data && response.data.success) {
        // Create a new chat object based on the other user
        const newChat = {
          id: `user-${otherUser.uuid}`,
          name: otherUser.name,
          avatar:
            otherUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
          receiver_uuid: otherUser.uuid,
          otherUser,
          last_message: "",
          updated_at: new Date().toISOString(),
        };

        // Update the chats list with the new chat
        set((state) => ({
          chats: [...state.chats, newChat],
        }));

        // Set this as the active chat
        get().setActiveChat(newChat);

        return newChat;
      }

      return null;
    } catch (error) {
      console.error("Error starting chat:", error);
      return null;
    }
  },
}));
