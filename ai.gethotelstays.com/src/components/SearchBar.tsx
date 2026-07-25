import { useState, memo } from "react";
import { Search, X } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  messages: { text: string; sender: string; timestamp?: number }[];
}

interface Props {
  sessions: ChatSession[];
  onSessionClick: (id: string) => void;
}

const SearchBar = memo(function SearchBar({ sessions, onSessionClick }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ sessionId: string; sessionTitle: string; text: string; sender: string; timestamp?: number }[]>([]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const qLower = q.toLowerCase();
    const found: typeof results = [];
    for (const s of sessions) {
      for (const m of s.messages) {
        if (m.text.toLowerCase().includes(qLower)) {
          found.push({
            sessionId: s.id,
            sessionTitle: s.title,
            text: m.text.slice(0, 120),
            sender: m.sender,
            timestamp: m.timestamp,
          });
          if (found.length >= 20) break;
        }
      }
      if (found.length >= 20) break;
    }
    setResults(found);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="p-0.5">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSessionClick(r.sessionId); setQuery(""); setResults([]); }}
              className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.sender === 'ai' ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                  {r.sender === 'ai' ? 'AI' : 'You'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{r.sessionTitle}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{r.text}</p>
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 text-center z-50">
          <p className="text-xs text-slate-400">No results found</p>
        </div>
      )}
    </div>
  );
});

export default SearchBar;
