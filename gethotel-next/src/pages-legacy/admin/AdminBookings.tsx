'use client';


import { useState, useEffect } from "react";
import { 
    Search, Filter, Calendar, 
    User, Hotel, CreditCard, 
    CheckCircle2, XCircle, Clock, 
    Loader2, ChevronRight, Eye,
    Download, ArrowUpDown, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bookingApi } from "@/lib/api";

export default function SuperAdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchAllBookings = async () => {
            try {
                const res = await bookingApi.getBookings(); // Super Admin can see all
                if (res.success) {
                    setBookings(res.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch all bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id.toString().includes(searchTerm);
        
        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 pb-12 font-sans text-neutral-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-brand-400" /> Master Bookings
                    </h1>
                    <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mt-1">Platform-wide reservation audit & tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-3 bg-[#141414] border border-[#282828] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1f1f1f] transition-all flex items-center gap-2 cursor-pointer shadow-md">
                        <Download className="w-4 h-4 text-emerald-400" /> Export Master CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text"
                        placeholder="Search by Guest, Hotel or Booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-mono transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {['all', 'confirmed', 'pending', 'cancelled', 'checked-out'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer",
                                statusFilter === status 
                                    ? "bg-neutral-100 text-black border-white shadow-md" 
                                    : "bg-[#141414] text-neutral-400 border-[#282828] hover:text-white hover:bg-[#1a1a1a]"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Master Table */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#121212] text-neutral-400 border-b border-[#222222]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181818]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center bg-[#0c0c0c]">
                                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-[#121212] transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-black text-brand-400 font-mono">#GH-{b.id + 10000}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#181818] border border-[#2b2b2b] rounded-lg flex items-center justify-center shrink-0">
                                                <Building2 className="w-4 h-4 text-neutral-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase leading-snug">{b.hotel?.name}</p>
                                                <p className="text-[10px] font-semibold text-neutral-500 uppercase">{b.hotel?.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#181818] border border-[#2b2b2b] rounded-lg flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-neutral-400" />
                                            </div>
                                            <p className="text-xs font-bold text-neutral-200">{b.user?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-bold text-white font-mono">
                                                {new Date(b.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} → {new Date(b.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mt-0.5">
                                                Arrival: {b.arrivalTime || "Not specified"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">₹{b.totalPrice?.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Commission: ₹{Math.round(b.totalPrice * 0.12).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                                            b.status === 'confirmed' ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/40" :
                                            b.status === 'pending' ? "bg-amber-950/80 text-amber-300 border-amber-800/40" :
                                            b.status === 'cancelled' ? "bg-red-950/80 text-red-300 border-red-800/40" : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                        )}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 bg-[#181818] border border-[#2b2b2b] text-neutral-400 hover:text-white hover:bg-[#252525] transition-all rounded-lg cursor-pointer">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}



