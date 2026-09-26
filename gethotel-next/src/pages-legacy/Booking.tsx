'use client';
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
    Clock,
    Compass
} from "lucide-react";
import { hotelApi, couponApi, bookingApi, paymentApi } from "@/lib/api";
import { formatPrice, formatDate, safeParse } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import SEOHead from "@/components/common/SEOHead";
import { validateCoupon } from "@/lib/promoUtils";
import { loadRazorpay } from "@/lib/load-razorpay";

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
type PaymentMode = "pay_deposit" | "pay_at_hotel" | "pay_full_online";

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

    // Read all params (Both Hotel & Tour Package)
    const isPackage = searchParams.get("type") === "package" || !!searchParams.get("packageId");
    const packageId = searchParams.get("packageId") || "pkg-1";
    const packageTitle = searchParams.get("title") || searchParams.get("name") || "Tour Package Booking";
    const packageDestination = searchParams.get("destination") || "India";
    const packageTotalAmount = parseFloat(searchParams.get("totalAmount") || searchParams.get("price") || "15000");
    const packageTravelers = parseInt(searchParams.get("travelers") || searchParams.get("guests") || "2", 10);
    const packageCheckIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];

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
    const [selectedRoomsData, setSelectedRoomsData] = useState<Array<{
        room: any;
        variantIdx: string;
        quantity: number;
        selectedVariant?: any;
        pricePerNight: number;
    }>>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [booked, setBooked] = useState(false);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("pay_deposit");
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
                basePrice: isPackage ? packageTotalAmount : (pricePerNight || 0) * nights,
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
            if (isPackage) {
                setHotel({
                    id: packageId,
                    name: packageTitle,
                    city: packageDestination,
                    address: packageDestination,
                    thumbnail: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
                    isPackage: true
                });
                const pkgRoom = {
                    id: packageId,
                    name: `${packageTitle} (${packageTravelers} Guests)`,
                    pricePerNight: packageTotalAmount,
                    selectedVariant: { price: packageTotalAmount, name: `${packageTravelers} Travelers Package` }
                };
                setSelectedRoom(pkgRoom);
                setSelectedRoomsData([{
                    room: pkgRoom,
                    variantIdx: "0",
                    quantity: 1,
                    selectedVariant: pkgRoom.selectedVariant,
                    pricePerNight: packageTotalAmount
                }]);
                setLoadingData(false);
                return;
            }

            if (!hotelId) {
                router("/");
                return;
            }
            try {
                setLoadingData(true);
                const hotelRes = await hotelApi.getHotel(hotelId);
                const hotelData = hotelRes.data;
                setHotel(hotelData);

                // Parse multiple selected rooms from searchParams (e.g. room_135_0=2)
                const selectedRoomsInfo: { id: string; variantIdx?: string; quantity: number }[] = [];
                searchParams.forEach((val, key) => {
                    if (key.startsWith('room_')) {
                        const rawId = key.replace('room_', '');
                        const parts = rawId.split('_');
                        const qty = parseInt(val, 10);
                        if (qty > 0) {
                            selectedRoomsInfo.push({
                                id: parts[0],
                                variantIdx: parts[1] || "0",
                                quantity: qty
                            });
                        }
                    }
                });

                let targetRoomId = roomId;
                let targetVariantIndex = variantParam;
                if (selectedRoomsInfo.length === 0 && targetRoomId) {
                    selectedRoomsInfo.push({
                        id: String(targetRoomId),
                        variantIdx: String(targetVariantIndex || "0"),
                        quantity: 1
                    });
                }

                const params: any = {};
                if (checkIn) params.checkIn = checkIn;
                if (checkOut) params.checkOut = checkOut;
                const roomsRes = await hotelApi.getRooms(hotelId, params);
                const allRooms = roomsRes.data || hotelData?.room || hotelData?.rooms || [];

                const loadedRoomsData: any[] = [];
                for (const info of selectedRoomsInfo) {
                    const foundRoom = allRooms.find((r: any) => String(r.id) === String(info.id));
                    if (foundRoom) {
                        const variants = safeParse(foundRoom.variants || foundRoom.room_variants, []);
                        const vIndex = parseInt(info.variantIdx || "0");
                        const selectedVariant = variants && variants[vIndex] ? variants[vIndex] : null;
                        const roomPolicies = safeParse(foundRoom.roomPolicies || foundRoom.room_policies || foundRoom.policies, {});

                        const basePrice = selectedVariant?.price ? parseFloat(selectedVariant.price) : (foundRoom.pricePerNight ?? hotelData?.pricePerNight ?? 0);
                        const priceDiff = foundRoom.dynamicPricePerNight ? (foundRoom.dynamicPricePerNight - foundRoom.pricePerNight) : 0;

                        loadedRoomsData.push({
                            room: { ...foundRoom, roomPolicies },
                            variantIdx: info.variantIdx || "0",
                            quantity: info.quantity,
                            selectedVariant,
                            pricePerNight: basePrice + priceDiff
                        });
                    }
                }

                if (loadedRoomsData.length === 0 && allRooms.length > 0) {
                    const fallbackRoom = allRooms[0];
                    const variants = safeParse(fallbackRoom.variants || fallbackRoom.room_variants, []);
                    const selectedVariant = variants && variants[0] ? variants[0] : null;
                    const basePrice = selectedVariant?.price ? parseFloat(selectedVariant.price) : (fallbackRoom.pricePerNight ?? hotelData?.pricePerNight ?? 0);
                    const priceDiff = fallbackRoom.dynamicPricePerNight ? (fallbackRoom.dynamicPricePerNight - fallbackRoom.pricePerNight) : 0;
                    
                    loadedRoomsData.push({
                        room: fallbackRoom,
                        variantIdx: "0",
                        quantity: 1,
                        selectedVariant,
                        pricePerNight: basePrice + priceDiff
                    });
                }

                setSelectedRoomsData(loadedRoomsData);
                if (loadedRoomsData.length > 0) {
                    setSelectedRoom(loadedRoomsData[0].room);
                }

                const couponRes = await couponApi.getCoupons(hotelData.id);
                if (couponRes && Array.isArray(couponRes.data)) {
                    const activeCoupons = couponRes.data.filter((c: any) => c.isActive);
                    setCoupons(activeCoupons);

                    const d1 = new Date(checkIn);
                    const d2 = new Date(checkOut);
                    const stayNights = isNaN(d1.getTime()) || isNaN(d2.getTime()) ? 1 : Math.max(1, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                    
                    const resolvedRoom = loadedRoomsData[0]?.room || hotelData?.room?.[0] || hotelData?.rooms?.[0];
                    const roomBase = loadedRoomsData[0]?.pricePerNight || (resolvedRoom?.pricePerNight ?? hotelData?.pricePerNight ?? 0);
                    const calculatedBasePrice = roomBase * stayNights;

                    const stayDetailsForAutoApply = {
                        checkIn,
                        checkOut,
                        basePrice: calculatedBasePrice,
                        nights: stayNights,
                        roomId: resolvedRoom?.id
                    };

                    const validCoupons = activeCoupons.filter((c: any) => validateCoupon(c, stayDetailsForAutoApply).valid);
                    validCoupons.sort((a: any, b: any) => Number(b.discountValue) - Number(a.discountValue));
                    
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
    }, [hotelId, roomId, searchParams, router, isPackage, packageId, packageTitle, packageDestination, packageTotalAmount, packageTravelers]);

    const nights = isPackage ? 1 : (isHourly ? 1 : (() => {
        if (!checkIn || !checkOut || checkIn === "Dates") return 1;
        try {
            const d1 = new Date(checkIn);
            const d2 = new Date(checkOut);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
            const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
            return Math.max(1, Math.floor(diff));
        } catch (e) { return 1; }
    })());

    const pricePerNight = isPackage ? packageTotalAmount : (isHourly 
        ? (safeParse(selectedRoom?.hourlyRates || selectedRoom?.hourly_rates, {})[duration] || (selectedRoom?.pricePerNight ? selectedRoom.pricePerNight / 2 : (hotel?.pricePerNight ? hotel.pricePerNight / 2 : 0)))
        : (() => {
            const basePrice = selectedRoom?.selectedVariant?.price ? parseFloat(selectedRoom.selectedVariant.price) : (selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0);
            const priceDiff = selectedRoom?.dynamicPricePerNight ? (selectedRoom.dynamicPricePerNight - selectedRoom.pricePerNight) : 0;
            return basePrice + priceDiff;
        })());
    
    const mealPlanLabel = isPackage ? "All Inclusions Included" : (isHourly 
        ? `${duration} Hours Stay`
        : selectedRoom?.selectedVariant 
            ? (selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('breakfast') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('cp') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('map') || 
               selectedRoom.selectedVariant.mealPlan?.toLowerCase().includes('ap') 
                ? "With Breakfast" 
                : "Without Breakfast")
            : "Room Only");

    const calculatePrice = () => {
        if (isPackage) {
            const baseSubtotal = packageTotalAmount;
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
            const taxes = 0;
            const total = discountedSubtotal;
            const platformFee = Math.round(total * 0.12);
            const payAtHotel = total - platformFee;
            return { baseSubtotal, discount, discountedSubtotal, taxes, total, platformFee, payAtHotel, gstRate: 0, totalRoomsCount: 1 };
        }

        let baseSubtotal = 0;
        let totalRoomsCount = 0;

        if (selectedRoomsData.length > 0) {
            selectedRoomsData.forEach(item => {
                let itemNightPrice = item.pricePerNight;
                if (isHourly) {
                    const hourlyRates = safeParse(item.room?.hourlyRates || item.room?.hourly_rates, {});
                    itemNightPrice = hourlyRates[duration] || (item.room?.pricePerNight ? item.room.pricePerNight / 2 : 0);
                }
                const itemTotal = itemNightPrice * item.quantity * (isHourly ? 1 : nights);
                baseSubtotal += itemTotal;
                totalRoomsCount += item.quantity;
            });
        } else {
            baseSubtotal = (pricePerNight || 0) * nights;
            totalRoomsCount = 1;
        }
        
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
        
        const totalRoomNights = (totalRoomsCount || 1) * (isHourly ? 1 : nights);
        const averagePricePerRoomNight = discountedSubtotal / (totalRoomNights || 1);

        let gstRate = 0.05;
        if (averagePricePerRoomNight <= 1000) {
            gstRate = 0;
        } else if (averagePricePerRoomNight <= 7500) {
            gstRate = 0.05;
        } else {
            gstRate = 0.18;
        }

        const taxes = Math.round(discountedSubtotal * gstRate);
        const total = discountedSubtotal + taxes;
        const platformFee = Math.round(total * 0.12); // 12% Deposit Online
        const payAtHotel = total - platformFee; // 88% Balance at Hotel

        return { 
            baseSubtotal, 
            discount, 
            discountedSubtotal, 
            taxes, 
            total, 
            platformFee, 
            payAtHotel, 
            gstRate, 
            totalRoomsCount, 
            averagePricePerRoomNight 
        };
    };

    const priceDetails = calculatePrice();

    const getPayNowAmount = () => {
        if (paymentMode === "pay_at_hotel") return 0;
        if (paymentMode === "pay_full_online") return priceDetails.total;
        return priceDetails.platformFee; // pay_deposit
    };

    const getPayAtHotelAmount = () => {
        if (paymentMode === "pay_at_hotel") return priceDetails.total;
        if (paymentMode === "pay_full_online") return 0;
        return priceDetails.payAtHotel; // pay_deposit
    };

    const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
        defaultValues: {
            firstName: (user as any)?.firstName || (user?.name ? user.name.split(' ')[0] : ""),
            lastName: (user as any)?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ""),
            email: user?.email || "",
            phone: (user as any)?.phone || "",
            country: "India"
        },
    });

    const onSubmit = async (data: GuestFormData) => {
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
            } else { // pay_deposit
                bookingStatus = 'held';
                bookingPaymentStatus = 'partial';
                amountPaid = priceDetails.platformFee;
            }

            if (isPackage) {
                // Tour Package Booking Flow
                const packageBookingObj = {
                    id: "PKG-GHS-" + Math.floor(100000 + Math.random() * 900000),
                    packageId,
                    title: packageTitle,
                    destination: packageDestination,
                    checkIn: packageCheckIn,
                    travelers: packageTravelers,
                    totalAmount: priceDetails.total,
                    amountPaid,
                    status: bookingStatus,
                    paymentStatus: bookingPaymentStatus,
                    guestInfo: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: data.phone,
                        country: data.country,
                        specialRequests: data.specialRequests || ""
                    },
                    createdAt: new Date().toISOString()
                };

                const existingBookings = JSON.parse(localStorage.getItem("ghs_user_bookings") || "[]");
                existingBookings.push(packageBookingObj);
                localStorage.setItem("ghs_user_bookings", JSON.stringify(existingBookings));

                setShowConfirmAnimation(true);
                setBooked(true);
                setIsSubmitting(false);
                setRedirectUrl(`/my-bookings`);
                return;
            }

            const roomsPayload = selectedRoomsData.length > 0
                ? selectedRoomsData.map(item => ({
                    id: String(item.room.id),
                    quantity: item.quantity,
                    variantIdx: String(item.variantIdx || "0")
                }))
                : [{ id: String(selectedRoom?.id), quantity: 1, variantIdx: variantParam || "0" }];

            const bookingData: any = {
                hotelId: parseInt(hotelId),
                rooms: roomsPayload,
                checkIn,
                checkOut,
                totalGuests: guestsParam,
                status: bookingStatus,
                paymentStatus: bookingPaymentStatus,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                amountPaid,
                arrivalTime: arrivalTime || undefined,
                stayType,
                duration,
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
                    localStorage.setItem("active_checkout_booking_id", booking.id.toString());
                    localStorage.setItem("active_checkout_booking_time", Date.now().toString());

                    try {
                        await loadRazorpay()
                        const orderRes = await paymentApi.createOrder(booking.id);
                        
                        const options = {
                            key: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID) || "rzp_live_T16NuPtvvs9cRV",
                            amount: orderRes.amount,
                            currency: orderRes.currency,
                            name: "GetHotelStays.",
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
                                    alert("Payment was cancelled. You can retry from your bookings dashboard.");
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
                        alert(paymentError.message || "Failed to initialize payment gateway.");
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
        <div className="min-h-screen pt-20 bg-slate-50 text-center p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase">Booking Confirmed!</h1>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    Your {isPackage ? "tour package" : "stay"} <strong>{isPackage ? packageTitle : hotel?.name}</strong> has been successfully booked.
                </p>
                <Link to={isPackage ? "/my-bookings" : "/hotels"} className="inline-block w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md shadow-brand-600/20 transition-all">
                    View My Bookings
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-6 sm:pt-10 pb-16 sm:pb-20 font-sans text-slate-900">
            <SEOHead title="Complete Booking | GetHotelStays" description="Complete your booking securely." noIndex />
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-brand-600">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] sm:text-[10px]">1</div>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
                    {/* Left Sidebar Summary - Directly on background without cards */}
                    <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
                        {/* 1. Selected Package / Property */}
                        <div className="space-y-5 pb-6 border-b border-slate-200/80">
                            <div className="flex items-center gap-3.5">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                                    <Image 
                                        src={isPackage ? "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80" : (selectedRoom ? (getImages(selectedRoom.images)[0] || selectedRoom.thumbnail) : (hotel?.thumbnail || "/placeholder-hotel.jpg"))} 
                                        alt={isPackage ? packageTitle : (hotel?.name || "Hotel")} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute bottom-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white rounded-md text-[9px] font-black">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span>{hotel?.starRating || hotel?.rating || "4.8"}</span>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest block mb-0.5">
                                        {isPackage ? "Selected Tour Package" : "Selected Property"}
                                    </span>
                                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug line-clamp-2 uppercase">
                                        {isPackage ? packageTitle : (hotel?.name || "Loading...")}
                                    </h2>
                                    <p className="text-[11px] text-slate-500 font-bold leading-tight flex items-center gap-1 mt-1 truncate">
                                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                        <span className="truncate">{isPackage ? packageDestination : (hotel?.address || "Address loading...")}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Inclusions & Room Info */}
                            <div className="space-y-3 pt-1">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                        {isPackage ? "Package Inclusions" : "Selected Rooms"}
                                    </span>
                                    {isPackage ? (
                                        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                                            {packageTitle} ({packageTravelers} Guests)
                                        </h3>
                                    ) : selectedRoomsData.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRoomsData.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-xs font-bold text-slate-900 bg-white/60 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                                                    <div>
                                                        <div className="font-black text-slate-900">{item.quantity} x {item.room?.name || "Room"}</div>
                                                        {item.selectedVariant?.name && (
                                                            <div className="text-[10px] text-slate-500 font-medium">{item.selectedVariant.name}</div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-black text-brand-600 shrink-0 ml-2">
                                                        ₹{(item.pricePerNight * item.quantity * nights).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                                            {selectedRoom?.name || "Room Selection"}
                                        </h3>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                        <Users className="w-3.5 h-3.5 text-brand-600" /> {isPackage ? packageTravelers : guestsParam} Guest(s)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5 text-brand-600" /> {isPackage ? formatDate(packageCheckIn) : (isHourly ? `${duration} Hrs` : `${nights} Night(s) • ${priceDetails.totalRoomsCount} Room(s)`)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50/70 rounded-lg border border-brand-100 text-brand-700 w-fit">
                                    <Check className="w-3.5 h-3.5 shrink-0 text-brand-600" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{mealPlanLabel}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Booking Summary - Directly on background */}
                        <div className="space-y-4 pt-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking Summary</h3>
                            <div className="space-y-2.5 text-xs font-semibold">
                                <div className="flex justify-between text-slate-600">
                                    <span>Rate ({priceDetails.totalRoomsCount} Room(s) × {isPackage ? 'Package' : (isHourly ? `${duration} Hrs` : `${nights} Night(s)`)})</span>
                                    <span>₹{priceDetails.baseSubtotal.toLocaleString()}</span>
                                </div>
                                {priceDetails.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{priceDetails.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600 items-center">
                                    <span className="flex items-center gap-1.5">
                                        Taxes & GST 
                                        {priceDetails.gstRate > 0 && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-brand-50 text-brand-700 font-black rounded border border-brand-100">
                                                {Math.round(priceDetails.gstRate * 100)}% GST
                                            </span>
                                        )}
                                    </span>
                                    <span>₹{priceDetails.taxes.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200/80 text-slate-900 font-black">
                                    <span>Total Payable</span>
                                    <span className="text-xl sm:text-2xl text-brand-600 font-black">₹{priceDetails.total.toLocaleString()}</span>
                                </div>

                                {/* Dynamic Payment Breakdown */}
                                {!isPackage && (
                                    <div className="pt-3 border-t border-slate-200/80 space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                            <span>Amount to Pay Now</span>
                                            <span className="text-brand-600 font-black text-sm">₹{getPayNowAmount().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                            <span>Balance at Hotel</span>
                                            <span className="text-slate-600 font-black">₹{getPayAtHotelAmount().toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content Form - Directly on background */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* 1. Enter Guest Details */}
                            <div className="space-y-5 pb-8 border-b border-slate-200/80">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Enter Guest Details</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Please provide primary traveler contact information for voucher and confirmation.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">First name *</label>
                                        <input {...register("firstName")} className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-bold shadow-2xs" />
                                        {errors.firstName && <p className="text-[10px] text-red-500 font-bold">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Last name *</label>
                                        <input {...register("lastName")} className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-bold shadow-2xs" />
                                        {errors.lastName && <p className="text-[10px] text-red-500 font-bold">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Email address *</label>
                                        <input {...register("email")} className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-bold shadow-2xs" />
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Country/Region *</label>
                                        <select {...register("country")} className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-bold shadow-2xs">
                                            {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Phone number *</label>
                                        <input {...register("phone")} className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-bold shadow-2xs" />
                                        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone.message}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-900 uppercase">Special Requests (optional)</label>
                                        <textarea {...register("specialRequests")} rows={3} placeholder="Any special requests for your trip..." className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-xs sm:text-sm font-medium resize-none shadow-2xs" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Payment Method Selection - Directly on background */}
                            <div className="space-y-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Payment Option</h3>
                                    {isPackage && (
                                        <span className="px-3 py-1 bg-brand-50 text-brand-700 font-black text-[10px] uppercase tracking-wider rounded-lg border border-brand-200">
                                            100% Full Prepaid Tour
                                        </span>
                                    )}
                                </div>

                                {isPackage ? (
                                    /* TOUR PACKAGES REQUIRE FULL ONLINE PREPAID ONLY */
                                    <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/60 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black text-slate-900 uppercase">
                                                Full Online Prepaid Payment
                                            </span>
                                            <Check className="w-4 h-4 text-brand-600" />
                                        </div>
                                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                            All tour packages require 100% full online prepaid payment via UPI / Cards / Netbanking for instant confirmation & hotel voucher issuance.
                                        </p>
                                    </div>
                                ) : (
                                    /* HOTELS SUPPORT DEPOSIT, FULL ONLINE & PAY AT HOTEL MODES */
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* Option 1: 12% Deposit */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode("pay_deposit")}
                                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                paymentMode === "pay_deposit"
                                                    ? "border-brand-600 bg-brand-50/70 shadow-xs"
                                                    : "border-slate-200/90 bg-white/80 hover:border-slate-300"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-black text-slate-900 uppercase">Pay 12% Deposit</span>
                                                    {paymentMode === "pay_deposit" && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-normal mb-3">
                                                    Pay ₹{priceDetails.platformFee.toLocaleString()} now to reserve. Pay remaining balance at hotel.
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-brand-700 uppercase bg-brand-100/70 px-2 py-1 rounded-lg w-fit">
                                                Deposit ₹{priceDetails.platformFee.toLocaleString()}
                                            </span>
                                        </button>

                                        {/* Option 2: Pay Full Online */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode("pay_full_online")}
                                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                paymentMode === "pay_full_online"
                                                    ? "border-brand-600 bg-brand-50/70 shadow-xs"
                                                    : "border-slate-200/90 bg-white/80 hover:border-slate-300"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-black text-slate-900 uppercase">Pay Full Online</span>
                                                    {paymentMode === "pay_full_online" && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-normal mb-3">
                                                    Instant online confirmation via UPI / Cards / Netbanking.
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-100/70 px-2 py-1 rounded-lg w-fit">
                                                Pay ₹{priceDetails.total.toLocaleString()} Now
                                            </span>
                                        </button>

                                        {/* Option 3: Pay at Hotel */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode("pay_at_hotel")}
                                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                paymentMode === "pay_at_hotel"
                                                    ? "border-brand-600 bg-brand-50/70 shadow-xs"
                                                    : "border-slate-200/90 bg-white/80 hover:border-slate-300"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-black text-slate-900 uppercase">Pay at Hotel</span>
                                                    {paymentMode === "pay_at_hotel" && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-normal mb-3">
                                                    Reserve now for ₹0 online. Pay total amount at hotel upon departure.
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase bg-slate-200/80 px-2 py-1 rounded-lg w-fit">
                                                Pay ₹0 Now
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 3. Submit Button - Logo Dot Brand Blue Color */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing Booking...</span>
                                    </>
                                ) : (
                                    <span>
                                        {isPackage || paymentMode === "pay_full_online"
                                            ? `Complete Booking • Pay ₹${priceDetails.total.toLocaleString()} Online`
                                            : paymentMode === "pay_deposit"
                                            ? `Complete Booking • Pay ₹${priceDetails.platformFee.toLocaleString()} Deposit`
                                            : `Reserve Room • Pay ₹${priceDetails.total.toLocaleString()} at Hotel`}
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Booking() {
    return (
        <Suspense fallback={<Loader variant="fullscreen" text="Loading booking..." />}>
            <BookingContent />
        </Suspense>
    );
}
