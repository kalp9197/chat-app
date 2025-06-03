import { Circle } from "lucide-react";

export default function ChatHeader({ activeChat, userStatus }) {
  return (
    <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-lg font-medium">{activeChat.name[0].toUpperCase()}</span>
          </div>
          <Circle
            size={12}
            className={`absolute bottom-0 right-0 ${
              userStatus?.online
                ? "fill-green-500 text-green-500"
                : "fill-gray-500 text-gray-500"
            }`}
          />
        </div>
        <div>
          <h3 className="font-semibold">{activeChat.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {userStatus?.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}