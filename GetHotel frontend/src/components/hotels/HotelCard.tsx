"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Star, Heart, ChevronLeft, ChevronRight, Check, ShieldCheck, Building2, CalendarCheck, Clock, Plane } from "lucide-react";
import { motion } from "framer-motion";
import type { Hotel } from "@/types";
import { cn, formatPrice, safeParse } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

interface HotelCardProps {
    hotel: Hotel;
    className?: string;
}

export default function HotelCard({ hotel, className }: HotelCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { toggle, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(hotel.id);
    const [currentImage, setCurrentImage] = useState(0);

    const parsedImages = safeParse(hotel.images);
    const images = (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [hotel.thumbnail]).filter(img => img && typeof img === 'string' && img.trim() !== "");
    
    // Fallback if no valid images found
    if (images.length === 0) {
        images.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"); // Generic luxury hotel fallback
    }

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleCardClick = () => {
        router.push(`/hotel/${hotel.id}`);
    };

    // Premium Luxury Hooks
    const luxuryHooks = [
        { label: "Free Cancellation", icon: CalendarCheck },
        { label: "Complimentary Breakfast", icon: Check },
        { label: "No Prepayment", icon: ShieldCheck }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            onClick={handleCardClick}
            className={cn(
                "group relative flex flex-row md:flex-col h-full bg-white rounded-2xl md:rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-premium cursor-pointer transition-all duration-500",
                className
            )}
        >
            {/* Image Section */}
            <div className="relative w-[130px] sm:w-[180px] md:w-full shrink-0 aspect-[1/1] md:aspect-[16/10] overflow-hidden group/img">
                <div className="absolute inset-0 flex transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)" 
                     style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                    {images.map((img, idx) => (
                        <div key={idx} className="relative min-w-full h-full overflow-hidden">
                            <Image
                                src={img}
                                alt={`${hotel.name} - image ${idx + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                                sizes="(max-width: 640px) 50vw, 400px"
                                unoptimized
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover/img:opacity-60 transition-opacity duration-500" />

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 z-40">
                    <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-black text-white">{hotel.guestRating}</span>
                    </div>
                </div>

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <div className="absolute inset-0 hidden md:flex items-center justify-between px-3 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-30">
                        <button
                            onClick={prevImage}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20 shadow-xl"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20 shadow-xl"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Dots Indicator */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex gap-1.5 z-40">
                        {images.slice(0, 5).map((_, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    currentImage === i ? "bg-white w-4" : "bg-white/40"
                                )} 
                            />
                        ))}
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user) {
                            router.push("/login?redirect=/hotels");
                            return;
                        }
                        toggle(hotel.id);
                    }}
                    className={cn(
                        "absolute top-2 right-2 md:top-4 md:right-4 w-7 h-7 md:w-9 md:h-9 bg-white/20 backdrop-blur-xl rounded-lg md:rounded-xl flex items-center justify-center shadow-premium transition-all duration-300 hover:scale-110 z-40 border border-white/20",
                        wishlisted ? "text-red-500 bg-white" : "text-white hover:bg-white hover:text-red-500"
                    )}
                >
                    <Heart className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" fill={wishlisted ? "currentColor" : "none"} strokeWidth={2.5} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 p-3 md:p-7 min-w-0">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 bg-brand-50 text-brand-600 text-[9px] font-black uppercase tracking-widest rounded-md">Premier</span>
                        <div className="flex items-center gap-1">
                            {[...Array(hotel.starRating)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                    </div>
                    
                    <h3 className="font-black text-slate-950 text-base md:text-xl tracking-tight leading-[1.3] italic group-hover:text-brand-600 transition-colors duration-300 line-clamp-2">
                        {hotel.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hotel.city}</span>
                    </div>

                    {/* Performance Metrics Row - NEW */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-brand-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">{hotel.qualityScore || 85}% Trust Score</span>
                        </div>
                        <div className="h-3 w-px bg-slate-100" />
                        <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{hotel.responseSpeed || "Fast"}</span>
                        </div>
                    </div>

                    {/* Luxury Badges Row */}
                    <div className="flex flex-wrap gap-1.5 mt-3 md:mt-4">
                        <div className="flex items-center gap-1 px-2 py-0.5 md:py-1 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100/50">
                            <Check className="w-2 md:w-2.5 h-2 md:h-2.5" strokeWidth={3} />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Breakfast</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-brand-50 rounded-lg text-brand-600 border border-brand-100/50">
                            <ShieldCheck className="w-2.5 h-2.5" strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Luxury</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-3 md:pt-5 border-t border-slate-50 flex items-end justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[7px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">Booking Amount (18%)</p>
                        </div>
                        <p className="text-sm md:text-xl font-black text-slate-950 tracking-tighter italic leading-none truncate">
                            {formatPrice(Math.round(hotel.pricePerNight * 0.18))}
                        </p>
                        <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-1">Total: {formatPrice(hotel.pricePerNight)}</p>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Pay balance at hotel</span>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/hotel/${hotel.id}`);
                            }}
                            className="px-4 md:px-6 py-2.5 md:py-3 bg-brand-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-xl md:rounded-2xl transition-all duration-500 hover:bg-brand-700 shadow-lg shadow-brand-100 active:scale-[0.95] shrink-0"
                        >
                            Reserve
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
