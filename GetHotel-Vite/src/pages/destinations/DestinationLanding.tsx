import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, HelpCircle, AlertCircle } from "lucide-react";
import { hotelApi } from "@/lib/api";
import { Hotel as HotelType } from "@/types";
import HotelCard from "@/components/hotels/HotelCard";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import SEOHead from "@/components/common/SEOHead";
import { SITE, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";

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
    internalLinks
}: DestinationLandingProps) {
    const [hotels, setHotels] = useState<HotelType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const response = await hotelApi.getHotels();
                const all = response.data || [];
                // Filter hotels for this city case-insensitively
                const filtered = all.filter((h: any) => 
                    h.city?.toLowerCase().trim() === city.toLowerCase().trim()
                );
                setHotels(filtered);
            } catch (err) {
                console.error(`Failed to fetch hotels for ${city}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [city]);

    return (
        <div className="min-h-screen pt-3 pb-8 md:pt-6 md:pb-12 bg-transparent px-0">
            <SEOHead
                title={title}
                description={description}
                keywords={keywords}
                ogUrl={`${SITE.url}/${city.toLowerCase()}-hotels`}
                canonicalUrl={`${SITE.url}/${city.toLowerCase()}-hotels`}
                schemas={[
                    buildFAQSchema(faqs),
                    buildBreadcrumbSchema([
                        { name: "Home", url: "/" },
                        { name: "Hotels", url: "/hotels" },
                        { name: `${city} Hotels`, url: `/${city.toLowerCase()}-hotels` }
                    ])
                ]}
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
