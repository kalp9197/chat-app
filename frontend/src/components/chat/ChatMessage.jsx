import React, { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
    }, [message, user]);

    const [showTimestamp, setShowTimestamp] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    const timeAgo = useMemo(() => {
      if (!message.timestamp && !message.created_at) return "";
      const date = message.timestamp
        ? new Date(message.timestamp)
        : new Date(message.created_at);
      return formatDistanceToNow(date, { addSuffix: true });
    }, [message.timestamp, message.created_at]);

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
        className={cn(
          "group w-full flex mb-4 last:mb-2",
          isSentByMe ? "justify-end" : "justify-start"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowTimestamp(!showTimestamp)}
      >
        {!isSentByMe ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-start mt-1 mr-2 flex-shrink-0">
            {senderInitial}
          </div>
        ) : null}

        <div className="flex flex-col max-w-[90%] md:max-w-[80%]">
          {/* Timestamp */}
          <div
            className={cn(
              "text-xs text-gray-400 whitespace-nowrap transition-opacity duration-200 mb-1",
              isSentByMe ? "text-right pr-2" : "pl-2",
              showTimestamp || isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {timeAgo}
          </div>

          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200",
              isSentByMe
                ? "bg-blue-500 text-white rounded-br-sm"
                : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
            )}
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
              className={cn(
                "flex items-center mt-1 text-xs text-gray-500",
                isSentByMe ? "justify-end pr-2" : "justify-start pl-2"
              )}
            >
              <span>{formattedTime}</span>
              {isSentByMe && <div className="ml-2">{statusIcon}</div>}
            </div>
          )}
        </div>

        {isSentByMe && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-start mt-1 ml-2 flex-shrink-0">
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
