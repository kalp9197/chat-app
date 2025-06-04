import React, { useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import EmptyState from "../common/EmptyState";
import UserList from "./UserList";

const ChatList = ({ onSelectChat, currentChatId }) => {
  const fetchChats = useChat((s) => s.fetchChats);
  const chats = useChat((s) => s.chats);
  const startChat = useChat((s) => s.startChat);
  const [showUsersList, setShowUsersList] = useState(false);

  useEffect(() => {
    // Fetch chats when component mounts
    fetchChats();
  }, [fetchChats]);

  const handleStartNewChat = async (user) => {
    const chat = await startChat(user);
    if (chat) {
      onSelectChat(chat);
    }
    setShowUsersList(false);
  };

  // Sort chats by most recently updated
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  if (showUsersList) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Chat</h2>
          <button
            onClick={() => setShowUsersList(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>
        <UserList onSelectUser={handleStartNewChat} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={() => setShowUsersList(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          New Chat
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {sortedChats.length === 0 ? (
          <EmptyState
            message="No chats yet"
            action={() => setShowUsersList(true)}
            actionText="Start a conversation"
          />
        ) : (
          <ul className="divide-y">
            {sortedChats.map((chat) => (
              <li
                key={chat.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  currentChatId === chat.id ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={chat.avatar}
                      alt={`${chat.name}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base font-medium">{chat.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message || "Click to start chatting"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
