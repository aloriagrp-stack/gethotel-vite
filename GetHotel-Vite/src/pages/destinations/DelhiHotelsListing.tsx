import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowUpDown, MapPin, Hotel, X, SlidersHorizontal } from "lucide-react";
import type { FilterState, SortOption, Hotel as HotelType } from "@/types";
import { useStayMode } from "@/context/StayModeContext";
import HotelCard from "@/components/hotels/HotelCard";
import FilterPanel from "@/components/hotels/FilterPanel";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import SEOHead from "@/components/common/SEOHead";
import Loader from "@/components/common/Loader";
import { SITE, buildBreadcrumbSchema, buildFAQSchema, buildCityHotelListingSchema } from "@/lib/seo";
import { hotelApi } from "@/lib/api";

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

const delhiLocalities = [
    { name: "All Delhi", query: "" },
    { name: "Aerocity & Airport", query: "Aerocity" },
    { name: "Connaught Place (CP)", query: "Connaught Place" },
    { name: "Karol Bagh", query: "Karol Bagh" },
    { name: "Paharganj & NDLS", query: "Paharganj" },
    { name: "South Delhi / Saket", query: "South Delhi" },
];

const delhiFaqs = [
    {
        question: "What are the best affordable hotels in Delhi for NRI travelers?",
        answer: "GetHotelStays features verified hotels in top hubs like Karol Bagh, Connaught Place, and Aerocity. NRI guests from the USA, UK, UAE, and Canada can securely pay the 12% deposit online with zero foreign transaction fees, settling the rest at check-in."
    },
    {
        question: "Can I book a hotel in Delhi with 12% deposit?",
        answer: "Yes! With our Pay 12% Deposit model, you only pay a nominal 12% deposit online to lock in your reservation and price. The remaining 88% is paid directly at the hotel during check-in."
    },
    {
        question: "Are hourly hotels available in Delhi near the airport?",
        answer: "Yes, GetHotelStays offers flexible 3, 6, and 12-hour day-use slots in Aerocity and Mahipalpur starting from just ₹699, perfect for layovers at IGI Airport."
    },
    {
        question: "Are couple-friendly hotels available with local ID check-in in Delhi?",
        answer: "Yes, all couple-friendly tagged properties on GetHotelStays welcome 18+ couples with valid government ID cards (Aadhaar, Passport, Driving License) ensuring 100% privacy and smooth check-in."
    }
];

