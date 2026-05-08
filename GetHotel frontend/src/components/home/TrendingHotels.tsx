"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Star, ArrowRight, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

interface Hotel {
    id: string | number;
    name: string;
    city: string;
    country?: string;
    starRating: number;
    pricePerNight: number;
    thumbnail: string;
}

function TrendingHotelCard({ hotel }: { hotel: Hotel }) {
    const { toggle, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(hotel.id.toString());

    return (
        <Link href={`/hotel/${hotel.id}`} className="block h-full">
            <motion.div
                whileHover={{ y: -8 }}
                className="flex flex-col flex-1 h-full bg-white/70 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/40 group cursor-pointer"
            >
                {/* Top Image Section */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Floating Heart Icon */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggle(hotel.id.toString());
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group/heart"
                    >
                        <Heart
                            className={cn(
                                "w-5 h-5 transition-colors",
                                wishlisted ? "fill-red-500 text-red-500" : "text-slate-400 group-hover/heart:text-red-400"
                            )}
                        />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 gap-2.5">
                    {/* Meta Row: Label + Rating */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Hotel</span>
                        <div className="flex items-center">
                            {[...Array(Math.floor(hotel.starRating))].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                    </div>

                    {/* Title & Location */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 leading-[1.3] line-clamp-2">
                            {hotel.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                            {hotel.city}
                        </p>
                    </div>

                    {/* Price & Reserve Row: Pushed to the bottom */}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">Price</span>
                            <p className="text-xl font-black text-slate-950 leading-none tracking-tight">
                                ₹{hotel.pricePerNight.toLocaleString()}
                            </p>
                        </div>
                        <div className="px-5 py-2.5 bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-brand-100 group-hover:bg-brand-700 transition-all">
                            Reserve
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function TrendingHotels({ hotels }: { hotels: Hotel[] }) {
    const displayHotels = hotels || [];

    return (
        <section className="pt-0 pb-6 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-950 tracking-tight">
                            Trending <span className="text-brand-600">Hotels</span>
                        </h2>
                    </div>
                    <Link
                        href="/hotels"
                        className="flex items-center gap-2 text-brand-600 font-bold hover:gap-3 transition-all group shrink-0"
                    >
                        View all properties
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="flex gap-6 pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                    {displayHotels.length > 0 ? displayHotels.map((hotel) => (
                        <div key={hotel.id} className="min-w-[280px] md:min-w-[340px] max-w-[340px] snap-start">
                            <TrendingHotelCard hotel={hotel} />
                        </div>
                    )) : (
                        <div className="text-slate-400 font-bold italic py-10">Searching for trending experiences...</div>
                    )}
                </div>
            </div>
        </section>
    );
}
