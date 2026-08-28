'use client';

import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "@/components/common/Image";
import AppleEmoji from "@/components/common/AppleEmoji";

const DESTINATION_FLAGS: Record<string, string> = {
    "indonesia": "🇮🇩",
    "bali": "🇮🇩",
    "goa": "🌴",
    "delhi": "🇮🇳",
    "new delhi": "🇮🇳",
    "jaipur": "🏰",
    "manali": "🏔️",
    "shimla": "🌲",
    "udaipur": "🛶",
    "kerala": "⛵",
    "mumbai": "🌊",
    "dubai": "🇦🇪",
    "thailand": "🇹🇭",
    "bangkok": "🇹🇭",
    "singapore": "🇸🇬",
    "maldives": "🇲🇻",
    "paris": "🇫🇷",
    "london": "🇬🇧",
    "switzerland": "🇨🇭",
    "japan": "🇯🇵",
    "tokyo": "🇯🇵",
    "vietnam": "🇻🇳",
    "malaysia": "🇲🇾",
};

const DESTINATION_STATS: Record<string, string> = {
    "indonesia": "1,345+ Verified Stays",
    "bali": "890+ Verified Stays",
    "goa": "1,240+ Verified Stays",
    "delhi": "2,100+ Verified Stays",
    "jaipur": "540+ Verified Stays",
    "manali": "460+ Verified Stays",
    "udaipur": "380+ Verified Stays",
    "shimla": "420+ Verified Stays",
    "kerala": "850+ Verified Stays",
    "mumbai": "980+ Verified Stays",
    "dubai": "1,120+ Verified Stays",
    "thailand": "1,450+ Verified Stays",
    "singapore": "620+ Verified Stays",
    "maldives": "240+ Luxury Resorts",
};

const TOP_DESTINATIONS = [
    {
        name: "Delhi",
        flag: "🇮🇳",
        tagline: "2,100+ Verified Stays",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
        properties: "2,100+ Verified Stays",
        url: "/delhi-hotels",
    },
    {
        name: "Delhi Airport",
        flag: "✈️",
        tagline: "380+ Transit Stays",
        image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop",
        properties: "380+ Transit Stays",
        url: "/hotels-near-delhi-airport",
    },
    {
        name: "Connaught Place",
        flag: "🏛️",
        tagline: "260+ Central Stays",
        image: "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=800&auto=format&fit=crop",
        properties: "260+ Central Stays",
        url: "/hotels-in-connaught-place-delhi",
    },
    {
        name: "Jaipur",
        flag: "🏰",
        tagline: "540+ Verified Stays",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        properties: "540+ Verified Stays",
        url: "/jaipur-hotels",
    },
    {
        name: "Manali",
        flag: "🏔️",
        tagline: "460+ Verified Stays",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        properties: "460+ Verified Stays",
        url: "/manali-hotels",
    },
    {
        name: "Udaipur",
        flag: "🛶",
        tagline: "380+ Verified Stays",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        properties: "380+ Verified Stays",
        url: "/udaipur-hotels",
    },
    {
        name: "Shimla",
        flag: "🌲",
        tagline: "420+ Verified Stays",
        image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop",
        properties: "420+ Verified Stays",
        url: "/shimla-hotels",
    },
];

