import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { motion as Motion } from "framer-motion";
import ChatList from "@/components/chat/ChatList";
import Chat from "@/components/chat/Chat";

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [selectedChat, setSelectedChat] = useState(null);
  const { stopMessagePolling, setActiveChat } = useChat();

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setActiveChat(chat);
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopMessagePolling();
    };
  }, [stopMessagePolling]);

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
    >
      {/* Header with logout button */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Chat App
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.name || user?.email}
            </span>
            <Button
              onClick={logout}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden h-[calc(100vh-12rem)]"
        >
          <div className="flex h-full">
            {/* Chat List */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700">
              <ChatList
                onSelectChat={handleSelectChat}
                currentChatId={selectedChat?.id}
              />
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              <Chat chatId={selectedChat?.id} />
            </div>
          </div>
        </Motion.div>
      </main>
    </Motion.div>
  );
}
