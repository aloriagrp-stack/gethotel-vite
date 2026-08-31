'use client';
import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Calendar, User, CreditCard, Clock, 
    Search, CheckCircle2, XCircle, 
    AlertCircle, Loader2, 
    ChevronRight, Phone, Mail,
    Printer, Eye, Check,
    LogIn, LogOut, Ban, Bed, Users, ShieldAlert, MessageSquare
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
            const res = await hotelApi.getMyHotels({ includeBookings: true });
            if (res.success && res.data && res.data.length > 0) {
                const allBookings = res.data.flatMap((hotel: any) => hotel.booking || hotel.hotel_bookings || []);
                setBookings(allBookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (authUser?.role === 'hotel_admin' || authUser?.role === 'super_admin')) {
            fetchBookings();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await bookingApi.updateBooking(id, { status: newStatus });
            if (res.success) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
                if (selectedBooking?.id === id) {
                    setSelectedBooking({ ...selectedBooking, status: newStatus });
                }
            }
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            (booking.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.id || "").toString().includes(searchTerm) ||
            (booking.room?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const currentStatus = (booking.status || "").toLowerCase();
        const targetStatus = statusFilter.toLowerCase();
        
        const matchesStatus = statusFilter === "all" || 
            (targetStatus === "pending" ? (currentStatus === "pending" || currentStatus === "held") : currentStatus === targetStatus);
        
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
        <div className="space-y-8 pb-20">
            {!selectedBooking ? (
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Reservations</h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage all booking operations & guest statuses</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search Guest, ID, or Room..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
                            {['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
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

                    <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dates</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Split</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Control</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-blue-600 mb-1">#{booking.id}</span>
                                                    <span className="text-sm font-black text-slate-900">{booking.room?.name || 'Standard Room'}</span>
                                                    <div className={cn(
                                                        "mt-2 px-2.5 py-1 rounded-none text-[8px] font-black uppercase tracking-widest border w-fit flex items-center gap-1.5",
                                                        booking.status?.toLowerCase() === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                        (booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'held') ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                                        booking.status?.toLowerCase() === 'checked-in' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-200"
                                                    )}>
                                                        <div className={cn("w-1 h-1 rounded-none", 
                                                            booking.status?.toLowerCase() === 'confirmed' ? "bg-emerald-600" : 
                                                            (booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'held') ? "bg-amber-600" : 
                                                            booking.status?.toLowerCase() === 'checked-in' ? "bg-blue-600" : "bg-slate-400"
                                                        )} />
                                                        {booking.status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center shrink-0">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{booking.user?.name || 'Guest'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{booking.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-xs font-black text-slate-900">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                    <div className="h-4 w-[1px] bg-slate-200" />
                                                    <span className="text-xs font-black text-slate-900">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-950">₹{booking.totalPrice.toLocaleString()}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        {booking.amountPaid === 0 ? (
                                                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Full Pay at Hotel</span>
                                                        ) : booking.amountPaid >= booking.totalPrice ? (
                                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Full Paid Online</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">₹{booking.amountPaid.toLocaleString()} Paid Online</span>
                                                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">₹{(booking.totalPrice - booking.amountPaid).toLocaleString()} Pay at Hotel</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {updatingId === booking.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                                    ) : (
                                                        (() => {
                                                            const checkInDate = new Date(booking.checkIn);
                                                            const checkOutDate = new Date(booking.checkOut);
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            checkInDate.setHours(0, 0, 0, 0);
                                                            checkOutDate.setHours(0, 0, 0, 0);
                                                            
                                                            const isBeforeCheckIn = today.getTime() < checkInDate.getTime();
                                                            const isAfterCheckOut = today.getTime() > checkOutDate.getTime();
                                                            const statusLower = booking.status?.toLowerCase();

                                                            // 1. Cancelled Tag
                                                            if (statusLower === 'cancelled') {
                                                                return (
                                                                    <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-none text-[8px] font-black uppercase tracking-widest">
                                                                        Cancelled
                                                                    </span>
                                                                );
                                                            }

                                                            // 2. Completed Tag
                                                            if (statusLower === 'checked-out' || isAfterCheckOut) {
                                                                return (
                                                                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-none text-[8px] font-black uppercase tracking-widest">
                                                                        Completed
                                                                    </span>
                                                                );
                                                            }

                                                            // 3. Active status check
                                                            const isActive = ['pending', 'confirmed', 'held', 'checked-in'].includes(statusLower);
                                                            if (isActive) {
                                                                if (isBeforeCheckIn) {
                                                                    return (
                                                                        <button 
                                                                            onClick={() => {
                                                                                if (confirm("Bhai, kya aap sach mein ye booking cancel/reject karna chahte ho?")) {
                                                                                    handleUpdateStatus(booking.id, 'cancelled');
                                                                                }
                                                                            }}
                                                                            className="p-2 bg-red-50 text-red-400 rounded-none border border-red-50/50 hover:bg-red-500 hover:text-white transition-all"
                                                                            title="Cancel"
                                                                        >
                                                                            <Ban className="w-4 h-4" />
                                                                        </button>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <div 
                                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-none border border-emerald-100 flex items-center justify-center"
                                                                            title="Confirmed & Active"
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </div>
                                                                    );
                                                                }
                                                            }
                                                            return <span className="text-[10px] font-bold text-slate-400">-</span>;
                                                        })()
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-none border border-slate-100 transition-all"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-none border border-slate-200 shadow-2xl overflow-hidden min-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-slate-50 border border-slate-200 transition-all"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Order ID: #{selectedBooking.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Print Invoice
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            {/* Guest Section */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-600 pl-4">Guest Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-none border border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm border border-slate-200">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                            <p className="text-lg font-black text-slate-900 italic">{selectedBooking.user?.name || 'Guest'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm border border-slate-200">
                                            <Phone className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                            <p className="text-lg font-black text-slate-900">{selectedBooking.guestPhone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm border border-slate-200">
                                            <Mail className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="text-sm font-black text-slate-900 truncate w-48">{selectedBooking.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm border border-slate-200">
                                            <Users className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Guests</p>
                                            <p className="text-lg font-black text-slate-900">{selectedBooking.totalGuests} Person(s)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Details */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-600 pl-4">Stay & Room Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white border border-slate-200 rounded-none shadow-sm">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Bed className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Booked Room</p>
                                                <p className="text-sm font-black text-slate-900">{selectedBooking.room?.name || 'Standard Room'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Check-In</p>
                                                <p className="text-sm font-black text-slate-900">{new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-red-600" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Check-Out</p>
                                                <p className="text-sm font-black text-slate-900">{new Date(selectedBooking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Estimated Arrival</p>
                                                <p className="text-sm font-black text-slate-900">{selectedBooking.arrivalTime || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-center bg-slate-50 rounded-none p-6 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Duration</p>
                                        <h3 className="text-4xl font-black text-slate-900 italic">
                                            {Math.ceil((new Date(selectedBooking.checkOut).getTime() - new Date(selectedBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                                        </h3>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">Night(s)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Payment Summary - Clean Style */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-500 pl-4">Payment Summary</h4>
                                <div className="bg-slate-900 rounded-none p-8 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-none blur-3xl -mr-16 -mt-16" />
                                    <div className="relative z-10 space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Booking Price</p>
                                            <h3 className="text-4xl font-black italic tracking-tighter">₹{selectedBooking.totalPrice.toLocaleString()}</h3>
                                        </div>
                                        <div className="h-[1px] bg-white/10" />
                                        <div className="space-y-4">
                                            {(selectedBooking.amountPaid ?? 0) === 0 ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-none bg-amber-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Payment Option</span>
                                                    </div>
                                                    <span className="text-sm font-black text-amber-400">Full Pay at Hotel</span>
                                                </div>
                                            ) : (selectedBooking.amountPaid ?? 0) >= selectedBooking.totalPrice ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Payment Option</span>
                                                    </div>
                                                    <span className="text-sm font-black text-emerald-400">Full Paid Online</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Paid Online</span>
                                                        </div>
                                                        <span className="text-sm font-black text-emerald-400">₹{selectedBooking.amountPaid.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-none bg-amber-400" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">At Hotel</span>
                                                        </div>
                                                        <span className="text-sm font-black text-amber-400">₹{(selectedBooking.totalPrice - selectedBooking.amountPaid).toLocaleString()}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="pt-4">
                                            <div className="px-4 py-3 bg-white/5 rounded-none border border-white/10 text-center">
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Platform Status</p>
                                                <p className="text-xs font-black uppercase mt-1 italic">
                                                    {selectedBooking.amountPaid === 0 ? 'Pay at Hotel' : selectedBooking.amountPaid >= selectedBooking.totalPrice ? 'Fully Paid' : 'Partially Paid'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <button 
                                    onClick={() => router('/partner-dashboard/messages')}
                                    className="w-full py-4 bg-blue-600 text-white rounded-none font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-all"
                                >
                                    <MessageSquare className="w-5 h-5" /> Chat with Guest
                                </button>
                                <button className="w-full py-4 bg-slate-100 text-slate-900 rounded-none font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all">
                                    <Phone className="w-5 h-5" /> Call Guest
                                </button>
                                <button 
                                    onClick={() => {
                                        if(confirm("Report this guest to GetHotel Resolution Center?")) {
                                            alert("Request submitted.");
                                        }
                                    }}
                                    className="w-full py-4 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-50 rounded-none transition-all"
                                >
                                    <ShieldAlert className="w-4 h-4" /> Report Issue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
