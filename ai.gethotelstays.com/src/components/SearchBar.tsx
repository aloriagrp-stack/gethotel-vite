import { useState, memo } from "react";
import { Search, X } from "lucide-react";

interface ConversationItem {
  id: string;
  title: string;
  updatedAt?: string;
}

interface Props {
  conversations: ConversationItem[];
  onConversationClick: (id: string) => void;
  theme?: 'light' | 'dark';
}

const SearchBar = memo(function SearchBar({ conversations, onConversationClick, theme = 'light' }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConversationItem[]>([]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const qLower = q.toLowerCase();
    const found = conversations.filter(c => c.title.toLowerCase().includes(qLower));
    setResults(found.slice(0, 10));
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full border shadow-sm transition-all ${
        theme === 'dark'
          ? "bg-[#1e1e22] border-[#2e2e34] text-slate-200 hover:border-slate-700"
          : "bg-white/80 border-slate-200/90 text-slate-700 hover:border-slate-300"
      }`}>
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search chats..."
          className={`w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400 select-none ${
            theme === 'dark' ? "text-slate-100" : "text-slate-700"
          }`}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setResults([]); }} 
            className="p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className={`absolute top-full mt-1.5 left-0 right-0 rounded-2xl shadow-2xl border max-h-64 overflow-y-auto z-[1050] scrollbar-thin backdrop-blur-xl ${
          theme === 'dark' ? "bg-[#18181c]/95 border-[#2e2e34] text-slate-100" : "bg-white/95 border-slate-200/90 text-slate-800"
        }`}>
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => { onConversationClick(c.id); setQuery(""); setResults([]); }}
              className={`w-full text-left px-3.5 py-2.5 border-b last:border-0 transition-colors ${
                theme === 'dark' ? "hover:bg-[#25252b] border-[#28282e]" : "hover:bg-slate-100/70 border-slate-100"
              }`}
            >
              <span className="text-xs font-semibold text-slate-300 truncate block">{c.title}</span>
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <div className={`absolute top-full mt-1.5 left-0 right-0 rounded-2xl shadow-2xl border p-4 text-center z-[1050] backdrop-blur-xl ${
          theme === 'dark' ? "bg-[#18181c]/95 border-[#2e2e34]" : "bg-white/95 border-slate-200/90"
        }`}>
          <p className="text-xs font-medium text-slate-400">No chats found</p>
        </div>
      )}
    </div>
  );
});

export default SearchBar;
