

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
    Smartphone,
    Building2,
    Lock,
    ChevronRight,
    Calendar,
    Users,
    MapPin,
    Loader2,
    CheckCircle2,
    XCircle,
    Zap
} from "lucide-react";
import { hotelApi, couponApi } from "@/lib/api";
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

function BookingContent() {
    const [searchParams] = useSearchParams();
    const router = useNavigate();

    // Read all params from URL (set by SearchBar, PriceBox, or "Select Room" button)
    const hotelId = searchParams.get("hotelId") || searchParams.get("id") || "";
    const roomId = searchParams.get("roomId") || searchParams.get("room") || null;
    const variantParam = searchParams.get("variant") || null;
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guestsParam = parseInt(searchParams.get("adults") || searchParams.get("guests") || "2", 10);
    const stayType = searchParams.get("stayType") || "nightly";
    const duration = searchParams.get("duration") || "3";
    const isHourly = stayType === 'hourly';

    const [hotel, setHotel] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!hotelId) {
                router("/");
                return;
            }
            if (!checkIn || !checkOut) {
                router(`/hotel/${hotelId}`);
                return;
            }
            try {
                setLoadingData(true);
                const hotelRes = await hotelApi.getHotel(hotelId);
                const hotelData = hotelRes.data;
                setHotel(hotelData);

                let roomData = null;
                if (roomId) {
                    const roomsRes = await hotelApi.getRooms(hotelId);
                    roomData = roomsRes.data?.find((r: any) => String(r.id) === String(roomId));
                    
                    if (roomData && variantParam !== null) {
                        const variants = safeParse(roomData.variants || roomData.room_variants || roomData.variants, []);
                        const variant = variants[parseInt(variantParam)];
                        if (variant) {
                            roomData.selectedVariant = variant;
                        }
                        roomData.roomPolicies = safeParse(roomData.roomPolicies || roomData.room_policies || roomData.policies, {});
                    }
                    setSelectedRoom(roomData);
                }

                // Auto-apply Best Coupon
                const couponRes = await couponApi.getCoupons(parseInt(hotelId));
                if (couponRes.success && couponRes.data.length > 0) {
                    // Calculate basic total to check eligibility
                    const pPerNight = roomData?.selectedVariant?.price ? parseFloat(roomData.selectedVariant.price) : (roomData?.pricePerNight ?? hotelData?.pricePerNight ?? 0);
                    const nts = (() => {
                        if (!checkIn || !checkOut) return 1;
                        const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);
                        return Math.max(1, Math.floor(diff));
                    })();
                    const baseTotal = pPerNight * nts;

                    const validCoupons = couponRes.data.filter((c: any) => {
                        const now = new Date();
                        return c.isActive && 
                               new Date(c.startDate) <= now && 
                               new Date(c.endDate) >= now &&
                               baseTotal >= (c.minBookingAmt || 0);
                    });

                    if (validCoupons.length > 0) {
                        // Find coupon with maximum discount value
                        const bestCoupon = validCoupons.reduce((best: any, current: any) => {
                            const bestVal = best.discountType === 'percentage' ? (baseTotal * best.discountValue / 100) : best.discountValue;
                            const currentVal = current.discountType === 'percentage' ? (baseTotal * current.discountValue / 100) : current.discountValue;
                            return currentVal > bestVal ? current : best;
                        }, validCoupons[0]);
                        
                        setAppliedCoupon(bestCoupon);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch booking data:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [hotelId, roomId]);

    const pricePerNight = isHourly 
        ? (safeParse(selectedRoom?.hourlyRates || selectedRoom?.hourly_rates, {})[duration] || (selectedRoom?.pricePerNight ? selectedRoom.pricePerNight / 2 : (hotel?.pricePerNight ? hotel.pricePerNight / 2 : 0)))
        : (selectedRoom?.selectedVariant?.price ? parseFloat(selectedRoom.selectedVariant.price) : (selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0));
    
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

    const roomName = selectedRoom ? `${selectedRoom.name} (${mealPlanLabel})` : "Standard Room";

    // Compute nights dynamically from URL params
    const nights = isHourly ? 1 : (() => {
        if (!checkIn || !checkOut) return 1;
        try {
            const diff =
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                (1000 * 60 * 60 * 24);
            return Math.max(1, Math.floor(diff));
        } catch (e) {
            return 1;
        }
    })();

    const calculateBookingPrice = () => {
        let baseSubtotal = pricePerNight * nights;
        let discountApplied = 0;
        let discountType = null;

        if (selectedRoom) {
            if (nights >= 30 && selectedRoom.monthlyDiscount > 0) {
                discountApplied = selectedRoom.monthlyDiscount;
                discountType = "Monthly Stay Discount";
            } else if (nights >= 7 && selectedRoom.weeklyDiscount > 0) {
                discountApplied = selectedRoom.weeklyDiscount;
                discountType = "Weekly Stay Discount";
            }
        }

        let couponDiscount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'percentage') {
                couponDiscount = Math.round(baseSubtotal * (Number(appliedCoupon.discountValue) / 100));
            } else {
                couponDiscount = Number(appliedCoupon.discountValue);
            }
        }

        const stayDiscountAmount = Math.round(baseSubtotal * (discountApplied / 100));
        const discountedSubtotal = baseSubtotal - stayDiscountAmount - couponDiscount;
        const taxes = Math.round(discountedSubtotal * 0.12);
        const total = discountedSubtotal + taxes;
        const payNow = Math.round(total * 0.18);
        const payAtHotel = total - payNow;

        return { 
            baseSubtotal, 
            discountApplied, 
            discountType,
            stayDiscountAmount,
            couponDiscount,
            discountedSubtotal: Math.max(0, discountedSubtotal), 
            taxes: Math.max(0, taxes), 
            total: Math.max(0, total),
            payNow: Math.max(0, payNow),
            payAtHotel: Math.max(0, payAtHotel)
        };
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponError("");
        try {
            const res = await couponApi.getCoupons(parseInt(hotelId));
            if (res.success) {
                const coupon = res.data.find((c: any) => c.code.toUpperCase() === couponCode.toUpperCase());
                if (!coupon) {
                    setCouponError("Invalid coupon code");
                } else if (!coupon.isActive) {
                    setCouponError("This coupon is no longer active");
                } else if (new Date(coupon.endDate) < new Date()) {
                    setCouponError("This coupon has expired");
                } else if (priceDetails.baseSubtotal < coupon.minBookingAmt) {
                    setCouponError(`Minimum booking amount of ₹${coupon.minBookingAmt} required`);
                } else {
                    setAppliedCoupon(coupon);
                    setCouponCode("");
                }
            }
        } catch (err) {
            setCouponError("Failed to validate coupon");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const priceDetails = calculateBookingPrice();
    const { total, payNow, payAtHotel } = priceDetails;

    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
    const [booked, setBooked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const [confirmCode] = useState(
        `STE-${Math.random().toString(36).toUpperCase().slice(2, 8)}`
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
        defaultValues: { country: "India" },
    });

    const onSubmit = async (data: GuestFormData) => {
        setIsSubmitting(true);
        console.log("Booking Data:", data);
        await new Promise((r) => setTimeout(r, 1500));
        setIsSubmitting(false);
        setBooked(true);
    };

    if (loadingData) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-center">Securing your suite...</p>
                </div>
            </div>
        );
    }

    if (!hotelId) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50 text-center px-4">
                <div className="max-w-md">
                    <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Invalid Request</h1>
                    <p className="text-slate-500 font-medium mb-8">Please select a property from our collection to proceed with your booking.</p>
                    <Link to="/hotels" className="px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all inline-block shadow-xl shadow-blue-100">Browse Properties</Link>
                </div>
            </div>
        );
    }

    if (booked) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
                <div className="max-w-lg w-full mx-auto text-center px-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-fade-in border border-emerald-200">
                        <Check className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">Stay Secured! 🎉</h1>
                    <p className="text-slate-500 font-medium mb-10">
                        Your booking at <strong className="text-slate-900">{hotel?.name}</strong> has been successfully confirmed.
                    </p>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-left mb-10 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmation Code</span>
                            <span className="font-mono font-black text-blue-700 text-lg">{confirmCode}</span>
                        </div>
                        {checkIn && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Check-in</span>
                                <span className="font-black text-slate-900">{formatDate(checkIn)}</span>
                            </div>
                        )}
                        {checkOut && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Check-out</span>
                                <span className="font-black text-slate-900">{formatDate(checkOut)}</span>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Paid</span>
                                <span className="text-xl font-black text-blue-600 italic">{formatPrice(payNow)}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Balance at Hotel</span>
                                    <span className="font-black text-slate-700">{formatPrice(payAtHotel)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link
                        to="/dashboard"
                        className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.3em] rounded-lg shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3"
                    >
                        Go to Dashboard <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-4 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link
                        to={hotel ? `/hotel/${hotel.id}` : "/hotels"}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {hotel?.name ?? "Property"}
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900">Secure Booking</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-xl font-black text-slate-900 italic tracking-tighter leading-none mb-4">Review Selection</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Finalize your stay at {hotel?.name}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Guest Details */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-600" />
                                    Guest Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <FormField label="First Name" error={errors.firstName?.message}>
                                        <input
                                            {...register("firstName")}
                                            placeholder="Arjun"
                                            className={inputClass(!!errors.firstName)}
                                        />
                                    </FormField>
                                    <FormField label="Last Name" error={errors.lastName?.message}>
                                        <input
                                            {...register("lastName")}
                                            placeholder="Mehta"
                                            className={inputClass(!!errors.lastName)}
                                        />
                                    </FormField>
                                    <FormField label="Email Address" error={errors.email?.message}>
                                        <input
                                            {...register("email")}
                                            type="email"
                                            placeholder="arjun@email.com"
                                            className={inputClass(!!errors.email)}
                                        />
                                    </FormField>
                                    <FormField label="Phone Number" error={errors.phone?.message}>
                                        <input
                                            {...register("phone")}
                                            placeholder="+91 98765 43210"
                                            className={inputClass(!!errors.phone)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Country"
                                        error={errors.country?.message}
                                        className="sm:col-span-2"
                                    >
                                        <select
                                            {...register("country")}
                                            className={inputClass(!!errors.country)}
                                        >
                                            {COUNTRY_LIST.map((c) => (
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField
                                        label="Special Requests (Optional)"
                                        className="sm:col-span-2"
                                    >
                                        <textarea
                                            {...register("specialRequests")}
                                            rows={4}
                                            placeholder="Early check-in, high floor, extra towels..."
                                            className={inputClass(false) + " resize-none"}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-600" />
                                    Secure Payment
                                </h2>

                                {/* Method Tabs */}
                                <div className="grid grid-cols-3 gap-6 mb-10">
                                    {([
                                        { value: "card", icon: CreditCard, label: "Credit Card" },
                                        { value: "upi", icon: Smartphone, label: "UPI" },
                                        { value: "netbanking", icon: Building2, label: "Net Banking" },
                                    ] as const).map(({ value, icon: Icon, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setPaymentMethod(value)
                                            }
                                            className={`flex flex-col items-center gap-3 py-6 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === value
                                                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                    : "border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 mb-1" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === "card" && (
                                    <div className="space-y-6">
                                        <FormField label="Name on Card">
                                            <input
                                                placeholder="ARJUN MEHTA"
                                                className={inputClass(false)}
                                            />
                                        </FormField>
                                        <FormField label="Card Number">
                                            <input
                                                placeholder="•••• •••• •••• ••••"
                                                maxLength={19}
                                                className={inputClass(false)}
                                            />
                                        </FormField>
                                        <div className="grid grid-cols-2 gap-8">
                                            <FormField label="Expiry Date">
                                                <input
                                                    placeholder="MM / YY"
                                                    className={inputClass(false)}
                                                />
                                            </FormField>
                                            <FormField label="CVV">
                                                <input
                                                    placeholder="•••"
                                                    maxLength={4}
                                                    className={inputClass(false)}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === "upi" && (
                                    <div className="space-y-6">
                                        <FormField label="Enter VPA / UPI ID">
                                            <input
                                                placeholder="yourname@upi"
                                                className={inputClass(false)}
                                            />
                                        </FormField>
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                            <p className="text-[10px] text-blue-800 font-bold leading-relaxed uppercase tracking-widest">
                                                A payment request will be sent to your UPI app. Authenticate and complete the payment within 5 minutes.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === "netbanking" && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Other"].map(
                                            (bank) => (
                                                <button
                                                    key={bank}
                                                    type="button"
                                                    className="p-5 rounded-2xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 text-[10px] font-black text-slate-600 transition-all uppercase tracking-widest"
                                                >
                                                    {bank}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Lock className="w-4 h-4 text-emerald-500" />
                                    End-to-End Encrypted Secure Checkout
                                </div>
                            </div>
                        </div>

                        {/* Right: Booking Summary */}
                        <div>
                            <div className="sticky top-24 space-y-6">
                                {/* Hotel Info */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            Selection Summary
                                        </h2>
                                    </div>
                                    <div className="p-8">
                                        {hotel && (
                                            <div className="flex gap-5 mb-8">
                                                <div className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                                                    <Image
                                                        src={hotel.thumbnail || "/placeholder-hotel.jpg"}
                                                        alt={hotel.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="112px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm text-slate-900 line-clamp-2 leading-tight mb-2 uppercase tracking-tighter">
                                                        {hotel.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                                                         <MapPin className="w-3 h-3 text-blue-600" />
                                                         {hotel.city}
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-widest">
                                                        <span>{isHourly ? `${duration} Hours Stay` : `${nights} Night Stay`}</span>
                                                        <span>{formatPrice(pricePerNight * nights)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-3">
                                                        {Array.from({ length: Math.max(0, Math.floor(Number(hotel.starRating) || 0)) }).map((_, i) => (
                                                            <span key={i} className="text-gold-400 text-xs">★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stay Details */}
                                        <div className="space-y-5 mb-10">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4 mb-1">
                                                    <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dates</span>
                                                        <span className="text-xs font-black text-slate-900">
                                                            {checkIn && checkOut
                                                                ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                                                                : "Not selected"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <Users className="w-5 h-5 text-blue-600 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guests</span>
                                                            <span className="text-xs font-black text-slate-900">{guestsParam} Adults</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
                                                            <span className="text-[10px] font-black text-slate-900 truncate uppercase">{mealPlanLabel}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-blue-900 rounded-lg text-white">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Room Class</span>
                                                <span className="text-xs font-black italic tracking-tight">{selectedRoom?.name || "Standard Room"}</span>
                                            </div>
                                        </div>

                                        {/* Coupon Input */}
                                        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="PROMO CODE"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-black tracking-widest outline-none focus:border-blue-600 transition-all uppercase"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !couponCode}
                                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                                >
                                                    {isValidatingCoupon ? "..." : "Apply"}
                                                </button>
                                            </div>
                                            {couponError && <p className="text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase">{couponError}</p>}
                                            {appliedCoupon && (
                                                <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg shadow-sm animate-pulse-subtle">
                                                    <div>
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                                                            <Zap className="w-3 h-3 fill-blue-600" /> Best Offer Applied
                                                        </span>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                            {appliedCoupon.code} - Saved {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setAppliedCoupon(null)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="space-y-5 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest">
                                                    {isHourly ? `Rate for ${duration} Hours Stay` : `Rate for ${nights} Night${nights > 1 ? 's' : ''}`}
                                                </span>
                                                <span className="font-black text-slate-900">
                                                    {formatPrice(priceDetails.baseSubtotal)}
                                                </span>
                                            </div>
                                            {priceDetails.discountApplied > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest italic">{priceDetails.discountType} (-{priceDetails.discountApplied}%)</span>
                                                    <span className="font-black text-emerald-600 text-xs">-{formatPrice(priceDetails.stayDiscountAmount)}</span>
                                                </div>
                                            )}
                                            {priceDetails.couponDiscount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest italic">Promo: {appliedCoupon.code}</span>
                                                    <span className="font-black text-blue-600 text-xs">-{formatPrice(priceDetails.couponDiscount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest">GST & Service</span>
                                                <span className="font-black text-slate-900">
                                                    {formatPrice(priceDetails.taxes)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                                <span className="font-black text-slate-900 uppercase tracking-[0.3em] text-xs">Final Payable</span>
                                                <span className="text-3xl font-black text-slate-950 italic tracking-tighter">
                                                    {formatPrice(priceDetails.total)}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-8 space-y-4">
                                                <div className="p-6 bg-slate-950 rounded-lg text-white shadow-2xl shadow-slate-950/20">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Pay Now</span>
                                                        <span className="text-2xl font-black italic tracking-tighter text-blue-400">{formatPrice(priceDetails.payNow)}</span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">18% Security Deposit</p>
                                                </div>
                                                <div className="p-5 bg-white rounded-lg border border-slate-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">At Check-in</span>
                                                        <span className="text-sm font-black text-slate-900 italic">{formatPrice(priceDetails.payAtHotel)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-6 bg-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Complete Booking
                                        </>
                                    )}
                                </button>
                                
                                <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-100 border-dashed">
                                    <div className="flex gap-4">
                                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-emerald-800 font-black leading-relaxed uppercase tracking-widest">
                                            Instant confirmation and secured stay policy included.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FormField({
    label,
    error,
    children,
    className,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                {label}
            </label>
            {children}
            {error && <p className="text-[10px] font-black text-red-500 mt-2 uppercase tracking-widest ml-1">{error}</p>}
        </div>
    );
}

const inputClass = (hasError: boolean) =>
    `w-full px-5 py-4 text-sm font-bold text-slate-900 bg-white border rounded-lg outline-none transition-all placeholder-slate-300 ${hasError
        ? "border-red-500 focus:ring-1 focus:ring-red-100"
        : "border-slate-100 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 focus:bg-slate-50/50"
    }`;

export default function BookingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <BookingContent />
        </Suspense>
    );
}



