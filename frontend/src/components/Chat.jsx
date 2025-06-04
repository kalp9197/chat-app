import React, { useState, useEffect, useRef } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useAuth } from "@/store/auth";
import { useChat } from "@/store/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";

export default function Chat({ chat }) {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const user = useAuth((s) => s.user);
  const { messages, sendMessage, updateUserStatus, fetchMessages } = useChat();

  // Load messages when chat is selected
  useEffect(() => {
    if (chat?.id) {
      fetchMessages(chat.id);
    }
  }, [chat?.id, fetchMessages]);

  useEffect(() => {
    if (user) {
      updateUserStatus(true);

      return () => updateUserStatus(false);
    }
  }, [user, updateUserStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chat?.id || !user) return;

    try {
      await sendMessage(input, chat.receiverUuid || chat.id);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!chat) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900 text-slate-400">
        <div className="text-center p-8 max-w-md">
          <h3 className="text-xl font-medium mb-2">No chat selected</h3>
          <p className="text-sm">Select a conversation or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Chat header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>{chat.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium text-slate-900 dark:text-white">
            {chat.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chat.online ? "Online" : "Last seen recently"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user?.uuid ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender !== user?.uuid && (
                <Avatar className="h-8 w-8 mt-4 mr-2">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                  message.sender === user?.uuid
                    ? "bg-indigo-500 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
                }`}
              >
                <div className="text-sm">{message.text}</div>
                <div className="text-xs mt-1 opacity-70">
                  {(() => {
                    let formattedTime = "";
                    try {
                      const timestamp = new Date(message.timestamp);
                      if (!isNaN(timestamp.getTime())) {
                        formattedTime = timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                    } catch {
                      // Silently handle invalid dates
                    }
                    return formattedTime;
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handlePaperclipClick}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Button>
          <div className="relative flex-1 flex items-center">
            <Input
              type="text"
              placeholder="Type a message..."
              className="pr-10"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="absolute right-2" ref={emojiPickerRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-10 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme={
                      document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light"
                    }
                    previewPosition="none"
                    skinTonePosition="search"
                    searchPosition="sticky"
                    set="native"
                    emojiSize={22}
                    emojiButtonSize={32}
                    perLine={8}
                    noResultsEmoji=""
                    autoFocus={true}
                  />
                </div>
              )}
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-indigo-500 hover:bg-indigo-600"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
