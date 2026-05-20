

import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    BarChart3, PieChart, TrendingUp, 
    Calendar as CalendarIcon, Download, 
    Loader2, ChevronRight, ArrowUpRight, 
    ArrowDownRight, Users, Hotel, 
    DollarSign, XCircle, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";
import { motion } from "framer-motion";

export default function PartnerAnalyticsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                setBookings(myHotel.bookings || []);
            }
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchAnalytics();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const calculateStats = () => {
        const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0);
        const totalBookings = bookings.length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const adr = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const occupancy = "68%"; // Placeholder for real calc

        return { totalRevenue, totalBookings, cancelledBookings, adr, occupancy };
    };

    const stats = calculateStats();

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const monthlyData = [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: stats.totalRevenue || 0 },
    ];

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence & Analytics</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Deep dive into your property's performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3.5 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-none hover:bg-slate-50 transition-all flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Export PDF
                    </button>
                    <button className="px-6 py-3.5 bg-slate-900 text-white text-xs font-bold rounded-none hover:bg-black transition-all shadow-lg flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-none flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Daily Rate</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">₹{stats.adr.toFixed(0)}</h3>
                    <div className="mt-2 flex items-center text-emerald-500 font-bold text-[10px]">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> +4.2% from last month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-none flex items-center justify-center text-emerald-600">
                            <Hotel className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{stats.occupancy}</h3>
                    <div className="mt-2 flex items-center text-emerald-500 font-bold text-[10px]">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> +12% from last month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-none flex items-center justify-center text-purple-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString()}</h3>
                    <div className="mt-2 flex items-center text-slate-400 font-bold text-[10px]">
                        Across {stats.totalBookings} bookings
                    </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-none flex items-center justify-center text-red-600">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancellations</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{stats.cancelledBookings}</h3>
                    <div className="mt-2 flex items-center text-red-500 font-bold text-[10px]">
                        <ArrowDownRight className="w-3 h-3 mr-1" /> -2% from last month
                    </div>
                </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Bar Chart */}
                <div className="bg-white p-10 rounded-none border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-none blur-3xl -mr-32 -mt-32" />
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue Trends</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Monthly performance overview</p>
                        </div>
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex items-end justify-between h-64 gap-4 relative z-10">
                        {monthlyData.map((data, index) => {
                            const height = (data.revenue / maxRevenue) * 100;
                            return (
                                <div key={data.month} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex flex-col justify-end h-full">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                            className="w-full bg-slate-900 rounded-none group-hover:bg-blue-600 transition-colors relative"
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                ₹{data.revenue.toLocaleString()}
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{data.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Booking Source & Room Performance */}
                <div className="space-y-10">
                    <div className="bg-slate-900 p-10 rounded-none text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-none blur-3xl -ml-32 -mb-32" />
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-400" /> Room Type Performance
                        </h3>
                        <div className="space-y-6">
                            {[
                                { name: "Deluxe Ocean View", revenue: "₹2.4L", percentage: 65, color: "bg-blue-500" },
                                { name: "Executive Suite", revenue: "₹1.1L", percentage: 25, color: "bg-purple-500" },
                                { name: "Standard Twin", revenue: "₹45K", percentage: 10, color: "bg-emerald-500" },
                            ].map((room) => (
                                <div key={room.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span>{room.name}</span>
                                        <span className="text-blue-400">{room.revenue}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${room.percentage}%` }}
                                            transition={{ duration: 1.5 }}
                                            className={cn("h-full rounded-none", room.color)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Booking Insights</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50 rounded-none border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Bookings</p>
                                <p className="text-xl font-black text-slate-900">82%</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-none border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Returning Guests</p>
                                <p className="text-xl font-black text-slate-900">18%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



