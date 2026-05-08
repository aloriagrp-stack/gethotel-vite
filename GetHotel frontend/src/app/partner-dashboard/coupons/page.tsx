"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function PartnerCouponsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minBookingAmt: "",
        startDate: "",
        endDate: "",
        usageLimit: ""
    });

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
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await couponApi.createCoupon(hotel.id, formData);
            if (res.success) {
                setCoupons(prev => [res.data, ...prev]);
                setIsModalOpen(false);
                setFormData({
                    code: "", discountType: "percentage", discountValue: "",
                    minBookingAmt: "", startDate: "", endDate: "", usageLimit: ""
                });
            }
        } catch (err) {
            alert("Failed to create coupon. Code might already exist.");
        } finally {
            setIsSaving(false);
        }
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

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupons & Promotions</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Drive more bookings with custom discount codes and seasonal offers</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create Promo Code
                    </button>
                </div>
            </div>

            {/* Promo Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shrink-0">
                        <Gift className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">{coupons.filter(c => c.isActive).length}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Promotions</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shrink-0">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">12%</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Redemption Rate</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 shrink-0">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900">₹{hotel?.pricePerNight ? (hotel.pricePerNight * 0.15).toFixed(0) : '0'}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Discount Value</p>
                    </div>
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {coupons.map((coupon) => (
                    <div 
                        key={coupon.id} 
                        className={cn(
                            "bg-white rounded-[40px] border p-8 transition-all flex flex-col justify-between group",
                            coupon.isActive ? "border-slate-200 shadow-sm hover:shadow-xl" : "border-slate-100 opacity-60 bg-slate-50/50"
                        )}
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                    coupon.isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
                                )}>
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        {coupon.code}
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(coupon.code)}
                                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                                        coupon.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}
                                >
                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(coupon.id)}
                                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Validity
                                </p>
                                <p className="text-xs font-black text-slate-700">
                                    {new Date(coupon.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(coupon.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Usage
                                </p>
                                <p className="text-xs font-black text-slate-700">{coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min. Booking: ₹{coupon.minBookingAmt}</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property Exclusive</span>
                            </div>
                        </div>
                    </div>
                ))}
                {coupons.length === 0 && (
                    <div className="lg:col-span-2 py-32 bg-white rounded-[40px] border border-slate-200 flex flex-col items-center">
                        <Ticket className="w-16 h-16 text-slate-100 mb-4" />
                        <h4 className="text-xl font-black text-slate-900 mb-2">No active promotions</h4>
                        <p className="text-slate-500 font-medium">Create a coupon code to boost your bookings today!</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleCreateCoupon}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Marketing Hub</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Create Promo Code</h2>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Promo Code</label>
                                        <input 
                                            type="text" required placeholder="e.g. SAVE50"
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Type</label>
                                        <select 
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
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
                                            type="number" required placeholder="Value"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Booking</label>
                                        <input 
                                            type="number" placeholder="₹0"
                                            value={formData.minBookingAmt}
                                            onChange={(e) => setFormData({...formData, minBookingAmt: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usage Limit</label>
                                        <input 
                                            type="number" placeholder="Infinite"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input 
                                            type="date" required
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input 
                                            type="date" required
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Launch Promotion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
