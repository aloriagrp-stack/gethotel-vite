"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, Calendar, Users, MapPin } from "lucide-react";
import type { SmartSearchState } from "@/types/search";
import { cn } from "@/lib/utils";
import DestinationStoryViewer from "@/components/home/DestinationStoryViewer";
import { destinationStories, DestinationStory } from "@/data/stories";
import { useIsMobile } from "@/hooks/useIsMobile";

const DEFAULT_STATE: SmartSearchState = {
    destination: null,
    dates: { checkIn: null, checkOut: null },
    guests: { adults: 2, children: 0, rooms: 1, childAges: [] },
};

interface SmartSearchBarProps {
    className?: string;
    hideStories?: boolean;
    initialState?: Partial<SmartSearchState>;
    onSearch?: () => void;
}

export default function SmartSearchBar({ className, hideStories, initialState, onSearch }: SmartSearchBarProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const [state, setState] = useState<SmartSearchState>({
        ...DEFAULT_STATE,
        ...(initialState || {}),
    });
    const [query, setQuery] = useState(initialState?.destination?.label || "");
    const [isSearching, setIsSearching] = useState(false);
    const [activeStory, setActiveStory] = useState<DestinationStory | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState<"where" | "dates" | "guests" | null>(null);
    const [dateStep, setDateStep] = useState<"from" | "to">("from");

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setActiveSection(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateState = useCallback((updates: Partial<SmartSearchState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const parseQuery = (text: string) => {
        const lower = text.toLowerCase();
        let city = "All";
        let guests = "2";

        const cities = ["goa", "mumbai", "delhi", "bangalore", "shimla", "udaipur", "jaipur", "kerala"];
        for (const c of cities) {
            if (lower.includes(c)) {
                city = c.charAt(0).toUpperCase() + c.slice(1);
                break;
            }
        }

        const guestMatch = lower.match(/(\d+)\s*(person|people|guest)/);
        if (guestMatch) guests = guestMatch[1];
        else if (lower.includes("couple")) guests = "2";
        else if (lower.includes("family")) guests = "4";

        return { city, guests };
    };

    const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
        if (e) e.preventDefault();
        const searchQuery = directQuery !== undefined ? directQuery : query;
        if (!searchQuery && !state.destination) {
            setActiveSection("where");
            return;
        }

        setIsSearching(true);
        const { city, guests: parsedGuests } = parseQuery(searchQuery);

        const params = new URLSearchParams({
            city: state.destination?.label || city,
            checkIn: state.dates.checkIn?.toISOString().split("T")[0] || "",
            checkOut: state.dates.checkOut?.toISOString().split("T")[0] || "",
            guests: String((state.guests?.adults || 2) + (state.guests?.children || 0)) === "2"
                ? (parsedGuests || "2")
                : String(state.guests.adults + state.guests.children),
        });

        await new Promise((r) => setTimeout(r, 700));
        setIsSearching(false);
        if (onSearch) onSearch();
        router.push(`/hotels?${params.toString()}`);
    };

    const TOP_DESTINATIONS = [
        { label: "Goa", region: "Beach & Nightlife", icon: "🏖️" },
        { label: "Udaipur", region: "Lakes & Palaces", icon: "🏰" },
        { label: "Shimla", region: "Snow & Mountains", icon: "🏔️" },
        { label: "Jaipur", region: "Pink City Heritage", icon: "🕌" },
        { label: "Munnar", region: "Tea Gardens & Kerala", icon: "🍃" },
    ];

    const DESTINATION_STORIES = [
        { label: "Goa", query: "Hotels in Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=200&auto=format&fit=crop", badge: "Hot" },
        { label: "Udaipur", query: "Hotels in Udaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=200&auto=format&fit=crop", badge: "Trend" },
        { label: "Shimla", query: "Hotels in Shimla", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=200&auto=format&fit=crop" },
        { label: "Munnar", query: "Hotels in Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=200&auto=format&fit=crop" },
        { label: "Jaipur", query: "Hotels in Jaipur", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=200&auto=format&fit=crop", badge: "New" },
    ];

    const handleDateSelect = (date: Date) => {
        if (dateStep === "from") {
            updateState({ dates: { ...state.dates, checkIn: date } });
            setDateStep("to");
        } else {
            updateState({ dates: { ...state.dates, checkOut: date } });
            if (!hideStories) {
                setActiveSection("guests");
            }
            setDateStep("from");
        }
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="w-full flex justify-start relative z-50">
                <div
                    className={cn(
                        "w-full max-w-[1400px] flex flex-col md:flex-row md:items-center relative transition-all duration-700",
                        !hideStories && "bg-white/60 backdrop-blur-[40px] saturate-[200%] rounded-[40px] md:rounded-full shadow-[0_40px_100px_-20px_rgba(0,40,120,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/40 hover:bg-white/70"
                    )}
                >
                    {/* 1. Destination Section */}
                    <div 
                        onClick={() => setActiveSection("where")}
                        className={cn(
                            "flex flex-[1.2] items-center gap-4 pl-8 pr-4 py-6 md:py-5 border-b border-white/30 md:border-b-0 md:border-r border-white/30 hover:bg-white/50 transition-all duration-500 group relative cursor-pointer",
                            activeSection === "where" && "bg-white/80 shadow-inner",
                            "first:rounded-t-[40px] md:first:rounded-l-full"
                        )}
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50/50 text-brand-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-1">Where</p>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={(e) => { e.stopPropagation(); setActiveSection("where"); }}
                                placeholder="Enter destination..."
                                className="w-full bg-transparent border-none outline-none text-[17px] font-black text-slate-950 placeholder:text-slate-300 italic tracking-tight"
                            />
                        </div>
                        
                        <AnimatePresence>
                            {activeSection === "where" && (
                                <motion.div 
                                    initial={isMobile ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
                                    animate={isMobile ? undefined : { opacity: 1, y: 0, scale: 1 }}
                                    exit={isMobile ? undefined : { opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-[115%] left-0 w-full md:w-[450px] bg-white/95 backdrop-blur-[50px] rounded-[32px] p-8 shadow-premium border border-white/80 z-[100] overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Signature Destinations</p>
                                        <div className="w-8 h-px bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {TOP_DESTINATIONS.map(dest => (
                                            <button
                                                key={dest.label}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuery(dest.label);
                                                    updateState({ destination: { id: dest.label.toLowerCase(), label: dest.label, category: "trending" } });
                                                    if (!hideStories) {
                                                        setActiveSection("dates");
                                                        setDateStep("from");
                                                    } else {
                                                        setActiveSection(null);
                                                    }
                                                }}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-brand-50/50 hover:translate-x-2 transition-all text-left group/item"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover/item:scale-110 transition-transform">
                                                    {dest.icon}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-base italic">{dest.label}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{dest.region}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Dates Section */}
                    <div 
                        onClick={() => { setActiveSection("dates"); setDateStep("from"); }}
                        className={cn(
                            "flex flex-1 items-center gap-4 pl-6 pr-4 py-6 md:py-5 border-b border-white/30 md:border-b-0 md:border-r border-white/30 hover:bg-white/50 transition-all duration-500 group cursor-pointer relative",
                            activeSection === "dates" && "bg-white/80 shadow-inner"
                        )}
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50/50 text-brand-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-1">Check-in/out</p>
                            <p className={cn(
                                "text-[15px] font-black italic transition-colors duration-500 tracking-tight",
                                state.dates.checkIn ? "text-brand-600" : "text-slate-950"
                            )}>
                                {state.dates.checkIn ? 
                                    `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${state.dates.checkOut?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                                    : "Select Stay Dates"}
                            </p>
                        </div>
                    </div>

                    {/* 3. Guests Section */}
                    <div 
                        onClick={() => setActiveSection("guests")}
                        className={cn(
                            "flex flex-1 items-center gap-4 pl-6 pr-4 py-6 md:py-5 md:pr-10 hover:bg-white/50 transition-all duration-500 group cursor-pointer relative",
                            activeSection === "guests" && "bg-white/80 shadow-inner"
                        )}
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50/50 text-brand-600 group-hover:scale-110 transition-all duration-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-1">Who's coming</p>
                            <p className="text-[15px] font-black text-slate-950 italic tracking-tight">
                                {state.guests.adults + state.guests.children} Guests · {state.guests.rooms} Room
                            </p>
                        </div>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-slate-300 transition-transform duration-500",
                            activeSection === "guests" ? "rotate-180" : "group-hover:translate-y-1"
                        )} />
                    </div>

                    {/* Search button */}
                    <div className="px-5 pb-8 pt-2 md:p-3 md:pr-4">
                        <button
                            type="button"
                            onClick={() => handleSearch()}
                            disabled={isSearching}
                            className={cn(
                                "relative overflow-hidden flex items-center justify-center bg-slate-950 hover:bg-brand-600 text-white font-black transition-all duration-500 active:scale-[0.96] shadow-2xl group/btn",
                                hideStories 
                                    ? "w-full h-16 rounded-[24px] text-sm tracking-[0.2em] uppercase" 
                                    : "w-full md:w-auto md:px-14 py-5 md:py-4.5 rounded-[28px] md:rounded-full gap-4 text-lg md:text-[16px] tracking-tight"
                            )}
                        >
                            {/* Animated Glow Layer */}
                            <motion.div 
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            />
                            
                            {isSearching ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <span>Explore Stays</span>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-brand-600 transition-all duration-500">
                                        <Search className="w-4 h-4" />
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Popular Stories UI — Instagram Style */}
            {!hideStories && (
                <div className="mt-16 flex items-center justify-start md:justify-center gap-10 overflow-x-auto pb-6 no-scrollbar px-6 md:px-0 w-full max-w-[1400px] mx-auto relative z-10">
                    {DESTINATION_STORIES.map((story, idx) => (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            key={story.label}
                            type="button"
                            onClick={() => {
                                const foundStory = destinationStories.find(s => s.id === story.label.toLowerCase());
                                if (foundStory) {
                                    setActiveStory(foundStory);
                                } else {
                                    setQuery(story.query);
                                    handleSearch(undefined, story.query);
                                }
                            }}
                            className="group flex flex-col items-center gap-4 outline-none relative"
                        >
                            <div className="relative p-[4px] rounded-full bg-gradient-to-tr from-brand-600 via-brand-200 to-brand-500 transition-all duration-700 group-hover:scale-110 active:scale-95 shadow-premium">
                                {story.badge && (
                                    <motion.div 
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="absolute -inset-1 rounded-full border-2 border-brand-300"
                                    />
                                )}
                                
                                <div className="p-[3px] rounded-full bg-white transition-colors">
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-inner">
                                        <img
                                            src={story.image}
                                            alt={story.label}
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-125"
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                                    </div>
                                </div>
                            </div>

                            {story.badge && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                        "absolute top-0 -right-1 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white shadow-xl z-10 tracking-widest",
                                        story.badge === 'Hot' ? 'bg-orange-500 shadow-orange-200' : story.badge === 'Trend' ? 'bg-brand-600 shadow-brand-200' : 'bg-emerald-500 shadow-emerald-200'
                                    )}
                                >
                                    {story.badge}
                                </motion.div>
                            )}

                            <div className="flex flex-col items-center">
                                <span className="text-[14px] font-black text-slate-950 group-hover:text-brand-600 transition-colors tracking-tight italic">
                                    {story.label}
                                </span>
                                <div className="w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-500 rounded-full mt-1" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            <DestinationStoryViewer
                story={activeStory}
                onClose={() => setActiveStory(null)}
                onNext={() => {
                    if (!activeStory) return;
                    const currentIndex = destinationStories.findIndex(s => s.id === activeStory.id);
                    const nextIndex = (currentIndex + 1) % destinationStories.length;
                    setActiveStory(destinationStories[nextIndex]);
                }}
            />
        </div>
    );
}
