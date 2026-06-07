import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    CreditCard, TrendingUp, TrendingDown, 
    DollarSign, ArrowUpRight, ArrowDownRight,
    Loader2, History, AlertCircle, Download, Calendar, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { Link } from "react-router-dom";

export default function FinancialHubPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState<any>(null);

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                const res = await adminApi.getAnalytics();
                if (res.success) {
                    setFinanceData(res.data.finance);
                }
            } catch (err) {
                console.error("Failed to fetch financial data", err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.role === 'super_admin') fetchFinanceData();
    }, [user]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    const cards = [
        { label: "Total Gross Revenue", value: `₹${(financeData?.grossRevenue || 0).toLocaleString()}`, icon: DollarSign, sub: "Total value of all bookings", color: "blue" },
        { label: "Platform Net Profit", value: `₹${(financeData?.platformProfit || 0).toLocaleString()}`, icon: TrendingUp, sub: "12% platform fee", color: "emerald" },
        { label: "Paid Online", value: `₹${(financeData?.amountCollectedOnline || 0).toLocaleString()}`, icon: CreditCard, sub: "Already collected via gateway", color: "slate" },
        { label: "Outstanding Dues", value: `₹${(financeData?.outstandingAtHotel || 0).toLocaleString()}`, icon: AlertCircle, sub: "To be collected at hotel check-in", color: "amber" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white p-6 border border-slate-200 shadow-sm transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    card.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                    card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                    card.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{card.value}</h3>
                                <p className="text-[9px] text-slate-500 font-bold mt-2">{card.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Booking Flow Summary</h3>
                <div className="space-y-4 max-w-lg">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Total Lifetime Bookings</span>
                        <span className="text-slate-900">{financeData?.totalBookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Paid & Confirmed Bookings</span>
                        <span className="text-slate-900">{financeData?.paidBookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Gross Online Collection (12%)</span>
                        <span className="text-slate-900">₹{(financeData?.amountCollectedOnline || 0).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Platform Net Profit</span>
                        <span className="text-lg font-black italic text-emerald-600">₹{(financeData?.platformProfit || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
