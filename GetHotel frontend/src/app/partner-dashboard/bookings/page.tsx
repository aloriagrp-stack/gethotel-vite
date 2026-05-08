"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar, User, CreditCard, Clock, 
    Search, Filter, CheckCircle2, XCircle, 
    AlertCircle, Loader2, MoreVertical, 
    ChevronRight, Phone, Mail, MapPin,
    Printer, Download, Eye, Check,
    LogIn, LogOut, Ban, Bed, Users, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, bookingApi } from "@/lib/api";

export default function PartnerBookingsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const allBookings = res.data.flatMap((hotel: any) => hotel.booking || []);
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

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await bookingApi.updateBooking(id, { status: newStatus });
            if (res.success) {
                // Update local state
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
                if (selectedBooking?.id === id) {
                    setSelectedBooking({ ...selectedBooking, status: newStatus });
                }
            }
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toString().includes(searchTerm) ||
            booking.room.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Management</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage all reservations and guest operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by Guest Name, Booking ID or Room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                                statusFilter === status 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Dates</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quick Actions</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">More</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-blue-600 mb-1">#{booking.id}</span>
                                            <span className="text-sm font-black text-slate-900">{booking.room.name}</span>
                                            <span className={cn(
                                                "mt-2 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border w-fit",
                                                booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                booking.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                                booking.status === 'checked-in' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{booking.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate w-32">{booking.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black text-emerald-600">IN</span>
                                                <span className="text-xs font-bold text-slate-700">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black text-red-600">OUT</span>
                                                <span className="text-xs font-bold text-slate-700">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-900">₹{booking.totalPrice.toLocaleString()}</p>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase",
                                            booking.paymentStatus === 'paid' ? "text-emerald-500" : "text-amber-500"
                                        )}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            {booking.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="Confirm"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'checked-in')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Check-In"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </button>
                                            )}
                                            {booking.status === 'checked-in' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'checked-out')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                    title="Check-Out"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                            )}
                                            {['pending', 'confirmed'].includes(booking.status) && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Cancel"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            )}
                                            {updatingId === booking.id && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    if(confirm("Bhai, kya is booking ke liye dispute raise karna chahte ho? 🛡️")) {
                                                        alert("Issue reported to Super Admin. Resolution Center will contact you soon.");
                                                    }
                                                }}
                                                className="p-2.5 bg-red-50 text-red-400 hover:text-red-600 rounded-xl border border-red-100 transition-all"
                                                title="Report Issue / Dispute"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-100 transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <Calendar className="w-16 h-16 text-slate-100 mb-4" />
                                            <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">No bookings found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Booking Details</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">#{selectedBooking.id}</h2>
                            </div>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            {/* Guest & Status Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-900 rounded-[32px] text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black">{selectedBooking.user.name}</p>
                                        <p className="text-xs text-slate-400 font-bold">{selectedBooking.user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20">
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-2 border-b border-slate-100">Stay Information</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} - {new Date(selectedBooking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Bed className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-bold text-slate-700">{selectedBooking.room.name}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-bold text-slate-700">{selectedBooking.totalGuests} Guests</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-2 border-b border-slate-100">Guest Contact</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-bold text-slate-700">{selectedBooking.guestEmail || selectedBooking.user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-bold text-slate-700">{selectedBooking.guestPhone || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Requests */}
                            {selectedBooking.specialRequests && (
                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" /> Special Requests
                                    </h4>
                                    <p className="text-sm font-bold text-amber-900 italic">"{selectedBooking.specialRequests}"</p>
                                </div>
                            )}

                            {/* Financial Summary */}
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Financial Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Price</p>
                                        <p className="text-lg font-black text-slate-900">₹{selectedBooking.totalPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                                        <p className="text-sm font-black text-emerald-600 uppercase italic">{selectedBooking.paymentStatus}</p>
                                    </div>
                                    <div className="md:text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Paid Online</p>
                                        <p className="text-sm font-black text-slate-900">₹{Math.round(selectedBooking.totalPrice * 0.18).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Buttons */}
                            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                                    <Printer className="w-4 h-4" /> Print Invoice
                                </button>
                                <button 
                                    onClick={() => router.push('/partner-dashboard/messages')}
                                    className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    <MessageSquare className="w-4 h-4" /> Chat with Guest
                                </button>
                                <button className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                    <Phone className="w-4 h-4" /> Call Guest
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
