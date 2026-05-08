"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar, Users, DollarSign, TrendingUp, 
    ArrowUpRight, ArrowDownRight, Clock, 
    Plus, History, Hotel, Loader2,
    CheckCircle2, LogIn, LogOut, XCircle,
    Star, ArrowRight, Phone, MessageSquare
} from "lucide-react";
import { hotelApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PartnerDashboardHome() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await hotelApi.getMyHotels();
                if (res.success && res.data && res.data.length > 0) {
                    setHotel(res.data[0]);
                }
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchDashboardData();
        }
    }, [authUser, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <Hotel className="w-16 h-16 text-slate-200 mb-4" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">No Property Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm">Your property is currently being verified or you haven't added one yet.</p>
                <Link href="/list-property/register" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">
                    Register My Property
                </Link>
            </div>
        );
    }

    const today = new Date().toDateString();
    
    // Derived Analytics & Stats
    const todayBookings = hotel.booking?.filter((b: any) => 
        new Date(b.createdAt).toDateString() === today
    ) || [];

    const pendingCheckins = hotel.booking?.filter((b: any) => 
        new Date(b.checkIn).toDateString() === today && b.status === 'confirmed'
    ).length || 0;

    const activeBookings = hotel.booking?.filter((b: any) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const now = new Date();
        return now >= checkIn && now < checkOut && b.status !== 'cancelled';
    }) || [];

    const totalRooms = hotel.room?.reduce((sum: number, r: any) => sum + (r.totalUnits || 1), 0) || 1;
    const occupancyRate = Math.round((activeBookings.length / totalRooms) * 100);

    const totalRevenue = hotel.booking?.filter((b: any) => 
        (b.status === 'confirmed' || b.status === 'checked-in' || b.status === 'checked-out')
    ).reduce((sum: number, b: any) => sum + b.totalPrice, 0) || 0;

    const todayRevenue = hotel.booking?.filter((b: any) => 
        new Date(b.createdAt).toDateString() === today
    ).reduce((sum: number, b: any) => sum + b.totalPrice, 0) || 0;

    // In Partial Prepaid: 
    // Hotel Revenue (Gross) = 100% 
    // Hotel Cash Collection = 82% (since 18% is taken by platform upfront)
    const netEarnings = totalRevenue * 0.82; 

    // Trust Metrics
    const ratingValue = hotel.guestRating || 4.5;
    const reviewCount = hotel.reviewCount || 120;
    const ratingLabel = ratingValue >= 4.5 ? "Exceptional" : ratingValue >= 4 ? "Excellent" : "Good";

    const quickStats = [
        { label: "Today Bookings", value: todayBookings.length.toString(), icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", suffix: "" },
        { label: "Current Occupancy", value: occupancyRate.toString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", suffix: "%" },
        { label: "Net Earnings", value: `₹${Math.round(netEarnings).toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", suffix: "" },
        { label: "Today Arrivals", value: pendingCheckins.toString(), icon: LogIn, color: "text-purple-600", bg: "bg-purple-50", suffix: "" },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Property Control Hub</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
                        Welcome back, <span className="text-blue-600 uppercase">{hotel.name}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    {/* Revenue Quick View */}
                    <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
                        <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-brand-400" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Est. Hotel Collection (82%)</p>
                            <p className="text-base font-black italic text-brand-400">₹{Math.round(netEarnings).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{ratingLabel}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{reviewCount} Verified Reviews</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center text-xl font-black shadow-xl shadow-blue-100 italic">
                            {ratingValue}
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Operational Insights - Phase 4 & 11 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-xl shadow-blue-100">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-1">Smart Business Insight</p>
                            <h4 className="text-xl font-black text-white italic tracking-tight">
                                {occupancyRate < 30 
                                    ? `Occupancy is low (${occupancyRate}%). Consider a 10% flash sale for tonight.` 
                                    : occupancyRate > 80 
                                    ? "High demand weekend! You can increase rates by 5% for new bookings." 
                                    : "Steady growth! Your response speed is 12% faster than last week."}
                            </h4>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg">
                        Apply Suggestion
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium hover:scale-105 transition-all group cursor-default">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12", stat.bg)}>
                                <Icon className={cn("w-7 h-7", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter">
                                {stat.value}{stat.suffix || ""}
                            </h3>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Center Column: Recent Activity & Calendar */}
                <div className="lg:col-span-2 flex flex-col">
                    {/* Activity Feed */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" /> Recent Activity
                            </h3>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Log</button>
                        </div>

                        <div className="space-y-6 flex-1">
                            {hotel.booking?.slice(0, 10).map((booking: any) => (
                                <div key={booking.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <LogIn className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-slate-900">New Booking: {booking.user.name}</p>
                                            <div className="flex items-center gap-3">
                                                <a 
                                                    href={`https://wa.me/${booking.guestPhone?.replace(/\D/g, '')}`} 
                                                    target="_blank"
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </a>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500 font-medium">Room: {booking.room.name} • Status: {booking.status}</p>
                                            <button className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Report Issue</button>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                            ))}
                            {(!hotel.booking || hotel.booking.length === 0) && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No recent activity found</p>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">New bookings will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Mini Calendar & Operational Stats */}
                <div className="space-y-10">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" /> Today's Focus
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending Arrivals</span>
                                    <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg">{pendingCheckins}</span>
                                </div>
                                <div className="flex -space-x-3 mb-2">
                                    {hotel.booking?.filter((b: any) => new Date(b.checkIn).toDateString() === today).slice(0, 3).map((b: any, i: number) => (
                                        <div key={b.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black uppercase overflow-hidden" title={b.user.name}>
                                            {b.user.name.charAt(0)}
                                        </div>
                                    ))}
                                    {pendingCheckins > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">+{pendingCheckins - 3}</div>
                                    )}
                                    {pendingCheckins === 0 && <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">No arrivals today</div>}
                                </div>
                            </div>

                            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Expected Departures</span>
                                    <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg">
                                        {hotel.booking?.filter((b: any) => new Date(b.checkOut).toDateString() === today).length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Revenue Performance</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Daily Rate</p>
                                    <p className="text-xl font-black text-slate-900">₹{hotel.pricePerNight}</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, (todayRevenue / (hotel.pricePerNight * 10)) * 100) || 5}%` }} 
                                />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                {Math.round((todayRevenue / (hotel.pricePerNight * 10)) * 100) || 0}% of Daily Target Reached
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
