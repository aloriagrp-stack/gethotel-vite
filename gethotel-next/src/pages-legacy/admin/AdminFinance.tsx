'use client';
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    CreditCard, TrendingUp, 
    DollarSign, Loader2, Download, 
    Building2, Receipt, PieChart
} from "lucide-react";
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
            <div className="flex items-center justify-center min-h-[60vh] bg-transparent text-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    const cards = [
        { label: "Gross GMV Volume", value: `₹${stats.totalGrossRevenue.toLocaleString()}`, icon: DollarSign, sub: `${stats.totalBookingsCount} total bookings`, trend: "+18.4%" },
        { label: "Platform Net Margin (12%)", value: `₹${stats.platformNetProfit.toLocaleString()}`, icon: TrendingUp, sub: "Direct platform earnings", trend: "+22.1%" },
        { label: "Partner Payouts (88%)", value: `₹${stats.hotelPayoutsTotal.toLocaleString()}`, icon: CreditCard, sub: "Payable to hotel inventory", trend: "+16.8%" },
        { label: "Avg. Booking Value (AOV)", value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: Receipt, sub: "Per completed stay", trend: "+4.2%" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Financial Overview
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Real-time revenue settlements, platform 12% commission, and property payout statements.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 font-medium text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-300 cursor-pointer"
                    >
                        <option value="all">All Time</option>
                        <option value="this_month">This Month</option>
                        <option value="this_year">This Fiscal Year</option>
                    </select>

                    <button 
                        onClick={() => alert("Downloading Financial Ledger Statement (PDF)...")}
                        className="px-3.5 py-1.5 bg-white hover:bg-neutral-800 border border-slate-200 text-slate-900 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 text-xs font-medium">{card.label}</span>
                                <Icon className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex items-baseline justify-between mb-1">
                                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{card.value}</h3>
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                    {card.trend}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{card.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* 2 Column Layout: Breakdown & Settlement Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Booking Flow Breakdown */}
                <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <PieChart className="w-3.5 h-3.5 text-emerald-400" /> Revenue Split
                        </h3>
                        <span className="text-[11px] text-emerald-400 font-medium">12% / 88% Model</span>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
                            <span className="text-slate-500">Total Bookings Count:</span>
                            <span className="text-slate-900 font-medium">{stats.totalBookingsCount} Reservations</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
                            <span className="text-slate-500">Paid & Confirmed:</span>
                            <span className="text-emerald-400 font-medium">{stats.paidBookingsCount} Stays</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
                            <span className="text-slate-500">Online Collected (12%):</span>
                            <span className="text-slate-900 font-medium">₹{stats.amountCollectedOnline.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
                            <span className="text-slate-500">Hotel Collection (88%):</span>
                            <span className="text-slate-700 font-medium">₹{stats.amountDueAtHotel.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-700 font-medium">Net Platform Earnings:</span>
                            <span className="text-emerald-400 font-semibold text-base">₹{stats.platformNetProfit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Hotel Partner Settlement Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Property Settlement Ledger
                        </h3>
                        <span className="text-[11px] text-slate-400">{hotelFinancialBreakdown.length} Properties</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 text-[11px] font-medium text-slate-500">
                                    <th className="py-2.5 px-3">Hotel Property</th>
                                    <th className="py-2.5 px-3 text-right">Bookings</th>
                                    <th className="py-2.5 px-3 text-right">Gross GMV</th>
                                    <th className="py-2.5 px-3 text-right">Platform Fee (12%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/40 text-xs">
                                {hotelFinancialBreakdown.slice(0, 8).map((item) => (
                                    <tr key={item.hotelName} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 px-3">
                                            <span className="font-medium text-slate-900 block truncate max-w-[200px]">{item.hotelName}</span>
                                            <span className="text-[11px] text-slate-400">{item.city}</span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-slate-700">{item.bookingCount}</td>
                                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">₹{item.totalRevenue.toLocaleString()}</td>
                                        <td className="py-2.5 px-3 text-right font-medium text-emerald-400">₹{item.platformFee.toLocaleString()}</td>
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
