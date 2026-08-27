

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
    ArrowUpRight, ArrowDownRight, Globe, ChevronRight, Loader2, ArrowRight,
    Key, ShieldAlert, Eye, EyeOff, Star, MessageSquare, Trash2, Sparkles,
    UserCheck, Mail, Phone, Calendar, LogIn, Shield, Copy, ExternalLink, RefreshCw, LayoutGrid, Percent, Bot, Palmtree
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/common/Image";
import { motion, AnimatePresence } from "framer-motion";
import AdminStats from "./AdminStats";
import AdminFinance from "./AdminFinance";
import AdminHomepageEditor from "./AdminHomepageEditor";
import AdminControlHub from "./AdminControlHub";
import AdminAddPartner from "./AdminAddPartner";
import AdminMultiRoomSetup from "./AdminMultiRoomSetup";
import AdminPromotions from "./AdminPromotions";
import AdminAICopilot from "./AdminAICopilot";
import AdminReviewImporter from "./AdminReviewImporter";
import AdminDestinationAnalytics from "./AdminDestinationAnalytics";
import AdminAIChats from "./AdminAIChats";
import AdminTourPackages from "./AdminTourPackages";
import AdminSettings from "./AdminSettings";
import AdminNotifications from "./AdminNotifications";
import AdminDisputes from "./AdminDisputes";

// ─── Safe Date Formatter ────────────────────────────────────────────────────
function formatDateSafe(rawDate: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
    if (!rawDate) return "—";
    try {
        const d = typeof rawDate === "string"
            ? new Date(rawDate.includes("T") ? rawDate : rawDate.replace(" ", "T"))
            : rawDate;
        if (isNaN(d.getTime())) return "Invalid date";
        return d.toLocaleDateString("en-IN", opts || { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return "Invalid date";
    }
}

function formatDateTimeSafe(rawDate: string | Date | null | undefined): string {
    if (!rawDate) return "—";
    try {
        const d = typeof rawDate === "string"
            ? new Date(rawDate.includes("T") ? rawDate : rawDate.replace(" ", "T"))
            : rawDate;
        if (isNaN(d.getTime())) return "Invalid date";
        return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "Invalid date";
    }
}

// ─── Login Provider Detection ────────────────────────────────────────────────
function detectLoginProvider(customer: any): "Google" | "OTP/Email" {
    // A user who signed in via Google will have a profileImage from google (lh3.googleusercontent.com)
    // or their password will be a long random bcrypt of a UUID-like value
    if (customer.profileImage && customer.profileImage.includes("googleusercontent")) return "Google";
    if (customer.provider === "google") return "Google";
    return "OTP/Email";
}

// ─── Star Rating Display ─────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={cn("w-3 h-3", s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")}
                />
            ))}
        </div>
    );
}

