

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    TrendingUp, Users, Hotel, BarChart3, 
    ArrowUpRight, ArrowDownRight, CreditCard, 
    Calendar, Loader2, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SuperAdminStatsPage() {
    const { user, loading: authLoading } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resData = await adminApi.getStats();
                if (resData.success) {
                    setStatsData(resData.data);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'super_admin') fetchStats();
    }, [user]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    const cards = [
        { label: "Total Revenue", value: "₹" + (statsData?.totalRevenue || 0).toLocaleString(), icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Total Hotels", value: statsData?.totalHotels || 0, icon: Hotel, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Users", value: statsData?.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Total Bookings", value: statsData?.totalBookings || 0, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Platform <span className="text-brand-600">Analytics</span></h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time performance and growth metrics</p>
                </div>
                <Link to="/admin/super" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110", card.bg)} />
                            <Icon className={cn("w-6 h-6 mb-6", card.color)} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" /> Growth Overview
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Growth charts will be available in next update</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" /> Revenue Distribution
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Revenue analytics will be available in next update</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



