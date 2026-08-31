'use client';

import { useState, useEffect } from "react";
import { useNavigate as useRouter, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Hotel, MapPin, DollarSign, Star,
    ArrowLeft, Loader2, User, Mail,
    Phone, Calendar, Globe, ShieldCheck,
    Image as ImageIcon, Bed, Info,
    TrendingUp, History, UserCheck,
    CreditCard, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { authApi, adminApi } from "@/lib/api";

interface AdminHotelDetailsProps {
    hotelId?: string | number;
    onBack?: () => void;
}

export default function HotelDetailPage({ hotelId, onBack }: AdminHotelDetailsProps = {}) {
    const params = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location?.search || "");
    const id = hotelId ? String(hotelId) : (params.id || searchParams.get("hotelId"));
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [qualityScore, setQualityScore] = useState(85);
    const [badges, setBadges] = useState<string[]>([]);
    
    // Danger Zone States
    const [deleteStep, setDeleteStep] = useState(0);
    const [confirmHotelName, setConfirmHotelName] = useState("");

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router('?tab=hotels');
        }
    };

    // Calculate total revenue from bookings if backend field is missing
    const calculatedRevenue = hotel?.booking?.reduce((sum: number, b: any) =>
        b.status === 'confirmed' || b.status === 'checked-in' || b.status === 'checked-out' ? sum + Number(b.totalPrice || 0) : sum, 0
    ) || 0;

    const displayRevenue = (hotel?.totalRevenue > 0) ? hotel.totalRevenue : calculatedRevenue;

    useEffect(() => {
        const fetchHotel = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const resData = await adminApi.getHotelDetails(id);
                if (resData.success) {
                    setHotel(resData.data);
                    setQualityScore(resData.data.qualityScore || 85);
                    setBadges(resData.data.badges ? resData.data.badges.split(',') : []);
                }
            } catch (err) {
                console.error("Failed to fetch hotel details", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (authUser?.role === 'super_admin') {
                fetchHotel();
            } else {
                setLoading(false);
            }
        }
    }, [id, authUser, authLoading]);

    const handleImpersonate = async () => {
        const newTab = window.open("about:blank", "_blank");
        try {
            const res = await authApi.impersonate(hotel.user.id);
            if (res.success) {
                if (newTab) {
                    newTab.location.href = `/partner-dashboard/?activeHotelId=${hotel.id}&impersonateToken=${res.token}`;
                } else {
                    window.open(`/partner-dashboard/?activeHotelId=${hotel.id}&impersonateToken=${res.token}`, "_blank");
                }
            } else {
                if (newTab) newTab.close();
                alert("Failed to login as partner: " + (res.message || "Invalid response"));
            }
        } catch (err: any) {
            if (newTab) newTab.close();
            alert("Failed to login as partner: " + (err.message || err));
        }
    };

    const handleUpdateMetrics = async () => {
        setUpdating(true);
        try {
            const resData = await adminApi.updateHotelMetrics(id!, {
                qualityScore,
                badges: badges.join(',')
            });
            if (resData.success) {
                alert("Performance metrics updated successfully!");
                setHotel({ ...hotel, qualityScore, badges: badges.join(',') });
            }
        } catch (err) {
            alert("Failed to update metrics");
        } finally {
            setUpdating(false);
        }
    };

    const handleAutoRecalculate = async () => {
        setUpdating(true);
        try {
            const resData = await adminApi.recalculateHotelMetrics(id!);
            if (resData.success) {
                alert(resData.message);
                setHotel(resData.data);
                setQualityScore(resData.data.qualityScore);
            }
        } catch (err) {
            alert("Auto-recalculation failed");
        } finally {
            setUpdating(false);
        }
    };

    const toggleBadge = (badge: string) => {
        setBadges(prev =>
            prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
        );
    };

    const handleSuspend = async () => {
        if (!confirm(`Are you sure you want to ${hotel.isActive !== false ? 'hide' : 'show'} this hotel from/on the search results?`)) return;
        setUpdating(true);
        try {
            const res = await adminApi.suspendHotel(id!);
            if (res.success) {
                setHotel({ ...hotel, isActive: hotel.isActive === false ? true : false });
                alert(res.message);
            }
        } catch (err) {
            alert("Failed to update property status");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (confirmHotelName !== hotel.name) {
            alert("Hotel name does not match!");
            return;
        }
        setUpdating(true);
        try {
            const res = await adminApi.deleteHotel(id!);
            if (res.success) {
                alert("Hotel permanently deleted.");
                handleBack();
            }
        } catch (err) {
            alert("Failed to delete property");
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#050505] text-white">
                <h1 className="text-2xl font-black text-white mb-4">Hotel Not Found</h1>
                <button onClick={handleBack} className="text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back to Hotels
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#050505] text-neutral-100 min-h-screen font-sans animate-in fade-in duration-200">
            <div className="max-w-7xl mx-auto">

                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1c1c1c]">
                    <button onClick={handleBack} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4 text-emerald-400" /> Back to Hotels List
                    </button>
                    <div className="flex gap-3">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${hotel.isFeatured ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' : 'bg-[#141414] text-neutral-400 border-[#262626]'}`}>
                            {hotel.isFeatured ? 'Featured Property' : 'Standard Property'}
                        </span>
                        <span className={cn(
                            "px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest",
                            hotel.isActive !== false ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" : "bg-red-950/60 text-red-400 border-red-800/40"
                        )}>
                            {hotel.isActive !== false ? 'Visible on Site' : 'Hidden from Site'}
                        </span>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-8 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                                        <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                                        {hotel.starRating} Star Property
                                    </div>
                                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">{hotel.name}</h1>
                                    <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm">
                                        <MapPin className="w-4 h-4 text-neutral-500" />
                                        {hotel.city} — {hotel.address}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total GMV</p>
                                    <p className="text-3xl font-black text-white font-mono">₹{displayRevenue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[#1a1a1a]">
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Price/Night</p>
                                    <p className="text-xl font-bold text-white font-mono">₹{hotel.pricePerNight}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Trust Score</p>
                                    <p className="text-xl font-bold text-emerald-400">{hotel.qualityScore || 85}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Response</p>
                                    <p className="text-xl font-bold text-purple-400">{hotel.responseSpeed || "Fast"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Guest Rating</p>
                                    <p className="text-xl font-bold text-amber-400">{hotel.guestRating || 0}</p>
                                </div>
                            </div>

                            {/* Trust & Performance Metrics */}
                            <div className="mt-8 p-6 bg-[#141414] border border-[#262626] rounded-2xl">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Trust & Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">Performance Badges</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['Trusted Partner', 'Top Selling', 'Best Value', 'Fast Response'].map(badge => (
                                                    <button
                                                        key={badge}
                                                        onClick={() => toggleBadge(badge)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                                                            badges.includes(badge)
                                                                ? "bg-[#222222] border border-neutral-500 text-white shadow-md"
                                                                : "bg-[#0c0c0c] border border-[#242424] text-neutral-400 hover:border-neutral-500"
                                                        )}
                                                    >
                                                        {badge}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Quality Score</p>
                                            <span className="text-xs font-bold text-emerald-400">{qualityScore}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            className="w-full accent-emerald-400 cursor-pointer"
                                            value={qualityScore}
                                            onChange={(e) => setQualityScore(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Cancellation Rate</p>
                                            <span className="text-xs font-bold text-red-400">{hotel.cancellationRate || 0}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#222222] rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${hotel.cancellationRate || 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={handleAutoRecalculate}
                                        disabled={updating}
                                        className="px-6 py-2.5 bg-[#181818] border border-[#2a2a2a] text-neutral-300 text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#222222] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
                                        Auto-Recalculate
                                    </button>
                                    <button
                                        onClick={handleUpdateMetrics}
                                        disabled={updating}
                                        className="px-6 py-2.5 bg-neutral-100 text-black text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                                    >
                                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                        Update Manually
                                    </button>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-neutral-400" /> Property Description
                                </h3>
                                <p className="text-neutral-300 leading-relaxed font-medium text-sm">
                                    {hotel.description}
                                </p>
                            </div>
                        </div>

                        {/* Booking History Table */}
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0e0e0e]">
                                <div className="flex items-center gap-3">
                                    <History className="w-5 h-5 text-white" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Booking History</h3>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{hotel.booking?.length || 0} Total Bookings</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Customer</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Room Type</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Dates</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]">
                                        {hotel.booking?.map((booking: any) => (
                                            <tr key={booking.id} className="hover:bg-[#121212] transition-none">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{booking.user?.name || "Guest"}</p>
                                                            <p className="text-[10px] text-neutral-400 font-medium">{booking.user?.email || booking.guestEmail}</p>
                                                        </div>
                                                        <a
                                                            href={`https://wa.me/${booking.guestPhone?.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            className="p-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-lg hover:bg-emerald-900/60 transition-colors"
                                                            title="WhatsApp Guest"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-xs font-medium text-neutral-300">{booking.room?.name || "Standard Room"}</span>
                                                </td>
                                                <td className="px-8 py-4 text-xs font-medium text-neutral-400 italic">
                                                    {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-4 text-xs font-bold text-emerald-400 font-mono">
                                                    ₹{(booking.totalPrice || 0).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border",
                                                        booking.paymentStatus === 'paid' ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" : "bg-amber-950/60 text-amber-400 border-amber-800/40"
                                                    )}>
                                                        {booking.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(hotel.booking?.length === 0 || !hotel.booking) && (
                                            <tr>
                                                <td colSpan={5} className="py-16 text-center">
                                                    <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-4" />
                                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No booking records found for this hotel</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar info */}
                    <div className="space-y-8">
                        {/* Partner/Owner Details */}
                        <section className="bg-[#0c0c0c] text-white p-8 border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-8 pb-4 border-b border-[#1f1f1f] flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-emerald-400" /> Property Ownership
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Primary Contact</p>
                                    <p className="text-xl font-bold text-white">{hotel.user?.name || "Partner"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Identity Verified</p>
                                    <p className="text-sm font-medium text-neutral-300 break-all">{hotel.user?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Partner Since</p>
                                    <p className="text-sm font-medium text-neutral-300">{hotel.user?.createdAt ? new Date(hotel.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Hotel Joining Date</p>
                                    <p className="text-sm font-medium text-neutral-300">{hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#1f1f1f] space-y-3">
                                {hotel.user?.id && (
                                    <button
                                        onClick={handleImpersonate}
                                        className="w-full py-4 bg-neutral-100 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                    >
                                        <UserCheck className="w-4 h-4" /> Login as Partner
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Rooms Overview */}
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-8 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Bed className="w-4 h-4 text-emerald-400" /> Rooms
                            </h3>
                            <div className="space-y-4">
                                {hotel.room?.map((room: any) => {
                                    const today = new Date();
                                    const isOccupied = hotel.booking?.some((b: any) =>
                                        b.roomId === room.id &&
                                        new Date(b.checkIn) <= today &&
                                        new Date(b.checkOut) >= today
                                    );

                                    return (
                                        <div key={room.id} className="p-4 bg-[#141414] border border-[#262626] rounded-xl hover:border-neutral-500 cursor-pointer transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold text-white uppercase">{room.name}</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border",
                                                    isOccupied ? "bg-amber-950/60 text-amber-400 border-amber-800/40" : "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                                                )}>
                                                    {isOccupied ? 'Occupied' : 'Available'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 font-medium italic">₹{room.pricePerNight} — {room.bedConfiguration}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-8 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-400" /> Financial Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Net Revenue</span>
                                    <span className="text-sm font-bold text-white font-mono">₹{displayRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Platform Earnings (12%)</span>
                                    <span className="text-sm font-bold text-emerald-400 font-mono">₹{(displayRevenue * 0.12).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Partner Collection (88%)</span>
                                    <span className="text-sm font-bold text-white font-mono">₹{(displayRevenue * 0.88).toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-[#1f1f1f] flex justify-between items-center">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">Est. Hotel Revenue</span>
                                    <span className="text-lg font-black text-emerald-400 font-mono">₹{(displayRevenue * 0.88).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Admin Danger Zone */}
                        <div className="bg-[#0c0c0c] border border-red-950/60 p-8 rounded-2xl shadow-sm">
                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-6">Danger Zone</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleSuspend}
                                    disabled={updating}
                                    className="w-full py-4 bg-[#141414] text-neutral-200 border border-[#282828] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1f1f1f] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {hotel.isActive !== false ? <><XCircle className="w-4 h-4 text-red-400" /> <span className="text-red-400">Hide Hotel from Search</span></> : <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span className="text-emerald-400">Show Hotel to Search</span></>}
                                </button>
                                <button 
                                    onClick={() => setDeleteStep(1)}
                                    className="w-full py-4 bg-red-950/80 border border-red-800/40 text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-900/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <TrendingUp className="w-4 h-4" /> Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modals */}
            {deleteStep > 0 && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0c] border border-[#262626] max-w-md w-full rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center rounded-full mx-auto mb-6">
                            <XCircle className="w-10 h-10" />
                        </div>
                        
                        {deleteStep === 1 && (
                            <>
                                <h2 className="text-2xl font-black text-white mb-4">Warning: Irreversible Action</h2>
                                <p className="text-neutral-400 mb-8 font-medium">Are you sure you want to delete <strong className="text-white">{hotel.name}</strong>? This action is completely irreversible and cannot be undone.</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-4 bg-[#181818] border border-[#2a2a2a] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#222222] transition-all">Cancel</button>
                                    <button onClick={() => setDeleteStep(2)} className="flex-1 py-4 bg-red-950/80 border border-red-800/40 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-900/80 transition-all">Yes, Proceed</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 2 && (
                            <>
                                <h2 className="text-2xl font-black text-white mb-4">Are you absolutely sure?</h2>
                                <p className="text-neutral-400 mb-8 font-medium">Please confirm again. All rooms, daily rates, active bookings, coupons, and earnings data will be wiped out completely!</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-4 bg-[#181818] border border-[#2a2a2a] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#222222] transition-all">Go Back</button>
                                    <button onClick={() => setDeleteStep(3)} className="flex-1 py-4 bg-red-950/80 border border-red-800/40 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-900/80 transition-all">I Understand, Continue</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 3 && (
                            <>
                                <h2 className="text-2xl font-black text-white mb-4">Final Confirmation</h2>
                                <p className="text-neutral-400 mb-6 font-medium">To finalize deletion, please type <strong className="text-white select-all">{hotel.name}</strong> below.</p>
                                <input 
                                    type="text"
                                    value={confirmHotelName}
                                    onChange={(e) => setConfirmHotelName(e.target.value)}
                                    placeholder="Type hotel name here..."
                                    className="w-full px-4 py-4 bg-[#141414] border border-[#282828] rounded-xl text-center font-bold text-white focus:border-red-500 outline-none mb-8 transition-all"
                                />
                                <div className="flex gap-4">
                                    <button onClick={() => { setDeleteStep(0); setConfirmHotelName(""); }} className="flex-1 py-4 bg-[#181818] border border-[#2a2a2a] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#222222] transition-all">Cancel</button>
                                    <button 
                                        onClick={handleDelete} 
                                        disabled={confirmHotelName !== hotel.name || updating}
                                        className="flex-1 py-4 bg-red-950/80 border border-red-800/40 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-900/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Hotel"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
