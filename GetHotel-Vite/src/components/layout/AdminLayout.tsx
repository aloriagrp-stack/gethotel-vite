import { useState, useEffect } from "react";
import { useNavigate as useRouter, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Hotel, Users,
    BarChart3, Settings, LogOut,
    Bell, Search, Plus, Clock,
    CreditCard, Loader2, Calendar, AlertCircle, LayoutTemplate, SlidersHorizontal, Star, RefreshCw, LayoutGrid, Globe, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const location = useLocation();
    const pathname = location.pathname;
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'super_admin')) {
            router('/.controlhub');
        }
    }, [user, authLoading, router]);

    const navItems = [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin/super" },
        { id: "requests", label: "Partner Requests", icon: Clock, href: "/admin/super/requests" },
        { id: "controlhub", label: "Manager", icon: SlidersHorizontal, href: "/admin/super/controlhub" },
        { id: "hotels", label: "Hotels", icon: Hotel, href: "/admin/super?tab=hotels" },
        { id: "otasync", label: "OTA Room Sync", icon: RefreshCw, href: "/admin/super/otasync" },
        { id: "multi-room", label: "Multi Room Setup", icon: LayoutGrid, href: "/admin/super/multi-room" },
        { id: "ai-copilot", label: "AI Room Onboarding", icon: Sparkles, href: "/admin/super/ai-copilot" },
        { id: "bookings", label: "All Bookings", icon: Calendar, href: "/admin/super/bookings" },
        { id: "reviews", label: "Global Reviews", icon: Star, href: "/admin/super/reviews" },
        { id: "users", label: "Users", icon: Users, href: "/admin/super?tab=users" },
        { id: "addPartner", label: "Add Partner", icon: Plus, href: "/admin/super?tab=addPartner" },
        { id: "analytics", label: "Stats", icon: BarChart3, href: "/admin/super/stats" },
        { id: "finance", label: "Financial Hub", icon: CreditCard, href: "/admin/super/finance" },
        { id: "homepage", label: "Homepage Editor", icon: LayoutTemplate, href: "/admin/super/homepage" },
        { id: "disputes", label: "Disputes", icon: AlertCircle, href: "/admin/super/disputes" },
        { id: "notifications", label: "Notifications", icon: Bell, href: "/admin/super/notifications" },
        { id: "settings", label: "Settings", icon: Settings, href: "/admin/super/settings" },
    ];

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        router("/.controlhub");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans admin-portal-wrapper">

            {/* Sidebar - Sharp Edges */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight uppercase">
                        Admin<span className="text-slate-400">Portal</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const searchParams = new URLSearchParams(location.search);
                        const currentTab = searchParams.get("tab");
                        let isActive = false;
                        if (item.href.includes("?tab=")) {
                            const itemTab = new URLSearchParams(item.href.split("?")[1]).get("tab");
                            isActive = pathname === "/admin/super" && currentTab === itemTab;
                        } else if (item.href === "/admin/super") {
                            isActive = pathname === "/admin/super" && (!currentTab || currentTab === "overview");
                        } else {
                            isActive = pathname === item.href;
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => router(item.href)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-none",
                                    isActive
                                        ? "bg-slate-800 text-white border-l-4 border-brand-500"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen min-w-0 overflow-x-hidden">
                <Outlet />
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[4px] z-[210] overflow-hidden shadow-2xl border border-slate-800"
                        >
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LogOut className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">
                                    Confirm <span className="text-red-500">Sign Out</span>
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mb-8">
                                    Are you sure you want to exit the Administrative Portal?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                                    >
                                        Yes, Exit
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}



