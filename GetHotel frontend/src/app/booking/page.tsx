"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { hotelApi } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";

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
    const searchParams = useSearchParams();

    // Read all params from URL (set by SearchBar, PriceBox, or "Select Room" button)
    const hotelId = searchParams.get("hotelId") || "";
    const roomId = searchParams.get("roomId") || null;
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guestsParam = parseInt(searchParams.get("guests") || "2", 10);

    const [hotel, setHotel] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!hotelId) return;
            try {
                setLoadingData(true);
                const hotelRes = await hotelApi.getHotel(hotelId);
                setHotel(hotelRes.data);

                if (roomId) {
                    const roomsRes = await hotelApi.getRooms(hotelId);
                    const room = roomsRes.data?.find((r: any) => String(r.id) === String(roomId));
                    setSelectedRoom(room);
                }
            } catch (err) {
                console.error("Failed to fetch booking data:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [hotelId, roomId]);

    const pricePerNight =
        selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0;
    const roomName = selectedRoom?.name ?? "Standard Room";

    // Compute nights dynamically from URL params
    const nights = (() => {
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

    const subtotal = pricePerNight * nights;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + taxes;

    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
    const [booked, setBooked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const onSubmit = async () => {
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 1500));
        setIsSubmitting(false);
        setBooked(true);
    };

    if (loadingData) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-surface-secondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest italic">Securing your suite...</p>
                </div>
            </div>
        );
    }

    if (!hotelId) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-surface-secondary text-center px-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Booking Request</h1>
                    <p className="text-slate-500 mb-6">Please select a hotel first to proceed with booking.</p>
                    <Link href="/hotels" className="btn-primary inline-block">Browse Hotels</Link>
                </div>
            </div>
        );
    }

    if (booked) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-surface-secondary">
                <div className="max-w-md w-full mx-auto text-center px-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
                        <Check className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed! 🎉</h1>
                    <p className="text-slate-500 mb-6">
                        Your booking at <strong>{hotel?.name}</strong> has been confirmed. A
                        confirmation email has been sent to your inbox.
                    </p>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 text-left mb-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Confirmation Code</span>
                            <span className="font-mono font-bold text-brand-700">{confirmCode}</span>
                        </div>
                        {checkIn && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Check-in</span>
                                <span className="font-semibold text-slate-900">{formatDate(checkIn)}</span>
                            </div>
                        )}
                        {checkOut && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Check-out</span>
                                <span className="font-semibold text-slate-900">{formatDate(checkOut)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                            <span className="font-bold text-slate-900">Total Paid</span>
                            <span className="font-bold text-slate-900">{formatPrice(total)}</span>
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        View My Bookings <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-secondary pt-24 pb-24">
            <div className="container-page">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link
                        href={hotel ? `/hotel/${hotel.id}` : "/hotels"}
                        className="hover:text-brand-600 transition-colors"
                    >
                        {hotel?.name ?? "Hotel"}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-900 font-medium">Book Now</span>
                </nav>

                <h1 className="text-2xl font-bold text-slate-900 mb-8">Complete Your Booking</h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Guest Details */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-5">Guest Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            rows={3}
                                            placeholder="Early check-in, high floor, extra towels..."
                                            className={inputClass(false) + " resize-none"}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-brand-600" />
                                    Payment Method
                                </h2>

                                {/* Method Tabs */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { value: "card", icon: CreditCard, label: "Credit / Debit" },
                                        { value: "upi", icon: Smartphone, label: "UPI" },
                                        { value: "netbanking", icon: Building2, label: "Net Banking" },
                                    ].map(({ value, icon: Icon, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setPaymentMethod(value as typeof paymentMethod)
                                            }
                                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border text-sm font-medium transition-all ${paymentMethod === value
                                                    ? "border-brand-600 bg-brand-50 text-brand-700"
                                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === "card" && (
                                    <div className="space-y-4">
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Expiry">
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
                                    <div>
                                        <FormField label="UPI ID">
                                            <input
                                                placeholder="yourname@upi"
                                                className={inputClass(false)}
                                            />
                                        </FormField>
                                        <p className="text-xs text-slate-400 mt-2">
                                            You will receive a payment request on your UPI app. Complete
                                            payment within 5 minutes.
                                        </p>
                                    </div>
                                )}
                                {paymentMethod === "netbanking" && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Other"].map(
                                            (bank) => (
                                                <button
                                                    key={bank}
                                                    type="button"
                                                    className="p-3 rounded-2xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-sm font-medium text-slate-700 transition-all"
                                                >
                                                    {bank}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-5 text-xs text-slate-400">
                                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                                    256-bit SSL encryption · Your payment is 100% secure
                                </div>
                            </div>
                        </div>

                        {/* Right: Booking Summary */}
                        <div>
                            <div className="sticky top-24 space-y-4">
                                {/* Hotel Info */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5">
                                    <h2 className="text-base font-bold text-slate-900 mb-4">
                                        Booking Summary
                                    </h2>
                                    {hotel && (
                                        <div className="flex gap-3 mb-4 pb-4 border-b border-slate-50">
                                            <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                                                <Image
                                                    src={hotel.thumbnail || "/placeholder-hotel.jpg"}
                                                    alt={hotel.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 line-clamp-2">
                                                    {hotel.name}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {hotel.city}, {hotel.country}
                                                </p>
                                                <div className="flex items-center gap-0.5 mt-1">
                                                    {Array.from({ length: Math.max(0, Math.floor(Number(hotel.starRating) || 0)) }).map((_, i) => (
                                                        <span key={i} className="text-gold-400 text-xs">★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stay Details from URL params */}
                                    <div className="space-y-2.5 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                                            <span>
                                                {checkIn && checkOut
                                                    ? `${formatDate(checkIn)} → ${formatDate(checkOut)}`
                                                    : "Dates not selected"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Users className="w-4 h-4 text-brand-400 shrink-0" />
                                            <span>{guestsParam} {guestsParam === 1 ? "Guest" : "Guests"}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                                            Room: <span className="font-semibold">{roomName}</span>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">
                                                {formatPrice(pricePerNight)} × {nights} nights
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Taxes & Fees (12%)</span>
                                            <span className="font-semibold text-slate-900">
                                                {formatPrice(taxes)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-100">
                                            <span className="font-bold text-slate-900 text-base">Total</span>
                                            <span className="text-xl font-bold text-slate-900">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="bg-emerald-50 rounded-2xl p-4 space-y-2">
                                    {[
                                        "Free cancellation up to 24h before check-in",
                                        "No hidden charges — pay now, stay easy",
                                        "Instant booking confirmation via email",
                                    ].map((b) => (
                                        <div
                                            key={b}
                                            className="flex items-start gap-2 text-xs text-emerald-700"
                                        >
                                            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            {b}
                                        </div>
                                    ))}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            Confirm Booking — {formatPrice(total)}
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-400">
                                    By confirming, you agree to our{" "}
                                    <a href="#" className="underline hover:text-brand-600">Terms</a> and{" "}
                                    <a href="#" className="underline hover:text-brand-600">Privacy Policy</a>
                                </p>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border rounded-xl outline-none transition-all placeholder-slate-400 ${hasError
        ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
        : "border-slate-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-100 focus:bg-white"
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