export default function SuperAdminDashboard() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    let initialTab = searchParams.get("tab") || "overview";
    if (location.pathname.includes('/admin/super/ai-chats')) {
        initialTab = "ai-chats";
    }
    if (location.pathname.includes('/admin/super/tour-packages')) {
        initialTab = "tour-packages";
    }
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [hotels, setHotels] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
    const [globalReviews, setGlobalReviews] = useState<any[]>([]);
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [loadedSections, setLoadedSections] = useState<Record<string, boolean>>({});

    // Users sub-tab
    const [usersSubTab, setUsersSubTab] = useState<"partners" | "customers">("partners");

    // Bookings sub-tab
    const [bookingsSubTab, setBookingsSubTab] = useState<"fullDay" | "hourly">("fullDay");

    // Reset Password States
    const [resetModal, setResetModal] = useState<{ show: boolean, partner: any }>({ show: false, partner: null });
    const [editEmailModal, setEditEmailModal] = useState<{ show: boolean, partner: any }>({ show: false, partner: null });
    const [newPartnerEmail, setNewPartnerEmail] = useState("");
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [requestDetailModal, setRequestDetailModal] = useState<{ show: boolean, request: any }>({ show: false, request: null });
    const [declineConfirmModal, setDeclineConfirmModal] = useState<{ show: boolean, requestId: number | null }>({ show: false, requestId: null });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkModal, setBulkModal] = useState<{ show: boolean, type: 'approve' | 'decline' | null }>({ show: false, type: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isReseting, setIsReseting] = useState(false);
    const [showPass, setShowPass] = useState(false);


    // Customer Detail Modal
    const [customerModal, setCustomerModal] = useState<{ show: boolean, customer: any }>({ show: false, customer: null });
    const [showPasswordHash, setShowPasswordHash] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    // Review Detail Modal
    const [reviewModal, setReviewModal] = useState<{ show: boolean, review: any }>({ show: false, review: null });
    const [reviewSearchQuery, setReviewSearchQuery] = useState("");
    const [reviewsSubTab, setReviewsSubTab] = useState<"list" | "import">("list");

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        const tabFromUrl = searchParams.get("tab");
        if (path && path !== 'super') {
            setActiveTab(path);
        } else if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        } else {
            setActiveTab("overview");
        }
    }, [location.pathname, searchParams]);

    const isTabLoaded = (tab = activeTab) => {
        const normalizedTab = tab === "partners" ? "users" : tab;
        if (normalizedTab === "overview") return !!(loadedSections.stats && loadedSections.requests);
        if (normalizedTab === "requests") return !!loadedSections.requests;
        if (normalizedTab === "users") return !!(loadedSections.partners && loadedSections.customers);
        if (normalizedTab === "hotels") return !!loadedSections.hotels;
        if (normalizedTab === "controlhub") return !!loadedSections.hotels;
        if (normalizedTab === "multi-room") return !!loadedSections.hotels;
        if (normalizedTab === "promotions") return !!loadedSections.hotels;
        if (normalizedTab === "addPartner") return !!(loadedSections.hotels && loadedSections.partners);
        if (normalizedTab === "bookings") return !!loadedSections.bookings;
        if (normalizedTab === "reviews") return !!loadedSections.reviews;
        return true;
    };

    const fetchDashboardData = async (tab = activeTab, force = false) => {
        try {
            const normalizedTab = tab === "partners" ? "users" : tab;
            
            if (["stats", "finance", "homepage"].includes(normalizedTab)) {
                setLoading(false);
                return;
            }

            const shouldLoad = (key: string) => force || !loadedSections[key];

            const needsStats = (normalizedTab === "overview") && shouldLoad("stats");
            const needsRequests = ["overview", "requests"].includes(normalizedTab) && shouldLoad("requests");
            const needsPartners = ["users", "addPartner"].includes(normalizedTab) && shouldLoad("partners");
            const needsHotels = ["hotels", "controlhub", "addPartner", "multi-room", "ai-copilot", "reviews", "promotions"].includes(normalizedTab) && shouldLoad("hotels");
            const needsBookings = normalizedTab === "bookings" && shouldLoad("bookings");
            const needsReviews = normalizedTab === "reviews" && shouldLoad("reviews");

            const hasAnyRequest = needsStats || needsRequests || needsPartners || needsHotels || needsBookings || needsReviews;

            if (!hasAnyRequest) {
                setLoading(false);
                return;
            }

            // Pre-fetch data silently without showing full-screen flicker loader once initial load is done
            if (Object.keys(loadedSections).length === 0) {
                setLoading(true);
            }

            const requests: Promise<void>[] = [];

            if (needsStats) {
                requests.push(adminApi.getStats().then((statsRes) => {
                    if (statsRes.success) setStatsData(statsRes.data);
                    setLoadedSections(prev => ({ ...prev, stats: true }));
                }));
            }

            if (needsRequests) {
                requests.push(adminApi.getPartnerRequests().then((requestRes) => {
                    setPartnerRequests(requestRes.data || []);
                    setLoadedSections(prev => ({ ...prev, requests: true }));
                }));
            }

            if (needsPartners) {
                requests.push(adminApi.getPartners().then((partnerRes) => {
                    setPartners(partnerRes.data || []);
                    setLoadedSections(prev => ({ ...prev, partners: true }));
                }));
                requests.push(adminApi.getUsers().then((userRes) => {
                    setCustomers((userRes.data || []).filter((u: any) => u.role === 'user'));
                    setLoadedSections(prev => ({ ...prev, customers: true }));
                }));
            }

            if (needsHotels) {
                requests.push(adminApi.getAllHotels().then((hotelRes) => {
                    setHotels(hotelRes.data || []);
                    setLoadedSections(prev => ({ ...prev, hotels: true }));
                }));
            }

            if (needsBookings) {
                requests.push(adminApi.getAllBookings().then((bookingRes) => {
                    setBookings(bookingRes.data || []);
                    setLoadedSections(prev => ({ ...prev, bookings: true }));
                }));
            }

            if (needsReviews) {
                requests.push(adminApi.getGlobalReviews().then((reviewRes) => {
                    setGlobalReviews(reviewRes.data || []);
                    setLoadedSections(prev => ({ ...prev, reviews: true }));
                }));
            }

            await Promise.all(requests);
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
                fetchDashboardData("requests", true);
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
                fetchDashboardData("requests", true);
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
                fetchDashboardData("requests", true);
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

    const handleUpdatePartnerEmail = async () => {
        if (!newPartnerEmail || !newPartnerEmail.includes("@")) {
            alert("Please provide a valid email address.");
            return;
        }

        const trimmedEmail = newPartnerEmail.trim().toLowerCase();
        if (editEmailModal.partner && editEmailModal.partner.email?.toLowerCase() === trimmedEmail) {
            alert("The new email is the same as the current email.");
            return;
        }

        setIsUpdatingEmail(true);
        try {
            const res = await adminApi.updatePartnerEmail(editEmailModal.partner.id, trimmedEmail);
            if (res.success) {
                alert(res.message || "Partner email updated successfully!");
                // Update local partners state immediately
                setPartners(prev => prev.map(p => p.id === editEmailModal.partner.id ? { ...p, email: trimmedEmail } : p));
                setEditEmailModal({ show: false, partner: null });
                setNewPartnerEmail("");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update partner email.");
        } finally {
            setIsUpdatingEmail(false);
        }
    };



    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("Are you sure you want to permanently delete this review? This cannot be undone.")) return;
        setActionLoading(reviewId);
        try {
            const res = await adminApi.deleteReview(reviewId);
            if (res.success) {
                setGlobalReviews(prev => prev.filter(r => r.id !== reviewId));
                setReviewModal({ show: false, review: null });
                alert("Review deleted successfully.");
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete review");
        } finally {
            setActionLoading(null);
        }
    };

    // Impersonate Customer: sets a session token and redirects
    const handleImpersonateCustomer = (customer: any) => {
        const confirmed = confirm(`You are about to impersonate ${customer.name} (${customer.email}). A session token will be set. Continue?`);
        if (!confirmed) return;
        // Store the impersonation session so the app uses it
        sessionStorage.setItem('impersonating', JSON.stringify({ id: customer.id, email: customer.email, name: customer.name }));
        alert(`Impersonation session started for ${customer.name}. Navigate to the main site to see their view.`);
    };

    // Robust Smart Search Algorithm
    const smartFilter = (items: any[], query: string, fields: string[]) => {
        if (!query) return items;
        const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);

        return items.filter(item => {
            return keywords.every(keyword => {
                return fields.some(field => {
                    let value = item;
                    const path = field.split('.');
                    for (const key of path) {
                        value = value?.[key];
                    }
                    if (value === null || value === undefined) return false;
                    const stringValue = String(value).toLowerCase();
                    return stringValue.includes(keyword);
                });
            });
        });
    };

    useEffect(() => {
        if (user?.role === 'super_admin') fetchDashboardData(activeTab);
    }, [user, activeTab]);

    const TABS = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "tour-packages", label: "Tour Packages Manager", icon: Palmtree },
        { id: "users", label: "Users", icon: Users },
        { id: "hotels", label: "Properties", icon: Hotel },
        { id: "promotions", label: "Promotions & Coupons", icon: Percent },
        { id: "bookings", label: "Bookings", icon: CreditCard },
        { id: "reviews", label: "Reviews", icon: MessageSquare },
        { id: "requests", label: "Requests", icon: Clock },
        { id: "stats", label: "Analytics", icon: BarChart3 },
        { id: "finance", label: "Finance", icon: TrendingUp },
        { id: "homepage", label: "Homepage Editor", icon: Settings },
        { id: "multi-room", label: "Multi Room Setup", icon: LayoutGrid },
        { id: "ai-copilot", label: "AI Room Onboarding", icon: Sparkles },
    ];

    const stats = [
        { label: "Platform Earnings (18%)", value: "₹" + Math.round((statsData?.totalRevenue || 0) * 0.18).toLocaleString(), trend: "+15.2%", isUp: true, icon: TrendingUp },
        { label: "Gross Volume (GMV)", value: "₹" + (statsData?.totalRevenue || 0).toLocaleString(), trend: "+12.5%", isUp: true, icon: CreditCard },
        { label: "Total Hotels", value: (statsData?.totalHotels || 0).toString(), trend: "+4", isUp: true, icon: Hotel },
        { label: "Total Bookings", value: (statsData?.totalBookings || 0).toString(), trend: "-2%", isUp: false, icon: BarChart3 },
    ];

    const isInitialLoading = loading && Object.keys(loadedSections).length === 0;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className={cn(activeTab === "ai-copilot" ? "p-0 h-screen overflow-hidden flex flex-col" : "p-8", "min-w-0")}>
            {activeTab !== "ai-copilot" && activeTab !== "destination-analytics" && activeTab !== "destinations" && (
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#1f1f1f] pb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 font-sans">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                            {activeTab === 'overview' ? 'System Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                        <p className="text-neutral-500 text-xs font-semibold mt-1">Monitoring platform statistics and property requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-[#111111] border border-[#262626] rounded-xl w-64 focus:outline-none focus:border-neutral-500 font-medium text-xs text-white placeholder:text-neutral-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                            />
                        </div>
                        <button className="p-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl relative shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.6)] transition-all cursor-pointer">
                            <Bell className="w-4 h-4 text-neutral-300" />
                        </button>
                    </div>
                </header>
            )}

            {loading && !isTabLoaded() ? (
                <div className="min-h-[400px] flex items-center justify-center bg-transparent">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                </div>
            ) : (
                <>
                    {activeTab === "stats" && <AdminStats />}
                    {activeTab === "finance" && <AdminFinance />}
                    {activeTab === "homepage" && <AdminHomepageEditor />}
                    {activeTab === "settings" && <AdminSettings />}
                    {activeTab === "notifications" && <AdminNotifications />}
                    {activeTab === "disputes" && <AdminDisputes />}
                    {activeTab === "promotions" && <AdminPromotions hotels={hotels} onRefresh={() => fetchDashboardData('hotels', true)} />}
                    {activeTab === "controlhub" && <AdminControlHub hotels={hotels} loading={loading} />}
                    {activeTab === "multi-room" && <AdminMultiRoomSetup hotels={hotels} />}
                    {activeTab === "addPartner" && <AdminAddPartner hotels={hotels} partners={partners} setPartners={setPartners} />}
                    {activeTab === "ai-copilot" && <AdminAICopilot hotels={hotels} loadingHotels={!loadedSections.hotels} />}
                    {activeTab === "tour-packages" && <AdminTourPackages />}
                    {(activeTab === "destination-analytics" || activeTab === "destinations") && <AdminDestinationAnalytics />}

                    {activeTab === "overview" && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-[#0c0c0c] p-6 border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] hover:border-neutral-700 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-[#161616] border border-[#282828] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                                            <Icon className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border shadow-sm",
                                            stat.isUp ? "bg-emerald-950/60 border-emerald-800/40 text-emerald-400" : "bg-red-950/60 border-red-800/40 text-red-400"
                                        )}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Conversion Intelligence & Destination Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-[#0c0c0c] text-white p-8 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] relative overflow-hidden group">
                            <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 pb-4 border-b border-[#1f1f1f] flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" /> Conversion Intelligence
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Search → Booking</p>
                                        <p className="text-2xl font-black">{statsData?.conversionRate || '0'}%</p>
                                        <p className="text-[9px] text-emerald-400 font-bold mt-1">Healthy</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Abandoned Checkout</p>
                                        <p className="text-2xl font-black">{statsData?.abandonedRate || '0'}%</p>
                                        <p className="text-[9px] text-red-400 font-bold mt-1">Stable</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Repeat Guest %</p>
                                        <p className="text-2xl font-black">{statsData?.repeatGuestRate || '0'}%</p>
                                        <p className="text-[9px] text-blue-400 font-bold mt-1">Growing</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Avg. Booking Value</p>
                                        <p className="text-2xl font-black">₹{(statsData?.avgBookingValue || 0).toLocaleString()}</p>
                                        <p className="text-[9px] text-neutral-500 font-bold mt-1">Per stay</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1f1f1f]">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-400" /> Top Destinations
                                </h3>
                                <button
                                    onClick={() => router('/admin/super/destination-analytics')}
                                    className="p-1.5 px-2.5 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-neutral-400 hover:text-white transition-all cursor-pointer shadow-sm group/btn flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                    title="View Detailed Destination & Geographic Analytics"
                                >
                                    <span>Analytics</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(statsData?.topDestinations || []).length > 0 ? (
                                    statsData.topDestinations.map((dest: any, idx: number) => {
                                        const colors = ["bg-white", "bg-emerald-500", "bg-amber-500", "bg-neutral-600"];
                                        return (
                                            <div key={dest.city} className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-neutral-200">{dest.city}</span>
                                                    <span className="text-neutral-500">{dest.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-[#161616] border border-[#222222] rounded-full overflow-hidden shadow-inner">
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
                        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Approvals</h3>
                                <button
                                    onClick={() => router('/admin/super/requests')}
                                    className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest border border-[#2e2e2e] bg-[#141414] px-3.5 py-1.5 rounded-lg hover:bg-[#1f1f1f] transition-all cursor-pointer shadow-sm"
                                >
                                    View All Requests
                                </button>
                            </div>
                            <div className="divide-y divide-[#181818]">
                                {partnerRequests?.filter((r: any) => r.status === "pending").slice(0, 5).map((req: any) => (
                                    <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#121212] transition-none">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border border-[#282828] bg-[#161616] rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                                <Hotel className="w-5 h-5 text-neutral-400" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-white text-sm truncate w-48">{req.hotelName}</h4>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">Requested on {formatDateSafe(req.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                disabled={actionLoading === req.id}
                                                className="px-4 py-2 bg-neutral-100 text-black font-bold text-[10px] uppercase rounded-xl hover:bg-white disabled:opacity-50 shadow-md cursor-pointer"
                                            >
                                                {actionLoading === req.id ? '...' : 'Approve'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!partnerRequests || partnerRequests.filter((r: any) => r.status === "pending").length === 0) && (
                                    <div className="py-16 text-center">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">No pending approvals</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 pb-2 border-b border-[#1f1f1f]">System Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router('/admin/super/requests')}
                                        className="w-full py-3 bg-neutral-100 hover:bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-black" /> View Requests
                                    </button>
                                    <button className="w-full py-3 bg-[#141414] border border-[#282828] text-neutral-300 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#1f1f1f] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                                        <Globe className="w-3.5 h-3.5 text-neutral-400" /> Platform Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "ai-chats" && <AdminAIChats />}
            {activeTab === "tour-packages" && <AdminTourPackages />}

            {activeTab === "requests" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0e0e0e]">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Property Requests</h3>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">Review and approve new hotel partners</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 pr-4 border-r border-[#222222]">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedIds.length} Selected</span>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'approve' })}
                                        className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 rounded-lg shadow-lg"
                                    >
                                        Bulk Approve
                                    </button>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'decline' })}
                                        className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-500 rounded-lg shadow-lg"
                                    >
                                        Bulk Decline
                                    </button>
                                </div>
                            )}
                            <span className="px-3 py-1 bg-amber-950/80 border border-amber-800/40 text-amber-400 text-[9px] font-bold uppercase rounded-full">
                                {partnerRequests.filter(r => r.status === 'pending').length} Pending
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-[#333333] bg-[#141414] text-white focus:ring-neutral-500 cursor-pointer"
                                            checked={selectedIds.length === partnerRequests.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Hotel Info</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Owner Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181818]">
                                {smartFilter(partnerRequests, searchQuery, ['hotelName', 'userName', 'userEmail', 'city', 'hotelUsername', 'address'])
                                    .map((req) => (
                                        <tr key={req.id} className={cn(
                                            "hover:bg-[#121212] transition-none",
                                            selectedIds.includes(req.id) ? "bg-[#181818]" : ""
                                        )}>
                                            <td className="px-6 py-4">
                                                {req.status === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[#333333] bg-[#141414] text-white focus:ring-neutral-500 cursor-pointer"
                                                        checked={selectedIds.includes(req.id)}
                                                        onChange={() => toggleSelect(req.id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#161616] flex items-center justify-center border border-[#282828] rounded-xl shrink-0">
                                                        <Hotel className="w-5 h-5 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{req.hotelName}</p>
                                                        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">@{req.hotelUsername}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-300">{req.userName}</p>
                                                    <p className="text-[10px] text-neutral-500 font-medium">{req.userEmail}</p>
                                                    <p className="text-[10px] text-neutral-500 font-medium">{req.userPhone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                                                {req.city}, {req.address}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border",
                                                    req.status === 'pending' ? "bg-amber-950/80 border-amber-800/40 text-amber-400" : "bg-emerald-950/80 border-emerald-800/40 text-emerald-400"
                                                )}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setRequestDetailModal({ show: true, request: req })}
                                                        className="p-2 bg-[#181818] text-neutral-300 hover:bg-[#222222] transition-all rounded-lg border border-[#2a2a2a]"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500 rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
                                                            >
                                                                {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeclineRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-4 py-2 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
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
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No requests found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Users Tab (Partners + Customers sub-tabs) ──────────────────────── */}
            {activeTab === "users" && (
                <div>
                    {/* Sub-tab switcher */}
                    <div className="flex gap-1.5 mb-6 bg-[#0c0c0c] border border-[#1f1f1f] p-1.5 rounded-xl w-fit shadow-inner">
                        <button
                            onClick={() => setUsersSubTab("partners")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                usersSubTab === "partners"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            Partners ({partners.length})
                        </button>
                        <button
                            onClick={() => setUsersSubTab("customers")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                usersSubTab === "customers"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            Customers ({customers.length})
                        </button>
                    </div>

                    {/* Partners Sub-Tab */}
                    {usersSubTab === "partners" && (
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Partner Management</h3>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{partners.length} Total Partners</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Partner Details</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Assigned Hotel</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Joined On</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]">
                                        {smartFilter(partners, searchQuery, ['name', 'email', 'id', 'hotel.0.name'])
                                            .map((partner) => (
                                            <tr key={partner.id} className="hover:bg-[#121212] transition-none">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-[#161616] overflow-hidden flex items-center justify-center border border-[#282828] shrink-0">
                                                            {partner.profileImage ? (
                                                                <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-4 h-4 text-neutral-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{partner.name}</p>
                                                            <p className="text-[10px] text-neutral-500 font-medium">{partner.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {partner.hotel && partner.hotel.length > 0 ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Hotel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                <span className="text-[10px] font-bold text-neutral-200 line-clamp-1">{partner.hotel[0].name}</span>
                                                            </div>
                                                            {partner.hotel.length > 1 && (
                                                                <span className="text-[9px] font-bold text-neutral-500 pl-5 uppercase tracking-wide">
                                                                    + {partner.hotel.length - 1} other properties
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-neutral-600 italic">No Hotel Assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-medium text-neutral-500">
                                                    {formatDateSafe(partner.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditEmailModal({ show: true, partner });
                                                                setNewPartnerEmail(partner.email || "");
                                                            }}
                                                            className="px-3 py-2 bg-[#181818] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#222222] hover:text-emerald-400 border border-[#2a2a2a] flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Partner Email (No OTP Required)"
                                                        >
                                                            <Mail className="w-3 h-3 text-emerald-400" /> Edit Email
                                                        </button>
                                                        <button
                                                            onClick={() => setResetModal({ show: true, partner })}
                                                            className="px-3 py-2 bg-[#181818] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#222222] border border-[#2a2a2a] flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Key className="w-3 h-3" /> Reset Password
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Customers Sub-Tab */}
                    {usersSubTab === "customers" && (
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Management</h3>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{customers.length} Registered Customers</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={customerSearchQuery}
                                        onChange={e => setCustomerSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-[#141414] border border-[#282828] rounded-xl w-56 focus:outline-none focus:border-neutral-500 font-medium text-xs text-white placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Login Provider</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Joined On</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]">
                                        {smartFilter(customers, customerSearchQuery || searchQuery, ['name', 'email', 'phone'])
                                            .map((customer) => {
                                                const provider = detectLoginProvider(customer);
                                                return (
                                                    <tr key={customer.id} className="hover:bg-[#121212] transition-none cursor-pointer" onClick={() => { setCustomerModal({ show: true, customer }); setShowPasswordHash(false); }}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-[#161616] overflow-hidden flex items-center justify-center border border-[#282828] shrink-0">
                                                                    {customer.profileImage ? (
                                                                        <img src={customer.profileImage} alt={customer.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-[11px] font-bold text-white">
                                                                            {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-white">{customer.name}</p>
                                                                    <p className="text-[10px] text-neutral-500 font-medium">{customer.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                                                provider === "Google"
                                                                    ? "bg-blue-950/60 border-blue-800/40 text-blue-400"
                                                                    : "bg-[#141414] border-[#262626] text-neutral-300"
                                                            )}>
                                                                {provider === "Google" ? (
                                                                    <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                                ) : (
                                                                    <Mail className="w-2.5 h-2.5" />
                                                                )}
                                                                {provider}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-[10px] font-medium text-neutral-500">
                                                            {formatDateSafe(customer.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setCustomerModal({ show: true, customer }); setShowPasswordHash(false); }}
                                                                className="px-3.5 py-2 bg-[#181818] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#222222] border border-[#2a2a2a] flex items-center gap-1.5 ml-auto rounded-lg"
                                                            >
                                                                <Eye className="w-3 h-3" /> View Profile
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "bookings" && (
                <div>
                    {/* Sub-tab switcher */}
                    <div className="flex gap-1.5 mb-6 bg-[#0c0c0c] border border-[#1f1f1f] p-1.5 rounded-xl w-fit shadow-inner">
                        <button
                            onClick={() => setBookingsSubTab("fullDay")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                bookingsSubTab === "fullDay"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            Full Day Bookings ({bookings.filter(b => {
                                if (!b.checkIn || !b.checkOut) return true;
                                const durationHours = (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60);
                                return !(b.room?.isHourlyEnabled && durationHours < 24);
                            }).length})
                        </button>
                        <button
                            onClick={() => setBookingsSubTab("hourly")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                bookingsSubTab === "hourly"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            Hourly Bookings ({bookings.filter(b => {
                                if (!b.checkIn || !b.checkOut) return false;
                                const durationHours = (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60);
                                return b.room?.isHourlyEnabled && durationHours < 24;
                            }).length})
                        </button>
                    </div>

                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                {bookingsSubTab === "hourly" ? "Hourly Reservations" : "Full Day Reservations"}
                            </h3>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase">
                                Records Found
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Booking ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Guest</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Property</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Stay Details</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#181818]">
                                    {(() => {
                                        const hourlyBookings = bookings.filter(b => {
                                            if (!b.checkIn || !b.checkOut) return false;
                                            const durationHours = (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60);
                                            return b.room?.isHourlyEnabled && durationHours < 24;
                                        });

                                        const fullDayBookings = bookings.filter(b => {
                                            if (!b.checkIn || !b.checkOut) return true;
                                            const durationHours = (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60);
                                            return !(b.room?.isHourlyEnabled && durationHours < 24);
                                        });

                                        const currentTabBookings = bookingsSubTab === "hourly" ? hourlyBookings : fullDayBookings;

                                        const filteredBookings = smartFilter(
                                            currentTabBookings,
                                            searchQuery,
                                            ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'hotel.name', 'status']
                                        );

                                        if (filteredBookings.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={6} className="py-20 text-center">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No bookings found</p>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return filteredBookings.map((booking) => {
                                            const isHourly = booking.room?.isHourlyEnabled && ((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60)) < 24;
                                            const stayDetails = isHourly ? (
                                                <div>
                                                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded-lg bg-purple-950/80 border border-purple-800/40 text-purple-400">Hourly Stay</span>
                                                    <p className="text-[10px] text-neutral-400 font-semibold mt-1">{formatDateTimeSafe(booking.checkIn)}</p>
                                                    <p className="text-[9px] text-neutral-500 font-bold uppercase">
                                                        Duration: {Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60))} Hours
                                                    </p>
                                                    <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Arrival: {booking.arrivalTime || "Not specified"}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded-lg bg-blue-950/80 border border-blue-800/40 text-blue-400">Full Day Stay</span>
                                                    <p className="text-[10px] text-neutral-400 font-semibold mt-1">
                                                        {formatDateSafe(booking.checkIn)} to {formatDateSafe(booking.checkOut)}
                                                    </p>
                                                    <p className="text-[9px] text-neutral-500 font-bold uppercase">
                                                        Duration: {Math.max(1, Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} Night(s)
                                                    </p>
                                                    <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Arrival: {booking.arrivalTime || "Not specified"}</p>
                                                </div>
                                            );

                                            return (
                                                <tr key={booking.id} className="hover:bg-[#121212] transition-none">
                                                    <td className="px-6 py-4 text-xs font-bold text-white">#BK-{booking.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-neutral-200">{booking.guestFirstName} {booking.guestLastName}</p>
                                                            <p className="text-[9px] text-neutral-500 font-bold uppercase">{booking.guestEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-white">{booking.hotel?.name || 'N/A'}</p>
                                                        <p className="text-[9px] text-neutral-500 font-bold uppercase">{booking.room?.name || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {stayDetails}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border",
                                                            booking.status === 'confirmed' ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" :
                                                            booking.status === 'pending' ? "bg-amber-950/80 border-amber-800/40 text-amber-400" :
                                                            booking.status === 'cancelled' ? "bg-red-950/80 border-red-800/40 text-red-400" : "bg-[#141414] text-neutral-500 border-[#262626]"
                                                        )}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-xs font-bold text-white">
                                                        ₹{booking.totalPrice?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "hotels" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Property Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Hotel Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181818]">
                                {smartFilter(hotels, searchQuery, ['name', 'city', 'hotelUsername', 'address', 'id'])
                                    .map((hotel) => (
                                        <tr
                                            key={hotel.id}
                                            onClick={() => router(`/admin/super/hotels/${hotel.id}`)}
                                            className="hover:bg-[#121212] transition-none cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-[#161616] border border-[#282828] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                        {hotel.thumbnail ? (
                                                            <Image src={hotel.thumbnail} alt={hotel.name} width={36} height={36} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <Hotel className="w-4 h-4 text-neutral-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{hotel.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-neutral-400">{hotel.city}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-emerald-400">₹{hotel.pricePerNight}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-neutral-400 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors cursor-pointer">
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

            {/* ─── Global Reviews Tab ──────────────────────────────────────────────── */}
            {activeTab === "reviews" && (
                <div>
                    {/* Sub-tab switcher */}
                    <div className="flex gap-1.5 mb-6 bg-[#0c0c0c] border border-[#1f1f1f] p-1.5 rounded-xl w-fit shadow-inner">
                        <button
                            onClick={() => setReviewsSubTab("list")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                reviewsSubTab === "list"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            All Reviews ({globalReviews.length})
                        </button>
                        <button
                            onClick={() => setReviewsSubTab("import")}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                                reviewsSubTab === "import"
                                    ? "bg-neutral-100 text-black shadow-md"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            Import Reviews (AI)
                        </button>
                    </div>

                    {reviewsSubTab === "list" ? (
                        <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Reviews</h3>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase mt-0.5">{globalReviews.length} Total Reviews</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Search reviews..."
                                        value={reviewSearchQuery}
                                        onChange={e => setReviewSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-[#141414] border border-[#282828] rounded-xl w-56 focus:outline-none focus:border-neutral-500 font-medium text-xs text-white placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Reviewer</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Hotel</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Rating</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Stay Type</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Comment</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]">
                                        {smartFilter(globalReviews, reviewSearchQuery || searchQuery, ['user.name', 'user.email', 'hotel.name', 'hotel.city', 'comment'])
                                            .map((review) => (
                                            <tr
                                                key={review.id}
                                                className="hover:bg-[#121212] transition-none cursor-pointer"
                                                onClick={() => setReviewModal({ show: true, review })}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#161616] overflow-hidden flex items-center justify-center border border-[#282828] shrink-0">
                                                            {review.user?.profileImage ? (
                                                                <img src={review.user.profileImage} alt={review.user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-white">
                                                                    {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{review.user?.name || "Unknown"}</p>
                                                            <p className="text-[10px] text-neutral-500 font-medium">{review.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-bold text-white">{review.hotel?.name || "N/A"}</p>
                                                    <p className="text-[10px] text-neutral-500">{review.hotel?.city}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <StarRating rating={review.rating} />
                                                        <span className="text-[10px] font-bold text-amber-400">{review.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border",
                                                        review.stayType === 'hourly' ? "bg-purple-950/80 border-purple-800/40 text-purple-400" : "bg-blue-950/80 border-blue-800/40 text-blue-400"
                                                    )}>
                                                        {review.stayType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-[200px]">
                                                    <p className="text-xs text-neutral-400 truncate">{review.comment || "—"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] text-neutral-500 font-medium whitespace-nowrap">
                                                    {formatDateSafe(review.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDeleteReview(review.id); }}
                                                        disabled={actionLoading === review.id}
                                                        className="p-2 bg-red-950/60 border border-red-800/40 text-red-400 hover:bg-red-900 transition-all rounded-lg disabled:opacity-50"
                                                        title="Delete Review"
                                                    >
                                                        {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {globalReviews.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-20 text-center">
                                                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No reviews found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <AdminReviewImporter 
                            hotels={hotels} 
                            loadingHotels={loading} 
                            onImportSuccess={() => fetchDashboardData("reviews", true)} 
                        />
                    )}
                </div>
            )}
                </>
            )}

            {/* ─── Reset Password Modal ────────────────────────────────────────────── */}
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
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* ─── Edit Partner Email Modal (Zero OTP Required) ────────────────────── */}
            <AnimatePresence>
                {editEmailModal.show && editEmailModal.partner && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setEditEmailModal({ show: false, partner: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-sm z-[210] shadow-2xl border border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Update Partner Email</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editEmailModal.partner.name || "Partner"}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50/80 border border-emerald-200 flex gap-3 rounded-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">Super Admin Direct Override</p>
                                        <p className="text-[10px] font-medium text-emerald-700 leading-relaxed">
                                            No OTP or verification needed. Partner will use this new email to login instantly.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Email</label>
                                    <input
                                        type="text"
                                        value={editEmailModal.partner.email || "No email"}
                                        disabled
                                        className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-sm text-xs font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">New Partner Email</label>
                                    <input
                                        type="email"
                                        value={newPartnerEmail}
                                        onChange={(e) => setNewPartnerEmail(e.target.value)}
                                        placeholder="e.g. partner@hotel.com"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white outline-none rounded-sm text-sm font-bold text-slate-900 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleUpdatePartnerEmail}
                                        disabled={isUpdatingEmail}
                                        className="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm cursor-pointer"
                                    >
                                        {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Update Email
                                    </button>
                                    <button
                                        onClick={() => setEditEmailModal({ show: false, partner: null })}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 cursor-pointer rounded-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* ─── Partner Request Detail Modal ────────────────────────────────────── */}
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
                                        <p className="text-[10px] text-slate-400 italic">Submitted on {formatDateTimeSafe(requestDetailModal.request.createdAt)}</p>
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

            {/* ─── Customer Profile Modal ───────────────────────────────────────────── */}
            <AnimatePresence>
                {customerModal.show && customerModal.customer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setCustomerModal({ show: false, customer: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-sm z-[210] shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center shrink-0">
                                        {customerModal.customer.profileImage ? (
                                            <img src={customerModal.customer.profileImage} alt={customerModal.customer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black text-white">
                                                {customerModal.customer.name?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">{customerModal.customer.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">{customerModal.customer.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                                detectLoginProvider(customerModal.customer) === "Google"
                                                    ? "bg-blue-500/20 text-blue-300"
                                                    : "bg-white/10 text-slate-300"
                                            )}>
                                                {detectLoginProvider(customerModal.customer) === "Google" ? (
                                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                ) : (
                                                    <Mail className="w-2 h-2" />
                                                )}
                                                {detectLoginProvider(customerModal.customer)}
                                            </span>
                                            <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded text-[9px] font-black uppercase">
                                                #{customerModal.customer.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCustomerModal({ show: false, customer: null })}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-700 font-medium">{customerModal.customer.email || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-700 font-medium">{customerModal.customer.phone || "Not provided"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-700 font-medium">Joined {formatDateSafe(customerModal.customer.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LogIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-700 font-medium">Provider: {detectLoginProvider(customerModal.customer)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Security Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password Last Changed</p>
                                                <p className="text-xs text-slate-700 font-medium">{formatDateTimeSafe(customerModal.customer.passwordLastChangedAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password Hash</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[9px] text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono truncate max-w-[140px]">
                                                        {showPasswordHash
                                                            ? (customerModal.customer.password || "N/A")
                                                            : "••••••••••••••••••••"}
                                                    </code>
                                                    <button
                                                        onClick={() => setShowPasswordHash(!showPasswordHash)}
                                                        className="text-slate-400 hover:text-slate-600 shrink-0"
                                                    >
                                                        {showPasswordHash ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </button>
                                                    {showPasswordHash && customerModal.customer.password && (
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(customerModal.customer.password); alert("Hash copied!"); }}
                                                            className="text-slate-400 hover:text-slate-600 shrink-0"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Password Change History */}
                                            {customerModal.customer.passwordChangeHistory && (() => {
                                                try {
                                                    const hist = typeof customerModal.customer.passwordChangeHistory === 'string'
                                                        ? JSON.parse(customerModal.customer.passwordChangeHistory)
                                                        : customerModal.customer.passwordChangeHistory;
                                                    if (Array.isArray(hist) && hist.length > 0) {
                                                        return (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Password Change History</p>
                                                                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                                                                    {hist.slice(-5).reverse().map((entry: any, i: number) => (
                                                                        <div key={i} className="text-[9px] text-slate-500 flex items-center gap-1.5">
                                                                            <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                                            {formatDateTimeSafe(entry.changedAt || entry.date)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                } catch {}
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => handleImpersonateCustomer(customerModal.customer)}
                                    className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center justify-center gap-2 transition-all"
                                >
                                    <UserCheck className="w-3.5 h-3.5" /> Impersonate User
                                </button>
                                <button
                                    onClick={() => {
                                        setCustomerModal({ show: false, customer: null });
                                        // Switch to customers sub-tab and search by email
                                        setUsersSubTab("customers");
                                        setCustomerSearchQuery(customerModal.customer.email);
                                    }}
                                    className="flex-1 py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 flex items-center justify-center gap-2 transition-all"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> View Full Details
                                </button>
                                <button
                                    onClick={() => setCustomerModal({ show: false, customer: null })}
                                    className="py-3 px-5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Review Detail Modal ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {reviewModal.show && reviewModal.review && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setReviewModal({ show: false, review: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-sm z-[210] shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                        {reviewModal.review.user?.profileImage ? (
                                            <img src={reviewModal.review.user.profileImage} alt={reviewModal.review.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-black text-slate-500">
                                                {reviewModal.review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">{reviewModal.review.user?.name || "Unknown User"}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">{reviewModal.review.user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setReviewModal({ show: false, review: null })} className="p-2 text-slate-400 hover:text-slate-700">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5">
                                {/* Hotel + Rating */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Property</p>
                                        <p className="text-sm font-bold text-slate-900">{reviewModal.review.hotel?.name}</p>
                                        <p className="text-[10px] text-slate-400">{reviewModal.review.hotel?.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rating</p>
                                        <StarRating rating={reviewModal.review.rating} />
                                        <p className="text-xs font-black text-amber-600 mt-0.5">{reviewModal.review.rating} / 5</p>
                                    </div>
                                </div>

                                {/* Stay Type + Date */}
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "px-3 py-1 text-[9px] font-black uppercase rounded-sm",
                                        reviewModal.review.stayType === 'hourly' ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                                    )}>
                                        {reviewModal.review.stayType} stay
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        Posted on {formatDateTimeSafe(reviewModal.review.createdAt)}
                                    </span>
                                </div>

                                {/* Comment */}
                                {reviewModal.review.comment && (
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Guest Review</p>
                                        <p className="text-sm text-slate-700 leading-relaxed italic">"{reviewModal.review.comment}"</p>
                                    </div>
                                )}

                                {/* Partner Reply */}
                                {reviewModal.review.partnerReply && (
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-sm">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Partner Response:</p>
                                        <p className="text-sm text-blue-900 leading-relaxed">"{reviewModal.review.partnerReply}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setCustomerModal({ show: true, customer: reviewModal.review.user });
                                        setReviewModal({ show: false, review: null });
                                        setShowPasswordHash(false);
                                    }}
                                    className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center justify-center gap-2"
                                >
                                    <UserCheck className="w-3.5 h-3.5" /> View Customer Profile
                                </button>
                                <button
                                    onClick={() => handleDeleteReview(reviewModal.review.id)}
                                    disabled={actionLoading === reviewModal.review.id}
                                    className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading === reviewModal.review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Delete Review
                                </button>
                                <button
                                    onClick={() => setReviewModal({ show: false, review: null })}
                                    className="py-3 px-5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Decline Confirmation Modal ───────────────────────────────────────── */}
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

            {/* ─── Bulk Confirmation Modal ──────────────────────────────────────────── */}
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
