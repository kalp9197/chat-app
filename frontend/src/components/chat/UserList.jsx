import React, { useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { formatLastSeen } from "@/services/userService";

const UserList = ({ onSelectUser }) => {
  const { fetchAllUsers, users, loading } = useChat();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading users...</div>
    );
  }

  if (!users || users.length === 0) {
    return <div className="p-4 text-center text-gray-500">No users found</div>;
  }

  return (
    <ul className="divide-y overflow-y-auto">
      {users.map((user) => (
        <li
          key={user.uuid}
          className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
          onClick={() => onSelectUser(user)}
        >
          <div className="relative w-10 h-10 mr-3">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
              }
              alt={`${user.name}'s avatar`}
              className="w-full h-full rounded-full object-cover"
            />
            {/* Online status indicator */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                user.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            {/* Last seen status */}
            <span className="text-xs text-gray-500">
              {user.online
                ? "Online"
                : user.last_seen
                ? `Last seen: ${formatLastSeen(user.last_seen)}`
                : "Offline"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
