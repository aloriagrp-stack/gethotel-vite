
import Image from "@/components/common/Image";
import { useNavigate as useRouter, useSearchParams } from "react-router-dom";
import { MapPin, Star, Heart, ChevronLeft, ChevronRight, Check, Zap, CreditCard, Clock, Wifi, Wind, Car, Coffee, Tv } from "lucide-react";
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
    const adults = Number(searchParams.get("adults") || searchParams.get("guests") || "2");

    const rooms = (hotel as any).room || [];
    let basePrice = hotel.pricePerNight;
    let discountPercent = 20; // Default fallback badge
    
    // Dynamic Pricing Algorithm based on search criteria
    if (rooms.length > 0) {
        // 1. Filter rooms by guest capacity (Adults)
        const eligibleByCapacity = rooms.filter((r: any) => (r.maxOccupancy || r.max_occupancy || 2) >= adults);
        
        // 2. Further filter by mode (Hourly/Nightly)
        let targetRooms = eligibleByCapacity.length > 0 ? eligibleByCapacity : rooms;
        
        const activePromos = ((hotel as any).coupon || (hotel as any).coupons || []).filter((c: any) => 
            c.isActive !== false && c.is_active !== false
        );
        
        const bestPromo = activePromos
            .sort((a: any, b: any) => Number(b.discountValue) - Number(a.discountValue))[0];
            
        const applyDiscount = (price: number, val: number, type: string) => {
            const safeVal = type === 'percentage' ? Math.min(val, 100) : val;
            const discounted = type === 'percentage' 
                ? Math.round(price * (1 - safeVal / 100)) 
                : Math.round(price - safeVal);
            return Math.max(0, discounted);
        };
        
        if (mode === 'hourly') {
            const hourlyRooms = targetRooms.filter((r: any) => r.isHourlyEnabled || r.is_hourly_enabled);
            const finalHourlyRooms = hourlyRooms.length > 0 ? hourlyRooms : targetRooms;
            
            const minRoom = finalHourlyRooms.reduce((prev: any, curr: any) => {
                const getPrice = (r: any) => {
                    const rates = typeof r.hourlyRates === 'string' ? safeParse(r.hourlyRates, {}) : (r.hourlyRates || safeParse(r.hourly_rates, {}));
                    return Number(rates[duration] || rates[String(duration)] || (r.pricePerNight || r.price_per_night || 0) * 0.3);
                };
                return getPrice(prev) < getPrice(curr) ? prev : curr;
            });
            
            const rates = typeof minRoom.hourlyRates === 'string' ? safeParse(minRoom.hourlyRates, {}) : (minRoom.hourlyRates || safeParse(minRoom.hourly_rates, {}));
            basePrice = Number(rates[duration] || rates[String(duration)] || (minRoom.pricePerNight || minRoom.price_per_night || 0) * 0.3);
        } else {
            // Nightly Mode: Find minimum price among eligible rooms by evaluating room price and variants with active coupons
            let minFinalPrice = Infinity;
            
            targetRooms.forEach((r: any) => {
                const variants = safeParse(r.variants || r.room_variants || r.roomVariants, []).map((v: any) => {
                    const nameLower = (v.mealPlan || "").toLowerCase();
                    if (nameLower.includes("room only") || nameLower === "ep" || nameLower === "ep (room only)") {
                        return { ...v, price: Number(r.pricePerNight || r.price_per_night || 0) };
                    }
                    return v;
                });
                const rawRoomPrice = Number(r.pricePerNight || r.price_per_night || 0);
                let pricesToEvaluate = [rawRoomPrice];
                
                if (variants.length > 0) {
                    variants.forEach((v: any) => {
                        if (v.price) pricesToEvaluate.push(Number(v.price));
                    });
                }
                
                pricesToEvaluate.forEach((bp) => {
                    let finalP = bp;
                    let pct = 0;
                    
                    if (bestPromo) {
                        finalP = applyDiscount(bp, Number(bestPromo.discountValue), bestPromo.discountType);
                        pct = bestPromo.discountType === 'percentage' ? Number(bestPromo.discountValue) : Math.round((Number(bestPromo.discountValue) / bp) * 100);
                    } else if (r.monthlyDiscount > 0) {
                        finalP = applyDiscount(bp, r.monthlyDiscount, 'percentage');
                        pct = r.monthlyDiscount;
                    } else if (r.weeklyDiscount > 0) {
                        finalP = applyDiscount(bp, r.weeklyDiscount, 'percentage');
                        pct = r.weeklyDiscount;
                    }
                    
                    if (finalP < minFinalPrice) {
                        minFinalPrice = finalP;
                        discountPercent = pct > 0 ? pct : 20;
                    }
                });
            });
            
            if (minFinalPrice !== Infinity) {
                basePrice = minFinalPrice;
            } else {
                const minRoom = targetRooms.reduce((prev: any, curr: any) => {
                    const pPrev = Number(prev.pricePerNight || prev.price_per_night || 0);
                    const pCurr = Number(curr.pricePerNight || curr.price_per_night || 0);
                    return pPrev < pCurr ? prev : curr;
                });
                basePrice = Number(minRoom.pricePerNight || minRoom.price_per_night || hotel.pricePerNight);
            }
        }
    }

    const payNowAmount = Math.round(basePrice * 0.12);

    const parsedImages = safeParse(hotel.images);
    const images = (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [hotel.thumbnail]).filter(img => img && typeof img === 'string' && img.trim() !== "");
    
    if (images.length === 0) images.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80");

    return (
        <div
            onClick={() => router(`/hotel/${hotel.id}`)}
            className={cn(
                "group relative bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer border border-slate-50 flex flex-col md:h-[480px] hover:shadow-xl transition-all duration-300",
                className
            )}
        >
            {/* Image Section - 60% Height on Desktop */}
            <div className="relative aspect-[16/9] md:aspect-auto md:h-[60%] overflow-hidden m-1.5 rounded-xl group/img">
                {/* Desktop View: 1 Big Left, 2 Small Right (Stacked) */}
                <div className="hidden md:grid grid-cols-5 h-full gap-1">
                    <div className="col-span-3 relative h-full overflow-hidden">
                        <Image 
                            src={images[0]} 
                            alt={hotel.name} 
                            fill 
                            className="object-cover" 
                            unoptimized 
                        />
                        <div className="absolute inset-0 bg-black/5" />
                    </div>
                    <div className="col-span-2 grid grid-rows-2 gap-1 h-full">
                        <div className="relative h-full overflow-hidden">
                            <Image 
                                src={images[1] || images[0]} 
                                alt={hotel.name} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover/img:scale-110" 
                                unoptimized 
                            />
                            <div className="absolute inset-0 bg-black/5" />
                        </div>
                        <div className="relative h-full overflow-hidden">
                            <Image 
                                src={images[2] || images[0]} 
                                alt={hotel.name} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover/img:scale-110" 
                                unoptimized 
                            />
                            <div className="absolute inset-0 bg-black/5" />
                        </div>
                    </div>
                </div>

                {/* Mobile View: Single Image Slider */}
                <div className="md:hidden relative h-full overflow-hidden">
                    <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                        {images.map((img, idx) => (
                            <div key={idx} className="relative min-w-full h-full">
                                <Image src={img} alt={hotel.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    <div className="bg-brand-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-white" /> {discountPercent}% OFF
                    </div>
                    {mode === 'hourly' && rooms.some((r: any) => r.isHourlyEnabled || r.is_hourly_enabled) && (
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

            {/* Info Section - 40% Height on Desktop */}
            <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-black text-slate-950 text-base md:text-lg tracking-tight truncate">
                                    {hotel.name}
                                </h3>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    {[...Array(Math.floor(hotel.starRating || 5))].map((_, i) => (
                                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-start gap-1 mt-1.5 min-h-[32px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed line-clamp-2">
                                    {hotel.address}, {hotel.city}
                                </p>
                            </div>
                            
                            {/* Dynamic Amenities Icons */}
                            <div className="flex items-center gap-2 mt-3 overflow-hidden">
                                {(typeof hotel.amenities === 'string' ? safeParse(hotel.amenities, []) : (hotel.amenities || [])).slice(0, 4).map((amenity: string, idx: number) => {
                                    const a = amenity.toLowerCase();
                                    if (a.includes('wifi')) return <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100" title="Free Wi-Fi"><Wifi className="w-3 h-3 text-brand-600" /></div>;
                                    if (a.includes('air') || a.includes('ac')) return <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100" title="Air Conditioning"><Wind className="w-3 h-3 text-blue-500" /></div>;
                                    if (a.includes('parking')) return <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100" title="Free Parking"><Car className="w-3 h-3 text-slate-600" /></div>;
                                    if (a.includes('breakfast')) return <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100" title="Free Breakfast"><Coffee className="w-3 h-3 text-amber-600" /></div>;
                                    if (a.includes('tv')) return <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100" title="TV"><Tv className="w-3 h-3 text-slate-600" /></div>;
                                    return null;
                                })}
                            </div>
                        </div>
                        
                        <div className="text-right">
                            {/* Cut-off price removed */}
                        </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none">Pay 12% Now</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">per night before taxes</span>
                            </div>
                            <div className="flex flex-col mt-1">
                                <span className="text-2xl font-black text-slate-950 tracking-tighter italic leading-none">{formatPrice(payNowAmount)}</span>
                                <span className="text-sm font-bold text-slate-400/80 line-through decoration-red-500 decoration-2 mt-0.5 tracking-tight">
                                    {formatPrice(basePrice)}
                                </span>
                            </div>
                        </div>
                        
                        <button className="flex items-center gap-1.5 px-8 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 shadow-lg">
                            Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
