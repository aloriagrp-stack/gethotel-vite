'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Plus, Trash2, Loader2, 
    Calendar,
    CheckCircle2, XCircle, Copy, Check,
    Save, X, ArrowRight, Edit3, Power, Sparkles, Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, couponApi } from "@/lib/api";
import confetti from "canvas-confetti";

export default function PartnerCouponsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [hotel, setHotel] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const getTodayStr = () => new Date().toISOString().split('T')[0];
    const getFutureDateStr = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        title: "Special Discount",
        code: "",
        discountType: "percentage",
        discountValue: "20",
        minBookingAmt: "0",
        startDate: getTodayStr(),
        endDate: getFutureDateStr(30),
        usageLimit: "", // Unlimited, no limit
        promoType: "standard",
        targetAudience: "all",
        minStay: "1",
        applyToRooms: "all"
    });

    const PROMO_TEMPLATES = [
        {
            id: "basic_deal",
            title: "Standard Discount",
            tagline: "Baseline 15% discount for all guests",
            discountText: "15% OFF",
            badge: "Popular",
            badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
            defaultValues: {
                title: "Standard Discount",
                promoType: "standard",
                discountType: "percentage",
                discountValue: "15",
                minBookingAmt: "0",
                usageLimit: ""
            }
        },
        {
            id: "weekend",
            title: "Weekend Getaway",
            tagline: "Boost Friday to Sunday check-ins",
            discountText: "20% OFF",
            badge: "Weekend Boost",
            badgeColor: "bg-violet-100 text-violet-900 border-violet-200",
            defaultValues: {
                title: "Weekend Getaway Deal",
                promoType: "weekend",
                discountType: "percentage",
                discountValue: "20",
                minBookingAmt: "1500",
                usageLimit: ""
            }
        },
        {
            id: "early_bird",
            title: "Early Bird Special",
            tagline: "Attract guests planning 14+ days ahead",
            discountText: "25% OFF",
            badge: "Advance Booking",
            badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
            defaultValues: {
                title: "Early Bird Special",
                promoType: "early_bird",
                discountType: "percentage",
                discountValue: "25",
                minBookingAmt: "2000",
                usageLimit: ""
            }
        },
        {
            id: "last_minute",
            title: "Last Minute Deal",
            tagline: "Fill empty rooms for tonight & tomorrow",
            discountText: "30% OFF",
            badge: "Fast Bookings",
            badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
            defaultValues: {
                title: "Last Minute Flash Deal",
                promoType: "last_minute",
                discountType: "percentage",
                discountValue: "30",
                minBookingAmt: "0",
                usageLimit: ""
            }
        },
        {
            id: "long_stay",
            title: "Long Stay Mega Deal",
            tagline: "Reward guests staying 3 or more nights",
            discountText: "40% OFF",
            badge: "High Value",
            badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
            defaultValues: {
                title: "Long Stay Discount",
                promoType: "long_stay",
                discountType: "percentage",
                discountValue: "40",
                minBookingAmt: "4000",
                minStay: "3",
                usageLimit: ""
            }
        }
    ];

    const generateRandomCode = (prefix = "DEAL") => {
        const rand = Math.floor(100 + Math.random() * 900);
        return `${prefix}${rand}`;
    };

    const applyTemplate = (template: any) => {
        setFormData(prev => ({
            ...prev,
            ...template.defaultValues,
            code: generateRandomCode(template.id.substring(0, 4).toUpperCase()),
            startDate: getTodayStr(),
            endDate: getFutureDateStr(30)
        }));
        setEditingCouponId(null);
        setShowModal(true);
    };

    const fetchCoupons = async () => {
        try {
            const activeHotelId = typeof window !== 'undefined' 
                ? (sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId'))
                : null;
            
            const res = await hotelApi.getMyHotels({ light: true, hotelId: activeHotelId || undefined });
            if (res.success && res.data && res.data.length > 0) {
                const currentHotel = (activeHotelId ? res.data.find((h: any) => String(h.id) === String(activeHotelId)) : null) || res.data[0];
                setHotel(currentHotel);

                if (currentHotel?.id) {
                    const couponRes = await couponApi.getCoupons(currentHotel.id);
                    if (couponRes.success) {
                        setCoupons(couponRes.data);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch coupons", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (authUser?.role === 'hotel_admin' || authUser?.role === 'super_admin')) {
            fetchCoupons();
        }
    }, [authUser, authLoading]);

    const handleSaveCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const val = parseFloat(formData.discountValue);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid percentage discount value.");
            return;
        }

        // Strict 10% min to 95% max validation
        if (val < 10 || val > 95) {
            alert("Discount must be between 10% and 95%.");
            return;
        }

        // Auto-generate code if empty
        const autoCode = formData.code?.trim() || generateRandomCode("PROMO");

        const payload = {
            ...formData,
            code: autoCode.toUpperCase(),
            discountType: "percentage", // Always % percentage only
            discountValue: String(val),
            usageLimit: null // No limit / Unlimited usage
        };

        setIsSaving(true);
        try {
            if (editingCouponId) {
                const res = await couponApi.updateCoupon(hotel.id, editingCouponId, payload);
                if (res.success) {
                    setCoupons(prev => prev.map(c => c.id === editingCouponId ? res.data : c));
                    setShowModal(false);
                    setEditingCouponId(null);
                } else {
                    alert(res.message || "Failed to update discount offer.");
                }
            } else {
                const res = await couponApi.createCoupon(hotel.id, payload);
                if (res.success) {
                    confetti({
                        particleCount: 120,
                        spread: 60,
                        origin: { y: 0.6 },
                        colors: ['#2563eb', '#10b981', '#f59e0b']
                    });
                    setCoupons(prev => [res.data, ...prev]);
                    setShowModal(false);
                } else {
                    alert(res.message || "Could not launch offer. Please try again.");
                }
            }
        } catch (err: any) {
            alert(err?.message || "Failed to save discount offer.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (coupon: any) => {
        setFormData({
            title: coupon.title || `${coupon.discountValue}% OFF Deal`,
            code: coupon.code,
            discountType: "percentage",
            discountValue: String(coupon.discountValue || "20"),
            minBookingAmt: String(coupon.minBookingAmt || "0"),
            startDate: coupon.startDate ? coupon.startDate.split('T')[0] : getTodayStr(),
            endDate: coupon.endDate ? coupon.endDate.split('T')[0] : getFutureDateStr(30),
            usageLimit: "",
            promoType: coupon.promoType || "standard",
            targetAudience: coupon.targetAudience || "all",
            minStay: String(coupon.minStay || "1"),
            applyToRooms: coupon.applyToRooms || "all"
        });
        setEditingCouponId(coupon.id);
        setShowModal(true);
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const res = await couponApi.toggleStatus(hotel.id, id, !currentStatus);
            if (res.success) {
                setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
            }
        } catch (err) {
            fetchCoupons();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;
        if (!hotel?.id) return;
        try {
            const res = await couponApi.deleteCoupon(hotel.id, id);
            if (res.success) {
                setCoupons(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            alert("Failed to delete promotion");
        }
    };

    const copyCodeToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-800 font-bold">Loading promotions & discounts...</p>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <XCircle className="w-16 h-16 text-rose-300" />
                <h3 className="text-xl font-black text-slate-950">No Property Found</h3>
                <p className="text-slate-600 font-medium">Please select or list your property first to manage promotions.</p>
            </div>
        );
    }

    // Calculations
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const activeCoupons = coupons.filter(c => {
        const isActive = c.isActive !== false;
        if (!isActive) return false;
        const endDateObj = new Date(c.endDate);
        return todayDate <= endDateObj;
    });

    const quickPercentChips = [10, 15, 20, 25, 30, 40, 50];

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header Greeting & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                        Promotions & Discounts
                    </h1>
                    <p className="text-xs text-slate-600 font-semibold mt-1">• {hotel.name}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setFormData({
                                title: "Launch Special Offer",
                                code: generateRandomCode("DEAL"),
                                discountType: "percentage",
                                discountValue: "20",
                                minBookingAmt: "0",
                                startDate: getTodayStr(),
                                endDate: getFutureDateStr(30),
                                usageLimit: "",
                                promoType: "standard",
                                targetAudience: "all",
                                minStay: "1",
                                applyToRooms: "all"
                            });
                            setEditingCouponId(null);
                            setShowModal(true);
                        }}
                        className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Create Promotion</span>
                    </button>
                </div>
            </div>

            {/* ─── 2. 1-CLICK CAMPAIGN TEMPLATES (NO SQUARED ICONS) ───────────────── */}
            <div className="space-y-3">
                <div>
                    <h2 className="text-base font-black text-slate-950 tracking-tight">
                        Quick Ready-to-Use Templates
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">Click any template below to launch an offer in 10 seconds</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {PROMO_TEMPLATES.map((tmpl) => (
                        <div
                            key={tmpl.id}
                            onClick={() => applyTemplate(tmpl)}
                            className="bg-white rounded-2xl border border-slate-300 p-5 hover:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-black border shadow-2xs", tmpl.badgeColor)}>
                                        {tmpl.discountText}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {tmpl.badge}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-950 group-hover:text-blue-700 transition-colors">
                                        {tmpl.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                        {tmpl.tagline}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                                    Use Template
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-700 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── 3. ACTIVE & PAST OFFERS LIST ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-black text-slate-950 tracking-tight flex items-center gap-2">
                            <span>Your Active & Saved Promotions</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 font-black text-slate-900">
                                {coupons.length}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-600 font-medium">Manage or pause discounts applied to your hotel rooms</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchCoupons}
                            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Refresh promotions"
                        >
                            <Loader2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {coupons.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <h3 className="text-sm font-black text-slate-950">No Promotions Created Yet</h3>
                        <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                            Attract more guests by launching a discount! Pick any template above or click below to launch your first offer.
                        </p>
                        <button
                            onClick={() => {
                                applyTemplate(PROMO_TEMPLATES[0]);
                            }}
                            className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                        >
                            + Create First Promo
                        </button>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coupons.map((coupon) => {
                            const isExpired = new Date(coupon.endDate).getTime() < todayDate.getTime();
                            const isLive = coupon.isActive !== false && !isExpired;
                            const used = Number(coupon.usedCount) || 0;

                            return (
                                <div
                                    key={coupon.id}
                                    className={cn(
                                        "rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 shadow-2xs",
                                        isLive ? "border-slate-300 bg-white hover:border-slate-400" : "border-slate-200 bg-slate-50/70 opacity-75"
                                    )}
                                >
                                    {/* Top Line: Discount Value & Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-2xl font-black tracking-tight text-slate-950">
                                                    {coupon.discountValue}% OFF
                                                </span>
                                                <span className="text-[11px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                                                    {coupon.code}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-semibold">
                                                Valid: {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Now'} — {new Date(coupon.endDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0 flex items-center gap-2">
                                            {isExpired ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-950 border border-rose-300">
                                                    Expired
                                                </span>
                                            ) : coupon.isActive !== false ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 inline-flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                                                    Paused
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Conditions Banner */}
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Min. Booking</span>
                                            <span className="text-xs font-bold text-slate-900">
                                                {Number(coupon.minBookingAmt) > 0 ? `₹${Number(coupon.minBookingAmt).toLocaleString()}` : 'No Minimum Required'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Usage Limit</span>
                                            <span className="text-xs font-black text-emerald-800">
                                                Unlimited ({used} bookings used)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Row */}
                                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive !== false)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                                                coupon.isActive !== false 
                                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800" 
                                                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black"
                                            )}
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                            <span>{coupon.isActive !== false ? "Pause Offer" : "Activate"}</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                                                title="Edit offer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-1.5 text-rose-700 hover:text-rose-950 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                                title="Delete offer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── 4. CREATE / EDIT PROMOTION MODAL (% ONLY, NO USAGE LIMIT) ─────── */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <h3 className="text-base font-black text-slate-950">
                                    {editingCouponId ? "Edit Promotion Offer" : "Create New Promotion Offer"}
                                </h3>
                                <p className="text-[11px] text-slate-600 font-medium">
                                    Set percentage discount for guest bookings (10% to 95%)
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-slate-500 hover:text-slate-950 p-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveCoupon} className="space-y-4">
                            {/* Offer Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                                    Offer / Campaign Name <span className="text-rose-600">*</span>
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Weekend Flash Sale, Special Deal"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                />
                            </div>

                            {/* Percentage Discount Value */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                                    Discount Percentage (%) <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        required
                                        min="10"
                                        max="95"
                                        placeholder="e.g. 20"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                                        className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700">
                                        % OFF
                                    </span>
                                </div>

                                {/* Quick Chips */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {quickPercentChips.map((pct) => (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, discountValue: String(pct) }))}
                                            className={cn(
                                                "px-2.5 py-1 text-xs rounded-lg border font-bold transition-all cursor-pointer",
                                                Number(formData.discountValue) === pct
                                                    ? "bg-slate-950 text-white border-slate-950"
                                                    : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100"
                                            )}
                                        >
                                            {pct}% OFF
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium mt-1.5">
                                    Min. 10% to Max. 95% discount allowed.
                                </p>
                            </div>

                            {/* Min Booking Amount */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                                    Minimum Booking Amount (₹)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    placeholder="0 (No minimum required)"
                                    value={formData.minBookingAmt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minBookingAmt: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                />
                                <p className="text-[11px] text-slate-600 font-medium mt-1">
                                    Leave 0 to apply discount to all bookings regardless of price.
                                </p>
                            </div>

                            {/* Start and End Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Start Date</span>
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                        <span>End Date</span>
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        min={formData.startDate}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Live Auto-Apply Note */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    <span>Guests will <strong>automatically receive {formData.discountValue || 0}% OFF</strong> during checkout with <strong>unlimited redemptions</strong>! No code typing required.</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{editingCouponId ? "Update Offer" : "Save & Launch Offer"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
