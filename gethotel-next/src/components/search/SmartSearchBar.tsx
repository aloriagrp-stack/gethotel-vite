'use client';
import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate as useRouter } from "react-router-dom";
import { Search, X, ChevronDown, Calendar as CalendarIcon, Users, MapPin, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight, ArrowUpDown, Hotel } from "lucide-react";
import type { SmartSearchState } from "@/types/search";
import { cn, formatDateLocal } from "@/lib/utils";
import DestinationStoryViewer from "@/components/home/DestinationStoryViewer";
import { destinationStories, DestinationStory } from "@/data/stories";
import { useIsMobile } from "@/hooks/useIsMobile";
import { hotelApi } from "@/lib/api";

import { useStayMode } from "@/context/StayModeContext";

const DEFAULT_STATE: SmartSearchState = {
    destination: null,
    dates: { checkIn: null, checkOut: null },
    guests: { adults: 2, children: 0, rooms: 1, childAges: [] },
    checkInTime: "10:00 AM",
    duration: 3,
};

const TIME_SLOTS = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];
const DURATIONS = [3, 6, 12];

const TOP_DESTINATIONS = [
    { label: "Goa", region: "Beach & Nightlife" },
    { label: "Udaipur", region: "Lakes & Palaces" },
    { label: "Shimla", region: "Snow & Mountains" },
    { label: "Jaipur", region: "Pink City Heritage" },
    { label: "Munnar", region: "Tea Gardens & Kerala" },
    { label: "Jodhpur", region: "Blue City" },
    { label: "Gurgaon", region: "India" },
    { label: "Rishikesh", region: "India" },
];

