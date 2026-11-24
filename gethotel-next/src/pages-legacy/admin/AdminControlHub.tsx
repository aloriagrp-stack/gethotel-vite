'use client';
import { useState } from "react";
import { Hotel, Clock, Calendar, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/common/Image";
import AdminHotelDetails from "./AdminHotelDetails";

interface AdminControlHubProps {
    hotels: any[];
    loading?: boolean;
}

export default function AdminControlHub({ hotels, loading = false }: AdminControlHubProps) {
    const [selectedHotelId, setSelectedHotelId] = useState<string | number | null>(null);
    const [subTab, setSubTab] = useState<"all" | "nightly" | "hourly" | "both">("all");
    const [searchQuery, setSearchQuery] = useState("");

    if (selectedHotelId) {
        return <AdminHotelDetails hotelId={selectedHotelId} onBack={() => setSelectedHotelId(null)} />;
    }

    // Classification logic
    const classifyHotel = (hotel: any) => {
        const rooms = hotel.room || hotel.rooms || [];
        if (rooms.length === 0) return "nightly";
        
        const hasHourly = rooms.some((r: any) => r.isHourlyEnabled || r.is_hourly_enabled);
        const hasNightly = rooms.some((r: any) => !r.isHourlyEnabled && !r.is_hourly_enabled);
        
        if (hasHourly && hasNightly) {
            return "both";
        } else if (hasHourly) {
            return "hourly";
        } else {
            return "nightly";
        }
    };

    // Filtered & classified hotels (Strictly bookable only - directory hotels are isolated to Directory tab)
    const effectiveHotels = (hotels || []).filter(h => h.listingType !== "directory");
    const bookableOnlyHotels = effectiveHotels.length > 0 ? effectiveHotels : (hotels || []);
    const classifiedHotels = bookableOnlyHotels.map(h => ({
        ...h,
        category: classifyHotel(h)
    }));

    const nightlyHotels = classifiedHotels.filter(h => h.category === "nightly");
    const hourlyHotels = classifiedHotels.filter(h => h.category === "hourly");
    const bothHotels = classifiedHotels.filter(h => h.category === "both");

    const getActiveList = () => {
        if (subTab === "all") return classifiedHotels;
        if (subTab === "nightly") return nightlyHotels;
        if (subTab === "hourly") return hourlyHotels;
        return bothHotels;
    };

    const smartFilter = (items: any[], query: string) => {
        if (!query) return items;
        const keywords = query.toLowerCase().trim().split(/\s+/);
        return items.filter(item => {
            return keywords.every(kw => 
                item.name?.toLowerCase().includes(kw) || 
                item.city?.toLowerCase().includes(kw) ||
                item.address?.toLowerCase().includes(kw) ||
                String(item.id).includes(kw)
            );
        });
    };

    const displayedHotels = smartFilter(getActiveList(), searchQuery);

    // Stats switcher tabs
    const stats = [
        { label: "All Properties", count: classifiedHotels.length, icon: Hotel, type: "all" },
        { label: "Nightly Only (Full Day)", count: nightlyHotels.length, icon: Calendar, type: "nightly" },
        { label: "Hourly Only Stays", count: hourlyHotels.length, icon: Clock, type: "hourly" },
        { label: "Hybrid (Nightly & Hourly)", count: bothHotels.length, icon: SlidersHorizontal, type: "both" }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 text-slate-900">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Properties Hub
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Filter and configure nightly, hourly, and hybrid accommodation inventory.</p>
                </div>
                <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors"
                    />
                </div>
            </div>

            {/* Category switcher cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isActive = subTab === stat.type;
                    return (
                        <button
                            key={stat.label}
                            type="button"
                            onClick={() => setSubTab(stat.type as any)}
                            className={cn(
                                "p-3 sm:p-4 text-left rounded-xl border transition-all cursor-pointer shadow-xs",
                                isActive
                                    ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                                    : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={cn("text-[11px] sm:text-xs font-semibold tracking-wide truncate mr-1", isActive ? "text-slate-300" : "text-slate-500")}>
                                    {stat.label}
                                </span>
                                <div className={cn(
                                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                    isActive ? "bg-white/10 text-emerald-400" : "bg-slate-100 text-slate-500"
                                )}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <h3 className={cn("text-xl sm:text-2xl font-bold tracking-tight", isActive ? "text-white" : "text-slate-900")}>
                                    {stat.count}
                                </h3>
                                <span className={cn(
                                    "text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full transition-colors",
                                    isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-100 text-slate-600"
                                )}>
                                    {isActive ? "● Active" : "View"}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filter and Table area */}
            <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">
                        {subTab === "all" ? "All Bookable Properties" :
                         subTab === "nightly" ? "Nightly Only Hotels" :
                         subTab === "hourly" ? "Hourly Only Hotels" : "Hybrid Stays (Nightly & Hourly)"}
                        <span className="text-slate-400 ml-1.5 font-normal">({displayedHotels.length} properties)</span>
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-medium whitespace-nowrap">
                            <tr>
                                <th className="px-3.5 sm:px-5 py-3 font-medium">Property Details</th>
                                <th className="px-3.5 sm:px-5 py-3 font-medium">Rooms Breakdown</th>
                                <th className="px-3.5 sm:px-5 py-3 font-medium">Pricing</th>
                                <th className="px-3.5 sm:px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {displayedHotels.map((hotel) => {
                                const rooms = hotel.room || hotel.rooms || [];
                                const hourlyCount = rooms.filter((r: any) => r.isHourlyEnabled || r.is_hourly_enabled).length;
                                const nightlyCount = rooms.length - hourlyCount;

                                return (
                                    <tr 
                                        key={hotel.id} 
                                        onClick={() => setSelectedHotelId(hotel.id)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="px-3.5 sm:px-5 py-3">
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                                    {hotel.thumbnail ? (
                                                        <Image 
                                                            src={hotel.thumbnail} 
                                                            alt={hotel.name} 
                                                            width={40} 
                                                            height={40} 
                                                            className="object-cover w-full h-full" 
                                                        />
                                                    ) : (
                                                        <Hotel className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate max-w-[150px] sm:max-w-none">
                                                        {hotel.name}
                                                    </p>
                                                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px] sm:max-w-none">
                                                        {hotel.city}, {hotel.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3.5 sm:px-5 py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-500 text-[10px] sm:text-[11px]">
                                                    Rooms: <b className="text-slate-900 font-semibold">{rooms.length}</b>
                                                </span>
                                                <div className="flex gap-1 mt-0.5">
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md border",
                                                        nightlyCount > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                                                    )}>
                                                        {nightlyCount} Nightly
                                                    </span>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md border",
                                                        hourlyCount > 0 ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-200"
                                                    )}>
                                                        {hourlyCount} Hourly
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3.5 sm:px-5 py-3 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-900">
                                                    ₹{hotel.pricePerNight?.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/night</span>
                                                </span>
                                                {hourlyCount > 0 && (
                                                    <span className="text-[10px] font-medium text-purple-600 mt-0.5">
                                                        Hourly active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3.5 sm:px-5 py-3 text-right whitespace-nowrap">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedHotelId(hotel.id);
                                                }}
                                                className="text-xs font-semibold text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayedHotels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center">
                                        <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400">
                                            No properties found in this category
                                        </p>
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
