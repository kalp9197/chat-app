import { Circle } from "lucide-react";

export default function UserList({ users, activeChat, userStatuses, onSelectUser }) {
  return (
    <div className="space-y-2">
      {users.map((otherUser) => (
        <button
          key={otherUser.uuid}
          onClick={() => onSelectUser(otherUser)}
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
  );
}