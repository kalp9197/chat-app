import React, { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import EmptyState from "../common/EmptyState";

const Chat = ({ chatId }) => {
  const user = useAuth((s) => s.user);
  const messages = useChat((s) => s.messages);
  const activeChat = useChat((s) => s.activeChat);
  const fetchMessages = useChat((s) => s.fetchMessages);
  const sendMessage = useChat((s) => s.sendMessage);
  const setActiveChat = useChat((s) => s.setActiveChat);
  const chats = useChat((s) => s.chats);
  const stopMessagePolling = useChat((s) => s.stopMessagePolling);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Scroll to bottom whenever chatId changes (user selection)
  useEffect(() => {
    if (chatId) {
      // Short delay to ensure messages are loaded and DOM is updated
      const scrollTimer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 300);

      return () => clearTimeout(scrollTimer);
    }
  }, [chatId]);

  useEffect(() => {
    // Find the active chat by ID from our chats list
    if (chatId && !activeChat) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [chatId, chats, activeChat, setActiveChat]);

  useEffect(() => {
    // When chatId changes, we need to fetch messages for this chat
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  // Chat cleanup on unmount
  useEffect(() => {
    return () => {
      stopMessagePolling();
    };
  }, [stopMessagePolling]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messageContainerRef.current) {
      // Check if user is already at the bottom or close to it
      const container = messageContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      // Always scroll if:
      // 1. Adding a new message and we're near the bottom
      // 2. We just switched to this chat and messages were loaded
      // 3. There are few messages (likely a new conversation)
      if (isAtBottom || messages.length <= 5) {
        messagesEndRef.current.scrollIntoView({
          behavior: messages.length <= 5 ? "auto" : "smooth",
        });
      }
    }
  }, [messages]);

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
      setTimeout(scrollToBottom, 100);
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
    <div className="flex flex-col h-full">
      <ChatHeader
        name={activeChat.name}
        avatar={activeChat.avatar}
        onScrollToBottom={scrollToBottom}
      />

      <div
        ref={messageContainerRef}
        className="flex-grow overflow-y-auto p-4 bg-gray-50 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">
              No messages yet. Say hello to start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
