"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
    Calendar, 
    MapPin, 
    CheckCircle2, 
    Clock, 
    ChevronRight, 
    Hotel,
    Loader2,
    Ticket
} from "lucide-react";
import { bookingApi } from "@/lib/api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Please login to view your bookings.");
                setLoading(false);
                return;
            }

            try {
                const res = await bookingApi.getMyBookings();
                setBookings(res.data || []);
            } catch (err: any) {
                setError(err.message || "Failed to load bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleCancel = async (id: number) => {
        if (!confirm("Bhai, kya sach mein cancel karna chahte ho? 😢")) return;
        
        try {
            setLoading(true);
            await bookingApi.cancelBooking(id);
            // Refresh
            const res = await bookingApi.getMyBookings();
            setBookings(res.data || []);
            alert("Booking cancelled successfully. Refund (if any) will be processed in 5-7 days.");
        } catch (err: any) {
            alert(err.message || "Cancellation failed.");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === "upcoming") return ['paid', 'confirmed', 'held', 'checked-in'].includes(b.status);
        if (activeTab === "completed") return b.status === 'checked-out';
        if (activeTab === "cancelled") return ['cancelled', 'failed'].includes(b.status);
        return true;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">My Bookings</h1>
                        </div>
                        <p className="text-slate-500 font-bold ml-1">Manage and view your upcoming luxury stays.</p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-[24px] border border-slate-200 shadow-sm">
                        {["upcoming", "completed", "cancelled"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
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

                {error ? (
                    <div className="bg-white rounded-[40px] p-16 text-center shadow-xl border border-slate-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">{error}</h3>
                        <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-20 text-center shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-30" />
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Hotel className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 italic">No {activeTab} stays found</h3>
                        <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto">
                            Abhi tak koi booking nahi ki? Explore our premium hotels and start your luxury journey today.
                        </p>
                        <Link href="/hotels" className="btn-primary px-12 py-5 text-lg">Explore Hotels</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={booking.id}
                                className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row">
                                    <div className="relative w-full lg:w-[400px] h-64 lg:h-auto shrink-0 overflow-hidden">
                                        <Image 
                                            src={booking.room?.images?.[0] || booking.hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                                            alt="Hotel" 
                                            fill 
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <div className={cn(
                                                "px-5 py-2.5 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-2 border",
                                                booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
                                                booking.status === 'cancelled' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-white/90 border-white text-slate-900'
                                            )}>
                                                <div className={cn("w-2 h-2 rounded-full", booking.status === 'paid' ? 'bg-white animate-pulse' : 'bg-current')} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{booking.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-2 italic">Booking ID: #GH-{booking.id + 10000}</p>
                                                    <h3 className="text-3xl font-black text-slate-900 mb-2 group-hover:text-brand-600 transition-colors leading-tight uppercase italic">{booking.hotel?.name}</h3>
                                                    <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-brand-500" />
                                                        {booking.hotel?.city}, {booking.hotel?.address}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex flex-col gap-3 min-w-[180px]">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Online</p>
                                                        <p className="text-sm font-black text-emerald-600 italic">{formatPrice(booking.amountPaid)}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due at Hotel</p>
                                                        <p className="text-base font-black text-brand-600 italic">{formatPrice(booking.totalPrice - booking.amountPaid)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-50">
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
                                                    <p className="text-[10px] font-black text-slate-800 italic uppercase truncate">
                                                        {booking.room?.name || "Luxury Stay"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest",
                                                        booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                    )}>
                                                        {booking.paymentStatus === 'paid' ? 'Fully Paid' : 'Partial Paid'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex flex-wrap gap-4">
                                                <Link 
                                                    href={`/booking/invoice/${booking.id}`}
                                                    className="px-8 py-4 bg-slate-950 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                                                >
                                                    <Ticket className="w-4 h-4" /> Download Invoice
                                                </Link>
                                                <button 
                                                    onClick={() => {
                                                        const phone = booking.hotel?.phone || "919000000000";
                                                        window.open(`https://wa.me/${phone}?text=Hi, I have a booking (#GH-${booking.id + 10000}) at ${booking.hotel?.name}.`, '_blank');
                                                    }}
                                                    className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    Contact Hotel
                                                </button>
                                            </div>
                                            
                                            {activeTab === "upcoming" && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl"
                                                >
                                                    Cancel Reservation
                                                </button>
                                            )}

                                            {activeTab === "completed" && (
                                                <Link 
                                                    href={`/hotel/${booking.hotel?.id}`}
                                                    className="px-8 py-4 bg-brand-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-100"
                                                >
                                                    Book Again
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
