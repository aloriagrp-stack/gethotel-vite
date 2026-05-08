"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    LogIn, LogOut, Clock, Users, 
    Loader2, Search, Filter, 
    CheckCircle2, AlertCircle, 
    User, Smartphone, Mail,
    ArrowRight, Hotel, Bed,
    Calendar, TrendingUp,
    Banknote, QrCode, CreditCard, ShieldAlert
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { hotelApi, bookingApi } from "@/lib/api";

export default function PartnerFrontDeskPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'arrivals' | 'in-house' | 'departures'>('arrivals');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const allBookings = res.data.flatMap((hotel: any) => hotel.booking || hotel.bookings || []);
                setBookings(allBookings);
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchBookings();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateStatus = async (id: number, newStatus?: string, paymentMode?: string) => {
        setUpdatingId(id);
        try {
            const data: any = {};
            if (newStatus) data.status = newStatus;
            if (paymentMode) {
                data.paymentStatus = 'paid';
                data.internalNotes = `Remaining dues collected via ${paymentMode}`;
            }

            const res = await bookingApi.updateBooking(id, data);
            if (res.success) {
                setBookings(prev => prev.map(b => b.id === id ? { 
                    ...b, 
                    status: newStatus || b.status, 
                    paymentStatus: data.paymentStatus || b.paymentStatus 
                } : b));
            }
        } catch (err) {
            alert("Failed to update guest status");
        } finally {
            setUpdatingId(null);
        }
    };

    const today = new Date().toDateString();

    const arrivals = bookings.filter(b => 
        new Date(b.checkIn).toDateString() === today && 
        b.status === 'confirmed'
    );

    const inHouse = bookings.filter(b => 
        b.status === 'checked-in'
    );

    const departures = bookings.filter(b => 
        new Date(b.checkOut).toDateString() === today && 
        b.status === 'checked-in'
    );

    const displayList = activeTab === 'arrivals' ? arrivals : activeTab === 'in-house' ? inHouse : departures;

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Front Desk</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Live reception management and guest stay tracking</p>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button 
                    onClick={() => setActiveTab('arrivals')}
                    className={cn(
                        "p-6 rounded-[32px] border transition-all text-left group",
                        activeTab === 'arrivals' ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" : "bg-white border-slate-200"
                    )}
                >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", activeTab === 'arrivals' ? "bg-white/10" : "bg-blue-50 text-blue-600")}>
                        <LogIn className="w-6 h-6" />
                    </div>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", activeTab === 'arrivals' ? "text-blue-100" : "text-slate-400")}>Today's Arrivals</p>
                    <h3 className="text-2xl font-black">{arrivals.length} Guests</h3>
                </button>

                <button 
                    onClick={() => setActiveTab('in-house')}
                    className={cn(
                        "p-6 rounded-[32px] border transition-all text-left group",
                        activeTab === 'in-house' ? "bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-100" : "bg-white border-slate-200"
                    )}
                >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", activeTab === 'in-house' ? "bg-white/10" : "bg-purple-50 text-purple-600")}>
                        <Users className="w-6 h-6" />
                    </div>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", activeTab === 'in-house' ? "text-purple-100" : "text-slate-400")}>Currently In-House</p>
                    <h3 className="text-2xl font-black">{inHouse.length} Occupied</h3>
                </button>

                <button 
                    onClick={() => setActiveTab('departures')}
                    className={cn(
                        "p-6 rounded-[32px] border transition-all text-left group",
                        activeTab === 'departures' ? "bg-amber-600 text-white border-amber-600 shadow-xl shadow-amber-100" : "bg-white border-slate-200"
                    )}
                >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", activeTab === 'departures' ? "bg-white/10" : "bg-amber-50 text-amber-600")}>
                        <LogOut className="w-6 h-6" />
                    </div>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", activeTab === 'departures' ? "text-amber-100" : "text-slate-400")}>Today's Departures</p>
                    <h3 className="text-2xl font-black">{departures.length} Guests</h3>
                </button>
            </div>

            {/* Live List */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        {activeTab === 'arrivals' && <LogIn className="w-5 h-5 text-blue-600" />}
                        {activeTab === 'in-house' && <Users className="w-5 h-5 text-purple-600" />}
                        {activeTab === 'departures' && <LogOut className="w-5 h-5 text-amber-600" />}
                        {activeTab.replace('-', ' ')} List
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{displayList.length} Records found</span>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {displayList.map((booking) => (
                        <div key={booking.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-start gap-6 flex-1">
                                    <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-50">
                                        <User className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-lg font-black text-slate-900">
                                                {booking.guestFirstName ? `${booking.guestFirstName} ${booking.guestLastName}` : booking.user.name}
                                            </h4>
                                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded shadow-sm">#{booking.id}</span>
                                            {booking.specialRequests && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded animate-pulse">Special Request</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                                                <Smartphone className="w-3.5 h-3.5 text-slate-300" /> {booking.guestPhone || "No Phone"}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                                                <Mail className="w-3.5 h-3.5 text-slate-300" /> {booking.guestEmail || booking.user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-900 font-black text-[11px] italic">
                                                <Bed className="w-3.5 h-3.5 text-blue-500" /> {booking.room.name} 
                                                {booking.roomDetails && (
                                                    <span className="ml-1 text-slate-400 font-bold not-italic">
                                                        ({JSON.parse(booking.roomDetails).reduce((s: number, r: any) => s + r.quantity, 0)} Units)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {booking.specialRequests && (
                                            <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Guest Note:</p>
                                                <p className="text-xs font-bold text-slate-600 italic">"{booking.specialRequests}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const phone = booking.guestPhone || "";
                                                    const name = booking.guestFirstName ? `${booking.guestFirstName}` : booking.user?.name;
                                                    window.open(`https://wa.me/${phone}?text=Namaste ${name}, Welcome to GetHotel! Hope you are enjoying your stay.`, '_blank');
                                                }}
                                                className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"
                                                title="WhatsApp Guest"
                                            >
                                                <Smartphone className="w-4 h-4" />
                                            </button>
                                            {booking.isBusiness && (
                                                <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-slate-200">
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                                    GST
                                                </div>
                                            )}
                                        </div>

                                        {/* Billing Breakdown - NEW */}
                                        <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-sm min-w-[200px]">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Online Paid</span>
                                                <span className="text-xs font-black text-emerald-600">{formatPrice(booking.amountPaid)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dues at Hotel</span>
                                                <span className="text-sm font-black text-brand-600">{formatPrice(booking.totalPrice - booking.amountPaid)}</span>
                                            </div>
                                            
                                            {booking.paymentStatus === 'paid' ? (
                                                <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-xl">
                                                    <CheckCircle2 className="w-3 h-3" /> Fully Paid
                                                </div>
                                            ) : (
                                                <div className="mt-3 grid grid-cols-3 gap-1">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(booking.id, 'paid', 'Cash')}
                                                        className="p-2 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all flex flex-col items-center gap-1"
                                                        title="Paid by Cash"
                                                    >
                                                        <Banknote className="w-3 h-3" />
                                                        <span className="text-[6px] font-black">CASH</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(booking.id, 'paid', 'UPI')}
                                                        className="p-2 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all flex flex-col items-center gap-1"
                                                        title="Paid by UPI"
                                                    >
                                                        <QrCode className="w-3 h-3" />
                                                        <span className="text-[6px] font-black">UPI</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(booking.id, 'paid', 'Card')}
                                                        className="p-2 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all flex flex-col items-center gap-1"
                                                        title="Paid by Card"
                                                    >
                                                        <CreditCard className="w-3 h-3" />
                                                        <span className="text-[6px] font-black">CARD</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {activeTab === 'arrivals' && (
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'checked-in')}
                                                    disabled={updatingId === booking.id}
                                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
                                                >
                                                    {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                                    Check-In
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(confirm("Bhai, kya aap is guest ko 'No-Show' report karke dispute raise karna chahte ho? 🛡️")) {
                                                            handleUpdateStatus(booking.id, 'cancelled');
                                                            alert("No-Show reported. Dispute raised in Super Admin Hub.");
                                                        }
                                                    }}
                                                    className="p-4 bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                    title="Report No-Show / Raise Dispute"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {activeTab === 'in-house' && (
                                            <div className="flex items-center gap-3">
                                                <div className="hidden sm:flex px-4 py-2 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-purple-100 items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                                    In-Stay
                                                </div>
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'checked-out')}
                                                    disabled={updatingId === booking.id}
                                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-100"
                                                >
                                                    {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                                    Check-Out
                                                </button>
                                            </div>
                                        )}
                                        {activeTab === 'departures' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(booking.id, 'checked-out')}
                                                disabled={updatingId === booking.id}
                                                className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all flex items-center gap-2"
                                            >
                                                {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                                Confirm Check-Out
                                            </button>
                                        )}
                                    </div>
                            </div>
                        </div>
                    ))}
                    {displayList.length === 0 && (
                        <div className="py-32 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                {activeTab === 'arrivals' && <LogIn className="w-10 h-10" />}
                                {activeTab === 'in-house' && <Users className="w-10 h-10" />}
                                {activeTab === 'departures' && <LogOut className="w-10 h-10" />}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">No {activeTab.replace('-', ' ')} for today</h4>
                            <p className="text-slate-500 font-medium">Everything is up to date at the front desk.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Status / Occupancy Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-8 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Live Occupancy
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-black">{inHouse.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Rooms</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-blue-400">{(inHouse.length / 10 * 100).toFixed(0)}%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy Rate</p>
                            </div>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full shadow-glow" 
                                style={{ width: `${Math.min(100, (inHouse.length / 10 * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Operational Alert
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0">
                            <Hotel className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">Ensure all check-ins are verified</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Verify guest identity documents during the check-in process as per local regulations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
