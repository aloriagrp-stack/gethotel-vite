'use client';
import React, { useState, useMemo } from "react";
import { adminApi } from "@/lib/api";
import { 
    Tag, Percent, Search, MapPin, Check, X, ToggleLeft, ToggleRight, Sparkles, Calendar, Info
} from "lucide-react";

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
                discountValue: parseFloat(discountValue),
                isActive,
                startDate,
                endDate
            });

            if (res.success) {
                setSuccessMessage(res.message || "Promotions applied successfully!");
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
        <div className="space-y-6 max-w-7xl mx-auto px-4 font-sans text-neutral-100">
            
            {/* Sleek Minimal Top Stats Header - Pure Black Skeuomorphic */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[#1f1f1f] text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <div className="flex gap-6">
                    <span>Total Hotels: <strong className="text-white">{stats.totalHotels}</strong></span>
                    <span>Promoted: <strong className="text-white">{stats.hotelsWithPromos}</strong></span>
                    <span>Active Coupons: <strong className="text-emerald-400">{stats.activePromosCount}</strong></span>
                </div>
                {selectedHotelIds.length > 0 && (
                    <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-lg">
                        {selectedHotelIds.length} Selected
                    </span>
                )}
            </div>

            {/* Notification Messages */}
            {successMessage && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs font-bold transition-all">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-3.5 bg-red-950/80 border border-red-800/40 rounded-xl text-red-300 text-xs font-bold transition-all">
                    {errorMessage}
                </div>
            )}

            {/* Config Hub: Minimalistic Tabs & Inline Form */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] space-y-5">
                <div className="flex border-b border-[#1f1f1f] pb-3 gap-2">
                    <button
                        onClick={() => { setBulkMode("apply"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={`pb-2 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none cursor-pointer ${
                            bulkMode === "apply" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"
                        }`}
                    >
                        Apply Promotion
                    </button>
                    <button
                        onClick={() => { setBulkMode("remove"); setErrorMessage(""); setSuccessMessage(""); }}
                        className={`pb-2 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none cursor-pointer ${
                            bulkMode === "remove" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"
                        }`}
                    >
                        Remove Promotion
                    </button>
                </div>

                {bulkMode === "apply" ? (
                    <form onSubmit={handleApplyPromotion} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Code</label>
                                <input
                                    type="text"
                                    placeholder="Code (e.g. GET15)"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 uppercase font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Value</label>
                                <input
                                    type="number"
                                    placeholder="15"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                >
                                    <option value="percentage" className="bg-black text-white">Percent (%)</option>
                                    <option value="fixed" className="bg-black text-white">Fixed (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">State</label>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(p => !p)}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold uppercase tracking-wider text-white outline-none text-left flex justify-between items-center cursor-pointer"
                                >
                                    <span>{isActive ? "Active" : "Paused"}</span>
                                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0}
                            className="px-6 py-3 bg-neutral-100 hover:bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                        >
                            {actionLoading ? "Processing..." : `Apply to ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRemovePromotion} className="flex flex-wrap items-end gap-4">
                        <div className="min-w-[220px]">
                            <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Delete Code</label>
                            <input
                                type="text"
                                placeholder="WELCOME10"
                                value={deleteCode}
                                onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 uppercase font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading || selectedHotelIds.length === 0 || !deleteCode}
                            className="px-6 py-3 bg-red-950/80 border border-red-800/40 text-red-400 hover:bg-red-900 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {actionLoading ? "Deleting..." : `Delete from ${selectedHotelIds.length} Selected`}
                        </button>
                    </form>
                )}
            </div>

            {/* List and Selection Table */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 placeholder:text-neutral-600 font-mono"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">City</span>
                        <select
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none cursor-pointer focus:border-neutral-500 font-mono"
                        >
                            {cities.map(c => (
                                <option key={c} value={c} className="bg-black text-white">{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1f1f1f] bg-[#0e0e0e] text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                <th className="py-3.5 px-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredHotels.length > 0 && selectedHotelIds.length === filteredHotels.length}
                                        onChange={handleSelectAll}
                                        className="w-3.5 h-3.5 border-[#282828] text-white rounded focus:ring-0 cursor-pointer bg-[#141414]"
                                    />
                                </th>
                                <th className="py-3.5 px-3">Property</th>
                                <th className="py-3.5 px-3">Location</th>
                                <th className="py-3.5 px-3">Active Promotions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181818]">
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map(h => {
                                    const isSelected = selectedHotelIds.includes(h.id);
                                    const coupons = h.coupon || [];
                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={`hover:bg-[#121212] transition-colors ${
                                                isSelected ? "bg-[#141414]" : ""
                                            }`}
                                        >
                                            <td className="py-3.5 px-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectHotel(h.id)}
                                                    className="w-3.5 h-3.5 border-[#282828] text-white rounded focus:ring-0 cursor-pointer bg-[#141414]"
                                                />
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#161616] border border-[#282828] shrink-0">
                                                        {h.thumbnail ? (
                                                            <img src={h.thumbnail} alt={h.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[9px] font-bold">
                                                                No Img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-white">{h.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-emerald-400" /> {h.city}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {coupons.length > 0 ? (
                                                        coupons.map(c => (
                                                            <span 
                                                                key={c.id} 
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                                    c.isActive 
                                                                        ? "bg-neutral-100 text-black border-white" 
                                                                        : "bg-[#141414] text-neutral-500 border-[#262626] opacity-60"
                                                                }`}
                                                            >
                                                                <Tag className="w-2.5 h-2.5" />
                                                                {c.code}: {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider italic">
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
                                    <td colSpan={4} className="py-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-widest italic">
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
