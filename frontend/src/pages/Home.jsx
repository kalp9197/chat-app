import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useChat } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ChatList from "@/components/ChatList";
import Chat from "@/components/Chat";

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [selectedChat, setSelectedChat] = useState(null);
  const { stopMessagePolling, setActiveChat } = useChat();
  
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setActiveChat(chat);
  };
  
  useEffect(() => {
    return () => {
      stopMessagePolling();
    };
  }, [stopMessagePolling]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden h-[calc(100vh-12rem)]"
        >
          <div className="flex h-full">
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700">
              <ChatList
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat?.id}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <Chat chat={selectedChat} />
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}