'use client';

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search, Phone, Mail, ExternalLink, MapPin, Star,
    Building, ArrowRight, Check, Sparkles, SlidersHorizontal
} from "lucide-react";
import Image from "@/components/common/Image";
import { useAuth } from "@/context/AuthContext";

const slugify = (text: string) => {
    return (text || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

const safeParse = (val: any, fallback: any = []) => {
    if (!val) return fallback;
    if (typeof val !== "string") return Array.isArray(val) ? val : fallback;
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (_) {
        return fallback;
    }
};

export default function HotelsDirectory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchDirectoryHotels = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/hotels?listingType=directory");
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setHotels(data.data);
                } else if (Array.isArray(data)) {
                    setHotels(data);
                }
            } catch (err) {
                console.error("Failed to load directory hotels", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirectoryHotels();
    }, []);

    // Filter hotels by search query
    const filteredHotels = hotels.filter((h) => {
        const q = searchQuery.toLowerCase().trim();
        return !q || (
            (h.name || "").toLowerCase().includes(q) ||
            (h.city || "").toLowerCase().includes(q) ||
            (h.address || "").toLowerCase().includes(q) ||
            (h.contactPhone || "").includes(q)
        );
    });

    const handleCallClick = (hotelId: number) => {
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(`/api/hotels/${hotelId}/lead`, JSON.stringify({ action: "call" }));
            } else {
                fetch(`/api/hotels/${hotelId}/lead`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "call" }),
                    keepalive: true
                }).catch(() => {});
            }
        } catch (_) {}
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20">
            {/* Hero Header */}
            <div className="pt-10 pb-6 md:pt-14 md:pb-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Hotel Directory & Direct Desk
                    </h1>

                    {/* Search Bar */}
                    <div className="pt-2 max-w-2xl mx-auto">
                        <div className="relative flex items-center shadow-xs">
                            <Search className="w-5 h-5 absolute left-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search hotel name, locality, address, or city..."
                                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hotel Cards Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
                <div className="flex items-center justify-between pb-6">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Showing <strong className="text-slate-900">{filteredHotels.length}</strong> Listed Hotels
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse space-y-4">
                                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                <div className="h-8 bg-slate-200 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
                        <Building className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">No directory hotels found</h3>
                        <p className="text-xs text-slate-500">
                            We couldn't find any directory hotels matching your search. Try changing your search query or city filter.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHotels.map((hotel) => {
                            const citySlug = slugify(hotel.city || 'india');
                            const hotelSlug = slugify(hotel.name || `hotel-${hotel.id}`);
                            const detailUrl = `/hotels-directory/${citySlug}/${hotelSlug}`;
                            const allAmenities = safeParse(hotel.amenities, ["WiFi", "AC"]);

                            return (
                                <div
                                    key={hotel.id}
                                    onClick={() => navigate(detailUrl)}
                                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all flex flex-col group cursor-pointer"
                                >
                                    {/* Cover Image */}
                                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={hotel.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-b from-white/85 via-white/50 to-white/25 backdrop-blur-xl backdrop-saturate-[190%] border border-white/70 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.12)] text-slate-900 text-[11px] font-extrabold tracking-tight">
                                            <MapPin className="w-3.5 h-3.5 text-blue-600 drop-shadow-xs" />
                                            <span>{hotel.city || "India"}</span>
                                        </div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {hotel.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {hotel.address || "Contact reception directly for directions and check-in assistance."}
                                            </p>

                                            {/* Amenities Tags - Strictly 1 Line */}
                                            {allAmenities.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden pt-1">
                                                    {allAmenities.slice(0, 2).map((am: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[130px] shrink-0"
                                                        >
                                                            {am}
                                                        </span>
                                                    ))}
                                                    {allAmenities.length > 2 && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                                            ...
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action Section */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                            {/* Starting Room Rate */}
                                            {(hotel.bookingPrice || hotel.mmtPrice) ? (
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-medium block">Starting Room Rate:</span>
                                                    <span className="font-extrabold text-slate-900 text-sm">
                                                        ₹{Number(hotel.bookingPrice || hotel.mmtPrice).toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/night</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">Direct Listing</span>
                                            )}

                                            {/* View Button */}
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 group-hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs group-hover:shadow active:scale-95 shrink-0">
                                                <span>View</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

