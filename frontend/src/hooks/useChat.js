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
  isInitialLoad: true,

  setActiveChat: (chat) => {
    const { notificationUnsubscribe, activeChat } = get();

    // --- FIX: Only reset if the chat actually changed ---
    if (activeChat?.id === chat?.id) {
      // Same chat, just update notifications
      if (notificationUnsubscribe) notificationUnsubscribe();
      if (chat) {
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
      return; // Don't reset state!
    }

    // If chat is different, reset as before
    if (notificationUnsubscribe) {
      notificationUnsubscribe();
    }

    set({
      activeChat: chat,
      messages: [],
      currentPage: 0,
      hasMoreMessages: true,
      isInitialLoad: true,
    });

    if (chat) {
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

      const { getMessagesBetweenUsers } = await import(
        "@/services/messageService"
      );
      const messages = await getMessagesBetweenUsers(receiverUuid, 0, 10);

      if (Array.isArray(messages)) {
        const formattedMessages = messages.map((message) => ({
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
          created_at: message.created_at || message.timestamp || Date.now(),
          _raw: message,
        }));

        // Remove duplicates by id
        const uniqueMessages = formattedMessages.filter(
          (message, index, self) =>
            index === self.findIndex((m) => m.id === message.id)
        );

        set({
          messages: uniqueMessages,
          hasMoreMessages: messages.length >= 10,
          currentPage: 0,
          isInitialLoad: false,
        });
      }
    } catch (error) {
      set({ error: error.message, isInitialLoad: false });
    } finally {
      set({ loading: false });
    }
  },

  loadMoreMessages: async (chatId) => {
    const user = useAuth.getState().user;
    const { currentPage, loading } = get();

    if (!user || !chatId || loading) return;

    const nextPage = currentPage + 1;

    try {
      set({ loading: true, error: null });

      let receiverUuid = chatId;
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const { getMessagesBetweenUsers } = await import(
        "@/services/messageService"
      );
      const messages = await getMessagesBetweenUsers(
        receiverUuid,
        nextPage,
        10
      );

      if (Array.isArray(messages)) {
        const formattedMessages = messages.map((message) => ({
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
          created_at: message.created_at || message.timestamp || Date.now(),
          _raw: message,
        }));

        set((state) => {
          // Combine old and new messages, removing duplicates
          const allMessages = [...formattedMessages, ...state.messages];
          const uniqueMessages = allMessages.filter(
            (message, index, self) =>
              index === self.findIndex((m) => m.id === message.id)
          );

          return {
            messages: uniqueMessages,
            currentPage: nextPage,
            hasMoreMessages: messages.length >= 10,
          };
        });
      } else {
        set({ hasMoreMessages: false });
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

      const { getMessagesBetweenUsers } = await import(
        "@/services/messageService"
      );
      const messages = await getMessagesBetweenUsers(receiverUuid, 0, 10);

      if (Array.isArray(messages)) {
        const formattedMessages = messages.map((message) => ({
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
          created_at: message.created_at || message.timestamp || Date.now(),
          _raw: message,
        }));

        set((state) => {
          // Merge with existing messages, avoiding duplicates
          const existingIds = new Set(state.messages.map((m) => m.id));
          const newMessages = formattedMessages.filter(
            (m) => !existingIds.has(m.id)
          );

          if (newMessages.length > 0) {
            return {
              messages: [...state.messages, ...newMessages],
            };
          }

          return state;
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

    const tempId = `temp-${Date.now()}-${Math.random()}`;

    try {
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
        failed: false,
      };

      // Add temp message immediately
      set((state) => ({
        messages: [...state.messages, tempMessage],
      }));

      const { sendMessage } = await import("@/services/messageService");
      const serverMessage = await sendMessage(
        "direct",
        receiver,
        content.trim()
      );

      if (serverMessage) {
        // Update temp message with server response
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId
              ? {
                  id: serverMessage.id || serverMessage.uuid || tempId,
                  text: serverMessage.content || m.text,
                  content: serverMessage.content || m.content,
                  sender: serverMessage.sender || {
                    uuid: serverMessage.sender_uuid || user.uuid,
                    name: serverMessage.sender_name || user.name,
                  },
                  senderName:
                    serverMessage.sender?.name ||
                    serverMessage.sender_name ||
                    user.name,
                  timestamp: serverMessage.created_at || m.timestamp,
                  created_at: serverMessage.created_at || m.created_at,
                  isPending: false,
                  failed: false,
                }
              : m
          ),
        }));

        return serverMessage;
      } else {
        throw new Error("Failed to send message: Invalid server response");
      }
    } catch (error) {
      // Mark temp message as failed
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

      const newChat = {
        id: `user-${otherUser.uuid}`,
        name: otherUser.name,
        avatar:
          otherUser.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
        receiver_uuid: otherUser.uuid,
        otherUser: otherUser,
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
