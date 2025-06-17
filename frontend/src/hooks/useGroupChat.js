import { create } from "zustand";
import { useAuth } from "./useAuth";
import { listenForNotifications } from "@/services/notificationService";
import * as groupService from "@/services/groupService";
import { sendMessage as sendMessageService } from "@/services/messageService";

const MESSAGES_PER_PAGE = 10;

const formatMessages = (rawMessages) =>
  rawMessages.map((m) => ({
    id: m.id || m.uuid || `msg-${Date.now()}-${Math.random()}`,
    text: m.content || m.text || "",
    content: m.content || m.text || "",
    sender: m.sender || {
      uuid: m.sender_uuid,
      name: m.sender_name,
    },
    senderName: m.sender?.name || m.sender_name || "",
    timestamp: m.created_at || m.timestamp || Date.now(),
    _raw: m,
  }));

export const useGroupChat = create((set, get) => ({
  messages: [],
  activeGroup: null,
  loading: false,
  loadingMore: false,
  currentPage: 0,
  hasMoreMessages: true,
  error: null,
  notificationUnsubscribe: null,

  // Set active group and subscribe to notifications
  setActiveGroup: (group) => {
    const { notificationUnsubscribe } = get();

    // If passing null, just cleanup
    if (!group) {
      notificationUnsubscribe?.();
      set({ activeGroup: null, messages: [], notificationUnsubscribe: null });
      return;
    }

    // Cleanup previous subscription
    notificationUnsubscribe?.();

    set({ activeGroup: group, messages: [], error: null, loading: true });

    // Fetch messages for this group
    get().fetchMessages(group.uuid);

    // Listen for notifications for this group
    const unsubscribe = listenForNotifications((payload) => {
      if (
        payload?.data?.type === "chat_message" &&
        payload?.data?.chatId === `group-${group.uuid}`
      ) {
        get().fetchLatestMessages(group.uuid);
      }
    });

    set({ notificationUnsubscribe: unsubscribe });
  },

  // Cleanup listener (e.g., on component unmount)
  cleanupNotifications: () => {
    const { notificationUnsubscribe } = get();
    notificationUnsubscribe?.();
    set({ notificationUnsubscribe: null });
  },

  // Fetch all messages for a group (initial load)
  fetchMessages: async (groupUuid) => {
    if (!groupUuid) return;
    set({ loading: true, error: null });
    try {
      const data = await groupService.getGroupByUuid(groupUuid, 0, MESSAGES_PER_PAGE);
      const formatted = formatMessages(data.messages || []);
      set({ 
        messages: formatted, 
        loading: false,
        currentPage: 0,
        hasMoreMessages: data.pagination?.hasMore ?? true
      });
    } catch (error) {
      console.error("Failed to fetch group messages:", error);
      set({
        error: error.message || "Failed to load messages",
        loading: false,
      });
    }
  },

  // Fetch latest messages (after receiving a notification)
  fetchLatestMessages: async (groupUuid) => {
    if (!groupUuid) return;
    try {
      // Always fetch first page for latest messages
      const data = await groupService.getGroupByUuid(groupUuid, 0, MESSAGES_PER_PAGE);
      const formatted = formatMessages(data.messages || []);
      set({ 
        messages: formatted,
        currentPage: 0,
        hasMoreMessages: data.pagination?.hasMore ?? true
      });
    } catch (error) {
      console.error("Failed to fetch latest messages:", error);
    }
  },

  // Send a message to the group with optimistic update
  sendMessage: async (content) => {
    const { activeGroup, messages } = get();
    const user = useAuth.getState().user;
    if (!content.trim() || !activeGroup || !user) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      text: content.trim(),
      content: content.trim(),
      sender: { uuid: user.uuid, name: user.name },
      senderName: user.name,
      timestamp: new Date().toISOString(),
      isPending: true,
    };

    // Optimistic update
    set({ messages: [...messages, tempMessage] });

    try {
      const serverMessage = await sendMessageService(
        "group",
        activeGroup.uuid,
        content.trim()
      );

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? formatMessages([serverMessage])[0] : m
        ),
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, isPending: false, failed: true } : m
        ),
        error: error.message,
      }));
    }
  },

  // Load more messages for pagination
  loadMoreMessages: async (groupUuid) => {
    const { currentPage, hasMoreMessages, loadingMore, messages } = get();
    if (!groupUuid || !hasMoreMessages || loadingMore) return 0;

    set({ loadingMore: true, error: null });
    
    try {
      const nextPage = currentPage + 1;
      const data = await groupService.getGroupByUuid(groupUuid, nextPage, MESSAGES_PER_PAGE);
      const newMessages = formatMessages(data.messages || []);
      
      // Combine and deduplicate messages
      const allMessages = [...newMessages, ...messages];
      const uniqueMessages = allMessages.filter((message, index, self) => 
        index === self.findIndex((m) => m.id === message.id)
      );

      set({
        messages: uniqueMessages,
        loadingMore: false,
        currentPage: nextPage,
        hasMoreMessages: data.pagination?.hasMore ?? false,
      });
      
      return newMessages.length; // Return number of new messages loaded
    } catch (error) {
      console.error("Failed to load more messages:", error);
      set({
        error: error.message || "Failed to load more messages",
        loadingMore: false,
      });
      return 0;
    }
  },

  // Clear messages
  clearMessages: () => {
    set({ messages: [] });
  },

  // Reset store
  reset: () => {
    const { notificationUnsubscribe } = get();
    notificationUnsubscribe?.();
    set({
      messages: [],
      activeGroup: null,
      loading: false,
      loadingMore: false,
      error: null,
      notificationUnsubscribe: null,
      currentPage: 0,
      hasMoreMessages: true,
    });
  },
}));
