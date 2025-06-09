import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import EmptyState from "../common/EmptyState";
import { ArrowDown } from "lucide-react";

const Chat = ({ chatId }) => {
  const user = useAuth((s) => s.user);
  const messages = useChat((s) => s.messages);
  const activeChat = useChat((s) => s.activeChat);
  const fetchMessages = useChat((s) => s.fetchMessages);
  const loadMoreMessages = useChat((s) => s.loadMoreMessages);
  const hasMoreMessages = useChat((s) => s.hasMoreMessages);
  const sendMessage = useChat((s) => s.sendMessage);
  const setActiveChat = useChat((s) => s.setActiveChat);
  const chats = useChat((s) => s.chats);
  const cleanupNotifications = useChat((s) => s.cleanupNotifications);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const loadMoreButtonRef = useRef(null);
  const firstMessageRef = useRef(null);

  // Set active chat on load if needed
  useEffect(() => {
    if (chatId && !activeChat) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
        setFirstLoad(true);
      }
    }
  }, [chatId, chats, activeChat, setActiveChat]);

  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId, fetchMessages]);

  // Scroll to bottom only on first load or new message from current user
  useEffect(() => {
    if (firstLoad && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      setFirstLoad(false);
    } else if (
      messages.length > 0 &&
      messages[messages.length - 1]?.sender?.uuid === user?.uuid
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, firstLoad, user]);

  useEffect(() => cleanupNotifications, [cleanupNotifications]);

  // Show scroll button if user scrolls up
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleSendMessage = async (message) => {
    if (!user || !chatId || !message.trim()) return;
    await sendMessage(message, chatId);
  };

  const handleLoadMore = async () => {
    if (hasMoreMessages && !isLoadingMore) {
      setIsLoadingMore(true);

      // Save the scroll position relative to the first visible message
      const firstMessage =
        messages.length > 0
          ? document.getElementById(`message-${messages[0].id}`)
          : null;
      const firstMessagePosition = firstMessage
        ? firstMessage.getBoundingClientRect().top
        : 0;

      // Load more messages
      await loadMoreMessages(chatId);

      // Wait for DOM update
      setTimeout(() => {
        // Find the previously first message (now it's somewhere in the middle)
        if (firstMessage) {
          // Restore scroll position relative to what was previously the first message
          const newPosition = firstMessage.getBoundingClientRect().top;
          const scrollDifference = newPosition - firstMessagePosition;
          messageContainerRef.current.scrollTop += scrollDifference;
        }
        setIsLoadingMore(false);
      }, 0);
    }
  };

  if (!chatId || !activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <EmptyState message="Select a chat to start messaging" icon="💬" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ChatHeader
        name={activeChat.name}
        avatar={activeChat.avatar}
        onScrollToBottom={scrollToBottom}
        user={activeChat.otherUser}
      />

      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-6 bg-gray-50"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600 mb-2">
                  No messages yet. Say hello to start the conversation!
                </p>
                <div className="text-4xl">👋</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {hasMoreMessages && (
                <div
                  className="flex justify-center my-4"
                  ref={loadMoreButtonRef}
                >
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={`px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200 ${
                      isLoadingMore ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoadingMore ? "Loading..." : "Load More Messages"}
                  </button>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  ref={index === 0 ? firstMessageRef : null}
                >
                  <ChatMessage message={message} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 rounded-full bg-white shadow-md p-2 hover:bg-gray-100 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
