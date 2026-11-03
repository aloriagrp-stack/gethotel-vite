'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    CheckCircle2, AlertCircle, Loader2,
    Clock, XCircle, ArrowUpRight, Landmark, CreditCard, Download,
    RefreshCw, DollarSign, ChevronRight, X, Calendar, FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { partnerApi, hotelApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PartnerPayments() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Withdraw Modal
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawToast, setWithdrawToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({ show: false, msg: "", type: "success" });

    // Payout History & Bank
    const [payouts, setPayouts] = useState<any[]>([]);
    const [existingBank, setExistingBank] = useState<any>(null);

    // Statement CSV Modal & Date Range
    const [showStatementModal, setShowStatementModal] = useState(false);
    const getTodayStr = () => new Date().toISOString().split('T')[0];
    const getDaysAgoStr = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
    };
    const getMonthStartStr = () => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    };

    const [statementFromDate, setStatementFromDate] = useState(getDaysAgoStr(30));
    const [statementToDate, setStatementToDate] = useState(getTodayStr());

    const loadData = async () => {
        try {
            const activeHotelId = typeof window !== 'undefined' 
                ? (sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId'))
                : null;
            
            const hotelRes = await hotelApi.getMyHotels({ includeBookings: true, hotelId: activeHotelId || undefined });
            if (hotelRes.success && hotelRes.data && hotelRes.data.length > 0) {
                const currentHotel = (activeHotelId ? hotelRes.data.find((h: any) => String(h.id) === String(activeHotelId)) : null) || hotelRes.data[0];
                setHotel(currentHotel);

                if (currentHotel && typeof window !== 'undefined') {
                    sessionStorage.setItem('activeHotelId', String(currentHotel.id));
                    localStorage.setItem('activeHotelId', String(currentHotel.id));
                }

                if (currentHotel?.id) {
                    try {
                        const bankRes = await partnerApi.getBankDetails(currentHotel.id);
                        if (bankRes.success && bankRes.data) {
                            setExistingBank(bankRes.data);
                        }
                    } catch (bErr) {
                        console.warn("No bank details yet:", bErr);
                    }

                    try {
                        const payoutsRes = await partnerApi.getPayouts(currentHotel.id);
                        if (payoutsRes.success && payoutsRes.data) {
                            setPayouts(payoutsRes.data);
                        }
                    } catch (pErr) {
                        console.warn("No payouts yet:", pErr);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load hotel info:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (authUser?.role === 'hotel_admin' || authUser?.role === 'super_admin')) {
            loadData();
        }
    }, [authUser, authLoading]);

    // Financial calculations
    const bookings = hotel?.booking || [];
    const validBookings = bookings.filter((b: any) => b.status !== 'cancelled' && b.status !== 'CANCELLED');
    const totalGrossRevenue = validBookings.reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);
    const platformCommissionRate = 0.12;
    const totalNetEarned = Math.round(totalGrossRevenue * (1 - platformCommissionRate));

    const totalWithdrawn = payouts
        .filter((p: any) => p.status === 'completed' || p.status === 'approved')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const totalPendingPayout = payouts
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const rawAvailable = totalNetEarned - totalWithdrawn - totalPendingPayout;
    const availableBalance = Math.max(0, rawAvailable);

    // Handle Withdrawal Request
    const handleWithdrawSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);

        if (!amt || isNaN(amt) || amt <= 0) {
            setWithdrawToast({ show: true, msg: "Please enter a valid withdrawal amount.", type: "error" });
            return;
        }

        if (availableBalance > 0 && amt > availableBalance) {
            setWithdrawToast({ show: true, msg: `Amount exceeds your available balance of ₹${availableBalance.toLocaleString()}`, type: "error" });
            return;
        }

        if (!existingBank?.accountNumber) {
            setWithdrawToast({ show: true, msg: "Please add your bank account details first before requesting withdrawal.", type: "error" });
            return;
        }

        setWithdrawing(true);
        try {
            const res = await partnerApi.requestPayout(hotel.id, { amount: amt });
            if (res.success) {
                setWithdrawToast({ show: true, msg: `Withdrawal request of ₹${amt.toLocaleString()} submitted successfully!`, type: "success" });
                setShowWithdrawModal(false);
                setWithdrawAmount("");
                loadData();
                setTimeout(() => setWithdrawToast(prev => ({ ...prev, show: false })), 6000);
            } else {
                setWithdrawToast({ show: true, msg: res.message || "Withdrawal failed", type: "error" });
            }
        } catch (err: any) {
            setWithdrawToast({ show: true, msg: err.message || "Withdrawal failed", type: "error" });
        } finally {
            setWithdrawing(false);
        }
    };

    // Calculate difference in days for statement validation
    const getDaysDiff = (from: string, to: string) => {
        if (!from || !to) return 0;
        const fromD = new Date(from);
        const toD = new Date(to);
        const diffMs = toD.getTime() - fromD.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    };

    const statementDiffDays = getDaysDiff(statementFromDate, statementToDate);
    const isStatementRangeValid = statementDiffDays > 0 && statementDiffDays <= 31;

    // Export Online Paid Bookings CSV with Net Hotel Amount (After 12% commission)
    const handleDownloadStatementCSV = () => {
        if (!isStatementRangeValid) return;

        const fromD = new Date(statementFromDate);
        fromD.setHours(0, 0, 0, 0);

        const toD = new Date(statementToDate);
        toD.setHours(23, 59, 59, 999);

        // Filter: Online Paid bookings in date range (excluding cancelled)
        const allBookings = hotel?.booking || [];
        const filteredBookings = allBookings.filter((b: any) => {
            const isCancelled = b.status === 'cancelled' || b.status === 'CANCELLED';
            if (isCancelled) return false;

            const isPaid = b.paymentStatus === 'paid' || b.paymentStatus === 'PAID';
            if (!isPaid) return false;

            const bookingTime = new Date(b.createdAt || b.checkIn).getTime();
            return bookingTime >= fromD.getTime() && bookingTime <= toD.getTime();
        });

        // Compute sums
        let totalGross = 0;
        let totalCommission = 0;
        let totalHotelNet = 0;

        const rows = filteredBookings.map((b: any) => {
            const gross = Number(b.totalPrice) || 0;
            const commission = Math.round(gross * 0.12);
            const hotelNet = gross - commission;

            totalGross += gross;
            totalCommission += commission;
            totalHotelNet += hotelNet;

            const bookingDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A';
            const checkIn = b.checkIn ? new Date(b.checkIn).toLocaleDateString() : 'N/A';
            const checkOut = b.checkOut ? new Date(b.checkOut).toLocaleDateString() : 'N/A';
            const guestName = (b.user?.name || b.guestName || 'Guest').replace(/"/g, '""');
            const roomName = (b.room?.name || 'Room').replace(/"/g, '""');

            return [
                `"#BK-${b.id}"`,
                `"${bookingDate}"`,
                `"${checkIn}"`,
                `"${checkOut}"`,
                `"${guestName}"`,
                `"${roomName}"`,
                `"Online Paid"`,
                gross,
                commission,
                hotelNet
            ].join(",");
        });

        // Build CSV Content
        const lines: string[] = [];
        lines.push("=======================================================================================");
        lines.push(`GETHOTEL STAYS - PARTNER EARNINGS & PAYOUT STATEMENT (ONLINE PAID BOOKINGS)`);
        lines.push("=======================================================================================");
        lines.push(`Hotel Name:,"${(hotel?.name || 'Hotel').replace(/"/g, '""')}"`);
        lines.push(`Hotel ID:,"#${hotel?.id || ''}"`);
        lines.push(`Account Holder:,"${(existingBank?.accountHolderName || hotel?.name || '').replace(/"/g, '""')}"`);
        lines.push(`Payout Bank:,"${existingBank?.bankName || 'Not Linked'} (${existingBank?.maskedAccountNumber || existingBank?.accountNumber || 'N/A'})"`);
        lines.push(`Statement Period:,"${statementFromDate} to ${statementToDate} (${statementDiffDays} Days - Max 31 Days Limit)"`);
        lines.push(`Generated On:,"${new Date().toLocaleString()}"`);
        lines.push(`Platform Commission Rate:,"Flat 12%"`);
        lines.push("=======================================================================================");
        lines.push("");

        // Headers
        lines.push([
            "Booking ID",
            "Booking Date",
            "Check-in",
            "Check-out",
            "Guest Name",
            "Room Type",
            "Payment Status",
            "Gross Booking Amount (INR)",
            "Platform Commission 12% (INR)",
            "Hotel Net Payout (Amount After Commission) (INR)"
        ].join(","));

        if (rows.length > 0) {
            lines.push(...rows);
        } else {
            lines.push('"No online paid bookings found within the selected date range.",,,,,,,,,');
        }

        // Summary
        lines.push("");
        lines.push("=======================================================================================");
        lines.push("STATEMENT FINANCIAL SUMMARY");
        lines.push("=======================================================================================");
        lines.push(`Total Online Paid Bookings:,${filteredBookings.length}`);
        lines.push(`Total Gross Booking Collection (INR):,Rs. ${totalGross.toLocaleString()}`);
        lines.push(`Total GetHotel Commission 12% (INR):,Rs. ${totalCommission.toLocaleString()}`);
        lines.push(`TOTAL HOTEL NET PAYOUT PAYABLE (Commission Kaat Ke):,Rs. ${totalHotelNet.toLocaleString()}`);
        lines.push("=======================================================================================");

        const csvString = lines.join("\r\n");
        const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const safeHotelName = (hotel?.name || 'Hotel').replace(/[^a-zA-Z0-9]/g, '_');
        link.setAttribute("download", `Statement_${safeHotelName}_${statementFromDate}_to_${statementToDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setShowStatementModal(false);
    };

    if (loading || authLoading) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-800 font-bold">Loading earnings & payouts...</p>
            </div>
        );
    }

    const bankStatus = existingBank?.status || (existingBank?.isVerified ? 'approved' : (existingBank?.accountNumber ? 'pending' : 'none'));
    const activeHotelQuery = hotel?.id ? `?activeHotelId=${hotel.id}` : '';
    const bankDetailsUrl = `/partner-dashboard/payments/bank-details${activeHotelQuery}`;

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Global Alert Toast */}
            {withdrawToast.show && (
                <div className={cn(
                    "p-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-sm animate-in fade-in",
                    withdrawToast.type === 'success' 
                        ? "bg-emerald-100 text-emerald-950 border-emerald-300" 
                        : "bg-rose-100 text-rose-950 border-rose-300"
                )}>
                    <div className="flex items-center gap-2.5">
                        {withdrawToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />}
                        <span>{withdrawToast.msg}</span>
                    </div>
                    <button onClick={() => setWithdrawToast(prev => ({ ...prev, show: false }))} className="text-slate-600 hover:text-slate-950 p-1 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ─── 1. TOP PAYOUT CONTAINER (SAME STYLE AS DASHBOARD STATS CONTAINER) ──── */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Left (4 Cols): Heading & Settlement info */}
                <div className="md:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3 text-blue-700" />
                                Settlement & Earnings
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                            Payout Balance
                        </h1>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                            Earnings from completed reservations, available for instant withdrawal to your verified bank account.
                        </p>
                    </div>
                </div>

                {/* Centre (4 Cols): Amount + Withdraw Button */}
                <div className="md:col-span-4 p-6 sm:p-7 flex flex-col items-center justify-center text-center bg-slate-50/40">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                        Available For Withdrawal
                    </span>
                    <div className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight mb-3.5">
                        ₹{availableBalance.toLocaleString()}
                    </div>
                    <button
                        onClick={() => {
                            setWithdrawAmount(availableBalance > 0 ? String(availableBalance) : "");
                            setShowWithdrawModal(true);
                        }}
                        className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        <span>Withdraw Funds</span>
                    </button>
                </div>

                {/* Right (4 Cols): Destination Details */}
                <div className="md:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Landmark className="w-4 h-4 text-slate-900" />
                                Payout Destination
                            </span>
                            {bankStatus === 'approved' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Verified
                                </span>
                            )}
                            {bankStatus === 'pending' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                    Pending Approval
                                </span>
                            )}
                            {bankStatus === 'none' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                                    Not Added
                                </span>
                            )}
                        </div>

                        {existingBank?.accountNumber ? (
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-950">{existingBank.bankName || "Bank"}</p>
                                <p className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                                    {existingBank.maskedAccountNumber || existingBank.accountNumber}
                                </p>
                                <p className="text-xs text-slate-700 font-medium truncate">
                                    {existingBank.accountHolderName} • IFSC: {existingBank.ifscCode}
                                </p>
                                {existingBank?.upiId && (
                                    <p className="text-[11px] text-slate-700 font-medium">
                                        UPI: <span className="font-bold text-slate-950">{existingBank.upiId}</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="py-1">
                                <p className="text-xs text-slate-700 font-semibold">No bank account linked yet</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <Link
                            href={bankDetailsUrl}
                            className="text-xs text-blue-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                            <span>{existingBank?.accountNumber ? "Manage Bank Details" : "+ Add Bank Account"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─── 2. MAIN CONTENT CONTAINER (SAME STYLE AS DASHBOARD BOTTOM SECTION) ──── */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                
                {/* LEFT / MAIN COLUMN (8 cols): Withdrawal History & Notices */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col relative space-y-6">
                    {/* Status Notice if Bank Not Configured or Pending */}
                    {bankStatus === 'none' && (
                        <div className="p-4 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="font-medium">
                                    Bank details are required to withdraw and receive your payout funds.
                                </span>
                            </div>
                            <Link 
                                href={bankDetailsUrl}
                                className="px-3.5 py-1.5 bg-slate-950 text-white font-bold rounded-lg shrink-0 hover:bg-slate-800 transition-colors ml-3 cursor-pointer"
                            >
                                Setup Bank Details
                            </Link>
                        </div>
                    )}

                    {bankStatus === 'pending' && (
                        <div className="p-4 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                                <span className="font-medium">
                                    Your bank details are currently pending verification by Super Admin.
                                </span>
                            </div>
                            <Link 
                                href={bankDetailsUrl}
                                className="text-xs font-bold text-amber-950 hover:underline shrink-0 ml-3"
                            >
                                View Details →
                            </Link>
                        </div>
                    )}

                    {/* Section Header: Withdrawal & Payout History */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
                                <Clock className="w-4 h-4 text-slate-900" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-950 tracking-tight flex items-center gap-2">
                                    <span>Withdrawal & Settlement History</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 font-black text-slate-900">
                                        {payouts.length}
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-600 font-medium">Record of completed payouts & transfers</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowStatementModal(true)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <Download className="w-3.5 h-3.5 text-amber-700" />
                                <span>Export CSV</span>
                            </button>

                            <button
                                onClick={loadData}
                                className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Refresh"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Withdrawal History Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">ID & Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Destination</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-950">
                                            <p>#PO-{p.id}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 font-black text-slate-950 text-sm">
                                            ₹{Number(p.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-slate-800 font-medium">
                                            {p.bankReference || existingBank?.bankName || 'Bank Transfer'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-black capitalize",
                                                p.status === 'completed' || p.status === 'approved' 
                                                    ? "bg-emerald-100 text-emerald-950 border border-emerald-300" 
                                                    : (p.status === 'pending' 
                                                        ? "bg-amber-100 text-amber-950 border border-amber-300" 
                                                        : "bg-slate-200 text-slate-900")
                                            )}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-600">
                                            <Clock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                                            <p className="text-xs font-bold text-slate-900">No withdrawal transactions yet</p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                Your past payouts and withdrawals will show up here.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN (4 cols): Quick Actions & Overview */}
                <div className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-slate-50/40">
                    <div>
                        <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-0.5">
                            Quick Actions
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">Manage your payout settings and records</p>
                    </div>

                    {/* Action Buttons List */}
                    <div className="space-y-2.5">
                        <Link
                            href={bankDetailsUrl}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                        >
                            <span className="flex items-center gap-2.5">
                                <CreditCard className="w-4 h-4 text-blue-700" />
                                <span>Update Bank Account</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <button
                            onClick={() => {
                                setWithdrawAmount(availableBalance > 0 ? String(availableBalance) : "");
                                setShowWithdrawModal(true);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                        >
                            <span className="flex items-center gap-2.5">
                                <ArrowUpRight className="w-4 h-4 text-emerald-700" />
                                <span>Instant Withdraw</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                            onClick={() => setShowStatementModal(true)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                        >
                            <span className="flex items-center gap-2.5">
                                <Download className="w-4 h-4 text-amber-700" />
                                <span>Download Statement (CSV)</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* Support Info */}
                    <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium text-center">
                        Need help with settlements?{" "}
                        <a href="mailto:reservation@gethotelstays.com" className="text-blue-700 font-bold hover:underline">
                            Contact Finance Team
                        </a>
                    </div>
                </div>
            </div>

            {/* ─── 3. WITHDRAWAL MODAL ─────────────────────────────────────────── */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-950">Request Withdrawal</h3>
                                    <p className="text-[11px] text-slate-600 font-medium">Transfer earnings to your verified bank account</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowWithdrawModal(false)}
                                className="text-slate-500 hover:text-slate-950 p-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Balance Banner */}
                        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-bold">Available Balance:</span>
                            <span className="font-black text-slate-950 text-sm">₹{availableBalance.toLocaleString()}</span>
                        </div>

                        {/* Destination Bank Banner */}
                        <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-blue-950">Destination Account:</span>
                                <span className="text-[10px] uppercase font-black text-blue-800">IMPS / NEFT</span>
                            </div>
                            {existingBank?.accountNumber ? (
                                <p className="text-slate-900 font-bold font-mono">
                                    {existingBank.bankName} • {existingBank.maskedAccountNumber || existingBank.accountNumber}
                                </p>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-700 font-bold">No verified bank account found</span>
                                    <Link 
                                        href={bankDetailsUrl}
                                        className="text-blue-800 font-bold underline"
                                    >
                                        Add Bank →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                                    Withdrawal Amount (₹) <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-sm">₹</span>
                                    <input 
                                        type="number"
                                        min="1"
                                        max={availableBalance > 0 ? availableBalance : undefined}
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-slate-500">Min. ₹1 • Max ₹{availableBalance.toLocaleString()}</span>
                                    {availableBalance > 0 && (
                                        <button 
                                            type="button" 
                                            onClick={() => setWithdrawAmount(String(availableBalance))}
                                            className="text-blue-700 font-bold hover:underline cursor-pointer"
                                        >
                                            Withdraw All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={withdrawing || !existingBank?.accountNumber}
                                    className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {withdrawing ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Confirm Transfer</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── 4. STATEMENT CSV DOWNLOAD MODAL WITH 1-MONTH LIMIT ──────────── */}
            {showStatementModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
                                    <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-950">Download Statement (CSV)</h3>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                        Online paid bookings with commission-deducted hotel payout details
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowStatementModal(false)}
                                className="text-slate-500 hover:text-slate-950 p-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                                Quick Preset
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatementFromDate(getDaysAgoStr(7));
                                        setStatementToDate(getTodayStr());
                                    }}
                                    className="py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-center"
                                >
                                    7 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatementFromDate(getDaysAgoStr(15));
                                        setStatementToDate(getTodayStr());
                                    }}
                                    className="py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-center"
                                >
                                    15 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatementFromDate(getMonthStartStr());
                                        setStatementToDate(getTodayStr());
                                    }}
                                    className="py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-center"
                                >
                                    This Month
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatementFromDate(getDaysAgoStr(30));
                                        setStatementToDate(getTodayStr());
                                    }}
                                    className="py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-center"
                                >
                                    1 Month (30d)
                                </button>
                            </div>
                        </div>

                        {/* Date Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                    <span>From Date</span>
                                </label>
                                <input 
                                    type="date"
                                    max={statementToDate || getTodayStr()}
                                    value={statementFromDate}
                                    onChange={(e) => setStatementFromDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                    <span>To Date</span>
                                </label>
                                <input 
                                    type="date"
                                    min={statementFromDate}
                                    max={getTodayStr()}
                                    value={statementToDate}
                                    onChange={(e) => setStatementToDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                />
                            </div>
                        </div>

                        {/* Max 1 Month Limit Validation Feedback */}
                        {statementDiffDays > 31 && (
                            <div className="p-3 bg-rose-100 text-rose-950 border border-rose-300 rounded-xl text-xs font-bold flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black text-rose-950">Selected Range Exceeds 1 Month ({statementDiffDays} Days)</p>
                                    <p className="text-rose-900 text-[11px] font-medium mt-0.5">
                                        Partner can download statements for a maximum of 31 days (1 month) at a time. Please reduce your date range.
                                    </p>
                                </div>
                            </div>
                        )}

                        {statementDiffDays <= 0 && (
                            <div className="p-3 bg-rose-100 text-rose-950 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                                <span>From Date cannot be after To Date.</span>
                            </div>
                        )}

                        {isStatementRangeValid && (
                            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                    <span>Selected Period: <strong className="text-slate-950 font-black">{statementDiffDays} Days</strong> (Max 31 days)</span>
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    Valid Range
                                </span>
                            </div>
                        )}

                        {/* Statement Details Note */}
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] leading-relaxed text-slate-800 font-medium">
                            <p className="font-bold text-slate-950 mb-0.5">What is included in this statement?</p>
                            <p className="text-slate-700">
                                This CSV statement will contain all <strong>online paid bookings</strong> in this period. For each booking, the exact <strong>Hotel Net Payout (after deducting 12% platform commission)</strong> will be provided alongside guest details and summary totals.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setShowStatementModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadStatementCSV}
                                disabled={!isStatementRangeValid}
                                className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Download className="w-3.5 h-3.5 text-amber-400" />
                                <span>Download CSV Statement</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
