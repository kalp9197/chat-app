import React from "react";
import { ArrowDown } from "lucide-react";

const ChatHeader = ({ name, avatar, onScrollToBottom }) => {
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
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
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
