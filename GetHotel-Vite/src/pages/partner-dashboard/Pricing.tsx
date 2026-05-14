

import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    DollarSign, TrendingUp, Calendar as CalendarIcon, 
    Loader2, ChevronLeft, ChevronRight, Save, X,
    Tag, Zap, ArrowUp, ArrowDown,
    Info, CreditCard, Layers, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, dailyRateApi } from "@/lib/api";

export default function PartnerPricingPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [pricingData, setPricingData] = useState<any>({});
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Bulk Price Form
    const [bulkForm, setBulkForm] = useState({
        roomId: "",
        startDate: "",
        endDate: "",
        price: ""
    });

    const fetchPricing = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                setRooms(myHotel.rooms || []);

                // Fetch rates for the next 14 days
                const start = new Date(currentDate);
                const end = new Date(currentDate);
                end.setDate(end.getDate() + 14);

                const pricingMap: any = {};
                for (const room of myHotel.rooms) {
                    const ratesRes = await dailyRateApi.getRates(room.id, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
                    pricingMap[room.id] = ratesRes.data || [];
                }
                setPricingData(pricingMap);
            }
        } catch (err) {
            console.error("Failed to fetch pricing", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchPricing();
        } else if (!authLoading && !authUser) {
            router("/partner");
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
            const res = await dailyRateApi.bulkUpdateRates({
                ...bulkForm,
                price: parseFloat(bulkForm.price)
            });
            if (res.success) {
                setIsBulkModalOpen(false);
                fetchPricing();
            }
        } catch (err) {
            alert("Failed to update pricing");
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dynamic Pricing Control</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage seasonal rates and weekend pricing</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-6 py-3.5 bg-blue-600 text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" /> Bulk Price Update
                    </button>
                </div>
            </div>

            {/* Price Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Tag className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Rate</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">₹{hotel.pricePerNight}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Standard base price across categories</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Potential</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">High</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Based on current market trends</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Seasonal Rates</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">03</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Applied for upcoming holidays</p>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            const d = new Date(currentDate);
                            d.setDate(d.getDate() - 7);
                            setCurrentDate(d);
                        }}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 border border-slate-100 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center px-6">
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
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 border border-slate-100 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-4 h-4" /> Live Rates are visible to customers
                </div>
            </div>

            {/* Rate Matrix */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 min-w-[280px]">Room Type</th>
                                {dates.map((date) => (
                                    <th key={date.toISOString()} className="px-6 py-6 text-center border-r border-slate-100 min-w-[120px]">
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
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Default: ₹{room.pricePerNight}</span>
                                        </div>
                                    </td>
                                    {dates.map((date) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const rate = pricingData[room.id]?.find((r: any) => r.date.split('T')[0] === dateStr);
                                        const displayPrice = rate ? rate.price : room.pricePerNight;
                                        const isModified = !!rate;

                                        return (
                                            <td key={date.toISOString()} className="p-2 border-r border-slate-50 group-hover:bg-slate-50/20 transition-colors">
                                                <div className={cn(
                                                    "h-24 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all group/cell relative",
                                                    isModified 
                                                        ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm shadow-blue-100/50" 
                                                        : "bg-white text-slate-900 border border-slate-100"
                                                )}>
                                                    <span className="text-xs font-bold opacity-40">₹</span>
                                                    <span className="text-lg font-black">{displayPrice.toLocaleString()}</span>
                                                    {isModified && (
                                                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    )}
                                                    {displayPrice > room.pricePerNight && <ArrowUp className="w-3 h-3 text-emerald-500 opacity-60" />}
                                                    {displayPrice < room.pricePerNight && <ArrowDown className="w-3 h-3 text-red-500 opacity-60" />}
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

            {/* Bulk Price Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleBulkUpdate}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Revenue Management</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Bulk Rate Update</h2>
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

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Price (₹)</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                                        <input 
                                            type="number" 
                                            required
                                            placeholder="e.g. 4500"
                                            value={bulkForm.price}
                                            onChange={(e) => setBulkForm({...bulkForm, price: e.target.value})}
                                            className="w-full pl-10 pr-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 ml-1">This price will override the base price for the selected dates.</p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Update Seasonal Rates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



