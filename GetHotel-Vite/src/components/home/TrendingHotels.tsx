
import { useState, useEffect } from "react";
import { Star, ArrowRight, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, safeParse, getHotelUrl } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useStayMode } from "@/context/StayModeContext";
import Image from "@/components/common/Image";


interface Hotel {
    id: string | number;
    name: string;
    city: string;
    address?: string;
    starRating: number;
    pricePerNight: number;
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
                const { couponApi } = await import('@/lib/api');
                const res = await couponApi.getCoupons(Number(hotel.id));
                const rawData = res.data?.coupons || res.data || res;
                const couponList = Array.isArray(rawData) ? rawData : [];

                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                setCoupons(couponList.filter((c: any) => {
                    const isActive = c.isActive !== false && c.is_active !== false;
                    if (!isActive) return false;

                    const startStr = typeof c.startDate === 'string' ? c.startDate.split('T')[0] : '';
                    const endStr = typeof c.endDate === 'string' ? c.endDate.split('T')[0] : '';
                    if (startStr && endStr && (todayStr < startStr || todayStr > endStr)) return false;

                    return true;
                }));
            } catch (_) { }
        };
        fetchDeal();
    }, [hotel.id]);

    const rooms = hotel.room || [];
    const isHourly = mode === 'hourly';
    let basePrice = 0;
    const duration = "3";
    const priceLabel = isHourly ? `/ ${duration} hours` : "/ night";

    if (rooms.length > 0) {
        const eligibleRooms = isHourly
            ? rooms.filter(r => r.isHourlyEnabled || r.is_hourly_enabled)
            : rooms.filter(r => !r.isHourlyEnabled && !r.is_hourly_enabled);
        const targetRooms = eligibleRooms.length > 0 ? eligibleRooms : rooms;
        const minRoom = targetRooms.reduce((prev, curr) => {
            const getPrice = (r: any) => {
                if (!isHourly) return r.pricePerNight;
                const rates = typeof r.hourlyRates === 'string' ? safeParse(r.hourlyRates, {}) : (r.hourlyRates || safeParse(r.hourly_rates, {}));
                return Number(rates[duration] || rates[String(duration)] || r.pricePerNight * 0.3);
            };
            return getPrice(prev) < getPrice(curr) ? prev : curr;
        });
        const rates = typeof minRoom.hourlyRates === 'string' ? safeParse(minRoom.hourlyRates, {}) : (minRoom.hourlyRates || safeParse(minRoom.hourly_rates, {}));
        basePrice = isHourly ? Number(rates[duration] || rates[String(duration)] || minRoom.pricePerNight * 0.3) : minRoom.pricePerNight;
    } else {
        basePrice = isHourly ? hotel.pricePerNight * 0.3 : hotel.pricePerNight;
    }

    let maxDiscountPercent = 0;
    coupons.forEach(c => {
        if (c.discountType === 'percentage' || c.discount_type === 'percentage') {
            const val = Number(c.discountValue || c.discount_value);
            if (val > maxDiscountPercent) maxDiscountPercent = val;
        }
    });

    const displayOriginalPrice = basePrice;
    const displayPrice = maxDiscountPercent > 0
        ? Math.round(basePrice * (1 - maxDiscountPercent / 100))
        : basePrice;

    return (
        <div className="group relative w-full h-full rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-slate-100">
            <Link to={`${getHotelUrl(hotel.id, hotel.name)}?stayType=${isHourly ? 'hourly' : 'nightly'}`} className="absolute inset-0 z-10" />

            {/* Background Image */}
            <Image
                src={hotel.thumbnail}
                alt={hotel.name}
                fill
                className="transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {isHourly && (
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

            {/* Content */}
            <div className="absolute bottom-5 left-5 right-5 z-20 space-y-3">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 tracking-tight">
                        {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span className="truncate">{hotel.city}</span>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2 border-t border-white/10 pt-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {maxDiscountPercent > 0 && (
                                <span className="text-[9px] font-bold text-white/40 line-through decoration-red-500 decoration-1">
                                    ₹{displayOriginalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-xl font-black text-white leading-none tracking-tight">
                                ₹{displayPrice.toLocaleString()}
                                <span className="text-[9px] text-white/40 ml-1 font-medium">{priceLabel}</span>
                            </p>
                            {maxDiscountPercent > 0 && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-bold text-emerald-400 uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    {maxDiscountPercent}% OFF PROMO
                                </div>
                            )}
                        </div>
                    </div>

                    <Link
                        to={`${getHotelUrl(hotel.id, hotel.name)}?stayType=${isHourly ? 'hourly' : 'nightly'}`}
                        className={cn(
                            "px-4 py-2.5 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all active:scale-95 shrink-0 text-center flex items-center justify-center",
                            isHourly ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-white text-slate-950 hover:bg-slate-100"
                        )}
                    >
                        Book
                    </Link>
                </div>
            </div>
        </div>
    );
}

function TrendingHotelSkeleton() {
    return (
        <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-200 animate-pulse relative p-5 flex flex-col justify-end gap-3 border border-slate-100/50 shadow-sm aspect-[4/5] shrink-0">
            <div className="absolute top-4 right-4 w-9 h-9 bg-slate-300 rounded-full" />
            <div className="space-y-2.5">
                <div className="h-5 bg-slate-300 rounded-lg w-4/5" />
                <div className="h-3 bg-slate-300 rounded-lg w-1/2" />
            </div>
            <div className="flex items-center justify-between border-t border-slate-300/40 pt-3 mt-1">
                <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-300 rounded-md w-12" />
                    <div className="h-5 bg-slate-300 rounded-md w-20" />
                </div>
                <div className="h-8 bg-slate-300 rounded-full w-16" />
            </div>
        </div>
    );
}

interface TrendingHotelsProps {
    hotels: Hotel[];
    loading?: boolean;
}

export default function TrendingHotels({
    hotels,
    loading = false
}: TrendingHotelsProps) {
    const { mode } = useStayMode();
    const displayHotels = (hotels || []).filter(hotel => {
        const rooms = hotel.room || [];
        if (mode === 'hourly') {
            return rooms.some((r: any) => r.isHourlyEnabled || r.is_hourly_enabled);
        } else {
            return rooms.length === 0 || rooms.some((r: any) => !r.isHourlyEnabled && !r.is_hourly_enabled);
        }
    });

    return (
        <section className="pt-0 pb-12 bg-transparent overflow-hidden">
            <div className="w-full max-w-none mx-auto px-3 md:px-8">

                {/* ── Header Row ── */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <div className="flex flex-col gap-2">

                        {/* Title */}
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-950 tracking-tight leading-none">
                                Trending <span className="text-blue-600">Hotels</span>
                            </h2>
                        </div>
                    </div>

                    <Link
                        to="/hotels"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-250 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-500 hover:shadow-sm transition-all duration-200 shrink-0"
                        title="View all properties"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* ── Cards Carousel ── */}
                <div
                    className="flex gap-4 pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-3 md:-mx-8 px-3 md:px-8 transition-opacity duration-300"
                >
                    <div className="w-1 shrink-0 snap-start md:hidden" />
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={`skeleton-${idx}`} className="w-[240px] md:w-[300px] aspect-[4/5] shrink-0 snap-start">
                                <TrendingHotelSkeleton />
                            </div>
                        ))
                    ) : displayHotels.length > 0 ? (
                        displayHotels.map(hotel => (
                            <div key={hotel.id} className="w-[240px] md:w-[300px] aspect-[4/5] shrink-0 snap-start">
                                <TrendingHotelCard hotel={hotel} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full py-16 flex flex-col items-center gap-3 text-center">
                            <MapPin className="w-8 h-8 text-slate-300" />
                            <p className="text-slate-400 font-bold">No properties found.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
