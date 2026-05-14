

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "@/components/common/Image";
import { MapPin, Clock, TrendingUp, Hotel, Landmark, X } from "lucide-react";
import { destinations, recentSearches } from "@/data/searchMockData";
import type { SearchSuggestion, SuggestionCategory } from "@/types/search";
import { cn } from "@/lib/utils";

interface DestinationFieldProps {
    value: SearchSuggestion | null;
    onChange: (s: SearchSuggestion | null) => void;
    onFocus?: () => void;
    isActive: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

const categoryMeta: Record<SuggestionCategory, { icon: React.ElementType; label: string; color: string }> = {
    city: { icon: MapPin, label: "City", color: "text-brand-500" },
    hotel: { icon: Hotel, label: "Hotel", color: "text-violet-500" },
    landmark: { icon: Landmark, label: "Landmark", color: "text-amber-500" },
    trending: { icon: TrendingUp, label: "Trending", color: "text-red-500" },
    nearby: { icon: MapPin, label: "Near You", color: "text-emerald-500" },
    recent: { icon: Clock, label: "Recent", color: "text-slate-400" },
};

export default function DestinationField({
    value,
    onChange,
    isActive,
    onActivate,
    onDeactivate,
}: DestinationFieldProps) {
    const [query, setQuery] = useState(value?.label ?? "");
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Simulate loading skeleton
    const [shown, setShown] = useState<SearchSuggestion[]>([]);
    useEffect(() => {
        if (!isActive) return;
        setIsLoading(true);
        const t = setTimeout(() => {
            if (query.trim()) {
                setShown(destinations.filter((d) => d.label.toLowerCase().includes(query.toLowerCase())));
            } else {
                setShown(destinations.slice(0, 8));
            }
            setIsLoading(false);
        }, 220);
        return () => clearTimeout(t);
    }, [query, isActive]);

    const handleSelect = (s: SearchSuggestion) => {
        onChange(s);
        setQuery(s.label);
        onDeactivate();
    };

    const handleClear = () => {
        onChange(null);
        setQuery("");
        inputRef.current?.focus();
    };

    // Group suggestions
    const grouped: Record<string, SearchSuggestion[]> = {};
    if (query.trim() === "" && isActive) {
        // Show structured groups
        grouped["🕐 Recent Searches"] = recentSearches;
        grouped["🔥 Trending This Weekend"] = shown.filter((s) => s.category === "trending");
        grouped["🏙️ Popular Cities"] = shown.filter((s) => s.category === "city").slice(0, 5);
        grouped["🏨 Top Hotels"] = shown.filter((s) => s.category === "hotel").slice(0, 3);
    } else {
        grouped["Results"] = shown;
    }

    return (
        <div className="relative flex-1 min-w-0">
            {/* Input */}
            <motion.div
                className={cn(
                    "flex items-center gap-3 px-5 py-4 rounded-2xl cursor-text transition-colors duration-200",
                    isActive ? "bg-white ring-2 ring-brand-400 ring-offset-0 shadow-lg" : "hover:bg-slate-50/80"
                )}
                onClick={() => { onActivate(); inputRef.current?.focus(); }}
                whileHover={{ scale: isActive ? 1 : 1.005 }}
                transition={{ duration: 0.15 }}
            >
                <div className={cn("shrink-0 transition-colors", isActive ? "text-brand-600" : "text-slate-400")}>
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Destination
                    </p>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); onActivate(); }}
                        onFocus={onActivate}
                        placeholder="Where are you going?"
                        className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder-slate-400 truncate"
                        aria-label="Search destination"
                    />
                </div>
                {query && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        className="shrink-0 w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-3 h-3 text-slate-600" />
                    </button>
                )}
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-full min-w-[360px] bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] border border-slate-100 z-[100] overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="max-h-[420px] overflow-y-auto py-2">
                                {Object.entries(grouped).map(([grp, items]) => {
                                    if (!items.length) return null;
                                    return (
                                        <div key={grp}>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-3 pb-1.5">
                                                {grp}
                                            </p>
                                            {items.map((s) => {
                                                const meta = categoryMeta[s.category];
                                                const Icon = meta.icon;
                                                return (
                                                    <motion.button
                                                        key={s.id}
                                                        whileHover={{ x: 3 }}
                                                        transition={{ duration: 0.12 }}
                                                        onClick={() => handleSelect(s)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left"
                                                    >
                                                        {/* Thumbnail or Icon */}
                                                        {s.thumbnail ? (
                                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                                                <Image src={s.thumbnail} alt={s.label} fill className="object-cover" sizes="40px" />
                                                            </div>
                                                        ) : (
                                                            <div className={cn("w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-lg")}>
                                                                {s.emoji ?? <Icon className={cn("w-4 h-4", meta.color)} />}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{s.label}</p>
                                                            {s.sublabel && <p className="text-xs text-slate-400 truncate">{s.sublabel}</p>}
                                                        </div>
                                                        {s.trending && (
                                                            <span className="shrink-0 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                                HOT
                                                            </span>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* "AI powered" footer */}
                        <div className="px-4 py-2.5 border-t border-slate-50 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-medium">AI-powered suggestions · Updated live</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



