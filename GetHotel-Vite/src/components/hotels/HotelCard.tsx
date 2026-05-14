
import Image from "@/components/common/Image";
import { useNavigate as useRouter, useSearchParams } from "react-router-dom";
import { MapPin, Star, Heart, ChevronLeft, ChevronRight, Check, Zap, CreditCard, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Hotel } from "@/types";
import { cn, formatPrice, safeParse } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStayMode } from "@/context/StayModeContext";

interface HotelCardProps {
    hotel: Hotel;
    className?: string;
}

export default function HotelCard({ hotel, className }: HotelCardProps) {
    const router = useRouter();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { toggle, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(hotel.id);
    const [currentImage, setCurrentImage] = useState(0);

    const { mode } = useStayMode();
    const duration = searchParams.get("duration") || "3";
    const adults = Number(searchParams.get("adults") || "2");
    const roomType = adults <= 2 ? "Double Room" : "Family Suite";

    const rooms = (hotel as any).room || [];
    let basePrice = hotel.pricePerNight;
    
    if (mode === 'hourly' && rooms.length > 0) {
        const eligibleRooms = rooms.filter((r: any) => r.isHourlyEnabled || r.is_hourly_enabled);
        const targetRooms = eligibleRooms.length > 0 ? eligibleRooms : rooms;
        const minRoom = targetRooms.reduce((prev: any, curr: any) => {
            const getPrice = (r: any) => {
                const rates = typeof r.hourlyRates === 'string' ? safeParse(r.hourlyRates, {}) : (r.hourlyRates || safeParse(r.hourly_rates, {}));
                return Number(rates[duration] || rates[String(duration)] || r.pricePerNight * 0.3);
            };
            return getPrice(prev) < getPrice(curr) ? prev : curr;
        });
        const rates = typeof minRoom.hourlyRates === 'string' ? safeParse(minRoom.hourlyRates, {}) : (minRoom.hourlyRates || safeParse(minRoom.hourly_rates, {}));
        basePrice = Number(rates[duration] || rates[String(duration)] || minRoom.pricePerNight * 0.3);
    } else if (mode === 'hourly') {
        basePrice = hotel.pricePerNight * 0.3;
    }

    const originalTotalPrice = Math.round(basePrice * 1.25);
    const payNowAmount = Math.round(basePrice * 0.18);

    const parsedImages = safeParse(hotel.images);
    const images = (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [hotel.thumbnail]).filter(img => img && typeof img === 'string' && img.trim() !== "");
    
    if (images.length === 0) images.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80");

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => router(`/hotel/${hotel.id}`)}
            className={cn(
                "group relative bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-slate-50",
                className
            )}
        >
            {/* Image Section */}
            <div className="relative aspect-[16/9] overflow-hidden m-1.5 rounded-xl">
                <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                    {images.map((img, idx) => (
                        <div key={idx} className="relative min-w-full h-full">
                            <Image src={img} alt={hotel.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />
                        </div>
                    ))}
                </div>

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    <div className="bg-brand-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-white" /> 20% OFF
                    </div>
                    {mode === 'hourly' && (
                        <div className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> HOURLY
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!user) { router("/login"); return; } toggle(hotel.id); }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg z-10 transition-transform active:scale-90"
                >
                    <Heart className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-red-500 text-red-500" : "text-slate-400")} strokeWidth={2.5} />
                </button>
            </div>

            {/* Info Section - Compact */}
            <div className="px-4 pb-4 pt-1">
                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-black text-slate-950 text-base md:text-lg tracking-tight italic truncate group-hover:text-brand-600 transition-colors">
                            {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                {hotel.city} • 2 km away
                            </span>
                        </div>
                        <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest mt-1 italic">
                            {roomType}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-300 line-through">
                            {formatPrice(originalTotalPrice)}
                        </span>
                        <div className="flex flex-col items-end mt-0.5">
                            <span className="text-[8px] font-black text-brand-500 uppercase italic">Pay 18% Now</span>
                            <p className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter leading-none italic">
                                {formatPrice(payNowAmount)}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                                Total: {formatPrice(basePrice)} {mode === 'hourly' ? `(${duration} hrs)` : '/ night'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">Wifi</span>
                        </div>
                        {mode === 'hourly' ? (
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" strokeWidth={3} />
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">Instant</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">Breakfast</span>
                            </div>
                        )}
                    </div>
                    
                    <button className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 shadow-lg">
                        Reserve
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
