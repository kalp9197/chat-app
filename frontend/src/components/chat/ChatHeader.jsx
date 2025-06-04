import React from "react";

const ChatHeader = ({ name, avatar, onScrollToBottom }) => {
  return (
    <div className="flex items-center p-4 border-b bg-white">
      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
        <img
          src={
            avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
          }
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-medium">{name}</h3>
        <div className="flex items-center text-xs text-green-500">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span>Online</span>
        </div>
      </div>
      {onScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Scroll to bottom"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
