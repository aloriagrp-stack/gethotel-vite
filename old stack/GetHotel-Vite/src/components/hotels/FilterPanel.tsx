

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
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
        <aside className="space-y-2 py-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full glass-interactive flex items-center justify-center">
                        <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="font-black text-black text-sm">Filters</span>
                    {hasActive && (
                        <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-black">
                            {filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 50000 ? 1 : 0)}
                        </span>
                    )}
                </div>
                {hasActive && (
                    <button onClick={reset} className="text-xs font-bold text-brand-600 hover:text-brand-800 px-2 py-1 rounded-lg glass-interactive border-white/40 transition-all">
                        Clear all
                    </button>
                )}
            </div>

            {/* Price Range */}
            <FilterSection title="Price per Night" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
                <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-3 px-1">
                        <span className="bg-white/50 px-2 py-1 rounded-md border border-white/40 notranslate">{formatPrice(filters.priceRange[0])}</span>
                        <span className="bg-white/50 px-2 py-1 rounded-md border border-white/40 notranslate">{formatPrice(filters.priceRange[1])}</span>
                    </div>
                    <div className="px-1">
                        <input
                            type="range"
                            min={0}
                            max={50000}
                            step={500}
                            value={filters.priceRange[1]}
                            onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                            className="w-full h-2 bg-white/40 rounded-full appearance-none cursor-pointer accent-brand-600 border border-white/20"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                        <span>₹0</span>
                        <span>₹50,000+</span>
                    </div>
                </div>
            </FilterSection>

            {/* Star Rating */}
            <FilterSection title="Hotel Class" open={ratingOpen} onToggle={() => setRatingOpen(!ratingOpen)}>
                <div className="space-y-2.5 pt-1">
                    {[5, 4, 3].map((star) => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl hover:glass-interactive border border-transparent hover:border-white/40 transition-all">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={filters.starRatings.includes(star)}
                                    onChange={() => toggleStar(star)}
                                    className="w-5 h-5 rounded-lg border-white/60 bg-white/20 text-brand-600 accent-brand-600 cursor-pointer transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: star }).map((_, i) => (
                                    <span key={i} className="text-gold-500 text-sm">★</span>
                                ))}
                                {Array.from({ length: 5 - star }).map((_, i) => (
                                    <span key={i} className="text-slate-300 text-sm">★</span>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-black group-hover:text-brand-600 transition-colors">
                                {star === 5 ? "Luxury" : star === 4 ? "Superior" : "Standard"}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Guest Rating */}
            <FilterSection title="Guest Rating" open={guestOpen} onToggle={() => setGuestOpen(!guestOpen)}>
                <div className="space-y-2.5 pt-1">
                    {[9, 8, 7].map((min) => (
                        <label key={min} className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl hover:glass-interactive border border-transparent hover:border-white/40 transition-all">
                            <input
                                type="radio"
                                name="guestRating"
                                checked={filters.guestRatingMin === min}
                                onChange={() => updateFilter("guestRatingMin", min)}
                                className="w-5 h-5 border-white/60 bg-white/20 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-md shadow-sm">{min}+</span>
                            <span className="text-xs font-bold text-black group-hover:text-brand-600">
                                {min === 9 ? "Superb" : min === 8 ? "Very Good" : "Good"}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Amenities" open={amenOpen} onToggle={() => setAmenOpen(!amenOpen)}>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 pt-1 custom-scrollbar">
                    {ALL_AMENITIES.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl hover:glass-interactive border border-transparent hover:border-white/40 transition-all">
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                                className="w-5 h-5 rounded-lg border-white/60 bg-white/20 text-brand-600 accent-brand-600 cursor-pointer"
                            />
                            <span className="text-base">{amenityIcon(amenity)}</span>
                            <span className="text-xs font-bold text-black group-hover:text-brand-600 transition-colors">
                                {amenityLabel(amenity)}
                            </span>
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
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-4 text-left group"
            >
                <span className="text-xs font-black text-black uppercase tracking-wider group-hover:text-brand-600 transition-colors">{title}</span>
                <div className="w-6 h-6 rounded-lg glass-interactive flex items-center justify-center border-white/20">
                    {open ? (
                        <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                </div>
            </button>
            {open && <div className="pb-5">{children}</div>}
        </div>
    );
}



