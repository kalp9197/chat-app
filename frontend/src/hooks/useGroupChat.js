import { create } from "zustand";
import { useAuth } from "./useAuth";
import { listenForNotifications } from "@/services/notificationService";
import * as groupService from "@/services/groupService";
import { uploadFileAndSend } from "@/services/uploadService";
import { sendMessage as sendMessageService } from "@/services/messageService";

// Helper for preview
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });

const MESSAGES_PER_PAGE = 10;

const formatMessages = (rawMessages) =>
  rawMessages.map((m) => ({
    id: m.id || m.uuid || `msg-${Date.now()}-${Math.random()}`,
    content: m.content,
    message_type: m.message_type,
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
      const data = await groupService.getGroupByUuid(
        groupUuid,
        0,
        MESSAGES_PER_PAGE
      );
      const formatted = formatMessages(data.messages || []);
      set({
        messages: formatted,
        loading: false,
        currentPage: 0,
        hasMoreMessages: data.pagination?.hasMore ?? true,
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
      const data = await groupService.getGroupByUuid(
        groupUuid,
        0,
        MESSAGES_PER_PAGE
      );
      const formatted = formatMessages(data.messages || []);
      set({
        messages: formatted,
        currentPage: 0,
        hasMoreMessages: data.pagination?.hasMore ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch latest messages:", error);
    }
  },

  // Send a message to the group with optimistic update
  sendMessage: async (message) => {
    const { activeGroup } = get();
    const user = useAuth.getState().user;
    if (!activeGroup || !user) return;

    const isFileMessage = typeof message === "object" && message.file;
    const textContent = isFileMessage ? message.text : message;
    const file = isFileMessage ? message.file : null;

    if (!file && !textContent.trim()) return;

    const tempId = `temp-${Date.now()}`;
    let tempContent;
    if (isFileMessage) {
      // Add preview for sender
      const previewData = await fileToBase64(file);
      tempContent = { fileName: file.name, type: file.type, data: previewData };
    } else {
      tempContent = textContent.trim();
    }
    const tempMessage = {
      id: tempId,
      content: tempContent,
      message_type: isFileMessage ? "file" : "text",
      sender: { uuid: user.uuid, name: user.name },
      senderName: user.name,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      isPending: true,
    };

    // Optimistic update
    set((state) => ({ messages: [...state.messages, tempMessage] }));

    try {
      let serverMessage;
      if (isFileMessage) {
        serverMessage = await uploadFileAndSend(
          file,
          "group",
          activeGroup.uuid
        );
      } else {
        serverMessage = await sendMessageService(
          "group",
          activeGroup.uuid,
          textContent.trim()
        );
      }

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId
            ? {
                ...m,
                ...formatMessages([serverMessage])[0],
                isPending: false,
                // Preserve preview data for sender if backend doesn't include it
                content:
                  serverMessage.message_type === "file" &&
                  m.content &&
                  m.content.data &&
                  (!serverMessage.content || !serverMessage.content.data)
                    ? { ...serverMessage.content, data: m.content.data }
                    : serverMessage.content,
              }
            : m
        ),
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, isPending: false, failed: true } : m
        ),
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
      const data = await groupService.getGroupByUuid(
        groupUuid,
        nextPage,
        MESSAGES_PER_PAGE
      );
      const newMessages = formatMessages(data.messages || []);

      // Combine and deduplicate messages
      const allMessages = [...newMessages, ...messages];
      const uniqueMessages = allMessages.filter(
        (message, index, self) =>
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
