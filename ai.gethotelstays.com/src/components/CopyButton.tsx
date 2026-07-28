import { useState, memo } from "react";
import { Copy, Check } from "lucide-react";

const CopyButton = memo(function CopyButton({ text, theme = 'light' }: { text: string; theme?: 'light' | 'dark' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1.5 rounded-lg transition-all cursor-pointer select-none border-0 bg-transparent ${
        copied
          ? "text-emerald-500"
          : theme === 'dark'
          ? "text-slate-400 hover:text-slate-200 hover:bg-white/10"
          : "text-slate-400 hover:text-slate-700 hover:bg-black/5"
      }`}
      title={copied ? "Copied!" : "Copy message"}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" />
      )}
    </button>
  );
});

export default CopyButton;
