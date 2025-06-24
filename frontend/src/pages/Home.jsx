import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { motion as Motion } from 'framer-motion';
import ChatList from '@/components/chat/ChatList';
import Chat from '@/components/chat/Chat';
import GroupDetails from '@/components/chat/GroupDetails';
import GroupChat from '@/components/chat/GroupChat';

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [selectedChat, setSelectedChat] = useState(null);
  const { setActiveChat } = useChat();
  const { fetchGroups, setActiveGroup } = useGroups();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handles chat or group selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);

    if (chat && chat.id && chat.id.startsWith('group-')) {
      setActiveGroup(chat);
    } else {
      setActiveChat(chat);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
    >
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Chat App</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.name || user?.email}
            </span>
            <Button
              onClick={logout}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center items-start">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex w-full max-w-7xl h-[80vh] mt-8 bg-white dark:bg-slate-900 rounded-lg shadow-md"
        >
          {/* Chat list and chat/group view */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700">
            <ChatList onSelectChat={handleSelectChat} currentChatId={selectedChat?.id} />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedChat?.id?.startsWith('group-') ? (
              <div className="flex flex-col h-full">
                <GroupDetails group={selectedChat} />

                <div className="flex-1 overflow-y-auto">
                  <GroupChat group={selectedChat} />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <Chat chatId={selectedChat?.id} />
              </div>
            )}
          </div>
        </Motion.div>
      </main>
    </Motion.div>
  );
}
