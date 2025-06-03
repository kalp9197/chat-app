import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";

export default function ChatMessage({ message }) {
  const user = useAuth((s) => s.user);
  const isOwnMessage = message.sender_uuid === user.uuid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwnMessage
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
  );
}