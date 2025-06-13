import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroupChat } from "@/hooks/useGroupChat";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import EmptyState from "../common/EmptyState";
import { ArrowDown } from "lucide-react";

const GroupChat = ({ group }) => {
  const user = useAuth((s) => s.user);

  // Group chat store
  const messages = useGroupChat((s) => s.messages);
  const setActiveGroup = useGroupChat((s) => s.setActiveGroup);
  const cleanupNotifications = useGroupChat((s) => s.cleanupNotifications);
  const sendMessage = useGroupChat((s) => s.sendMessage);
  const loading = useGroupChat((s) => s.loading);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

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
  }, [group?.uuid, setActiveGroup, cleanupNotifications]);

  // Scroll behavior similar to direct Chat
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

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
  };

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
