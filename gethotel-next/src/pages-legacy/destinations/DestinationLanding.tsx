'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    ArrowRight,
    HelpCircle,
    AlertCircle,
    SlidersHorizontal,
    X,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { hotelApi } from "@/lib/api";
import { Hotel as HotelType, FilterState, SortOption } from "@/types";
import HotelCard from "@/components/hotels/HotelCard";
import FilterPanel from "@/components/hotels/FilterPanel";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import SEOHead from "@/components/common/SEOHead";
import { cn } from "@/lib/utils";
import {
    SITE,
    buildFAQSchema,
    buildBreadcrumbSchema,
    buildCitySchema,
    buildCityHotelListingSchema,
    buildLocalBusinessListSchema,
} from "@/lib/seo";

interface Section {
    h2: string;
    text: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface InternalLink {
    label: string;
    url: string;
}

interface DestinationLandingProps {
    city: string;
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    introduction: string;
    sections: Section[];
    faqs: FAQ[];
    internalLinks: InternalLink[];
    urlSlug?: string;
    urlPrefix?: string;
    filterSlug?: string;
}

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

export default function DestinationLanding({
    city,
    title,
    description,
    keywords,
    h1,
    introduction,
    sections = [],
    faqs = [],
    internalLinks = [],
    urlSlug,
    urlPrefix = "/",
    filterSlug,
}: DestinationLandingProps) {
    const { lang } = useParams();
    const currentLang = lang || "en";
    const [searchParams] = useSearchParams();

    const guests = searchParams.get("adults") || searchParams.get("guests") || "2";

    const [hotels, setHotels] = useState<HotelType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [sort, setSort] = useState<SortOption>("recommended");
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    // Fetch hotels for this specific city & apply filter slug overrides if present
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                let response;
                const params: any = {
                    city,
                    limit: "50",
                };

                if (filterSlug) {
                    const cleanFilter = filterSlug.toLowerCase().trim();
                    if (cleanFilter === "couple-friendly") {
                        params.searchQuery = "couple friendly";
                    } else if (cleanFilter === "hourly") {
                        params.stayType = "hourly";
                    } else if (cleanFilter === "budget") {
                        params.maxPrice = "2500";
                    } else if (cleanFilter === "luxury") {
                        params.minPrice = "4000";
                        params.starRatings = "4,5";
                    }
                }

                // Also inherit any query params
                searchParams.forEach((val, key) => {
                    if (key !== "city") params[key] = val;
                });

                response = await hotelApi.searchHotels(params);
                setHotels(response.data || []);
            } catch (err) {
                console.error(`Failed to fetch hotels for ${city}:`, err);
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
        window.scrollTo(0, 0);
    }, [city, filterSlug, searchParams]);

    // Client-side filtering & sorting on the returned destination inventory
    const filteredHotels = useMemo(() => {
        let list = [...hotels];

        // Price filter
        list = list.filter((h) => {
            const price = Number(h.pricePerNight || 0);
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });

        // Star rating filter
        if (filters.starRatings.length > 0) {
            list = list.filter((h) => filters.starRatings.includes(Number(h.starRating || 0)));
        }

        // Guest rating filter
        if (filters.guestRatingMin > 0) {
            list = list.filter((h) => Number(h.guestRating || 0) >= filters.guestRatingMin);
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
            list = list.filter((h) => {
                const hotelAmenities = Array.isArray(h.amenities)
                    ? h.amenities
                    : typeof h.amenities === "string"
                    ? JSON.parse(h.amenities || "[]")
                    : [];
                return filters.amenities.every((a) =>
                    hotelAmenities.some((ha: string) => ha.toLowerCase().includes(a.toLowerCase()))
                );
            });
        }

        // Sorting
        if (sort === "price_asc") {
            list.sort((a, b) => Number(a.pricePerNight || 0) - Number(b.pricePerNight || 0));
        } else if (sort === "price_desc") {
            list.sort((a, b) => Number(b.pricePerNight || 0) - Number(a.pricePerNight || 0));
        } else if (sort === "rating") {
            list.sort((a, b) => Number(b.guestRating || 0) - Number(a.guestRating || 0));
        }

        return list;
    }, [hotels, filters, sort]);

    const handleFilterChange = (f: FilterState) => {
        setFilters(f);
    };

    // Breadcrumbs and schema generation
    const isSubPage = filterSlug || (urlSlug && urlSlug !== city.toLowerCase() + "-hotels");
    const rawPath = `${urlPrefix === "/" ? "/" : urlPrefix}${urlSlug || city.toLowerCase() + "-hotels"}`.replace(
        /^\/+/,
        ""
    );
    const pagePath = `/${currentLang}/${rawPath}`;

    const breadcrumbs = [
        { name: "Home", url: `/${currentLang}` },
        { name: "Hotels", url: `/${currentLang}/hotels` },
        { name: `${city} Hotels`, url: isSubPage ? `/${currentLang}/${city.toLowerCase()}-hotels` : pagePath },
    ];
    if (isSubPage && h1) {
        breadcrumbs.push({ name: h1.split("—")[0].trim(), url: pagePath });
    }

    const schemas: object[] = [
        buildFAQSchema(faqs),
        buildCitySchema(
            city,
            `Book verified hotels in ${city} at best prices. Budget to luxury stays. Pay 12% now, rest at hotel. Trusted by NRIs worldwide.`
        ),
        buildCityHotelListingSchema(city, 2000, "₹699-₹25,000", urlSlug || `${city.toLowerCase()}-hotels`),
        buildBreadcrumbSchema(breadcrumbs),
    ];

    if (isSubPage && urlSlug) {
        schemas.push(
            buildLocalBusinessListSchema(
                h1.split("—")[0].trim(),
                city,
                urlSlug,
                keywords.slice(0, 3),
                "₹699-₹25,000"
            )
        );
    }

    return (
        <div className="min-h-screen pt-2 pb-16 bg-transparent px-0">
            <SEOHead
                title={title}
                description={description}
                keywords={keywords}
                ogUrl={`${SITE.url}${pagePath}`}
                canonicalUrl={`${SITE.url}${pagePath}`}
                schemas={schemas}
            />

            {/* ── Unified Main Layout (Left Sidebar starts at Top parallel with Search Bar) ── */}
            <div className="w-full max-w-[1440px] mx-auto px-2 md:px-5 lg:px-6 py-0">
                <div className="flex gap-6 lg:gap-8 items-start">
                    
                    {/* Desktop Sidebar Filter (Starts at the very top parallel with Search Bar, expanded to w-[330px]) */}
                    <aside className="hidden lg:block w-80 lg:w-[330px] shrink-0 sticky top-20 z-30">
                        <FilterPanel filters={filters} onChange={handleFilterChange} />
                    </aside>

                    {/* Mobile Filter Modal (Butter-smooth Spring Sheet) */}
                    <AnimatePresence>
                        {showMobileFilter && (
                            <motion.div
                                initial={{ opacity: 0, y: "-100%" }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: "-100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                                className="fixed inset-0 z-[100] lg:hidden flex flex-col bg-white overflow-hidden"
                            >
                                {/* Sticky Top Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-black text-slate-950">Filters</h2>
                                        {(filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 500000 ? 1 : 0)) > 0 && (
                                            <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-black">
                                                {filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 500000 ? 1 : 0)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowMobileFilter(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Scrollable Filter Body (Clean, No Nested Box) */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <FilterPanel
                                        isMobileModal={true}
                                        filters={filters}
                                        onChange={(f) => handleFilterChange(f)}
                                    />
                                </div>

                                {/* Sticky Bottom Action Bar */}
                                <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0 shadow-lg">
                                    <button
                                        onClick={() => {
                                            setFilters(defaultFilters);
                                            handleFilterChange(defaultFilters);
                                        }}
                                        className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowMobileFilter(false)}
                                        className="flex-[2] py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                                    >
                                        Show {filteredHotels.length} Stays
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Column (Starts with Top Right-aligned Search Bar) */}
                    <div className="flex-1 min-w-0 flex flex-col gap-3 md:gap-6">
                        {/* Top Search Pill Container (Right-aligned inside right column) */}
                        <div className="w-full flex justify-end">
                            <div className="w-full">
                                <SmartSearchBar
                                    layoutMode="hotels"
                                    hideStories
                                    initialState={{
                                        destination: { label: city, id: city.toLowerCase(), category: "trending" },
                                        dates: {
                                            checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn") as string) : null,
                                            checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut") as string) : null,
                                        },
                                        guests: { adults: Number(guests), children: 0, rooms: 1, childAges: [] },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Streamlined Results Bar (Hidden on Mobile, Clean on Desktop) */}
                        <div className="flex items-center justify-end sm:justify-between gap-3 pt-0 pb-1">
                            {/* Title (Only on Desktop) */}
                            <div className="hidden lg:block">
                                <h1 className="text-lg md:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                                    <span>{h1.split("—")[0].trim() || h1}</span>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {filteredHotels.length}
                                    </span>
                                </h1>
                            </div>

                            {/* Mobile & Desktop Sort & Filter Actions */}
                            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                                {/* Mobile Filter Button (NO Icon, Clean Text) */}
                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                >
                                    <span>Filters</span>
                                    {(filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 500000 ? 1 : 0)) > 0 && (
                                        <span className="bg-brand-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                                            {filters.starRatings.length + filters.amenities.length + (filters.guestRatingMin ? 1 : 0) + (filters.priceRange[1] < 500000 ? 1 : 0)}
                                        </span>
                                    )}
                                </button>

                                {/* Sort Dropdown */}
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortOption)}
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

                        {/* Hotel Cards Grid (Visible Immediately Without Scrolling) */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <HotelCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredHotels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredHotels.map((hotel) => (
                                    <HotelCard key={hotel.id} hotel={hotel} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    No properties match your filters in {city}
                                </h3>
                                <p className="text-slate-500 text-xs leading-relaxed max-w-md mb-5">
                                    Try adjusting your price range or star rating filters to discover more hotel stays in {city}.
                                </p>
                                <button
                                    onClick={() => setFilters(defaultFilters)}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {/* ── Below Hotel Cards: AEO Fact Sheet & Editorial Content ── */}
                        
                        {/* Delhi Micro-Hub Quick Switcher Pills (Bottom Placement) */}
                        {city.toLowerCase() === "delhi" && (
                            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 md:p-5 shadow-sm space-y-2.5 mt-4">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                    Explore Delhi Zones & Micro-Stays
                                </p>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 -mx-1 px-1 no-scrollbar">
                                    {[
                                        { label: "All Delhi Stays", url: `/${currentLang}/delhi-hotels`, slug: "delhi-hotels" },
                                        { label: "⚡ Hourly Stays (3h/6h)", url: `/${currentLang}/hourly-hotels-in-delhi`, slug: "hourly-hotels-in-delhi" },
                                        { label: "🔒 Couple Friendly", url: `/${currentLang}/couple-friendly-hotels-in-delhi`, slug: "couple-friendly-hotels-in-delhi" },
                                        { label: "✈️ Near Airport (T3/Aerocity)", url: `/${currentLang}/hotels-near-delhi-airport`, slug: "hotels-near-delhi-airport" },
                                        { label: "🚆 Near NDLS Station", url: `/${currentLang}/hotels-near-new-delhi-railway-station`, slug: "hotels-near-new-delhi-railway-station" },
                                        { label: "🏛️ Connaught Place (CP)", url: `/${currentLang}/hotels-in-connaught-place-delhi`, slug: "hotels-in-connaught-place-delhi" },
                                        { label: "🛍️ South Delhi (Saket)", url: `/${currentLang}/hotels-in-south-delhi`, slug: "hotels-in-south-delhi" },
                                        { label: "🍜 Karol Bagh", url: `/${currentLang}/hotels-in-karol-bagh-delhi`, slug: "hotels-in-karol-bagh-delhi" },
                                    ].map((hub) => {
                                        const isActive = urlSlug === hub.slug || (!urlSlug && hub.slug === "delhi-hotels");
                                        return (
                                            <Link
                                                key={hub.slug}
                                                to={hub.url}
                                                className={cn(
                                                    "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0 border cursor-pointer",
                                                    isActive
                                                        ? "bg-slate-950 text-white border-slate-950 shadow-md"
                                                        : "bg-white/90 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {hub.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Delhi AEO Quick Facts Matrix */}
                        {city.toLowerCase() === "delhi" && (
                            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-3 mt-2">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand-600" />
                                    <span>Delhi Stay Fact Sheet & Quick Insights</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                                    <div className="bg-white/90 border border-slate-100 rounded-xl p-3 text-left shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Starting Rates</p>
                                        <p className="text-xs font-black text-slate-900">₹499 (Hourly) / ₹899 (Day)</p>
                                    </div>
                                    <div className="bg-white/90 border border-slate-100 rounded-xl p-3 text-left shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Payment Model</p>
                                        <p className="text-xs font-black text-emerald-600">Pay 12% Deposit</p>
                                    </div>
                                    <div className="bg-white/90 border border-slate-100 rounded-xl p-3 text-left shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Couple Policy</p>
                                        <p className="text-xs font-black text-slate-900">100% Local ID Safe</p>
                                    </div>
                                    <div className="bg-white/90 border border-slate-100 rounded-xl p-3 text-left shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Check-in Flexibility</p>
                                        <p className="text-xs font-black text-blue-600">24/7 + 3h/6h Slots</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* About Destination & Full Introduction Text */}
                        {introduction && (
                            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm mt-2">
                                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                                    About {h1}
                                </h2>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                                    {introduction.length > 280 && !isExpanded
                                        ? `${introduction.slice(0, 280)}...`
                                        : introduction}
                                    {introduction.length > 280 && (
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="text-brand-600 hover:text-brand-700 font-bold ml-1.5 inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                                        >
                                            {isExpanded ? "Read Less" : "Read More"}
                                        </button>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* ── Editorial Content Sections (H2 & H3) ── */}
                        {sections.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {sections.map((sec, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 space-y-2.5 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                                            {sec.h2}
                                        </h2>
                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                                            {sec.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── FAQ Section (Accordion) ── */}
                        {faqs.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm mt-4">
                                <div className="flex items-center gap-2.5">
                                    <HelpCircle className="w-5 h-5 text-brand-600" />
                                    <h2 className="text-lg md:text-xl font-bold text-slate-900">
                                        Frequently Asked Questions about {city} Hotels
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {faqs.map((faq, idx) => {
                                        const isOpen = openFaqIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                className="border border-slate-200/80 rounded-xl overflow-hidden bg-white/90 transition-colors"
                                            >
                                                <button
                                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                                    className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-900 text-xs md:text-sm gap-4 hover:bg-slate-50/80 cursor-pointer"
                                                >
                                                    <span>{faq.question}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-4 pb-4 pt-1 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100">
                                                        {faq.answer}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Popular Hotel Categories in {city} / Interlinking ── */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 text-slate-900 space-y-4 mt-2">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-brand-600" />
                                Popular Categories & Nearby Stays
                            </h3>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Link
                                    to={`/${currentLang}/hotels?city=${encodeURIComponent(city)}`}
                                    className="px-3.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-brand-700 transition-colors"
                                >
                                    All {city} Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/delhi-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Delhi Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/goa-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Goa Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/jaipur-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Jaipur Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/manali-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Manali Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/shimla-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Shimla Hotels
                                </Link>
                                <Link
                                    to={`/${currentLang}/udaipur-hotels`}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                >
                                    Udaipur Hotels
                                </Link>
                                {internalLinks.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        to={link.url}
                                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-brand-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
