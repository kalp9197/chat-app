import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile, Paperclip, Send } from "lucide-react";

// Basic error boundary for emoji picker
function EmojiPickerErrorBoundary({ children }) {
  const [hasError] = useState(false);
  return hasError ? (
    <div>Failed to load emoji picker.</div>
  ) : (
    <React.Suspense fallback={<div>Loading...</div>}>{children}</React.Suspense>
  );
}

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Hide emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSendMessage(message);
      setMessage("");
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((msg) => msg + (emoji.native || ""));
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // File input handler (stub for now)
  const handleFileSelect = (e) => {
    e.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
      <div className="flex items-center relative max-w-3xl mx-auto bg-gray-50 rounded-full shadow-sm border border-gray-200 px-3 py-1">
        <label className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors p-1">
          <Paperclip className="w-5 h-5" />
          <input type="file" className="hidden" onChange={handleFileSelect} />
        </label>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSubmitting}
          className="flex-grow bg-transparent border-none px-3 py-1 focus:outline-none disabled:bg-transparent"
          aria-label="Message"
        />
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!message.trim() || isSubmitting}
          className={`ml-1 p-2 rounded-full ${
            message.trim() && !isSubmitting
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300"
          } text-white focus:outline-none transition-colors`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send size={16} />
          )}
        </button>
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-12 right-2 z-10 shadow-xl rounded-lg overflow-hidden"
          >
            <EmojiPickerErrorBoundary>
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                perLine={7}
                emojiButtonSize={32}
              />
            </EmojiPickerErrorBoundary>
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
