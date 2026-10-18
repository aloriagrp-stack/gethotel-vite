'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate as useRouter, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Hotel, Users,
    BarChart3, Settings, LogOut,
    Search, Clock,
    Calendar, LayoutTemplate, SlidersHorizontal, Star, Globe, Sparkles, Bot, Palmtree, Download, MapPin,
    ChevronLeft, ChevronRight, Menu, X, Percent, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const location = useLocation();
    const pathname = location.pathname;
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Lock body background to clean light grey canvas for admin portal
    useEffect(() => {
        const origHtml = document.documentElement.style.backgroundColor;
        const origBody = document.body.style.backgroundColor;
        document.documentElement.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundColor = '#f8fafc';
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
        const targetUrl = tabId === 'overview' ? '/controlhub' : `/controlhub?tab=${tabId}`;
        router(targetUrl);
        setMobileOpen(false);
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

    const navSections = [
        {
            title: "Overview",
            items: [
                { id: "overview", label: "Dashboard", icon: LayoutDashboard, tab: "overview" },
                { id: "controlhub", label: "Properties Hub", icon: SlidersHorizontal, tab: "controlhub" },
            ]
        },
        {
            title: "Operations",
            items: [
                { id: "hotels", label: "Properties", icon: Hotel, tab: "hotels" },
                { id: "bookings", label: "Bookings", icon: Calendar, tab: "bookings" },
                { id: "requests", label: "Partner Requests", icon: Clock, tab: "requests" },
                { id: "users", label: "Users & Customers", icon: Users, tab: "users" },
                { id: "reviews", label: "Global Reviews", icon: Star, tab: "reviews" },
            ]
        },
        {
            title: "Content & Growth",
            items: [
                { id: "destinations", label: "Destination Cards", icon: MapPin, tab: "destinations" },
                { id: "tour-packages", label: "Tour Packages", icon: Palmtree, tab: "tour-packages" },
                { id: "promotions", label: "Promotions & Coupons", icon: Percent, tab: "promotions" },
                { id: "homepage", label: "Homepage Editor", icon: LayoutTemplate, tab: "homepage" },
            ]
        },
        {
            title: "Intelligence & AI",
            items: [
                { id: "ai-copilot", label: "AI Room Onboarding", icon: Sparkles, tab: "ai-copilot" },
                { id: "ai-chats", label: "AI Chat Analytics", icon: Bot, tab: "ai-chats" },
                { id: "hotel-importer", label: "Hotel Importer", icon: Download, tab: "hotel-importer" },
                { id: "analytics", label: "Stats & Analytics", icon: BarChart3, tab: "stats" },
                { id: "destination-analytics", label: "Destinations Intel", icon: Globe, tab: "destination-analytics" },
                { id: "delhi-seo", label: "Delhi SEO", icon: Search, tab: "delhi-seo" },
            ]
        },
        {
            title: "Finance & System",
            items: [
                { id: "finance", label: "Financial Overview", icon: BarChart3, tab: "finance" },
                { id: "notifications", label: "Activity & Alerts", icon: Bell, tab: "notifications" },
                { id: "settings", label: "Platform Settings", icon: Settings, tab: "settings" },
            ]
        }
    ];

    const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

    const handleLogout = async () => {
        try {
            await logout();
            router('/controlhub');
        } catch (e) {
            console.error(e);
            router('/controlhub');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col bg-white border-r border-slate-200/90 shrink-0 transition-all duration-200 sticky top-0 h-screen z-30",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                {/* Brand Header */}
                <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                CH
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold tracking-tight text-slate-900 truncate flex items-center gap-1.5">
                                    ControlHub
                                </h1>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Super Admin</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm mx-auto">
                            CH
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={cn(
                            "w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer",
                            sidebarCollapsed && "mx-auto mt-2"
                        )}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {!sidebarCollapsed && (
                                <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    {section.title}
                                </p>
                            )}
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentTab === item.tab;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleNavClick(item.tab)}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                                            sidebarCollapsed && "justify-center px-0",
                                            isActive
                                                ? "bg-slate-900 text-white shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        )}
                                        title={sidebarCollapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User / Footer */}
                <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                    {(user?.name || "SA").slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-900 truncate">{user?.name || "Super Admin"}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.email || "admin@gethotelstays.com"}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(true)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        CH
                    </div>
                    <span className="font-semibold text-sm text-slate-900">ControlHub</span>
                </div>
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
                    <div className="w-72 bg-white h-full flex flex-col p-4 shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                            <span className="font-semibold text-sm text-slate-900">ControlHub Menu</span>
                            <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-500 hover:text-slate-900">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto space-y-4">
                            {navSections.map(section => (
                                <div key={section.title} className="space-y-1">
                                    <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        {section.title}
                                    </p>
                                    {section.items.map(item => {
                                        const Icon = item.icon;
                                        const isActive = currentTab === item.tab;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleNavClick(item.tab)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left",
                                                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>
                        <div className="pt-4 border-t border-slate-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                    <div className="flex-1" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-[#f8fafc] md:pt-0 pt-14 flex flex-col">
                <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-lg text-center space-y-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Sign out of ControlHub?</h3>
                            <p className="text-xs text-slate-500 mt-1">You will need to re-authenticate with your security PIN to log back in.</p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex-1 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
