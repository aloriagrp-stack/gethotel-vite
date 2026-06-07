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
    Maximize2,
    Hotel,
    Banknote,
    Smartphone,
    BadgeCheck,
    Clock
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

// Payment modes
type PaymentMode = "pay_now" | "pay_at_hotel" | "pay_full_online";

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
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("pay_at_hotel");
    const [showConfirmAnimation, setShowConfirmAnimation] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [showSkipButton, setShowSkipButton] = useState(false);

    useEffect(() => {
        if (!redirectUrl) return;

        const skipBtnTimer = setTimeout(() => {
            setShowSkipButton(true);
        }, 3000);

        const autoNavTimer = setTimeout(() => {
            router(redirectUrl);
        }, 10000);

        return () => {
            clearTimeout(skipBtnTimer);
            clearTimeout(autoNavTimer);
        };
    }, [redirectUrl, router]);

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
                        const variants = safeParse(foundRoom.variants || foundRoom.room_variants, []).map((v: any) => {
                            const nameLower = (v.mealPlan || "").toLowerCase();
                            if (nameLower.includes("room only") || nameLower === "ep" || nameLower === "ep (room only)") {
                                return { ...v, price: foundRoom.pricePerNight };
                            }
                            return v;
                        });
                        const vIndex = parseInt(targetVariantIndex || "0");
                        if (variants && variants[vIndex]) {
                            foundRoom.selectedVariant = variants[vIndex];
                        }
                        foundRoom.roomPolicies = safeParse(foundRoom.roomPolicies || foundRoom.room_policies || foundRoom.policies, {});
                        setSelectedRoom(foundRoom);
                    }
                }

                // Auto-apply Best Available Coupon
                try {
                    const couponRes = await couponApi.getCoupons(parseInt(hotelId) || 0);
                    console.log('[Booking] couponRes:', couponRes);

                    // Handle both { data: [...] } and direct array responses
                    const allCoupons: any[] = Array.isArray(couponRes) 
                        ? couponRes 
                        : (Array.isArray(couponRes?.data) ? couponRes.data : []);
                    
                    console.log('[Booking] allCoupons:', allCoupons);

                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                    const validCoupons = allCoupons.filter((c: any) => {
                        const isActive = c.isActive || c.status === 'active';
                        if (!isActive) return false;
                        const startStr = c.startDate?.split('T')[0];
                        const endStr = c.endDate?.split('T')[0];
                        let valid = true;
                        if (startStr && endStr) {
                            valid = todayStr >= startStr && todayStr <= endStr;
                        }
                        console.log(`[Booking] Coupon ${c.code}: active=${isActive}, dateValid=${valid} (${startStr} to ${endStr})`);
                        return valid;
                    });

                    setCoupons(validCoupons);
                    console.log('[Booking] validCoupons:', validCoupons);

                    if (validCoupons.length > 0) {
                        const bestCoupon = validCoupons.reduce((best: any, c: any) =>
                            (c.discountValue > (best?.discountValue || 0)) ? c : best
                        , validCoupons[0]);
                        console.log('[Booking] Auto-applying best coupon:', bestCoupon.code, bestCoupon.discountValue + '%');
                        setAppliedCoupon(bestCoupon);
                    } else {
                        console.warn('[Booking] No valid coupons found for this hotel');
                    }
                } catch (couponErr) {
                    console.warn('[Booking] Coupon fetch failed:', couponErr);
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
        
        const pricePerNightAfterDiscount = discountedSubtotal / (nights || 1);
        let gstRate = 0.05;
        if (pricePerNightAfterDiscount <= 1000) {
            gstRate = 0;
        } else if (pricePerNightAfterDiscount <= 7500) {
            gstRate = 0.05;
        } else {
            gstRate = 0.18;
        }

        const taxes = Math.round(discountedSubtotal * gstRate);
        const total = discountedSubtotal + taxes;
        const platformFee = Math.round(total * 0.12); // 12% booking fee
        const payAtHotel = total - platformFee;

        return { baseSubtotal, discount, discountedSubtotal, taxes, total, platformFee, payAtHotel, gstRate };
    };

    const priceDetails = calculatePrice();

    // Amount to pay now based on mode
    const getPayNowAmount = () => {
        if (paymentMode === "pay_at_hotel") return 0;
        if (paymentMode === "pay_full_online") return priceDetails.total;
        return priceDetails.platformFee; // pay_now = 12%
    };

    const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
        defaultValues: { country: "India" },
    });

    const onSubmit = async (data: GuestFormData) => {
        if (!checkIn || !checkOut || checkIn === "Dates" || checkOut === "Dates") {
            alert("Please select valid check-in and check-out dates before completing booking.");
            return;
        }
        setIsSubmitting(true);
        try {
            let bookingStatus = 'confirmed';
            let bookingPaymentStatus = 'paid';
            let amountPaid = getPayNowAmount();

            if (paymentMode === "pay_at_hotel") {
                bookingStatus = 'confirmed';
                bookingPaymentStatus = 'pending';
                amountPaid = 0;
            } else if (paymentMode === "pay_full_online") {
                bookingStatus = 'confirmed';
                bookingPaymentStatus = 'paid';
                amountPaid = priceDetails.total;
            } else {
                // pay_now (12%)
                bookingStatus = 'confirmed';
                bookingPaymentStatus = 'partial';
                amountPaid = priceDetails.platformFee;
            }

            const bookingData = {
                hotelId: parseInt(hotelId),
                rooms: [{ id: String(selectedRoom?.id), quantity: 1, variantIdx: variantParam || "0" }],
                checkIn,
                checkOut,
                totalGuests: guestsParam,
                status: bookingStatus,
                paymentStatus: bookingPaymentStatus,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                amountPaid,
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
                setShowConfirmAnimation(true);
                setRedirectUrl(`/booking/details/${booking.id}?success=true`);
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
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Special Requests (optional)</label>
                                        <textarea {...register("specialRequests")} rows={3} placeholder="Any special requests for the hotel..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-medium resize-none" />
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

                            {/* ===== PAYMENT OPTIONS ===== */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Payment Options</h3>
                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Option 1: Pay Now (12%) — DISABLED */}
                                    <div
                                        id="payment-mode-pay-now-disabled"
                                        className="w-full text-left rounded-2xl border-2 border-slate-100 bg-slate-50/60 p-4 sm:p-5 opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-white border border-slate-200 text-slate-300">
                                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-slate-400 uppercase tracking-tight">Pay Online Now</span>
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 rounded-full flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Not available</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                    Pay just <strong>12% booking fee</strong> now to secure your room. Rest at hotel.
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">Pay Now</span>
                                                    <span className="text-sm font-black text-slate-300">{formatPrice(priceDetails.platformFee)}</span>
                                                    <span className="text-[10px] font-black text-slate-200">·</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">At Hotel</span>
                                                    <span className="text-sm font-black text-slate-300">{formatPrice(priceDetails.payAtHotel)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 2: Full Pay at Hotel */}
                                    <button
                                        type="button"
                                        id="payment-mode-pay-at-hotel"
                                        onClick={() => setPaymentMode("pay_at_hotel")}
                                        className={`w-full text-left rounded-2xl border-2 transition-all duration-200 p-4 sm:p-5 group ${
                                            paymentMode === "pay_at_hotel"
                                                ? "border-emerald-500 bg-emerald-50/50"
                                                : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                    paymentMode === "pay_at_hotel" ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"
                                                }`}>
                                                    <Hotel className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Pay Full at Hotel</span>
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full flex-shrink-0">₹0 Now</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                        Reserve your room <strong className="text-slate-700">for free</strong> today and pay the full amount at check-in.
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Pay Now</span>
                                                        <span className="text-sm font-black text-emerald-600">₹0</span>
                                                        <span className="text-[10px] font-black text-slate-300">·</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">At Hotel</span>
                                                        <span className="text-sm font-black text-slate-700">{formatPrice(priceDetails.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                paymentMode === "pay_at_hotel" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                            }`}>
                                                {paymentMode === "pay_at_hotel" && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Option 3: Full Pay Online — DISABLED */}
                                    <div
                                        id="payment-mode-pay-full-online-disabled"
                                        className="w-full text-left rounded-2xl border-2 border-slate-100 bg-slate-50/60 p-4 sm:p-5 opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-white border border-slate-200 text-slate-300">
                                                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-slate-400 uppercase tracking-tight">Pay Full Online</span>
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 rounded-full flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Not available</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                    Pay the entire amount <strong>online right now</strong>. Nothing due at hotel.
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">Pay Now</span>
                                                    <span className="text-sm font-black text-slate-300">{formatPrice(priceDetails.total)}</span>
                                                    <span className="text-[10px] font-black text-slate-200">·</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">At Hotel</span>
                                                    <span className="text-sm font-black text-slate-300">₹0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Policy notice for pay_at_hotel */}
                                {paymentMode === "pay_at_hotel" && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                            <strong className="font-black">Free cancellation</strong> up to 24 hours before check-in. Late cancellations may incur a penalty.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 sm:mb-8 tracking-tight uppercase">Price Summary</h3>
                                <div className="space-y-4">
                                     {/* Original base price — only shown when promo is active */}
                                     {(selectedRoom?.hasPromotion || appliedCoupon) && (
                                         <div className="flex justify-between items-center text-sm">
                                             <span className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                                                 Room Price ({nights} nights)
                                             </span>
                                             <span className="font-bold text-slate-400 line-through decoration-red-400 decoration-2">
                                                 {formatPrice(priceDetails.baseSubtotal)}
                                             </span>
                                         </div>
                                     )}
                                     {/* Promo / regular price line */}
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-555 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider flex items-center gap-1.5">
                                             {(selectedRoom?.hasPromotion || appliedCoupon) ? (
                                                 <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider rounded">Promo Price</span>
                                             ) : (
                                                 <span>Room price</span>
                                             )}
                                             <span>({nights} nights)</span>
                                         </span>
                                         <span className="font-black text-slate-900">
                                             {formatPrice((selectedRoom?.hasPromotion || appliedCoupon) ? priceDetails.discountedSubtotal : priceDetails.baseSubtotal)}
                                         </span>
                                     </div>
                                    {priceDetails.discount > 0 && !selectedRoom?.hasPromotion && !appliedCoupon && (
                                        <div className="flex justify-between items-center text-sm text-emerald-600">
                                            <span className="font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Discount ({appliedCoupon?.code})</span>
                                            <span className="font-black">-{formatPrice(priceDetails.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-555 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Taxes (GST {Math.round(priceDetails.gstRate * 100)}%)</span>
                                        <span className="font-black text-slate-900">+{formatPrice(priceDetails.taxes)}</span>
                                    </div>
                                    <div className="pt-4 sm:pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Total</span>
                                        <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">{formatPrice(priceDetails.total)}</span>
                                    </div>
                                </div>

                                {/* Payment Breakdown Card */}
                                <div className="mt-8 sm:mt-10 rounded-2xl border-2 p-5 sm:p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Hotel className="w-4 h-4 text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                            Full Payment at Check-In
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pay Now</p>
                                            <p className="text-2xl font-black tracking-tighter text-emerald-600">₹0</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">At Hotel</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                                {formatPrice(priceDetails.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    id="complete-booking-btn"
                                    disabled={isSubmitting} 
                                    className="w-full mt-6 sm:mt-8 py-4 sm:py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {`Reserve Free · Pay ${formatPrice(priceDetails.total)} at Hotel`}
                                </button>

                                <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
                                    <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                                    Secured by 256-bit SSL encryption · No hidden charges
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showConfirmAnimation && (
                <div className="booking-confirm-overlay">
                    <style>{`
                        .booking-confirm-overlay {
                            position: fixed;
                            inset: 0;
                            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #dbeafe 100%);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            z-index: 99999;
                            opacity: 0;
                            animation: overlayFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            overflow: hidden;
                        }
                        .sparkle-container {
                            position: absolute;
                            inset: 0;
                            pointer-events: none;
                        }
                        .sparkle-dot {
                            position: absolute;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
                            opacity: 0;
                            animation: sparkleAnim 2s infinite ease-in-out;
                        }
                        .confirm-title {
                            font-family: var(--font-display), sans-serif;
                            font-size: 2.5rem;
                            font-weight: 900;
                            color: #0f172a;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            animation: textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            text-align: center;
                            margin-bottom: 1rem;
                            z-index: 10;
                        }
                        @media (min-width: 768px) {
                            .confirm-title {
                                font-size: 5rem;
                            }
                        }
                        .confirm-subtitle {
                            font-size: 1rem;
                            font-weight: 700;
                            color: #0369c5;
                            text-transform: uppercase;
                            letter-spacing: 0.25em;
                            opacity: 0;
                            animation: subTextFadeIn 0.8s ease-out 0.6s forwards;
                            z-index: 10;
                        }
                        @keyframes overlayFadeIn {
                            to { opacity: 1; }
                        }
                        @keyframes textReveal {
                            0% {
                                opacity: 0;
                                transform: scale(0.9);
                                letter-spacing: 0.05em;
                            }
                            100% {
                                opacity: 1;
                                transform: scale(1);
                                letter-spacing: 0.3em;
                            }
                        }
                        @keyframes subTextFadeIn {
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes sparkleAnim {
                            0%, 100% {
                                transform: scale(0) translateY(0);
                                opacity: 0;
                            }
                            50% {
                                opacity: 0.8;
                            }
                            80% {
                                transform: scale(1) translateY(-30px);
                                opacity: 0;
                            }
                        }
                        .confirm-skip-btn {
                            margin-top: 2.5rem;
                            padding: 0.85rem 2.5rem;
                            background: rgba(255, 255, 255, 0.25);
                            border: 1.5px solid rgba(3, 105, 197, 0.3);
                            backdrop-filter: blur(12px);
                            -webkit-backdrop-filter: blur(12px);
                            color: #0369c5;
                            font-size: 0.75rem;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 0.2em;
                            border-radius: 9999px;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                            z-index: 50;
                            opacity: 0;
                            transform: translateY(15px);
                            animation: btnFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .confirm-skip-btn:hover {
                            background: #0369c5;
                            border-color: #0369c5;
                            color: #ffffff;
                            transform: translateY(12px) scale(1.05);
                            box-shadow: 0 10px 25px rgba(3, 105, 197, 0.25);
                        }
                        @keyframes btnFadeIn {
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>
                    
                    <div className="sparkle-container">
                        <div className="sparkle-dot" style={{ top: '15%', left: '20%', width: '12px', height: '12px', animationDelay: '0.1s' }} />
                        <div className="sparkle-dot" style={{ top: '25%', left: '80%', width: '16px', height: '16px', animationDelay: '0.5s' }} />
                        <div className="sparkle-dot" style={{ top: '65%', left: '15%', width: '10px', height: '10px', animationDelay: '0.3s' }} />
                        <div className="sparkle-dot" style={{ top: '75%', left: '75%', width: '14px', height: '14px', animationDelay: '0.8s' }} />
                        <div className="sparkle-dot" style={{ top: '45%', left: '50%', width: '8px', height: '8px', animationDelay: '1.2s' }} />
                        <div className="sparkle-dot" style={{ top: '20%', left: '45%', width: '12px', height: '12px', animationDelay: '1.5s' }} />
                        <div className="sparkle-dot" style={{ top: '80%', left: '40%', width: '10px', height: '10px', animationDelay: '0.2s' }} />
                        <div className="sparkle-dot" style={{ top: '55%', left: '85%', width: '15px', height: '15px', animationDelay: '0.9s' }} />
                        <div className="sparkle-dot" style={{ top: '35%', left: '10%', width: '14px', height: '14px', animationDelay: '1.1s' }} />
                        <div className="sparkle-dot" style={{ top: '70%', left: '90%', width: '12px', height: '12px', animationDelay: '0.6s' }} />
                    </div>

                    <h1 className="confirm-title">Booking Confirmed</h1>
                    <p className="confirm-subtitle">Your stay is secured</p>
                    {showSkipButton && (
                        <button
                            type="button"
                            onClick={() => router(redirectUrl!)}
                            className="confirm-skip-btn"
                        >
                            Skip
                        </button>
                    )}
                </div>
            )}
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
