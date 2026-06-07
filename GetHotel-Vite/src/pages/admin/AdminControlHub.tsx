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
        <div className="space-y-8 animate-in fade-in duration-500">
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
                                "p-6 border text-left transition-all group relative cursor-pointer outline-none",
                                isActive 
                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]" 
                                    : "bg-white border-slate-200 text-slate-900 hover:border-slate-350 hover:shadow-md"
                            )}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                          stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                          "bg-emerald-50 text-emerald-600"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    Filter View
                                </span>
                            </div>
                            <div>
                                <p className={cn(
                                    "font-black text-[10px] uppercase tracking-[0.15em] mb-1",
                                    isActive ? "text-slate-400" : "text-slate-400"
                                )}>
                                    {stat.label}
                                </p>
                                <h3 className="text-4xl font-black tracking-tighter italic">
                                    {stat.count} <span className="text-xs font-normal not-italic tracking-normal text-slate-500 ml-1">Properties</span>
                                </h3>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filter and Table area */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            {subTab === "nightly" ? "Nightly Only (Full Day) Hotels" :
                             subTab === "hourly" ? "Hourly Only Hotels" : "Hybrid Stays (Both Nightly & Hourly)"}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            {displayedHotels.length} properties showing in this view
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search current list..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm w-64 focus:outline-none focus:border-slate-400 font-medium text-xs shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hotel Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rooms Breakdown</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedHotels.map((hotel) => {
                                const rooms = hotel.room || hotel.rooms || [];
                                const hourlyCount = rooms.filter((r: any) => r.isHourlyEnabled || r.is_hourly_enabled).length;
                                const nightlyCount = rooms.length - hourlyCount;

                                return (
                                    <tr 
                                        key={hotel.id} 
                                        onClick={() => router(`/admin/super/hotels/${hotel.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {hotel.thumbnail ? (
                                                        <Image 
                                                            src={hotel.thumbnail} 
                                                            alt={hotel.name} 
                                                            width={48} 
                                                            height={48} 
                                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform" 
                                                        />
                                                    ) : (
                                                        <Hotel className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                                        {hotel.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                        {hotel.city}, {hotel.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-600">
                                                    Total Rooms: <b className="text-slate-900 font-black">{rooms.length}</b>
                                                </span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                                                        nightlyCount > 0 ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-50 text-slate-300"
                                                    )}>
                                                        {nightlyCount} Nightly
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                                                        hourlyCount > 0 ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-slate-50 text-slate-300"
                                                    )}>
                                                        {hourlyCount} Hourly
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900">
                                                    ₹{hotel.pricePerNight?.toLocaleString()} <span className="text-[9px] font-normal text-slate-450">/night</span>
                                                </span>
                                                {hourlyCount > 0 && (
                                                    <span className="text-[10px] font-bold text-purple-600 mt-0.5">
                                                        Hourly stays active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 border border-transparent group-hover:border-brand-200 px-3 py-1.5 transition-all">
                                                Manage Hotel
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayedHotels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <ShieldAlert className="w-8 h-8 text-slate-350 mx-auto mb-3" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
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
