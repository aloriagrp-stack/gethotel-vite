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
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white">
                <h1 className="text-xl font-semibold text-white mb-3">Hotel Not Found</h1>
                <button onClick={handleBack} className="text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back to Hotels
                </button>
            </div>
        );
    }

    return (
        <div className="text-neutral-100 min-h-screen font-sans space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
                <button onClick={handleBack} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-medium transition-colors cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-emerald-400" /> Back to Properties
                </button>
                <div className="flex gap-2 text-xs">
                    <span className={cn(
                        "px-3 py-1 rounded-md font-medium border",
                        hotel.isFeatured ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700/50'
                    )}>
                        {hotel.isFeatured ? 'Featured' : 'Standard'}
                    </span>
                    <span className={cn(
                        "px-3 py-1 rounded-md font-medium border",
                        hotel.isActive !== false ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        {hotel.isActive !== false ? 'Live on Site' : 'Hidden'}
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-xl space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mb-1.5">
                                    <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                                    {hotel.starRating} Star Property
                                </div>
                                <h1 className="text-2xl font-semibold text-white tracking-tight">{hotel.name}</h1>
                                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
                                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                                    {hotel.city} — {hotel.address}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-neutral-500 mb-0.5">Total GMV</p>
                                <p className="text-2xl font-semibold text-white">₹{displayRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-neutral-800/60 text-xs">
                            <div>
                                <p className="text-neutral-500 mb-1">Price/Night</p>
                                <p className="text-lg font-semibold text-white font-mono">₹{hotel.pricePerNight}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 mb-1">Trust Score</p>
                                <p className="text-lg font-semibold text-emerald-400">{hotel.qualityScore || 85}%</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 mb-1">Response</p>
                                <p className="text-lg font-semibold text-purple-400">{hotel.responseSpeed || "Fast"}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 mb-1">Guest Rating</p>
                                <p className="text-lg font-semibold text-amber-400">{hotel.guestRating || 0}</p>
                            </div>
                        </div>

                        {/* Trust & Performance Metrics */}
                        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
                            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                Trust & Quality Score
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs text-neutral-400">Badges</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Trusted Partner', 'Top Selling', 'Best Value', 'Fast Response'].map(badge => (
                                            <button
                                                key={badge}
                                                type="button"
                                                onClick={() => toggleBadge(badge)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border",
                                                    badges.includes(badge)
                                                        ? "bg-neutral-800 text-white border-neutral-600"
                                                        : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                                                )}
                                            >
                                                {badge}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-neutral-400">Score</span>
                                        <span className="text-emerald-400 font-semibold">{qualityScore}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="w-full accent-emerald-400 cursor-pointer"
                                        value={qualityScore}
                                        onChange={(e) => setQualityScore(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-neutral-400">Cancellation</span>
                                        <span className="text-red-400 font-semibold">{hotel.cancellationRate || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${hotel.cancellationRate || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={handleAutoRecalculate}
                                    disabled={updating}
                                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
                                    Recalculate
                                </button>
                                <button
                                    onClick={handleUpdateMetrics}
                                    disabled={updating}
                                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                >
                                    Save Metrics
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-neutral-400" /> Description
                            </h3>
                            <p className="text-neutral-300 text-xs leading-relaxed">
                                {hotel.description}
                            </p>
                        </div>
                    </div>

                    {/* Booking History Table */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-neutral-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-neutral-400" />
                                <h3 className="text-xs font-semibold text-neutral-300">Recent Bookings</h3>
                            </div>
                            <span className="text-xs text-neutral-500">{hotel.booking?.length || 0} Total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-900/60 border-b border-neutral-800/80 text-xs font-medium text-neutral-400">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Customer</th>
                                        <th className="px-5 py-3 font-medium">Room Type</th>
                                        <th className="px-5 py-3 font-medium">Dates</th>
                                        <th className="px-5 py-3 font-medium">Amount</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/60 text-xs">
                                    {hotel.booking?.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium text-white">{booking.user?.name || "Guest"}</p>
                                                        <p className="text-[11px] text-neutral-500">{booking.user?.email || booking.guestEmail}</p>
                                                    </div>
                                                    <a
                                                        href={`https://wa.me/${booking.guestPhone?.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 rounded-md transition-colors"
                                                        title="WhatsApp Guest"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-300">
                                                {booking.room?.name || "Standard Room"}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-400">
                                                {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-emerald-400">
                                                ₹{(booking.totalPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-medium border",
                                                    booking.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                )}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(hotel.booking?.length === 0 || !hotel.booking) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-xs text-neutral-500">
                                                No booking records found for this hotel
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-5">
                    {/* Partner/Owner Details */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800/60 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Property Ownership
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div>
                                <p className="text-neutral-500 mb-0.5">Primary Contact</p>
                                <p className="font-medium text-white text-sm">{hotel.user?.name || "Partner"}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 mb-0.5">Email</p>
                                <p className="text-neutral-300 break-all">{hotel.user?.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 mb-0.5">Partner Since</p>
                                <p className="text-neutral-400">{hotel.user?.createdAt ? new Date(hotel.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</p>
                            </div>
                        </div>

                        {hotel.user?.id && (
                            <div className="pt-3 border-t border-neutral-800/60">
                                <button
                                    onClick={handleImpersonate}
                                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs border border-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <UserCheck className="w-3.5 h-3.5" /> Login as Partner
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Rooms Overview */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800/60 flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-emerald-400" /> Rooms ({hotel.room?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {hotel.room?.map((room: any) => {
                                const today = new Date();
                                const isOccupied = hotel.booking?.some((b: any) =>
                                    b.roomId === room.id &&
                                    new Date(b.checkIn) <= today &&
                                    new Date(b.checkOut) >= today
                                );

                                return (
                                    <div key={room.id} className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-white">{room.name}</p>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                                isOccupied ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {isOccupied ? 'Occupied' : 'Available'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500">₹{room.pricePerNight} — {room.bedConfiguration}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800/60 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Financials
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-neutral-800/40">
                                <span className="text-neutral-400">Net Revenue</span>
                                <span className="font-medium text-white">₹{displayRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-neutral-800/40">
                                <span className="text-neutral-400">Platform (12%)</span>
                                <span className="font-medium text-emerald-400">₹{(displayRevenue * 0.12).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-neutral-400">Partner (88%)</span>
                                <span className="font-medium text-white">₹{(displayRevenue * 0.88).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider pb-2 border-b border-neutral-800/60">
                            Property Controls
                        </h3>
                        <div className="space-y-2">
                            <button 
                                onClick={handleSuspend}
                                disabled={updating}
                                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {hotel.isActive !== false ? <><XCircle className="w-3.5 h-3.5 text-red-400" /> Hide from Search</> : <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Show in Search</>}
                            </button>
                            <button 
                                onClick={() => setDeleteStep(1)}
                                className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                                Delete Property Permanently
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modals */}
            {deleteStep > 0 && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center rounded-full mx-auto mb-4">
                            <XCircle className="w-6 h-6" />
                        </div>
                        
                        {deleteStep === 1 && (
                            <>
                                <h2 className="text-lg font-semibold text-white mb-2">Delete Property?</h2>
                                <p className="text-neutral-400 text-xs mb-6">Are you sure you want to delete <strong className="text-white">{hotel.name}</strong>? This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-2 bg-neutral-800 text-white text-xs font-medium rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">Cancel</button>
                                    <button onClick={() => setDeleteStep(2)} className="flex-1 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors cursor-pointer">Proceed</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 2 && (
                            <>
                                <h2 className="text-lg font-semibold text-white mb-2">Confirm Data Deletion</h2>
                                <p className="text-neutral-400 text-xs mb-6">All rooms, rates, bookings, and coupons for this property will be permanently removed.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setDeleteStep(0)} className="flex-1 py-2 bg-neutral-800 text-white text-xs font-medium rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">Back</button>
                                    <button onClick={() => setDeleteStep(3)} className="flex-1 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors cursor-pointer">I Understand</button>
                                </div>
                            </>
                        )}

                        {deleteStep === 3 && (
                            <>
                                <h2 className="text-lg font-semibold text-white mb-2">Final Confirmation</h2>
                                <p className="text-neutral-400 text-xs mb-4">Type <strong className="text-white">{hotel.name}</strong> to confirm.</p>
                                <input 
                                    type="text"
                                    value={confirmHotelName}
                                    onChange={(e) => setConfirmHotelName(e.target.value)}
                                    placeholder="Type hotel name..."
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-center text-xs text-white focus:border-red-500 outline-none mb-6"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setDeleteStep(0); setConfirmHotelName(""); }} className="flex-1 py-2 bg-neutral-800 text-white text-xs font-medium rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">Cancel</button>
                                    <button 
                                        onClick={handleDelete} 
                                        disabled={confirmHotelName !== hotel.name || updating}
                                        className="flex-1 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
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
