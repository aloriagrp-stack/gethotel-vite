

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, ArrowRight, Heart, MapPin, Wifi, Waves, Coffee, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, safeParse } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useStayMode } from "@/context/StayModeContext";

interface Hotel {
    id: string | number;
    name: string;
    city: string;
    address?: string;
    country?: string;
    starRating: number;
    pricePerNight: number;
    originalPrice?: number;
    thumbnail: string;
    room?: any[];
}

function TrendingHotelCard({ hotel }: { hotel: Hotel }) {
    const { mode } = useStayMode();
    const { toggle, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(hotel.id.toString());
    const [coupons, setCoupons] = useState<any[]>([]);

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                // Dynamically fetch actual deals applied from backend
                const { couponApi } = await import('@/lib/api');
                const res = await couponApi.getCoupons(Number(hotel.id));
                const rawData = res.data?.coupons || res.data || res;
                const couponList = Array.isArray(rawData) ? rawData : [];
                setCoupons(couponList.filter((c: any) => c.isActive !== false && c.is_active !== false));
            } catch (err) {
                // Ignore errors to not break card UI
            }
        };
        fetchDeal();
    }, [hotel.id]);

    const rooms = hotel.room || [];
    let basePrice = 0; // The true lowest price set by admin
    const duration = "3"; // Default duration for home page cards
    let priceLabel = mode === 'hourly' ? `/ ${duration} hours` : "/ night";

    if (rooms.length > 0) {
        // Filter rooms that support hourly stay if in hourly mode
        const eligibleRooms = mode === 'hourly' 
            ? rooms.filter(r => r.isHourlyEnabled || r.is_hourly_enabled)
            : rooms;

        const targetRooms = eligibleRooms.length > 0 ? eligibleRooms : rooms;

        const minRoom = targetRooms.reduce((prev, curr) => {
            const getPrice = (r: any) => {
                if (mode !== 'hourly') return r.pricePerNight;
                const rates = typeof r.hourlyRates === 'string' ? safeParse(r.hourlyRates, {}) : (r.hourlyRates || safeParse(r.hourly_rates, {}));
                return Number(rates[duration] || rates[String(duration)] || r.pricePerNight * 0.3);
            };
            return getPrice(prev) < getPrice(curr) ? prev : curr;
        });

        const rates = typeof minRoom.hourlyRates === 'string' ? safeParse(minRoom.hourlyRates, {}) : (minRoom.hourlyRates || safeParse(minRoom.hourly_rates, {}));
        basePrice = mode === 'hourly' ? Number(rates[duration] || rates[String(duration)] || minRoom.pricePerNight * 0.3) : minRoom.pricePerNight;
    } else {
        basePrice = mode === 'hourly' ? (hotel.pricePerNight * 0.3) : hotel.pricePerNight;
    }

    // Determine max percentage discount from active coupons
    let maxDiscountPercent = 0;
    coupons.forEach(c => {
        if (c.discountType === 'percentage' || c.discount_type === 'percentage') {
            const val = Number(c.discountValue || c.discount_value);
            if (val > maxDiscountPercent) maxDiscountPercent = val;
        }
    });

    // If no dynamic coupon, fallback to no discount (or you can set a default like 5 if basic deal is guaranteed)
    // The user requested NO hardcoding, so it purely relies on fetched coupons.
    const displayOriginalPrice = basePrice;
    const displayPrice = maxDiscountPercent > 0 
        ? Math.round(basePrice * (1 - maxDiscountPercent / 100)) 
        : basePrice;

    return (
        <motion.div
            layout
            whileHover={{ y: -8 }}
            className="group relative w-full h-full rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-slate-100"
        >
            <Link to={`/hotel/${hotel.id}?stayType=${mode}`} className="absolute inset-0 z-10" />
            
            {/* 📸 FULL BACKGROUND IMAGE */}
            <img
                src={hotel.thumbnail}
                alt={hotel.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {mode === 'hourly' && (
                    <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        HOURLY STAY
                    </div>
                )}
            </div>

            {/* Wishlist Button */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(hotel.id.toString()); }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white/20 active:scale-90 z-20 border border-white/20"
            >
                <Heart className={cn("w-4 h-4 transition-all duration-300", wishlisted ? "fill-red-500 text-red-500 scale-110" : "text-white")} />
            </button>

            {/* Content Overlaid at Bottom */}
            <div className="absolute bottom-5 left-5 right-5 z-20 space-y-3">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-white leading-tight line-clamp-1 italic tracking-tight">
                        {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span className="truncate">{hotel.city}</span>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2 border-t border-white/10 pt-3">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-bold text-white/50 line-through leading-none mb-1">
                            ₹{displayOriginalPrice.toLocaleString()}
                        </p>
                        <p className="text-xl font-black text-white leading-none tracking-tighter italic">
                            ₹{displayPrice.toLocaleString()}
                            <span className="text-[9px] text-white/40 not-italic ml-1">{priceLabel}</span>
                        </p>
                    </div>
                    
                    <button className={cn(
                        "px-4 py-2 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95",
                        mode === 'hourly' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-slate-950 hover:bg-black"
                    )}>
                        Book
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default function TrendingHotels({ hotels }: { hotels: Hotel[] }) {
    const displayHotels = hotels || [];

    return (
        <section className="pt-0 pb-12 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-950 tracking-tight">
                            Trending <span className="text-blue-600">Hotels</span>
                        </h2>
                    </div>
                    <Link
                        to="/hotels"
                        className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all group shrink-0 italic"
                    >
                        View all properties
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="flex gap-6 pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6">
                    {displayHotels.length > 0 ? displayHotels.map((hotel) => (
                        <div key={hotel.id} className="w-[240px] md:w-[300px] aspect-[4/5] shrink-0 snap-start">
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