function DelhiHotelsListingContent() {
    const { mode } = useStayMode();
    const [searchParams, setSearchParams] = useSearchParams();
    const guests = searchParams.get("adults") || searchParams.get("guests") || "2";
    const stayType = searchParams.get("stayType") || mode || "nightly";

    const [allHotels, setAllHotels] = useState<HotelType[]>([]);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [selectedLocality, setSelectedLocality] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortOption>("recommended");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalStays, setTotalStays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [searchParams, selectedLocality]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const params: any = {
                    city: "Delhi",
                    page: String(page),
                    limit: "12",
                    minPrice: String(filters.priceRange[0]),
                    maxPrice: String(filters.priceRange[1]),
                    sort,
                    stayType
                };

                if (filters.starRatings.length > 0) {
                    params.starRatings = filters.starRatings.join(",");
                }
                if (filters.guestRatingMin > 0) {
                    params.guestRatingMin = String(filters.guestRatingMin);
                }
                if (filters.amenities.length > 0) {
                    params.amenities = filters.amenities.join(",");
                }
                if (selectedLocality) {
                    params.searchQuery = selectedLocality;
                } else if (searchQuery) {
                    params.searchQuery = searchQuery;
                }

                const response = await hotelApi.searchHotels(params);

                if (page === 1) {
                    setAllHotels(response.data || []);
                } else {
                    setAllHotels(prev => [...prev, ...(response.data || [])]);
                }

                setTotalStays(response.count || (response.data ? response.data.length : 0));
                setHasMore(response.hasMore || false);
            } catch (err: any) {
                console.error("Failed to fetch Delhi hotels:", err);
                if (page === 1) {
                    setAllHotels([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [searchParams, filters, searchQuery, selectedLocality, sort, page, stayType]);

    const loadMore = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    const handleFilterChange = (f: FilterState) => {
        setFilters(f);
        setPage(1);
    };

    return (
        <div className="min-h-screen pt-2 bg-transparent px-0">
            <SEOHead
                title="Hotels in Delhi — Book Affordable to Luxury Stays | Pay 12% | GetHotelStays"
                description="Book 2,000+ verified hotels in Delhi at best prices. Budget stays in Paharganj & Karol Bagh to 5-star luxury in Aerocity & CP. Pay only 12% online, rest at hotel. Free cancellation & 24/7 NRI support."
                keywords={[
                    "hotels in delhi", "delhi hotels booking", "cheap hotels in delhi", "budget hotels in delhi",
                    "luxury hotels in delhi", "hotels near delhi airport", "hotels in aerocity delhi",
                    "hotels in connaught place delhi", "hourly hotels in delhi", "couple friendly hotels delhi",
                    "delhi hotels pay at hotel"
                ]}
                ogUrl={`${SITE.url}/hotels-in-delhi`}
                canonicalUrl={`${SITE.url}/hotels-in-delhi`}
                schemas={[
                    buildBreadcrumbSchema([
                        { name: "Home", url: "/" },
                        { name: "Hotels", url: "/hotels" },
                        { name: "Hotels in Delhi", url: "/hotels-in-delhi" }
                    ]),
                    buildFAQSchema(delhiFaqs),
                ]}
            />

            {/* Top Search Bar Pre-Filled for Delhi */}
            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 px-4 md:px-10">
                <div className="shrink-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        Hotels in <span className="text-brand-600">Delhi</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Verified stays • Pay 12% online, rest at hotel
                    </p>
                </div>

                <div className="w-full lg:max-w-4xl">
                    <SmartSearchBar
                        layoutMode="hotels"
                        hideStories
                        initialState={{
                            destination: { label: "Delhi, India", id: "delhi", category: "trending" },
                            dates: {
                                checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn") as string) : null,
                                checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut") as string) : null
                            },
                            guests: { adults: Number(guests), children: 0, rooms: 1, childAges: [] }
                        }}
                    />
                </div>
            </div>

            {/* Delhi Locality Quick Pills */}
            <div className="w-full px-4 md:px-10 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                        Delhi Hotspots:
                    </span>
                    {delhiLocalities.map((loc) => {
                        const isActive = selectedLocality === loc.query;
                        return (
                            <button
                                key={loc.name}
                                onClick={() => {
                                    setSelectedLocality(loc.query);
                                    setSearchQuery("");
                                }}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                    isActive
                                        ? "bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/10"
                                        : "bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-brand-500"
                                }`}
                            >
                                {loc.name}
                            </button>
                        );
                    })}
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
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Filters</h2>
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
                    <div className="flex-1 flex flex-col gap-6 px-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
                            <div className="flex-1">
                                {selectedLocality && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full text-xs font-bold">
                                        <span>Showing in: {selectedLocality}</span>
                                        <button onClick={() => setSelectedLocality("")} className="hover:text-brand-900">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                                    <span className="text-slate-900">{totalStays}</span> Delhi properties found
                                </p>

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
                                        onChange={(e) => {
                                            setSort(e.target.value as SortOption);
                                            setPage(1);
                                        }}
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

                        {loading && page === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <HotelCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : allHotels.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                                    {allHotels.map((hotel) => (
                                        <HotelCard key={hotel.id} hotel={hotel} />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-8 flex justify-center py-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-950/10"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                                    <span>Loading Stays...</span>
                                                </>
                                            ) : (
                                                <span>Load More Delhi Stays</span>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && (
                                    <div className="mt-8 flex flex-col items-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Showing all {totalStays} Delhi Stays
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[40px] border border-white/40">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                    <Hotel className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 italic">No Delhi matches found</h3>
                                <p className="text-slate-500 font-bold max-w-xs text-center px-4">
                                    Try resetting your filters or select a different Delhi hotspot.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters(defaultFilters);
                                        setSelectedLocality("");
                                        setSearchQuery("");
                                        setPage(1);
                                    }}
                                    className="mt-8 px-10 py-4 bg-brand-600 text-white rounded-full text-sm font-black shadow-xl shadow-brand-600/20 active:scale-95 transition-all"
                                >
                                    Reset All Delhi Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MMT-Style Delhi SEO FAQs Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 mt-20 pt-10 border-t border-slate-200">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                    Frequently Asked Questions About Delhi Hotels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {delhiFaqs.map((faq, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-sm mb-2">
                                {faq.question}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DelhiHotelsListing() {
    return (
        <Suspense fallback={<Loader variant="fullscreen" text="Finding Verified Delhi Hotels..." />}>
            <DelhiHotelsListingContent />
        </Suspense>
    );
}
