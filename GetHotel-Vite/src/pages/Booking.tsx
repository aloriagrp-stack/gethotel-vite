import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "@/components/common/Image";
import { Link } from "react-router-dom";
import {
    Shield,
    Check,
    CreditCard,
    ChevronRight,
    Calendar,
    Users,
    MapPin,
    Loader2,
    X,
    Zap,
    Star,
    Info,
    AlertCircle,
    ArrowLeft,
    Phone,
    Mail,
    Globe,
    Wifi,
    Maximize2
} from "lucide-react";
import { hotelApi, couponApi, bookingApi } from "@/lib/api";
import { formatPrice, formatDate, safeParse } from "@/lib/utils";

const guestSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(10, "Valid phone number required"),
    country: z.string().min(2, "Country is required"),
    specialRequests: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

const COUNTRY_LIST = [
    "India", "United States", "United Kingdom", "Australia", "Canada",
    "Germany", "France", "UAE", "Singapore", "Japan",
];

const getImages = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            if (data.includes(',')) return data.split(',').map(s => s.trim());
            return [data.trim()];
        }
    }
    return [];
};

function BookingContent() {
    const [searchParams] = useSearchParams();
    const router = useNavigate();

    // Read all params
    const hotelId = searchParams.get("hotelId") || searchParams.get("id") || "";
    const roomId = searchParams.get("roomId") || searchParams.get("room") || null;
    const variantParam = searchParams.get("variant") || null;
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const stayType = searchParams.get("stayType") || "nightly";
    const duration = searchParams.get("duration") || "3";
    const guestsParam = parseInt(searchParams.get("adults") || searchParams.get("guests") || "2", 10);
    const isHourly = stayType === 'hourly';

    const [hotel, setHotel] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [booked, setBooked] = useState(false);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        const found = coupons.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
        if (found) {
            setAppliedCoupon(found);
            setCouponError("");
            setCouponCode("");
        } else {
            setCouponError("Invalid or expired coupon code.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!hotelId) {
                router("/");
                return;
            }
            try {
                setLoadingData(true);
                const hotelRes = await hotelApi.getHotel(hotelId);
                const hotelData = hotelRes.data;
                setHotel(hotelData);

                let targetRoomId = roomId;
                let targetVariantIndex = variantParam;

                // Parse room_ID_INDEX format if direct roomId is missing
                if (!targetRoomId) {
                    let roomKey: string | null = null;
                    searchParams.forEach((_, key) => {
                        if (key.startsWith('room_')) {
                            roomKey = key;
                        }
                    });

                    if (roomKey) {
                        const parts = (roomKey as string).split('_');
                        targetRoomId = parts[1];
                        targetVariantIndex = parts[2] || "0";
                    }
                }

                if (targetRoomId) {
                    const params: any = {};
                    if (checkIn) params.checkIn = checkIn;
                    if (checkOut) params.checkOut = checkOut;
                    const roomsRes = await hotelApi.getRooms(hotelId, params);
                    const foundRoom = (roomsRes.data || []).find((r: any) => String(r.id) === String(targetRoomId));
                    
                    if (foundRoom) {
                        const variants = safeParse(foundRoom.variants || foundRoom.room_variants, []);
                        const vIndex = parseInt(targetVariantIndex || "0");
                        if (variants && variants[vIndex]) {
                            foundRoom.selectedVariant = variants[vIndex];
                        }
                        foundRoom.roomPolicies = safeParse(foundRoom.roomPolicies || foundRoom.room_policies || foundRoom.policies, {});
                        setSelectedRoom(foundRoom);
                    }
                }

                // Auto-apply Best Coupon
                const couponRes = await couponApi.getCoupons(parseInt(hotelId) || 0);
                if (couponRes && Array.isArray(couponRes.data)) {
                    const activeCoupons = couponRes.data.filter((c: any) => c.isActive);
                    setCoupons(activeCoupons);
                    const welcome = activeCoupons.find((c: any) => c.code.toUpperCase() === "WELCOME");
                    if (welcome) {
                        setAppliedCoupon(welcome);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch booking data:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [hotelId, roomId, searchParams, router]);

    const nights = isHourly ? 1 : (() => {
        if (!checkIn || !checkOut || checkIn === "Dates") return 1;
        try {
            const d1 = new Date(checkIn);
            const d2 = new Date(checkOut);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
            const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
            return Math.max(1, Math.floor(diff));
        } catch (e) { return 1; }
    })();

    const pricePerNight = isHourly 
        ? (safeParse(selectedRoom?.hourlyRates || selectedRoom?.hourly_rates, {})[duration] || (selectedRoom?.pricePerNight ? selectedRoom.pricePerNight / 2 : (hotel?.pricePerNight ? hotel.pricePerNight / 2 : 0)))
        : (() => {
            const basePrice = selectedRoom?.selectedVariant?.price ? parseFloat(selectedRoom.selectedVariant.price) : (selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0);
            const priceDiff = selectedRoom?.dynamicPricePerNight ? (selectedRoom.dynamicPricePerNight - selectedRoom.pricePerNight) : 0;
            return basePrice + priceDiff;
        })();
    
    const mealPlanLabel = isHourly 
        ? `${duration} Hours Stay`
        : selectedRoom?.selectedVariant 
            ? (selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('breakfast') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('cp') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('map') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('ap') 
                ? "With Breakfast" 
                : "Without Breakfast")
            : "Room Only";

    const calculatePrice = () => {
        const baseSubtotal = (pricePerNight || 0) * nights;
        
        let discount = 0;
        if (appliedCoupon) {
            discount = Math.round(baseSubtotal * (appliedCoupon.discountValue / 100));
        }
        
        const discountedSubtotal = Math.max(0, baseSubtotal - discount);
        const taxes = Math.round(discountedSubtotal * 0.05);
        const total = discountedSubtotal + taxes;
        const payNow = Math.round(total * 0.18);
        const payAtHotel = total - payNow;

        return { baseSubtotal, discount, discountedSubtotal, taxes, total, payNow, payAtHotel };
    };

    const priceDetails = calculatePrice();

    const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
        defaultValues: { country: "India" },
    });

    const onSubmit = async (data: GuestFormData) => {
        setIsSubmitting(true);
        try {
            const bookingData = {
                hotelId: parseInt(hotelId),
                rooms: [{ id: String(selectedRoom?.id), quantity: 1, variantIdx: variantParam || "0" }],
                checkIn,
                checkOut,
                totalGuests: guestsParam,
                status: 'confirmed',
                paymentStatus: 'paid',
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                amountPaid: priceDetails.payNow, // Frontend still sends it for reference
                guestInfo: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    country: data.country,
                    specialRequests: data.specialRequests || "",
                    isBusinessTrip: false
                }
            };

            const res = await bookingApi.createBooking(bookingData);
            const booking = res.data || res;
            if (booking && booking.id) {
                // Redirect to the booking ID page (which shows the premium invoice)
                router(`/booking/details/${booking.id}?success=true`);
            } else {
                alert("Failed to create booking. Please try again.");
            }
        } catch (err: any) {
            console.error("Booking Error:", err);
            alert(err.message || "Failed to create booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData) return (
        <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (booked) return (
        <div className="min-h-screen pt-20 bg-slate-50 text-center p-6">
            <div className="max-w-md">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">Booking Confirmed!</h1>
                <p className="text-slate-500 mb-8">Your stay at <strong>{hotel?.name}</strong> is all set.</p>
                <Link to="/hotels" className="inline-block px-10 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Back to Hotels</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-6 sm:pt-10 pb-16 sm:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] sm:text-[10px]">1</div>
                        <span className="hidden sm:inline">Selection</span>
                    </div>
                    <div className="w-6 sm:w-12 h-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-900">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] sm:text-[10px]">2</div>
                        Details
                    </div>
                    <div className="w-6 sm:w-12 h-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] sm:text-[10px]">3</div>
                        <span className="hidden sm:inline">Finalize</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="relative h-48 sm:h-56 w-full bg-slate-100">
                                <Image 
                                    src={selectedRoom ? (getImages(selectedRoom.images)[0] || selectedRoom.thumbnail) : (hotel?.thumbnail || "/placeholder-hotel.jpg")} 
                                    alt={selectedRoom?.name || hotel?.name || "Hotel"} 
                                    fill 
                                    className="object-cover" 
                                
                                />
                            </div>
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight uppercase">{hotel?.name || "Loading..."}</h2>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{hotel?.address || "Address loading..."}</p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Selected Room</span>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{selectedRoom?.name || "Room Selection"}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Users className="w-4 h-4 text-slate-400" /> {guestsParam} Guest{guestsParam > 1 ? 's' : ''}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Maximize2 className="w-4 h-4 text-slate-400" /> {selectedRoom?.sizeM2 || 250} sq.ft
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700">
                                        <Check className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{mealPlanLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 sm:space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your stay details</h3>
                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Check-in</span>
                                    <p className="text-xs font-bold text-slate-900">{formatDate(checkIn) || "Select Date"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Check-out</span>
                                    <p className="text-xs font-bold text-slate-900">{formatDate(checkOut) || "Select Date"}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stay</span>
                                <span className="text-xs font-black text-slate-900">{nights} Night{nights > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
 
                    {/* Right Content */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 sm:mb-8 tracking-tight uppercase">Enter your details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">First name *</label>
                                        <input {...register("firstName")} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold" />
                                        {errors.firstName && <p className="text-[10px] text-red-500 font-bold">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Last name *</label>
                                        <input {...register("lastName")} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold" />
                                        {errors.lastName && <p className="text-[10px] text-red-500 font-bold">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Email address *</label>
                                        <input {...register("email")} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold" />
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Country/Region *</label>
                                        <select {...register("country")} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold">
                                            {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Phone number *</label>
                                        <input {...register("phone")} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold" />
                                        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </div>
 
                            {/* Promo Code / Coupon Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-4 sm:space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Offers & Promotions</h3>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Coupon Code" 
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value);
                                            setCouponError("");
                                        }}
                                        className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs font-black uppercase tracking-widest" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-8 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-brand-600 active:scale-[0.98] transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl border border-emerald-100/50">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Promo Code Applied</span>
                                            <span className="text-xs font-black uppercase tracking-widest">{appliedCoupon.code} (-{appliedCoupon.discountValue}%)</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setAppliedCoupon(null)}
                                            className="w-8 h-8 rounded-full hover:bg-emerald-100 flex items-center justify-center text-emerald-700 transition-colors"
                                        >
                                            <X className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="text-[10px] text-red-500 font-bold tracking-wide">{couponError}</p>}
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 sm:mb-8 tracking-tight uppercase">Price Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-550 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Room price ({nights} nights)</span>
                                        <span className="font-black text-slate-900">{formatPrice(priceDetails.baseSubtotal)}</span>
                                    </div>
                                    {priceDetails.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-emerald-600">
                                            <span className="font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Discount ({appliedCoupon?.code})</span>
                                            <span className="font-black">-{formatPrice(priceDetails.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-555 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Taxes (5%)</span>
                                        <span className="font-black text-slate-900">+{formatPrice(priceDetails.taxes)}</span>
                                    </div>
                                    <div className="pt-4 sm:pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Total</span>
                                        <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">{formatPrice(priceDetails.total)}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="p-4 sm:p-6 bg-slate-900 rounded-2xl text-white">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Pay Now (18%)</span>
                                            <span className="text-xl sm:text-2xl font-black">{formatPrice(priceDetails.payNow)}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">At Hotel</span>
                                            <span className="text-lg sm:text-xl font-black text-slate-900">{formatPrice(priceDetails.payAtHotel)}</span>
                                        </div>
                                    </div>
                                </div>
 
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="w-full mt-8 sm:mt-10 py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                    Complete Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
            <BookingContent />
        </Suspense>
    );
}
