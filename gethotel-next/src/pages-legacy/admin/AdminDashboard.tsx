'use client';

import React, { useState, useEffect } from "react";
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
    UserCheck, Mail, Phone, Calendar, LogIn, Shield, Copy, ExternalLink, RefreshCw, LayoutGrid, Percent, Bot, Palmtree, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/common/Image";
import { motion, AnimatePresence } from "framer-motion";
import AdminStats from "./AdminStats";
import AdminFinance from "./AdminFinance";
import AdminHomepageEditor from "./AdminHomepageEditor";
import AdminDestinationsManager from "./AdminDestinationsManager";
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
import AdminHotelImporter from "./AdminHotelImporter";
import AdminDelhiSeo from "./AdminDelhiSeo";
import AdminHotelDetails from "./AdminHotelDetails";
import { parseBookingBreakdown } from "@/lib/bookingBreakdown";

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
    if (location.pathname.includes('/controlhub?tab=ai-chats')) {
        initialTab = "ai-chats";
    }
    if (location.pathname.includes('/controlhub?tab=tour-packages')) {
        initialTab = "tour-packages";
    }
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        let currentTab = searchParams.get("tab") || "overview";
        if (location.pathname.includes('/controlhub?tab=ai-chats')) {
            currentTab = "ai-chats";
        }
        if (location.pathname.includes('/controlhub?tab=tour-packages')) {
            currentTab = "tour-packages";
        }
        setActiveTab(currentTab);
    }, [searchParams, location.pathname, location.search]);

    const [selectedHotelId, setSelectedHotelId] = useState<string | number | null>(null);
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
    const [bookingsSubTab, setBookingsSubTab] = useState<"all" | "fullDay" | "hourly">("all");
    const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
    const [bookingSearchTerm, setBookingSearchTerm] = useState<string>("");

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

    // Booking Breakdown Modal
    const [breakdownModal, setBreakdownModal] = useState<{ show: boolean, booking: any }>({ show: false, booking: null });

    // Customer Detail Modal
    const [customerModal, setCustomerModal] = useState<{ show: boolean, customer: any }>({ show: false, customer: null });
    const [showPasswordHash, setShowPasswordHash] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    // Review Detail Modal
    const [reviewModal, setReviewModal] = useState<{ show: boolean, review: any }>({ show: false, review: null });
    const [reviewSearchQuery, setReviewSearchQuery] = useState("");
    const [reviewsSubTab, setReviewsSubTab] = useState<"list" | "import">("list");

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        const hotelIdFromUrl = searchParams.get("hotelId");
        if (hotelIdFromUrl) {
            setSelectedHotelId(hotelIdFromUrl);
        }
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
            return;
        }
        const path = location.pathname.split('/').filter(Boolean).pop();
        if (path && !['super', 'controlhub', '.controlhub', 'admin', 'superadmin'].includes(path)) {
            setActiveTab(path);
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
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className={cn(activeTab === "ai-copilot" ? "p-0 h-screen overflow-hidden flex flex-col" : "p-8", "min-w-0")}>
            {activeTab !== "ai-copilot" && activeTab !== "destination-analytics" && activeTab !== "destinations" && (
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-5">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {activeTab === 'overview' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5">Monitoring platform statistics and property requests.</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg w-56 focus:outline-none focus:border-slate-900 text-xs text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs"
                            />
                        </div>
                        <button className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs">
                            <Bell className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>
            )}

            {loading && !isTabLoaded() ? (
                <div className="min-h-[400px] flex items-center justify-center bg-transparent">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
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
                    {activeTab === "destinations" && <AdminDestinationsManager />}
                    {activeTab === "destination-analytics" && <AdminDestinationAnalytics />}
                    {activeTab === "ai-chats" && <AdminAIChats />}
                    {activeTab === "hotel-importer" && <AdminHotelImporter />}
                    {activeTab === "delhi-seo" && <AdminDelhiSeo />}

                    {activeTab === "overview" && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-slate-500 text-xs font-medium">{stat.label}</span>
                                        <Icon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{stat.value}</h3>
                                        <span className={cn(
                                            "text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                                            stat.isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200/70" : "bg-rose-50 text-rose-700 border-rose-200/70"
                                        )}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Conversion Intelligence & Destination Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-xs p-5">
                            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Conversion Intelligence
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[11px] text-slate-500 font-medium mb-1">Search → Booking</p>
                                    <p className="text-2xl font-semibold text-slate-900">{statsData?.conversionRate || '0'}%</p>
                                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">Healthy</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 font-medium mb-1">Abandoned Checkout</p>
                                    <p className="text-2xl font-semibold text-slate-900">{statsData?.abandonedRate || '0'}%</p>
                                    <p className="text-[11px] text-amber-600 font-semibold mt-1">Stable</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 font-medium mb-1">Repeat Guest %</p>
                                    <p className="text-2xl font-semibold text-slate-900">{statsData?.repeatGuestRate || '0'}%</p>
                                    <p className="text-[11px] text-blue-600 font-semibold mt-1">Growing</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 font-medium mb-1">Avg. Booking Value</p>
                                    <p className="text-2xl font-semibold text-slate-900">₹{(statsData?.avgBookingValue || 0).toLocaleString()}</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1">Per stay</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Top Destinations
                                </h3>
                                <button
                                    onClick={() => router('/controlhub?tab=destination-analytics')}
                                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                                    title="View Detailed Destination Analytics"
                                >
                                    <span>Analytics</span>
                                    <ArrowRight className="w-3 h-3 text-slate-500" />
                                </button>
                            </div>
                            <div className="space-y-3.5">
                                {(statsData?.topDestinations || []).length > 0 ? (
                                    statsData.topDestinations.map((dest: any, idx: number) => {
                                        const colors = ["bg-neutral-200", "bg-emerald-400", "bg-amber-400", "bg-neutral-500"];
                                        return (
                                            <div key={dest.city} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-800 font-medium">{dest.city}</span>
                                                    <span className="text-slate-500 text-[11px]">{dest.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", colors[idx % colors.length])} style={{ width: `${dest.percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-xs text-slate-400 font-medium">No destination data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Pending Approvals</h3>
                                <button
                                    onClick={() => router('/controlhub?tab=requests')}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {partnerRequests?.filter((r: any) => r.status === "pending").slice(0, 5).map((req: any) => (
                                    <div key={req.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                                <Hotel className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium text-slate-900 text-xs truncate max-w-xs">{req.hotelName}</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Requested {formatDateSafe(req.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                disabled={actionLoading === req.id}
                                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                {actionLoading === req.id ? '...' : 'Approve'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!partnerRequests || partnerRequests.filter((r: any) => r.status === "pending").length === 0) && (
                                    <div className="py-12 text-center">
                                        <p className="text-xs text-slate-400 font-medium">No pending approvals</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5">
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Quick Actions</h3>
                                <div className="space-y-2.5">
                                    <button
                                        onClick={() => router('/controlhub?tab=requests')}
                                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-black" /> View Requests
                                    </button>
                                    <button 
                                        onClick={() => router('/controlhub?tab=controlhub')}
                                        className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Globe className="w-3.5 h-3.5 text-slate-500" /> Platform Control Hub
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "requests" && (
                <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Property Requests</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Review and approve new hotel partners</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                                    <span className="text-xs font-medium text-slate-900">{selectedIds.length} Selected</span>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'approve' })}
                                        className="px-2.5 py-1 bg-white text-black text-xs font-medium rounded-md hover:bg-neutral-200 transition-colors"
                                    >
                                        Bulk Approve
                                    </button>
                                    <button
                                        onClick={() => setBulkModal({ show: true, type: 'decline' })}
                                        className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-md hover:bg-red-500/20 transition-colors"
                                    >
                                        Bulk Decline
                                    </button>
                                </div>
                            )}
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-md">
                                {partnerRequests.filter(r => r.status === 'pending').length} Pending
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                            checked={selectedIds.length === partnerRequests.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Hotel Info</th>
                                    <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Owner Details</th>
                                    <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {smartFilter(partnerRequests, searchQuery, ['hotelName', 'userName', 'userEmail', 'city', 'hotelUsername', 'address'])
                                    .map((req) => (
                                        <tr key={req.id} className={cn(
                                            "hover:bg-slate-50/80 transition-colors",
                                            selectedIds.includes(req.id) ? "bg-slate-100/60" : ""
                                        )}>
                                            <td className="px-4 py-3">
                                                {req.status === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                                        checked={selectedIds.includes(req.id)}
                                                        onChange={() => toggleSelect(req.id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-50 flex items-center justify-center border border-slate-200 rounded-lg shrink-0">
                                                        <Hotel className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-900">{req.hotelName}</p>
                                                        <p className="text-[11px] text-slate-400">@{req.hotelUsername}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-800">{req.userName}</p>
                                                    <p className="text-[11px] text-slate-400">{req.userEmail}</p>
                                                    <p className="text-[11px] text-slate-400">{req.userPhone}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {req.city}, {req.address}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[11px] font-medium rounded-md",
                                                    req.status === 'pending' ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                                                )}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setRequestDetailModal({ show: true, request: req })}
                                                        className="p-1.5 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-md border border-slate-200"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeclineRequest(req.id)}
                                                                disabled={actionLoading === req.id}
                                                                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
                                        <td colSpan={6} className="py-16 text-center">
                                            <p className="text-xs text-slate-400 font-medium">No requests found</p>
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
                    <div className="flex gap-1 mb-6 bg-slate-100 border border-slate-200/80 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setUsersSubTab("partners")}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                                usersSubTab === "partners"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "text-slate-600 hover:text-slate-900 font-medium"
                            )}
                        >
                            Partners ({partners.length})
                        </button>
                        <button
                            onClick={() => setUsersSubTab("customers")}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                                usersSubTab === "customers"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "text-slate-600 hover:text-slate-900 font-medium"
                            )}
                        >
                            Customers ({customers.length})
                        </button>
                    </div>

                    {/* Partners Sub-Tab */}
                    {usersSubTab === "partners" && (
                        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Partner Management</h3>
                                <p className="text-xs text-slate-500">{partners.length} Total Partners</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Partner Details</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Assigned Hotel</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Joined On</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {smartFilter(partners, searchQuery, ['name', 'email', 'id', 'hotel.0.name'])
                                            .map((partner) => (
                                            <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                                                            {partner.profileImage ? (
                                                                <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-900">{partner.name}</p>
                                                            <p className="text-[11px] text-slate-400">{partner.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {partner.hotel && partner.hotel.length > 0 ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Hotel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                <span className="text-xs text-slate-800 line-clamp-1">{partner.hotel[0].name}</span>
                                                            </div>
                                                            {partner.hotel.length > 1 && (
                                                                <span className="text-[10px] text-slate-400 pl-5">
                                                                    + {partner.hotel.length - 1} other properties
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No Hotel Assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {formatDateSafe(partner.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditEmailModal({ show: true, partner });
                                                                setNewPartnerEmail(partner.email || "");
                                                            }}
                                                            className="px-2.5 py-1 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium flex items-center gap-1.5 rounded-md transition-colors cursor-pointer"
                                                            title="Edit Partner Email (No OTP Required)"
                                                        >
                                                            <Mail className="w-3 h-3 text-emerald-400" /> Edit Email
                                                        </button>
                                                        <button
                                                            onClick={() => setResetModal({ show: true, partner })}
                                                            className="px-2.5 py-1 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium flex items-center gap-1.5 rounded-md transition-colors cursor-pointer"
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
                        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer Management</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{customers.length} Registered Customers</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={customerSearchQuery}
                                        onChange={e => setCustomerSearchQuery(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg w-52 focus:outline-none focus:border-slate-900 text-xs text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Login Provider</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Joined On</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {smartFilter(customers, customerSearchQuery || searchQuery, ['name', 'email', 'phone'])
                                            .map((customer) => {
                                                const provider = detectLoginProvider(customer);
                                                return (
                                                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => { setCustomerModal({ show: true, customer }); setShowPasswordHash(false); }}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                                                                    {customer.profileImage ? (
                                                                        <img src={customer.profileImage} alt={customer.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs font-semibold text-white">
                                                                            {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-slate-900">{customer.name}</p>
                                                                    <p className="text-[11px] text-slate-400">{customer.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium",
                                                                provider === "Google"
                                                                    ? "bg-blue-500/10 text-blue-400"
                                                                    : "bg-slate-100 text-slate-700"
                                                            )}>
                                                                {provider === "Google" ? (
                                                                    <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                                ) : (
                                                                    <Mail className="w-2.5 h-2.5" />
                                                                )}
                                                                {provider}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-500">
                                                            {formatDateSafe(customer.createdAt)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setCustomerModal({ show: true, customer }); setShowPasswordHash(false); }}
                                                                className="px-2.5 py-1 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium flex items-center gap-1.5 ml-auto rounded-md transition-colors cursor-pointer"
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
                    {/* Controls Toolbar: Sub-tabs, Status Filters & Search */}
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

                        return (
                            <div className="space-y-4 mb-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Stay Type Tabs: All, Full Day, Hourly */}
                                    <div className="flex gap-1 bg-slate-100 border border-slate-200/80 p-1 rounded-lg w-fit">
                                        <button
                                            onClick={() => setBookingsSubTab("all")}
                                            className={cn(
                                                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                                                bookingsSubTab === "all"
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900 font-medium"
                                            )}
                                        >
                                            All Bookings ({bookings.length})
                                        </button>
                                        <button
                                            onClick={() => setBookingsSubTab("fullDay")}
                                            className={cn(
                                                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                                                bookingsSubTab === "fullDay"
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900 font-medium"
                                            )}
                                        >
                                            Full Day ({fullDayBookings.length})
                                        </button>
                                        <button
                                            onClick={() => setBookingsSubTab("hourly")}
                                            className={cn(
                                                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                                                bookingsSubTab === "hourly"
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900 font-medium"
                                            )}
                                        >
                                            Hourly ({hourlyBookings.length})
                                        </button>
                                    </div>

                                    {/* Local Search Input */}
                                    <div className="relative w-full sm:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID, Guest, Email, Hotel..."
                                            value={bookingSearchTerm}
                                            onChange={(e) => setBookingSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 shadow-2xs"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                                    {[
                                        { id: "all", label: "All Status" },
                                        { id: "confirmed", label: "Confirmed" },
                                        { id: "paid", label: "Paid Online" },
                                        { id: "pending", label: "Pending" },
                                        { id: "held", label: "Held / Draft" },
                                        { id: "cancelled", label: "Cancelled" }
                                    ].map(pill => (
                                        <button
                                            key={pill.id}
                                            onClick={() => setBookingStatusFilter(pill.id)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap",
                                                bookingStatusFilter === pill.id
                                                    ? "bg-slate-900 text-white shadow-xs"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {pill.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                {bookingsSubTab === "all" ? "Master Platform Reservations" : (bookingsSubTab === "hourly" ? "Hourly Reservations" : "Full Day Reservations")}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Showing {(() => {
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
                                    const currentTab = bookingsSubTab === "all" ? bookings : (bookingsSubTab === "hourly" ? hourlyBookings : fullDayBookings);
                                    const statusFiltered = currentTab.filter(b => {
                                        if (bookingStatusFilter === "all") return true;
                                        return b.status === bookingStatusFilter || b.paymentStatus === bookingStatusFilter;
                                    });
                                    const effectiveSearch = (bookingSearchTerm || searchQuery || "").trim();
                                    return smartFilter(statusFiltered, effectiveSearch, ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone', 'hotel.name', 'room.name', 'status', 'paymentStatus']).length;
                                })()} of {bookings.length} Total Bookings
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Booking ID</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Guest</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Property & Room</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Stay & Units</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Revenue & Breakdown</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
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

                                        const currentTabBookings = bookingsSubTab === "all" 
                                            ? bookings 
                                            : (bookingsSubTab === "hourly" ? hourlyBookings : fullDayBookings);

                                        const statusFilteredBookings = currentTabBookings.filter(b => {
                                            if (bookingStatusFilter === "all") return true;
                                            return b.status === bookingStatusFilter || b.paymentStatus === bookingStatusFilter;
                                        });

                                        const effectiveSearch = (bookingSearchTerm || searchQuery || "").trim();
                                        const filteredBookings = smartFilter(
                                            statusFilteredBookings,
                                            effectiveSearch,
                                            ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone', 'hotel.name', 'room.name', 'status', 'paymentStatus']
                                        );

                                        if (filteredBookings.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={6} className="py-16 text-center">
                                                        <p className="text-xs text-slate-400 font-medium">No bookings found matching current filters</p>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return filteredBookings.map((booking) => {
                                            const meta = parseBookingBreakdown(booking);
                                            const isHourly = meta.isHourly;
                                            const stayDetails = isHourly ? (
                                                <div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-500/10 text-purple-600">Hourly Stay</span>
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                                                            {meta.roomCount} {meta.roomCount > 1 ? 'Rooms' : 'Room'} • {meta.durationHours} hrs
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium mt-1">{formatDateTimeSafe(booking.checkIn)}</p>
                                                    <p className="text-[11px] text-emerald-600 mt-0.5">Arrival: {booking.arrivalTime || "Not specified"}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-500/10 text-blue-600">Full Day Stay</span>
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                                                            {meta.roomCount} {meta.roomCount > 1 ? 'Rooms' : 'Room'} • {meta.nights} {meta.nights > 1 ? 'Nights' : 'Night'}
                                                        </span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-[10px] font-semibold rounded-md",
                                                            meta.mealPlan.toLowerCase().includes("breakfast") ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {meta.mealPlan}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium mt-1">
                                                        {formatDateSafe(booking.checkIn)} to {formatDateSafe(booking.checkOut)}
                                                    </p>
                                                    {booking.specialRequests && (
                                                        <p className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 mt-1 inline-block truncate max-w-[220px]" title={booking.specialRequests}>
                                                            Note: {booking.specialRequests}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                            return (
                                                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">#BK-{booking.id}</td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-800">{booking.guestFirstName} {booking.guestLastName}</p>
                                                            <p className="text-[11px] text-slate-400">{booking.guestEmail}</p>
                                                            {booking.guestPhone && <p className="text-[10px] text-slate-400">{booking.guestPhone}</p>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-xs font-semibold text-slate-900">{booking.hotel?.name || 'N/A'}</p>
                                                        <p className="text-[11px] text-slate-500">{booking.room?.name || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {stayDetails}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-[11px] font-semibold rounded-md",
                                                            booking.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-600" :
                                                            booking.status === 'pending' ? "bg-amber-500/10 text-amber-600" :
                                                            booking.status === 'cancelled' ? "bg-red-500/10 text-red-600" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {booking.status}
                                                        </span>
                                                        <div className="mt-1">
                                                            <span className={cn(
                                                                "text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded",
                                                                meta.paymentMode === 'PAY_AT_HOTEL' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                                meta.paymentMode === 'FULL_ONLINE' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                                "bg-blue-50 text-blue-700 border border-blue-200"
                                                            )}>
                                                                {meta.paymentMode === 'PAY_AT_HOTEL' ? 'Pay at Hotel' : meta.paymentMode === 'FULL_ONLINE' ? 'Paid Online' : 'Partial'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <p className="text-xs font-bold text-slate-900">₹{booking.totalPrice?.toLocaleString()}</p>
                                                        <button
                                                            onClick={() => setBreakdownModal({ show: true, booking })}
                                                            className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            Breakdown
                                                        </button>
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
                selectedHotelId ? (
                    <AdminHotelDetails hotelId={selectedHotelId} onBack={() => setSelectedHotelId(null)} />
                ) : (
                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Property Management</h3>
                            <p className="text-xs text-slate-500">{hotels.length} Properties</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Hotel Name</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Location</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {smartFilter(hotels, searchQuery, ['name', 'city', 'hotelUsername', 'address', 'id'])
                                        .map((hotel) => (
                                            <tr
                                                key={hotel.id}
                                                onClick={() => setSelectedHotelId(hotel.id)}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                                            {hotel.thumbnail ? (
                                                                <Image src={hotel.thumbnail} alt={hotel.name} width={32} height={32} className="object-cover w-full h-full" />
                                                            ) : (
                                                                <Hotel className="w-4 h-4 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-900 group-hover:text-slate-700 transition-colors">{hotel.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">{hotel.city}</td>
                                                <td className="px-4 py-3 text-xs font-medium text-emerald-400">₹{hotel.pricePerNight}</td>
                                                <td className="px-4 py-3 text-xs text-right">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedHotelId(hotel.id);
                                                        }}
                                                        className="text-xs text-slate-500 group-hover:text-slate-900 transition-colors cursor-pointer font-medium"
                                                    >
                                                        View Details →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {/* ─── Global Reviews Tab ──────────────────────────────────────────────── */}
            {activeTab === "reviews" && (
                <div>
                    {/* Sub-tab switcher */}
                    <div className="flex gap-1 mb-6 bg-slate-100 border border-slate-200/80 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setReviewsSubTab("list")}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                                reviewsSubTab === "list"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "text-slate-600 hover:text-slate-900 font-medium"
                            )}
                        >
                            All Reviews ({globalReviews.length})
                        </button>
                        <button
                            onClick={() => setReviewsSubTab("import")}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                                reviewsSubTab === "import"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "text-slate-600 hover:text-slate-900 font-medium"
                            )}
                        >
                            Import Reviews (AI)
                        </button>
                    </div>

                    {reviewsSubTab === "list" ? (
                        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Global Reviews</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{globalReviews.length} Total Reviews</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search reviews..."
                                        value={reviewSearchQuery}
                                        onChange={e => setReviewSearchQuery(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg w-52 focus:outline-none focus:border-slate-900 text-xs text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Reviewer</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Hotel</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Stay Type</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Comment</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {smartFilter(globalReviews, reviewSearchQuery || searchQuery, ['user.name', 'user.email', 'hotel.name', 'hotel.city', 'comment'])
                                            .map((review) => (
                                            <tr
                                                key={review.id}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                                onClick={() => setReviewModal({ show: true, review })}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                                                            {review.user?.profileImage ? (
                                                                <img src={review.user.profileImage} alt={review.user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-semibold text-white">
                                                                    {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-900">{review.user?.name || "Unknown"}</p>
                                                            <p className="text-[11px] text-slate-400">{review.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-medium text-slate-900">{review.hotel?.name || "N/A"}</p>
                                                    <p className="text-[11px] text-slate-400">{review.hotel?.city}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <StarRating rating={review.rating} />
                                                        <span className="text-[11px] font-medium text-amber-400">{review.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[10px] font-medium rounded-md",
                                                        review.stayType === 'hourly' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                                    )}>
                                                        {review.stayType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="text-xs text-slate-500 truncate">{review.comment || "—"}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                                    {formatDateSafe(review.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDeleteReview(review.id); }}
                                                        disabled={actionLoading === review.id}
                                                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors rounded-md border border-red-500/20 disabled:opacity-50"
                                                        title="Delete Review"
                                                    >
                                                        {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {globalReviews.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-16 text-center">
                                                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-xs text-slate-400 font-medium">No reviews found</p>
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                            onClick={() => setResetModal({ show: false, partner: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                                    <Key className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Force Password Reset</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{resetModal.partner.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                                        This will immediately invalidate the partner's current password. They will need to use the new password to login.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Secure Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-slate-900 outline-none rounded-xl text-sm font-medium text-slate-900 transition-all"
                                        />
                                        <button
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 cursor-pointer"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isReseting}
                                        className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isReseting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Confirm Reset
                                    </button>
                                    <button
                                        onClick={() => setResetModal({ show: false, partner: null })}
                                        className="flex-1 py-3.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-slate-900 rounded-xl cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                            onClick={() => setEditEmailModal({ show: false, partner: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Update Partner Email</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{editEmailModal.partner.name || "Partner"}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50 border border-emerald-200 flex gap-3 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Super Admin Direct Override</p>
                                        <p className="text-[10px] font-medium text-emerald-700 leading-relaxed">
                                            No OTP or verification needed. Partner will use this new email to login instantly.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Email</label>
                                    <input
                                        type="text"
                                        value={editEmailModal.partner.email || "No email"}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">New Partner Email</label>
                                    <input
                                        type="email"
                                        value={newPartnerEmail}
                                        onChange={(e) => setNewPartnerEmail(e.target.value)}
                                        placeholder="e.g. partner@hotel.com"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-slate-900 outline-none rounded-xl text-sm font-medium text-slate-900 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleUpdatePartnerEmail}
                                        disabled={isUpdatingEmail}
                                        className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Update Email
                                    </button>
                                    <button
                                        onClick={() => setEditEmailModal({ show: false, partner: null })}
                                        className="flex-1 py-3.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-slate-900 rounded-xl cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                            onClick={() => setRequestDetailModal({ show: false, request: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center">
                                        <Hotel className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{requestDetailModal.request.hotelName}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Partner Application Review</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRequestDetailModal({ show: false, request: null })}
                                    className="p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Property Information</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Username</p>
                                                    <p className="text-sm font-medium text-slate-900">@{requestDetailModal.request.hotelUsername}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                                    <p className="text-sm font-medium text-slate-900">{requestDetailModal.request.city}</p>
                                                    <p className="text-xs text-slate-500">{requestDetailModal.request.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Partner Contact</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                                                    <p className="text-sm font-medium text-slate-900">{requestDetailModal.request.userName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                                    <p className="text-sm font-medium text-slate-900">{requestDetailModal.request.userEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                                                    <p className="text-sm font-medium text-slate-900">{requestDetailModal.request.userPhone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Application Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                            requestDetailModal.request.status === 'pending' ? "bg-amber-50 text-amber-800 border-amber-200" :
                                                requestDetailModal.request.status === 'approved' ? "bg-emerald-950/80 text-emerald-800 border-emerald-800/40" : "bg-red-950/80 text-red-300 border-red-800/40"
                                        )}>
                                            {requestDetailModal.request.status}
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic">Submitted on {formatDateTimeSafe(requestDetailModal.request.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {requestDetailModal.request.status === 'pending' && (
                                <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleApproveRequest(requestDetailModal.request.id);
                                            setRequestDetailModal({ show: false, request: null });
                                        }}
                                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve Listing
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDeclineRequest(requestDetailModal.request.id);
                                            setRequestDetailModal({ show: false, request: null });
                                        }}
                                        className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject Application
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Minimalist Booking Breakdown Modal ───────────────────────────────── */}
            <AnimatePresence>
                {breakdownModal.show && breakdownModal.booking && (() => {
                    const bk = breakdownModal.booking;
                    const meta = parseBookingBreakdown(bk);
                    return (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                                onClick={() => setBreakdownModal({ show: false, booking: null })}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">#BK-{bk.id}</span>
                                            <h3 className="text-base font-bold text-slate-900">{bk.hotel?.name || 'Hotel Reservation'}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{bk.room?.name || 'Standard Room'}</p>
                                    </div>
                                    <button
                                        onClick={() => setBreakdownModal({ show: false, booking: null })}
                                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
                                    {/* Summary Badges Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Guest</p>
                                            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{bk.guestFirstName} {bk.guestLastName}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{bk.guestPhone || bk.guestEmail}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Rooms & Stay</p>
                                            <p className="text-xs font-bold text-slate-900 mt-0.5">
                                                {meta.roomCount} Room(s) • {meta.isHourly ? `${meta.durationHours} Hours` : `${meta.nights} Night(s)`}
                                            </p>
                                            <p className="text-[10px] text-slate-500">{bk.totalGuests || 2} Guest(s)</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Meal Plan</p>
                                            <p className="text-xs font-bold text-emerald-700 mt-0.5">{meta.mealPlan}</p>
                                            <p className="text-[10px] text-slate-500">{meta.isHourly ? 'Hourly Rate' : 'Daily Rate'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Payment Mode</p>
                                            <p className="text-xs font-bold text-amber-700 mt-0.5">
                                                {meta.paymentMode === 'PAY_AT_HOTEL' ? 'Pay Full at Hotel' : meta.paymentMode === 'FULL_ONLINE' ? '100% Paid Online' : 'Partial Online'}
                                            </p>
                                            <p className="text-[10px] text-slate-500">{bk.status}</p>
                                        </div>
                                    </div>

                                    {/* Special Requests Callout */}
                                    {bk.specialRequests && (
                                        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3">
                                            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">Guest Special Request</p>
                                                <p className="text-xs text-amber-900/90 mt-0.5 font-medium italic">"{bk.specialRequests}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Minimalist Price Breakdown Table */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Price Calculation Breakdown</h4>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-2.5">Calculation Step</th>
                                                        <th className="px-4 py-2.5">Formula / Detail</th>
                                                        <th className="px-4 py-2.5 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                                    <tr>
                                                        <td className="px-4 py-2.5 font-semibold text-slate-900">Room Base Rate</td>
                                                        <td className="px-4 py-2.5 text-slate-600">
                                                            ₹{meta.rateUnit.toLocaleString()} / {meta.isHourly ? 'hr' : 'night'} × {meta.roomCount} Room(s) × {meta.isHourly ? meta.durationHours : meta.nights} {meta.isHourly ? 'Hour(s)' : 'Night(s)'}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">₹{meta.grossBase.toLocaleString()}</td>
                                                    </tr>
                                                    {meta.discountAmount > 0 && (
                                                        <tr className="bg-emerald-50/30">
                                                            <td className="px-4 py-2.5 font-semibold text-emerald-700">Coupon Discount</td>
                                                            <td className="px-4 py-2.5 text-emerald-700">
                                                                {meta.couponCode ? `Coupon applied: ${meta.couponCode}` : 'Promotional Discount'}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">- ₹{meta.discountAmount.toLocaleString()}</td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td className="px-4 py-2.5 font-medium text-slate-800">Net Taxable Base</td>
                                                        <td className="px-4 py-2.5 text-slate-500">Taxable amount after discount</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800">₹{meta.netTaxable.toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2.5 font-medium text-slate-800">GST / Taxes (5%)</td>
                                                        <td className="px-4 py-2.5 text-slate-500">CGST (2.5%) + SGST (2.5%) Standard</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800">+ ₹{meta.gstTax.toLocaleString()}</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                                        <td className="px-4 py-3 text-slate-900">Total Booking Price</td>
                                                        <td className="px-4 py-3 text-slate-500 font-normal">Final booking amount</td>
                                                        <td className="px-4 py-3 text-right text-base text-slate-950 font-black">₹{meta.totalPrice.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Settlement / Frontdesk Collection Card */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Online Paid via Gateway</p>
                                            <p className="text-lg font-bold text-emerald-600 mt-0.5">₹{meta.amountPaid.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500">{meta.amountPaid >= meta.totalPrice ? 'Full payment completed' : 'Initial deposit / online charge'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Due at Hotel Check-In</p>
                                            <p className="text-lg font-bold text-amber-600 mt-0.5">₹{meta.amountDueAtHotel.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500">{meta.amountDueAtHotel > 0 ? 'Frontdesk collection required' : 'No balance pending'}</p>
                                        </div>
                                    </div>

                                    {meta.internalNotes && (
                                        <div className="p-3 bg-slate-100/70 rounded-lg text-[11px] text-slate-600 font-mono">
                                            <span className="font-semibold text-slate-700">Audit Notes: </span>
                                            {meta.internalNotes}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    );
                })()}
            </AnimatePresence>

            {/* ─── Customer Profile Modal ───────────────────────────────────────────── */}
            <AnimatePresence>
                {customerModal.show && customerModal.customer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                            onClick={() => setCustomerModal({ show: false, customer: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                        {customerModal.customer.profileImage ? (
                                            <img src={customerModal.customer.profileImage} alt={customerModal.customer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black text-white">
                                                {customerModal.customer.name?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{customerModal.customer.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">{customerModal.customer.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                                detectLoginProvider(customerModal.customer) === "Google"
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            )}>
                                                {detectLoginProvider(customerModal.customer) === "Google" ? (
                                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                ) : (
                                                    <Mail className="w-2 h-2" />
                                                )}
                                                {detectLoginProvider(customerModal.customer)}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px] font-black uppercase font-mono">
                                                #{customerModal.customer.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCustomerModal({ show: false, customer: null })}
                                    className="p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-800 font-medium">{customerModal.customer.email || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-800 font-medium">{customerModal.customer.phone || "Not provided"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-800 font-medium">Joined {formatDateSafe(customerModal.customer.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LogIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-xs text-slate-800 font-medium">Provider: {detectLoginProvider(customerModal.customer)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Security Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password Last Changed</p>
                                                <p className="text-xs text-slate-800 font-medium">{formatDateTimeSafe(customerModal.customer.passwordLastChangedAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password Hash</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded font-mono truncate max-w-[140px]">
                                                        {showPasswordHash
                                                            ? (customerModal.customer.password || "N/A")
                                                            : "••••••••••••••••••••"}
                                                    </code>
                                                    <button
                                                        onClick={() => setShowPasswordHash(!showPasswordHash)}
                                                        className="text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                                                    >
                                                        {showPasswordHash ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </button>
                                                    {showPasswordHash && customerModal.customer.password && (
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(customerModal.customer.password); alert("Hash copied!"); }}
                                                            className="text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => handleImpersonateCustomer(customerModal.customer)}
                                    className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all border border-slate-200 cursor-pointer"
                                >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Impersonate User
                                </button>
                                <button
                                    onClick={() => {
                                        setCustomerModal({ show: false, customer: null });
                                        setUsersSubTab("customers");
                                        setCustomerSearchQuery(customerModal.customer.email);
                                    }}
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-md"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-black" /> View Full Details
                                </button>
                                <button
                                    onClick={() => setCustomerModal({ show: false, customer: null })}
                                    className="py-3 px-5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-slate-900 rounded-xl cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200]"
                            onClick={() => setReviewModal({ show: false, review: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-2xl z-[210] shadow-2xl border border-slate-200 text-slate-900 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
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
                                        <h3 className="text-sm font-bold text-slate-900">{reviewModal.review.user?.name || "Unknown User"}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">{reviewModal.review.user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setReviewModal({ show: false, review: null })} className="p-2 text-slate-500 hover:text-slate-900 cursor-pointer">
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
                                        <p className="text-[10px] text-slate-500">{reviewModal.review.hotel?.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rating</p>
                                        <StarRating rating={reviewModal.review.rating} />
                                        <p className="text-xs font-black text-amber-400 mt-0.5">{reviewModal.review.rating} / 5</p>
                                    </div>
                                </div>

                                {/* Stay Type + Date */}
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "px-3 py-1 text-[9px] font-black uppercase rounded-md border",
                                        reviewModal.review.stayType === 'hourly' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-sky-50 text-sky-700 border-sky-200"
                                    )}>
                                        {reviewModal.review.stayType} stay
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        Posted on {formatDateTimeSafe(reviewModal.review.createdAt)}
                                    </span>
                                </div>

                                {/* Comment */}
                                {reviewModal.review.comment && (
                                    <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Guest Review</p>
                                        <p className="text-sm text-slate-800 leading-relaxed italic">"{reviewModal.review.comment}"</p>
                                    </div>
                                )}

                                {/* Partner Reply */}
                                {reviewModal.review.partnerReply && (
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Partner Response:</p>
                                        <p className="text-sm text-blue-900 leading-relaxed">"{reviewModal.review.partnerReply}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setCustomerModal({ show: true, customer: reviewModal.review.user });
                                        setReviewModal({ show: false, review: null });
                                        setShowPasswordHash(false);
                                    }}
                                    className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> View Customer
                                </button>
                                <button
                                    onClick={() => handleDeleteReview(reviewModal.review.id)}
                                    disabled={actionLoading === reviewModal.review.id}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                                >
                                    {actionLoading === reviewModal.review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Delete Review
                                </button>
                                <button
                                    onClick={() => setReviewModal({ show: false, review: null })}
                                    className="py-3 px-5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-slate-900 rounded-xl cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[300]"
                            onClick={() => setDeclineConfirmModal({ show: false, requestId: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl z-[310] shadow-2xl border border-slate-200 text-center text-slate-900"
                        >
                            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-3">Confirm Rejection</h3>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed mb-6">
                                Are you sure you want to decline this property application? This action will permanently disable the partner's account.
                            </p>
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={confirmDeclineRequest}
                                    disabled={actionLoading !== null}
                                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <XCircle className="w-4 h-4" />}
                                    Yes, Reject Application
                                </button>
                                <button
                                    onClick={() => setDeclineConfirmModal({ show: false, requestId: null })}
                                    className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-slate-900 rounded-xl cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[400]"
                            onClick={() => setBulkModal({ show: false, type: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl z-[410] shadow-2xl border border-slate-200 text-center text-slate-900"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border",
                                bulkModal.type === 'approve' ? "bg-emerald-950/80 border-emerald-800/50 text-emerald-400" : "bg-red-950/80 border-red-800/50 text-red-400"
                            )}>
                                {bulkModal.type === 'approve' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-3">
                                Confirm Bulk {bulkModal.type === 'approve' ? 'Approval' : 'Rejection'}
                            </h3>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed mb-6">
                                Are you sure you want to {bulkModal.type} <strong className="text-slate-900">{selectedIds.length} property applications</strong> at once? This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={handleBulkAction}
                                    disabled={actionLoading !== null}
                                    className={cn(
                                        "w-full py-3.5 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer",
                                        bulkModal.type === 'approve' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                                    )}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (bulkModal.type === 'approve' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />)}
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
