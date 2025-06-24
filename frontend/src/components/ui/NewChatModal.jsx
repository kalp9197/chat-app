import React, { useState, useEffect } from 'react';
import { Search, X, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

export default function NewChatModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { users, loading, fetchAllUsers, startChat } = useChat();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (isOpen) {
      if (!loading && (!users || users.length === 0)) {
        fetchAllUsers().catch(() => {});
      }
    }
  }, [isOpen, loading, users, fetchAllUsers]);

  const filteredUsers = users.filter((u) => {
    if (u.uuid === user?.uuid) return false;

    if (!searchQuery.trim()) return true;

    return (
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartChat = async (otherUser) => {
    try {
      await startChat(otherUser);
      onClose();
      setSearchQuery('');
    } catch {
      alert('Failed to start chat. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Start New Chat</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>
                  {searchQuery ? `No users found matching "${searchQuery}"` : 'No users available'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredUsers.map((otherUser) => (
                  <div
                    key={otherUser.uuid}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => handleStartChat(otherUser)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            otherUser.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`
                          }
                          alt={otherUser.name}
                        />
                        <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {otherUser.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {otherUser.email}
                        </p>
                      </div>
                      <MessageCircle className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
