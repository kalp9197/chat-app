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
  const sendMessage = useChat((s) => s.sendMessage);
  const setActiveChat = useChat((s) => s.setActiveChat);
  const chats = useChat((s) => s.chats);
  const stopMessagePolling = useChat((s) => s.stopMessagePolling);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Initial load - find active chat
  useEffect(() => {
    if (chatId && !activeChat) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [chatId, chats, activeChat, setActiveChat]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  // Scroll to bottom whenever:
  // 1. Messages are loaded (new messages array)
  // 2. Chat ID changes (switching chats)
  useEffect(() => {
    if (messagesEndRef.current) {
      // Force scroll to bottom immediately
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, chatId]);

  // Chat cleanup on unmount
  useEffect(() => {
    return () => {
      stopMessagePolling();
    };
  }, [stopMessagePolling]);

  // Handle scroll position and show/hide scroll button
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show button when user has scrolled up more than 100px from bottom
      setShowScrollButton(scrollBottom > 100);
    }
  };

  // Function to force scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (message) => {
    if (!user || !chatId || message.trim() === "") return;

    try {
      await sendMessage(message, chatId);
      // Ensure we scroll to bottom after sending
      setTimeout(scrollToBottom, 50);
    } catch {
      // Error handling is managed in the sendMessage function
    }
  };

  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <EmptyState message="Select a chat to start messaging" icon="💬" />
      </div>
    );
  }

  if (!activeChat) {
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
      />

      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-6 bg-gray-50 scroll-smooth"
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
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
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
