'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown, MapPin, Hotel, X, Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { FilterState, SortOption } from "@/types";
import { useStayMode } from "@/context/StayModeContext";

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

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recommended", label: "Recommended" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Guest Rating" },
];

const defaultFilters: FilterState = {
    priceRange: [0, 500000],
    starRatings: [],
    guestRatingMin: 0,
    amenities: [],
};

function HotelListingContent() {
    const { mode } = useStayMode();
    const isMobile = useIsMobile();
    const [searchParams] = useSearchParams();
    const cityParam = searchParams.get("city") || "All";
    const guests = searchParams.get("adults") || searchParams.get("guests") || "2";
    const stayType = searchParams.get("stayType") || mode || "nightly";

    const [allHotels, setAllHotels] = useState<HotelType[]>([]);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortOption>("recommended");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalStays, setTotalStays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Reset page to 1 on searchParams change
    useEffect(() => {
        setPage(1);
    }, [searchParams]);

    // Fetch hotels from API with backend pagination and filters
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);

                const params: any = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                params.page = String(page);
                params.limit = "12";
                params.minPrice = String(filters.priceRange[0]);
                params.maxPrice = String(filters.priceRange[1]);
                
                if (filters.starRatings.length > 0) {
                    params.starRatings = filters.starRatings.join(",");
                }
                
                if (filters.guestRatingMin > 0) {
                    params.guestRatingMin = String(filters.guestRatingMin);
                }

                if (filters.amenities.length > 0) {
                    params.amenities = filters.amenities.join(",");
                }

                if (searchQuery.trim()) {
                    params.searchQuery = searchQuery.trim();
                }

                if (sort) {
                    params.sort = sort;
                }

                const response = await hotelApi.searchHotels(params);

                if (page === 1) {
                    setAllHotels(response.data || []);
                } else {
                    setAllHotels(prev => [...prev, ...(response.data || [])]);
                }

                setTotalStays(response.count || 0);
                setHasMore(response.hasMore || false);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch hotels:", err);
                setError("Could not load hotels. Please try again.");
                if (page === 1) {
                    setAllHotels([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [searchParams, filters, searchQuery, sort, page]);

    const visibleHotels = allHotels;

    const loadMore = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    const handleFilterChange = (f: FilterState) => {
        setFilters(f);
        setPage(1);
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
        <div className="min-h-screen pt-2 pb-16 bg-transparent px-0">
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

            {/* Unified Main Layout (Left Sidebar starts at Top parallel with Search Bar) */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-0">
                <div className="flex gap-8 lg:gap-9 items-start">
                    
                    {/* Sidebar Filter — Desktop (Starts at the very top parallel with Search Bar, expanded to w-[330px]) */}
                    <aside className="hidden lg:block w-80 lg:w-[330px] shrink-0 sticky top-20 z-30">
                        <FilterPanel filters={filters} onChange={handleFilterChange} />
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {showMobileFilter && (
                        <div className="fixed inset-0 z-[100] lg:hidden">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300" onClick={() => setShowMobileFilter(false)} />
                            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-white overflow-y-auto p-6 border-l border-slate-200 shadow-2xl z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5 text-brand-600" />
                                        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowMobileFilter(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <FilterPanel filters={filters} onChange={(f) => { handleFilterChange(f); }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Column (Starts with Top Right-aligned Search Bar) */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">
                        {/* Top Search Pill Container (Right-aligned inside right column) */}
                        <div className="w-full flex justify-end">
                            <div className="w-full">
                                <SmartSearchBar
                                    layoutMode="hotels"
                                    hideStories
                                    className="w-full"
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

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl md:text-2xl font-extrabold text-slate-950 tracking-tight">
                                    {cityParam !== "All" ? `Hotels in ${cityParam}` : "All Hotels in India"}
                                </h1>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                    <span className="text-slate-900 font-bold">{totalStays}</span> verified properties found
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-2 bg-slate-900 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filters</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sort By</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => {
                                            setSort(e.target.value as SortOption);
                                            setPage(1);
                                        }}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer shadow-sm hover:border-slate-300"
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

                        {loading && page === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <HotelCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : visibleHotels.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {visibleHotels.map((hotel) => (
                                        <HotelCard key={hotel.id} hotel={hotel} />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-8 flex justify-center py-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? "Loading more..." : "Load More Stays"}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 p-8 text-center">
                                <Hotel className="w-12 h-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    No hotels found matching your search
                                </h3>
                                <p className="text-slate-500 text-xs leading-relaxed max-w-md mb-5">
                                    Try clearing some filters or changing your search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters(defaultFilters);
                                        setSearchQuery("");
                                    }}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Hotels() {
    return (
        <Suspense fallback={<Loader />}>
            <HotelListingContent />
        </Suspense>
    );
}
