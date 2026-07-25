import { memo } from "react";

interface Props {
  responseType?: string;
  hotels?: any[];
  onSend: (text: string) => void;
}

const SUGGESTIONS: Record<string, string[]> = {
  hotels: ["Show rooms", "What's the price?", "Any deals?"],
  rooms: ["Book this room", "Show more photos", "Compare prices"],
  general: ["Show me hotels in Goa", "Best time to visit Manali", "Budget hotels in Delhi"],
};

const SuggestedReplies = memo(function SuggestedReplies({ responseType, onSend }: Props) {
  const suggestions = SUGGESTIONS[responseType || 'general'] || SUGGESTIONS.general;

  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-1">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSend(s)}
          className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 
            text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 
            hover:bg-brand-50 hover:border-brand-200 dark:hover:bg-brand-900/20 dark:hover:border-brand-700
            hover:text-brand-600 dark:hover:text-brand-400 transition-all"
        >
          {s}
        </button>
      ))}
    </div>
  );
});

export default SuggestedReplies;
