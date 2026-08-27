'use client';
import { useState } from "react";
import { Hotel, Clock, Calendar, Search, ArrowRight, ShieldAlert, SlidersHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate as useRouter } from "react-router-dom";
import Image from "@/components/common/Image";

interface AdminControlHubProps {
    hotels: any[];
    loading?: boolean;
}

export default function AdminControlHub({ hotels, loading = false }: AdminControlHubProps) {
    const router = useRouter();
    const [subTab, setSubTab] = useState<"nightly" | "hourly" | "both">("nightly");
    const [searchQuery, setSearchQuery] = useState("");

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
        { label: "Nightly Only (Full Day)", count: nightlyHotels.length, icon: Calendar, color: "blue", type: "nightly" },
        { label: "Hourly Only", count: hourlyHotels.length, icon: Clock, color: "purple", type: "hourly" },
        { label: "Both (Hybrid Stays)", count: bothHotels.length, icon: SlidersHorizontal, color: "emerald", type: "both" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-white">
            {/* Header Title */}
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    ControlHub
                </h2>
                <p className="text-xs text-neutral-400 font-medium">Monitoring platform statistics and property requests.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isActive = subTab === stat.type;
                    return (
                        <button
                            key={stat.label}
                            type="button"
                            onClick={() => setSubTab(stat.type as any)}
                            className={cn(
                                "p-6 border text-left transition-all group relative cursor-pointer outline-none rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]",
                                isActive 
                                    ? "bg-[#181818] border-neutral-400 text-white scale-[1.02]" 
                                    : "bg-[#0c0c0c] border-[#1c1c1c] border-t-[#2d2d2d] text-neutral-300 hover:border-[#2d2d2d]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 border border-[#282828]",
                                    isActive
                                        ? "bg-[#222222] text-white"
                                        : stat.color === 'blue' ? "bg-blue-950/60 text-blue-400" :
                                          stat.color === 'purple' ? "bg-purple-950/60 text-purple-400" :
                                          "bg-emerald-950/60 text-emerald-400"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                    isActive ? "bg-[#222222] border-neutral-600 text-white" : "bg-[#141414] border-[#262626] text-neutral-400"
                                )}>
                                    Filter View
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-[10px] uppercase tracking-widest mb-1 text-neutral-400">
                                    {stat.label}
                                </p>
                                <h3 className="text-4xl font-black tracking-tight">
                                    {stat.count} <span className="text-xs font-medium tracking-normal text-neutral-500 ml-1">Properties</span>
                                </h3>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filter and Table area */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#1f1f1f] bg-[#0e0e0e] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {subTab === "nightly" ? "Nightly Only (Full Day) Hotels" :
                             subTab === "hourly" ? "Hourly Only Hotels" : "Hybrid Stays (Both Nightly & Hourly)"}
                        </h3>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">
                            {displayedHotels.length} properties showing in this view
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search current list..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[#141414] border border-[#282828] rounded-xl w-64 focus:outline-none focus:border-neutral-500 font-medium text-xs text-white placeholder:text-neutral-600 shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Hotel Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Rooms Breakdown</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181818]">
                            {displayedHotels.map((hotel) => {
                                const rooms = hotel.room || hotel.rooms || [];
                                const hourlyCount = rooms.filter((r: any) => r.isHourlyEnabled || r.is_hourly_enabled).length;
                                const nightlyCount = rooms.length - hourlyCount;

                                return (
                                    <tr 
                                        key={hotel.id} 
                                        onClick={() => router(`/admin/super/hotels/${hotel.id}`)}
                                        className="hover:bg-[#121212] transition-none cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#161616] border border-[#282828] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                    {hotel.thumbnail ? (
                                                        <Image 
                                                            src={hotel.thumbnail} 
                                                            alt={hotel.name} 
                                                            width={48} 
                                                            height={48} 
                                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform" 
                                                        />
                                                    ) : (
                                                        <Hotel className="w-5 h-5 text-neutral-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {hotel.name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                                                        {hotel.city}, {hotel.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-neutral-300">
                                                    Total Rooms: <b className="text-white font-extrabold">{rooms.length}</b>
                                                </span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-lg border",
                                                        nightlyCount > 0 ? "bg-blue-950/80 border-blue-800/40 text-blue-400" : "bg-[#141414] border-[#262626] text-neutral-600"
                                                    )}>
                                                        {nightlyCount} Nightly
                                                    </span>
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-lg border",
                                                        hourlyCount > 0 ? "bg-purple-950/80 border-purple-800/40 text-purple-400" : "bg-[#141414] border-[#262626] text-neutral-600"
                                                    )}>
                                                        {hourlyCount} Hourly
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                                    ₹{hotel.pricePerNight?.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400 font-sans">/night</span>
                                                </span>
                                                {hourlyCount > 0 && (
                                                    <span className="text-[10px] font-bold text-purple-400 mt-0.5">
                                                        Hourly stays active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white border border-[#2a2a2a] bg-[#141414] group-hover:bg-[#1f1f1f] px-3.5 py-1.5 rounded-lg transition-all shadow-sm">
                                                Manage Hotel
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayedHotels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
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
