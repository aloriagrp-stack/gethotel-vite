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
        <div className="space-y-6 text-neutral-100">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
                <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Promotions & Coupons
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        Manage global platform coupon campaigns, discount rules, and bulk property allocations.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>Hotels: <strong className="text-white font-medium">{stats.totalHotels}</strong></span>
                    <span>Promoted: <strong className="text-white font-medium">{stats.hotelsWithPromos}</strong></span>
                    <span>Active: <strong className="text-emerald-400 font-medium">{stats.activePromosCount}</strong></span>
                    {selectedHotelIds.length > 0 && (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-medium">
                            {selectedHotelIds.length} Selected
                        </span>
                    )}
                </div>
            </div>

            {/* Notification Messages */}
            {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                    {errorMessage}
                </div>
            )}

            {/* Config Hub: Minimal Tabs & Inline Form */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-4">
                <div className="flex border-b border-neutral-800/60 pb-3 gap-2">
                    <button
                        onClick={() => { setBulkMode("apply"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={cn(
                            "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                            bulkMode === "apply" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Apply Promotion
                    </button>
                    <button
                        onClick={() => { setBulkMode("remove"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={cn(
                            "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                            bulkMode === "remove" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Remove Promotion
                    </button>
                </div>

                {bulkMode === "apply" ? (
                    <form onSubmit={handleApplyPromotion} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Coupon Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. GET15"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 uppercase font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Discount Value</label>
                                <input
                                    type="number"
                                    placeholder="15"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Discount Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 font-mono"
                                >
                                    <option value="percentage">Percent (%)</option>
                                    <option value="fixed">Fixed (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Initial State</label>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(p => !p)}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none flex justify-between items-center cursor-pointer"
                                >
                                    <span>{isActive ? "Active" : "Paused"}</span>
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0}
                            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {actionLoading ? "Processing..." : `Apply to ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRemovePromotion} className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[220px]">
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Coupon Code to Delete</label>
                            <input
                                type="text"
                                placeholder="WELCOME10"
                                value={deleteCode}
                                onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 uppercase font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0 || !deleteCode}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {actionLoading ? "Deleting..." : `Delete from ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                )}
            </div>

            {/* List and Selection Table */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden space-y-0">
                <div className="px-5 py-3.5 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Filter properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 placeholder:text-neutral-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-400">City:</span>
                        <select
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none cursor-pointer focus:border-neutral-700"
                        >
                            {cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-900/60 border-b border-neutral-800/80 text-xs font-medium text-neutral-400">
                            <tr>
                                <th className="py-3 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredHotels.length > 0 && selectedHotelIds.length === filteredHotels.length}
                                        onChange={handleSelectAll}
                                        className="w-3.5 h-3.5 border-neutral-800 text-emerald-500 rounded focus:ring-0 cursor-pointer bg-neutral-900"
                                    />
                                </th>
                                <th className="py-3 px-4">Property</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Active Promotions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 text-xs">
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map(h => {
                                    const isSelected = selectedHotelIds.includes(h.id);
                                    const coupons = h.coupon || [];
                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={cn("hover:bg-neutral-800/30 transition-colors", isSelected && "bg-neutral-800/20")}
                                        >
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectHotel(h.id)}
                                                    className="w-3.5 h-3.5 border-neutral-800 text-emerald-500 rounded focus:ring-0 cursor-pointer bg-neutral-900"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                                                        {h.thumbnail ? (
                                                            <img src={h.thumbnail} alt={h.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-white">{h.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-neutral-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-neutral-500" /> {h.city}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {coupons.length > 0 ? (
                                                        coupons.map(c => (
                                                            <span 
                                                                key={c.id} 
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono",
                                                                    c.isActive 
                                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                                        : "bg-neutral-800 text-neutral-500"
                                                                )}
                                                            >
                                                                <Tag className="w-2.5 h-2.5" />
                                                                {c.code}: {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-neutral-500 text-[11px]">
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
                                    <td colSpan={4} className="py-12 text-center text-xs text-neutral-500">
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
