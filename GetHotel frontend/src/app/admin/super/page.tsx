"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hotelApi } from "@/lib/api";
import { 
    LayoutDashboard, Hotel, Users, 
    BarChart3, Settings, LogOut, 
    Bell, Search, Plus, Filter,
    CheckCircle2, XCircle, Clock,
    CreditCard, TrendingUp, MoreVertical,
    ArrowUpRight, ArrowDownRight, Globe, ChevronRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SuperAdminDashboard() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") || "overview";
    const [activeTab, setActiveTab] = useState(tabParam);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [hotels, setHotels] = useState<any[]>([]);
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setActiveTab(tabParam);
    }, [tabParam]);

    // Fetch Data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            // Fetch Hotels
            const res = await hotelApi.getHotels();
            setHotels(res.data);

            // Fetch Stats
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const sData = await statsRes.json();
            if (sData.success) {
                setStatsData(sData.data);
            }
        } catch (err) {
            console.error("Super Admin fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'super_admin') fetchAllData();
    }, [user]);

    const stats = [
        { label: "Platform Earnings (18%)", value: "₹" + Math.round((statsData?.totalRevenue || 0) * 0.18).toLocaleString(), trend: "+15.2%", isUp: true, icon: TrendingUp },
        { label: "Gross Volume (GMV)", value: "₹" + (statsData?.totalRevenue || 0).toLocaleString(), trend: "+12.5%", isUp: true, icon: CreditCard },
        { label: "Total Hotels", value: (statsData?.totalHotels || 0).toString(), trend: "+4", isUp: true, icon: Hotel },
        { label: "Total Bookings", value: (statsData?.totalBookings || 0).toString(), trend: "-2%", isUp: false, icon: BarChart3 },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                        {activeTab === 'overview' ? 'System Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">Monitoring platform statistics and property requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm w-64 focus:outline-none focus:border-slate-400 font-medium text-xs shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 relative shadow-sm">
                        <Bell className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            </header>

            {activeTab === "overview" && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                                            stat.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Conversion Intelligence & Destination Insights - NEW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-sm shadow-xl relative overflow-hidden group">
                            <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 pb-4 border-b border-white/5 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" /> Conversion Intelligence
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Search → Booking</p>
                                        <p className="text-2xl font-black italic">4.2%</p>
                                        <p className="text-[9px] text-emerald-400 font-bold mt-1">Healthy</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Abandoned Checkout</p>
                                        <p className="text-2xl font-black italic">18.5%</p>
                                        <p className="text-[9px] text-red-400 font-bold mt-1">+2.1% spike</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Repeat Guest %</p>
                                        <p className="text-2xl font-black italic">22.8%</p>
                                        <p className="text-[9px] text-blue-400 font-bold mt-1">Growing</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg. Booking Value</p>
                                        <p className="text-2xl font-black italic">₹8,450</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1">Per stay</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600" /> Top Destinations
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { city: "New Delhi", share: 42, color: "bg-blue-600" },
                                    { city: "Jaipur", share: 28, color: "bg-emerald-600" },
                                    { city: "Agra", share: 18, color: "bg-amber-600" },
                                    { city: "Mumbai", share: 12, color: "bg-slate-900" }
                                ].map(dest => (
                                    <div key={dest.city} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span>{dest.city}</span>
                                            <span className="text-slate-400">{dest.share}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full", dest.color)} style={{ width: `${dest.share}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Approvals</h3>
                                <button 
                                    onClick={() => router.push('/admin/super/requests')}
                                    className="text-[10px] font-bold text-brand-600 uppercase tracking-widest border border-brand-200 px-3 py-1 hover:bg-brand-50 transition-all"
                                >
                                    View All Requests
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {statsData?.recentRequests?.filter((r: any) => r.status === "pending").slice(0, 5).map((req: any) => (
                                    <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-none">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                                <Hotel className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-900 text-sm truncate w-48">{req.hotelName}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => router.push('/admin/super/requests')}
                                                className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-sm hover:bg-black"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!statsData?.recentRequests || statsData.recentRequests.filter((r: any) => r.status === "pending").length === 0) && (
                                    <div className="py-20 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No pending approvals</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">System Actions</h3>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => router.push('/admin/super/requests')}
                                        className="w-full py-3 bg-brand-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-brand-700 transition-none flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" /> View Requests
                                    </button>
                                    <button className="w-full py-3 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-none flex items-center justify-center gap-2">
                                        <Globe className="w-3 h-3" /> Platform Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "hotels" && (
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Property Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hotel Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hotels.map((hotel) => (
                                    <tr 
                                        key={hotel.id} 
                                        onClick={() => router.push(`/admin/super/hotels/${hotel.id}`)}
                                        className="hover:bg-slate-50 transition-none cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                    {hotel.thumbnail ? (
                                                        <Image src={hotel.thumbnail} alt={hotel.name} width={32} height={32} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <Hotel className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{hotel.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{hotel.city}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-900">₹{hotel.pricePerNight}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-900 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
