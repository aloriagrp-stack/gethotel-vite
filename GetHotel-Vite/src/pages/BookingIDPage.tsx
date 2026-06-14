

import { useState, useEffect, Suspense, Fragment } from "react";
import { useParams, useSearchParams, useNavigate as useRouter } from "react-router-dom";
import Loader from "@/components/common/Loader";
import Image from "@/components/common/Image";
import { Link } from "react-router-dom";
import { 
    ChevronLeft, 
    Calendar, 
    Users, 
    CreditCard, 
    ShieldCheck, 
    MapPin, 
    Check, 
    AlertCircle,
    Loader2,
    Plus,
    Minus,
    Star,
    TrendingUp,
    LogOut,
    ArrowRight,
    User,
    Mail,
    Phone,
    Download,
    X
} from "lucide-react";
import { hotelApi, bookingApi, couponApi, paymentApi, messageApi } from "@/lib/api";
import { formatPrice, formatDate, cn, safeParse, getHotelUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { countries } from "@/lib/countries";
import { InvoiceTemplate } from "@/components/booking/InvoiceTemplate";
import { useRef } from "react";
import { validateCoupon } from "@/lib/promoUtils";

function BookingContent() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const router = useRouter();
    
    const hotelId = params.id as string;
    const checkInStr = searchParams.get("checkIn");
    const checkOutStr = searchParams.get("checkOut");
    const guestsCount = searchParams.get("guests") || "2";

    // Parse multiple rooms from URL: room_ID_variantIdx=QTY or room_ID=QTY
    const selectedRoomsInfo: { id: string; variantIdx?: string; quantity: number }[] = [];
    searchParams.forEach((val, key) => {
        if (key.startsWith('room_')) {
            const rawId = key.replace('room_', '');
            const parts = rawId.split('_');
            selectedRoomsInfo.push({
                id: parts[0],
                variantIdx: parts[1], // Optional
                quantity: parseInt(val)
            });
        }
    });

    const [hotel, setHotel] = useState<any>(null);
    const [selectedRoomsData, setSelectedRoomsData] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);
    
    // Interactive Booking State
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [stayType, setStayType] = useState(searchParams.get("stayType") || "nightly");
    const [duration, setDuration] = useState(searchParams.get("duration") || "3");
    const [arrivalTime, setArrivalTime] = useState("12:00"); // Default arrival time for hourly

    // Guest Form State
    const [guestData, setGuestData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "+91",
        specialRequests: "",
        isBusinessTrip: false,
        gstNumber: "",
        companyName: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const hotelRes = await hotelApi.getHotel(hotelId);
                const hotelData = hotelRes.data || hotelRes; // Handle both wrapped and direct response
                setHotel(hotelData);
                
                // Load specific room details with dates to fetch dynamic pricing overrides
                const paramsObj: any = {};
                if (checkIn) paramsObj.checkIn = checkIn;
                if (checkOut) paramsObj.checkOut = checkOut;
                const roomsRes = await hotelApi.getRooms(hotelId, paramsObj);
                const allRooms = roomsRes.data || hotelData?.room || hotelData?.rooms || [];

                if (selectedRoomsInfo.length > 0) {
                    const roomIds = selectedRoomsInfo.map(r => r.id);
                    const filtered = allRooms.filter((r: any) => roomIds.includes(r?.id?.toString()));
                    setSelectedRoomsData(filtered);
                } else {
                    const firstRoom = allRooms?.[0];
                    setSelectedRoomsData(firstRoom ? [firstRoom] : []);
                }

                // Fetch coupons using numeric hotelId
                try {
                    const res = await couponApi.getCoupons(hotelData.id);
                    const couponData = res?.data || res || [];
                    setCoupons(Array.isArray(couponData) ? couponData : []);
                } catch (e) {
                    console.error("Failed to fetch coupons", e);
                }

                // SESSION RECOVERY: Load guest data from sessionStorage
                const savedGuestData = sessionStorage.getItem(`booking_guest_data_${hotelId}`);
                if (savedGuestData) {
                    try {
                        setGuestData(JSON.parse(savedGuestData));
                    } catch (e) {
                        console.error("Failed to parse saved guest data", e);
                    }
                }
            } catch (err: any) {
                setError(err.message || "Failed to load booking details.");
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            fetchData();
        } else if (!loading) {
            // If no hotel ID, go to home
            router("/");
        }
    }, [hotelId, checkIn, checkOut]);

    // Save guest data to session storage on change
    useEffect(() => {
        if (hotelId && guestData.firstName) { // Only save if some data entered
            sessionStorage.setItem(`booking_guest_data_${hotelId}`, JSON.stringify(guestData));
        }
    }, [guestData, hotelId]);

    const nights = (() => {
        if (stayType === 'hourly') return 1;
        if (!checkIn || !checkOut) return 1;
        const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(1, Math.ceil(diff));
    })();

    // HELPER: Match HotelDetailContent's pricing logic
    const calculateStayPrice = (basePrice: number, room: any, couponsList: any[]) => {
        let finalPrice = basePrice;
        let originalPrice = basePrice;
        let discountLabel = "";
        let isMobileOnly = false;

        if (!room) return { finalPrice, originalPrice, discountLabel, isMobileOnly };

        // Prepare stay parameters for validation
        const stayDetails = {
            checkIn: checkIn || new Date().toISOString().split('T')[0],
            checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            basePrice,
            nights,
            roomId: room.id
        };

        // Filter valid coupons
        const validCoupons = couponsList.filter(c => {
            const validation = validateCoupon(c, stayDetails);
            return validation.valid;
        });

        if (validCoupons.length > 0) {
            const bestCoupon = validCoupons.reduce((prev, curr) => 
                (Number(curr.discountValue) > Number(prev.discountValue)) ? curr : prev
            );

            if (bestCoupon.discountType === 'percentage') {
                finalPrice = Math.round(basePrice * (1 - Number(bestCoupon.discountValue) / 100));
                discountLabel = `${bestCoupon.discountValue}% OFF (${bestCoupon.code})`;
            } else {
                finalPrice = Math.round(Math.max(0, basePrice - Number(bestCoupon.discountValue)));
                discountLabel = `₹${bestCoupon.discountValue} OFF`;
            }
            isMobileOnly = bestCoupon.promoType === 'mobile_only';
        }

        return { finalPrice, originalPrice, discountLabel, isMobileOnly };
    };

    const validRooms = selectedRoomsData.filter(room => room && room.id);
    
    const calculateRoomPrice = (room: any) => {
        const info = selectedRoomsInfo.find(ri => ri.id === room.id.toString());
        const variantIdx = info?.variantIdx ? parseInt(info.variantIdx) : 0;
        const variants = (typeof room.variants === 'string' ? safeParse(room.variants, []) : (room.variants || [])).map((v: any) => {
            const nameLower = (v.mealPlan || "").toLowerCase();
            if (nameLower.includes("room only") || nameLower === "ep" || nameLower === "ep (room only)") {
                return { ...v, price: room.pricePerNight };
            }
            return v;
        });
        const variant = (variants.length > 0 && variants[variantIdx]) ? variants[variantIdx] : room;

        let bPrice = variant.price || room.pricePerNight || 0;
        
        if (stayType === 'hourly') {
            const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || {});
            bPrice = rates[duration] || rates[String(duration)] || (room.pricePerNight / 2);
        }

        const priceDiff = room.dynamicPricePerNight ? (room.dynamicPricePerNight - room.pricePerNight) : 0;
        const basePriceWithOffset = parseFloat(bPrice) + priceDiff;

        const stayInfo = calculateStayPrice(basePriceWithOffset, room, coupons);
        return stayInfo.finalPrice;
    };

    let subtotal = validRooms.reduce((sum, room) => {
        const info = selectedRoomsInfo.find(i => i.id === room.id.toString()) || { quantity: 1 };
        const price = calculateRoomPrice(room);
        return sum + (price * info.quantity * (stayType === 'hourly' ? 1 : nights));
    }, 0);

    // FALLBACK: If no specific rooms found/selected, use hotel's base price
    if (subtotal === 0 && hotel) {
        const hPrice = calculateStayPrice(hotel.pricePerNight || 0, null, coupons).finalPrice;
        subtotal = hPrice * nights;
    }

    const subtotalAmount = subtotal;
    const totalRoomNights = validRooms.reduce((sum, room) => {
        const info = selectedRoomsInfo.find(i => i.id === room.id.toString()) || { quantity: 1 };
        return sum + (info.quantity * (stayType === 'hourly' ? 1 : nights));
    }, 0);
    const divisor = totalRoomNights > 0 ? totalRoomNights : (nights || 1);
    const averagePricePerRoomNight = subtotalAmount / divisor;
    let gstRate = 0.05;
    if (averagePricePerRoomNight <= 1000) {
        gstRate = 0;
    } else if (averagePricePerRoomNight <= 7500) {
        gstRate = 0.05;
    } else {
        gstRate = 0.18;
    }
    const taxes = Math.round(subtotalAmount * gstRate);
    const total = subtotalAmount + taxes; // Grand Total includes tax
    const basePricePerNight = subtotalAmount / (nights || 1); // SHOW BASE PRICE IN LABEL

    const getRatingLabel = (rating: number) => {
        if (!rating) return "New Property";
        if (rating >= 9) return "Exceptional";
        if (rating >= 8) return "Excellent";
        if (rating >= 7) return "Very Good";
        return "Good";
    };

    const [isVerifying, setIsVerifying] = useState(false);

    const [tempBooking, setTempBooking] = useState<any>(null);



    const handleConfirmBooking = async () => {
        // Validation
        if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone) {
            setError("Please fill in all guest details to proceed.");
            return;
        }

        const phoneDigits = guestData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            setError("Please enter a valid phone number (7-15 digits).");
            return;
        }

        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
            router(`/login?redirect=/booking/${hotelId}${window.location.search}`);
            return;
        }

        try {
            setBookingLoading(true);
            setError(null);

            // 1. Create Booking in DB
            const bookingRes = await bookingApi.createBooking({
                hotelId: parseInt(hotelId),
                rooms: selectedRoomsInfo,
                checkIn: checkInStr || new Date().toISOString(),
                checkOut: checkOutStr || new Date(Date.now() + 86400000).toISOString(),
                totalGuests: parseInt(guestsCount),
                guestInfo: {
                    ...guestData,
                    phone: `${guestData.countryCode} ${guestData.phone}`
                }
            });

            const booking = bookingRes.data;
            setTempBooking(booking);

            if (booking && booking.id) {
                localStorage.setItem("active_checkout_booking_id", booking.id.toString());
                localStorage.setItem("active_checkout_booking_time", Date.now().toString());
            }

            try {
                // 2. Create Razorpay Order
                const orderRes = await paymentApi.createOrder(booking.id);
                
                // 3. Open Razorpay Checkout
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_T16NuPtvvs9cRV",
                    amount: orderRes.amount,
                    currency: orderRes.currency,
                    name: "GetHotel.",
                    description: `Luxury Stay at ${hotel?.name}`,
                    image: "/logo.png",
                    order_id: orderRes.orderId,
                    handler: async function (response: any) {
                        try {
                            setIsVerifying(true);
                            await paymentApi.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            
                            // Success! Clear recovery tracker
                            localStorage.removeItem("active_checkout_booking_id");
                            localStorage.removeItem("active_checkout_booking_time");

                            setCreatedBookingId(booking.id.toString());
                            setCurrentBooking({
                                ...booking,
                                hotel,
                                room: selectedRoomsData[0], // Simplified for receipt
                                guestFirstName: guestData.firstName,
                                guestLastName: guestData.lastName,
                                guestEmail: guestData.email,
                                guestPhone: `${guestData.countryCode} ${guestData.phone}`
                            });
                            sessionStorage.removeItem(`booking_guest_data_${hotelId}`);
                            setSuccess(true);
                        } catch (err: any) {
                            setError("Payment verification is taking longer than expected. Please do not refresh, we are confirming your booking.");
                        } finally {
                            setIsVerifying(false);
                        }
                    },
                    modal: {
                        ondismiss: function() {
                            setBookingLoading(false);
                            setError("Payment was cancelled. You can try again whenever you're ready.");
                            // Clear tracking on explicit cancellation
                            localStorage.removeItem("active_checkout_booking_id");
                            localStorage.removeItem("active_checkout_booking_time");
                        }
                    },
                    prefill: {
                        name: `${guestData.firstName} ${guestData.lastName}`,
                        email: guestData.email,
                        contact: `${guestData.countryCode}${guestData.phone}`
                    },
                    theme: {
                        color: "#0f172a"
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } catch (orderError: any) {
                console.error("Razorpay payment flow failed:", orderError);
                setError(orderError.message || "Payment gateway could not be initialized. Please try again.");
            }

        } catch (err: any) {
            setError(err.message || "Booking failed. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <Loader variant="fullscreen" text="Preparing stay..." />;

    if (isVerifying) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
            >
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin" />
                    <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-brand-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 italic uppercase">Verifying Payment</h2>
                <p className="text-slate-400 font-bold text-sm leading-relaxed">
                    We are currently verifying your payment. <br />
                    Please do not refresh the page, this will only take a few seconds...
                </p>
                <div className="mt-8 flex justify-center gap-2">
                    {[1,2,3].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                            className="w-2 h-2 bg-brand-500 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-white">
            {/* Success Header Banner */}
            <div className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
                
                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40"
                    >
                        <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">Stay Secured!</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Your Luxury Experience is Confirmed • Booking ID: #GH-{Math.floor(Math.random() * 90000) + 10000}</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Comprehensive Details */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Hotel & Dates Card */}
                        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50">
                            <div className="flex flex-col md:flex-row gap-8 mb-12">
                                <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                    <Image 
                                        src={hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                                        alt={hotel?.name || "Hotel"} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase mb-2">{hotel?.name}</h2>
                                    <p className="text-slate-500 font-bold text-sm flex items-center gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-brand-600" />
                                        {hotel?.address}, {hotel?.city}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">Official Receipt</span>
                                        <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full">Guaranteed Stay</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in Date</p>
                                    <p className="text-xl font-black text-slate-900 italic">{formatDate(checkInStr || "")}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">From 02:00 PM</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-out Date</p>
                                    <p className="text-xl font-black text-slate-900 italic">{formatDate(checkOutStr || "")}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Before 11:00 AM</p>
                                </div>
                            </div>
                        </section>

                        {/* Room & Guest Detail */}
                        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-8">Accommodation Details</h3>
                            <div className="space-y-6 mb-12">
                                {selectedRoomsData.map((room, idx) => {
                                    const info = selectedRoomsInfo.find(ri => ri.id === room.id.toString());
                                    const variantIdx = info?.variantIdx ? parseInt(info.variantIdx) : 0;
                                    
                                    // Robust Meal Plan Detection
                                    const variants = (typeof room.variants === 'string' ? safeParse(room.variants, []) : (room.variants || [])).map((v: any) => {
                                        const nameLower = (v.mealPlan || "").toLowerCase();
                                        if (nameLower.includes("room only") || nameLower === "ep" || nameLower === "ep (room only)") {
                                            return { ...v, price: room.pricePerNight };
                                        }
                                        return v;
                                    });
                                    const variant = variants[variantIdx];
                                    const mealPlanStr = (variant?.mealPlan || "").toLowerCase();
                                    const hasBreakfast = mealPlanStr.includes('breakfast') || 
                                                       mealPlanStr.includes('cp') || 
                                                       mealPlanStr.includes('map') || 
                                                       mealPlanStr.includes('ap');
                                    
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black border border-slate-200 shadow-sm group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                                                    {info?.quantity || 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 italic tracking-tight">{room?.name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{room?.bedConfiguration} • {room?.sizeM2}m²</p>
                                                        <span className="text-slate-300">•</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${hasBreakfast ? 'text-blue-600' : 'text-amber-600'}`}>
                                                            {hasBreakfast ? 'Breakfast Included' : 'Room Only'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                 {(room.hasPromotion || coupons.some((c: any) => (c.status === 'active' || c.isActive) && (!c.roomId || String(c.roomId) === String(room.id)))) && (
                                                     <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider rounded leading-none">Promo Price</span>
                                                 )}
                                                 <p className="text-base font-black text-slate-950 italic leading-none">{formatPrice(calculateRoomPrice(room))}</p>
                                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">per night</p>
                                             </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Guest</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <Users className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">{guestsCount} Guests</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">{guestData.firstName} {guestData.lastName}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">{guestData.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">{guestData.countryCode} {guestData.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                {guestData.specialRequests && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Special Requests</h4>
                                        <p className="text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                            "{guestData.specialRequests}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Payment Summary Card */}
                    <div className="relative">
                        <div className="sticky top-12 space-y-8">
                            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50" />
                                
                                <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Payment Summary</h3>
                                
                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">{formatPrice(basePricePerNight)} x {nights} Night{nights > 1 ? 's' : ''}</span>
                                        <span className="text-base font-black text-slate-900">{formatPrice(subtotalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Taxes (GST {Math.round(gstRate * 100)}%)</span>
                                        <span className="text-base font-black text-slate-900">+{formatPrice(taxes)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                        <span className="text-slate-900 font-black text-sm uppercase tracking-widest italic font-bold">Total Amount</span>
                                        <span className="text-2xl font-black text-slate-950 italic">{formatPrice(total)}</span>
                                    </div>

                                    <div className="pt-8 space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-brand-50 rounded-2xl border border-brand-100">
                                            <div>
                                                <p className="text-brand-600 font-black text-[10px] uppercase tracking-widest leading-none mb-1">Payable Now (12%)</p>
                                                <p className="text-[8px] text-brand-400 font-bold uppercase tracking-tight">To secure your reservation</p>
                                            </div>
                                            <span className="text-xl font-black text-brand-700 italic">{formatPrice(Math.round(total * 0.12))}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Pay at Hotel (88%)</span>
                                            <span className="text-lg font-black text-slate-900 italic">{formatPrice(total - Math.round(total * 0.12))}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-xl mb-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Secured Transaction</p>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                                        Your payment of {formatPrice(Math.round(total * 0.12))} has been processed successfully. Please show this receipt at the front desk.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={() => {
                                            const printContent = document.getElementById('invoice-capture');
                                            const originalContent = document.body.innerHTML;
                                            if (printContent) {
                                                document.body.innerHTML = printContent.innerHTML;
                                                window.print();
                                                window.location.reload(); // Refresh to restore state
                                            }
                                        }}
                                        className="w-full py-5 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Receipt
                                    </button>
                                    
                                    {/* Hidden Invoice Template for Printing */}
                                    <div className="hidden">
                                        <div id="invoice-capture">
                                            <InvoiceTemplate booking={currentBooking} />
                                        </div>
                                    </div>
                                    
                                    {/* Quick Message to Property */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message the Property</p>
                                        <div className="relative">
                                            <textarea 
                                                id="quick-message"
                                                placeholder="Ask about early check-in, parking, etc..."
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none transition-all resize-none h-24"
                                            ></textarea>
                                            <button 
                                                onClick={async () => {
                                                    const text = (document.getElementById('quick-message') as HTMLTextAreaElement).value;
                                                    if(!text) return;
                                                    try {
                                                        await messageApi.sendMessage({ hotelId: parseInt(hotelId), content: text });
                                                        alert("Message sent to property! 🚀");
                                                        (document.getElementById('quick-message') as HTMLTextAreaElement).value = '';
                                                    } catch (e) {
                                                        alert("Failed to send message.");
                                                    }
                                                }}
                                                className="absolute bottom-3 right-3 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => router("/my-bookings")}
                                        className="w-full py-5 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-xl hover:border-brand-200 transition-all text-xs uppercase tracking-[0.2em]"
                                    >
                                        Go to My Bookings
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Finalizing dashboard sync...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-4 pb-12">
            <div className="max-w-6xl mx-auto px-6">
                <Link to={hotel ? getHotelUrl(hotel.id, hotel.name) : `/hotel/${hotelId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold text-xs mb-2 transition-colors group uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Hotel
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Booking Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="pt-2">
                            <h2 className="text-sm font-black text-slate-900 mb-6 italic uppercase tracking-[0.1em]">Review Your Selection</h2>
                            
                            <div className="space-y-6">
                                {selectedRoomsData
                                    .filter(room => room && room.id)
                                    .map((room, idx) => {
                                        const info = selectedRoomsInfo.find(ri => ri.id === room.id.toString());
                                        const variantIdx = info?.variantIdx ? parseInt(info.variantIdx) : 0;
                                        
                                        // Robust Meal Plan Detection
                                        const variants = (typeof room.variants === 'string' ? safeParse(room.variants, []) : (room.variants || [])).map((v: any) => {
                                            const nameLower = (v.mealPlan || "").toLowerCase();
                                            if (nameLower.includes("room only") || nameLower === "ep" || nameLower === "ep (room only)") {
                                                return { ...v, price: room.pricePerNight };
                                            }
                                            return v;
                                        });
                                        const variant = variants[variantIdx];
                                        const mealPlanStr = (variant?.mealPlan || "").toLowerCase();
                                        const hasBreakfast = mealPlanStr.includes('breakfast') || 
                                                           mealPlanStr.includes('cp') || 
                                                           mealPlanStr.includes('map') || 
                                                           mealPlanStr.includes('ap');
                                        
                                    return (
                                        <div key={room.id} className="flex flex-col md:flex-row gap-6 py-6 border-b border-slate-200/50 last:border-0 relative overflow-hidden group">
                                            <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-sm">
                                                <Image 
                                                    src={safeParse(room?.images || room?.room_images)?.[0] || room?.thumbnail || hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                                                    alt="Room" 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-900 italic tracking-tight">{room.name}</h3>
                                                        <p className="text-xs text-slate-500 font-bold mt-0.5">{room.bedConfiguration} • {room.sizeM2}m²</p>
                                                    </div>
                                                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</p>
                                                        <p className="text-sm font-black text-slate-900">{info?.quantity || 1}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Free Cancellation</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 ${hasBreakfast ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {hasBreakfast ? 'Breakfast Included' : 'Room Only'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 focus-within:border-brand-500 transition-all">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <Calendar className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stayType === 'hourly' ? 'Arrival Date' : 'Check-in'}</p>
                                        <input 
                                            type="date" 
                                            value={checkIn}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {stayType === 'hourly' ? (
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 focus-within:border-brand-500 transition-all">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <Phone className="w-5 h-5 text-brand-600" /> {/* Clock icon ideally, using Phone as placeholder if Clock not imported */}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Arrival Time</p>
                                            <select 
                                                value={arrivalTime}
                                                onChange={(e) => setArrivalTime(e.target.value)}
                                                className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none"
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => {
                                                    const hour = i.toString().padStart(2, '0');
                                                    return (
                                                        <Fragment key={i}>
                                                            <option value={`${hour}:00`}>{hour}:00</option>
                                                            <option value={`${hour}:30`}>{hour}:30</option>
                                                        </Fragment>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 focus-within:border-brand-500 transition-all">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <Calendar className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-out</p>
                                            <input 
                                                type="date" 
                                                value={checkOut}
                                                min={checkIn || new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {stayType === 'hourly' && (
                                <div className="mt-4 p-5 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <TrendingUp className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-0.5">Selected Slot</p>
                                            <p className="text-sm font-black text-slate-900">{duration} Hours Stay</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['3', '6', '12'].map(d => (
                                            <button 
                                                key={d}
                                                onClick={() => setDuration(d)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    duration === d ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "bg-white text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                {d}H
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="pt-6">
                            <h2 className="text-lg font-black text-slate-900 mb-6 italic uppercase tracking-tight">Guest Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Shriyansh"
                                        value={guestData.firstName}
                                        onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Kumar"
                                        value={guestData.lastName}
                                        onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email"
                                        placeholder="shriyansh@example.com"
                                        value={guestData.email}
                                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="flex gap-1.5">
                                            <select 
                                                value={guestData.countryCode}
                                                onChange={(e) => setGuestData({ ...guestData, countryCode: e.target.value })}
                                                className="w-20 px-2 py-4 bg-white border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all appearance-none cursor-pointer text-center shadow-sm"
                                            >
                                            {/* Put India at top, then others sorted */}
                                            {countries
                                                .sort((a, b) => {
                                                    if (a.name === "India") return -1;
                                                    if (b.name === "India") return 1;
                                                    return a.name.localeCompare(b.name);
                                                })
                                                .map(c => (
                                                    <option key={c.name} value={c.code}>
                                                        {c.flag} {c.code}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <input 
                                            type="tel"
                                            placeholder="XXXXX XXXXX"
                                            value={guestData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                if (val.length <= 15) {
                                                    setGuestData({ ...guestData, phone: val });
                                                }
                                            }}
                                            className="flex-1 px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Requests (Optional)</label>
                                <textarea 
                                    placeholder="e.g. Early check-in, Airport pickup, Flower decoration..."
                                    value={guestData.specialRequests}
                                    onChange={(e) => setGuestData({ ...guestData, specialRequests: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all min-h-[100px] resize-none shadow-sm"
                                />
                                <p className="text-[9px] text-slate-400 font-medium italic">We will do our best to accommodate your special requests!</p>
                            </div>

                            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={guestData.isBusinessTrip}
                                        onChange={(e) => setGuestData({ ...guestData, isBusinessTrip: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-600"
                                    />
                                    <span className="text-sm font-bold text-slate-700">This is a business trip (Add GST Details)</span>
                                </label>
                                
                                {guestData.isBusinessTrip && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number</label>
                                            <input 
                                                type="text"
                                                placeholder="22AAAAA0000A1Z5"
                                                value={guestData.gstNumber}
                                                onChange={(e) => setGuestData({ ...guestData, gstNumber: e.target.value })}
                                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-brand-600 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                            <input 
                                                type="text"
                                                placeholder="Luxe Hotels Pvt Ltd"
                                                value={guestData.companyName}
                                                onChange={(e) => setGuestData({ ...guestData, companyName: e.target.value })}
                                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-brand-600 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                <span className="font-black">Cancellation Policy:</span> Free cancellation up to 24 hours before check-in. After that, 100% of the first night will be charged.
                            </p>
                        </div>
                    </div>

                    {/* Right: Price Summary */}
                    <div className="relative">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-brand-500/10 border border-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50" />
                                
                                <h3 className="text-xl font-black text-slate-900 mb-6 italic uppercase tracking-tight">Price Summary</h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-550 font-bold flex items-center gap-1.5">
                                            {(validRooms.some(r => r.hasPromotion) || coupons.some((c: any) => c.status === 'active' || c.isActive)) ? (
                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider rounded">Promo Price</span>
                                            ) : (
                                                <span>Room price</span>
                                            )}
                                            <span>({formatPrice(basePricePerNight)} x {nights || 1} nights)</span>
                                        </span>
                                        <span className="text-slate-900 font-black">{formatPrice(subtotalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold">GST ({Math.round(gstRate * 100)}%)</span>
                                        <span className="text-base font-black text-slate-900">+{formatPrice(taxes)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Grand Total</span>
                                            <span className="text-2xl font-black text-slate-950 tracking-tighter">{formatPrice(total)}</span>
                                        </div>
                                        
                                        <div className="bg-brand-600 rounded-[24px] p-5 text-white shadow-xl shadow-brand-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Payable Now (12%)</span>
                                                <span className="text-xl font-black italic">{formatPrice(Math.round(total * 0.12))}</span>
                                            </div>
                                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">To confirm your reservation</p>
                                        </div>

                                        <div className="flex justify-between items-center px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pay at Hotel (88%)</span>
                                            <span className="text-sm font-black text-slate-900 italic">{formatPrice(total - Math.round(total * 0.12))}</span>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingLoading}
                                    className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-200 flex flex-col items-center justify-center gap-0.5 text-lg uppercase tracking-tight relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    {bookingLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                                    ) : (
                                        <>
                                            <span className="relative z-10">Pay {formatPrice(Math.round(total * 0.12))} Now</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 relative z-10 transition-opacity">Confirm & Secure Stay</span>
                                        </>
                                    )}
                                </button>
                                
                                <p className="mt-4 text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                                    Safe & Secure Payments by GetHotel
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function BookingIDPage() {
    return (
        <Suspense fallback={<Loader variant="fullscreen" text="Loading..." />}>
            <BookingContent />
        </Suspense>
    );
}
