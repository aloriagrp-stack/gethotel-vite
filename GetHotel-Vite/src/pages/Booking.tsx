import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "@/components/common/Image";
import Loader from "@/components/common/Loader";
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
import { hotelApi, couponApi, bookingApi, paymentApi } from "@/lib/api";
import { formatPrice, formatDate, safeParse } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import SEOHead from "@/components/common/SEOHead";
import { validateCoupon } from "@/lib/promoUtils";

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

const ARRIVAL_TIME_OPTIONS = [
    { label: "Please select", value: "" },
    { label: "I don't know", value: "I don't know" },
    { label: "12:00 AM - 1:00 AM", value: "12:00 AM - 1:00 AM" },
    { label: "1:00 AM - 2:00 AM", value: "1:00 AM - 2:00 AM" },
    { label: "2:00 AM - 3:00 AM", value: "2:00 AM - 3:00 AM" },
    { label: "3:00 AM - 4:00 AM", value: "3:00 AM - 4:00 AM" },
    { label: "4:00 AM - 5:00 AM", value: "4:00 AM - 5:00 AM" },
    { label: "5:00 AM - 6:00 AM", value: "5:00 AM - 6:00 AM" },
    { label: "6:00 AM - 7:00 AM", value: "6:00 AM - 7:00 AM" },
    { label: "7:00 AM - 8:00 AM", value: "7:00 AM - 8:00 AM" },
    { label: "8:00 AM - 9:00 AM", value: "8:00 AM - 9:00 AM" },
    { label: "9:00 AM - 10:00 AM", value: "9:00 AM - 10:00 AM" },
    { label: "10:00 AM - 11:00 AM", value: "10:00 AM - 11:00 AM" },
    { label: "11:00 AM - 12:00 PM", value: "11:00 AM - 12:00 PM" },
    { label: "12:00 PM - 1:00 PM", value: "12:00 PM - 1:00 PM" },
    { label: "1:00 PM - 2:00 PM", value: "1:00 PM - 2:00 PM" },
    { label: "2:00 PM - 3:00 PM", value: "2:00 PM - 3:00 PM" },
    { label: "3:00 PM - 4:00 PM", value: "3:00 PM - 4:00 PM" },
    { label: "4:00 PM - 5:00 PM", value: "4:00 PM - 5:00 PM" },
    { label: "5:00 PM - 6:00 PM", value: "5:00 PM - 6:00 PM" },
    { label: "6:00 PM - 7:00 PM", value: "6:00 PM - 7:00 PM" },
    { label: "7:00 PM - 8:00 PM", value: "7:00 PM - 8:00 PM" },
    { label: "8:00 PM - 9:00 PM", value: "8:00 PM - 9:00 PM" },
    { label: "9:00 PM - 10:00 PM", value: "9:00 PM - 10:00 PM" },
    { label: "10:00 PM - 11:00 PM", value: "10:00 PM - 11:00 PM" },
    { label: "11:00 PM - 12:00 AM", value: "11:00 PM - 12:00 AM" },
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
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router("/");
        }
    }, [user, authLoading, router]);

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
    const [arrivalTime, setArrivalTime] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    useEffect(() => {
        if (showConfirmAnimation) {
            const duration = 4 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100000 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 45 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 200);

            return () => clearInterval(interval);
        }
    }, [showConfirmAnimation]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        const found = coupons.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
        if (found) {
            const stayDetails = {
                checkIn,
                checkOut,
                basePrice: (pricePerNight || 0) * nights,
                nights,
                roomId: selectedRoom?.id
            };
            const check = validateCoupon(found, stayDetails);
            if (check.valid) {
                setAppliedCoupon(found);
                setCouponError("");
                setCouponCode("");
            } else {
                setCouponError(check.reason || "This coupon is not valid for your stay.");
            }
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
                let foundRoom: any = null;

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
                    foundRoom = (roomsRes.data || []).find((r: any) => String(r.id) === String(targetRoomId));
                    
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
                const couponRes = await couponApi.getCoupons(hotelData.id);
                if (couponRes && Array.isArray(couponRes.data)) {
                    const activeCoupons = couponRes.data.filter((c: any) => c.isActive);
                    setCoupons(activeCoupons);

                    // Compute stay params for validation
                    const d1 = new Date(checkIn);
                    const d2 = new Date(checkOut);
                    const stayNights = isNaN(d1.getTime()) || isNaN(d2.getTime()) ? 1 : Math.max(1, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                    
                    const resolvedRoom = foundRoom || hotelData?.room?.[0] || hotelData?.rooms?.[0];
                    const roomBase = resolvedRoom?.selectedVariant?.price ? parseFloat(resolvedRoom.selectedVariant.price) : (resolvedRoom?.pricePerNight ?? hotelData?.pricePerNight ?? 0);
                    const priceDiff = resolvedRoom?.dynamicPricePerNight ? (resolvedRoom.dynamicPricePerNight - resolvedRoom.pricePerNight) : 0;
                    const calculatedBasePrice = (roomBase + priceDiff) * stayNights;

                    const stayDetailsForAutoApply = {
                        checkIn,
                        checkOut,
                        basePrice: calculatedBasePrice,
                        nights: stayNights,
                        roomId: resolvedRoom?.id
                    };

                    // Find best valid coupon
                    const validCoupons = activeCoupons.filter((c: any) => validateCoupon(c, stayDetailsForAutoApply).valid);
                    validCoupons.sort((a, b) => Number(b.discountValue) - Number(a.discountValue));
                    
                    if (validCoupons.length > 0) {
                        setAppliedCoupon(validCoupons[0]);
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
            if (appliedCoupon.discountType === 'percentage') {
                discount = Math.round(baseSubtotal * (Number(appliedCoupon.discountValue) / 100));
            } else {
                discount = Math.round(Number(appliedCoupon.discountValue));
            }
            discount = Math.min(discount, baseSubtotal);
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
                bookingStatus = 'held';
                bookingPaymentStatus = 'paid';
                amountPaid = priceDetails.total;
            } else {
                // pay_now (12%)
                bookingStatus = 'held';
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
                arrivalTime: arrivalTime || undefined,
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
                if (paymentMode === "pay_at_hotel") {
                    localStorage.removeItem("active_checkout_booking_id");
                    localStorage.removeItem("active_checkout_booking_time");
                    setShowConfirmAnimation(true);
                    setRedirectUrl(`/booking/details/${booking.id}?success=true`);
                } else {
                    // Store checkout ID for auto-recovery on reload/disconnect
                    localStorage.setItem("active_checkout_booking_id", booking.id.toString());
                    localStorage.setItem("active_checkout_booking_time", Date.now().toString());

                    // Open Razorpay Checkout for online modes
                    try {
                        const orderRes = await paymentApi.createOrder(booking.id);
                        
                        const options = {
                            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_T16NuPtvvs9cRV",
                            amount: orderRes.amount,
                            currency: orderRes.currency,
                            name: "GetHotel.",
                            description: `Stay at ${hotel?.name}`,
                            image: "/logo.png",
                            order_id: orderRes.orderId,
                            handler: async function (response: any) {
                                try {
                                    setIsSubmitting(true);
                                    await paymentApi.verifyPayment({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        booking_id: booking.id
                                    });
                                    // Success! Clear recovery tracker
                                    localStorage.removeItem("active_checkout_booking_id");
                                    localStorage.removeItem("active_checkout_booking_time");

                                    setShowConfirmAnimation(true);
                                    setRedirectUrl(`/booking/details/${booking.id}?success=true`);
                                } catch (err: any) {
                                    alert("Payment verification failed. Please check your bookings dashboard or contact support.");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            },
                            modal: {
                                ondismiss: function() {
                                    setIsSubmitting(false);
                                    alert("Payment was cancelled. You can retry from your bookings dashboard or start again.");
                                    // Clear tracking on explicit cancellation
                                    localStorage.removeItem("active_checkout_booking_id");
                                    localStorage.removeItem("active_checkout_booking_time");
                                }
                            },
                            prefill: {
                                name: `${data.firstName} ${data.lastName}`,
                                email: data.email,
                                contact: data.phone
                            },
                            theme: {
                                color: "#0f172a"
                            }
                        };

                        const rzp = new (window as any).Razorpay(options);
                        rzp.open();
                    } catch (paymentError: any) {
                        console.error("Razorpay workflow failed:", paymentError);
                        alert(paymentError.message || "Failed to initialize payment gateway. Please try again.");
                        setIsSubmitting(false);
                    }
                }
            } else {
                alert("Failed to create booking. Please try again.");
                setIsSubmitting(false);
            }
        } catch (err: any) {
            console.error("Booking Error:", err);
            alert(err.message || "Failed to create booking.");
            setIsSubmitting(false);
        }
    };

    if (loadingData) return (
        <Loader variant="fullscreen" text="Loading booking details..." />
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
            <SEOHead title="Complete Booking | GetHotelStays" description="Complete your hotel reservation securely." noIndex />
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
 
                            {/* ===== YOUR ARRIVAL TIME ===== */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-4">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Your arrival time</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5 text-[11px] font-bold text-slate-600">
                                        <Hotel className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span>24-hour front desk – help whenever you need it!</span>
                                    </div>
                                </div>
                                
                                <div className="pt-2 space-y-1.5 relative" ref={dropdownRef}>
                                    <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Add your estimated arrival time (optional)</label>
                                    
                                    <div className="relative w-full max-w-md">
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-white hover:border-slate-350 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {ARRIVAL_TIME_OPTIONS.find(o => o.value === arrivalTime)?.label || "Please select"}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-2 divide-y divide-slate-50 focus:outline-none">
                                                {ARRIVAL_TIME_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setArrivalTime(opt.value);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-5 py-3.5 text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${
                                                            arrivalTime === opt.value 
                                                                ? "bg-blue-50 text-blue-600" 
                                                                : "text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {arrivalTime === opt.value && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Time is for New Delhi time zone</p>
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
                                    {/* Option 1: Pay Now (12%) */}
                                    <button
                                        type="button"
                                        id="payment-mode-pay-now"
                                        onClick={() => setPaymentMode("pay_now")}
                                        className={`w-full text-left rounded-2xl border-2 transition-all duration-200 p-4 sm:p-5 group ${
                                            paymentMode === "pay_now"
                                                ? "border-emerald-500 bg-emerald-50/50"
                                                : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                    paymentMode === "pay_now" ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"
                                                }`}>
                                                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Pay Online Now</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                        Pay just <strong className="text-slate-700">12% booking fee</strong> now to secure your room. Rest at hotel.
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Pay Now</span>
                                                        <span className="text-sm font-black text-emerald-600">{formatPrice(priceDetails.platformFee)}</span>
                                                        <span className="text-[10px] font-black text-slate-300">·</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">At Hotel</span>
                                                        <span className="text-sm font-black text-slate-700">{formatPrice(priceDetails.payAtHotel)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                paymentMode === "pay_now" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                            }`}>
                                                {paymentMode === "pay_now" && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>

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

                                    {/* Option 3: Full Pay Online */}
                                    <button
                                        type="button"
                                        id="payment-mode-pay-full-online"
                                        onClick={() => setPaymentMode("pay_full_online")}
                                        className={`w-full text-left rounded-2xl border-2 transition-all duration-200 p-4 sm:p-5 group ${
                                            paymentMode === "pay_full_online"
                                                ? "border-emerald-500 bg-emerald-50/50"
                                                : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                    paymentMode === "pay_full_online" ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"
                                                }`}>
                                                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Pay Full Online</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                        Pay the entire amount <strong className="text-slate-700">online right now</strong>. Nothing due at hotel.
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Pay Now</span>
                                                        <span className="text-sm font-black text-emerald-600">{formatPrice(priceDetails.total)}</span>
                                                        <span className="text-[10px] font-black text-slate-300">·</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">At Hotel</span>
                                                        <span className="text-sm font-black text-slate-700">₹0</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                paymentMode === "pay_full_online" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                            }`}>
                                                {paymentMode === "pay_full_online" && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>
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
                                    <div className="flex justify-between items-start text-sm">
                                        <span className="text-slate-555 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                                            <span>Taxes (GST {Math.round(priceDetails.gstRate * 100)}%)</span>
                                            {(() => {
                                                if (priceDetails.gstRate === 0) {
                                                    return (
                                                        <span className="text-[10px] text-slate-400 font-medium normal-case block mt-0.5 leading-tight">
                                                            (GST exempt for budget friendly stay room rates up to {formatPrice(1000)}/night)
                                                        </span>
                                                    );
                                                } else if (priceDetails.gstRate === 0.05) {
                                                    return (
                                                        <span className="text-[10px] text-slate-400 font-medium normal-case block mt-0.5 leading-tight">
                                                            (5% GST applies for standard stay room rates between {formatPrice(1001)} and {formatPrice(7500)}/night)
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="text-[10px] text-slate-400 font-medium normal-case block mt-0.5 leading-tight">
                                                            (18% GST applies for luxury stay room rates above {formatPrice(7500)}/night)
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </span>
                                        <span className="font-black text-slate-900 mt-0.5">+{formatPrice(priceDetails.taxes)}</span>
                                    </div>
                                    <div className="pt-4 sm:pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Total</span>
                                        <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">{formatPrice(priceDetails.total)}</span>
                                    </div>
                                </div>

                                {/* Payment Breakdown Card */}
                                <div className={`mt-8 sm:mt-10 rounded-2xl border-2 p-5 sm:p-6 bg-gradient-to-br ${
                                    paymentMode === "pay_at_hotel"
                                        ? "border-emerald-200 from-emerald-50 to-slate-50"
                                        : "border-blue-200 from-blue-50 to-slate-50"
                                }`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        {paymentMode === "pay_at_hotel" ? (
                                            <>
                                                <Hotel className="w-4 h-4 text-emerald-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                                    Full Payment at Check-In
                                                </span>
                                            </>
                                        ) : paymentMode === "pay_now" ? (
                                            <>
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                                    12% Booking Fee Online
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Smartphone className="w-4 h-4 text-blue-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                                    Full Payment Online
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pay Now</p>
                                            <p className={`text-2xl font-black tracking-tighter ${
                                                paymentMode === "pay_at_hotel" ? "text-emerald-600" : "text-blue-600"
                                            }`}>
                                                {formatPrice(getPayNowAmount())}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">At Hotel</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                                {formatPrice(paymentMode === "pay_full_online" ? 0 : paymentMode === "pay_now" ? priceDetails.payAtHotel : priceDetails.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    id="complete-booking-btn"
                                    disabled={isSubmitting} 
                                    className={`w-full mt-6 sm:mt-8 py-4 sm:py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50 ${
                                        paymentMode === "pay_at_hotel"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {paymentMode === "pay_at_hotel"
                                        ? `Reserve Free · Pay ${formatPrice(priceDetails.total)} at Hotel`
                                        : paymentMode === "pay_now"
                                            ? `Pay ${formatPrice(priceDetails.platformFee)} Online Now`
                                            : `Pay ${formatPrice(priceDetails.total)} Online Now`
                                    }
                                </button>

                                <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
                                    <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                                    Secured by 256-bit SSL encryption · No hidden charges
                                </p>
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
