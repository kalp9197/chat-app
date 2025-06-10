import { create } from "zustand";
import { useAuth } from "./useAuth";
import { listenForNotifications } from "../services/notificationService";

export const useChat = create((set, get) => ({
  messages: [],
  chats: [],
  activeChat: null,
  users: [],
  loading: false,
  error: null,
  notificationUnsubscribe: null,
  currentPage: 0,
  hasMoreMessages: true,

  setActiveChat: (chat) => {
    const { notificationUnsubscribe } = get();

    // Cleanup existing subscriptions
    if (notificationUnsubscribe) {
      notificationUnsubscribe();
    }

    set({
      activeChat: chat,
      messages: [],
      currentPage: 0,
      hasMoreMessages: true,
    });

    if (chat) {
      get().fetchMessages(chat.id);

      const unsubscribe = listenForNotifications((payload) => {
        if (
          payload?.data?.type === "chat_message" &&
          payload?.data?.chatId === chat.id
        ) {
          get().fetchLatestMessages(chat.id);
        }
      });

      set({ notificationUnsubscribe: unsubscribe });
    }
  },

  cleanupNotifications: () => {
    const { notificationUnsubscribe } = get();

    if (notificationUnsubscribe) {
      notificationUnsubscribe();
      set({ notificationUnsubscribe: null });
    }
  },

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const { getAllUsers } = await import("@/services/userService");
      const users = await getAllUsers();

      if (users && users.length > 0) {
        const chats = users.map((user) => ({
          id: `user-${user.uuid}`,
          name: user.name,
          avatar:
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          receiver_uuid: user.uuid,
          otherUser: user,
          last_message: "", // Will be populated by fetchMessages or a dedicated last_message fetch
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
      const { getAllUsers } = await import("@/services/userService");
      const users = await getAllUsers();
      
      set({ users });
      return users;
    } catch (error) {
      set({ error: error.message || "Failed to fetch users" });
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

      let receiverUuid = chatId;
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const page = get().currentPage;
      const { getMessagesBetweenUsers } = await import("@/services/messageService");
      const messages = await getMessagesBetweenUsers(receiverUuid, page);
      const response = { data: { data: messages } };

      if (response.data) {
        let rawMessages = [];

        if (Array.isArray(response.data)) {
          rawMessages = response.data;
        } else if (Array.isArray(response.data.data)) {
          rawMessages = response.data.data;
        } else if (Array.isArray(response.data.directMessages)) {
          rawMessages = response.data.directMessages;
        }

        const formattedMessages = rawMessages.map((message) => ({
          id:
            message.id || message.uuid || `msg-${Date.now()}-${Math.random()}`,
          text: message.content || message.text || "",
          content: message.content || message.text || "",
          sender: message.sender || {
            uuid: message.sender_uuid,
            name: message.sender_name,
          },
          senderName: message.sender?.name || message.sender_name || "",
          timestamp: message.created_at || message.timestamp || Date.now(),
          _raw: message, // Keep raw message for debugging or other uses
        }));

        const hasMore = response.data.pagination?.hasMore ?? false;

        set({
          messages: formattedMessages,
          hasMoreMessages: hasMore,
        });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  loadMoreMessages: async (chatId) => {
    const user = useAuth.getState().user;
    if (!user || !chatId) return;

    const currentPage = get().currentPage;
    const nextPage = currentPage + 1;

    try {
      set({ loading: true, error: null });

      let receiverUuid = chatId;
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const { getMessagesBetweenUsers } = await import("@/services/messageService");
      const messages = await getMessagesBetweenUsers(receiverUuid, nextPage);
      const response = { data: { data: messages } };

      if (response.data) {
        let rawMessages = [];

        if (Array.isArray(response.data)) {
          rawMessages = response.data;
        } else if (Array.isArray(response.data.data)) {
          rawMessages = response.data.data;
        } else if (Array.isArray(response.data.directMessages)) {
          rawMessages = response.data.directMessages;
        }

        const formattedMessages = rawMessages.map((message) => ({
          id:
            message.id || message.uuid || `msg-${Date.now()}-${Math.random()}`,
          text: message.content || message.text || "",
          content: message.content || message.text || "",
          sender: message.sender || {
            uuid: message.sender_uuid,
            name: message.sender_name,
          },
          senderName: message.sender?.name || message.sender_name || "",
          timestamp: message.created_at || message.timestamp || Date.now(),
          _raw: message,
        }));

        const hasMore = response.data.pagination?.hasMore ?? false;

        set((state) => ({
          messages: [...formattedMessages, ...state.messages],
          currentPage: nextPage,
          hasMoreMessages: hasMore,
        }));
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchLatestMessages: async (chatId) => {
    const user = useAuth.getState().user;
    if (!user || !chatId) return;

    try {
      let receiverUuid = chatId;
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const { getMessagesBetweenUsers } = await import("@/services/messageService");
      const messages = await getMessagesBetweenUsers(receiverUuid, 0); // Always fetch page 0 for latest
      const response = { data: { data: messages } };

      if (response.data) {
        let rawMessages = [];

        if (Array.isArray(response.data)) {
          rawMessages = response.data;
        } else if (Array.isArray(response.data.data)) {
          rawMessages = response.data.data;
        } else if (Array.isArray(response.data.directMessages)) {
          rawMessages = response.data.directMessages;
        }

        const formattedMessages = rawMessages.map((message) => ({
          id:
            message.id || message.uuid || `msg-${Date.now()}-${Math.random()}`,
          text: message.content || message.text || "",
          content: message.content || message.text || "",
          sender: message.sender || {
            uuid: message.sender_uuid,
            name: message.sender_name,
          },
          senderName: message.sender?.name || message.sender_name || "",
          timestamp: message.created_at || message.timestamp || Date.now(),
          _raw: message,
        }));

        const hasMore = response.data.pagination?.hasMore ?? true; // Default to true if not specified
        set({
          messages: formattedMessages,
          hasMoreMessages: hasMore, // Update based on actual pagination info
        });
      }
    } catch (error) {
      set({ error: error.message });
    }
  },

  sendMessage: async (content, chatId, receiverUuid) => {
    const user = useAuth.getState().user;

    if (!user || !content.trim()) return;

    let receiver = receiverUuid;
    if (!receiver && chatId && chatId.startsWith("user-")) {
      receiver = chatId.replace("user-", "");
    }

    if (!receiver) {
      set({ error: "Recipient ID is required." });
      return null;
    }

    let tempId;
    try {
      tempId = `temp-${Date.now()}`;

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

      set((state) => ({
        messages: [...state.messages, tempMessage],
      }));

      const { sendMessage } = await import("@/services/messageService");
      const response = { data: { data: await sendMessage(receiver, content.trim()) } };

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
        // Handle case where message sending might have succeeded but no data returned (or an error status without data.data)
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId
              ? { ...m, isPending: false, failed: !response.data?.success }
              : m
          ),
        }));
      }

      return response.data?.data; // Return the message data if available
    } catch (error) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, isPending: false, failed: true } : m
        ),
        error: error.message,
      }));
      return null;
    }
  },

  startChat: async (otherUser) => {
    const user = useAuth.getState().user;
    const token = useAuth.getState().token;

    if (!user || !otherUser) {
      set({ error: "User information missing." });
      return null;
    }

    if (!token) {
      set({ error: "Authentication token missing." });
      return null;
    }

    try {
      // Check if a chat with this user already exists
      const existingChat = get().chats.find(
        (chat) => chat.receiver_uuid === otherUser.uuid
      );

      if (existingChat) {
        get().setActiveChat(existingChat);
        return existingChat;
      }

      // If no existing chat, create a new one via the backend (optional, depends on backend logic)
      // For now, we'll assume the backend handles chat creation implicitly or this is just for UI state
      // If an API call is needed to create/retrieve a chat, it would go here.
      // For example: const response = await axios.post("/chats", { userId: otherUser.uuid }, { headers: { Authorization: `Bearer ${token}` } });
      // const chatData = response.data.data;

      const newChat = {
        id: `user-${otherUser.uuid}`, // Use a consistent ID format
        name: otherUser.name,
        avatar:
          otherUser.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
        receiver_uuid: otherUser.uuid,
        otherUser: otherUser, // Store the full otherUser object
        last_message: "",
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        chats: [...state.chats, newChat].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        ),
      }));
      get().setActiveChat(newChat);
      return newChat;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },
}));
