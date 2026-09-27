'use client';


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "@/components/common/Loader";
import Image from "@/components/common/Image";
import {
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    ChevronRight,
    Hotel,
    Loader2,
    Ticket,
    AlertCircle,
    Shield,
    X,
    Check,
    Users,
    Car,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { bookingApi, paymentApi } from "@/lib/api";
import { formatPrice, formatDate, cn, safeParse, getHotelUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            let localPackages: any[] = [];
            try {
                const stored = JSON.parse(localStorage.getItem("ghs_user_bookings") || "[]");
                if (Array.isArray(stored)) {
                    localPackages = stored.map((pkg: any) => ({
                        id: pkg.id,
                        isPackage: true,
                        hotel: {
                            name: pkg.title || "Tour Package",
                            city: pkg.destination || "India",
                            address: pkg.destination || "Tour Package Destination",
                            thumbnail: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
                        },
                        room: {
                            name: `Tour Package (${pkg.travelers || 2} Travelers) • All Inclusions Included`
                        },
                        checkIn: pkg.checkIn || new Date().toISOString(),
                        checkOut: pkg.checkIn || new Date().toISOString(),
                        totalPrice: pkg.totalAmount,
                        amountPaid: pkg.amountPaid || pkg.totalAmount,
                        status: pkg.status || 'confirmed',
                        paymentStatus: pkg.paymentStatus || 'paid',
                        razorpayPaymentId: pkg.paymentId,
                        createdAt: pkg.createdAt,
                        guestInfo: pkg.guestInfo
                    }));
                }
            } catch (e) {
                console.error("Failed to parse local package bookings:", e);
            }

            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) {
                if (localPackages.length > 0) {
                    setBookings(localPackages);
                    setLoading(false);
                    return;
                }
                setError("Please login to view your bookings.");
                setLoading(false);
                return;
            }

            try {
                const res = await bookingApi.getMyBookings();
                const apiBookings = res.data || [];
                setBookings([...localPackages, ...apiBookings]);
            } catch (err: any) {
                if (localPackages.length > 0) {
                    setBookings(localPackages);
                } else {
                    setError(err.message || "Failed to load bookings.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        const verifyPendingBookings = async () => {
            const heldBookings = bookings.filter((b: any) => b.status === 'held' && typeof b.id === 'number');
            if (heldBookings.length === 0) return;

            let updatedAny = false;

            for (const b of heldBookings) {
                const attemptedKey = `my_bookings_verify_attempt_${b.id}`;
                if (sessionStorage.getItem(attemptedKey)) continue;
                sessionStorage.setItem(attemptedKey, "true");

                try {
                    console.log(`[MyBookings Dashboard] Auto-verifying pending booking ${b.id}`);
                    const res = await paymentApi.fetchPaymentStatus(b.id);
                    if (res.success) {
                        console.log(`[MyBookings Dashboard] Booking ${b.id} payment verified and updated!`);
                        updatedAny = true;
                        
                        if (localStorage.getItem("active_checkout_booking_id") === b.id.toString()) {
                            localStorage.removeItem("active_checkout_booking_id");
                            localStorage.removeItem("active_checkout_booking_time");
                        }
                    }
                } catch (err) {
                    console.error(`[MyBookings Dashboard] Auto-verifying failed for booking ${b.id}:`, err);
                }
            }

            if (updatedAny) {
                try {
                    const res = await bookingApi.getMyBookings();
                    setBookings(res.data || []);
                } catch (err) {
                    console.error("Failed to refresh bookings after auto-verification", err);
                }
            }
        };

        if (bookings.length > 0) {
            verifyPendingBookings();
        }
    }, [bookings]);

    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, bookingId: string | number | null, policy: string }>({
        isOpen: false,
        bookingId: null,
        policy: ""
    });

    const handleCancel = async () => {
        if (!cancelModal.bookingId) return;

        try {
            setLoading(true);
            const bId = String(cancelModal.bookingId);
            if (bId.startsWith('PKG-') || bId.includes('PKG')) {
                const stored = JSON.parse(localStorage.getItem("ghs_user_bookings") || "[]");
                const updated = stored.map((p: any) => String(p.id) === bId ? { ...p, status: 'cancelled' } : p);
                localStorage.setItem("ghs_user_bookings", JSON.stringify(updated));
                setBookings(prev => prev.map(b => String(b.id) === bId ? { ...b, status: 'cancelled' } : b));
                setCancelModal({ isOpen: false, bookingId: null, policy: "" });
                return;
            }

            await bookingApi.cancelBooking(Number(cancelModal.bookingId));
            // Refresh
            const res = await bookingApi.getMyBookings();
            setBookings(res.data || []);
            setCancelModal({ isOpen: false, bookingId: null, policy: "" });
        } catch (err: any) {
            alert(err.message || "Cancellation failed.");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkOutDate = new Date(b.checkOut);
        const status = (b.status || "").toLowerCase();

        if (activeTab === "cancelled") {
            return status === 'cancelled' || status === 'failed';
        }

        if (status === 'cancelled' || status === 'failed') return false;

        // If booking status is checked-out or completed, it should strictly belong to the "completed" tab
        if (status === 'checked-out' || status === 'checked_out' || status === 'completed') {
            return activeTab === "completed";
        }

        if (activeTab === "upcoming") {
            // Include today and future bookings
            return checkOutDate >= today;
        }
        if (activeTab === "completed") {
            // Past bookings
            return checkOutDate < today;
        }
        return true;
    });

    if (loading) return <Loader variant="fullscreen" text="Loading your bookings..." />;

    return (
        <div className="min-h-screen bg-slate-50 pt-6 sm:pt-10 pb-16 sm:pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2 sm:mb-4">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">My Bookings</h1>
                        </div>
                        <p className="text-slate-500 font-bold ml-1 text-xs sm:text-sm">Manage and view your luxury stays.</p>
                    </div>
 
                    {/* Tabs */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 sm:p-1.5 rounded-[20px] sm:rounded-[24px] border border-slate-200 shadow-sm overflow-x-auto w-full sm:w-auto scrollbar-none shrink-0">
                        {["upcoming", "completed", "cancelled"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-[16px] sm:rounded-[18px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-center",
                                    activeTab === tab
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {cancelModal.isOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
                            >
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Cancel Reservation?</h2>
                                <p className="text-slate-500 font-bold mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>

                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancellation Policy</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 uppercase mb-2">{cancelModal.policy}</p>

                                    {(cancelModal.policy.toLowerCase().includes('non-refundable') || cancelModal.policy.toLowerCase().includes('non refundable')) && (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <X className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-tight">No refund will be provided</span>
                                        </div>
                                    )}
                                    {(cancelModal.policy.toLowerCase().includes('refundable')) && !cancelModal.policy.toLowerCase().includes('non-refundable') && (
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <Check className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-tight">Refund will be processed as per policy</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setCancelModal({ isOpen: false, bookingId: null, policy: "" })}
                                        className="py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Nevermind
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="py-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {error ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-xl border border-slate-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">{error}</h3>
                        <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-20 text-center shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-30" />
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Hotel className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">No {activeTab} stays found</h3>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking, i) => {
                            const isTour = Boolean(
                                booking.isPackage ||
                                (typeof booking.id === 'string' && (booking.id.startsWith('PKG-') || booking.id.includes('PKG'))) ||
                                booking.room?.name?.toLowerCase().includes('tour package') ||
                                booking.packageId
                            );

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={booking.id}
                                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg"
                                >
                                    {isTour ? (
                                        /* Minimal, Compact Tour Package Card */
                                        <div className="flex flex-col md:flex-row">
                                            {/* Image - compact on mobile, no hover zoom, no curated tour badge */}
                                            <div className="relative w-full md:w-72 lg:w-80 h-44 sm:h-52 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                                                <Image
                                                    src={safeParse(booking.room?.images)?.[0] || booking.hotel?.thumbnail || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"}
                                                    alt={booking.hotel?.name || "Tour"}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                                    {(() => {
                                                        const s = (booking.status || "").toLowerCase();
                                                        const isCancelled = s === 'cancelled' || s === 'failed';
                                                        const isCompleted = s === 'completed' || s === 'checked-out' || s === 'checked_out';

                                                        if (isCancelled) {
                                                            return (
                                                                <span className="px-3 py-1 bg-red-500/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl backdrop-blur-md shadow-sm flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> Cancelled
                                                                </span>
                                                            );
                                                        }
                                                        if (isCompleted) {
                                                            return (
                                                                <span className="px-3 py-1 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider rounded-xl backdrop-blur-md shadow-sm flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <span className="px-3 py-1 bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl backdrop-blur-md shadow-sm flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Tour Confirmed
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Details & Minimal Actions */}
                                            <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
                                                <div>
                                                    {/* Header: Title, Route & Price (NO BOOKING ID, NO HOVER COLOR) */}
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-tight uppercase">
                                                                {booking.hotel?.name || "Tour Package"}
                                                            </h3>
                                                            <p className="text-slate-500 font-bold text-xs sm:text-sm flex items-center gap-1.5 mt-1">
                                                                <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                                                                <span className="truncate">
                                                                    {(() => {
                                                                        const c = booking.hotel?.city || "";
                                                                        const a = booking.hotel?.address || "";
                                                                        if (c && a && c === a) return c.replace(/•/g, " ➔ ");
                                                                        if (c && a) return `${c} ➔ ${a}`.replace(/•/g, " ➔ ");
                                                                        return (c || a || "Tour Route").replace(/•/g, " ➔ ");
                                                                    })()}
                                                                </span>
                                                            </p>
                                                        </div>

                                                        {/* Minimal Tour Price */}
                                                        <div className="bg-slate-50 sm:bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-100 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end shrink-0">
                                                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Package</span>
                                                            <span className="text-base sm:text-lg font-black text-slate-900">
                                                                {formatPrice(booking.totalPrice || booking.amountPaid || 0)}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-emerald-600 hidden sm:inline-block">
                                                                ✓ All Inclusive
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Tour Key Details - 4 Structured Tiles on Desktop, 2x2 on Mobile */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 py-3 border-t border-slate-100 my-2 sm:my-2.5">
                                                        <div className="flex items-center gap-2.5 bg-slate-50/70 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tour Date</p>
                                                                <p className="text-[11px] sm:text-xs font-black text-slate-800 truncate">{formatDate(booking.checkIn)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2.5 bg-slate-50/70 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Departure</p>
                                                                <p className="text-[11px] sm:text-xs font-black text-slate-800 truncate">06:00 AM (Delhi NCR)</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2.5 bg-slate-50/70 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Travelers</p>
                                                                <p className="text-[11px] sm:text-xs font-black text-slate-800 truncate">
                                                                    {(() => {
                                                                        const m = booking.room?.name?.match(/(\d+)\s*Travelers?/i);
                                                                        return `${booking.travelers || (m ? m[1] : 2)} Guests (Private)`;
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2.5 bg-slate-50/70 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                                                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transport</p>
                                                                <p className="text-[11px] sm:text-xs font-black text-slate-800 truncate">Private AC Cab & Driver</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Structured Inclusions Strip (Clean & Non-cluttered) */}
                                                    <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 my-2 sm:my-2.5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                Package Inclusions & Route
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-500">
                                                                Same Day Return
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                            <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                <span className="truncate">Taj Mahal & Agra Fort Tour</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                <span className="truncate">Fuel, Tolls & Parking Covered</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                <span className="truncate">Doorstep Delhi NCR Pickup</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Action: Minimal View Receipt & Cancel (NO Contact Hotel) */}
                                                <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <Link
                                                        to={`/booking/details/${booking.id}`}
                                                        className="px-5 py-2.5 sm:py-3 bg-slate-950 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2 text-center"
                                                    >
                                                        <Ticket className="w-3.5 h-3.5" /> View Receipt
                                                    </Link>

                                                    {activeTab === "upcoming" && (
                                                        <button
                                                            onClick={() => setCancelModal({
                                                                isOpen: true,
                                                                bookingId: booking.id,
                                                                policy: "Cancellation allowed up to 24 hours prior to tour departure."
                                                            })}
                                                            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors py-2 px-3 hover:bg-red-50 rounded-xl text-center"
                                                        >
                                                            Cancel Reservation
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Hotel Card */
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="relative w-full lg:w-[400px] h-64 lg:h-auto shrink-0 overflow-hidden">
                                                <Image
                                                    src={safeParse(booking.room?.images)?.[0] || booking.hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                                                    alt="Hotel"
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-6 left-6">
                                                    {(() => {
                                                        const s = (booking.status || "").toLowerCase();
                                                        const isCompleted = s === 'checked-out' || s === 'checked_out' || s === 'completed';
                                                        const isConfirmedOrPaid = s === 'confirmed' || s === 'paid';
                                                        const isCancelledOrFailed = s === 'cancelled' || s === 'failed';
                                                        
                                                        let badgeClass = "bg-white/90 border-white text-slate-900";
                                                        let dotClass = "bg-current";
                                                        let label = booking.status;

                                                        if (isCompleted) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = "bg-white";
                                                            label = "Completed";
                                                        } else if (isConfirmedOrPaid) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = s === 'paid' ? 'bg-white animate-pulse' : 'bg-white';
                                                        } else if (isCancelledOrFailed) {
                                                            badgeClass = "bg-red-500/90 border-red-400 text-white";
                                                            dotClass = "bg-white";
                                                        }

                                                        return (
                                                            <div className={cn(
                                                                "px-5 py-2.5 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-2 border",
                                                                badgeClass
                                                            )}>
                                                                <div className={cn("w-2 h-2 rounded-full", dotClass)} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="flex-1 p-5 sm:p-8 lg:p-12 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                                                        <div>
                                                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-1.5">Booking ID: #GH-{Number(booking.id) + 10000}</p>
                                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 group-hover:text-brand-600 transition-colors leading-tight uppercase">{booking.hotel?.name}</h3>
                                                            <p className="text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                                                                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                                                                <span>{booking.hotel?.city}, {booking.hotel?.address}</span>
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 sm:gap-3 w-full md:w-auto md:min-w-[180px]">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Online</p>
                                                                <p className="text-sm font-black text-emerald-600">{formatPrice(booking.amountPaid || booking.amount_paid || 0)}</p>
                                                            </div>
                                                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 text-xs">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due at Hotel</p>
                                                                <p className="text-base font-black text-brand-600">{formatPrice((booking.totalPrice || booking.total_price || 0) - (booking.amountPaid || booking.amount_paid || 0))}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 py-6 sm:py-8 border-y border-slate-50">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                                                                    <Calendar className="w-4 h-4 text-brand-600" />
                                                                </div>
                                                                <span className="text-sm font-black text-slate-800">{formatDate(booking.checkIn)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-out</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                                                                    <Calendar className="w-4 h-4 text-brand-600" />
                                                                </div>
                                                                <span className="text-sm font-black text-slate-800">{formatDate(booking.checkOut)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Details</p>
                                                            <p className="text-[10px] font-black text-slate-800 uppercase truncate">
                                                                {booking.room?.name || "Luxury Stay"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                                                            <div className={cn(
                                                                "px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest",
                                                                booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                                booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-600' :
                                                                'bg-amber-50 text-amber-600'
                                                            )}>
                                                                {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                                                                 booking.paymentStatus === 'partial' ? '12% Paid' :
                                                                 'Pay At Hotel'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                                                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
                                                        <Link
                                                            to={`/booking/details/${booking.id}`}
                                                            className="px-5 sm:px-8 py-3.5 sm:py-4 bg-slate-950 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                                        >
                                                            <Ticket className="w-4 h-4" /> View Receipt
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                const phone = booking.hotel?.phone || "919000000000";
                                                                const ref = `#GH-${Number(booking.id) + 10000}`;
                                                                window.open(`https://wa.me/${phone}?text=Hi, I have a booking (${ref}) at ${booking.hotel?.name}.`, '_blank');
                                                            }}
                                                            className="px-5 sm:px-8 py-3.5 sm:py-4 bg-white border border-slate-200 text-slate-900 rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                        >
                                                            Contact Hotel
                                                        </button>
                                                    </div>

                                                    {activeTab === "upcoming" && (
                                                        <button
                                                            onClick={() => setCancelModal({
                                                                isOpen: true,
                                                                bookingId: booking.id,
                                                                policy: booking.hotel?.cancellationPolicy || booking.room?.roomPolicies?.cancellation || "Non-Refundable"
                                                            })}
                                                            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 px-4 py-3 hover:bg-red-50 rounded-xl w-full sm:w-auto"
                                                        >
                                                            Cancel Reservation
                                                        </button>
                                                    )}

                                                    {activeTab === "completed" && (
                                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                            {booking.isReviewed ? (
                                                                <button
                                                                    disabled
                                                                    className="px-5 sm:px-8 py-3.5 sm:py-4 bg-slate-100 text-slate-400 rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest text-center cursor-not-allowed w-full sm:w-auto"
                                                                >
                                                                    Reviewed
                                                                </button>
                                                            ) : (
                                                                <Link
                                                                    to={`${getHotelUrl(booking.hotel?.id, booking.hotel?.name)}/write-review`}
                                                                    className="px-5 sm:px-8 py-3.5 sm:py-4 bg-brand-600 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 text-center w-full sm:w-auto"
                                                                >
                                                                    Write Review
                                                                </Link>
                                                            )}
                                                            <Link
                                                                to={getHotelUrl(booking.hotel?.id, booking.hotel?.name)}
                                                                className="px-5 sm:px-8 py-3.5 sm:py-4 bg-white border border-slate-200 text-slate-800 rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-center w-full sm:w-auto"
                                                            >
                                                                Book Again
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}



