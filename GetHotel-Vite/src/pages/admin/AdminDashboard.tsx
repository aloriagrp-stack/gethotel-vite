

import { useState, useEffect } from "react";
import { useNavigate as useRouter, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hotelApi, adminApi } from "@/lib/api";
import {
    LayoutDashboard, Hotel, Users,
    BarChart3, Settings, LogOut,
    Bell, Search, Plus, Filter,
    CheckCircle2, XCircle, Clock,
    CreditCard, TrendingUp, MoreVertical,
    ArrowUpRight, ArrowDownRight, Globe, ChevronRight, Loader2,
    Key, ShieldAlert, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/common/Image";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminDashboard() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get("tab") || "overview";
    const [activeTab, setActiveTab] = useState(tabParam);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const location = useLocation();

    const [hotels, setHotels] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Reset Password States
    const [resetModal, setResetModal] = useState<{ show: boolean, partner: any }>({ show: false, partner: null });
    const [requestDetailModal, setRequestDetailModal] = useState<{ show: boolean, request: any }>({ show: false, request: null });
    const [declineConfirmModal, setDeclineConfirmModal] = useState<{ show: boolean, requestId: number | null }>({ show: false, requestId: null });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkModal, setBulkModal] = useState<{ show: boolean, type: 'approve' | 'decline' | null }>({ show: false, type: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isReseting, setIsReseting] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path && path !== 'super') {
            setActiveTab(path);
        } else {
            setActiveTab(tabParam);
        }
    }, [location.pathname, tabParam]);

    // Fetch Data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Parallel fetching
            const [partnerRes, requestRes, hotelRes, bookingRes, statsRes] = await Promise.all([
                adminApi.getPartners(),
                adminApi.getPartnerRequests(),
                adminApi.getAllHotels(),
                adminApi.getAllBookings(),
                adminApi.getStats()
            ]);

            setPartners(partnerRes.data || []);
            setPartnerRequests(requestRes.data || []);
            setHotels(hotelRes.data || []);
            setBookings(bookingRes.data || []);

            if (statsRes.success) {
                setStatsData(statsRes.data);
            }
        } catch (err) {
            console.error("Super Admin fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (requestId: number) => {
        if (!confirm("Are you sure you want to approve this property? This will create the hotel and activate the partner account.")) return;

        setActionLoading(requestId);
        try {
            const res = await adminApi.approvePartnerRequest(requestId);
            if (res.success) {
                alert("Property approved successfully!");
                fetchAllData(); // Refresh all data
            }
        } catch (err: any) {
            alert(err.message || "Failed to approve request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeclineRequest = async (requestId: number) => {
        setDeclineConfirmModal({ show: true, requestId });
    };

    const confirmDeclineRequest = async () => {
        if (!declineConfirmModal.requestId) return;

        setActionLoading(declineConfirmModal.requestId);
        try {
            const res = await adminApi.declinePartnerRequest(declineConfirmModal.requestId);
            if (res.success) {
                alert("Property request declined.");
                setDeclineConfirmModal({ show: false, requestId: null });
                fetchAllData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to decline request");
        } finally {
            setActionLoading(null);
        }
    };

    // Bulk Action Handlers
    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const pendingIds = partnerRequests.filter(r => r.status === 'pending').map(r => r.id);
        if (selectedIds.length === pendingIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingIds);
        }
    };

    const handleBulkAction = async () => {
        if (!bulkModal.type || selectedIds.length === 0) return;

        setActionLoading(999999); // dummy for bulk
        try {
            const res = bulkModal.type === 'approve'
                ? await adminApi.bulkApprovePartnerRequests(selectedIds)
                : await adminApi.bulkDeclinePartnerRequests(selectedIds);

            if (res.success) {
                alert(`Bulk ${bulkModal.type} processed successfully.`);
                setSelectedIds([]);
                setBulkModal({ show: false, type: null });
                fetchAllData();
            }
        } catch (err: any) {
            alert(err.message || "Bulk action failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setIsReseting(true);
        try {
            const res = await adminApi.resetPartnerPassword(resetModal.partner.id, newPassword);
            if (res.success) {
                alert("Password reset successfully!");
                setResetModal({ show: false, partner: null });
                setNewPassword("");
            }
        } catch (err: any) {
            alert(err.message || "Failed to reset password");
        } finally {
            setIsReseting(false);
        }
    };
    
    // Robust Smart Search Algorithm
    const smartFilter = (items: any[], query: string, fields: string[]) => {
        if (!query) return items;
        const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
        
        return items.filter(item => {
            // Every keyword must match at least one of the specified fields (AND logic for precision)
            return keywords.every(keyword => {
                return fields.some(field => {
                    // Support nested fields (e.g., 'hotel.name')
                    let value = item;
                    const path = field.split('.');
                    for (const key of path) {
                        value = value?.[key];
                    }
                    
                    if (value === null || value === undefined) return false;
                    const stringValue = String(value).toLowerCase();
                    
                    // Strong matching: direct include or word-boundary start
                    return stringValue.includes(keyword);
                });
            });
        });
    };

    useEffect(() => {
        if (user?.role === 'super_admin') fetchAllData();
    }, [user]);

    const stats = [
        { label: "Platform Earnings (18%)", value: "₹" + Math.round((statsData?.totalRevenue || 0) * 0.18).toLocaleString(), trend: "+15.2%", isUp: true, icon: TrendingUp },
        { label: "Gross Volume (GMV)", value: "₹" + (statsData?.totalRevenue || 0).toLocaleString(), trend: "+12.5%", isUp: true, icon: CreditCard },
        { label: "Total Hotels", value: (statsData?.totalHotels || 0).toString(), trend: "+4", isUp: true, icon: Hotel },
        { label: "Total Bookings", value: (statsData?.totalBookings || 0).toString(), trend: "-2%", isUp: false, icon: BarChart3 },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                        {activeTab === 'overview' ? 'System Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">Monitoring platform statistics and property requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm w-64 focus:outline-none focus:border-slate-400 font-medium text-xs shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 relative shadow-sm">
                        <Bell className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            </header>

            {activeTab === "overview" && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                                            stat.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Conversion Intelligence & Destination Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-sm shadow-xl relative overflow-hidden group">
                            <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 pb-4 border-b border-white/5 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" /> Conversion Intelligence
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Search → Booking</p>
                                        <p className="text-2xl font-black italic">{statsData?.conversionRate || '0'}%</p>
                                        <p className="text-[9px] text-emerald-400 font-bold mt-1">Healthy</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Abandoned Checkout</p>
                                        <p className="text-2xl font-black italic">{statsData?.abandonedRate || '0'}%</p>
                                        <p className="text-[9px] text-red-400 font-bold mt-1">Stable</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Repeat Guest %</p>
                                        <p className="text-2xl font-black italic">{statsData?.repeatGuestRate || '0'}%</p>
                                        <p className="text-[9px] text-blue-400 font-bold mt-1">Growing</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg. Booking Value</p>
                                        <p className="text-2xl font-black italic">₹{(statsData?.avgBookingValue || 0).toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1">Per stay</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600" /> Top Destinations
                            </h3>
                            <div className="space-y-4">
                                {(statsData?.topDestinations || []).length > 0 ? (
                                    statsData.topDestinations.map((dest: any, idx: number) => {
                                        const colors = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-slate-900"];
                                        return (
                                            <div key={dest.city} className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span>{dest.city}</span>
                                                    <span className="text-slate-400">{dest.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", colors[idx % colors.length])} style={{ width: `${dest.percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No destination data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Approvals</h3>
                                <button
                                    onClick={() => router('/admin/super/requests')}
                                    className="text-[10px] font-bold text-brand-600 uppercase tracking-widest border border-brand-200 px-3 py-1 hover:bg-brand-50 transition-all"
                                >
                                    View All Requests
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {partnerRequests?.filter((r: any) => r.status === "pending").slice(0, 5).map((req: any) => (
                                    <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-none">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                                <Hotel className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-900 text-sm truncate w-48">{req.hotelName}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                disabled={actionLoading === req.id}
                                                className="px-4 py-1.5 bg-brand-600 text-white text-[10px] font-bold uppercase rounded-sm hover:bg-brand-700 disabled:opacity-50"
                                            >
                                                {actionLoading === req.id ? '...' : 'Approve'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!partnerRequests || partnerRequests.filter((r: any) => r.status === "pending").length === 0) && (
                                    <div className="py-20 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No pending approvals</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">System Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => router('/admin/super/requests')}
                                        className="w-full py-3 bg-brand-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-brand-700 transition-none flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" /> View Requests
                                    </button>
                                    <button className="w-full py-3 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-none flex items-center justify-center gap-2">
                                        <Globe className="w-3 h-3" /> Platform Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "requests" && (
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Property Requests</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Review and approve new hotel partners</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{selectedIds.length} Selected</span>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'approve' })}
                                        className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-50"
                                    >
                                        Bulk Approve
                                    </button>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'decline' })}
                                        className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-50"
                                    >
                                        Bulk Decline
                                    </button>
                                </div>
                            )}
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-full">
                                {partnerRequests.filter(r => r.status === 'pending').length} Pending
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded-sm border-slate-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
                                            checked={selectedIds.length === partnerRequests.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hotel Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {smartFilter(partnerRequests, searchQuery, ['hotelName', 'userName', 'userEmail', 'city', 'hotelUsername', 'address'])
                                    .map((req) => (
                                        <tr key={req.id} className={cn(
                                            "hover:bg-slate-50 transition-none",
                                            selectedIds.includes(req.id) ? "bg-slate-50/80" : ""
                                        )}>
                                            <td className="px-6 py-4">
                                                {req.status === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded-sm border-slate-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
                                                        checked={selectedIds.includes(req.id)}
                                                        onChange={() => toggleSelect(req.id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <Hotel className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{req.hotelName}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">@{req.hotelUsername}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">{req.userName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{req.userEmail}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{req.userPhone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                {req.city}, {req.address}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 text-[9px] font-black uppercase rounded-sm",
                                                    req.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setRequestDetailModal({ show: true, request: req })}
                                                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all rounded-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2"
                                                            >
                                                                {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeclineRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-100 disabled:opacity-50 flex items-center gap-2"
                                                            >
                                                                {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                                Decline
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {partnerRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No requests found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "users" && (
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Partner Management</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{partners.length} Total Partners</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Hotel</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {smartFilter(partners, searchQuery, ['name', 'email', 'id', 'hotel.0.name'])
                                    .map((partner) => (
                                    <tr key={partner.id} className="hover:bg-slate-50 transition-none">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{partner.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{partner.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {partner.hotel && partner.hotel.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <Hotel className="w-3 h-3 text-brand-600" />
                                                    <span className="text-[10px] font-bold text-slate-700">{partner.hotel[0].name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-300 italic">No Hotel Assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-medium text-slate-500">
                                            {new Date(partner.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setResetModal({ show: true, partner })}
                                                className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black flex items-center gap-2 ml-auto"
                                            >
                                                <Key className="w-3 h-3" /> Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "bookings" && (
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Global Booking History</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{bookings.length} Records Found</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {smartFilter(bookings, searchQuery, ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'hotel.name', 'status'])
                                    .map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-none">
                                        <td className="px-6 py-4 text-xs font-black text-slate-900">#BK-{booking.id}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{booking.guestFirstName} {booking.guestLastName}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">{booking.guestEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-900">{booking.hotel?.name || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[9px] font-black uppercase rounded-sm",
                                                booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-black text-slate-900">
                                            ₹{booking.totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No bookings found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "hotels" && (
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Property Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hotel Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {smartFilter(hotels, searchQuery, ['name', 'city', 'hotelUsername', 'address', 'id'])
                                    .map((hotel) => (
                                        <tr
                                            key={hotel.id}
                                            onClick={() => router(`/admin/super/hotels/${hotel.id}`)}
                                            className="hover:bg-slate-50 transition-none cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                        {hotel.thumbnail ? (
                                                            <Image src={hotel.thumbnail} alt={hotel.name} width={32} height={32} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <Hotel className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{hotel.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">{hotel.city}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-900">₹{hotel.pricePerNight}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-900 text-right">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            <AnimatePresence>
                {resetModal.show && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setResetModal({ show: false, partner: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-sm z-[210] shadow-2xl border border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <Key className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Force Password Reset</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resetModal.partner.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 border border-amber-100 flex gap-3">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                                        This will immediately invalidate the partner's current password. They will need to use the new password to login.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-brand-600 focus:bg-white outline-none rounded-sm text-sm font-bold transition-all"
                                        />
                                        <button
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isReseting}
                                        className="flex-1 py-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 shadow-xl shadow-brand-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isReseting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Confirm Reset
                                    </button>
                                    <button
                                        onClick={() => setResetModal({ show: false, partner: null })}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Partner Request Detail Modal */}
            <AnimatePresence>
                {requestDetailModal.show && requestDetailModal.request && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setRequestDetailModal({ show: false, request: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-sm z-[210] shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                                        <Hotel className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{requestDetailModal.request.hotelName}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Application Review</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRequestDetailModal({ show: false, request: null })}
                                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Property Information</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Username</p>
                                                    <p className="text-sm font-bold text-slate-900">@{requestDetailModal.request.hotelUsername}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                                    <p className="text-sm font-bold text-slate-900">{requestDetailModal.request.city}</p>
                                                    <p className="text-xs text-slate-500">{requestDetailModal.request.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Partner Contact</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                                                    <p className="text-sm font-bold text-slate-900">{requestDetailModal.request.userName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                                    <p className="text-sm font-bold text-slate-900">{requestDetailModal.request.userEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                                                    <p className="text-sm font-bold text-slate-900">{requestDetailModal.request.userPhone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Application Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-4 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest",
                                            requestDetailModal.request.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                requestDetailModal.request.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {requestDetailModal.request.status}
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic">Submitted on {new Date(requestDetailModal.request.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {requestDetailModal.request.status === 'pending' && (
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleApproveRequest(requestDetailModal.request.id);
                                            setRequestDetailModal({ show: false, request: null });
                                        }}
                                        className="flex-1 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve Listing
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDeclineRequest(requestDetailModal.request.id);
                                            setRequestDetailModal({ show: false, request: null });
                                        }}
                                        className="flex-1 py-4 bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject Application
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Decline Confirmation Modal */}
            <AnimatePresence>
                {declineConfirmModal.show && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300]"
                            onClick={() => setDeclineConfirmModal({ show: false, requestId: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-10 rounded-sm z-[310] shadow-2xl border border-slate-200 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Confirm Rejection</h3>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                                Are you sure you want to decline this property application? This action will permanently disable the partner's account.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={confirmDeclineRequest}
                                    disabled={actionLoading !== null}
                                    className="w-full py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Yes, Reject Application
                                </button>
                                <button
                                    onClick={() => setDeclineConfirmModal({ show: false, requestId: null })}
                                    className="w-full py-4 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bulk Confirmation Modal */}
            <AnimatePresence>
                {bulkModal.show && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[400]"
                            onClick={() => setBulkModal({ show: false, type: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-10 rounded-sm z-[410] shadow-2xl border border-slate-200 text-center"
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                bulkModal.type === 'approve' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                                {bulkModal.type === 'approve' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                                Confirm Bulk {bulkModal.type === 'approve' ? 'Approval' : 'Rejection'}
                            </h3>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                                Are you sure you want to {bulkModal.type} <b>{selectedIds.length} property applications</b> at once? This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleBulkAction}
                                    disabled={actionLoading !== null}
                                    className={cn(
                                        "w-full py-4 text-white text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2",
                                        bulkModal.type === 'approve' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    )}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (bulkModal.type === 'approve' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />)}
                                    Confirm Bulk {bulkModal.type}
                                </button>
                                <button
                                    onClick={() => setBulkModal({ show: false, type: null })}
                                    className="w-full py-4 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}



