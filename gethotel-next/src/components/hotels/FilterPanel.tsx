'use client';

import React, { useState, useMemo } from "react";
import {
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    RotateCcw,
    Star,
    Wifi,
    Waves,
    Sparkles,
    Dumbbell,
    Utensils,
    Wine,
    Car,
    Plane,
    Dog,
    Wind,
    Bell,
    Umbrella,
    Presentation,
    Smile,
} from "lucide-react";
import type { FilterState, Amenity } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const IOS_AMENITIES: { key: Amenity; label: string; icon: React.ReactNode; bg: string }[] = [
    { key: "wifi", label: "Free High-Speed Wi-Fi", icon: <Wifi className="w-3.5 h-3.5" />, bg: "bg-blue-500" },
    { key: "pool", label: "Swimming Pool", icon: <Waves className="w-3.5 h-3.5" />, bg: "bg-cyan-500" },
    { key: "spa", label: "Luxury Spa & Wellness", icon: <Sparkles className="w-3.5 h-3.5" />, bg: "bg-purple-500" },
    { key: "gym", label: "Fitness Center / Gym", icon: <Dumbbell className="w-3.5 h-3.5" />, bg: "bg-rose-500" },
    { key: "restaurant", label: "Multi-Cuisine Restaurant", icon: <Utensils className="w-3.5 h-3.5" />, bg: "bg-amber-500" },
    { key: "bar", label: "Bar & Cocktail Lounge", icon: <Wine className="w-3.5 h-3.5" />, bg: "bg-indigo-500" },
    { key: "parking", label: "Valet / Free Parking", icon: <Car className="w-3.5 h-3.5" />, bg: "bg-emerald-500" },
    { key: "airport_shuttle", label: "Airport Pickup & Shuttle", icon: <Plane className="w-3.5 h-3.5" />, bg: "bg-sky-500" },
    { key: "pet_friendly", label: "Pet Friendly Stays", icon: <Dog className="w-3.5 h-3.5" />, bg: "bg-teal-500" },
    { key: "air_conditioning", label: "Full Air Conditioning", icon: <Wind className="w-3.5 h-3.5" />, bg: "bg-blue-400" },
    { key: "room_service", label: "24/7 Room Service", icon: <Bell className="w-3.5 h-3.5" />, bg: "bg-fuchsia-500" },
    { key: "beach_access", label: "Direct Beach Access", icon: <Umbrella className="w-3.5 h-3.5" />, bg: "bg-cyan-600" },
    { key: "conference_room", label: "Conference & Meeting Hall", icon: <Presentation className="w-3.5 h-3.5" />, bg: "bg-slate-600" },
    { key: "kids_club", label: "Kids Play Area & Club", icon: <Smile className="w-3.5 h-3.5" />, bg: "bg-pink-500" },
];

const MAX_PRICE = 500000;

