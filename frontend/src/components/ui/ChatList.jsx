import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import NewChatModal from "./NewChatModal";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const { chats, loading, fetchChats, setActiveChat } = useChat();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    onSelectChat(chat);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Messages
            </h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setShowNewChatModal(true)}
              title="Start new chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    selectedChat === chat.id
                      ? "bg-indigo-50 dark:bg-slate-700"
                      : ""
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {chat.time ||
                            new Date(chat.lastMessageTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                {searchTerm ? (
                  "No conversations found"
                ) : (
                  <div>
                    <p className="mb-2">No conversations yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewChatModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start your first chat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
    </>
  );
}
