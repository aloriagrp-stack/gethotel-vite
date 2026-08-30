'use client';
import { useState, useEffect, useRef, Suspense } from "react";
import { useNavigate as useRouter, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Hotel, Users,
    BarChart3, Settings, LogOut,
    Bell, Search, Plus, Clock,
    CreditCard, Loader2, Calendar, AlertCircle, LayoutTemplate, SlidersHorizontal, Star, RefreshCw, LayoutGrid, Globe, Sparkles, Bot, Palmtree, Download, MapPin,
    ChevronLeft, ChevronRight, Menu, X, Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const location = useLocation();
    const pathname = location.pathname;
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Lock body background to pure dark for admin portal
    useEffect(() => {
        const origHtml = document.documentElement.style.backgroundColor;
        const origBody = document.body.style.backgroundColor;
        document.documentElement.style.backgroundColor = '#050505';
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.documentElement.style.backgroundColor = origHtml;
            document.body.style.backgroundColor = origBody;
        };
    }, []);

    // Maintain sidebar nav scroll position
    const sidebarNavRef = useRef<HTMLElement>(null);
    const scrollPosRef = useRef(0);

    const handleNavClick = (tabId: string) => {
        if (sidebarNavRef.current) {
            scrollPosRef.current = sidebarNavRef.current.scrollTop;
        }
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
        const targetUrl = tabId === 'overview' ? currentPath : `${currentPath}?tab=${tabId}`;
        router(targetUrl);
    };

    useEffect(() => {
        if (sidebarNavRef.current && scrollPosRef.current > 0) {
            sidebarNavRef.current.scrollTop = scrollPosRef.current;
        }
    }, [pathname, location.search]);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'super_admin')) {
            router('/controlhub');
        }
    }, [user, authLoading, router]);

    const navItems = [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard, tab: "overview" },
        { id: "hotel-importer", label: "Hotel Importer (Agent)", icon: Download, tab: "hotel-importer" },
        { id: "tour-packages", label: "Tour Packages Manager", icon: Palmtree, tab: "tour-packages" },
        { id: "destinations", label: "Destinations Cards Manager", icon: MapPin, tab: "destinations" },
        { id: "requests", label: "Partner Requests", icon: Clock, tab: "requests" },
        { id: "controlhub", label: "Manager", icon: SlidersHorizontal, tab: "controlhub" },
        { id: "ai-chats", label: "AI Chat Analytics", icon: Bot, tab: "ai-chats" },
        { id: "hotels", label: "Hotels", icon: Hotel, tab: "hotels" },
        { id: "promotions", label: "Promotions & Coupons", icon: Percent, tab: "promotions" },
        { id: "multi-room", label: "Multi Room Setup", icon: LayoutGrid, tab: "multi-room" },
        { id: "ai-copilot", label: "AI Room Onboarding", icon: Sparkles, tab: "ai-copilot" },
        { id: "bookings", label: "All Bookings", icon: Calendar, tab: "bookings" },
        { id: "reviews", label: "Global Reviews", icon: Star, tab: "reviews" },
        { id: "users", label: "Users", icon: Users, tab: "users" },
        { id: "addPartner", label: "Add Partner", icon: Plus, tab: "addPartner" },
        { id: "destination-analytics", label: "Top Destinations Analytics", icon: Globe, tab: "destination-analytics" },
        { id: "delhi-seo", label: "Delhi SEO Dashboard", icon: Search, tab: "delhi-seo" },
        { id: "analytics", label: "Stats", icon: BarChart3, tab: "stats" },
        { id: "finance", label: "Financial Hub", icon: CreditCard, tab: "finance" },
        { id: "homepage", label: "Homepage Editor", icon: LayoutTemplate, tab: "homepage" },
        { id: "disputes", label: "Disputes", icon: AlertCircle, tab: "disputes" },
        { id: "notifications", label: "Notifications", icon: Bell, tab: "notifications" },
        { id: "settings", label: "Settings", icon: Settings, tab: "settings" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get("tab") || "overview";
    const activeItem = navItems.find(item => item.tab === currentTab) || navItems[0];

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        router("/controlhub");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] font-sans text-neutral-100 admin-portal-wrapper">

            {/* Sidebar for Desktop - Skeuomorphic Pure Black */}
            <aside className={cn(
                "hidden lg:flex bg-[#070707] text-neutral-100 flex-col fixed inset-y-0 left-0 z-50 border-r border-[#1a1a1a] transition-all duration-200 shadow-[2px_0_15px_rgba(0,0,0,0.9)]",
                sidebarCollapsed ? "w-16" : "w-72"
            )}>
                <div className={cn(
                    "p-6 border-b border-[#1a1a1a] flex items-center bg-gradient-to-b from-[#0e0e0e] to-[#070707]",
                    sidebarCollapsed ? "justify-center px-2 py-6" : "justify-between"
                )}>
                    {!sidebarCollapsed && (
                        <h1 className="text-xl font-black tracking-wide select-none flex items-center gap-1.5 text-white font-sans">
                            Aloria's <span className="text-neutral-500 font-light text-xs uppercase tracking-widest">Admin</span>
                        </h1>
                    )}
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 bg-[#141414] hover:bg-[#1f1f1f] rounded-lg text-neutral-400 hover:text-white transition-all flex items-center justify-center border border-[#262626] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.6)] cursor-pointer"
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                <nav ref={sidebarNavRef} className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.tab === currentTab;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.tab)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer relative",
                                    isActive
                                        ? "bg-[#1f1f1f] text-white border border-[#333333] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-extrabold"
                                        : "text-neutral-400 hover:bg-[#121212] hover:text-white hover:border hover:border-[#1f1f1f]",
                                    sidebarCollapsed ? "justify-center px-2" : "justify-start"
                                )}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-neutral-500")} />
                                {!sidebarCollapsed && (
                                    <span className="truncate flex items-center justify-between w-full">
                                        <span>{item.label}</span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#1a1a1a] bg-[#070707]">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-neutral-400 hover:text-red-400 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border border-[#222222] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] cursor-pointer",
                            sidebarCollapsed ? "justify-center px-2" : "justify-start"
                        )}
                        title={sidebarCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Pure Black Background */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen bg-[#050505] text-neutral-100 transition-all duration-200 min-w-0",
                sidebarCollapsed ? "lg:ml-16" : "lg:ml-72"
            )}>
                {/* Top Mobile Header */}
                <header className="lg:hidden h-20 bg-[#0a0a0a] text-white px-6 flex items-center justify-between sticky top-0 z-40 border-b border-[#1f1f1f]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#161616] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-white shadow-inner">
                            {activeItem ? <activeItem.icon className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
                        </div>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-wider text-white">
                                {activeItem ? activeItem.label : "Admin Portal"}
                            </h1>
                            <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest">Super Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2.5 bg-[#141414] text-white rounded-xl border border-[#262626] hover:bg-[#1f1f1f] transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] lg:hidden"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="w-72 h-full bg-slate-900 text-white flex flex-col animate-slide-right border-r border-slate-850"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <h1 className="text-xl font-bold tracking-tight uppercase select-none">
                                    Admin<span className="text-slate-400">Portal</span>
                                </h1>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.tab === currentTab;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                handleNavClick(item.tab);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                                                isActive
                                                    ? "bg-[#181818] text-white border border-[#333333] border-l-4 border-l-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.18)]"
                                                    : "text-neutral-400 hover:bg-[#121212] hover:text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-400" : "text-neutral-500")} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                                        </button>
                                    );
                                })}
                            </nav>
                            <div className="p-4 border-t border-slate-800">
                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 min-w-0 overflow-x-hidden bg-[#050505]">
                    <Suspense fallback={
                        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white">
                            <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
                        </div>
                    }>
                        {children || <Outlet />}
                    </Suspense>
                </main>
            </div>

            <style>{`
                @keyframes slide-right {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>

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
