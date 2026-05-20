

import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Ticket, Plus, Trash2, Loader2, 
    Calendar, Percent, Tag, 
    CheckCircle2, XCircle, Copy,
    MoreVertical, Info, Save, X,
    TrendingUp, Gift, Zap, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, couponApi } from "@/lib/api";
import confetti from "canvas-confetti";

export default function PartnerCouponsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
    const [formTab, setFormTab] = useState<'basic' | 'rules'>('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minBookingAmt: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        // Advanced Fields
        promoType: "standard", // standard, last_minute, early_bird, weekend, long_stay, mobile_only
        targetAudience: "all", // all, new, returning
        minStay: "1",
        applyToRooms: "all" // all, or specific ids
    });

    const PROMO_TEMPLATES = [
        {
            id: "basic_deal",
            title: "Basic Deal",
            description: "Baseline discount for all guests & stay types",
            icon: <Ticket className="w-5 h-5 text-blue-500" />,
            bgColor: "bg-blue-50",
            defaultValues: {
                promoType: "standard",
                discountValue: "5",
                minBookingAmt: "0",
                usageLimit: "999",
                targetAudience: "all",
                minStay: "1"
            }
        },
        {
            id: "last_minute",
            title: "Last Minute Deal",
            description: "Sell remaining rooms for tonight & tomorrow",
            icon: <Zap className="w-5 h-5 text-amber-500" />,
            bgColor: "bg-amber-50",
            defaultValues: {
                promoType: "last_minute",
                discountValue: "20",
                minBookingAmt: "0",
                usageLimit: "10"
            }
        },
        {
            id: "early_bird",
            title: "Early Bird Special",
            description: "Get early bookings with higher discounts",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            bgColor: "bg-emerald-50",
            defaultValues: {
                promoType: "early_bird",
                discountValue: "15",
                minBookingAmt: "2500",
                usageLimit: "50"
            }
        },
        {
            id: "weekend",
            title: "Weekend Getaway",
            description: "Increase occupancy during weekends",
            icon: <Gift className="w-5 h-5 text-purple-500" />,
            bgColor: "bg-purple-50",
            defaultValues: {
                promoType: "weekend",
                discountValue: "10",
                minBookingAmt: "1500",
                usageLimit: "30"
            }
        },
        {
            id: "long_stay",
            title: "Long Stay Incentive",
            description: "Encourage 3+ nights bookings",
            icon: <Clock className="w-5 h-5 text-blue-500" />,
            bgColor: "bg-blue-50",
            defaultValues: {
                promoType: "long_stay",
                discountValue: "25",
                minBookingAmt: "5000",
                minStay: "3",
                usageLimit: "20"
            }
        },
        {
            id: "mobile_only",
            title: "Mobile Exclusive",
            description: "Target guests on mobile browsers",
            icon: <Tag className="w-5 h-5 text-rose-500" />,
            bgColor: "bg-rose-50",
            defaultValues: {
                promoType: "mobile_only",
                discountValue: "12",
                minBookingAmt: "0",
                usageLimit: "100"
            }
        }
    ];

    const applyTemplate = (template: any) => {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        setFormData(prev => ({
            ...prev,
            ...template.defaultValues,
            code: `${template.id.toUpperCase()}_${Math.floor(Math.random() * 1000)}`,
            startDate: today,
            endDate: nextWeekStr
        }));
        setActiveView('editor');
    };

    const fetchCoupons = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                const couponRes = await couponApi.getCoupons(myHotel.id);
                if (couponRes.success) {
                    setCoupons(couponRes.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch coupons", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchCoupons();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleSaveCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Strict Validation Logic
        const val = parseFloat(formData.discountValue);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid discount value greater than 0");
            return;
        }

        if (formData.discountType === 'percentage' && (val < 5 || val > 70)) {
            alert("Percentage discount must be between 5% and 70%.");
            return;
        }

        if (formData.discountType === 'fixed' && hotel?.pricePerNight && val >= Number(hotel.pricePerNight)) {
            alert(`Fixed discount cannot be equal to or more than your room price (₹${hotel.pricePerNight}).`);
            return;
        }

        setIsSaving(true);
        try {
            if (editingCouponId) {
                // Update existing coupon
                const res = await couponApi.updateCoupon(hotel.id, editingCouponId, formData);
                if (res.success) {
                    setCoupons(prev => prev.map(c => c.id === editingCouponId ? res.data : c));
                    setActiveView('list');
                    setEditingCouponId(null);
                }
            } else {
                // Create new coupon
                const res = await couponApi.createCoupon(hotel.id, formData);
                if (res.success) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#2563eb', '#10b981', '#f59e0b']
                    });
                    setCoupons(prev => [res.data, ...prev]);
                    setActiveView('list');
                }
            }
            
            // Reset form
            setFormData({
                code: "", discountType: "percentage", discountValue: "",
                minBookingAmt: "", startDate: "", endDate: "", usageLimit: "",
                promoType: "standard", targetAudience: "all", minStay: "1", applyToRooms: "all"
            });
        } catch (err) {
            alert(editingCouponId ? "Failed to update coupon." : "Failed to create coupon. Code might already exist.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (coupon: any) => {
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minBookingAmt: coupon.minBookingAmt.toString(),
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            usageLimit: coupon.usageLimit.toString(),
            promoType: coupon.promoType || "standard",
            targetAudience: coupon.targetAudience || "all",
            minStay: (coupon.minStay || "1").toString(),
            applyToRooms: coupon.applyToRooms || "all"
        });
        setEditingCouponId(coupon.id);
        setActiveView('editor');
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const res = await couponApi.toggleStatus(hotel.id, id, !currentStatus);
            if (res.success) {
                setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
            }
        } catch (err) {
            fetchCoupons(); // Re-sync if failed
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will permanently delete the coupon.")) return;
        if (!hotel?.id) return;
        try {
            const res = await couponApi.deleteCoupon(hotel.id, id);
            if (res.success) {
                setCoupons(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            alert("Failed to delete coupon");
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <XCircle className="w-16 h-16 text-red-100" />
                <h3 className="text-xl font-black text-slate-900">No Property Found</h3>
                <p className="text-slate-500 font-medium">Please list your property first to manage coupons.</p>
            </div>
        );
    }

    // Calculate Stats Dynamically
    const totalUsedCount = coupons.reduce((sum, c) => sum + (Number(c.usedCount) || 0), 0);
    const totalUsageLimit = coupons.reduce((sum, c) => sum + (Number(c.usageLimit) || 0), 0);
    const calculatedRedemptionRate = totalUsageLimit > 0 ? ((totalUsedCount / totalUsageLimit) * 100).toFixed(1) : "0.0";
    
    const calculatedAvgDiscount = coupons.length > 0 ? (coupons.reduce((sum, c) => {
        if (c.discountType === 'percentage') {
            const roomPrice = Number(hotel?.pricePerNight) || 2500;
            return sum + (roomPrice * (Number(c.discountValue) / 100));
        }
        return sum + Number(c.discountValue);
    }, 0) / coupons.length).toFixed(0) : "0";

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {activeView === 'list' ? (
                <>
                    {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Marketing</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">AI-Powered promotion tools to maximize your property revenue</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            setFormData({
                                code: "", discountType: "percentage", discountValue: "",
                                minBookingAmt: "", startDate: "", endDate: "", usageLimit: "",
                                promoType: "standard", targetAudience: "all", minStay: "1", applyToRooms: "all"
                            });
                            setEditingCouponId(null);
                            setActiveView('editor');
                        }}
                        className="px-6 py-3.5 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-none hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Custom Promo
                    </button>
                </div>
            </div>

            {/* Campaign Templates Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-none" />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Recommended Campaigns</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {PROMO_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className="bg-white border border-slate-100 p-6 rounded-none text-left hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col justify-between h-full"
                        >
                            <div className="space-y-4">
                                <div className={cn("w-12 h-12 rounded-none flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", template.bgColor)}>
                                    {template.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight">{template.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{template.description}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Select</span>
                                <Plus className="w-3 h-3 text-blue-400" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Promo Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-none flex items-center justify-center text-blue-600 shrink-0">
                        <Gift className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">{coupons.filter(c => c.isActive).length}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Promotions</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 rounded-none flex items-center justify-center text-emerald-600 shrink-0">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">{calculatedRedemptionRate}%</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Redemption Rate</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-purple-50 rounded-none flex items-center justify-center text-purple-600 shrink-0">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">₹{calculatedAvgDiscount}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Discount Value</p>
                    </div>
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {coupons.map((coupon) => {
                    const usagePercent = coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0;
                    const isExpiringSoon = new Date(coupon.endDate).getTime() - new Date().getTime() < 86400000 * 3;
                    
                    return (
                        <div 
                            key={coupon.id} 
                            className={cn(
                                "bg-white rounded-none border p-8 transition-all flex flex-col justify-between group relative overflow-hidden",
                                coupon.isActive ? "border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1" : "border-slate-100 opacity-60 bg-slate-50/50"
                            )}
                        >
                            {/* Performance Badge */}
                            {coupon.isActive && (
                                <div className="absolute top-0 right-12">
                                    <div className={cn(
                                        "px-4 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest text-white shadow-sm",
                                        isExpiringSoon ? "bg-red-500 animate-pulse" : "bg-blue-600"
                                    )}>
                                        {isExpiringSoon ? "Ending Soon" : "Active Campaign"}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-14 h-14 rounded-none flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12",
                                        coupon.isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
                                    )}>
                                        <Tag className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                            {coupon.code}
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    // Optional: add a toast here
                                                }}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-none transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-none border border-blue-100">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                            </span>
                                            {coupon.minBookingAmt > 0 && (
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Min. ₹{coupon.minBookingAmt}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(coupon)}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-none flex items-center justify-center transition-all border border-slate-100"
                                        title="Edit Coupon"
                                    >
                                        <Info className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                        className={cn(
                                            "w-10 h-10 rounded-none flex items-center justify-center transition-all border",
                                            coupon.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                        )}
                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {coupon.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(coupon.id)}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-600 rounded-none flex items-center justify-center transition-all border border-slate-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Usage Progress */}
                            <div className="space-y-3 mb-8 bg-slate-50/50 p-6 rounded-none border border-slate-100">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Campaign Usage
                                        </p>
                                        <p className="text-xs font-black text-slate-900">{coupon.usedCount} <span className="text-slate-400 font-bold">/ {coupon.usageLimit || '∞'}</span></p>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600">{coupon.usageLimit ? `${usagePercent.toFixed(0)}%` : '∞'}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-none overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-none transition-all duration-1000" 
                                        style={{ width: `${coupon.usageLimit ? Math.min(100, usagePercent) : 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Valid until {new Date(coupon.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[9px] font-black text-emerald-600 uppercase">Conversion: 12.4%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 pt-2 border-t border-dashed border-slate-200">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-none border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${coupon.id}${i}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-6 h-6 rounded-none border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">+12</div>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recently redeemed</span>
                            </div>
                        </div>
                    )})}
                </div>
            </>
            ) : (
                <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col md:flex-row min-h-[80vh]">
                    {/* Left Side: Form */}
                    <div className="flex-1 flex flex-col border-r border-slate-100">
                        <form onSubmit={handleSaveCoupon} className="flex flex-col h-full">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveView('list')}
                                        className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-none bg-blue-600 animate-pulse" />
                                            Campaign Configuration
                                        </span>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                                            {editingCouponId ? `Edit Coupon: ${formData.code}` : (formData.promoType !== 'standard' ? PROMO_TEMPLATES.find(t => t.id === formData.promoType)?.title : "Create Promo Code")}
                                        </h2>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveView('list')}
                                        className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-none transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-2.5 bg-slate-900 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {editingCouponId ? "Save Changes" : "Launch"}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                {/* Tabs */}
                                <div className="flex gap-8 border-b border-slate-100 mb-8">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormTab('basic')}
                                        className={cn(
                                            "pb-4 border-b-2 text-xs font-black uppercase tracking-widest transition-all",
                                            formTab === 'basic' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        1. Basic Info
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormTab('rules')}
                                        className={cn(
                                            "pb-4 border-b-2 text-xs font-black uppercase tracking-widest transition-all",
                                            formTab === 'rules' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        2. Smart Rules
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {formTab === 'basic' ? (
                                        <div className="space-y-8 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Promo Code</label>
                                                    <div className="relative group">
                                                        <input 
                                                            type="text" required placeholder="e.g. SUMMER24"
                                                            value={formData.code}
                                                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all uppercase pr-12"
                                                        />
                                                        <Tag className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Logic</label>
                                                    <select 
                                                        value={formData.discountType}
                                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount (₹)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
                                                    <input 
                                                        type="number" required placeholder="0"
                                                        min="5"
                                                        max={formData.discountType === 'percentage' ? "70" : hotel?.pricePerNight || "9999"}
                                                        value={formData.discountValue}
                                                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Booking</label>
                                                    <input 
                                                        type="number" placeholder="₹0"
                                                        value={formData.minBookingAmt}
                                                        onChange={(e) => setFormData({...formData, minBookingAmt: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit</label>
                                                    <input 
                                                        type="number" placeholder="No limit"
                                                        value={formData.usageLimit}
                                                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Start</label>
                                                    <input 
                                                        type="date" required
                                                        value={formData.startDate}
                                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign End</label>
                                                    <input 
                                                        type="date" required
                                                        value={formData.endDate}
                                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in space-y-8">
                                            {/* Smart Rules Section */}
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-blue-600" />
                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Smart Targeting Rules</h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                                                        <div className="flex bg-slate-50 p-1.5 rounded-none border border-slate-100">
                                                            {['all', 'new', 'returning'].map((aud) => (
                                                                <button
                                                                    key={aud}
                                                                    type="button"
                                                                    onClick={() => setFormData({...formData, targetAudience: aud})}
                                                                    className={cn(
                                                                        "flex-1 py-2.5 rounded-none text-[10px] font-black uppercase tracking-tight transition-all",
                                                                        formData.targetAudience === aud ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                                                                    )}
                                                                >
                                                                    {aud}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Stay (Nights)</label>
                                                        <input 
                                                            type="number"
                                                            value={formData.minStay}
                                                            onChange={(e) => setFormData({...formData, minStay: e.target.value})}
                                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-blue-50/50 rounded-none border border-blue-100">
                                                    <div className="flex gap-4">
                                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Smart Tip</p>
                                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                                                                Targeting 'New Guests' with a 'Min. 3 Night Stay' often leads to 40% higher conversion during off-seasons.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 mt-auto md:hidden">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-slate-900 text-white rounded-none font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Launch Campaign
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Live Preview */}
                    <div className="hidden lg:flex w-[400px] bg-slate-50 flex-col p-10 space-y-8 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Premium Preview</h3>
                            <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                                Dynamic
                            </div>
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed">This is how your offer will appear to guests on the search results and hotel detail page.</p>

                        {/* Mock Search Result Card */}
                        <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                {hotel?.thumbnail && <img src={hotel.thumbnail} className="w-full h-full object-cover" />}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-blue-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 fill-white" />
                                        Best Value
                                    </div>
                                </div>
                                {formData.code && (
                                    <div className="absolute bottom-4 left-4">
                                        <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white">
                                            Code: {formData.code}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 leading-tight">{hotel?.name || "Your Property Name"}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{hotel?.city || "Location"}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-none">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span className="text-[10px] font-black">4.8</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest line-through">₹{hotel?.pricePerNight || "2500"}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-slate-900">
                                                ₹{(() => {
                                                    const base = hotel?.pricePerNight || 2500;
                                                    const val = parseFloat(formData.discountValue) || 0;
                                                    const safeVal = formData.discountType === 'percentage' ? Math.min(val, 100) : val;
                                                    const discounted = formData.discountType === 'percentage' 
                                                        ? (base * (1 - safeVal/100)) 
                                                        : (base - safeVal);
                                                    return Math.max(0, discounted).toFixed(0);
                                                })()}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">/ night</span>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border border-red-100 flex flex-col items-center">
                                        <span>{formData.discountType === 'percentage' ? `${formData.discountValue}%` : `₹${formData.discountValue}`}</span>
                                        <span className="text-[8px] opacity-60">OFF</span>
                                    </div>
                                </div>

                                {formData.targetAudience !== 'all' && (
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-none flex items-center gap-2 border border-blue-100">
                                        <Info className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">For {formData.targetAudience} guests only</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trust Point in Sidebar */}
                        <div className="bg-white p-6 rounded-none border border-slate-100 shadow-sm space-y-4 mt-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-none flex items-center justify-center text-blue-600">
                                    <Gift className="w-4 h-4" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Why Launch this?</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                {formData.promoType === 'last_minute' && "Last minute deals help you recover lost revenue from unsold inventory."}
                                {formData.promoType === 'early_bird' && "Early bird specials provide cash flow security weeks in advance."}
                                {formData.promoType === 'standard' && "Standard promos are great for general holiday seasons and events."}
                                {!['last_minute', 'early_bird', 'standard'].includes(formData.promoType) && "Tailored offers significantly improve booking conversion rates."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



