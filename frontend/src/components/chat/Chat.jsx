import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import EmptyState from "../common/EmptyState";

const Chat = ({ chatId }) => {
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

  //eslint-disable-next-line
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
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

  const currentChat = useMemo(
    () => chats.find((c) => c.id === chatId),
    [chats, chatId]
  );

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.created_at).getTime();
      const timeB = new Date(b.timestamp || b.created_at).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  const shouldAutoScroll = useCallback(() => {
    if (!messageContainerRef.current || !sortedMessages.length) return false;

    const container = messageContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const isMyMessage =
      lastMessage?.sender?.uuid === user?.uuid ||
      lastMessage?.sender === user?.uuid;

    return isNearBottom || isMyMessage || shouldScrollToBottom;
  }, [sortedMessages, user?.uuid, shouldScrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current || isScrollingRef.current) return;

    const container = messageContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore && !loading) {
      handleLoadMore();
    }
  }, [hasMoreMessages, isLoadingMore, loading]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesEndRef.current) return;

    isScrollingRef.current = true;
    messagesEndRef.current.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  }, []);

  const handleSendMessage = useCallback(
    async (message) => {
      if (!user?.uuid || !chatId || !message.trim()) return;

      setShouldScrollToBottom(true);
      await sendMessage(message, chatId);

      setTimeout(() => scrollToBottom(false), 100);
    },
    [user?.uuid, chatId, sendMessage, scrollToBottom]
  );

  const handleLoadMore = useCallback(async () => {
    if (
      !hasMoreMessages ||
      isLoadingMore ||
      !messageContainerRef.current ||
      loading
    ) {
      return;
    }

    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }

    setIsLoadingMore(true);
    const container = messageContainerRef.current;
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
      console.error("Error loading more messages:", error);
      setIsLoadingMore(false);
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages, chatId, loading]);

  // ------------------- MAIN FIX IS IN THIS EFFECT -------------------
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
      // <--- THIS HANDLES THE DOUBLE CLICK CASE --->
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
        if (loadMoreTimeoutRef.current) {
          clearTimeout(loadMoreTimeoutRef.current);
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
  // -------------------------------------------------------------------

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
  }, [
    sortedMessages.length,
    hasInitialized,
    shouldAutoScroll,
    scrollToBottom,
    sortedMessages,
  ]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading chat...</p>
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
        style={{ scrollBehavior: "auto" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1">
            {hasMoreMessages && hasInitialized && !isAtBottom && (
              <div className="flex justify-center py-4 sticky top-0 z-10">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className={`px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-lg border border-gray-200 transition-all duration-200 ${
                    isLoadingMore
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl"
                  }`}
                >
                  {isLoadingMore ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More Messages"
                  )}
                </button>
              </div>
            )}

            {sortedMessages.map((message, index) => (
              <ChatMessage key={`${message.id}-${index}`} message={message} />
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
