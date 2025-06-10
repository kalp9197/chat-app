import React, { useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import EmptyState from "../common/EmptyState";
import UserList from "./UserList";
import GroupList from "./GroupList";
import CreateGroupModal from "./CreateGroupModal";

const ChatList = ({ onSelectChat, currentChatId }) => {
  const fetchChats = useChat((s) => s.fetchChats);
  const chats = useChat((s) => s.chats);
  const startChat = useChat((s) => s.startChat);
  const [setShowUsersList] = useState(false);
  const [setShowGroupsList] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState("direct"); // direct, users, groups

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
    setCurrentView("direct");
  };

  const handleSelectGroup = (group) => {
    onSelectChat(group);
    setShowGroupsList(false);
  };

  // Sort chats by most recently updated
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  if (currentView === "users") {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Chat</h2>
          <button
            onClick={() => setCurrentView("direct")}
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
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {currentView === "direct" ? "Chats" : "Groups"}
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                currentView === "direct"
                  ? setCurrentView("users")
                  : setShowCreateModal(true)
              }
              variant="outline"
              size="sm"
              className={
                currentView === "direct"
                  ? "text-blue-500 border-blue-500"
                  : "text-green-600 border-green-600"
              }
            >
              {currentView === "direct" ? "New Chat" : "New Group"}
            </Button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              currentView === "direct"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setCurrentView("direct")}
          >
            Chats
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              currentView === "groups"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setCurrentView("groups")}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {currentView === "direct" ? (
          sortedChats.length === 0 ? (
            <EmptyState
              message="No chats yet"
              action={() => setCurrentView("users")}
              actionText="Start a conversation"
            />
          ) : (
            <ul className="divide-y">
              {sortedChats.map((chat) => (
                <li
                  key={chat.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer ${
                    currentChatId === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
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
          )
        ) : (
          <GroupList
            onSelectGroup={handleSelectGroup}
            currentGroupId={currentChatId}
            onCreateGroup={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default ChatList;
