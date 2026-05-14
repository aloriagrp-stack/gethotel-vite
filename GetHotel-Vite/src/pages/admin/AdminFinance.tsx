

import { useState, useEffect } from "react";
import { 
    CreditCard, TrendingUp, TrendingDown, 
    DollarSign, ArrowUpRight, ArrowDownRight,
    Loader2, History, CheckCircle2, XCircle, 
    AlertCircle, Download, Calendar, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";

export default function FinancialHubPage() {
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState<any>(null);

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                const resData = await adminApi.getStats();
                if (resData.success) {
                    // For now using stats endpoint, but in a real app this would be a dedicated finance endpoint
                    setFinanceData(resData.data);
                }
            } catch (err) {
                console.error("Failed to fetch financial data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFinanceData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    const cards = [
        { label: "Total Gross Revenue", value: `₹${financeData?.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", isUp: true, color: "blue" },
        { label: "Platform Earnings (10%)", value: `₹${(financeData?.totalRevenue * 0.1).toLocaleString()}`, icon: TrendingUp, trend: "+8.2%", isUp: true, color: "emerald" },
        { label: "Total Payouts", value: `₹${(financeData?.totalRevenue * 0.9).toLocaleString()}`, icon: CreditCard, trend: "+10.1%", isUp: true, color: "slate" },
        { label: "Cancellations", value: "₹0", icon: TrendingDown, trend: "0%", isUp: false, color: "red" },
    ];

    return (
        <div className="p-8 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Financial Management</h1>
                        <p className="text-slate-500 font-medium">Detailed breakdown of platform revenue, payouts, and transactions.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> This Month
                        </button>
                        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        card.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                        card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                        card.color === 'red' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1",
                                        card.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                    )}>
                                        {card.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {card.trend}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-900" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Transactions</h3>
                            </div>
                            <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                View All <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {/* Dummy Transactions for UI demo */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Booking Payment — ID #TXN882{i}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">24 Oct 2023, 10:30 AM</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900">+₹4,500</p>
                                        <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Settled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Distribution Card */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 text-white p-8 rounded-[40px] border border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 blur-[60px] rounded-full -tr-10"></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Settlement Info
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Settlements</p>
                                    <p className="text-2xl font-black text-amber-500">₹0</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Next Payout Date</p>
                                    <p className="text-lg font-black text-slate-200">Nov 01, 2023</p>
                                </div>
                            </div>
                            <button className="w-full mt-10 py-4 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all rounded-2xl flex items-center justify-center gap-2">
                                Process Payouts
                            </button>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">Financial Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>Successful Bookings</span>
                                    <span className="text-slate-900">{financeData?.totalBookings || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>Failed Payments</span>
                                    <span className="text-slate-900">0</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>Refund Requests</span>
                                    <span className="text-slate-900">0</span>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Platform Net</span>
                                    <span className="text-lg font-black text-emerald-600">₹{(financeData?.totalRevenue * 0.1).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



