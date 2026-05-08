"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar as CalendarIcon, Layers, Loader2, 
    ChevronLeft, ChevronRight, Save, X,
    Lock, Unlock, Info, AlertCircle,
    CheckCircle2, XCircle, Clock, Filter,
    Bed, Search, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, dailyRateApi } from "@/lib/api";

export default function PartnerInventoryPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [inventoryData, setInventoryData] = useState<any>({});
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Bulk Update Form
    const [bulkForm, setBulkForm] = useState({
        roomId: "",
        startDate: "",
        endDate: "",
        isBlocked: false,
        available: "1"
    });

    const fetchInventory = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                const hotelRooms = myHotel.room || myHotel.rooms || [];
                setRooms(hotelRooms);

                // Fetch rates for the next 30 days
                const start = new Date(currentDate);
                const end = new Date(currentDate);
                end.setDate(end.getDate() + 30);

                const inventoryMap: any = {};
                // Use the safe hotelRooms array for iteration
                for (const room of hotelRooms) {
                    const ratesRes = await dailyRateApi.getRates(room.id, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
                    inventoryMap[room.id] = ratesRes.data || [];
                }
                setInventoryData(inventoryMap);
            }
        } catch (err) {
            console.error("Failed to fetch inventory", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchInventory();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, currentDate]);

    const getDates = () => {
        const dates = [];
        const start = new Date(currentDate);
        for (let i = 0; i < 14; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await dailyRateApi.bulkUpdateRates(bulkForm);
            if (res.success) {
                setIsBulkModalOpen(false);
                fetchInventory(); // Refresh data
            }
        } catch (err) {
            alert("Failed to update inventory");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const dates = getDates();

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Calendar</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage room availability and block dates</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-6 py-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
                    >
                        <Layers className="w-4 h-4" /> Bulk Block/Unblock
                    </button>
                </div>
            </div>

            {/* Calendar Control */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            const d = new Date(currentDate);
                            d.setDate(d.getDate() - 7);
                            setCurrentDate(d);
                        }}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 border border-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center px-6">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Viewing Period</p>
                        <p className="text-lg font-black text-slate-900">
                            {dates[0].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {dates[dates.length - 1].toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            const d = new Date(currentDate);
                            d.setDate(d.getDate() + 7);
                            setCurrentDate(d);
                        }}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 border border-slate-100"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blocked / Sold Out</span>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 min-w-[280px]">Room Type</th>
                                {dates.map((date) => (
                                    <th key={date.toISOString()} className="px-6 py-6 text-center border-r border-slate-100 min-w-[100px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</p>
                                        <p className={cn(
                                            "text-lg font-black",
                                            [0, 6].includes(date.getDay()) ? "text-blue-600" : "text-slate-900"
                                        )}>{date.getDate()}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rooms.map((room) => (
                                <tr key={room.id} className="group">
                                    <td className="sticky left-0 z-10 bg-white px-8 py-6 border-r border-slate-200 group-hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{room.name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Base Price: ₹{room.pricePerNight}</span>
                                        </div>
                                    </td>
                                    {dates.map((date) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const rate = inventoryData[room.id]?.find((r: any) => r.date.split('T')[0] === dateStr);
                                        const isAvailable = rate ? rate.available > 0 : true;

                                        return (
                                            <td key={date.toISOString()} className="p-2 border-r border-slate-50 group-hover:bg-slate-50/20 transition-colors">
                                                <div className={cn(
                                                    "h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all",
                                                    isAvailable 
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" 
                                                        : "bg-red-50 text-red-600 border border-red-100/50"
                                                )}>
                                                    {isAvailable ? <Unlock className="w-3 h-3 opacity-40" /> : <Lock className="w-3 h-3 opacity-40" />}
                                                    <span className="text-xs font-black">{isAvailable ? (rate?.available || 1) : 0}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-tight opacity-60">Rooms</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Update Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleBulkUpdate}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Inventory Management</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Bulk Block/Unblock</h2>
                                </div>
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Room Type</label>
                                    <select 
                                        required
                                        value={bulkForm.roomId}
                                        onChange={(e) => setBulkForm({...bulkForm, roomId: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select a room...</option>
                                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={bulkForm.startDate}
                                            onChange={(e) => setBulkForm({...bulkForm, startDate: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={bulkForm.endDate}
                                            onChange={(e) => setBulkForm({...bulkForm, endDate: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setBulkForm({...bulkForm, isBlocked: false, available: "1"})}
                                            className={cn(
                                                "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                                                !bulkForm.isBlocked ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100" : "bg-white text-slate-500 border-slate-200"
                                            )}
                                        >
                                            <Unlock className="w-4 h-4" /> Open (Available)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkForm({...bulkForm, isBlocked: true, available: "0"})}
                                            className={cn(
                                                "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                                                bulkForm.isBlocked ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-100" : "bg-white text-slate-500 border-slate-200"
                                            )}
                                        >
                                            <Lock className="w-4 h-4" /> Block (Sold Out)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Apply Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
