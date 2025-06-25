import { create } from 'zustand';
import { useAuth } from './useAuth';
import { listenForNotifications } from '@/services/notificationService';
import * as groupService from '@/services/groupService';
import { uploadFileAndSend } from '@/services/uploadService';
import { sendMessage as sendMessageService } from '@/services/messageService';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const MESSAGES_PER_PAGE = 10;

const formatMessages = (rawMessages) =>
  rawMessages.map((m) => ({
    uuid: m.uuid,
    id: m.id || m.uuid || `msg-${Date.now()}-${Math.random()}`,
    content: m.content,
    message_type: m.message_type,
    sender: m.sender || {
      uuid: m.sender_uuid,
      name: m.sender_name,
    },
    senderName: m.sender?.name || m.sender_name || '',
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

  setActiveGroup: (group) => {
    const { notificationUnsubscribe } = get();

    if (!group) {
      notificationUnsubscribe?.();
      set({ activeGroup: null, messages: [], notificationUnsubscribe: null });
      return;
    }

    notificationUnsubscribe?.();

    set({ activeGroup: group, messages: [], error: null, loading: true });

    get().fetchMessages(group.uuid);

    const unsubscribe = listenForNotifications((payload) => {
      if (
        payload?.data?.type === 'chat_message' &&
        payload?.data?.chatId === `group-${group.uuid}`
      ) {
        get().fetchLatestMessages(group.uuid);
      }
    });

    set({ notificationUnsubscribe: unsubscribe });
  },

  cleanupNotifications: () => {
    const { notificationUnsubscribe } = get();
    notificationUnsubscribe?.();
    set({ notificationUnsubscribe: null });
  },

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
        hasMoreMessages: data.pagination?.hasMore ?? true,
      });
    } catch (error) {
      console.error('Failed to fetch group messages:', error);
      set({
        error: error.message || 'Failed to load messages',
        loading: false,
      });
    }
  },

  fetchLatestMessages: async (groupUuid) => {
    if (!groupUuid) return;
    try {
      const data = await groupService.getGroupByUuid(groupUuid, 0, MESSAGES_PER_PAGE);
      const formatted = formatMessages(data.messages || []);
      set({
        messages: formatted,
        currentPage: 0,
        hasMoreMessages: data.pagination?.hasMore ?? true,
      });
    } catch (error) {
      console.error('Failed to fetch latest messages:', error);
    }
  },

  sendMessage: async (message) => {
    const { activeGroup } = get();
    const user = useAuth.getState().user;
    if (!activeGroup || !user) return;

    const isFileMessage = typeof message === 'object' && message.file;
    const textContent = isFileMessage ? message.text : message;
    const file = isFileMessage ? message.file : null;

    if (!file && !textContent.trim()) return;

    const tempId = `temp-${Date.now()}`;
    let tempContent;
    if (isFileMessage) {
      const previewData = await fileToBase64(file);
      tempContent = { fileName: file.name, type: file.type, data: previewData };
    } else {
      tempContent = textContent.trim();
    }
    const tempMessage = {
      uuid: tempId,
      id: tempId,
      content: tempContent,
      message_type: isFileMessage ? 'file' : 'text',
      sender: { uuid: user.uuid, name: user.name },
      senderName: user.name,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      isPending: true,
    };

    set((state) => ({ messages: [...state.messages, tempMessage] }));

    try {
      let serverMessage;
      if (isFileMessage) {
        serverMessage = await uploadFileAndSend(file, 'group', activeGroup.uuid);
      } else {
        serverMessage = await sendMessageService('group', activeGroup.uuid, textContent.trim());
      }

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId
            ? {
                ...m,
                uuid: serverMessage.uuid,
                ...formatMessages([serverMessage])[0],
                isPending: false,
                content:
                  serverMessage.message_type === 'file' &&
                  m.content &&
                  m.content.data &&
                  (!serverMessage.content || !serverMessage.content.data)
                    ? { ...serverMessage.content, data: m.content.data }
                    : serverMessage.content,
              }
            : m,
        ),
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, isPending: false, failed: true } : m,
        ),
      }));
    }
  },

  loadMoreMessages: async (groupUuid) => {
    const { currentPage, hasMoreMessages, loadingMore, messages } = get();
    if (!groupUuid || !hasMoreMessages || loadingMore) return 0;

    set({ loadingMore: true, error: null });

    try {
      const nextPage = currentPage + 1;
      const data = await groupService.getGroupByUuid(groupUuid, nextPage, MESSAGES_PER_PAGE);
      const newMessages = formatMessages(data.messages || []);

      const allMessages = [...newMessages, ...messages];
      const uniqueMessages = allMessages.filter(
        (message, index, self) => index === self.findIndex((m) => m.id === message.id),
      );

      set({
        messages: uniqueMessages,
        loadingMore: false,
        currentPage: nextPage,
        hasMoreMessages: data.pagination?.hasMore ?? false,
      });

      return newMessages.length;
    } catch (error) {
      console.error('Failed to load more messages:', error);
      set({
        error: error.message || 'Failed to load more messages',
        loadingMore: false,
      });
      return 0;
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

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

  deleteMessage: async (messageUuid) => {
    const originalMessages = get().messages;
    set((state) => ({
      messages: state.messages.filter((m) => m.uuid !== messageUuid),
    }));
    try {
      const { deleteMessage } = await import('@/services/messageService');
      await deleteMessage(messageUuid);
    } catch (error) {
      set({ messages: originalMessages, error: 'Failed to delete message' });
      console.error('Failed to delete message:', error);
    }
  },

  removeMessageByUuid: (messageUuid) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.uuid !== messageUuid),
    }));
  },
}));
