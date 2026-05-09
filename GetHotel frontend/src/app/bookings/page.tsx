"use client";

import { useState, useEffect } from "react";
import { 
    Calendar, MapPin, ChevronRight, Clock, 
    CreditCard, Hotel, AlertCircle, Search,
    ArrowRight, Loader2, Star, MoreHorizontal,
    Ticket, Flag, MessageSquare, FileText, Settings,
    X, QrCode, Download, Printer
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTicket, setShowTicket] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) {
                    setError("Please login to see your bookings.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://gethotelstays.com/api'}/bookings/my-bookings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const json = await res.json();
                if (json.success) {
                    setBookings(json.data);
                } else {
                    setError(json.message);
                }
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError("Could not load bookings. Is the server running?");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleViewTicket = (booking: any) => {
        setSelectedBooking(booking);
        setShowTicket(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F9FF] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold italic">Unlocking your elite vouchers...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F9FF] pt-32 pb-40 px-4 md:px-8">
            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight italic">
                        Your <span className="text-brand-600">Journeys</span>
                    </h1>
                    <p className="text-slate-500 font-bold ml-1 text-sm">Manage stays, checkouts and vouchers.</p>
                </div>

                {error ? (
                    <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
                        <AlertCircle className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-900 mb-2 italic">Access Restricted</h2>
                        <p className="text-slate-500 font-bold mb-8">{error}</p>
                        <Link href="/login" className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:scale-105 transition-all active:scale-95">
                            Login to Account
                        </Link>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
                        <Hotel className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-900 mb-2 italic">No Bookings Yet</h2>
                        <p className="text-slate-500 font-bold mb-8">Your next elite adventure is just a search away.</p>
                        <Link href="/hotels" className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:scale-105 transition-all active:scale-95">
                            Explore Hotels
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Bookings List */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                                <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Recent Bookings</h2>
                            </div>

                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div 
                                        key={booking.id}
                                        className="relative bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 transition-all hover:shadow-xl hover:border-brand-100 group"
                                    >
                                        {/* Hotel Thumbnail */}
                                        <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden relative shadow-lg shrink-0">
                                            <img 
                                                src={booking.hotel?.thumbnail || "/images/no-hotel.jpg"} 
                                                alt={booking.hotel?.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-brand-600">
                                                {booking.status}
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{booking.hotel?.name}</h3>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">{booking.hotel?.city}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                                    <p className="text-xl font-black text-brand-600">{formatPrice(booking.totalPrice)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                                <div className="space-y-1 text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                                                    <p className="text-sm font-bold text-slate-900">{formatDate(booking.checkIn)}</p>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                                                    <p className="text-sm font-bold text-slate-900">{formatDate(booking.checkOut)}</p>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                                                    <p className="text-sm font-bold text-slate-900">{booking.room?.name || "Standard"}</p>
                                                </div>
                                                <div className="flex items-end justify-end">
                                                    <button 
                                                        onClick={() => handleViewTicket(booking)}
                                                        className="px-6 py-3 bg-slate-950 text-white rounded-xl hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                                    >
                                                        <Ticket className="w-4 h-4" /> Voucher
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Ticket Modal */}
            <AnimatePresence>
                {showTicket && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowTicket(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 30 }}
                            className="relative w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="bg-brand-600 p-8 text-white relative text-left">
                                <button onClick={() => setShowTicket(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Elite Access</p>
                                <h3 className="text-3xl font-display font-black italic tracking-tighter leading-none mb-1">{selectedBooking.hotel?.name}</h3>
                                <p className="text-xs font-bold opacity-60 uppercase tracking-wide">{selectedBooking.hotel?.city}</p>
                            </div>

                            <div className="p-8 bg-white text-left">
                                <div className="grid grid-cols-2 gap-y-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conf ID</p>
                                        <p className="font-bold text-slate-950 font-mono text-sm uppercase">#{selectedBooking.id}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                                        <p className="font-bold text-slate-950 text-sm italic">{formatDate(selectedBooking.checkIn)}</p>
                                    </div>
                                </div>
                                <div className="mt-12 flex flex-col items-center">
                                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xl mb-6">
                                        <QrCode className="w-36 h-36 text-slate-900 opacity-90" strokeWidth={1} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Official Pass</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 flex gap-4">
                                <button className="flex-1 py-4 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <Printer className="w-4 h-4" /> Print Ticket
                                </button>
                                <button className="p-4 border border-slate-200 text-slate-400 rounded-xl hover:bg-white transition-all active:scale-95">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
