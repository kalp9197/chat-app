import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import EmptyState from '@/components/common/EmptyState';

const UserList = ({ onSelectUser }) => {
  const { fetchAllUsers, users, loading, error } = useChat();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading users: {error}
        <button
          onClick={fetchAllUsers}
          className="block mx-auto mt-2 text-blue-500 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!users || users.length === 0) {
    // Show empty state if no users
    return <EmptyState message="No users found" actionText="Refresh" action={fetchAllUsers} />;
  }

  return (
    <ul className="divide-y overflow-y-auto">
      {users.map((user) => (
        <li
          key={user.uuid || user.id}
          className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
          onClick={() => onSelectUser(user)}
        >
          <div className="relative w-10 h-10 mr-3">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'user'}`
              }
              alt={`${user.name || 'User'}'s avatar`}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'user'}`;
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || 'Unknown User'}</span>
            {user.email && <span className="text-sm text-gray-500">{user.email}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
