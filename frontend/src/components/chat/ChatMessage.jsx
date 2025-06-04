import React from "react";
import { useAuth } from "@/hooks/useAuth";

const ChatMessage = ({ message }) => {
  const user = useAuth((s) => s.user);

  // Check if the message was sent by the current user
  // Messages from backend include sender.uuid whereas our optimistic updates use just sender
  const isSentByMe =
    (message.sender?.uuid && message.sender.uuid === user?.uuid) || // Format from backend
    (message.sender && message.sender === user?.uuid); // Format from optimistic update

  // Extract the sender name
  const senderName = message.sender?.name || message.senderName || "";

  // Status indicator for message sending state
  const messageStatus = message.isPending ? (
    <span className="ml-2 text-xs">sending...</span>
  ) : message.failed ? (
    <span className="ml-2 text-xs text-red-500">failed</span>
  ) : null;

  return (
    <div
      className={`flex w-full ${
        isSentByMe ? "justify-end" : "justify-start"
      } mb-4`}
      data-sender={isSentByMe ? "me" : "other"}
    >
      {/* Left side avatar for received messages */}
      {!isSentByMe && (
        <div className="w-8 h-8 rounded-full bg-purple-100 mr-2 flex-shrink-0 self-end overflow-hidden border-2 border-purple-200">
          <div className="w-full h-full flex items-center justify-center text-purple-600 text-xs font-bold">
            {senderName.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`
          relative px-4 py-2 rounded-t-lg
          ${
            isSentByMe
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-l-lg rounded-br-none shadow-md"
              : "bg-white text-gray-800 rounded-r-lg rounded-bl-none border border-gray-200 shadow-sm"
          }
          max-w-[70%]
        `}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text || message.content || ""}
        </p>

        {/* Time and status */}
        <div
          className={`flex items-center mt-1 text-xs ${
            isSentByMe ? "text-blue-100" : "text-gray-500"
          }`}
        >
          <span>
            {new Date(
              message.timestamp || message.created_at || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {messageStatus}
        </div>

        {/* Triangle for speech bubble effect */}
        <div
          className={`absolute bottom-0 w-3 h-3 
            ${
              isSentByMe
                ? "right-0 transform translate-x-[95%] translate-y-[30%] bg-blue-600 rotate-45"
                : "left-0 transform -translate-x-[95%] translate-y-[30%] bg-white rotate-45 border-l border-b border-gray-200"
            }`}
        />
      </div>

      {/* Right side avatar for sent messages */}
      {isSentByMe && (
        <div className="w-8 h-8 rounded-full bg-blue-100 ml-2 flex-shrink-0 self-end overflow-hidden border-2 border-blue-200">
          <div className="w-full h-full flex items-center justify-center text-blue-600 text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "M"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
