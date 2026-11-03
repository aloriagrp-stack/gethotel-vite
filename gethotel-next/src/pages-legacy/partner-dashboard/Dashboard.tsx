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
                const activeHotelId = typeof window !== 'undefined' 
                    ? (sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId'))
                    : null;
                const res = await hotelApi.getMyHotels({ includeBookings: true, hotelId: activeHotelId || undefined });
                if (res.success && res.data && res.data.length > 0) {
                    const myHotel = (activeHotelId ? res.data.find((h: any) => String(h.id) === String(activeHotelId)) : null) || res.data[0];
                    setHotel(myHotel);
                    if (myHotel && typeof window !== 'undefined') {
                        sessionStorage.setItem('activeHotelId', String(myHotel.id));
                        localStorage.setItem('activeHotelId', String(myHotel.id));
                    }
                }
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && (authUser?.role === 'hotel_admin' || authUser?.role === 'super_admin')) {
            fetchDashboardData();
        }
    }, [authUser, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-700 font-bold">Loading dashboard...</p>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <Hotel className="w-16 h-16 text-slate-400 mb-4" />
                <h2 className="text-2xl font-black text-slate-950 mb-2">No Property Found</h2>
                <p className="text-slate-600 font-medium mb-8 max-w-sm">Your property is currently being verified or you haven't added one yet.</p>
                <Link to="/list-property/register" className="px-8 py-3.5 bg-slate-950 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all">
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
        b && ['confirmed', 'checked-in', 'checked-out', 'held', 'pending', 'paid'].includes(b.status?.toLowerCase())
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
        { 
            label: "Today Bookings", 
            value: todayBookingsCount.toString(), 
            icon: Calendar, 
            color: "text-blue-700", 
            bg: "bg-blue-100/70 border-blue-200",
            desc: "New bookings today"
        },
        { 
            label: "Current Occupancy", 
            value: occupancyRate.toString(), 
            icon: TrendingUp, 
            color: "text-emerald-700", 
            bg: "bg-emerald-100/70 border-emerald-200", 
            suffix: "%",
            desc: `${activeBookingsCount} of ${totalRoomsCount} rooms active`
        },
        { 
            label: "Net Earnings", 
            value: `₹${Math.round(netEarnings).toLocaleString()}`, 
            icon: DollarSign, 
            color: "text-violet-700", 
            bg: "bg-violet-100/70 border-violet-200",
            desc: "Estimated net payout"
        },
        { 
            label: "Today Arrivals", 
            value: pendingArrivalsCount.toString(), 
            icon: LogIn, 
            color: "text-amber-700", 
            bg: "bg-amber-100/70 border-amber-200",
            desc: "Guests checking in today"
        },
    ];

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Live Property
                        </span>
                        <span className="text-xs text-slate-600 font-bold">• ID #{hotel.id}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                        Welcome back, <span className="text-slate-950">{hotel.name || "Partner"}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-700 font-medium mt-0.5">
                        Here is a quick overview of your hotel performance today.
                    </p>
                </div>
            </div>

            {/* Unified Stats Container with Divider Lines */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
                {quickStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="p-6 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</span>
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", stat.bg)}>
                                    <Icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-950 tracking-tight">
                                    {stat.value}{stat.suffix || ""}
                                </h3>
                                <p className="text-xs text-slate-600 mt-1.5 font-semibold">{stat.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unified Bottom Section with Divider Lines */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* Recent Activity (8 Cols) */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
                                <History className="w-4 h-4 text-slate-900" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-950">Recent Activity</h3>
                                <p className="text-xs text-slate-600 font-medium">Latest guest bookings & transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                    showFilters || dateRange.start || dateRange.end 
                                        ? "bg-slate-950 text-white border-slate-950 shadow-xs" 
                                        : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100"
                                )}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                {dateRange.start || dateRange.end ? "Dates Applied" : "Filter by Date"}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="absolute top-20 right-6 z-30 bg-white border border-slate-300 shadow-xl rounded-2xl p-5 w-72 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-950">Filter Date Range</h4>
                                {(dateRange.start || dateRange.end) && (
                                    <button 
                                        onClick={() => setDateRange({ start: '', end: '' })}
                                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase">Start Date</p>
                                    <input 
                                        type="date" 
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase">End Date</p>
                                    <input 
                                        type="date" 
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="w-full py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Apply Filter
                            </button>
                        </div>
                    )}

                    <div className="space-y-2.5 flex-1">
                        {filteredActivity.slice(0, 10).map((booking: any, idx: number) => (
                            <div 
                                key={booking.id || idx} 
                                className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-100/70 border border-slate-200 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                                    <LogIn className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-black text-slate-950 truncate">
                                            Booking: {booking.user?.name || "Guest"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {booking.guestPhone && (
                                                <a 
                                                    href={`https://wa.me/${booking.guestPhone.replace(/\D/g, '')}`} 
                                                    target="_blank"
                                                    className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors shrink-0 border border-emerald-200"
                                                    title="Contact on WhatsApp"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <span className="text-[11px] text-slate-600 font-bold">
                                                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-700">
                                        <p className="truncate font-medium">
                                            Room: <span className="font-bold text-slate-900">{booking.room?.name || 'Standard'}</span> • Price: <span className="font-black text-slate-950">₹{booking.totalPrice || 0}</span>
                                        </p>
                                        <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
                                            {booking.status || 'Confirmed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredActivity.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-500 border border-slate-200">
                                    <History className="w-7 h-7" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">No activity yet</p>
                                <p className="text-xs text-slate-600 font-medium max-w-xs mt-1">Bookings and guest check-ins will show up here in real time.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Today's Focus (4 Cols) */}
                <div className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-slate-50/50">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-950">Today's Focus</h3>
                            <p className="text-xs text-slate-600 font-medium">Key check-ins & actions</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Pending Arrivals</span>
                                <span className="px-2.5 py-0.5 bg-slate-950 text-white text-xs font-black rounded-full shadow-xs">
                                    {pendingArrivalsCount}
                                </span>
                            </div>
                            <div className="flex -space-x-2">
                                {allBookings.filter((b: any) => b && b.checkIn && new Date(b.checkIn).toDateString() === today).slice(0, 3).map((b: any, i: number) => (
                                    <div 
                                        key={b.id || i} 
                                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-black text-slate-900 shadow-xs" 
                                        title={b.user?.name || "Guest"}
                                    >
                                        {b.user?.name?.charAt(0) || "G"}
                                    </div>
                                ))}
                                {pendingArrivalsCount > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-black text-blue-900 shadow-xs border border-blue-200">
                                        +{pendingArrivalsCount - 3}
                                    </div>
                                )}
                                {pendingArrivalsCount === 0 && (
                                    <p className="text-xs text-slate-700 py-1 font-bold">No arrivals scheduled for today</p>
                                )}
                            </div>
                        </div>

                        {/* Property summary info */}
                        <div className="p-4 bg-white rounded-xl border border-slate-300 text-xs space-y-2">
                            <div className="flex items-center justify-between text-slate-700 font-medium">
                                <span>Total Rooms</span>
                                <span className="font-black text-slate-950">{totalRoomsCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700 font-medium">
                                <span>Occupied Rooms</span>
                                <span className="font-black text-slate-950">{activeBookingsCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700 font-medium">
                                <span>Today's Estimated Revenue</span>
                                <span className="font-black text-emerald-700">₹{Math.round(totalRevenue).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
