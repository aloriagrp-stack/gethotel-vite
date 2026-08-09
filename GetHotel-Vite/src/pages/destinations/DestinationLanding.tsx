import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, HelpCircle, AlertCircle, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { hotelApi } from "@/lib/api";
import { Hotel as HotelType } from "@/types";
import HotelCard from "@/components/hotels/HotelCard";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SEOHead from "@/components/common/SEOHead";
import { SITE, buildFAQSchema, buildBreadcrumbSchema, buildCitySchema, buildCityHotelListingSchema, buildLocalBusinessListSchema } from "@/lib/seo";

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

export default function DestinationLanding({
    city,
    title,
    description,
    keywords,
    h1,
    introduction,
    sections,
    faqs,
    internalLinks,
    urlSlug,
    urlPrefix = "/",
    filterSlug,
}: DestinationLandingProps) {
    const [hotels, setHotels] = useState<HotelType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                let response;
                if (filterSlug) {
                    const searchParams: any = { city };
                    const cleanFilter = filterSlug.toLowerCase().trim();
                    if (cleanFilter === "couple-friendly") {
                        searchParams.searchQuery = "couple friendly";
                    } else if (cleanFilter === "hourly") {
                        searchParams.stayType = "hourly";
                    } else if (cleanFilter === "budget") {
                        searchParams.maxPrice = "2000";
                    } else if (cleanFilter === "luxury") {
                        searchParams.minPrice = "4000";
                        searchParams.starRatings = "4,5";
                    }
                    response = await hotelApi.searchHotels(searchParams);
                } else {
                    response = await hotelApi.getHotels(city);
                }
                setHotels(response.data || []);
            } catch (err) {
                console.error(`Failed to fetch hotels for ${city} with filter ${filterSlug}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [city, filterSlug]);

    // Build smart breadcrumbs: sub-pages get an extra level
    const isSubPage = filterSlug || (urlSlug && urlSlug !== city.toLowerCase() + "-hotels");
    const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Hotels", url: "/hotels" },
        { name: `${city} Hotels`, url: isSubPage ? `/${city.toLowerCase()}-hotels` : `${urlPrefix}${urlSlug || city.toLowerCase() + "-hotels"}` },
    ];
    if (isSubPage && h1) {
        breadcrumbs.push({ name: h1.split("—")[0].trim(), url: `${urlPrefix}${urlSlug || city.toLowerCase() + "-hotels"}` });
    }

    // Build schemas array
    const schemas: object[] = [
        buildFAQSchema(faqs),
        buildCitySchema(city, `Book verified hotels in ${city} at best prices. Budget to luxury stays. Pay 12% now, rest at hotel. Trusted by NRIs worldwide.`),
        buildCityHotelListingSchema(city, 2000, "₹699-₹25,000", urlSlug || `${city.toLowerCase()}-hotels`),
        buildBreadcrumbSchema(breadcrumbs),
    ];

    // Add LocalBusiness schema for neighbourhood and sub-category pages
    if (isSubPage && urlSlug) {
        schemas.push(buildLocalBusinessListSchema(
            h1.split("—")[0].trim(),
            city,
            urlSlug,
            keywords.slice(0, 3),
            "₹699-₹25,000"
        ));
    }

    return (
        <div className="min-h-screen pt-3 pb-8 md:pt-6 md:pb-12 bg-transparent px-0">
            <SEOHead
                title={title}
                description={description}
                keywords={keywords}
                ogUrl={`${SITE.url}${urlPrefix}${urlSlug || city.toLowerCase() + "-hotels"}`}
                canonicalUrl={`${SITE.url}${urlPrefix}${urlSlug || city.toLowerCase() + "-hotels"}`}
                schemas={schemas}
            />

            <div className="w-full max-w-none mx-auto px-4 md:px-10 space-y-8 md:space-y-12">
                
                {/* ── Header SEO Area ── */}
                <div className="max-w-4xl space-y-2 md:space-y-3">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        {h1}
                    </h1>
                    <p className="text-slate-600 text-xs md:text-sm lg:text-base leading-relaxed font-medium">
                        {introduction.length > 200 && !isExpanded
                            ? `${introduction.slice(0, 200)}...`
                            : introduction}
                        {introduction.length > 200 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-brand-600 hover:text-brand-500 font-bold ml-1.5 focus:outline-none inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                            >
                                {isExpanded ? "Read Less" : "Read More"}
                            </button>
                        )}
                    </p>
                </div>

                {/* ── ChatGHS AI Assistant Banner ── */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 border border-slate-800 rounded-3xl p-5 md:p-7 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "4s" }} />
                            <span>Powered by ChatGHS Travel AI</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-white">
                            Need personalized hotel recommendations in {city}?
                        </h3>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">
                            Ask ChatGHS AI for couple friendly stays, budget options, or airport layover rooms in real-time.
                        </p>
                    </div>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent("open-ai-copilot"))}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 border border-white/20"
                    >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Ask ChatGHS AI</span>
                    </button>
                </div>

                {/* ── Live Hotels Listing Section ── */}
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin className="w-5 h-5 md:w-6 h-6 text-brand-600 animate-pulse" />
                        Available properties in {city}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <HotelCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : hotels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {hotels.map(hotel => (
                                <HotelCard key={hotel.id} hotel={hotel} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-8 text-center max-w-2xl">
                            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No active properties listed yet</h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md">
                                We are currently onboarding verified hotel partners in {city}. Check back soon or search other top tourist locations in India!
                            </p>
                            <Link 
                                to="/hotels"
                                className="mt-6 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                            >
                                Browse All India Hotels
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Editorial Content Sections (H2 & H3) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-6">
                    {sections.map((sec, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4 hover:shadow-xl transition-all duration-300">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                {sec.h2}
                            </h2>
                            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">
                                {sec.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ Section (Accordion style) ── */}
                <div className="space-y-6 max-w-4xl pt-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-3xl p-6 space-y-2">
                                <h3 className="font-bold text-slate-950 text-sm md:text-base">
                                    {faq.question}
                                </h3>
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Category Interlinking ── */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 text-slate-900 space-y-6">
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-955">
                        Popular Hotel Categories in {city}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed">
                        Find the perfect accommodation tailored to your travel needs. Explore budget options, hourly rooms, couple-friendly stays, and premium hotels in {city}.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Link
                            to={`/hotels-in/${urlSlug || city.toLowerCase()}`}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 ${
                                !filterSlug
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                            }`}
                        >
                            All Stays in {city}
                        </Link>
                        <Link
                            to={`/hotels-in/${urlSlug || city.toLowerCase()}/couple-friendly`}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 ${
                                filterSlug === "couple-friendly"
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                            }`}
                        >
                            Couple Friendly Hotels in {city}
                        </Link>
                        <Link
                            to={`/hotels-in/${urlSlug || city.toLowerCase()}/hourly`}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 ${
                                filterSlug === "hourly"
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                            }`}
                        >
                            Hourly & Day-Use Hotels in {city}
                        </Link>
                        <Link
                            to={`/hotels-in/${urlSlug || city.toLowerCase()}/budget`}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 ${
                                filterSlug === "budget"
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                            }`}
                        >
                            Budget-Friendly Hotels in {city}
                        </Link>
                        <Link
                            to={`/hotels-in/${urlSlug || city.toLowerCase()}/luxury`}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 ${
                                filterSlug === "luxury"
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                            }`}
                        >
                            Premium & Luxury Hotels in {city}
                        </Link>
                    </div>
                </div>

                {/* ── Internal Links & Interlinking ── */}
                <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 md:p-12 text-slate-900 space-y-6">
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-blue-950">
                        Explore Other Popular Destinations
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed">
                        Planning your next trip? GetHotelStays offers verified stays and hourly rooms across India's top tourist destinations. Compare prices, read reviews, and book instantly.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        {internalLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                to={link.url}
                                className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-sm"
                            >
                                {link.label}
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
