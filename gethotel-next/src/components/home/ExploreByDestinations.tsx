'use client';

import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Clock } from "lucide-react";
import Image from "@/components/common/Image";
import { useStayMode } from "@/context/StayModeContext";

const TOP_DESTINATIONS = [
    {
        name: "Delhi",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
        url: "/delhi-hotels",
    },
    {
        name: "Delhi Airport",
        image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-near-delhi-airport",
    },
    {
        name: "Connaught Place",
        image: "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-in-connaught-place-delhi",
    },
    {
        name: "Jaipur",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        url: "/jaipur-hotels",
    },
    {
        name: "Manali",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        url: "/manali-hotels",
    },
    {
        name: "Udaipur",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        url: "/udaipur-hotels",
    },
    {
        name: "Shimla",
        image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop",
        url: "/shimla-hotels",
    },
];

const DEFAULT_HOURLY_DESTINATIONS = [
    {
        name: "Delhi Airport (Aerocity)",
        image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-near-delhi-airport?stayType=hourly",
    },
    {
        name: "Connaught Place",
        image: "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-in-connaught-place-delhi?stayType=hourly",
    },
    {
        name: "Gurgaon Cyber City",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Gurgaon&stayType=hourly",
    },
    {
        name: "Mumbai Airport (T2)",
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Mumbai&stayType=hourly",
    },
    {
        name: "Bangalore Hub",
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Bangalore&stayType=hourly",
    },
    {
        name: "Jaipur City Center",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Jaipur&stayType=hourly",
    },
];

const cleanDestinationName = (name?: string) => {
    if (!name) return "";
    return name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/gu, '').trim();
};

export default function ExploreByDestinations({ 
    destinations, 
    hourlyDestinations, 
    loading = false 
}: { 
    destinations?: any[], 
    hourlyDestinations?: any[], 
    loading?: boolean 
}) {
    const { mode } = useStayMode();
    const isHourly = mode === 'hourly';

    const displayDestinations = isHourly
        ? (hourlyDestinations && hourlyDestinations.length > 0 ? hourlyDestinations : DEFAULT_HOURLY_DESTINATIONS)
        : (destinations && destinations.length > 0 ? destinations : TOP_DESTINATIONS);

    const getDestinationUrl = (dest: any, index: number) => {
        if (dest.url) {
            if (isHourly && !dest.url.includes("stayType=")) {
                return dest.url.includes("?") ? `${dest.url}&stayType=hourly` : `${dest.url}?stayType=hourly`;
            }
            return dest.url;
        }
        const n = (dest.name || '').toLowerCase().trim();
        const stayQuery = isHourly ? '?stayType=hourly' : '';
        if (["goa", "jaipur", "manali", "shimla", "udaipur", "delhi"].includes(n)) {
            return `/${n}-hotels${stayQuery}`;
        }
        const ampStayQuery = isHourly ? '&stayType=hourly' : '';
        if (dest.linkedHotelIds && dest.linkedHotelIds.length > 0) {
            return `/hotels?destination_index=${index}&city=${encodeURIComponent(dest.name || '')}${ampStayQuery}`;
        }
        return `/hotels?city=${encodeURIComponent(dest.name || '')}${stayQuery}`;
    };

    return (
        <section className="pt-1 sm:pt-3 md:pt-6 pb-12 bg-transparent overflow-hidden">
            {/* Section Header: Aligned with the standard site container */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-4 sm:mb-6 md:mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                                {isHourly ? "Hourly Stay Destinations" : "Destinations"}
                            </h2>
                            {isHourly && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <Clock className="w-3 h-3" />
                                    <span>3, 6 & 12 Hrs</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <Link
                        to={isHourly ? "/hotels?stayType=hourly" : "/hotels"}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors shrink-0"
                    >
                        <span>View all</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Destinations Cards: Full-width carousel hooked to container margin at rest, open on scroll */}
            <div 
                className="w-full flex overflow-x-auto gap-3.5 sm:gap-5 pb-4 pt-1 px-4 sm:px-6 md:px-0 no-scrollbar snap-x snap-mandatory scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Desktop Hook Spacer: Holds first card aligned with header at rest, scrolls away freely */}
                <div 
                    className="shrink-0 hidden md:block snap-start pointer-events-none"
                    style={{ width: 'calc(max(2rem, (100vw - 80rem) / 2 + 2rem) - 1.25rem)' }}
                />

                {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div 
                            key={`dest-skeleton-${idx}`} 
                            className="relative w-[220px] sm:w-[250px] md:w-[270px] shrink-0 aspect-[3/4.1] snap-start rounded-[28px] overflow-hidden bg-slate-200 border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.06)]" 
                        >
                            {/* Shimmer Wave Animation */}
                            <div className="skeleton-wave z-20" />

                            {/* Atmospheric Natural Dark Gradient Overlay matching destination cards */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 via-50% to-transparent pointer-events-none z-10" />

                            {/* Destination Info & CTA Card Container Skeleton */}
                            <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4.5 flex flex-col justify-end z-20 space-y-2">
                                {/* Destination Title Skeleton */}
                                <div className="h-5 sm:h-6 w-28 sm:w-36 bg-white/80 rounded-lg animate-pulse shadow-sm" />

                                {/* Apple Glassmorphism Explore Button Pill Skeleton */}
                                <div className="mt-2.5 sm:mt-3 w-full py-2 sm:py-2.5 px-3.5 bg-white/[0.18] backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
                                    <div className="h-3 w-20 bg-white/70 rounded-full" />
                                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/40 flex items-center justify-center border border-white/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    displayDestinations.map((dest: any, idx: number) => {
                        const name = cleanDestinationName(dest.name);

                        return (
                            <Link
                                key={dest.name || idx}
                                to={getDestinationUrl(dest, idx)}
                                className="relative w-[220px] sm:w-[250px] md:w-[270px] shrink-0 aspect-[3/4.1] snap-start rounded-[28px] overflow-hidden isolate shadow-[0_6px_24px_rgba(0,0,0,0.08)] block bg-neutral-900 border border-black/10 [transform:translateZ(0)]"
                            >
                                {/* Full Bleed Image */}
                                <Image
                                    src={dest.image}
                                    alt={name}
                                    fill
                                    className="object-cover"
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
                                    {/* Destination Title */}
                                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
                                        <span>{name}</span>
                                    </h3>

                                    {/* Ultra-Premium Apple Glassmorphism Explore Button */}
                                    <div className="mt-3 sm:mt-3.5 w-full py-2 sm:py-2.5 px-3.5 bg-white/[0.12] backdrop-blur-2xl backdrop-saturate-200 border border-white/30 rounded-xl sm:rounded-2xl flex items-center justify-between text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.25)]">
                                        <span className="drop-shadow-sm font-semibold tracking-normal">Explore Now</span>
                                        <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-sm">
                                            <ChevronRight className="w-3 h-3 text-white stroke-[2.5]" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}

                {/* Right Edge Spacer so last card has clean margin on full scroll */}
                <div 
                    className="shrink-0 hidden md:block pointer-events-none"
                    style={{ width: 'max(2rem, calc((100vw - 80rem) / 2 + 2rem))' }}
                />
            </div>
        </section>
    );
}
