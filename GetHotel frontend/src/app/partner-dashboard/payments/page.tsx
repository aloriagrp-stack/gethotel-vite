"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    CreditCard, DollarSign, Download, 
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Loader2, Search, Filter, History,
    CheckCircle2, Clock, Wallet, Banknote,
    FileText, ShieldCheck, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerPaymentsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const COMMISSION_RATE = 0.10; // 10% commission

    const fetchFinancials = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                const paidBookings = (myHotel.bookings || []).filter((b: any) => b.paymentStatus === 'paid');
                setBookings(paidBookings);
            }
        } catch (err) {
            console.error("Failed to fetch financial data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchFinancials();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const calculateTotals = () => {
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const commission = totalRevenue * COMMISSION_RATE;
        const netEarnings = totalRevenue - commission;
        return { totalRevenue, commission, netEarnings };
    };

    const { totalRevenue, commission, netEarnings } = calculateTotals();

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Payouts</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Track your earnings, commissions and bank settlements</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Statement
                    </button>
                </div>
            </div>

            {/* Financial Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Revenue</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 relative z-10">₹{totalRevenue.toLocaleString()}</h3>
                    <div className="mt-6 flex items-center gap-2 relative z-10">
                        <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since last month</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] -mr-20 -mb-20" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Next Payout</span>
                    </div>
                    <h3 className="text-4xl font-black relative z-10">₹{netEarnings.toLocaleString()}</h3>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Scheduled for 15th May
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Commission Paid</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 relative z-10">₹{commission.toLocaleString()}</h3>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 italic">Platform Fee (10%)</p>
                </div>
            </div>

            {/* Settlement Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" /> Transaction History
                    </h3>
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Date Range</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <CreditCard className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{booking.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                            #{booking.id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-700">₹{booking.totalPrice.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-red-500">-₹{(booking.totalPrice * COMMISSION_RATE).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">₹{(booking.totalPrice * (1 - COMMISSION_RATE)).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                            Processed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center flex flex-col items-center">
                                        <Banknote className="w-16 h-16 text-slate-100 mb-4" />
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">No financial transactions found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Information Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Verified Settlements</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            All payouts are processed every 15 days after commission deduction. Ensure your bank details are up to date in the settings tab.
                        </p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-start gap-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center shrink-0">
                        <FileText className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">GST & Invoicing</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Monthly GST invoices for platform commissions can be downloaded from the reports section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
