'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Star } from "lucide-react";
import type { FilterState, Amenity } from "@/types";
import { cn, amenityLabel, amenityIcon, formatPrice } from "@/lib/utils";

const ALL_AMENITIES: Amenity[] = [
    "wifi", "pool", "spa", "gym", "restaurant", "bar",
    "parking", "airport_shuttle", "pet_friendly", "air_conditioning",
    "room_service", "beach_access", "conference_room", "kids_club",
];

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
        onChange({ priceRange: [0, 50000], starRatings: [], amenities: [], guestRatingMin: 0 });

    const hasActive =
        filters.starRatings.length > 0 ||
        filters.amenities.length > 0 ||
        filters.guestRatingMin > 0 ||
        filters.priceRange[1] < 50000;

    return (
        <aside className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm tracking-tight">Filters</span>
                    {hasActive && (
                        <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-bold">
                            {filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 50000 ? 1 : 0)}
                        </span>
                    )}
                </div>
                {hasActive && (
                    <button
                        onClick={reset}
                        className="text-[11px] font-bold text-slate-500 hover:text-brand-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition-all"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* Price Range */}
            <FilterSection title="Price per Night" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
                <div className="pt-1 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-800 notranslate">
                            {formatPrice(filters.priceRange[0])}
                        </span>
                        <span className="text-slate-400 font-normal">to</span>
                        <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-800 notranslate">
                            {formatPrice(filters.priceRange[1])}
                        </span>
                    </div>
                    <div>
                        <input
                            type="range"
                            min={0}
                            max={50000}
                            step={500}
                            value={filters.priceRange[1]}
                            onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                        <span>₹0</span>
                        <span>₹50,000+</span>
                    </div>
                </div>
            </FilterSection>

            {/* Star Rating */}
            <FilterSection title="Hotel Class" open={ratingOpen} onToggle={() => setRatingOpen(!ratingOpen)}>
                <div className="space-y-1.5 pt-1">
                    {[5, 4, 3].map((star) => (
                        <label
                            key={star}
                            className={cn(
                                "flex items-center gap-3 cursor-pointer p-2 rounded-xl border transition-all text-xs font-bold",
                                filters.starRatings.includes(star)
                                    ? "bg-brand-50/70 border-brand-200 text-brand-700"
                                    : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={filters.starRatings.includes(star)}
                                onChange={() => toggleStar(star)}
                                className="w-4 h-4 rounded border-slate-300 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: star }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                                {Array.from({ length: 5 - star }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
                                ))}
                            </div>
                            <span className="ml-auto text-[11px] font-semibold text-slate-500">
                                {star === 5 ? "Luxury" : star === 4 ? "Superior" : "Standard"}
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
                                "flex items-center gap-3 cursor-pointer p-2 rounded-xl border transition-all text-xs font-bold",
                                filters.guestRatingMin === min
                                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
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
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-md">
                                {min}+
                            </span>
                            <span>{min === 9 ? "Superb (9+)" : min === 8 ? "Very Good (8+)" : "Good (7+)"}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Amenities" open={amenOpen} onToggle={() => setAmenOpen(!amenOpen)}>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 pt-1 custom-scrollbar">
                    {ALL_AMENITIES.map((amenity) => (
                        <label
                            key={amenity}
                            className={cn(
                                "flex items-center gap-2.5 cursor-pointer p-2 rounded-xl border transition-all text-xs font-medium",
                                filters.amenities.includes(amenity)
                                    ? "bg-brand-50/70 border-brand-200 text-brand-700 font-bold"
                                    : "border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                                className="w-4 h-4 rounded border-slate-300 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            <span className="text-sm">{amenityIcon(amenity)}</span>
                            <span>{amenityLabel(amenity)}</span>
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
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                    {title}
                </span>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                    {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
            </button>
            {open && <div className="pb-3">{children}</div>}
        </div>
    );
}
