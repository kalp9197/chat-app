import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroupChat } from "@/hooks/useGroupChat";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import EmptyState from "../common/EmptyState";
import { ArrowDown, Loader2 } from "lucide-react";

const GroupChat = ({ group }) => {
  const user = useAuth((s) => s.user);

  // Group chat store
  const {
    messages,
    setActiveGroup,
    cleanupNotifications,
    sendMessage,
    loading,
    loadingMore,
    hasMoreMessages,
    loadMoreMessages,
  } = useGroupChat();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const loadingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Set active group when prop changes
  useEffect(() => {
    if (group) {
      setActiveGroup(group);
      setFirstLoad(true);
    }
    return () => {
      // cleanup when component unmounts or group changes
      cleanupNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.uuid, setActiveGroup, cleanupNotifications]);

  // Handle loading more messages when scrolling to top
  const handleScroll = useCallback(async () => {
    if (!messageContainerRef.current || loadingRef.current || !group) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messageContainerRef.current;

    // Show/hide scroll to bottom button
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);

    // Check if we're near the top and have more messages to load
    const nearTop = scrollTop < 200;

    if (nearTop && hasMoreMessages && !loadingMore) {
      loadingRef.current = true;
      setPrevScrollHeight(scrollHeight);

      try {
        await loadMoreMessages(group.uuid);
      } finally {
        loadingRef.current = false;
      }
    }
  }, [group, hasMoreMessages, loadMoreMessages, loadingMore]);

  // Scroll to bottom when new messages arrive and auto-scroll is enabled
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, autoScroll]);

  // Handle initial load and new messages from current user
  useEffect(() => {
    if (!group) return;

    if (firstLoad && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      setFirstLoad(false);
    } else if (
      messages.length > 0 &&
      messages[messages.length - 1]?.sender?.uuid === user?.uuid
    ) {
      setAutoScroll(true);
    }
  }, [messages, firstLoad, user, group]);

  // Maintain scroll position when loading more messages
  useEffect(() => {
    if (prevScrollHeight > 0 && messageContainerRef.current) {
      const newScrollHeight = messageContainerRef.current.scrollHeight;
      messageContainerRef.current.scrollTop =
        newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages.length, prevScrollHeight]);

  // Add scroll event listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, group]);

  const scrollToBottom = useCallback(() => {
    setAutoScroll(true);
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

    // Auto-scroll will be disabled on manual scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setAutoScroll(false);
    }, 1000);
  }, []);

  const handleSendMessage = async (message) => {
    const isFile = typeof message === "object" && message.file;
    const text = isFile ? message.text : message;

    if (!isFile && !text.trim()) {
      return;
    }
    await sendMessage(message);
  };

  // Cleanup on unmount
  useEffect(() => {
    const timeoutRef = scrollTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <EmptyState message="Select a group to start chatting" icon="💬" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Message Container */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-6 bg-gray-50"
      >
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600 mb-2">
                  No messages yet. Say something to start the conversation!
                </p>
                <div className="text-4xl">👋</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-500" />
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} id={`message-${message.id}`}>
                  <ChatMessage message={message} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 rounded-full bg-white shadow-md p-2 hover:bg-gray-100 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default GroupChat;
