import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const ChatMessage = ({ message }) => {
  const user = useAuth((s) => s.user);

  // Detect message sender (supports backend and optimistic format)
  const isSentByMe =
    (message.sender?.uuid && message.sender.uuid === user?.uuid) ||
    (message.sender && message.sender === user?.uuid);

  const senderName = message.sender?.name || message.senderName || "";

  // Format time
  const formattedTime = new Date(
    message.timestamp || message.created_at || Date.now()
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Render message status icon
  const messageStatus = message.isPending ? (
    <div className="flex items-center text-xs">
      <Clock size={12} className="mr-1" />
      <span>Sending</span>
    </div>
  ) : message.failed ? (
    <div className="flex items-center text-xs text-red-500">
      <AlertCircle size={12} className="mr-1" />
      <span>Failed</span>
    </div>
  ) : (
    <div className="flex items-center text-xs">
      <CheckCircle2 size={12} className="mr-1" />
    </div>
  );

  return (
    <div
      className={`flex ${
        isSentByMe ? "justify-end" : "justify-start"
      } animate-fadeIn mb-2`}
    >
      {/* Avatar (other user or me) */}
      {!isSentByMe && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-purple-100 flex items-center justify-center text-white text-xs font-bold self-end mr-2">
          {senderName.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}

      <div className="max-w-[75%]">
        <div
          className={`
          px-3 py-2 rounded-lg shadow-sm
          ${
            isSentByMe
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }
        `}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text || message.content || ""}
          </p>
        </div>
        <div
          className={`
          flex items-center mt-1 px-1 text-xs
          ${isSentByMe ? "justify-end" : "justify-start"}
          text-gray-500
        `}
        >
          <span>{formattedTime}</span>
          {isSentByMe && <div className="ml-2">{messageStatus}</div>}
        </div>
      </div>

      {isSentByMe && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-100 flex items-center justify-center text-white text-xs font-bold self-end ml-2">
          {user?.name?.charAt(0)?.toUpperCase() || "M"}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
