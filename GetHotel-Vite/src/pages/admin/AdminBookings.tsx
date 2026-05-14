

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
        <div className="p-10 space-y-10 bg-slate-50 min-h-screen animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Calendar className="w-10 h-10 text-brand-600" /> Master Bookings
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 ml-1">Platform-wide reservation audit & tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Master CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by Guest, Hotel or Booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-sm text-xs font-bold uppercase tracking-wider focus:bg-white focus:border-slate-900 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {['all', 'confirmed', 'pending', 'cancelled', 'checked-out'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-6 py-2.5 rounded-sm text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                                statusFilter === status 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Master Table */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Booking ID</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Property</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Dates</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Total Amount</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-32 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-slate-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-brand-600 italic">#GH-{b.id + 10000}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-sm flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">{b.hotel?.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.hotel?.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-sm flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{b.user?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                {new Date(b.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                            <div className="w-full h-px bg-slate-100 border-t border-dashed" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                {new Date(b.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 italic">₹{b.totalPrice?.toLocaleString()}</span>
                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Commission: ₹{Math.round(b.totalPrice * 0.18).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                            b.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            b.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            b.status === 'cancelled' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-950 hover:bg-slate-200 transition-all rounded-sm">
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



