import { create } from "zustand";
import axios from "../lib/axios";
import { useAuth } from "./useAuth";
import {
  listenForNotifications,
  listenForStatusUpdates,
} from "../services/notificationService";

export const useChat = create((set, get) => ({
  messages: [],
  chats: [],
  activeChat: null,
  users: [],
  loading: false,
  error: null,
  notificationUnsubscribe: null,
  statusUnsubscribe: null,
  currentPage: 0,
  hasMoreMessages: true,

  setActiveChat: (chat) => {
    const { notificationUnsubscribe, statusUnsubscribe } = get();

    // Cleanup existing subscriptions
    if (notificationUnsubscribe) {
      notificationUnsubscribe();
    }

    if (statusUnsubscribe) {
      statusUnsubscribe();
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

    // Always listen for status updates regardless of active chat
    const newStatusUnsubscribe = listenForStatusUpdates((statusData) => {
      get().updateUserStatus(statusData);
    });

    set({ statusUnsubscribe: newStatusUnsubscribe });
  },

  cleanupNotifications: () => {
    const { notificationUnsubscribe, statusUnsubscribe } = get();

    if (notificationUnsubscribe) {
      notificationUnsubscribe();
      set({ notificationUnsubscribe: null });
    }

    if (statusUnsubscribe) {
      statusUnsubscribe();
      set({ statusUnsubscribe: null });
    }
  },

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const token = useAuth.getState().token;
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        const users = response.data.users || [];

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
      const response = await axios.get("/users");
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

      let receiverUuid = chatId;
      if (chatId.startsWith("user-")) {
        receiverUuid = chatId.replace("user-", "");
      }

      const page = get().currentPage;
      const response = await axios.get(
        `/direct-messages/${receiverUuid}?page=${page}`
      );

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

      const response = await axios.get(
        `/direct-messages/${receiverUuid}?page=${nextPage}`
      );

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

      const response = await axios.get(
        `/direct-messages/${receiverUuid}?page=0`
      );

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

        const hasMore = response.data.pagination?.hasMore ?? true;
        set({
          messages: formattedMessages,
          hasMoreMessages: hasMore,
        });
      }
    } catch (error) {
      console.error("Error fetching latest messages:", error);
    }
  },

  sendMessage: async (content, chatId, receiverUuid) => {
    const user = useAuth.getState().user;

    if (!user || !content.trim()) return;

    let receiver = receiverUuid;
    if (!receiver && chatId && chatId.startsWith("user-")) {
      receiver = chatId.replace("user-", "");
    }

    try {
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

      set((state) => ({
        messages: [...state.messages, tempMessage],
      }));

      const response = await axios.post("/direct-messages", {
        content: content.trim(),
        receiver_uuid: receiver,
      });

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
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId ? { ...m, isPending: false } : m
          ),
        }));
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.message?.includes("FCM token")) {
        set((state) => ({
          messages: state.messages.map((m) =>
            /* eslint-disable */
            m.id === tempId ? { ...m, isPending: false } : m
          ),
        }));

        return { success: true };
      }

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

  updateUserStatus: (statusData) => {
    set((state) => {
      // Update in users list
      const updatedUsers = state.users.map((user) => {
        if (user.uuid === statusData.userUuid) {
          return {
            ...user,
            online: statusData.isOnline,
            last_seen: statusData.lastSeen,
          };
        }
        return user;
      });

      // Update in chats list
      const updatedChats = state.chats.map((chat) => {
        if (chat.receiver_uuid === statusData.userUuid) {
          return {
            ...chat,
            otherUser: {
              ...chat.otherUser,
              online: statusData.isOnline,
              last_seen: statusData.lastSeen,
            },
          };
        }
        return chat;
      });

      return {
        users: updatedUsers,
        chats: updatedChats,
      };
    });
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

      const existingChat = get().chats.find(
        (chat) => chat.receiver_uuid === otherUser.uuid
      );

      if (existingChat) {
        get().setActiveChat(existingChat);
        return existingChat;
      }

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

        set((state) => ({
          chats: [...state.chats, newChat],
        }));

        get().setActiveChat(newChat);

        return newChat;
      }

      return null;
    } catch (error) {
      return null;
    }
  },
}));
