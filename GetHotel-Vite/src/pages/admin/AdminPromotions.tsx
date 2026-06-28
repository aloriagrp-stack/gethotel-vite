import React, { useState, useMemo } from "react";
import { adminApi } from "@/lib/api";
import { 
    Tag, Percent, PlusCircle, Trash2, Search, MapPin, 
    Check, X, ToggleLeft, ToggleRight, Sparkles, Calendar, Info
} from "lucide-react";
import Loader from "@/components/common/Loader";

interface Coupon {
    id: number;
    code: string;
    discountType: string;
    discountValue: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

interface Hotel {
    id: number;
    name: string;
    city: string;
    thumbnail: string;
    coupon?: Coupon[];
}

interface AdminPromotionsProps {
    hotels: Hotel[];
    onRefresh: () => void;
}

export default function AdminPromotions({ hotels, onRefresh }: AdminPromotionsProps) {
    const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCity, setSearchCity] = useState("All");

    // Form inputs for bulk creation
    const [promoCode, setPromoCode] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [isActive, setIsActive] = useState(true);
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );

    // Delete Code input
    const [deleteCode, setDeleteCode] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // List of unique cities for filtering
    const cities = useMemo(() => {
        const set = new Set(hotels.map(h => h.city));
        return ["All", ...Array.from(set)];
    }, [hotels]);

    // Filter hotels
    const filteredHotels = useMemo(() => {
        return hotels.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCity = searchCity === "All" || h.city === searchCity;
            return matchesSearch && matchesCity;
        });
    }, [hotels, searchQuery, searchCity]);

    // Handle multiselect
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedHotelIds(filteredHotels.map(h => h.id));
        } else {
            setSelectedHotelIds([]);
        }
    };

    const handleSelectHotel = (id: number) => {
        setSelectedHotelIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Bulk Apply
    const handleApplyPromotion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedHotelIds.length === 0) {
            setErrorMessage("Please select at least one hotel.");
            return;
        }
        if (!promoCode.trim()) {
            setErrorMessage("Please enter a promotion code.");
            return;
        }
        if (!discountValue || isNaN(Number(discountValue))) {
            setErrorMessage("Please enter a valid numeric discount value.");
            return;
        }

        setActionLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const res = await adminApi.bulkUpdatePromotions({
                hotelIds: selectedHotelIds,
                code: promoCode.toUpperCase().trim(),
                discountType,
                discountValue: parseFloat(discountValue),
                isActive,
                startDate,
                endDate
            });

            if (res.success) {
                setSuccessMessage(res.message || "Promotions applied successfully!");
                // Clear selection & code
                setSelectedHotelIds([]);
                setPromoCode("");
                setDiscountValue("");
                // Refresh list
                onRefresh();
            } else {
                setErrorMessage(res.message || "Failed to apply promotions.");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Something went wrong.");
        } finally {
            setActionLoading(false);
        }
    };

    // Bulk Delete
    const handleRemovePromotion = async () => {
        if (selectedHotelIds.length === 0) {
            setErrorMessage("Please select at least one hotel.");
            return;
        }
        if (!deleteCode.trim()) {
            setErrorMessage("Please enter the coupon code to delete.");
            return;
        }

        setActionLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const res = await adminApi.bulkDeletePromotions({
                hotelIds: selectedHotelIds,
                code: deleteCode.toUpperCase().trim()
            });

            if (res.success) {
                setSuccessMessage(res.message || "Promotions removed successfully!");
                setSelectedHotelIds([]);
                setDeleteCode("");
                onRefresh();
            } else {
                setErrorMessage(res.message || "Failed to remove promotions.");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Something went wrong.");
        } finally {
            setActionLoading(false);
        }
    };

    // Statistics calculations
    const stats = useMemo(() => {
        let hotelsWithPromos = 0;
        let activePromosCount = 0;
        
        hotels.forEach(h => {
            const activeCoupons = (h.coupon || []).filter(c => c.isActive);
            if (activeCoupons.length > 0) {
                hotelsWithPromos++;
                activePromosCount += activeCoupons.length;
            }
        });

        return {
            hotelsWithPromos,
            activePromosCount,
            totalHotels: hotels.length
        };
    }, [hotels]);

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-[24px] text-white shadow-xl shadow-brand-600/10">
                    <p className="text-xs font-black uppercase tracking-wider text-white/70 mb-2">Total Hotels</p>
                    <h3 className="text-3xl font-black">{stats.totalHotels}</h3>
                    <p className="text-[10px] text-white/50 mt-1 uppercase font-bold">In the GetHotel database</p>
                </div>
                <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-100/10 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Hotels with Promotions</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.hotelsWithPromos}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 uppercase font-black">
                        {((stats.hotelsWithPromos / (stats.totalHotels || 1)) * 100).toFixed(0)}% of total properties
                    </p>
                </div>
                <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-100/10 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Total Active Coupon Roles</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.activePromosCount}</h3>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-3 uppercase font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Live and applyable at checkout
                    </p>
                </div>
            </div>

            {/* Notification Messages */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold">
                    <X className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Config Hub: Form & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bulk Form Panel */}
                <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                            <PlusCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Bulk Add / Update Promotions</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Apply a coupon promotion to all selected properties</p>
                        </div>
                    </div>

                    <form onSubmit={handleApplyPromotion} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Promo Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MONSOON20"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all uppercase placeholder:normal-case"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Discount Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                                >
                                    <option value="percentage">Percentage Discount (%)</option>
                                    <option value="fixed">Fixed Amount Discount (₹)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Discount Value</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 15"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-b border-slate-50">
                            <span className="text-xs font-bold text-slate-600">Promotion Status</span>
                            <button
                                type="button"
                                onClick={() => setIsActive(prev => !prev)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {isActive ? (
                                    <ToggleRight className="w-8 h-8 text-brand-600" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                                )}
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    {isActive ? "Active" : "Paused"}
                                </span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0}
                            className="w-full px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-950/10 flex items-center justify-center gap-2"
                        >
                            {actionLoading ? "Applying..." : `Apply to ${selectedHotelIds.length} Selected Hotel(s)`}
                        </button>
                    </form>
                </div>

                {/* Bulk Delete Panel */}
                <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-red-600 uppercase tracking-wider">Bulk Remove Promotion</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Remove a specific coupon from selected hotels</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Coupon Code to Delete</label>
                                <input
                                    type="text"
                                    placeholder="e.g. WELCOME10"
                                    value={deleteCode}
                                    onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all uppercase placeholder:normal-case"
                                />
                            </div>

                            <div className="p-4 bg-red-50/50 border border-red-50 rounded-2xl text-[10px] text-slate-500 font-bold flex gap-2.5">
                                <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p>Deleting a promotion will permanently remove this coupon code from the selected hotels' checkout options. Active bookings using it are unaffected.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemovePromotion}
                        disabled={actionLoading || selectedHotelIds.length === 0 || !deleteCode.trim()}
                        className="w-full mt-6 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
                    >
                        {actionLoading ? "Removing..." : `Delete from ${selectedHotelIds.length} Selected`}
                    </button>
                </div>
            </div>

            {/* List and Selection Table */}
            <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm space-y-6">
                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search properties by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">City Filter</span>
                        <select
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all cursor-pointer"
                        >
                            {cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="py-4 px-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={filteredHotels.length > 0 && selectedHotelIds.length === filteredHotels.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded text-brand-600 border-slate-200 focus:ring-brand-500 cursor-pointer"
                                    />
                                </th>
                                <th className="py-4 px-4">Property</th>
                                <th className="py-4 px-4">Location</th>
                                <th className="py-4 px-4">Active Promotions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map(h => {
                                    const isSelected = selectedHotelIds.includes(h.id);
                                    const coupons = h.coupon || [];
                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                                                isSelected ? "bg-brand-50/20" : ""
                                            }`}
                                        >
                                            <td className="py-4 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectHotel(h.id)}
                                                    className="w-4 h-4 rounded text-brand-600 border-slate-200 focus:ring-brand-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                                                        {h.thumbnail ? (
                                                            <img src={h.thumbnail} alt={h.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Percent className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-black text-slate-900">{h.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.city}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {coupons.length > 0 ? (
                                                        coupons.map(c => (
                                                            <span 
                                                                key={c.id} 
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                                    c.isActive 
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                                        : "bg-slate-100 text-slate-500 border-slate-200 opacity-60"
                                                                }`}
                                                            >
                                                                <Tag className="w-3 h-3" />
                                                                {c.code}: {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'}
                                                                {c.isActive ? (
                                                                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                ) : (
                                                                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                                                                )}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                            No promotions set
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                        No properties matched your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
