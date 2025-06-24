import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import EmptyState from '../common/EmptyState';

const Chat = ({ chatId }) => {
  // chatId is the uuid of the chat
  const user = useAuth((state) => state.user);
  const {
    messages,
    activeChat,
    chats,
    loading,
    hasMoreMessages,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    setActiveChat,
    cleanupNotifications,
  } = useChat();

  const [setShowScrollButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const prevChatIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const isScrollingRef = useRef(false);
  const lastMessageIdRef = useRef(null);
  const loadMoreTimeoutRef = useRef(null);

  const currentChat = useMemo(() => chats.find((c) => c.id === chatId), [chats, chatId]);

  // sort messages by timestamp
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.created_at).getTime();
      const timeB = new Date(b.timestamp || b.created_at).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  // should auto scroll if user is typing or if the last message is from the user
  const shouldAutoScroll = useCallback(() => {
    if (!messageContainerRef.current || !sortedMessages.length) return false;

    const container = messageContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const isMyMessage =
      lastMessage?.sender?.uuid === user?.uuid || lastMessage?.sender === user?.uuid;

    return isNearBottom || isMyMessage || shouldScrollToBottom;
  }, [sortedMessages, user?.uuid, shouldScrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current || isScrollingRef.current) return;

    const container = messageContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore && !loading) {
      const loadMore = async () => {
        if (loadMoreTimeoutRef.current) {
          clearTimeout(loadMoreTimeoutRef.current);
        }

        setIsLoadingMore(true);
        const heightBefore = container.scrollHeight;
        const scrollTopBefore = container.scrollTop;

        try {
          await loadMoreMessages(chatId);

          loadMoreTimeoutRef.current = setTimeout(() => {
            if (container) {
              const heightAfter = container.scrollHeight;
              const heightDiff = heightAfter - heightBefore;
              container.scrollTop = scrollTopBefore + heightDiff;
            }
            setIsLoadingMore(false);
          }, 100);
        } catch (error) {
          console.error('Error loading more messages:', error);
          setIsLoadingMore(false);
        }
      };

      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreMessages, isLoadingMore, loading, loadMoreMessages, chatId]);

  // scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesEndRef.current) return;

    isScrollingRef.current = true;
    messagesEndRef.current.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  }, []);

  const handleSendMessage = useCallback(
    async (message) => {
      if (!user?.uuid || !chatId) return;

      const isFile = typeof message === 'object' && message.file;
      const text = isFile ? message.text : message;

      if (!isFile && !text.trim()) {
        return;
      }

      setShouldScrollToBottom(true);
      await sendMessage(message, chatId);
    },
    [user?.uuid, chatId, sendMessage],
  );

  // handle chat change
  useEffect(() => {
    if (!chatId) {
      setHasInitialized(false);
      setShouldScrollToBottom(true);
      return;
    }

    const chatChanged = prevChatIdRef.current !== chatId;

    if (chatChanged) {
      setHasInitialized(false);
      setShouldScrollToBottom(true);
      prevMessagesLengthRef.current = 0;
      lastMessageIdRef.current = null;

      if (currentChat) {
        setActiveChat(currentChat);
        fetchMessages(chatId).then(() => {
          setHasInitialized(true);
          setTimeout(() => scrollToBottom(false), 200);
        });
      }

      prevChatIdRef.current = chatId;
    } else {
      if (currentChat && (!messages || messages.length === 0) && !loading) {
        fetchMessages(chatId).then(() => {
          setHasInitialized(true);
          setTimeout(() => scrollToBottom(false), 200);
        });
      }
    }

    return () => {
      if (chatChanged) {
        cleanupNotifications();
        const timeoutRef = loadMoreTimeoutRef.current;
        if (timeoutRef) {
          clearTimeout(timeoutRef);
        }
      }
    };
  }, [
    chatId,
    currentChat,
    setActiveChat,
    fetchMessages,
    cleanupNotifications,
    scrollToBottom,
    messages,
    loading,
  ]);

  useEffect(() => {
    if (!sortedMessages.length || !hasInitialized) return;

    const isNewMessage = sortedMessages.length > prevMessagesLengthRef.current;
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const isNewUniqueMessage = lastMessage?.id !== lastMessageIdRef.current;

    if (isNewMessage && isNewUniqueMessage && shouldAutoScroll()) {
      setShouldScrollToBottom(false);
      setTimeout(() => scrollToBottom(true), 100);
    }

    prevMessagesLengthRef.current = sortedMessages.length;
    if (lastMessage) {
      lastMessageIdRef.current = lastMessage.id;
    }
  }, [sortedMessages.length, hasInitialized, shouldAutoScroll, scrollToBottom, sortedMessages]);

  useEffect(() => {
    const timeoutRef = loadMoreTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <EmptyState message="Select a chat to start messaging" icon="💬" />
      </div>
    );
  }

  if (!hasInitialized && loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <EmptyState message="Chat not found" icon="❌" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ChatHeader
        name={activeChat.name}
        avatar={activeChat.avatar}
        onScrollToBottom={() => scrollToBottom(true)}
        user={activeChat.otherUser}
      />

      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-6 bg-gray-50"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-500" />
              </div>
            )}
            {sortedMessages.map((message, index) => (
              <div key={`${message.id}-${index}`} id={`message-${message.id}`}>
                <ChatMessage message={message} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default React.memo(Chat);