interface FilterPanelProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
    const [priceOpen, setPriceOpen] = useState(true);
    const [ratingOpen, setRatingOpen] = useState(true);
    const [amenOpen, setAmenOpen] = useState(true);
    const [guestOpen, setGuestOpen] = useState(true);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
        onChange({ ...filters, [key]: value });

    const toggleStar = (star: number) => {
        const stars = filters.starRatings.includes(star)
            ? filters.starRatings.filter((s) => s !== star)
            : [...filters.starRatings, star];
        updateFilter("starRatings", stars);
    };

    const toggleAmenity = (amenity: Amenity) => {
        const amenities = filters.amenities.includes(amenity)
            ? filters.amenities.filter((a) => a !== amenity)
            : [...filters.amenities, amenity];
        updateFilter("amenities", amenities);
    };

    const reset = () =>
        onChange({ priceRange: [0, MAX_PRICE], starRatings: [], amenities: [], guestRatingMin: 0 });

    const currentMaxPrice = filters.priceRange[1] !== undefined ? filters.priceRange[1] : MAX_PRICE;
    const pricePercent = Math.min(100, Math.max(0, (currentMaxPrice / MAX_PRICE) * 100));

    const hasActive =
        filters.starRatings.length > 0 ||
        filters.amenities.length > 0 ||
        filters.guestRatingMin > 0 ||
        currentMaxPrice < MAX_PRICE;

    return (
        <aside className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-[28px] p-5 lg:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                        <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-extrabold text-slate-950 text-base tracking-tight block leading-tight">Filters</span>
                        <span className="text-[10px] font-semibold text-slate-400">Refine stays in real-time</span>
                    </div>
                    {hasActive && (
                        <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-black shadow-sm ml-1">
                            {filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (currentMaxPrice < MAX_PRICE ? 1 : 0)}
                        </span>
                    )}
                </div>
                {hasActive && (
                    <button
                        onClick={reset}
                        className="text-[11px] font-bold text-slate-500 hover:text-brand-600 px-2.5 py-1 rounded-xl hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* Price Range with Ultra-Smooth Metallic Ball Slider */}
            <FilterSection title="Budget / Price per Night" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
                <div className="pt-2 space-y-4">
                    {/* Metallic Value Display */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3 py-2 text-center shadow-inner">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Min</span>
                            <span className="text-xs font-black text-slate-900 notranslate">{formatPrice(filters.priceRange[0])}</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">—</span>
                        <div className="flex-1 bg-gradient-to-r from-brand-50 to-indigo-50/80 border border-brand-200/80 rounded-2xl px-3 py-2 text-center shadow-sm">
                            <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest block">Up to</span>
                            <span className="text-xs font-black text-brand-700 notranslate">
                                {currentMaxPrice >= MAX_PRICE ? `${formatPrice(MAX_PRICE)}+` : formatPrice(currentMaxPrice)}
                            </span>
                        </div>
                    </div>

                    {/* Smooth Metallic Slider Track */}
                    <div className="relative px-1 pt-1">
                        <input
                            type="range"
                            min={0}
                            max={MAX_PRICE}
                            step={1000}
                            value={currentMaxPrice}
                            onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                            style={{
                                background: `linear-gradient(to right, #0284c7 0%, #6366f1 ${pricePercent}%, #e2e8f0 ${pricePercent}%, #e2e8f0 100%)`
                            }}
                            className={cn(
                                "w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all",
                                // Metallic Chrome Ball Thumb for WebKit (Chrome, Safari, Edge)
                                "[&::-webkit-slider-thumb]:appearance-none",
                                "[&::-webkit-slider-thumb]:w-6",
                                "[&::-webkit-slider-thumb]:h-6",
                                "[&::-webkit-slider-thumb]:rounded-full",
                                "[&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-white [&::-webkit-slider-thumb]:via-slate-100 [&::-webkit-slider-thumb]:to-slate-300",
                                "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300",
                                "[&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,0,0,0.25)]",
                                "[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
                                "[&::-webkit-slider-thumb]:active:scale-125 [&::-webkit-slider-thumb]:active:ring-4 [&::-webkit-slider-thumb]:active:ring-brand-400/30",
                                "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
                                // Metallic Thumb for Firefox
                                "[&::-moz-range-thumb]:w-6",
                                "[&::-moz-range-thumb]:h-6",
                                "[&::-moz-range-thumb]:rounded-full",
                                "[&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-white [&::-moz-range-thumb]:via-slate-100 [&::-moz-range-thumb]:to-slate-300",
                                "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-300",
                                "[&::-moz-range-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
                                "[&::-moz-range-thumb]:cursor-grab"
                            )}
                        />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                        <span>₹0</span>
                        <span>₹2,50,000</span>
                        <span>₹5,00,000+</span>
                    </div>
                </div>
            </FilterSection>

            {/* Hotel Class (Star Rating) */}
            <FilterSection title="Hotel Class & Rating" open={ratingOpen} onToggle={() => setRatingOpen(!ratingOpen)}>
                <div className="space-y-1.5 pt-1">
                    {[5, 4, 3].map((star) => (
                        <label
                            key={star}
                            className={cn(
                                "flex items-center gap-3 cursor-pointer p-2.5 rounded-2xl border transition-all text-xs font-bold",
                                filters.starRatings.includes(star)
                                    ? "bg-brand-50/80 border-brand-200 text-brand-700 shadow-sm"
                                    : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={filters.starRatings.includes(star)}
                                onChange={() => toggleStar(star)}
                                className="w-4 h-4 rounded-md border-slate-300 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: star }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                                {Array.from({ length: 5 - star }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
                                ))}
                            </div>
                            <span className="ml-auto text-[11px] font-bold text-slate-500">
                                {star === 5 ? "5-Star Luxury" : star === 4 ? "4-Star Superior" : "3-Star Standard"}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Guest Rating */}
            <FilterSection title="Guest Rating" open={guestOpen} onToggle={() => setGuestOpen(!guestOpen)}>
                <div className="space-y-1.5 pt-1">
                    {[9, 8, 7].map((min) => (
                        <label
                            key={min}
                            className={cn(
                                "flex items-center gap-3 cursor-pointer p-2.5 rounded-2xl border transition-all text-xs font-bold",
                                filters.guestRatingMin === min
                                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 shadow-sm"
                                    : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                            )}
                        >
                            <input
                                type="radio"
                                name="guestRating"
                                checked={filters.guestRatingMin === min}
                                onChange={() => updateFilter("guestRatingMin", min)}
                                className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-600 text-white rounded-lg shadow-sm">
                                {min}+
                            </span>
                            <span>{min === 9 ? "Superb (9.0+)" : min === 8 ? "Very Good (8.0+)" : "Good (7.0+)"}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* iOS Apple-Style Amenities */}
            <FilterSection title="Popular Amenities" open={amenOpen} onToggle={() => setAmenOpen(!amenOpen)}>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {IOS_AMENITIES.map((amenity) => (
                        <label
                            key={amenity.key}
                            className={cn(
                                "flex items-center gap-3 cursor-pointer p-2 rounded-2xl border transition-all text-xs",
                                filters.amenities.includes(amenity.key)
                                    ? "bg-brand-50/70 border-brand-200 font-bold text-slate-950 shadow-sm"
                                    : "border-transparent hover:bg-slate-50/80 font-medium text-slate-700 hover:text-slate-950"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity.key)}
                                onChange={() => toggleAmenity(amenity.key)}
                                className="w-4 h-4 rounded-md border-slate-300 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            {/* iPhone iOS Squircle Icon */}
                            <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0", amenity.bg)}>
                                {amenity.icon}
                            </div>
                            <span className="truncate">{amenity.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </aside>
    );
}

function FilterSection({
    title,
    open,
    onToggle,
    children,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-slate-100 last:border-0 pb-1">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-2.5 text-left group cursor-pointer"
            >
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                    {title}
                </span>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                    {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
            </button>
            {open && <div className="pb-3">{children}</div>}
        </div>
    );
}
