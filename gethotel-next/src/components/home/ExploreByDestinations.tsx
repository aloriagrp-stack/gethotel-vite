'use client';

import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import Image from "@/components/common/Image";

const TOP_DESTINATIONS = [
    {
        name: "Goa",
        tagline: "Beach Resorts & Nightlife",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
        properties: "1,240+ Verified Stays",
        url: "/goa-hotels",
    },
    {
        name: "Delhi",
        tagline: "Heritage, Metro & Aerocity",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
        properties: "2,100+ Verified Stays",
        url: "/delhi-hotels",
    },
    {
        name: "Jaipur",
        tagline: "Palaces & Pink City Royalty",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        properties: "540+ Verified Stays",
        url: "/jaipur-hotels",
    },
    {
        name: "Manali",
        tagline: "Snow Valleys & Mountain Views",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        properties: "460+ Verified Stays",
        url: "/manali-hotels",
    },
    {
        name: "Udaipur",
        tagline: "City of Lakes & Romance",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        properties: "380+ Verified Stays",
        url: "/udaipur-hotels",
    },
    {
        name: "Shimla",
        tagline: "Queen of Hills & Mall Road",
        image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop",
        properties: "420+ Verified Stays",
        url: "/shimla-hotels",
    },
    {
        name: "Kerala",
        tagline: "Backwaters & Tea Gardens",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
        properties: "850+ Verified Stays",
        url: "/hotels?city=Kerala",
    },
    {
        name: "Mumbai",
        tagline: "Marine Drive & Luxury City Life",
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop",
        properties: "980+ Verified Stays",
        url: "/hotels?city=Mumbai",
    },
];

export default function ExploreByDestinations({ destinations, loading = false }: { destinations?: any[], loading?: boolean }) {
    const displayDestinations = destinations && destinations.length > 0 ? destinations : TOP_DESTINATIONS;

    return (
        <section className="pt-6 pb-12 bg-transparent overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-brand-600" />
                            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">Top Destinations</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                            Explore Popular <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Destinations</span>
                        </h2>
                    </div>
                    <Link
                        to="/hotels"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors"
                    >
                        <span>View all destinations</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Destinations Cards Grid / Slider */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={`dest-skeleton-${idx}`} className="w-full aspect-[3/4] bg-slate-200 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
                        ))
                    ) : (
                        displayDestinations.slice(0, 8).map((dest: any) => (
                            <Link
                                key={dest.name}
                                to={dest.url || `/hotels?city=${encodeURIComponent(dest.name)}`}
                                className="group relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 block"
                            >
                                <Image
                                    src={dest.image}
                                    alt={dest.name}
                                    fill
                                    className="transition-transform duration-700 group-hover:scale-110 object-cover"
                                />
                                {/* Modern gradient overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                                <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/15 transition-colors duration-500" />

                                {/* Destination Info Card */}
                                <div className="absolute bottom-5 left-5 right-5 text-white">
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-brand-300 mb-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{dest.properties}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-sm">
                                        {dest.name}
                                    </h3>
                                    {dest.tagline && (
                                        <p className="text-[11px] font-medium text-slate-200 mt-0.5 line-clamp-1 opacity-90">
                                            {dest.tagline}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
