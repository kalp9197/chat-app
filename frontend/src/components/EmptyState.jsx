import { MessageSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
      <MessageSquare size={48} className="mb-4 opacity-50" />
      <p className="text-lg font-medium">Select a user to start messaging</p>
      <p className="text-sm opacity-75">Your messages will appear here</p>
    </div>
  );
}