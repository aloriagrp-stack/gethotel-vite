'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-0">
                <div className="flex gap-8 lg:gap-9 items-start">
                    
                    {/* Desktop Sidebar Filter (Starts at the very top parallel with Search Bar, expanded to w-[330px]) */}
                    <aside className="hidden lg:block w-80 lg:w-[330px] shrink-0 sticky top-20 z-30">
                        <FilterPanel filters={filters} onChange={handleFilterChange} />
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {showMobileFilter && (
                        <div className="fixed inset-0 z-[100] lg:hidden">
                            <div
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
                                onClick={() => setShowMobileFilter(false)}
                            />
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
                                <FilterPanel
                                    filters={filters}
                                    onChange={(f) => {
                                        handleFilterChange(f);
                                    }}
                                />
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

                        {/* City / Destination Header Area */}
                        <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                        {h1}
                                    </h1>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                                        <span>Verified properties in {city} — Pay only 12% deposit online</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                                        <strong className="text-slate-900 font-black">{filteredHotels.length}</strong> properties
                                    </span>

                                    {/* Mobile Filter Trigger Button */}
                                    <button
                                        onClick={() => setShowMobileFilter(true)}
                                        className="lg:hidden flex items-center gap-2 bg-slate-900 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md"
                                    >
                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                        <span>Filters</span>
                                    </button>

                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-1.5">
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
                            </div>

                            {/* SEO Introduction Text (Expandable) */}
                            {introduction && (
                                <div className="pt-2 border-t border-slate-100/80">
                                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                                        {introduction.length > 220 && !isExpanded
                                            ? `${introduction.slice(0, 220)}...`
                                            : introduction}
                                        {introduction.length > 220 && (
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
                        </div>

                        {/* Hotel Cards Grid */}
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

                        {/* ── Editorial Content Sections (H2 & H3) ── */}
                        {sections.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
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
