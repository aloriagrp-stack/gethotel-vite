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
    const [subTab, setSubTab] = useState<"nightly" | "hourly" | "both">("nightly");
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

    // Filtered & classified hotels
    const classifiedHotels = hotels.map(h => ({
        ...h,
        category: classifyHotel(h)
    }));

    const nightlyHotels = classifiedHotels.filter(h => h.category === "nightly");
    const hourlyHotels = classifiedHotels.filter(h => h.category === "hourly");
    const bothHotels = classifiedHotels.filter(h => h.category === "both");

    const getActiveList = () => {
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

    // Stats
    const stats = [
        { label: "Nightly Only (Full Day)", count: nightlyHotels.length, icon: Calendar, type: "nightly" },
        { label: "Hourly Only Stays", count: hourlyHotels.length, icon: Clock, type: "hourly" },
        { label: "Hybrid (Nightly and Hourly)", count: bothHotels.length, icon: SlidersHorizontal, type: "both" }
    ];

    return (
        <div className="space-y-6 text-slate-900">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Properties Hub
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Filter and configure nightly, hourly, and hybrid accommodation inventory.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg w-60 focus:outline-none focus:border-slate-900 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors"
                    />
                </div>
            </div>

            {/* Category switcher cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isActive = subTab === stat.type;
                    return (
                        <button
                            key={stat.label}
                            type="button"
                            onClick={() => setSubTab(stat.type as any)}
                            className={cn(
                                "p-5 text-left rounded-xl border transition-all cursor-pointer",
                                isActive
                                    ? "bg-slate-900 text-white border-slate-900 text-slate-900"
                                    : "bg-white/40 border-slate-200/80 text-slate-700 hover:border-slate-300"
                            )}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                                <Icon className={cn("w-4 h-4", isActive ? "text-slate-900" : "text-slate-400")} />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{stat.count}</h3>
                                <span className={cn(
                                    "text-[11px] font-medium px-2 py-0.5 rounded",
                                    isActive ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    {isActive ? "Active View" : "Select"}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filter and Table area */}
            <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">
                        {subTab === "nightly" ? "Nightly Only Hotels" :
                         subTab === "hourly" ? "Hourly Only Hotels" : "Hybrid Stays (Nightly and Hourly)"}
                        <span className="text-slate-400 ml-2">({displayedHotels.length} properties)</span>
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-medium">
                            <tr>
                                <th className="px-5 py-3 font-medium">Property Details</th>
                                <th className="px-5 py-3 font-medium">Rooms Breakdown</th>
                                <th className="px-5 py-3 font-medium">Pricing</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
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
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
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
                                                <div>
                                                    <p className="text-xs font-medium text-slate-900 hover:text-emerald-400 transition-colors">
                                                        {hotel.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {hotel.city}, {hotel.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-500 text-[11px]">
                                                    Total Rooms: <b className="text-slate-900 font-medium">{rooms.length}</b>
                                                </span>
                                                <div className="flex gap-1.5 mt-0.5">
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[10px] font-medium rounded",
                                                        nightlyCount > 0 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-neutral-800 text-slate-400"
                                                    )}>
                                                        {nightlyCount} Nightly
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[10px] font-medium rounded",
                                                        hourlyCount > 0 ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-neutral-800 text-slate-400"
                                                    )}>
                                                        {hourlyCount} Hourly
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-900">
                                                    ₹{hotel.pricePerNight?.toLocaleString()} <span className="text-[11px] font-normal text-slate-500">/night</span>
                                                </span>
                                                {hourlyCount > 0 && (
                                                    <span className="text-[11px] text-purple-400 mt-0.5">
                                                        Hourly stays enabled
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedHotelId(hotel.id);
                                                }}
                                                className="text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-white hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayedHotels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
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
