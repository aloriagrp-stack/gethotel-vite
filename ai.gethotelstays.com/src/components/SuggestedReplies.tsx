import { memo } from "react";

interface Props {
  responseType?: string;
  hotels?: any[];
  onSend: (text: string) => void;
  theme?: 'light' | 'dark';
}

const SUGGESTIONS: Record<string, string[]> = {
  hotels: ["Show rooms", "What's the price?", "Any deals?"],
  rooms: ["Book this room", "Show more photos", "Compare prices"],
  general: ["Show me hotels in Goa", "Best time to visit Manali", "Budget hotels in Delhi"],
};

const SuggestedReplies = memo(function SuggestedReplies({ responseType, onSend, theme = 'light' }: Props) {
  const suggestions = SUGGESTIONS[responseType || 'general'] || SUGGESTIONS.general;

  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-1">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSend(s)}
          className={`px-3.5 py-2 text-xs font-semibold rounded-2xl border transition-all cursor-pointer shadow-sm select-none ${
            theme === 'dark'
              ? "bg-[#18181c] border-[#2e2e34] text-slate-200 hover:bg-[#222228] hover:border-slate-600"
              : "bg-white/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
});

export default SuggestedReplies;
