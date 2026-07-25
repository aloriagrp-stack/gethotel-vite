import { useState, useEffect, memo } from "react";
import { WifiOff } from "lucide-react";

const OfflineBanner = memo(function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-200 dark:border-amber-800/50">
      <WifiOff className="w-3.5 h-3.5 text-amber-500" />
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
        You're offline — messages will be sent when connection restores
      </span>
    </div>
  );
});

export default OfflineBanner;
