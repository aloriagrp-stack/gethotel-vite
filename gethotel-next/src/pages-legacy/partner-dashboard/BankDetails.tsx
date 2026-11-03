'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    CheckCircle2, AlertCircle, Loader2, Save, 
    Eye, EyeOff, ShieldCheck, Clock, XCircle,
    Landmark, CreditCard, ArrowLeft, Building2, Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { partnerApi, hotelApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PartnerBankDetails() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [existingBank, setExistingBank] = useState<any>(null);

    const [formData, setFormData] = useState({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "Current",
        upiId: ""
    });

    const popularBanks = [
        "HDFC Bank", "State Bank of India (SBI)", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank"
    ];

    const loadData = async () => {
        try {
            const activeHotelId = typeof window !== 'undefined' 
                ? (sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId'))
                : null;
            
            const hotelRes = await hotelApi.getMyHotels({ hotelId: activeHotelId || undefined });
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
                            setFormData({
                                accountHolderName: bankRes.data.accountHolderName || "",
                                bankName: bankRes.data.bankName || "",
                                accountNumber: bankRes.data.accountNumber || "",
                                ifscCode: bankRes.data.ifscCode || "",
                                accountType: bankRes.data.accountType || "Current",
                                upiId: bankRes.data.upiId || ""
                            });
                        } else {
                            setFormData(prev => ({
                                ...prev,
                                accountHolderName: currentHotel.name || authUser?.name || ""
                            }));
                        }
                    } catch (bErr) {
                        console.warn("No bank details yet:", bErr);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "ifscCode" ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value
        }));
        if (errorMessage) setErrorMessage("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSaveSuccess(false);

        if (!hotel?.id) {
            setErrorMessage("No active hotel selected.");
            return;
        }

        if (!formData.accountHolderName.trim()) {
            setErrorMessage("Account Holder Name is required.");
            return;
        }

        if (!formData.bankName.trim()) {
            setErrorMessage("Bank Name is required.");
            return;
        }

        if (!formData.accountNumber.trim()) {
            setErrorMessage("Account Number is required.");
            return;
        }

        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        const cleanIfsc = formData.ifscCode.trim().toUpperCase();
        if (!cleanIfsc || !ifscRegex.test(cleanIfsc)) {
            setErrorMessage("Please enter a valid 11-digit IFSC code (e.g. HDFC0001234).");
            return;
        }

        if (!formData.upiId.trim()) {
            setErrorMessage("UPI ID is required.");
            return;
        }

        setSaving(true);
        try {
            const res = await partnerApi.saveBankDetails(hotel.id, {
                accountHolderName: formData.accountHolderName.trim(),
                bankName: formData.bankName.trim(),
                accountNumber: formData.accountNumber.trim(),
                ifscCode: cleanIfsc,
                accountType: formData.accountType,
                upiId: formData.upiId.trim()
            });

            if (res.success) {
                setSaveSuccess(true);
                setExistingBank(res.data);
                setTimeout(() => setSaveSuccess(false), 5000);
            } else {
                setErrorMessage(res.message || "Failed to update bank details");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Something went wrong while updating bank details.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-800 font-bold">Loading bank details...</p>
            </div>
        );
    }

    const bankStatus = existingBank?.status || (existingBank?.isVerified ? 'approved' : (existingBank?.accountNumber ? 'pending' : 'none'));
    const activeHotelQuery = hotel?.id ? `?activeHotelId=${hotel.id}` : '';

    return (
        <div className="max-w-4xl mx-auto py-2 pb-16 space-y-8">
            {/* Top Navigation & Header - Flat on bg with bottom divider */}
            <div className="pb-6 border-b border-slate-300 space-y-4">
                <Link
                    href={`/partner-dashboard/payments${activeHotelQuery}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Earnings & Payouts</span>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1.5">
                                <CreditCard className="w-3 h-3 text-blue-700" />
                                Settlement Account
                            </span>
                            <span className="text-xs text-slate-600 font-semibold">• {hotel?.name}</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                            Bank Account & UPI Details
                        </h1>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                            Add or update your bank credentials to receive booking payouts and instant withdrawals.
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                        {bankStatus === 'approved' && (
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                Account Verified
                            </span>
                        )}
                        {bankStatus === 'pending' && (
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 inline-flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                                Approval Pending
                            </span>
                        )}
                        {bankStatus === 'none' && (
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                                Details Not Added
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Notices */}
            {bankStatus === 'pending' && (
                <div className="p-4 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 flex items-start gap-3 text-xs leading-relaxed font-medium">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                        <p className="font-bold text-amber-950">Verification in Progress with Super Admin</p>
                        <p className="text-amber-900 mt-0.5">
                            Your bank details have been submitted to Super Admin for verification. Once approved, you will receive an activation email and automated payouts will begin.
                        </p>
                    </div>
                </div>
            )}

            {bankStatus === 'approved' && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-start gap-3 text-xs leading-relaxed font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-emerald-950">Bank Account Verified & Active</p>
                        <p className="text-emerald-900 mt-0.5">
                            Your bank account is verified by Super Admin. All booking payouts will be sent to this account. Updating details will require re-verification.
                        </p>
                    </div>
                </div>
            )}

            {bankStatus === 'rejected' && (
                <div className="p-4 rounded-xl bg-rose-100 text-rose-950 border border-rose-300 flex items-start gap-3 text-xs leading-relaxed font-medium">
                    <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-rose-950">Verification Declined</p>
                        <p className="text-rose-900 mt-0.5">
                            {existingBank?.rejectionReason || "Please verify your account number and IFSC code, and submit again."}
                        </p>
                    </div>
                </div>
            )}

            {saveSuccess && (
                <div className="p-4 rounded-xl bg-blue-100 text-blue-950 border border-blue-300 flex items-center gap-3 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Bank details submitted successfully! Sent to Super Admin for approval.</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-100 text-rose-950 border border-rose-300 flex items-center gap-3 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Bank Form - Flat directly on canvas, with divider lines */}
            <form onSubmit={handleSave} className="space-y-6">
                {/* Account Holder Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Account Holder Name <span className="text-rose-600">*</span>
                    </label>
                    <input 
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        placeholder="Legal name as registered with the bank"
                        required
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-xs"
                    />
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                        Must match the business or owner name on your bank statement / cancelled cheque.
                    </p>
                </div>

                {/* Bank Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Bank Name <span className="text-rose-600">*</span>
                    </label>
                    <input 
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                        required
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-xs"
                    />

                    {/* Quick Bank Chips */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {popularBanks.map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, bankName: b }))}
                                className={cn(
                                    "px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all cursor-pointer",
                                    formData.bankName === b
                                        ? "bg-slate-950 text-white border-slate-950"
                                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                                )}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Number */}
                <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Bank Account Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                        <input 
                            type={showAccountNumber ? "text" : "password"}
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            placeholder="Enter bank account number"
                            required
                            className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all tracking-wider shadow-xs"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-950 cursor-pointer"
                        >
                            {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* IFSC Code & Account Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1.5">
                            IFSC Code <span className="text-rose-600">*</span>
                        </label>
                        <input 
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleChange}
                            placeholder="e.g. HDFC0001234"
                            maxLength={11}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black uppercase text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-xs"
                        />
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">11-character alphanumeric code</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1.5">
                            Account Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Current", "Savings"].map((type) => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setFormData(prev => ({ ...prev, accountType: type }))}
                                    className={cn(
                                        "py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center",
                                        formData.accountType === type
                                            ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                            : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* UPI ID (Mandatory) */}
                <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        UPI ID (Virtual Payment Address) <span className="text-rose-600">*</span>
                    </label>
                    <input 
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="e.g. yourhotel@upi or business@okhdfcbank"
                        required
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-xs"
                    />
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Required for instant payouts and verification</p>
                </div>

                {/* Save / Submit Row with Divider */}
                <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Encrypted with 256-bit bank-grade security & Super Admin verified</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/partner-dashboard/payments${activeHotelQuery}`}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{bankStatus === 'approved' ? 'Update & Re-verify' : 'Submit for Approval'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

