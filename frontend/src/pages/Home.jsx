import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Send, LogOut, Circle } from "lucide-react";

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { 
    activeChat,
    messages,
    users,
    sendMessage,
    listenToMessages,
    updateUserStatus,
    fetchUsers,
    setActiveChat,
    listenToUserStatus
  } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    updateUserStatus(true);
    fetchUsers();
    return () => updateUserStatus(false);
  }, []);

  useEffect(() => {
    users.forEach(otherUser => {
      listenToUserStatus(otherUser.uuid, (status) => {
        setUserStatuses(prev => ({
          ...prev,
          [otherUser.uuid]: status
        }));
      });
    });
  }, [users]);

  useEffect(() => {
    if (activeChat) {
      listenToMessages(activeChat.uuid);
    }
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await sendMessage(newMessage, activeChat.uuid);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-800 dark:text-slate-100"
          >
            Welcome, {user?.name}
          </motion.h1>
          <Button
            onClick={logout}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Users List */}
          <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="space-y-2">
              {users.map((otherUser) => (
                <button
                  key={otherUser.uuid}
                  onClick={() => setActiveChat(otherUser)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeChat?.uuid === otherUser.uuid
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="font-medium">{otherUser.name}</span>
                  <Circle
                    size={12}
                    className={`${
                      userStatuses[otherUser.uuid]?.online
                        ? "fill-green-500 text-green-500"
                        : "fill-gray-500 text-gray-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col h-[calc(100vh-12rem)]">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{activeChat.name}</h3>
                    <Circle
                      size={12}
                      className={`${
                        userStatuses[activeChat.uuid]?.online
                          ? "fill-green-500 text-green-500"
                          : "fill-gray-500 text-gray-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${
                          message.sender_uuid === user.uuid ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_uuid === user.uuid
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-slate-700"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {format(new Date(message.timestamp), "HH:mm")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" className="flex items-center gap-2">
                      <Send size={18} />
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                Select a user to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}