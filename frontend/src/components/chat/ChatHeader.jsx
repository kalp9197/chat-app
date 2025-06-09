import React from "react";
import { ArrowDown } from "lucide-react";
import { formatLastSeen } from "@/services/userService";

const ChatHeader = ({ name, avatar, onScrollToBottom, user }) => {
  const isOnline = user?.online;
  const lastSeen = user?.last_seen;

  return (
    <div className="flex items-center p-3 border-b bg-white shadow-sm">
      <div className="flex items-center flex-grow">
        <div className="relative w-10 h-10 mr-3">
          <img
            src={
              avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
            }
            alt={`${name}'s avatar`}
            className="w-full h-full rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
          {/* Online status indicator */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center text-xs">
            {isOnline ? (
              <div className="text-green-600 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                <span>Online</span>
              </div>
            ) : (
              <div className="text-gray-500">
                {lastSeen
                  ? `Last seen: ${formatLastSeen(lastSeen)}`
                  : "Offline"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keep only the scroll to bottom button */}
      {onScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          title="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
