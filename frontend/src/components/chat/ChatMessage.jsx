import React, { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const ChatMessage = React.memo(
  ({ message }) => {
    const user = useAuth((state) => state.user);

    const messageData = useMemo(() => {
      if (!message || !user) return null;

      const isSentByMe =
        message.sender?.uuid === user.uuid || message.sender === user.uuid;
      const senderName = message.sender?.name || message.senderName || "";
      const timestamp = message.timestamp || message.created_at;
      const formattedTime = timestamp
        ? new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const messageText = message.text || message.content || "";
      const senderInitial = isSentByMe
        ? (user.name?.charAt(0) || "M").toUpperCase()
        : (senderName.charAt(0) || "?").toUpperCase();

      return {
        isSentByMe,
        senderName,
        formattedTime,
        messageText,
        senderInitial,
      };
    }, [
      message.sender,
      message.timestamp,
      message.created_at,
      message.text,
      message.content,
      message.senderName,
      user,
    ]);

    const statusIcon = useMemo(() => {
      if (message.isPending)
        return (
          <div className="flex items-center text-xs text-gray-400">
            <Clock size={12} className="mr-1" />
            <span>Sending</span>
          </div>
        );
      if (message.failed)
        return (
          <div className="flex items-center text-xs text-red-500">
            <AlertCircle size={12} className="mr-1" />
            <span>Failed</span>
          </div>
        );
      return <CheckCircle2 size={12} className="text-gray-400" />;
    }, [message.isPending, message.failed]);

    if (!messageData) return null;

    const {
      isSentByMe,
      senderName,
      formattedTime,
      messageText,
      senderInitial,
    } = messageData;

    return (
      <div
        className={`flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`}
        style={{ minHeight: "40px" }}
      >
        {!isSentByMe && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-end mr-3 flex-shrink-0">
            {senderInitial}
          </div>
        )}

        <div className="max-w-[70%] min-w-0">
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
              isSentByMe
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
            }`}
          >
            {!isSentByMe && senderName && (
              <div className="text-xs font-semibold mb-1 text-purple-600">
                {senderName}
              </div>
            )}
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {messageText}
            </div>
          </div>

          {formattedTime && (
            <div
              className={`flex items-center mt-1 px-2 text-xs text-gray-500 ${
                isSentByMe ? "justify-end" : "justify-start"
              }`}
            >
              <span>{formattedTime}</span>
              {isSentByMe && <div className="ml-2">{statusIcon}</div>}
            </div>
          )}
        </div>

        {isSentByMe && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-end ml-3 flex-shrink-0">
            {senderInitial}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.isPending === nextProps.message.isPending &&
      prevProps.message.failed === nextProps.message.failed &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.timestamp === nextProps.message.timestamp
    );
  }
);

ChatMessage.displayName = "ChatMessage";
export default ChatMessage;