export default function ExploreByDestinations({ destinations, loading = false }: { destinations?: any[], loading?: boolean }) {
    const displayDestinations = destinations && destinations.length > 0 ? destinations : TOP_DESTINATIONS;

    const getDestinationUrl = (dest: any, index: number) => {
        if (dest.url) return dest.url;
        const n = (dest.name || '').toLowerCase().trim();
        if (["goa", "jaipur", "manali", "shimla", "udaipur", "delhi"].includes(n)) {
            return `/${n}-hotels`;
        }
        if (dest.linkedHotelIds && dest.linkedHotelIds.length > 0) {
            return `/hotels?destination_index=${index}&city=${encodeURIComponent(dest.name || '')}`;
        }
        return `/hotels?city=${encodeURIComponent(dest.name || '')}`;
    };

    const getDestinationFlag = (dest: any) => {
        if (dest.flag) return dest.flag;
        const n = (dest.name || '').toLowerCase().trim();
        return DESTINATION_FLAGS[n] || "";
    };

    const getDestinationStats = (dest: any) => {
        let text = dest.properties || dest.tagline || "";
        if (text) {
            text = text.split("•")[0].replace(/,\s*\d+\s*packages/gi, "").trim();
            if (text && !text.toLowerCase().includes("package")) {
                return text;
            }
        }
        const n = (dest.name || '').toLowerCase().trim();
        const defaultStat = DESTINATION_STATS[n];
        if (defaultStat) {
            return defaultStat;
        }
        if (dest.linkedHotelIds?.length) {
            return `${dest.linkedHotelIds.length}+ Verified Stays`;
        }
        return "1,200+ Verified Stays";
    };

    return (
        <section className="pt-1 sm:pt-3 md:pt-6 pb-12 bg-transparent overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                {/* Section Header (Buttons next to Destinations removed) */}
                <div className="flex items-end justify-between mb-4 sm:mb-6 md:mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                            Destinations
                        </h2>
                    </div>

                    <Link
                        to="/hotels"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors shrink-0"
                    >
                        <span>View all</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Destinations Cards: Horizontally scrollable with clean initial left margin on mobile, responsive grid on desktop */}
                <div 
                    className="flex overflow-x-auto gap-3.5 sm:gap-5 pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 snap-x snap-mandatory scroll-smooth scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-0"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div 
                                key={`dest-skeleton-${idx}`} 
                                className="w-[220px] sm:w-[250px] md:w-full shrink-0 md:shrink aspect-[3/4.1] bg-slate-200 animate-pulse rounded-[28px] border border-slate-100 shadow-sm snap-start" 
                            />
                        ))
                    ) : (
                        displayDestinations.map((dest: any, idx: number) => {
                            const flag = getDestinationFlag(dest);
                            const statsText = getDestinationStats(dest);

                            return (
                                <Link
                                    key={dest.name || idx}
                                    to={getDestinationUrl(dest, idx)}
                                    className="group relative w-[220px] sm:w-[250px] md:w-full shrink-0 md:shrink aspect-[3/4.1] snap-start rounded-[28px] overflow-hidden isolate shadow-[0_6px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.2)] transition-all duration-500 transform hover:-translate-y-1.5 block bg-neutral-900 border border-black/10 [transform:translateZ(0)]"
                                >
                                    {/* Full Bleed Image with smooth scaling */}
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        className="transition-transform duration-700 group-hover:scale-105 object-cover"
                                    />

                                    {/* Hazy Bottom Frosted Glass Blur */}
                                    <div 
                                        className="absolute inset-x-0 bottom-0 h-[52%] backdrop-blur-md pointer-events-none"
                                        style={{
                                            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)',
                                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)'
                                        }}
                                    />

                                    {/* Atmospheric Natural Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-50% to-transparent pointer-events-none" />

                                    {/* Destination Info & CTA Card Container */}
                                    <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4.5 text-white flex flex-col justify-end z-10">
                                        {/* Destination Title + Apple Emoji Flag */}
                                        <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md flex items-center gap-1.5">
                                            <span>{dest.name}</span>
                                            {flag && (
                                                <AppleEmoji 
                                                    emoji={flag} 
                                                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 drop-shadow" 
                                                    alt={dest.name}
                                                />
                                            )}
                                        </h3>
                                        
                                        {/* Subtitle Stats Line */}
                                        <p className="text-[11px] sm:text-xs text-white/80 font-medium mt-0.5 tracking-wide line-clamp-1 drop-shadow-sm">
                                            {statsText}
                                        </p>

                                        {/* Ultra-Premium Apple Glassmorphism Explore Button */}
                                        <div className="mt-3 sm:mt-3.5 w-full py-2 sm:py-2.5 px-3.5 bg-white/[0.12] hover:bg-white/[0.22] active:scale-[0.98] backdrop-blur-2xl backdrop-saturate-200 border border-white/30 hover:border-white/50 rounded-xl sm:rounded-2xl flex items-center justify-between text-white text-[11px] sm:text-xs font-bold tracking-wide transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.25)] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_12px_24px_rgba(0,0,0,0.35)]">
                                            <span className="drop-shadow-sm font-semibold tracking-normal">Explore Now</span>
                                            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-white/30 transition-all duration-300 shadow-sm">
                                                <ChevronRight className="w-3 h-3 text-white stroke-[2.5]" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
