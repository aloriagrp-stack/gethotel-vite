import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    CreditCard, TrendingUp, TrendingDown, 
    DollarSign, ArrowUpRight, ArrowDownRight,
    Loader2, History, AlertCircle, Download, Calendar, ArrowLeft,
    Building2, Receipt, PieChart, CheckCircle2, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";

export default function FinancialHubPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [filterPeriod, setFilterPeriod] = useState<"all" | "this_month" | "this_year">("all");

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                const [bookingRes, hotelRes] = await Promise.all([
                    adminApi.getAllBookings(),
                    adminApi.getAllHotels()
                ]);
                if (bookingRes.data) setBookings(bookingRes.data);
                if (hotelRes.data) setHotels(hotelRes.data);
            } catch (err) {
                console.error("Failed to fetch financial data", err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.role === 'super_admin') fetchFinanceData();
    }, [user]);

    // Financial Data Calculations
    const stats = useMemo(() => {
        const totalGrossRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
        const platformNetProfit = Math.round(totalGrossRevenue * 0.12);
        const hotelPayoutsTotal = Math.round(totalGrossRevenue * 0.88);
        const paidBookingsCount = bookings.filter(b => b.status === "confirmed" || b.status === "completed" || b.status === "paid").length;
        const totalBookingsCount = bookings.length;
        const avgOrderValue = totalBookingsCount > 0 ? Math.round(totalGrossRevenue / totalBookingsCount) : 0;
        const amountCollectedOnline = Math.round(totalGrossRevenue * 0.12);
        const amountDueAtHotel = totalGrossRevenue - amountCollectedOnline;

        return {
            totalGrossRevenue,
            platformNetProfit,
            hotelPayoutsTotal,
            paidBookingsCount,
            totalBookingsCount,
            avgOrderValue,
            amountCollectedOnline,
            amountDueAtHotel
        };
    }, [bookings]);

    // Hotel-wise P&L breakdown
    const hotelFinancialBreakdown = useMemo(() => {
        const map: Record<string, { hotelName: string; city: string; totalRevenue: number; bookingCount: number; platformFee: number; hotelPayout: number }> = {};

        bookings.forEach(b => {
            const hName = b.hotelName || "Hotel Partner";
            const amount = b.totalAmount || 0;
            if (!map[hName]) {
                map[hName] = {
                    hotelName: hName,
                    city: b.city || "India",
                    totalRevenue: 0,
                    bookingCount: 0,
                    platformFee: 0,
                    hotelPayout: 0
                };
            }
            map[hName].totalRevenue += amount;
            map[hName].bookingCount += 1;
            map[hName].platformFee += Math.round(amount * 0.12);
            map[hName].hotelPayout += Math.round(amount * 0.88);
        });

        return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [bookings]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#050505] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            </div>
        );
    }

    const cards = [
        { label: "Total Gross GMV Revenue", value: `₹${stats.totalGrossRevenue.toLocaleString()}`, icon: DollarSign, sub: `From ${stats.totalBookingsCount} total bookings`, trend: "+18.4%" },
        { label: "Platform Net Profit (12%)", value: `₹${stats.platformNetProfit.toLocaleString()}`, icon: TrendingUp, sub: "Direct platform earnings", trend: "+22.1%" },
        { label: "Hotel Partner Payouts (88%)", value: `₹${stats.hotelPayoutsTotal.toLocaleString()}`, icon: CreditCard, sub: "Disbursed to hotel properties", trend: "+16.8%" },
        { label: "Average Stay Value (AOV)", value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: Receipt, sub: "Per completed reservation", trend: "+4.2%" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                        <span>Platform Financial Hub & Profit Ledger</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-semibold mt-1">
                        Real-time revenue settlement, platform 12% commission ledger, and property payout statements.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value as any)}
                        className="bg-[#141414] border border-[#282828] text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-neutral-500 cursor-pointer uppercase tracking-wider"
                    >
                        <option value="all">All Time Financials</option>
                        <option value="this_month">This Month</option>
                        <option value="this_year">This Fiscal Year</option>
                    </select>

                    <button 
                        onClick={() => alert("Downloading Financial Ledger Statement (PDF)...")}
                        className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider shadow-md"
                    >
                        <Download className="w-4 h-4 text-black" />
                        <span>Export Statement</span>
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 bg-[#161616] border border-[#282828] rounded-xl flex items-center justify-center shadow-inner">
                                    <Icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
                                    {card.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-2xl font-black text-white tracking-tight">{card.value}</h3>
                                <p className="text-[9px] text-neutral-500 font-semibold mt-1">{card.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2 Column Layout: Breakdown & Settlement Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Booking Flow Breakdown (5 COLS) */}
                <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
                        <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-emerald-400" />
                            <span>Revenue Split Summary</span>
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">12% / 88% Model</span>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-[#161616]">
                            <span className="text-neutral-400 text-[10px] uppercase">Total Bookings Count:</span>
                            <span className="text-white font-bold">{stats.totalBookingsCount} Reservations</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#161616]">
                            <span className="text-neutral-400 text-[10px] uppercase">Paid & Confirmed:</span>
                            <span className="text-emerald-400 font-bold">{stats.paidBookingsCount} Stays</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#161616]">
                            <span className="text-neutral-400 text-[10px] uppercase">Gross Collected Online (12%):</span>
                            <span className="text-white font-bold">₹{stats.amountCollectedOnline.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#161616]">
                            <span className="text-neutral-400 text-[10px] uppercase">Direct Hotel Collection (88%):</span>
                            <span className="text-amber-400 font-bold">₹{stats.amountDueAtHotel.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 text-sm">
                            <span className="text-neutral-300 font-bold uppercase text-xs">Net Platform Earnings:</span>
                            <span className="text-emerald-400 font-black text-base">₹{stats.platformNetProfit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Hotel Partner Settlement Table (7 COLS) */}
                <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
                        <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span>Hotel Partner Financial Breakdown</span>
                        </h3>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{hotelFinancialBreakdown.length} Properties</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#1f1f1f] text-[9px] font-black uppercase text-neutral-500 tracking-wider">
                                    <th className="py-2.5 px-3">Hotel Property</th>
                                    <th className="py-2.5 px-3 text-right">Bookings</th>
                                    <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                                    <th className="py-2.5 px-3 text-right">Platform Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#161616] text-xs font-mono">
                                {hotelFinancialBreakdown.slice(0, 7).map((item) => (
                                    <tr key={item.hotelName} className="hover:bg-[#121212] transition-colors">
                                        <td className="py-3 px-3">
                                            <span className="font-bold text-white uppercase block text-xs truncate max-w-[180px]">{item.hotelName}</span>
                                            <span className="text-[9px] text-neutral-500">{item.city}</span>
                                        </td>
                                        <td className="py-3 px-3 text-right text-neutral-300 font-bold">{item.bookingCount}</td>
                                        <td className="py-3 px-3 text-right font-bold text-white">₹{item.totalRevenue.toLocaleString()}</td>
                                        <td className="py-3 px-3 text-right font-bold text-emerald-400">₹{item.platformFee.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
