import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { ArrowUpDown, MapPin, Hotel, X, SlidersHorizontal } from "lucide-react";
import type { FilterState, SortOption, Hotel as HotelType } from "@/types";
import { useStayMode } from "@/context/StayModeContext";
import HotelCard from "@/components/hotels/HotelCard";
import FilterPanel from "@/components/hotels/FilterPanel";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import SEOHead from "@/components/common/SEOHead";
import Loader from "@/components/common/Loader";
import { SITE, buildBreadcrumbSchema, buildFAQSchema, DELHI_FAQS } from "@/lib/seo";
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

function DelhiHotelsListingContent() {
    const { lang } = useParams();
    const currentLang = lang || "en";
    const { mode } = useStayMode();
    const [searchParams] = useSearchParams();
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

    // Build comprehensive JSON-LD Structured Data Schema for Google Crawlers / Bots
    const hotelStructuredData = useMemo(() => {
        const itemListElements = allHotels.slice(0, 30).map((hotel, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Hotel",
                "@id": `${SITE.url}/${currentLang}/hotel/${hotel.id}`,
                "name": hotel.name,
                "description": hotel.description || `Book ${hotel.name} in Delhi on GetHotelStays. Pay only 12% online.`,
                "url": `${SITE.url}/${currentLang}/hotel/${hotel.id}`,
                "image": Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images[0] : SITE.logo,
                "priceRange": `₹${hotel.pricePerNight || 999}`,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": hotel.address || "Delhi",
                    "addressLocality": "Delhi",
                    "addressRegion": "Delhi",
                    "postalCode": "110001",
                    "addressCountry": "IN"
                },
                ...(hotel.guestRating ? {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": (Number(hotel.guestRating) / 2).toFixed(1),
                        "reviewCount": hotel.reviewCount || 25,
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                } : {}),
                ...(hotel.starRating ? {
                    "starRating": {
                        "@type": "Rating",
                        "ratingValue": String(hotel.starRating)
                    }
                } : {})
            }
        }));

        const schemas: any[] = [
            buildBreadcrumbSchema([
                { name: "Home", url: `/${currentLang}` },
                { name: "Hotels", url: `/${currentLang}/hotels` },
                { name: "Hotels in Delhi", url: `/${currentLang}/hotels-in-delhi` }
            ]),
            buildFAQSchema(DELHI_FAQS),
            {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Hotels in Delhi",
                "description": "Verified hotels in Delhi at best prices. Budget to 5-star luxury stays. Pay 12% online, rest at hotel.",
                "url": `${SITE.url}/${currentLang}/hotels-in-delhi`,
                "numberOfItems": totalStays || allHotels.length,
                "itemListElement": itemListElements
            }
        ];

        return schemas;
    }, [allHotels, totalStays, currentLang]);

    return (
        <div className="min-h-screen pt-2 bg-transparent px-0">
            <SEOHead
                title="Hotels in Delhi — Book Verified Stays from ₹499 | Pay 12% Online | GetHotelStays"
                description="Book 2,000+ verified hotels in Delhi with Pay 12% Online model. Budget hotels in Paharganj & Karol Bagh (₹499) to 5-star luxury in Aerocity & CP. Couple-friendly with local ID, hourly day-use & 24/7 NRI support."
                keywords={[
                    "hotels in delhi", "delhi hotels booking", "cheap hotels in delhi", "budget hotels in delhi",
                    "luxury hotels in delhi", "hotels near delhi airport", "hotels in aerocity delhi",
                    "hotels in connaught place delhi", "hourly hotels in delhi", "couple friendly hotels delhi",
                    "delhi hotels pay at hotel", "hotels near new delhi railway station", "hotels in karol bagh delhi",
                    "hotels in south delhi", "delhi hotels for nri", "day use hotels delhi", "3 star hotels in delhi",
                    "5 star hotels in aerocity delhi", "delhi hotels free cancellation", "pay 12 percent hotel booking"
                ]}
                ogUrl={`${SITE.url}/${currentLang}/hotels-in-delhi`}
                canonicalUrl={`${SITE.url}/${currentLang}/hotels-in-delhi`}
                schemas={hotelStructuredData}
            />

            {/* Top Search Bar — Native GetHotelStays Style */}
            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 px-4 md:px-10">
                <div className="shrink-0 sr-only">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-950 tracking-tight leading-tight">
                        Hotels in Delhi — Book Verified Stays Online
                    </h1>
                </div>

                <div className="w-full lg:max-w-4xl mx-auto">
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

            {/* High-Converting USP Badges */}
            <div className="w-full px-4 md:px-10 mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xs shrink-0">
                            12%
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">Pay 12% Online</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Rest at check-in</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs shrink-0">
                            💑
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">Couple Friendly</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Local IDs accepted</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs shrink-0">
                            ⏱️
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">Hourly Stays</p>
                            <p className="text-[10px] text-slate-500 font-semibold">3, 6, 12 Hrs slots</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                            🌍
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">NRI & Global Cards</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Zero foreign markup</p>
                        </div>
                    </div>
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
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
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
                                    <span className="text-slate-900">{totalStays}</span> properties found
                                </p>

                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-2 bg-slate-950 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-md shadow-slate-950/10 cursor-pointer"
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filters</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SORT BY</span>
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
                                    className="mt-8 px-10 py-4 bg-brand-600 text-white rounded-full text-sm font-black shadow-xl shadow-brand-600/20 active:scale-95 transition-all cursor-pointer"
                                >
                                    Reset All Delhi Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ High-Converting White-Hat SEO Sections ═══ */}

            {/* Delhi Area Guides */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 mt-16 pt-10 border-t border-slate-200">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                        Best Areas to Stay in Delhi for Every Traveler
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-2">
                        Whether catching a flight at IGI Airport, visiting for business in Connaught Place, or exploring heritage markets, choose the ideal Delhi neighbourhood.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xs hover:border-brand-500/50 transition-all">
                        <span className="text-2xl mb-3 block">✈️</span>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Aerocity & Mahipalpur</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            Ideal for flight layovers, transit passengers, and business travelers. 5 minutes from IGI Terminal 3 with free airport shuttles & 24/7 check-in.
                        </p>
                        <Link to={`/${currentLang}/hotels/delhi/near-delhi-airport`} className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                            Explore Airport Hotels →
                        </Link>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xs hover:border-brand-500/50 transition-all">
                        <span className="text-2xl mb-3 block">🏛️</span>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Connaught Place (CP)</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            Central Delhi's premier commercial hub. Walk to India Gate, Rajiv Chowk Metro, luxury restaurants, and embassies in Chanakyapuri.
                        </p>
                        <Link to={`/${currentLang}/hotels/delhi/connaught-place`} className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                            Explore CP Hotels →
                        </Link>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xs hover:border-brand-500/50 transition-all">
                        <span className="text-2xl mb-3 block">🚆</span>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Paharganj & Karol Bagh</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            Top value-for-money zones near New Delhi Railway Station (NDLS). Famous for street shopping, budget family suites, and authentic street food.
                        </p>
                        <Link to={`/${currentLang}/hotels/delhi/near-new-delhi-railway-station`} className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                            Explore NDLS Hotels →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Delhi Hotel Price Guide Table */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 mt-12">
                <div className="p-6 md:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm overflow-x-auto">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4">
                        Delhi Hotel Rates & Tariff Guide (2026)
                    </h2>
                    <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 font-black">Stay Category</th>
                                <th className="pb-3 font-black">Price Range / Night</th>
                                <th className="pb-3 font-black">Top Recommended Areas</th>
                                <th className="pb-3 font-black">Deposit Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr>
                                <td className="py-3.5 font-bold text-slate-900">Budget Stays & Dorms</td>
                                <td className="py-3.5 text-brand-600 font-black">₹499 - ₹1,199</td>
                                <td className="py-3.5">Paharganj, Mahipalpur, Karol Bagh</td>
                                <td className="py-3.5 font-bold text-emerald-600">Only 12% Online</td>
                            </tr>
                            <tr>
                                <td className="py-3.5 font-bold text-slate-900">3-Star & Boutique Stays</td>
                                <td className="py-3.5 text-brand-600 font-black">₹1,299 - ₹2,999</td>
                                <td className="py-3.5">Karol Bagh, South Delhi, Janpath</td>
                                <td className="py-3.5 font-bold text-emerald-600">Only 12% Online</td>
                            </tr>
                            <tr>
                                <td className="py-3.5 font-bold text-slate-900">5-Star & Luxury Resorts</td>
                                <td className="py-3.5 text-brand-600 font-black">₹4,999 - ₹18,000+</td>
                                <td className="py-3.5">Aerocity, Connaught Place, Chanakyapuri</td>
                                <td className="py-3.5 font-bold text-emerald-600">Only 12% Online</td>
                            </tr>
                            <tr>
                                <td className="py-3.5 font-bold text-slate-900">Hourly / Day-Use Slots (3-12 Hrs)</td>
                                <td className="py-3.5 text-brand-600 font-black">₹399 - ₹1,499</td>
                                <td className="py-3.5">IGI Airport T3, Aerocity, NDLS</td>
                                <td className="py-3.5 font-bold text-emerald-600">Only 12% Online</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SEO Content & FAQ Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 mt-14 mb-16 pt-10 border-t border-slate-200">
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Frequently Asked Questions About Hotels in Delhi
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Everything you need to know about booking, deposits, check-in rules & transit stays in Delhi.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {DELHI_FAQS.slice(0, 10).map((faq, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-xs">
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

