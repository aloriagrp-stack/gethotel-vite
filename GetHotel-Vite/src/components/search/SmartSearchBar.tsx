
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate as useRouter } from "react-router-dom";
import { Search, X, ChevronDown, Calendar as CalendarIcon, Users, MapPin, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { SmartSearchState } from "@/types/search";
import { cn } from "@/lib/utils";
import DestinationStoryViewer from "@/components/home/DestinationStoryViewer";
import { destinationStories, DestinationStory } from "@/data/stories";
import { useIsMobile } from "@/hooks/useIsMobile";

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

export default function SmartSearchBar({ className, hideStories, initialState, onSearch, navigationPath }: any) {
    const { mode } = useStayMode();
    const isMobile = useIsMobile();
    const router = useRouter();
    const [state, setState] = useState<SmartSearchState>({ ...DEFAULT_STATE, ...(initialState || {}) });
    const [query, setQuery] = useState(initialState?.destination?.label || "");
    const [isSearching, setIsSearching] = useState(false);
    const [activeStory, setActiveStory] = useState<DestinationStory | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = useState<"where" | "dates" | "guests" | "time" | "duration" | null>(null);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setActiveSection(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateClick = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        if (date < today) return;

        if (mode === 'hourly') {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
            if (!isMobile) setTimeout(() => setActiveSection("time"), 300);
            return;
        }

        if (!state.dates.checkIn || (state.dates.checkIn && state.dates.checkOut)) {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
        } else if (date > state.dates.checkIn) {
            setState(prev => ({ ...prev, dates: { ...prev.dates, checkOut: date } }));
            if (!isMobile) setTimeout(() => setActiveSection("guests"), 300);
        } else {
            setState(prev => ({ ...prev, dates: { checkIn: date, checkOut: null } }));
        }
    };

    const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        const params = new URLSearchParams({
            city: state.destination?.label || query || "All",
            checkIn: state.dates.checkIn?.toISOString().split("T")[0] || "",
            checkOut: mode === 'nightly' ? (state.dates.checkOut?.toISOString().split("T")[0] || "") : "",
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
        if (navigationPath) {
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
                <div className={cn("w-full flex flex-col md:flex-row md:items-center relative transition-all duration-700", !hideStories && "bg-white/60 backdrop-blur-[40px] rounded-[40px] md:rounded-full shadow-premium border border-white/40")}>
                    
                    {/* Destination */}
                    <div onClick={() => setActiveSection("where")} className={cn("flex flex-[1.3] items-center gap-3 pl-8 pr-3 py-6 md:py-5 md:border-r border-white/30 cursor-pointer transition-all", activeSection === "where" && "bg-white/80 rounded-t-[40px] md:rounded-l-full shadow-inner")}>
                        <MapPin className="w-5 h-5 text-brand-600" />
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Where</p>
                            <input type="text" value={query} readOnly={isMobile} onChange={e => setQuery(e.target.value)} placeholder="Enter destination..." className="w-full bg-transparent outline-none text-[16px] font-black text-slate-950 italic" />
                        </div>
                        {!isMobile && activeSection === "where" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[110%] left-0 w-[450px] bg-white rounded-[24px] p-6 shadow-2xl border border-slate-50 z-[100]">
                                {TOP_DESTINATIONS.filter(d => d.label.toLowerCase().includes(query.toLowerCase())).map(dest => (
                                    <button key={dest.label} onClick={e => { e.stopPropagation(); setQuery(dest.label); setState(p => ({ ...p, destination: { id: dest.label.toLowerCase(), label: dest.label, category: "trending" } })); setActiveSection("dates"); }} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <MapPin className="w-4 h-4 text-brand-600" />
                                        <div className="text-left"><p className="font-bold text-slate-900">{dest.label}</p><p className="text-xs text-slate-400">{dest.region}</p></div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Dates / Check-in */}
                    <div onClick={() => setActiveSection("dates")} className={cn("flex flex-1 items-center gap-3 pl-5 pr-3 py-6 md:py-5 md:border-r border-white/30 cursor-pointer transition-all", activeSection === "dates" && "bg-white/80 shadow-inner")}>
                        <CalendarIcon className="w-5 h-5 text-brand-600" />
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{mode === 'hourly' ? "Check-in Date" : "Dates"}</p>
                            <p className="text-[14px] font-black italic text-slate-950 truncate">
                                {state.dates.checkIn ? (
                                    mode === 'hourly' 
                                        ? state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : `${state.dates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${state.dates.checkOut?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Select Out'}`
                                ) : "Select Stay"}
                            </p>
                        </div>
                        {!isMobile && activeSection === "dates" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[110%] left-0 w-[380px] bg-white rounded-[32px] p-6 shadow-2xl border border-slate-50 z-[100]" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                                    <p className="font-black italic text-slate-900">{monthName} {currentYear}</p>
                                    <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}</div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const d = i + 1;
                                        const date = new Date(currentYear, currentMonth, d);
                                        const isPast = date < today;
                                        const isSelected = state.dates.checkIn?.getTime() === date.getTime() || state.dates.checkOut?.getTime() === date.getTime();
                                        const isInRange = state.dates.checkIn && state.dates.checkOut && date > state.dates.checkIn && date < state.dates.checkOut;
                                        return (
                                            <button key={d} disabled={isPast} onClick={() => handleDateClick(d)} className={cn("h-10 rounded-xl text-sm font-bold transition-all", isPast ? "text-slate-100 cursor-not-allowed" : isSelected ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : isInRange ? "bg-brand-50 text-brand-600" : "hover:bg-slate-50 text-slate-700")}>{d}</button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Hourly Specific: Time & Duration */}
                    {mode === 'hourly' && (
                        <>
                            {/* Check-in Time */}
                            <div onClick={() => setActiveSection("time")} className={cn("flex flex-[0.8] items-center gap-3 pl-5 pr-3 py-6 md:py-5 md:border-r border-white/30 cursor-pointer transition-all", activeSection === "time" && "bg-white/80 shadow-inner")}>
                                <Users className="w-5 h-5 text-brand-600" />
                                <div className="flex-1 text-left">
                                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Arrival</p>
                                    <p className="text-[14px] font-black italic text-slate-950">{state.checkInTime || "Pick Time"}</p>
                                </div>
                                {!isMobile && activeSection === "time" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[110%] left-0 w-[200px] bg-white rounded-[24px] p-4 shadow-2xl border border-slate-50 z-[100]" onClick={e => e.stopPropagation()}>
                                        <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
                                            {TIME_SLOTS.map(t => (
                                                <button key={t} onClick={() => { setState(s => ({ ...s, checkInTime: t })); setActiveSection("duration"); }} className={cn("w-full p-3 text-left rounded-xl font-bold transition-all", state.checkInTime === t ? "bg-brand-600 text-white" : "hover:bg-slate-50 text-slate-900")}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Duration */}
                            <div onClick={() => setActiveSection("duration")} className={cn("flex flex-[0.8] items-center gap-3 pl-5 pr-3 py-6 md:py-5 md:border-r border-white/30 cursor-pointer transition-all", activeSection === "duration" && "bg-white/80 shadow-inner")}>
                                <ChevronDown className="w-5 h-5 text-brand-600" />
                                <div className="flex-1 text-left">
                                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Stay</p>
                                    <p className="text-[14px] font-black italic text-slate-950">{state.duration} Hours</p>
                                </div>
                                {!isMobile && activeSection === "duration" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[110%] left-0 w-[200px] bg-white rounded-[24px] p-4 shadow-2xl border border-slate-50 z-[100]" onClick={e => e.stopPropagation()}>
                                        <div className="space-y-1">
                                            {DURATIONS.map(d => (
                                                <button key={d} onClick={() => { setState(s => ({ ...s, duration: d })); setActiveSection("guests"); }} className={cn("w-full p-4 text-center rounded-xl font-black italic transition-all", state.duration === d ? "bg-brand-600 text-white" : "hover:bg-slate-50 text-slate-900")}>
                                                    {d} Hours
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Guests */}
                    <div onClick={() => setActiveSection("guests")} className={cn("flex flex-1 items-center gap-3 pl-5 pr-3 py-6 md:py-5 cursor-pointer transition-all", activeSection === "guests" && "bg-white/80 shadow-inner md:rounded-r-full")}>
                        <Users className="w-5 h-5 text-brand-600" />
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Guests</p>
                            <p className="text-[14px] font-black italic text-slate-950 truncate">{state.guests.adults + state.guests.children} Guests · {state.guests.rooms} Room</p>
                        </div>
                        {!isMobile && activeSection === "guests" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[110%] right-0 w-[320px] bg-white rounded-[32px] p-6 shadow-2xl border border-slate-50 z-[100]" onClick={e => e.stopPropagation()}>
                                <div className="space-y-6">
                                    {[{label:"Adults",k:"adults"},{label:"Children",k:"children"},{label:"Rooms",k:"rooms"}].map(i => (
                                        <div key={i.k} className="flex justify-between items-center">
                                            <p className="font-bold text-slate-900">{i.label}</p>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: Math.max(i.k==='children'?0:1, (s.guests as any)[i.k]-1) } }))} className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50"><Minus className="w-3 h-3" /></button>
                                                <span className="font-black w-4 text-center">{(state.guests as any)[i.k]}</span>
                                                <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: (s.guests as any)[i.k]+1 } }))} className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Search Btn */}
                    <div className="px-5 pb-8 pt-2 md:p-3 shrink-0">
                        <button onClick={() => handleSearch()} disabled={isSearching} className="w-full md:px-8 lg:px-12 py-5 md:py-4 bg-slate-950 hover:bg-brand-600 text-white font-black rounded-[28px] md:rounded-full transition-all flex items-center justify-center gap-4 shadow-2xl group">
                            {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Explore <Search className="w-4 h-4" /></>}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Drawer (Where) */}
            <AnimatePresence>
                {isMobile && activeSection === "where" && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSection(null)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200]" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[24px] z-[210] flex flex-col shadow-2xl">
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-center"><button onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></button><span className="text-sm font-black uppercase tracking-widest">Where to?</span><div className="w-5" /></div>
                                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search destinations" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-brand-600" /></div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
                                {TOP_DESTINATIONS.filter(d => d.label.toLowerCase().includes(query.toLowerCase())).map(dest => (
                                    <button key={dest.label} onClick={() => { setQuery(dest.label); setState(p => ({ ...p, destination: { id: dest.label.toLowerCase(), label: dest.label, category: "trending" } })); setActiveSection(null); }} className="w-full flex items-center gap-4 py-4 border-b border-slate-50 text-left">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-brand-600"><MapPin className="w-5 h-5" /></div>
                                        <div><p className="font-bold text-slate-900">{dest.label}</p><p className="text-xs text-slate-400">{dest.region}</p></div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Drawer (Dates/Guests) */}
            <AnimatePresence>
                {isMobile && (activeSection === "dates" || activeSection === "guests") && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSection(null)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200]" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[210] p-6 pb-10 shadow-2xl">
                            {activeSection === "dates" ? (
                                <div className="space-y-8">
                                    <p className="text-center font-black uppercase tracking-widest text-sm">Select Stay</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)}><ChevronLeft className="w-5 h-5 text-slate-300" /></button>
                                            <p className="font-black italic">{monthName} {currentYear}</p>
                                            <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)}><ChevronRight className="w-5 h-5 text-slate-300" /></button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-200 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}</div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: firstDay }).map((_, i) => <div key={`mb-${i}`} />)}
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const d = i + 1;
                                                const date = new Date(currentYear, currentMonth, d);
                                                const isPast = date < today;
                                                const isSel = state.dates.checkIn?.getTime() === date.getTime() || state.dates.checkOut?.getTime() === date.getTime();
                                                const isRange = state.dates.checkIn && state.dates.checkOut && date > state.dates.checkIn && date < state.dates.checkOut;
                                                return <button key={d} disabled={isPast} onClick={() => handleDateClick(d)} className={cn("h-10 rounded-lg text-sm font-bold", isPast ? "text-slate-100" : isSel ? "bg-brand-600 text-white" : isRange ? "bg-brand-50 text-brand-600" : "text-slate-700")}>{d}</button>
                                            })}
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveSection(null)} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black shadow-xl">Apply Dates</button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <p className="text-center font-black uppercase tracking-widest text-sm">Guests & Rooms</p>
                                    <div className="space-y-4">
                                        {[{l:"Adults",k:"adults"},{l:"Children",k:"children"},{l:"Rooms",k:"rooms"}].map(i => (
                                            <div key={i.k} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                                <p className="font-bold">{i.l}</p>
                                                <div className="flex items-center gap-6">
                                                    <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: Math.max(i.k==='children'?0:1, (s.guests as any)[i.k]-1) } }))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="text-xl font-black">{(state.guests as any)[i.k]}</span>
                                                    <button onClick={() => setState(s => ({ ...s, guests: { ...s.guests, [i.k]: (s.guests as any)[i.k]+1 } }))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setActiveSection(null)} className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-100">Confirm Selection</button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {!hideStories && (
                <div className="mt-16 flex items-center justify-start md:justify-center gap-10 overflow-x-auto pb-6 no-scrollbar px-6 md:px-0 w-full max-w-[1400px] mx-auto relative z-10">
                    {DESTINATION_STORIES.map((story, idx) => (
                        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }} key={story.label} type="button" onClick={() => { const foundStory = destinationStories.find(s => s.id === story.label.toLowerCase()); if (foundStory) setActiveStory(foundStory); else { setQuery(story.query); handleSearch(undefined, story.query); } }} className="group flex flex-col items-center gap-4 outline-none relative">
                            <div className="relative p-[4px] rounded-full bg-gradient-to-tr from-brand-600 via-brand-200 to-brand-500 transition-all duration-700 group-hover:scale-110 active:scale-95 shadow-premium"><div className="p-[3px] rounded-full bg-white"><div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-inner"><img src={story.image} alt={story.label} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125" /></div></div></div>
                            <span className="text-[14px] font-black text-slate-950 tracking-tight italic">{story.label}</span>
                        </motion.button>
                    ))}
                </div>
            )}

            <DestinationStoryViewer story={activeStory} onClose={() => setActiveStory(null)} onNext={() => { if (!activeStory) return; const currentIndex = destinationStories.findIndex(s => s.id === activeStory.id); const nextIndex = (currentIndex + 1) % destinationStories.length; setActiveStory(destinationStories[nextIndex]); }} />
        </div>
    );
}
