'use client';
import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar, User, 
    Search, Loader2, 
    ChevronRight, Phone, Mail,
    Printer, Eye, Check,
    Ban, Bed, Users, ShieldAlert, MessageSquare, Clock,
    Receipt, CheckCircle2, XCircle, ArrowLeft, Tag, DollarSign, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, bookingApi } from "@/lib/api";
import { parseBookingBreakdown } from "@/lib/bookingBreakdown";

export default function PartnerBookingsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            const activeHotelId = typeof window !== 'undefined'
                ? (sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId'))
                : null;
            const res = await hotelApi.getMyHotels({ includeBookings: true, hotelId: activeHotelId || undefined });
            if (res.success && res.data && res.data.length > 0) {
                const targetHotels = activeHotelId
                    ? res.data.filter((h: any) => String(h.id) === String(activeHotelId))
                    : res.data;
                const allBookings = (targetHotels.length > 0 ? targetHotels : res.data).flatMap((hotel: any) => hotel.booking || hotel.hotel_bookings || []);
                setBookings(allBookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (authUser?.role === 'hotel_admin' || authUser?.role === 'super_admin')) {
            fetchBookings();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await bookingApi.updateBooking(id, { status: newStatus });
            if (res.success) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
                if (selectedBooking?.id === id) {
                    setSelectedBooking((prev: any) => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const query = searchTerm.toLowerCase().trim();
        const guestName = (booking.user?.name || `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`).toLowerCase();
        const matchesSearch = !query || 
            guestName.includes(query) ||
            (booking.guestPhone || "").toLowerCase().includes(query) ||
            (booking.guestEmail || "").toLowerCase().includes(query) ||
            (booking.id || "").toString().includes(query) ||
            (booking.room?.name || "").toLowerCase().includes(query);
        
        const currentStatus = (booking.status || "").toLowerCase();
        const targetStatus = statusFilter.toLowerCase();
        
        const matchesStatus = statusFilter === "all" || 
            (targetStatus === "pending" ? (currentStatus === "pending" || currentStatus === "held") : currentStatus === targetStatus);
        
        return matchesSearch && matchesStatus;
    });

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {!selectedBooking ? (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Reservations</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Manage incoming bookings, room occupancy, and collection breakdowns</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200/60">
                                {filteredBookings.length} Bookings Shown
                            </span>
                        </div>
                    </div>

                    {/* Filter & Search Bar - Minimalist */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by Guest Name, Phone, Email, ID or Room..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-semibold capitalize border transition-all whitespace-nowrap cursor-pointer",
                                        statusFilter === status 
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xs" 
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    {status === 'all' ? 'All Bookings' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minimalist Reservations Table */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3.5">Booking & Room</th>
                                        <th className="px-5 py-3.5">Guest Info</th>
                                        <th className="px-5 py-3.5">Stay Dates</th>
                                        <th className="px-5 py-3.5">Payment & Collection</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                        <th className="px-5 py-3.5 text-right">Breakdown</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <p className="text-xs text-slate-400 font-medium">No reservations match the selected filter.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((booking) => {
                                            const meta = parseBookingBreakdown(booking);
                                            const guestDisplayName = booking.guestFirstName 
                                                ? `${booking.guestFirstName} ${booking.guestLastName || ''}`
                                                : (booking.user?.name || 'Guest');
                                            const guestEmail = booking.guestEmail || booking.user?.email || 'N/A';
                                            const guestPhone = booking.guestPhone || 'N/A';

                                            return (
                                                <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                                                    {/* Booking & Room */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-900">#BK-{booking.id}</span>
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                                                                    {meta.roomCount} {meta.roomCount > 1 ? 'Rooms' : 'Room'}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                                                                    {meta.nights} {meta.nights > 1 ? 'Nights' : 'Night'}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-800">{booking.room?.name || 'Standard Room'}</span>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[9px] font-semibold",
                                                                    meta.mealPlan.toLowerCase().includes("breakfast") 
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                                                                        : "bg-slate-50 text-slate-600 border border-slate-200/60"
                                                                )}>
                                                                    {meta.mealPlan}
                                                                </span>
                                                                {booking.specialRequests && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 truncate max-w-[140px]" title={booking.specialRequests}>
                                                                        Note: {booking.specialRequests}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Guest Info */}
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-slate-900">{guestDisplayName}</p>
                                                            <p className="text-[11px] text-slate-500">{guestEmail}</p>
                                                            {guestPhone !== 'N/A' && (
                                                                <div className="flex items-center gap-2 pt-0.5">
                                                                    <a href={`tel:${guestPhone}`} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                                                                        <Phone className="w-2.5 h-2.5" /> {guestPhone}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Stay Dates */}
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                                                                <span>{new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                <span className="text-slate-400">→</span>
                                                                <span>{new Date(booking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500">
                                                                {meta.nights} Night(s) Stay • {booking.totalGuests || 2} Guest(s)
                                                            </p>
                                                            {booking.arrivalTime && (
                                                                <p className="text-[10px] text-emerald-600 font-medium">ETA: {booking.arrivalTime}</p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Payment Split */}
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-slate-900">₹{meta.totalPrice.toLocaleString()}</p>
                                                                <span className={cn(
                                                                    "px-1.5 py-0.5 rounded text-[9px] font-semibold",
                                                                    meta.paymentMode === 'PAY_AT_HOTEL' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                                    meta.paymentMode === 'FULL_ONLINE' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                                    "bg-blue-50 text-blue-700 border border-blue-200"
                                                                )}>
                                                                    {meta.paymentMode === 'PAY_AT_HOTEL' ? 'Pay at Hotel' : meta.paymentMode === 'FULL_ONLINE' ? 'Paid Online' : 'Partial'}
                                                                </span>
                                                            </div>
                                                            {meta.amountDueAtHotel > 0 && (
                                                                <p className="text-[10px] font-medium text-amber-700">
                                                                    Collect: <span className="font-bold">₹{meta.amountDueAtHotel.toLocaleString()}</span>
                                                                </p>
                                                            )}
                                                            <div className="pt-0.5 border-t border-slate-100 flex flex-col text-[10px]">
                                                                <span className="text-slate-500">
                                                                    Commission ({meta.commissionRate}%): <span className="font-semibold text-blue-700">₹{meta.commissionAmount.toLocaleString()}</span>
                                                                </span>
                                                                <span className="text-emerald-700 font-semibold">
                                                                    Net Share: ₹{meta.partnerNetPayout.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Control */}
                                                    <td className="px-5 py-4 text-center">
                                                        <div className="inline-flex flex-col items-center gap-1.5">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize",
                                                                booking.status?.toLowerCase() === 'confirmed' ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" :
                                                                (booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'held') ? "bg-amber-50 text-amber-700 border border-amber-200/70" :
                                                                booking.status?.toLowerCase() === 'checked-in' ? "bg-blue-50 text-blue-700 border border-blue-200/70" :
                                                                booking.status?.toLowerCase() === 'checked-out' ? "bg-purple-50 text-purple-700 border border-purple-200/70" :
                                                                "bg-rose-50 text-rose-700 border border-rose-200/70"
                                                            )}>
                                                                {booking.status}
                                                            </span>
                                                            {updatingId === booking.id && (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* View Breakdown */}
                                                    <td className="px-5 py-4 text-right">
                                                        <button 
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5" />
                                                            <span>Breakdown</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* ─── Minimalist Booking Detail View ──────────────────────────────── */
                (() => {
                    const meta = parseBookingBreakdown(selectedBooking);
                    const guestDisplayName = selectedBooking.guestFirstName 
                        ? `${selectedBooking.guestFirstName} ${selectedBooking.guestLastName || ''}`
                        : (selectedBooking.user?.name || 'Guest');
                    const guestEmail = selectedBooking.guestEmail || selectedBooking.user?.email || 'N/A';
                    const guestPhone = selectedBooking.guestPhone || 'Not Provided';

                    return (
                        <div className="space-y-6">
                            {/* Top Navigation Bar */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedBooking(null)}
                                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-slate-900">Reservation #BK-{selectedBooking.id}</h2>
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded text-[10px] font-semibold capitalize",
                                                selectedBooking.status?.toLowerCase() === 'confirmed' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                selectedBooking.status?.toLowerCase() === 'pending' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                "bg-slate-100 text-slate-700 border border-slate-200"
                                            )}>
                                                {selectedBooking.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Booked on {new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5" /> Print Voucher
                                    </button>
                                </div>
                            </div>

                            {/* Special Requests Callout (if present) */}
                            {selectedBooking.specialRequests && (
                                <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Guest Special Request</p>
                                        <p className="text-xs text-amber-950 font-medium mt-1 leading-relaxed italic">
                                            "{selectedBooking.specialRequests}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Guest Details Card */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                                        Guest Contact Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Primary Guest</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">{guestDisplayName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Guests</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">{selectedBooking.totalGuests || 2} Person(s)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Phone Number</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">{guestPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Email Address</p>
                                            <p className="font-semibold text-slate-900 mt-0.5 truncate" title={guestEmail}>{guestEmail}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex items-center gap-2">
                                        {guestPhone !== 'Not Provided' && (
                                            <>
                                                <a 
                                                    href={`tel:${guestPhone}`}
                                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Phone className="w-3 h-3" /> Call Guest
                                                </a>
                                                <a 
                                                    href={`https://wa.me/${guestPhone.replace(/\D/g, '')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                >
                                                    <MessageSquare className="w-3 h-3" /> WhatsApp
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Stay & Units Card */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                                        Room & Stay Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Room Category</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">{selectedBooking.room?.name || 'Standard Room'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Units Booked</p>
                                            <p className="font-semibold text-blue-700 mt-0.5">{meta.roomCount} Room(s)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Check-In Date</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">
                                                {new Date(selectedBooking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Check-Out Date</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">
                                                {new Date(selectedBooking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Duration</p>
                                            <p className="font-semibold text-slate-900 mt-0.5">{meta.nights} Night(s)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase">Meal Plan Included</p>
                                            <p className="font-semibold text-emerald-700 mt-0.5">{meta.mealPlan}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimalist Price Breakdown Table */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Financial Calculation & Tariff Breakdown
                                    </h3>
                                    <span className="text-[10px] font-semibold text-slate-400">Currency: INR (₹)</span>
                                </div>
                                <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-semibold">
                                            <tr>
                                                <th className="px-4 py-3">Calculation Step</th>
                                                <th className="px-4 py-3">Formula / Breakdown Detail</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            <tr>
                                                <td className="px-4 py-3 font-semibold text-slate-900">Room Base Rate</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    ₹{meta.rateUnit.toLocaleString()} / night × {meta.roomCount} Room(s) × {meta.nights} Night(s) ({meta.roomCount * meta.nights} Room-Nights)
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">₹{meta.grossBase.toLocaleString()}</td>
                                            </tr>
                                            {meta.discountAmount > 0 && (
                                                <tr className="bg-emerald-50/40">
                                                    <td className="px-4 py-3 font-semibold text-emerald-700">Coupon Discount</td>
                                                    <td className="px-4 py-3 text-emerald-700">
                                                        {meta.couponCode ? `Coupon applied: ${meta.couponCode}` : 'Promotional Discount'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-700">- ₹{meta.discountAmount.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-slate-800">Net Taxable Amount</td>
                                                <td className="px-4 py-3 text-slate-500">Base tariff after promotional deductions</td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-800">₹{meta.netTaxable.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-slate-800">GST / Taxes (5%)</td>
                                                <td className="px-4 py-3 text-slate-500">CGST (2.5%) + SGST (2.5%) GST Standard</td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-800">+ ₹{meta.gstTax.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                                                <td className="px-4 py-3.5 text-slate-900">Total Booking Price</td>
                                                <td className="px-4 py-3.5 text-slate-500 font-normal">Final gross reservation value</td>
                                                <td className="px-4 py-3.5 text-right text-base text-slate-950 font-black">₹{meta.totalPrice.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-blue-50/40 border-t border-slate-200">
                                                <td className="px-4 py-3 font-semibold text-blue-800">Platform Commission ({meta.commissionRate}%)</td>
                                                <td className="px-4 py-3 text-blue-700">GetHotelStays standard platform commission</td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-800">- ₹{meta.commissionAmount.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-emerald-50/60 font-bold border-t border-emerald-200">
                                                <td className="px-4 py-3.5 text-emerald-950 font-black">Net Partner Payout ({100 - meta.commissionRate}%)</td>
                                                <td className="px-4 py-3.5 text-emerald-800 font-medium">Your net earnings from this reservation</td>
                                                <td className="px-4 py-3.5 text-right text-base text-emerald-900 font-black">₹{meta.partnerNetPayout.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Frontdesk Collection Box */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Frontdesk Collection & Settlement Status
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Online Pre-Paid</p>
                                        <p className="text-xl font-black text-emerald-700 mt-1">₹{meta.amountPaid.toLocaleString()}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {meta.amountPaid >= meta.totalPrice ? 'Full payment received online' : (meta.amountPaid > 0 ? 'Partial deposit paid online' : 'No online deposit')}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-xl border",
                                        meta.amountDueAtHotel > 0 ? "bg-amber-50/80 border-amber-200/90" : "bg-slate-50 border-slate-200"
                                    )}>
                                        <p className={cn(
                                            "text-[10px] font-semibold uppercase tracking-wider",
                                            meta.amountDueAtHotel > 0 ? "text-amber-800" : "text-slate-500"
                                        )}>
                                            To Collect at Check-In
                                        </p>
                                        <p className={cn(
                                            "text-xl font-black mt-1",
                                            meta.amountDueAtHotel > 0 ? "text-amber-700" : "text-slate-700"
                                        )}>
                                            ₹{meta.amountDueAtHotel.toLocaleString()}
                                        </p>
                                        <p className={cn(
                                            "text-[11px] mt-0.5",
                                            meta.amountDueAtHotel > 0 ? "text-amber-800/80 font-medium" : "text-slate-500"
                                        )}>
                                            {meta.amountDueAtHotel > 0 ? 'Collect cash / UPI / Card from guest' : 'No balance due at frontdesk'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl">
                                        <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">Property Net Revenue (88%)</p>
                                        <p className="text-xl font-black text-emerald-800 mt-1">₹{meta.partnerNetPayout.toLocaleString()}</p>
                                        <p className="text-[11px] text-emerald-700 mt-0.5">
                                            After 12% commission (₹{meta.commissionAmount.toLocaleString()})
                                        </p>
                                    </div>
                                </div>

                                {meta.internalNotes && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 font-mono">
                                        <span className="font-semibold text-slate-700">Audit Notes: </span>
                                        {meta.internalNotes}
                                    </div>
                                )}

                                {/* Status Update Controls */}
                                <div className="pt-2 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-700 mr-2">Change Status:</span>
                                    {['confirmed', 'checked-in', 'checked-out', 'cancelled'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                                            disabled={updatingId === selectedBooking.id || selectedBooking.status === st}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer",
                                                selectedBooking.status === st 
                                                    ? "bg-slate-900 text-white border-slate-900 cursor-default" 
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            {updatingId === selectedBooking.id ? 'Updating...' : `Mark ${st}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
