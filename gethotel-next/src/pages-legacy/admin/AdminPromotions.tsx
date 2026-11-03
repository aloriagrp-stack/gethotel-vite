'use client';
import React, { useState, useMemo } from "react";
import { adminApi } from "@/lib/api";
import { 
    Tag, Search, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    // Unified Bulk Mode: "apply" | "remove"
    const [bulkMode, setBulkMode] = useState<"apply" | "remove">("apply");

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
                discountValue: Number(discountValue),
                isActive,
                startDate,
                endDate
            });

            if (res.success) {
                setSuccessMessage(res.message || "Promotions successfully applied!");
                setSelectedHotelIds([]);
                setPromoCode("");
                setDiscountValue("");
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
    const handleRemovePromotion = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="space-y-6 text-slate-800">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Promotions & Coupons
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage global platform coupon campaigns, discount rules, and bulk property allocations.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-2xs">
                    <span>Hotels: <strong className="text-slate-900 font-bold">{stats.totalHotels}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Promoted: <strong className="text-slate-900 font-bold">{stats.hotelsWithPromos}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Active: <strong className="text-emerald-700 font-bold">{stats.activePromosCount}</strong></span>
                    {selectedHotelIds.length > 0 && (
                        <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg font-bold ml-1">
                            {selectedHotelIds.length} Selected
                        </span>
                    )}
                </div>
            </div>

            {/* Notification Messages */}
            {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium text-xs shadow-2xs">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium text-xs shadow-2xs">
                    {errorMessage}
                </div>
            )}

            {/* Config Hub: Modern Tabs & Inline Form */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="inline-flex p-1 bg-slate-100 border border-slate-200/80 rounded-xl gap-1">
                    <button
                        onClick={() => { setBulkMode("apply"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                            bulkMode === "apply" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Apply Promotion
                    </button>
                    <button
                        onClick={() => { setBulkMode("remove"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                            bulkMode === "remove" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Remove Promotion
                    </button>
                </div>

                {bulkMode === "apply" ? (
                    <form onSubmit={handleApplyPromotion} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Coupon Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. GET15"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 uppercase font-mono placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Value</label>
                                <input
                                    type="number"
                                    placeholder="15"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all cursor-pointer"
                                >
                                    <option value="percentage">Percent (%)</option>
                                    <option value="fixed">Fixed (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial State</label>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(p => !p)}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none flex justify-between items-center cursor-pointer shadow-2xs transition-all"
                                >
                                    <span>{isActive ? "Active" : "Paused"}</span>
                                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-400'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                        >
                            {actionLoading ? "Processing..." : `Apply to ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRemovePromotion} className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[240px]">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Coupon Code to Delete</label>
                            <input
                                type="text"
                                placeholder="WELCOME10"
                                value={deleteCode}
                                onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                                className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 uppercase font-mono placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0 || !deleteCode}
                            className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                        >
                            {actionLoading ? "Deleting..." : `Delete from ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                )}
            </div>

            {/* List and Selection Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-0">
                <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 shadow-2xs transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">City:</span>
                        <select
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-600 shadow-2xs"
                        >
                            {cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="py-3 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredHotels.length > 0 && selectedHotelIds.length === filteredHotels.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                                <th className="py-3 px-4">Property</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Active Promotions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map(h => {
                                    const isSelected = selectedHotelIds.includes(h.id);
                                    const coupons = h.coupon || [];
                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={cn("hover:bg-slate-50/70 transition-colors", isSelected && "bg-blue-50/40")}
                                        >
                                            <td className="py-3.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectHotel(h.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                                        {h.thumbnail ? (
                                                            <img src={h.thumbnail} alt={h.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{h.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.city}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {coupons.length > 0 ? (
                                                        coupons.map(c => (
                                                            <span 
                                                                key={c.id} 
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-2xs",
                                                                    c.isActive 
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                                                        : "bg-slate-100 text-slate-500 border border-slate-200"
                                                                )}
                                                            >
                                                                <Tag className="w-2.5 h-2.5" />
                                                                {c.code}: {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px] font-medium">
                                                            None
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-xs text-slate-400 font-medium">
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
