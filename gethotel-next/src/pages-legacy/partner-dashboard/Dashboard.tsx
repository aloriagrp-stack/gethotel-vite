'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar, Users, DollarSign, TrendingUp, 
    Clock, History, Hotel, Loader2,
    LogIn, ArrowRight, Phone
} from "lucide-react";
import { hotelApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function PartnerDashboardHome() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await hotelApi.getMyHotels({ includeBookings: true });
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
                <Link to="/list-property/register" className="px-8 py-4 bg-blue-600 text-white rounded-none font-bold shadow-lg shadow-blue-100">
                    Register My Property
                </Link>
            </div>
        );
    }

    const today = new Date().toDateString();
    const allBookings = Array.isArray(hotel.booking) ? hotel.booking : [];

    // Stats Calculations
    const todayBookingsCount = allBookings.filter((b: any) => 
        b && b.createdAt && new Date(b.createdAt).toDateString() === today
    ).length;

    const pendingArrivalsCount = allBookings.filter((b: any) => 
        b && b.checkIn && new Date(b.checkIn).toDateString() === today && b.status?.toLowerCase() !== 'cancelled'
    ).length;

    const activeBookingsCount = allBookings.filter((b: any) => {
        if (!b || !b.checkIn || !b.checkOut) return false;
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const now = new Date();
        return now >= checkIn && now < checkOut && b.status?.toLowerCase() !== 'cancelled';
    }).length;

    const totalRoomsCount = (hotel.room || []).reduce((sum: number, r: any) => sum + (Number(r?.totalUnits) || 1), 0) || 1;
    const occupancyRate = Math.round((activeBookingsCount / totalRoomsCount) * 100);

    const totalRevenue = allBookings.filter((b: any) => 
        b && ['confirmed', 'checked-in', 'checked-out', 'held', 'pending'].includes(b.status?.toLowerCase())
    ).reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);

    const netEarnings = totalRevenue * 0.88; 

    // Activity Filtering
    const filteredActivity = allBookings.filter((b: any) => {
        if (!b || !b.createdAt) return false;
        if (!dateRange.start && !dateRange.end) return true;
        
        const bookingDate = new Date(b.createdAt);
        bookingDate.setHours(0, 0, 0, 0);
        
        const start = dateRange.start ? new Date(dateRange.start) : null;
        if (start) start.setHours(0, 0, 0, 0);
        
        const end = dateRange.end ? new Date(dateRange.end) : null;
        if (end) end.setHours(23, 59, 59, 999);
        
        if (start && bookingDate < start) return false;
        if (end && bookingDate > end) return false;
        return true;
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const quickStats = [
        { label: "Today Bookings", value: todayBookingsCount.toString(), icon: Calendar, color: "text-stone-700", bg: "bg-stone-50" },
        { label: "Current Occupancy", value: occupancyRate.toString(), icon: TrendingUp, color: "text-stone-700", bg: "bg-stone-50", suffix: "%" },
        { label: "Net Earnings", value: `₹${Math.round(netEarnings).toLocaleString()}`, icon: DollarSign, color: "text-stone-700", bg: "bg-stone-50" },
        { label: "Today Arrivals", value: pendingArrivalsCount.toString(), icon: LogIn, color: "text-stone-700", bg: "bg-stone-50" },
    ];

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">
                    Welcome back, <span className="text-stone-950 uppercase font-black">{hotel.name || "Host"}</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white p-8 rounded-none border border-stone-200 shadow-none group cursor-default">
                            <div className={cn("w-14 h-14 rounded-none flex items-center justify-center mb-6", stat.bg)}>
                                <Icon className={cn("w-7 h-7", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-stone-950 italic tracking-tighter">
                                {stat.value}{stat.suffix || ""}
                            </h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-white rounded-none p-8 border border-stone-200 shadow-none flex-1 flex flex-col relative">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-5 h-5 text-stone-700" /> Recent Activity
                            </h3>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest border cursor-pointer",
                                        showFilters || dateRange.start || dateRange.end 
                                            ? "bg-stone-900 text-white border-stone-900 shadow-none" 
                                            : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                                    )}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    {dateRange.start || dateRange.end ? "Dates Applied" : "Filter by Date"}
                                </button>
                                <button className="text-[10px] font-black text-stone-900 uppercase tracking-widest hover:underline cursor-pointer">View Log</button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="absolute top-24 right-8 z-30 bg-white border border-stone-200 shadow-2xl rounded-none p-6 w-72 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Select Range</h4>
                                    {(dateRange.start || dateRange.end) && (
                                        <button 
                                            onClick={() => setDateRange({ start: '', end: '' })}
                                            className="text-[9px] font-black text-red-500 uppercase hover:underline cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                                        <input 
                                            type="date" 
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-none text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">End Date</p>
                                        <input 
                                            type="date" 
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-none text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowFilters(false)}
                                    className="w-full py-2 bg-stone-900 text-white rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-stone-800 mt-2 cursor-pointer"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        )}

                        <div className="space-y-6 flex-1">
                            {filteredActivity.slice(0, 10).map((booking: any, idx: number) => (
                                <div key={booking.id || idx} className="flex items-start gap-4 p-4 rounded-none hover:bg-stone-50 border border-transparent hover:border-stone-200/60 group">
                                    <div className="w-12 h-12 rounded-none bg-stone-50 flex items-center justify-center shrink-0">
                                        <LogIn className="w-5 h-5 text-stone-700" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-stone-900">New Booking: {booking.user?.name || "Guest"}</p>
                                            <div className="flex items-center gap-3">
                                                {booking.guestPhone && (
                                                    <a 
                                                        href={`https://wa.me/${booking.guestPhone.replace(/\D/g, '')}`} 
                                                        target="_blank"
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-none hover:bg-emerald-100"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-stone-500 font-medium">Room: {booking.room?.name || 'Unknown'} • Status: <span className="uppercase text-[9px] font-black text-stone-900">{booking.status || 'N/A'}</span></p>
                                            <button className="text-[8px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 cursor-pointer">Report Issue</button>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100">
                                        <ArrowRight className="w-4 h-4 text-stone-850" />
                                    </div>
                                </div>
                            ))}
                            {filteredActivity.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                                    <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center mb-4">
                                        <History className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No activity found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" /> Today's Focus
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-5 bg-blue-50 rounded-none border border-blue-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending Arrivals</span>
                                    <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-none">{pendingArrivalsCount}</span>
                                </div>
                                <div className="flex -space-x-3 mb-2">
                                    {allBookings.filter((b: any) => b && b.checkIn && new Date(b.checkIn).toDateString() === today).slice(0, 3).map((b: any, i: number) => (
                                        <div key={b.id || i} className="w-8 h-8 rounded-none border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black uppercase overflow-hidden" title={b.user?.name || "Guest"}>
                                            {b.user?.name?.charAt(0) || "G"}
                                        </div>
                                    ))}
                                    {pendingArrivalsCount > 3 && (
                                        <div className="w-8 h-8 rounded-none border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">+{pendingArrivalsCount - 3}</div>
                                    )}
                                    {pendingArrivalsCount === 0 && <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">No arrivals today</div>}
                                </div>
                            </div>

                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