const DESTINATION_STORIES = [
    { label: "Goa", query: "Hotels in Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=200&auto=format&fit=crop", badge: "Hot" },
    { label: "Udaipur", query: "Hotels in Udaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=200&auto=format&fit=crop", badge: "Trend" },
    { label: "Shimla", query: "Hotels in Shimla", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=200&auto=format&fit=crop" },
    { label: "Munnar", query: "Hotels in Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=200&auto=format&fit=crop" },
    { label: "Jaipur", query: "Hotels in Jaipur", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=200&auto=format&fit=crop", badge: "New" },
];

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

export default function SmartSearchBar({ className, hideStories, initialState, onSearch, navigationPath, layoutMode = "home", stories }: any) {
    const { mode } = useStayMode();
    const isMobile = useIsMobile();
    const router = useRouter();
    const [state, setState] = useState<SmartSearchState>({ ...DEFAULT_STATE, ...(initialState || {}) });
    const [query, setQuery] = useState(initialState?.destination?.label || "");
    const [isSearching, setIsSearching] = useState(false);
    const [activeStory, setActiveStory] = useState<DestinationStory | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = useState<"where" | "dates" | "guests" | "time" | "duration" | null>(null);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                const res = await hotelApi.getSearchSuggestions(query);
                if (res && res.success) {
                    setSuggestions(res.data || []);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isMobile) return;
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setActiveSection(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile]);

    // Adjust checkout date when switching between stay modes
    useEffect(() => {
        if (mode === 'nightly') {
            setState(prev => {
                if (prev.dates.checkIn && !prev.dates.checkOut) {
                    const nextDay = new Date(prev.dates.checkIn);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return {
                        ...prev,
                        dates: { ...prev.dates, checkOut: nextDay }
                    };
                }
                return prev;
            });
        } else if (mode === 'hourly') {
            setState(prev => {
                if (prev.dates.checkOut) {
                    return {
                        ...prev,
                        dates: { ...prev.dates, checkOut: null }
                    };
                }
                return prev;
            });
        }
    }, [mode]);

    // Heal checkout date to checkIn + 1 day when the dates picker dropdown is closed with only checkIn selected
    useEffect(() => {
        if (activeSection === null && mode === 'nightly') {
            setState(prev => {
                if (prev.dates.checkIn && !prev.dates.checkOut) {
                    const nextDay = new Date(prev.dates.checkIn);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return {
                        ...prev,
                        dates: { ...prev.dates, checkOut: nextDay }
                    };
                }
                return prev;
            });
        }
    }, [activeSection, mode]);

    const handleDateClick = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        if (date < today) return;

        if (mode === 'hourly') {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
            return;
        }

        if (!state.dates.checkIn || (state.dates.checkIn && state.dates.checkOut)) {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
        } else if (date > state.dates.checkIn) {
            setState(prev => ({ ...prev, dates: { ...prev.dates, checkOut: date } }));
            // Dropdown stays open; user closes it manually or clicks another tab.
        } else {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
        }
    };

    const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        let finalCheckIn = state.dates.checkIn;
        let finalCheckOut = state.dates.checkOut;

        if (mode === 'nightly') {
            if (!finalCheckIn) {
                finalCheckIn = new Date();
                finalCheckIn.setHours(0, 0, 0, 0);
            }
            if (!finalCheckOut) {
                finalCheckOut = new Date(finalCheckIn);
                finalCheckOut.setDate(finalCheckOut.getDate() + 1);
            }
        } else {
            if (!finalCheckIn) {
                finalCheckIn = new Date();
                finalCheckIn.setHours(0, 0, 0, 0);
            }
            finalCheckOut = null;
        }

        const isHotelSelected = state.destination?.category === "hotel";
        const params = new URLSearchParams({
            city: isHotelSelected ? (state.destination?.sublabel || "All") : (state.destination?.label || query || "All"),
            checkIn: formatDateLocal(finalCheckIn),
            checkOut: mode === 'nightly' ? formatDateLocal(finalCheckOut) : "",
            adults: String(state.guests.adults),
            children: String(state.guests.children),
            rooms: String(state.guests.rooms),
            stayType: mode,
            checkInTime: mode === 'hourly' ? (state.checkInTime || "") : "",
            duration: mode === 'hourly' ? String(state.duration || 3) : "",
        });
        await new Promise(r => setTimeout(r, 700));
        setIsSearching(false);
        setActiveSection(null);
        if (onSearch) onSearch();
        
        if (isHotelSelected && state.destination?.id) {
            router(`/hotel/${state.destination.id}?${params.toString()}`);
        } else if (navigationPath) {
            router(`${navigationPath}?${params.toString()}`);
        } else {
            router(`/hotels?${params.toString()}`);
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="w-full relative z-50">
                <div className={cn(
                    "w-full flex flex-col lg:flex-row lg:items-center relative transition-all duration-700 gap-3 lg:gap-0",
                    "lg:bg-white/80 lg:backdrop-blur-3xl lg:rounded-full lg:shadow-[0_12px_40px_rgba(0,0,0,0.08)] lg:border lg:border-slate-200/80 lg:p-2",
                    "bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-1.5 shadow-md"
                )}>

                    {/* Mobile View (Unified Pill Container) */}
                    {layoutMode === "hotels" ? (
                        /* Hotels Page Mobile View: 2-Row Split Layout */
                        <div className="flex lg:hidden flex-col gap-0.5 bg-white/40 backdrop-blur-xl rounded-[40px] shadow-sm p-1 overflow-hidden mx-1 w-full">
                            {/* Row 1: Destination (Where) */}
                            <div 
                                className="w-full bg-white/40 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform rounded-t-[36px]"
                                onClick={() => setActiveSection("where")}
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                    <MapPin className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                                    <p className="text-sm font-black text-slate-900 truncate italic">
                                        {query || "Where to?"}
                                    </p>
                                </div>
                                <Search className="w-5 h-5 text-slate-300 mr-2" />
                            </div>

                            {/* Row 2: Dates & Guests side-by-side */}
                            <div className="flex gap-0.5 w-full">
                                {/* Dates */}
                                <div 
                                    className="flex-1 bg-white/40 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform rounded-bl-[36px]"
                                    onClick={() => setActiveSection("dates")}
                                >
                                    <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{mode === 'hourly' ? "Arrival" : "Dates"}</p>
                                        <p className="text-[11px] font-black text-slate-900 truncate">
                                            {state.dates.checkIn ? (
                                                mode === 'hourly'
                                                    ? `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ ${state.checkInTime || "10:00 AM"}`
                                                    : state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            ) : "Add Dates"}
                                        </p>
                                    </div>
                                </div>

                                {/* Guests */}
                                <div 
                                    className="flex-1 bg-white/40 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform rounded-br-[36px]"
                                    onClick={() => setActiveSection("guests")}
                                >
                                    <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                        <Users className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Guests</p>
                                        <p className="text-[11px] font-black text-slate-900 truncate">
                                            {state.guests.adults + state.guests.children} Guests
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Home Page Mobile View: 3 stacked sections (Destination, Dates, Guests) */
                        <div className="flex lg:hidden flex-col gap-3 w-full px-1">
                            {/* Section 1: Destination */}
                            <div 
                                onClick={() => setActiveSection("where")}
                                className="w-full bg-white/40 backdrop-blur-xl border border-white/30 rounded-[2rem] p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all shadow-md hover:bg-white/60"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                    <MapPin className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                                    <p className="text-sm font-black text-slate-900 truncate">
                                        {query || "Where to?"}
                                    </p>
                                </div>
                                <Search className="w-5 h-5 text-slate-300 mr-1" />
                            </div>

                            {/* Section 2: Dates */}
                            <div 
                                onClick={() => setActiveSection("dates")}
                                className="w-full bg-white/40 backdrop-blur-xl border border-white/30 rounded-[2rem] p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all shadow-md hover:bg-white/60"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                    <CalendarIcon className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{mode === 'hourly' ? "Arrival Date & Time" : "Dates"}</p>
                                    <p className="text-sm font-black text-slate-900 truncate">
                                        {state.dates.checkIn ? (
                                            mode === 'hourly'
                                                ? `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ ${state.checkInTime || "10:00 AM"} (${state.duration}h)`
                                                : `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${state.dates.checkOut ? ` - ${state.dates.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`
                                        ) : "Add dates"}
                                    </p>
                                </div>
                            </div>

                            {/* Section 3: Guests */}
                            <div 
                                onClick={() => setActiveSection("guests")}
                                className="w-full bg-white/40 backdrop-blur-xl border border-white/30 rounded-[2rem] p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all shadow-md hover:bg-white/60"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                                    <Users className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Guests</p>
                                    <p className="text-sm font-black text-slate-900 truncate">
                                        {state.guests.adults + state.guests.children} Guests
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop View (Horizontal Layout) */}
                    <div className="hidden lg:flex flex-1 items-center">
                        {/* Destination */}
                        <div className="flex-[1.4] relative">
                            <div onClick={(e) => { e.stopPropagation(); setActiveSection("where"); }} className={cn("flex items-center gap-3 pl-7 pr-3 py-4 md:py-2.5 cursor-pointer transition-all hover:bg-white/80 rounded-l-full", activeSection === "where" && "bg-white shadow-sm")}>
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Where</p>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onFocus={(e) => { e.stopPropagation(); setActiveSection("where"); }}
                                        placeholder="Destination..."
                                        className="w-full bg-transparent outline-none text-[13px] font-black text-slate-950 italic truncate"
                                    />
                                </div>
                            </div>
                            {activeSection === "where" && (
                                <div className="absolute top-[115%] left-0 w-[400px] bg-white rounded-[40px] p-8 shadow-premium z-[500]" onClick={e => e.stopPropagation()}>
                                    {query.trim().length > 0 ? (
                                        isLoadingSuggestions ? (
                                            <div className="p-4 space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                                            <div className="h-2 bg-slate-100 rounded w-1/2" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                                                {suggestions.map(s => {
                                                    const isHotel = s.category === "hotel";
                                                    return (
                                                        <button 
                                                            key={s.id} 
                                                            onClick={e => { 
                                                                e.stopPropagation(); 
                                                                setQuery(s.label); 
                                                                setState(p => ({ ...p, destination: s })); 
                                                                setActiveSection("dates"); 
                                                            }} 
                                                            className="w-full flex items-center gap-4 p-3 hover:bg-slate-50/50 rounded-3xl transition-all group text-left"
                                                        >
                                                            {s.thumbnail ? (
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                                                                    <img src={s.thumbnail} alt={s.label} className="object-cover w-full h-full absolute inset-0" loading="lazy" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-slate-50/50 flex items-center justify-center group-hover:bg-brand-50 transition-colors shrink-0">
                                                                    {isHotel ? (
                                                                        <Hotel className="w-4 h-4 text-violet-500" />
                                                                    ) : (
                                                                        <MapPin className="w-4 h-4 text-brand-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-slate-900 truncate">{s.label}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                                    {s.sublabel}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                                {suggestions.length === 0 && (
                                                    <div className="py-10 text-center">
                                                        <p className="text-sm font-bold text-slate-400 italic">No matches found for &quot;{query}&quot;</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Popular Destinations</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {TOP_DESTINATIONS.slice(0, 6).map(dest => (
                                                    <button 
                                                        key={dest.label} 
                                                        onClick={e => { 
                                                            e.stopPropagation(); 
                                                            setQuery(dest.label); 
                                                            setState(p => ({ ...p, destination: { id: dest.label.toLowerCase(), label: dest.label, category: "trending" } })); 
                                                            setActiveSection("dates"); 
                                                        }} 
                                                        className="flex items-center gap-2.5 p-3 hover:bg-slate-50/50 rounded-2xl transition-all group text-left border border-slate-100/50"
                                                    >
                                                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                        <span className="text-xs font-bold text-slate-700 truncate">{dest.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="flex-1 relative">
                            <div onClick={(e) => { e.stopPropagation(); setActiveSection("dates"); }} className={cn("flex items-center gap-3 pl-5 pr-3 py-4 md:py-2.5 cursor-pointer transition-all hover:bg-white/80", activeSection === "dates" && "bg-white shadow-sm")}>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <CalendarIcon className="w-3.5 h-3.5 text-brand-600" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{mode === 'hourly' ? "Arrival" : "Stay Dates"}</p>
                                    <p className="text-[13px] font-black italic text-slate-950 truncate">
                                        {state.dates.checkIn ? (
                                            mode === 'hourly'
                                                ? `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ ${state.checkInTime || "10:00 AM"}`
                                                : `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${state.dates.checkOut?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '...'}`
                                        ) : "Select Dates"}
                                    </p>
                                </div>
                            </div>
                            {activeSection === "dates" && (
                                <div className="absolute top-[115%] left-1/2 -translate-x-1/2 w-[380px] bg-white rounded-[40px] p-8 shadow-premium z-[500]" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6">
                                        <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-slate-50/50 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                                        <p className="font-black italic text-slate-900">{monthName} {currentYear}</p>
                                        <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-slate-50/50 rounded-full"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 mb-2">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}</div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const d = i + 1;
                                            const date = new Date(currentYear, currentMonth, d);
                                            const isPast = date < today;
                                            const isSelected = state.dates.checkIn?.getTime() === date.getTime() || state.dates.checkOut?.getTime() === date.getTime();
                                            const isInRange = state.dates.checkIn && state.dates.checkOut && date > state.dates.checkIn && date < state.dates.checkOut;
                                            return (
                                                <button key={d} disabled={isPast} onClick={() => handleDateClick(d)} className={cn("h-11 rounded-full text-sm font-bold transition-all", isPast ? "text-slate-100 cursor-not-allowed" : isSelected ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : isInRange ? "bg-brand-50 text-brand-600" : "hover:bg-slate-50 text-slate-700")}>{d}</button>
                                            );
                                        })}
                                    </div>

                                    {mode === 'hourly' && (
                                        <div className="space-y-3 pt-4 border-t border-slate-100/50 mt-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arrival Time</p>
                                            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                {TIME_SLOTS.map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, checkInTime: t }));
                                                            if (!isMobile) {
                                                                setTimeout(() => setActiveSection("duration"), 300);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all",
                                                            state.checkInTime === t ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Duration (Hourly only) */}
                        {mode === 'hourly' && (
                            <div className="flex-1 relative">
                                <div onClick={(e) => { e.stopPropagation(); setActiveSection("duration"); }} className={cn("flex items-center gap-3 pl-5 pr-3 py-4 md:py-2.5 cursor-pointer transition-all hover:bg-white/80", activeSection === "duration" && "bg-white shadow-sm")}>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Duration</p>
                                        <p className="text-[13px] font-black italic text-slate-950 truncate">
                                            {state.duration ? `${state.duration} Hours` : "Select Hours"}
                                        </p>
                                    </div>
                                </div>
                                {activeSection === "duration" && (
                                    <div className="absolute top-[115%] left-1/2 -translate-x-1/2 w-[280px] bg-white rounded-[40px] p-6 shadow-premium z-[500]" onClick={e => e.stopPropagation()}>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-4 px-1">Stay Duration</h4>
                                        <div className="flex gap-2">
                                            {DURATIONS.map(hours => (
                                                <button
                                                    key={hours}
                                                    type="button"
                                                    onClick={() => {
                                                        setState(s => ({ ...s, duration: hours }));
                                                        setActiveSection("guests");
                                                    }}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-2xl text-xs font-black tracking-wider transition-all",
                                                        state.duration === hours ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100"
                                                    )}
                                                >
                                                    {hours}h
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Guests */}
                        <div className="flex-1 relative">
                            <div onClick={(e) => { e.stopPropagation(); setActiveSection("guests"); }} className={cn("flex items-center gap-3 pl-5 pr-3 py-4 md:py-2.5 cursor-pointer transition-all hover:bg-white/80 rounded-r-full", activeSection === "guests" && "bg-white shadow-sm")}>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Users className="w-3.5 h-3.5 text-brand-600" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Guests</p>
                                    <p className="text-[13px] font-black italic text-slate-950 truncate">{state.guests.adults + state.guests.children} Guests · {state.guests.rooms} Room</p>
                                </div>
                            </div>
                            {activeSection === "guests" && (
                                <div className="absolute top-[115%] right-0 w-[320px] bg-white rounded-[40px] p-8 shadow-premium z-[500]" onClick={e => e.stopPropagation()}>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-6 px-1">Guests & Rooms</h4>
                                    <div className="space-y-6">
                                        {[{ label: "Adults", k: "adults" }, { label: "Children", k: "children" }, { label: "Rooms", k: "rooms" }].map(i => (
                                            <div key={i.k} className="flex justify-between items-center">
                                                <p className="font-bold text-slate-900">{i.label}</p>
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: Math.max(i.k === 'children' ? 0 : 1, (s.guests as any)[i.k] - 1) } }))} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                    <span className="font-black w-5 text-center text-sm">{(state.guests as any)[i.k]}</span>
                                                    <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: (s.guests as any)[i.k] + 1 } }))} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Btn */}
                        <div className="p-1.5 shrink-0">
                            <button onClick={() => handleSearch()} disabled={isSearching} className="w-full px-11 py-3.5 bg-slate-950 hover:bg-brand-600 text-white font-black rounded-full transition-all flex items-center justify-center gap-2 shadow-xl group active:scale-95">
                                {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <> <span className="text-[11px] uppercase tracking-widest italic">Explore</span> <Search className="w-3.5 h-3.5 transition-transform group-hover:scale-110" strokeWidth={3} /></>}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Drawer (Where) */}
            {isMobile && typeof window !== "undefined" && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {activeSection === "where" && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSection(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[500]" />
                            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="fixed bottom-0 left-0 right-0 h-[90vh] bg-white rounded-t-3xl z-[510] flex flex-col shadow-2xl overflow-hidden">
                                <div className="p-6 pb-2 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <button onClick={() => setActiveSection(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-slate-900" /></button>
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-950">Where to?</span>
                                        <div className="w-10" />
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
                                        <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search destinations..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-full font-bold outline-none transition-all text-slate-900" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-1">
                                    {query.trim().length > 0 ? (
                                        isLoadingSuggestions ? (
                                            <div className="space-y-4 py-4 animate-pulse">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                                            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            suggestions.map(s => {
                                                const isHotel = s.category === "hotel";
                                                return (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => { 
                                                            setQuery(s.label); 
                                                            setState(p => ({ ...p, destination: s })); 
                                                            setActiveSection("dates"); 
                                                        }} 
                                                        className="w-full flex items-center gap-4 py-4 text-left active:bg-slate-50 transition-colors"
                                                    >
                                                        {s.thumbnail ? (
                                                            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative">
                                                                <img src={s.thumbnail} alt={s.label} className="object-cover w-full h-full absolute inset-0" loading="lazy" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                                                                {isHotel ? (
                                                                    <Hotel className="w-5 h-5 text-violet-500" />
                                                                ) : (
                                                                    <MapPin className="w-5 h-5 text-brand-600" />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-black text-slate-950 truncate">{s.label}</p>
                                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                                {s.sublabel}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )
                                    ) : (
                                        <div className="space-y-6 py-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Popular Destinations</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {TOP_DESTINATIONS.map(dest => (
                                                    <button 
                                                        key={dest.label} 
                                                        onClick={() => { 
                                                            setQuery(dest.label); 
                                                            setState(p => ({ ...p, destination: { id: dest.label.toLowerCase(), label: dest.label, category: "trending" } })); 
                                                            setActiveSection("dates"); 
                                                        }} 
                                                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl active:bg-slate-100 transition-all text-left"
                                                    >
                                                        <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                                                        <span className="font-black text-xs text-slate-800 truncate">{dest.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Mobile Drawer (Dates/Guests) */}
            {isMobile && typeof window !== "undefined" && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {(activeSection === "dates" || activeSection === "guests") && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSection(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[500]" />
                            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl z-[510] p-6 pb-10 shadow-2xl">
                                {activeSection === "dates" ? (
                            <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <button onClick={() => setActiveSection("where")} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-slate-900" /></button>
                                            <p className="text-center font-black uppercase tracking-widest text-sm text-slate-950">Select Dates</p>
                                            <div className="w-10" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                                                <p className="font-black italic text-slate-900">{monthName} {currentYear}</p>
                                                <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-2">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}</div>
                                            <div className="grid grid-cols-7 gap-1">
                                                {Array.from({ length: firstDay }).map((_, i) => <div key={`mb-${i}`} />)}
                                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                                    const d = i + 1;
                                                    const date = new Date(currentYear, currentMonth, d);
                                                    const isPast = date < today;
                                                    const isSel = state.dates.checkIn?.getTime() === date.getTime() || state.dates.checkOut?.getTime() === date.getTime();
                                                    const isRange = state.dates.checkIn && state.dates.checkOut && date > state.dates.checkIn && date < state.dates.checkOut;
                                                    return <button key={d} disabled={isPast} onClick={() => handleDateClick(d)} className={cn("w-9 h-9 mx-auto rounded-full text-xs font-bold transition-all flex items-center justify-center", isPast ? "text-slate-100" : isSel ? "bg-brand-600 text-white shadow-md" : isRange ? "bg-brand-50 text-brand-600" : "text-slate-700 active:bg-slate-200")}>{d}</button>
                                                })}
                                            </div>
                                        </div>

                                        {mode === 'hourly' && (
                                            <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Arrival Time</p>
                                                    <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                        {TIME_SLOTS.map(t => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => setState(prev => ({ ...prev, checkInTime: t }))}
                                                                className={cn(
                                                                    "py-2 rounded-xl text-[10px] font-black tracking-wider transition-all",
                                                                    state.checkInTime === t ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                                )}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Stay Duration</p>
                                                    <div className="flex gap-2">
                                                        {DURATIONS.map(hours => (
                                                            <button
                                                                key={hours}
                                                                type="button"
                                                                onClick={() => setState(prev => ({ ...prev, duration: hours }))}
                                                                className={cn(
                                                                    "flex-1 py-3 rounded-2xl text-xs font-black tracking-wider transition-all",
                                                                    state.duration === hours ? "bg-brand-600 text-white shadow-lg shadow-brand-200" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                                )}
                                                            >
                                                                {hours} Hours
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <button onClick={() => setActiveSection(null)} className="w-full py-5 bg-slate-100 text-slate-600 rounded-full font-black transition-all active:scale-95">Skip</button>
                                            <button onClick={() => setActiveSection("guests")} className="w-full py-5 bg-slate-950 text-white rounded-full font-black shadow-xl active:scale-95">Next</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <button onClick={() => setActiveSection("dates")} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-slate-900" /></button>
                                            <p className="text-center font-black uppercase tracking-widest text-sm text-slate-950">Guests & Rooms</p>
                                            <div className="w-10" />
                                        </div>
                                        <div className="space-y-4">
                                            {[{ l: "Adults", k: "adults" }, { l: "Children", k: "children" }, { l: "Rooms", k: "rooms" }].map(i => (
                                                <div key={i.k} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                    <p className="font-black text-slate-900">{i.l}</p>
                                                    <div className="flex items-center gap-6">
                                                        <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: Math.max(i.k === 'children' ? 0 : 1, (s.guests as any)[i.k] - 1) } }))} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 active:scale-90 transition-transform"><Minus className="w-4 h-4" /></button>
                                                        <span className="text-xl font-black w-6 text-center">{(state.guests as any)[i.k]}</span>
                                                        <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: (s.guests as any)[i.k] + 1 } }))} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 active:scale-90 transition-transform"><Plus className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => { setActiveSection(null); handleSearch(); }} className="w-full py-5 bg-brand-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-brand-100 active:scale-95 transition-all">Search Properties</button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {!hideStories && (
                <div className="mt-12 pt-4 flex items-center justify-start md:justify-center gap-10 overflow-x-auto pb-6 no-scrollbar px-6 md:px-0 w-full max-w-[1400px] mx-auto relative z-10">
                    {(stories && stories.length > 0 ? stories : DESTINATION_STORIES).map((story: any, idx: number) => (
                        <motion.button 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.5 + idx * 0.1 }} 
                            key={story.label} 
                            type="button" 
                            onClick={() => { 
                                const foundStory = stories && stories.length > 0 
                                    ? stories.find((s: any) => s.label.toLowerCase() === story.label.toLowerCase())
                                    : destinationStories.find(s => s.id === story.label.toLowerCase());
                                if (foundStory) {
                                    const mappedStory = stories && stories.length > 0
                                        ? { 
                                            id: foundStory.label.toLowerCase(), 
                                            city: foundStory.label, 
                                            slides: foundStory.slides || [],
                                            query: foundStory.query,
                                            buttonText: foundStory.buttonText
                                          }
                                        : foundStory;
                                    setActiveStory(mappedStory);
                                } else { 
                                    setQuery(story.query); 
                                    handleSearch(undefined, story.query); 
                                } 
                            }} 
                            className="group flex flex-col items-center gap-4 outline-none relative"
                        >
                            <div className="relative p-[4px] rounded-full bg-gradient-to-tr from-brand-600 via-brand-200 to-brand-500 transition-all duration-700 group-hover:scale-110 active:scale-95 shadow-premium">
                                {/* Story Badge */}
                                {story.badge && (
                                    <span className={`absolute -top-1 left-[2px] z-20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md border border-white whitespace-nowrap leading-none premium-shine-badge select-none ${
                                        story.badge.toLowerCase() === 'hot' 
                                            ? 'bg-gradient-to-r from-red-600 via-rose-300 to-red-600 text-white' 
                                            : story.badge.toLowerCase() === 'new' 
                                                ? 'bg-gradient-to-r from-emerald-600 via-emerald-300 to-emerald-600 text-white' 
                                                : story.badge.toLowerCase() === 'trend'
                                                    ? 'bg-gradient-to-r from-blue-600 via-blue-300 to-blue-600 text-white'
                                                    : 'bg-gradient-to-r from-slate-900 via-slate-400 to-slate-900 text-white'
                                    }`}>
                                        {story.badge}
                                    </span>
                                )}
                                <div className="p-[3px] rounded-full bg-white">
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-inner">
                                        <img src={story.image} alt={story.label} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125" loading="lazy" />
                                    </div>
                                </div>
                            </div>
                            <span className="text-[14px] font-black text-slate-950 tracking-tight italic">{story.label}</span>
                        </motion.button>
                    ))}
                </div>
            )}

            <DestinationStoryViewer 
                story={activeStory} 
                onClose={() => setActiveStory(null)} 
                onNext={() => { 
                    if (!activeStory) return; 
                    const currentStoriesList = stories && stories.length > 0 ? stories : DESTINATION_STORIES;
                    const currentIndex = currentStoriesList.findIndex((s: any) => s.label.toLowerCase() === activeStory.id); 
                    const nextIndex = (currentIndex + 1) % currentStoriesList.length; 
                    const nextStory = currentStoriesList[nextIndex];
                    if (nextStory) {
                        const foundStory = stories && stories.length > 0
                            ? nextStory
                            : destinationStories.find(s => s.id === nextStory.label.toLowerCase());
                        if (foundStory) {
                            const mappedStory = stories && stories.length > 0
                                ? { 
                                    id: foundStory.label.toLowerCase(), 
                                    city: foundStory.label, 
                                    slides: foundStory.slides || [],
                                    query: foundStory.query,
                                    buttonText: foundStory.buttonText
                                  }
                                : foundStory;
                            setActiveStory(mappedStory);
                        }
                    }
                }} 
            />
            <style>{`
                @keyframes badge-shine {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes flag-wave {
                    0% {
                        transform: translateY(0) rotate(-2deg) skewX(-1deg);
                    }
                    50% {
                        transform: translateY(-1.2px) rotate(2deg) skewX(1deg);
                    }
                    100% {
                        transform: translateY(0) rotate(-2deg) skewX(-1deg);
                    }
                }
                .premium-shine-badge {
                    background-size: 200% auto !important;
                    animation: badge-shine 3s linear infinite, flag-wave 2.5s ease-in-out infinite !important;
                    transform-origin: left center;
                }
            `}</style>
        </div>
    );
}
