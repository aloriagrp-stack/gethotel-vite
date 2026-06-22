

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown, MapPin, Hotel, X, Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { FilterState, SortOption } from "@/types";

import HotelCard from "@/components/hotels/HotelCard";
import FilterPanel from "@/components/hotels/FilterPanel";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";
import { Hotel as HotelType } from "@/types";
import SEOHead from "@/components/common/SEOHead";
import Loader from "@/components/common/Loader";
import { PAGE_SEO, buildBreadcrumbSchema, SITE } from "@/lib/seo";

// Remove HOTELS_PER_PAGE as we use dynamic visibleCount

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recommended", label: "Recommended" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Guest Rating" },
];

const defaultFilters: FilterState = {
    priceRange: [0, 50000],
    starRatings: [],
    guestRatingMin: 0,
    amenities: [],
};

function HotelListingContent() {
    const isMobile = useIsMobile();
    const [searchParams] = useSearchParams();
    const cityParam = searchParams.get("city") || "All";
    const guests = searchParams.get("adults") || searchParams.get("guests") || "2";
    const stayType = searchParams.get("stayType") || "nightly";

    const [allHotels, setAllHotels] = useState<HotelType[]>([]);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortOption>("recommended");
    const [visibleCount, setVisibleCount] = useState(12);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Fetch hotels from API using strong algorithm if params exist
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);

                const params: any = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                let response;
                if (Object.keys(params).length > 0) {
                    response = await hotelApi.searchHotels(params);
                } else {
                    response = await hotelApi.getHotels();
                }

                setAllHotels(response.data || []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch hotels:", err);
                setError("Could not load hotels. Please try again.");
                setAllHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [searchParams]);

    // Filter logic using allHotels instead of static hotels
    const filtered = allHotels.filter((h) => {
        // City Filter - Skip client-side city filtering if a specific destination_index or collection_index is present, or if it is a fuzzy query match
        const hasSpecificIndex = searchParams.get("destination_index") !== null || searchParams.get("collection_index") !== null;
        if (!hasSpecificIndex && cityParam !== "All") {
            const cleanCityParam = cityParam.toLowerCase();
            const cleanHotelCity = h.city.toLowerCase();
            const cleanHotelName = h.name.toLowerCase();
            const cleanHotelAddress = h.address.toLowerCase();
            const isMatch = cleanHotelCity.includes(cleanCityParam) || 
                            cleanCityParam.includes(cleanHotelCity) || 
                            cleanHotelName.includes(cleanCityParam) || 
                            cleanHotelAddress.includes(cleanCityParam);
            if (!isMatch) return false;
        }

        // Name Search Filter
        if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Price Filter
        const maxPrice = filters.priceRange[1] === 50000 ? Infinity : filters.priceRange[1];
        if (h.pricePerNight < filters.priceRange[0] || h.pricePerNight > maxPrice) return false;

        // Star Rating Filter
        if (filters.starRatings.length > 0 && !filters.starRatings.includes(h.starRating)) return false;

        // Guest Rating Filter
        if (h.guestRating < filters.guestRatingMin) return false;

        // Amenities Filter
        if (filters.amenities.length > 0 && !filters.amenities.every((a) => h.amenities.includes(a))) return false;

        // Guest Capacity Filter: Only show hotels that have rooms that can accommodate the guest count ONLY if guest count is explicitly searched
        const hasExplicitGuests = searchParams.has("adults") || searchParams.has("guests");
        const rooms = (h as any).room || (h as any).rooms || [];
        if (rooms.length > 0) {
            const hasEligibleRoom = rooms.some((r: any) => {
                const maxOcc = r.maxOccupancy || r.max_occupancy || r.capacityAdults || 2;
                const isModeOk = stayType === "hourly"
                    ? (r.isHourlyEnabled || r.is_hourly_enabled)
                    : (!r.isHourlyEnabled && !r.is_hourly_enabled);
                return (!hasExplicitGuests || maxOcc >= Number(guests)) && isModeOk;
            });
            if (!hasEligibleRoom) return false;
        } else if (stayType === "hourly") {
            return false;
        }

        return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        if (sort === "price_asc") return a.pricePerNight - b.pricePerNight;
        if (sort === "price_desc") return b.pricePerNight - a.pricePerNight;
        if (sort === "rating") return b.guestRating - a.guestRating;

        // Default Recommended Sort: use rankScore from backend
        const scoreA = (a as any).rankScore || (a.isFeatured ? 100 : 0);
        const scoreB = (b as any).rankScore || (b.isFeatured ? 100 : 0);
        return scoreB - scoreA;
    });

    const visibleHotels = sorted.slice(0, visibleCount);
    const hasMore = visibleCount < sorted.length;

    const loadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    const handleFilterChange = (f: FilterState) => {
        setFilters(f);
        setVisibleCount(12); // Reset scroll on filter change
    };

    const cityDisplay = cityParam !== "All" ? cityParam : "India";
    const isDelhi = cityParam.toLowerCase() === "delhi" || cityParam.toLowerCase() === "new delhi";
    const pageTitle = cityParam !== "All"
        ? `Hotels in ${cityParam} — Book Affordable to Luxury Stays | GetHotelStays`
        : PAGE_SEO.hotels.title;
    const pageDesc = cityParam !== "All" && !isDelhi
        ? `Find & book the best hotels in ${cityParam}. Compare prices, read reviews, and get instant confirmation. Pay 12% now, rest at hotel. Free cancellation available on GetHotelStays.`
        : isDelhi
            ? `Book 2,000+ verified hotels in Delhi at best prices. Budget stays in Paharganj from ₹699 to luxury in Aerocity. Pay 12% online, rest at hotel. Trusted by NRIs from USA, UK, UAE. Free cancellation & instant confirmation.`
            : PAGE_SEO.hotels.description;
    const pageKeywords = cityParam !== "All"
        ? isDelhi
            ? [`hotels in delhi`, `delhi hotels booking`, `cheap hotels in delhi`, `budget hotels in delhi`, `affordable hotels in delhi`, `best hotels in delhi`, `hotels near delhi airport`, `hotels in connaught place delhi`, `delhi hotels for nri`, `book delhi hotel from usa`, `book delhi hotel from uk`, `delhi hotels pay at hotel`, `delhi hotels free cancellation`, `hourly hotels in delhi`, `gethotelstays delhi`]
            : [`hotels in ${cityParam.toLowerCase()}`, `${cityParam.toLowerCase()} hotels`, `book hotel ${cityParam.toLowerCase()}`, `cheap hotels ${cityParam.toLowerCase()}`, `luxury hotels ${cityParam.toLowerCase()}`, "hotel booking india", "gethotelstays"]
        : PAGE_SEO.hotels.keywords;

    return (
        <div className="min-h-screen pt-2 bg-transparent px-0">
            <SEOHead
                title={pageTitle}
                description={pageDesc}
                keywords={pageKeywords}
                ogUrl={`${SITE.url}/hotels${cityParam !== "All" ? `?city=${encodeURIComponent(cityParam)}` : ""}`}
                canonicalUrl={`${SITE.url}/hotels`}
                schemas={[
                    buildBreadcrumbSchema([
                        { name: "Home", url: "/" },
                        { name: "Hotels", url: "/hotels" },
                        ...(cityParam !== "All" ? [{ name: cityParam, url: `/hotels?city=${encodeURIComponent(cityParam)}` }] : []),
                    ]),
                ]}
            />
            {/* Search Modal Overlay */}
            {/* Page Header Area - Side-by-Side Layout */}
            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 px-4 md:px-10">
                {cityParam !== "All" && (
                    <div className="shrink-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950 tracking-tight leading-tight">
                            Hotels in <span className="text-brand-600">{cityParam}</span>
                        </h1>
                    </div>
                )}

                <div className="w-full lg:max-w-4xl">
                    <SmartSearchBar
                        layoutMode="hotels"
                        hideStories
                        className=""
                        initialState={{
                            destination: cityParam !== "All" ? { label: cityParam, id: cityParam.toLowerCase(), category: "trending" } : null,
                            dates: {
                                checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn") as string) : null,
                                checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut") as string) : null
                            },
                            guests: { adults: Number(guests), children: 0, rooms: 1, childAges: [] }
                        }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full px-4 md:px-10 py-0">
                <div className="flex gap-10">
                    {/* Sidebar Filter — Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24">
                            <FilterPanel filters={filters} onChange={handleFilterChange} />
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {showMobileFilter && (
                        <div className="fixed inset-0 z-[100] lg:hidden">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-500" onClick={() => setShowMobileFilter(false)} />
                            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-white/70 backdrop-blur-3xl saturate-[180%] overflow-y-auto p-6 md:p-10 border-l border-white/40 shadow-[-20px_0_50px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Filters</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowMobileFilter(false)}
                                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-slate-500 hover:bg-black/10 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <FilterPanel filters={filters} onChange={(f) => { handleFilterChange(f); }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Column */}
                    <div className="flex-1 flex flex-col gap-8 px-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
                            <div className="flex-1" />

                            <div className="flex items-center gap-4">
                                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                                    <span className="text-slate-900">{sorted.length}</span> properties found
                                </p>

                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-2 bg-slate-950 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-md shadow-slate-950/10 cursor-pointer"
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filters</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sort By</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value as SortOption)}
                                        className="bg-white/60 backdrop-blur-md border border-white/60 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer shadow-sm hover:bg-white/80"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <HotelCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : visibleHotels.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                                    {visibleHotels.map((hotel, index) => (
                                        <React.Fragment key={hotel.id}>
                                            <HotelCard hotel={hotel} />
                                            {(index + 1) % 12 === 0 && (
                                                <div className="col-span-full my-6 md:my-10">
                                                    <div className="relative overflow-hidden bg-slate-950 rounded-[32px] p-8 md:p-12 group">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                                            <div className="text-center md:text-left">
                                                                <h4 className="text-2xl md:text-4xl font-black text-white tracking-tighter italic mb-2">
                                                                    Unlock 20% Savings
                                                                </h4>
                                                                <p className="text-slate-400 text-sm md:text-base font-bold italic uppercase tracking-widest">
                                                                    On your first premium booking with GetHotel
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-center md:items-end gap-4">
                                                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 flex items-center gap-2">
                                                                    <div className="px-6 py-3 text-lg font-black text-white tracking-[0.2em]">GET20OFF</div>
                                                                    <button className="px-6 py-3 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-500 transition-all active:scale-95 shadow-lg shadow-brand-600/20">
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Valid for limited time only</p>
                                                            </div>
                                                        </div>
                                                        {/* Decorative Elements */}
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-16 flex flex-col items-center gap-6">
                                        <div className="w-px h-16 bg-gradient-to-b from-slate-200 to-transparent" />
                                        <button
                                            onClick={loadMore}
                                            className="group relative px-12 py-5 bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-600 transition-all duration-500 shadow-sm hover:shadow-xl active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            <span className="relative z-10 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 group-hover:text-white transition-colors">
                                                Load More Properties
                                                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                            </span>
                                        </button>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Showing {visibleHotels.length} of {sorted.length} Stays
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[40px] border border-white/40">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                    <Hotel className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 italic">No matches found</h3>
                                <p className="text-slate-500 font-bold max-w-xs text-center px-4">
                                    {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : "Try adjusting your filters to find the perfect stay."}
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters(defaultFilters);
                                        setSearchQuery("");
                                    }}
                                    className="mt-8 px-10 py-4 bg-brand-600 text-white rounded-full text-sm font-black shadow-xl shadow-brand-600/20 active:scale-95 transition-all"
                                >
                                    Reset All Search & Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HotelsPage() {
    return (
        <Suspense fallback={<Loader variant="fullscreen" text="Curating Luxury Stays..." />}>
            <HotelListingContent />
        </Suspense>
    );
}



