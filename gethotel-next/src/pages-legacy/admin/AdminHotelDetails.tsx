'use client';

import { useState, useEffect } from "react";
import { useNavigate as useRouter, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    MapPin, Star,
    ArrowLeft, Loader2,
    Phone, Clock, Bed, Info,
    TrendingUp, History, UserCheck,
    CreditCard, CheckCircle2, XCircle
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
                }
            } else {
                if (newTab) newTab.close();
                alert(res.message || "Failed to impersonate partner");
            }
        } catch (err: any) {
            if (newTab) newTab.close();
            alert(err.message || "Something went wrong while impersonating");
        }
    };

    const handleUpdateMetrics = async () => {
        setUpdating(true);
        try {
            const res = await adminApi.updateHotelMetrics(id!, {
                qualityScore,
                badges: badges.join(',')
            });
            if (res.success) {
                setHotel({
                    ...hotel,
                    qualityScore,
                    badges: badges.join(',')
                });
                alert("Property trust score updated!");
            }
        } catch (err) {
            alert("Failed to update trust metrics");
        } finally {
            setUpdating(false);
        }
    };

    const handleAutoRecalculate = async () => {
        setUpdating(true);
        try {
            const res = await adminApi.recalculateHotelMetrics(id!);
            if (res.success) {
                setQualityScore(res.data.qualityScore);
                setBadges(res.data.badges ? res.data.badges.split(',') : []);
                setHotel({
                    ...hotel,
                    qualityScore: res.data.qualityScore,
                    badges: res.data.badges
                });
                alert("Score recalculated!");
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
            <div className="min-h-[400px] flex items-center justify-center bg-transparent">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center p-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Info className="w-6 h-6 text-slate-400" />
                </div>
                <h1 className="text-lg font-bold text-slate-900 mb-1">Property Not Found</h1>
                <p className="text-xs text-slate-500 mb-4 max-w-sm">The selected hotel could not be loaded or may have been removed.</p>
                <button onClick={handleBack} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Properties
                </button>
            </div>
        );
    }

    return (
        <div className="text-slate-900 min-h-screen font-sans space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <button onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer group">
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" /> Back to Properties
                </button>
                <div className="flex gap-2 text-xs">
                    <span className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold border shadow-2xs",
                        hotel.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                        {hotel.isFeatured ? 'Featured' : 'Standard'}
                    </span>
                    <span className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold border shadow-2xs flex items-center gap-1.5",
                        hotel.isActive !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", hotel.isActive !== false ? "bg-emerald-500" : "bg-rose-500")} />
                        {hotel.isActive !== false ? 'Live on Site' : 'Hidden from Site'}
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Property Overview Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200/70 text-amber-700 rounded-md text-xs font-semibold mb-2">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    {hotel.starRating} Star Property
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{hotel.name}</h1>
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{hotel.city} — {hotel.address}</span>
                                </div>
                            </div>
                            <div className="sm:text-right p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl min-w-[140px]">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total GMV</p>
                                <p className="text-2xl font-bold text-slate-900">₹{displayRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs">
                            <div className="p-2">
                                <p className="text-slate-500 font-medium mb-1 text-[11px] uppercase tracking-wider">Price/Night</p>
                                <p className="text-lg font-bold text-slate-900 font-mono">₹{hotel.pricePerNight}</p>
                            </div>
                            <div className="p-2 border-l border-slate-200/70">
                                <p className="text-slate-500 font-medium mb-1 text-[11px] uppercase tracking-wider">Trust Score</p>
                                <p className="text-lg font-bold text-emerald-600">{hotel.qualityScore || 85}%</p>
                            </div>
                            <div className="p-2 border-l border-slate-200/70">
                                <p className="text-slate-500 font-medium mb-1 text-[11px] uppercase tracking-wider">Response</p>
                                <p className="text-lg font-bold text-blue-600">{hotel.responseSpeed || "Fast"}</p>
                            </div>
                            <div className="p-2 border-l border-slate-200/70">
                                <p className="text-slate-500 font-medium mb-1 text-[11px] uppercase tracking-wider">Guest Rating</p>
                                <p className="text-lg font-bold text-amber-600 flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-500 inline" />
                                    {hotel.guestRating || 0}
                                </p>
                            </div>
                        </div>

                        {/* Trust & Quality Score Editor */}
                        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    Trust & Quality Score Engine
                                </h3>
                                <span className="text-[11px] font-semibold text-slate-500">Live Calibration</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-700">Display Badges</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Trusted Partner', 'Top Selling', 'Best Value', 'Fast Response'].map(badge => (
                                            <button
                                                key={badge}
                                                type="button"
                                                onClick={() => toggleBadge(badge)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border shadow-2xs",
                                                    badges.includes(badge)
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                                                )}
                                            >
                                                {badge}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600 font-medium">Quality Score</span>
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{qualityScore}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                                        value={qualityScore}
                                        onChange={(e) => setQualityScore(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600 font-medium">Cancellation Rate</span>
                                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{hotel.cancellationRate || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hotel.cancellationRate || 0}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                                <button
                                    onClick={handleAutoRecalculate}
                                    disabled={updating}
                                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                    {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                                    Recalculate via AI
                                </button>
                                <button
                                    onClick={handleUpdateMetrics}
                                    disabled={updating}
                                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                                >
                                    Save Metrics
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-slate-500" /> Property Overview
                            </h3>
                            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                                {hotel.description || "No description provided for this property."}
                            </p>
                        </div>
                    </div>

                    {/* Booking History Table */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Bookings</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                                {hotel.booking?.length || 0} Total Bookings
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Room Type</th>
                                        <th className="px-5 py-3">Stay Dates</th>
                                        <th className="px-5 py-3">Tariff</th>
                                        <th className="px-5 py-3">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {hotel.booking?.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{booking.user?.name || "Guest"}</p>
                                                        <p className="text-[11px] text-slate-500">{booking.user?.email || booking.guestEmail}</p>
                                                    </div>
                                                    {booking.guestPhone && (
                                                        <a
                                                            href={`https://wa.me/${booking.guestPhone?.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors shadow-2xs"
                                                            title="WhatsApp Guest"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                {booking.room?.name || "Standard Room"}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">
                                                {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                                                ₹{(booking.totalPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs",
                                                    booking.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                                )}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(hotel.booking?.length === 0 || !hotel.booking) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                                                No booking records found for this property
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-6">
                    {/* Partner/Owner Details */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-blue-600" /> Property Ownership
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-0.5">Primary Contact</p>
                                <p className="font-bold text-slate-900 text-sm">{hotel.user?.name || "Partner"}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-0.5">Contact Email</p>
                                <p className="text-slate-700 font-medium break-all">{hotel.user?.email || "N/A"}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-0.5">Partner Onboarding</p>
                                <p className="text-slate-700 font-medium">{hotel.user?.createdAt ? new Date(hotel.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</p>
                            </div>
                        </div>

                        {hotel.user?.id && (
                            <div className="pt-2 border-t border-slate-200">
                                <button
                                    onClick={handleImpersonate}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <UserCheck className="w-3.5 h-3.5" /> Login as Partner
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Rooms Overview */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Bed className="w-4 h-4 text-emerald-600" /> Active Inventory
                            </h3>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {hotel.room?.length || 0} Rooms
                            </span>
                        </div>
                        <div className="space-y-2">
                            {hotel.room?.map((room: any) => {
                                const today = new Date();
                                const isOccupied = hotel.booking?.some((b: any) =>
                                    b.roomId === room.id &&
                                    new Date(b.checkIn) <= today &&
                                    new Date(b.checkOut) >= today
                                );

                                return (
                                    <div key={room.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs space-y-1 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-slate-900">{room.name}</p>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-2xs",
                                                isOccupied ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            )}>
                                                {isOccupied ? 'Occupied' : 'Available'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium">₹{room.pricePerNight} / night — {room.bedConfiguration}</p>
                                    </div>
                                );
                            })}
                            {(!hotel.room || hotel.room.length === 0) && (
                                <p className="text-xs text-slate-400 py-3 text-center">No rooms registered</p>
                            )}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" /> Financial Distribution
                        </h3>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Gross Bookings (GMV)</span>
                                <span className="font-bold text-slate-900 font-mono">₹{displayRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Platform Fee (12%)</span>
                                <span className="font-bold text-emerald-600 font-mono">₹{(displayRevenue * 0.12).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-slate-600 font-medium">Partner Payout (88%)</span>
                                <span className="font-bold text-slate-900 font-mono">₹{(displayRevenue * 0.88).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone / Property Controls */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200">
                            Property Controls
                        </h3>
                        <div className="space-y-2">
                            <button 
                                onClick={handleSuspend}
                                disabled={updating}
                                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                            >
                                {hotel.isActive !== false ? <><XCircle className="w-3.5 h-3.5 text-amber-600" /> Hide from Live Search</> : <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Make Live on Search</>}
                            </button>
                            <button 
                                onClick={() => setDeleteStep(1)}
                                className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                                Delete Property Permanently
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modals */}
            {deleteStep > 0 && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-center shadow-2xl">
                        <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center rounded-full mx-auto mb-4">
                            <XCircle className="w-6 h-6" />
                        </div>
                        
                        {deleteStep === 1 && (
                            <>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Property?</h2>
                                <p className="text-slate-600 text-xs mb-6">Are you sure you want to delete <strong className="text-slate-900">{hotel.name}</strong>? This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                                    <button onClick={() => setDeleteStep(2)} className="flex-1 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer shadow-sm">Proceed</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 2 && (
                            <>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm Data Deletion</h2>
                                <p className="text-slate-600 text-xs mb-6">All rooms, rates, bookings, and coupons for this property will be permanently removed.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Back</button>
                                    <button onClick={() => setDeleteStep(3)} className="flex-1 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer shadow-sm">I Understand</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 3 && (
                            <>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Final Confirmation</h2>
                                <p className="text-slate-600 text-xs mb-4">Type <strong className="text-slate-900">{hotel.name}</strong> to confirm.</p>
                                <input 
                                    type="text"
                                    value={confirmHotelName}
                                    onChange={(e) => setConfirmHotelName(e.target.value)}
                                    placeholder="Type hotel name..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-center text-xs text-slate-900 focus:border-rose-500 outline-none mb-6"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setDeleteStep(0); setConfirmHotelName(""); }} className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                                    <button 
                                        onClick={handleDelete} 
                                        disabled={confirmHotelName !== hotel.name || updating}
                                        className="flex-1 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Hotel"}
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
