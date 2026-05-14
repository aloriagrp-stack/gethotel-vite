

import { useState } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { MapPin, Calendar, Users, Search, ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const popularCities = ["Mumbai", "Goa", "Delhi", "Jaipur", "Kerala", "Shimla", "Bangalore", "Udaipur"];

interface SearchBarProps {
    compact?: boolean;
    className?: string;
}

export default function SearchBar({ compact = false, className }: SearchBarProps) {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const filteredCities = city
        ? popularCities.filter((c) => c.toLowerCase().includes(city.toLowerCase()))
        : popularCities;

    const handleSearch = () => {
        const params = new URLSearchParams({
            city: city || "All",
            checkIn,
            checkOut,
            guests: String(guests),
        });
        router(`/hotels?${params.toString()}`);
    };

    // ── Compact mode (navbar) ──────────────────────────────────────────────
    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-center bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden",
                    className
                )}
            >
                <div className="flex items-center gap-2 px-4 py-3 flex-1 min-w-0 cursor-pointer hover:bg-slate-50 transition-colors">
                    <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="text-sm text-slate-500 truncate">{city || "Where to?"}</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="hidden sm:flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="text-sm text-slate-500">{checkIn || "Dates"}</span>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <button
                    onClick={handleSearch}
                    className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shrink-0"
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>
        );
    }

    // ── Full mode (hero) ───────────────────────────────────────────────────
    return (
        <div className={cn("bg-white rounded-3xl shadow-float overflow-visible", className)}>
            {/* Three fields row: Destination | Dates (check-in + check-out stacked) | Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

                {/* Destination */}
                <div className="relative">
                    <div
                        className="flex flex-col px-5 py-4 hover:bg-slate-50/80 cursor-pointer transition-colors rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none"
                        onClick={() => {
                            setShowCitySuggestions(!showCitySuggestions);
                            setShowGuestDropdown(false);
                        }}
                    >
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 pointer-events-none">
                            <MapPin className="w-3 h-3" /> Destination
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => { setCity(e.target.value); setShowCitySuggestions(true); }}
                            placeholder="Where are you going?"
                            className="text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder-slate-400 w-full"
                            onFocus={() => setShowCitySuggestions(true)}
                        />
                    </div>

                    {showCitySuggestions && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-float border border-slate-100 z-50 overflow-hidden animate-slide-up">
                            <p className="text-[10px] font-bold text-slate-400 px-4 pt-3 pb-2 uppercase tracking-wider">
                                Popular Destinations
                            </p>
                            {filteredCities.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => { setCity(c); setShowCitySuggestions(false); }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors"
                                >
                                    <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                                    <span className="text-sm font-medium text-slate-800">{c}</span>
                                    <span className="text-xs text-slate-400 ml-auto">India</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dates — Check-in & Check-out stacked in ONE column */}
                <div className="flex flex-col px-5 py-3 hover:bg-slate-50/80 transition-colors">
                    {/* Check-in */}
                    <div className="flex flex-col mb-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> Check-in
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer w-full"
                            min={today}
                        />
                    </div>
                    {/* Thin divider */}
                    <div className="border-t border-slate-200 my-1" />
                    {/* Check-out */}
                    <div className="flex flex-col mt-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> Check-out
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer w-full"
                            min={checkIn || today}
                        />
                    </div>
                </div>

                {/* Guests */}
                <div className="relative">
                    <div
                        className="flex flex-col px-5 py-4 hover:bg-slate-50/80 cursor-pointer transition-colors h-full rounded-tr-3xl"
                        onClick={() => { setShowGuestDropdown(!showGuestDropdown); setShowCitySuggestions(false); }}
                    >
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Guests
                        </label>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-slate-900">
                                {guests} {guests === 1 ? "Guest" : "Guests"}
                            </span>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 ml-auto transition-transform", showGuestDropdown && "rotate-180")} />
                        </div>
                    </div>

                    {showGuestDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-float border border-slate-100 z-50 p-4 animate-slide-up">
                            <p className="text-xs font-semibold text-slate-500 mb-3">Number of Guests</p>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 transition-colors"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-lg font-bold text-slate-900 w-6 text-center">{guests}</span>
                                <button
                                    onClick={() => setGuests(Math.min(10, guests + 1))}
                                    className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowGuestDropdown(false)}
                                className="w-full mt-3 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors text-center py-1"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Button — full width bottom strip */}
            <div className="px-3 pb-3 pt-2">
                <button
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-2xl transition-all duration-150 shadow-md hover:shadow-lg shadow-brand-200 hover:shadow-brand-300"
                >
                    <Search className="w-5 h-5" />
                    Search Hotels
                </button>
            </div>

            {/* Click-outside overlay */}
            {(showCitySuggestions || showGuestDropdown) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setShowCitySuggestions(false); setShowGuestDropdown(false); }}
                />
            )}
        </div>
    );
}



