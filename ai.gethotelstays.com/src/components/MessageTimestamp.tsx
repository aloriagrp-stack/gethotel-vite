import { memo } from "react";

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "abhi";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const MessageTimestamp = memo(function MessageTimestamp({ timestamp, isUser }: { timestamp?: number; isUser?: boolean }) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return (
    <span className={`text-[10px] mt-1 block ${isUser ? "text-white/60 text-right" : "text-slate-400 dark:text-slate-500"}`}>
      {formatRelativeTime(date)}
    </span>
  );
});

export default MessageTimestamp;
