'use client';
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
    LayoutDashboard, Calendar, Bed, 
    Layers, DollarSign, LogIn, 
    CreditCard, Star, Users, 
    BarChart3, Bell, Ticket, 
    Settings, LogOut, Menu, X,
    ChevronRight, Hotel, Search,
    TrendingUp, Plus, MessageSquare,
    Clock, Lock, XCircle, CheckCircle2, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerLayout({ children }: { children?: React.ReactNode }) {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || (typeof window !== 'undefined' ? window.location.pathname : '/partner-dashboard');
    const currentPath = (pathname || '').replace(/\/+$/, '') || '/partner-dashboard';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auth Protection
    useEffect(() => {
        if (!authLoading) {
            // Retrieve activeHotelId from URL search params if present
            const params = new URLSearchParams(window.location.search);
            const queryHotelId = params.get('activeHotelId');
            if (queryHotelId) {
                sessionStorage.setItem('activeHotelId', queryHotelId);
                localStorage.setItem('activeHotelId', queryHotelId);
            }

            const activeHotelId = sessionStorage.getItem('activeHotelId') || localStorage.getItem('activeHotelId');

            if (!user || (user.role !== 'hotel_admin' && user.role !== 'super_admin')) {
                router.push('/partner');
            } else if (!activeHotelId) {
                if (user.hotel && user.hotel.length === 1) {
                    const singleId = String(user.hotel[0].id);
                    sessionStorage.setItem('activeHotelId', singleId);
                    localStorage.setItem('activeHotelId', singleId);
                } else if (user.role === 'hotel_admin' && (!user.hotel || user.hotel.length === 0)) {
                    // Pending approval / no property view
                } else if (user.role === 'hotel_admin') {
                    router.push('/partner-select');
                }
            }
        }
    }, [user, authLoading, router]);

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/partner-dashboard" },
        { id: "bookings", label: "Bookings", icon: Calendar, href: "/partner-dashboard/bookings" },
        { id: "hotel", label: "Property Info", icon: Hotel, href: "/partner-dashboard/hotel" },
        { id: "rooms", label: "Manage Rooms", icon: Bed, href: "/partner-dashboard/rooms" },
        { id: "inventory", label: "Rates & Inventory", icon: Layers, href: "/partner-dashboard/inventory" },
        { id: "payments", label: "Earnings", icon: CreditCard, href: "/partner-dashboard/payments" },
        { id: "coupons", label: "Promotions", icon: Ticket, href: "/partner-dashboard/coupons" },
        { id: "messages", label: "Messages", icon: MessageSquare, href: "/partner-dashboard/messages" },
        { id: "reviews", label: "Guest Reviews", icon: Star, href: "/partner-dashboard/reviews" },
        { id: "channel", label: "Channel Sync", icon: Globe, href: "/partner-dashboard/channel" },
        { id: "settings", label: "Settings", icon: Settings, href: "/partner-dashboard/settings" },
        { id: "switch", label: "Switch Property", icon: ChevronRight, href: "/partner-select" },
    ];

    const activeItem = navItems.find(item => currentPath === item.href.replace(/\/+$/, '')) || navItems[0];

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        router.push("/partner");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#FAF9F6] text-stone-900 partner-portal-wrapper">
            {/* Sidebar for Desktop */}
            <aside className={cn(
                "hidden lg:flex bg-white border-r border-stone-200/80 flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300",
                isCollapsed ? "w-24" : "w-72"
            )}>
                <div className="p-8 border-b border-stone-100 relative">
                    {!isCollapsed ? (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-xl font-black text-stone-950 tracking-tight">
                                GetHotel<span className="text-stone-900 font-extrabold italic">Stays</span>
                            </h1>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-0.5">Partner Portal</p>
                        </motion.div>
                    ) : null}
                    
                    {/* Toggle Button - Moved Inside */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "absolute w-7 h-7 bg-stone-50 border border-stone-200 rounded-none flex items-center justify-center text-stone-400 hover:text-stone-950 hover:bg-white transition-all shadow-none z-[60] cursor-pointer",
                            isCollapsed ? "left-1/2 -translate-x-1/2 top-6" : "right-6 top-8"
                        )}
                    >
                        <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const itemCleanHref = item.href.replace(/\/+$/, '');
                        const isActive = currentPath === itemCleanHref || (itemCleanHref === '/partner-dashboard' && (currentPath === '/partner-dashboard' || currentPath === '/partner-dashboard/dashboard'));
                        const isPending = user?.role === 'hotel_admin' && (!user.hotel || user.hotel.length === 0);
                        const isRejected = user?.partnerRequestStatus === 'rejected';
                        const isDisabled = isPending || isRejected;
                        
                        return (
                            <Link
                                key={item.id}
                                href={isDisabled ? "#" : item.href}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-none text-sm font-bold group transition-all",
                                    isActive 
                                        ? "bg-stone-100 text-stone-950 font-black border-l-2 border-stone-900" 
                                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-50/80",
                                    isCollapsed && "justify-center",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={(e) => {
                                    if (isDisabled) e.preventDefault();
                                }}
                                title={isCollapsed ? item.label : ""}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-stone-950" : "text-stone-400 group-hover:text-stone-900")} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </div>
                                {isDisabled && !isCollapsed && <Lock className="w-3 h-3 text-stone-300" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Container */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0",
                isCollapsed ? "lg:ml-24" : "lg:ml-72"
            )}>
                {/* Top Mobile Header */}
                <header className="lg:hidden h-20 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-900 rounded-none flex items-center justify-center text-white">
                            <Hotel className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-wider text-stone-950">
                                {activeItem ? activeItem.label : "Partner Portal"}
                            </h1>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Partner Dashboard</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2.5 bg-stone-50 rounded-none text-stone-600 border border-stone-200 cursor-pointer"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-[60] lg:hidden"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="w-80 h-full bg-white flex flex-col animate-slide-right"
                        >
                            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-stone-900 rounded-none flex items-center justify-center text-white">
                                        <Hotel className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-stone-950 uppercase tracking-tight">Menu</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 cursor-pointer">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const itemCleanHref = item.href.replace(/\/+$/, '');
                                    const isMobileActive = currentPath === itemCleanHref || (itemCleanHref === '/partner-dashboard' && (currentPath === '/partner-dashboard' || currentPath === '/partner-dashboard/dashboard'));
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3.5 rounded-none text-sm font-bold transition-all",
                                                isMobileActive ? "bg-stone-100 text-stone-950 font-black border-l-2 border-stone-900" : "text-stone-500 hover:bg-stone-50"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-6 border-t border-stone-100">
                                <button onClick={() => { setShowLogoutConfirm(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 text-red-600 font-bold text-sm cursor-pointer">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6 lg:p-10 min-w-0 overflow-x-hidden">
                    {/* Pending Approval Overlay/View */}
                    {user?.partnerRequestStatus === 'rejected' ? (
                        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 -mt-20 px-8">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-24 h-24 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto mb-6"
                            >
                                <XCircle className="w-12 h-12" />
                            </motion.div>
                            
                            <div className="max-w-2xl space-y-6">
                                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                                    Application <span className="text-red-600">Rejected</span>
                                </h2>
                                <p className="text-slate-500 font-bold text-lg md:text-xl leading-relaxed">
                                    We regret to inform you that your application to become a hotel partner has been declined by our administration.
                                </p>
                            </div>

                            <div className="p-6 bg-red-50/50 border border-red-100 rounded-none max-w-md w-full">
                                <p className="text-[13px] text-red-700 font-black uppercase tracking-widest leading-relaxed">
                                    This account has been permanently disabled. You will no longer be able to access the partner portal.
                                </p>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="max-w-md w-full py-5 bg-slate-900 text-white rounded-none font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Exit Portal Permanently
                            </button>
                        </div>
                    ) : user?.role === 'hotel_admin' && (!user.hotel || user.hotel.length === 0) ? (
                        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 -mt-20">
                            <div className="max-w-2xl space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                                        Approval <span className="text-blue-600">Pending</span>
                                    </h2>
                                </motion.div>
                                
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                    className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed px-4"
                                >
                                    Your account is currently under review by our administration team. 
                                    We are verifying your property details to ensure the best experience for our guests.
                                </motion.p>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                    className="pt-10 flex flex-col items-center gap-6"
                                >
                                    <div className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-none text-sm font-black uppercase tracking-[0.2em] flex items-center gap-4 border border-emerald-100/50 shadow-sm shadow-emerald-50">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-none animate-ping" />
                                        Review in Progress
                                    </div>
                                    <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">
                                        You will receive an email once your account is fully enabled.
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </main>

                {/* Mobile Sticky Action (Optional - useful for mobile-first) */}
                <div className="lg:hidden fixed bottom-6 right-6 z-40">
                    <button className="w-14 h-14 bg-blue-600 rounded-none text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                        <Plus className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200]"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-none z-[210] overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-none flex items-center justify-center mx-auto mb-6 relative">
                                    <LogOut className="w-8 h-8 text-red-600" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-red-500/10 rounded-none blur-xl"
                                    />
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">
                                    Ready to <span className="text-red-600 italic">Leave?</span>
                                </h3>
                                <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                                    Are you sure you want to logout from Partner Portal?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-none font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Yes, Logout
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-none font-black hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        No, Stay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E7E5E4;
                    border-radius: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D6D3D1;
                }
                @keyframes slide-right {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Off-White Minimalism Global Overrides */
                .partner-portal-wrapper {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                }
                .partner-portal-wrapper h1, 
                .partner-portal-wrapper h2, 
                .partner-portal-wrapper h3, 
                .partner-portal-wrapper h4, 
                .partner-portal-wrapper h5 {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    letter-spacing: -0.03em !important;
                    color: #1C1917 !important;
                }

                /* Overriding typical panel cards to premium, border-only minimalist panels */
                .partner-portal-wrapper .bg-white {
                    background-color: #FFFFFF !important;
                    border: 1px solid #E7E5E4 !important;
                    border-radius: 0px !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.01) !important;
                }

                /* Neutralizing colorful cards and stats boxes */
                .partner-portal-wrapper .shadow-premium,
                .partner-portal-wrapper .shadow-sm {
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.01) !important;
                }

                /* Solid black / dark stone minimalist primary action buttons */
                .partner-portal-wrapper button.bg-blue-600,
                .partner-portal-wrapper a.bg-blue-600,
                .partner-portal-wrapper .bg-blue-600:not(.nav-active-dot) {
                    background-color: #1C1917 !important;
                    color: #FFFFFF !important;
                    border-radius: 0px !important;
                    border: 1px solid #1C1917 !important;
                    box-shadow: none !important;
                    transition: all 0.2s ease !important;
                    cursor: pointer;
                }
                .partner-portal-wrapper button.bg-blue-600:hover,
                .partner-portal-wrapper a.bg-blue-600:hover {
                    background-color: #2E2A27 !important;
                    border-color: #2E2A27 !important;
                }

                /* Text colors - Override main branding blue with dark stone for text links */
                .partner-portal-wrapper .text-blue-600 {
                    color: #1C1917 !important;
                }
                .partner-portal-wrapper .hover\:text-blue-600:hover {
                    color: #000000 !important;
                }

                /* Muted, neutral background for stats icons instead of saturated blue/green/amber/purple */
                .partner-portal-wrapper .bg-blue-50,
                .partner-portal-wrapper .bg-emerald-50,
                .partner-portal-wrapper .bg-amber-50,
                .partner-portal-wrapper .bg-purple-50 {
                    background-color: #F5F5F4 !important;
                    color: #44403C !important;
                    border-radius: 0px !important;
                }
                .partner-portal-wrapper .text-blue-600,
                .partner-portal-wrapper .text-emerald-600,
                .partner-portal-wrapper .text-amber-600,
                .partner-portal-wrapper .text-purple-600 {
                    color: #44403C !important;
                }

                /* Inputs & selections styling override */
                .partner-portal-wrapper input,
                .partner-portal-wrapper select,
                .partner-portal-wrapper textarea {
                    background-color: #FAF9F6 !important;
                    border: 1px solid #E7E5E4 !important;
                    border-radius: 0px !important;
                    color: #1C1917 !important;
                    padding: 8px 12px !important;
                    font-size: 13px !important;
                }
                .partner-portal-wrapper input:focus,
                .partner-portal-wrapper select:focus,
                .partner-portal-wrapper textarea:focus {
                    border-color: #1C1917 !important;
                    outline: none !important;
                    box-shadow: 0 0 0 1px #1C1917 !important;
                }

                /* Muted secondary buttons */
                .partner-portal-wrapper .border-slate-200,
                .partner-portal-wrapper .border-slate-100 {
                    border-color: #E7E5E4 !important;
                }

                /* Clean, flat tables override */
                .partner-portal-wrapper table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                }
                .partner-portal-wrapper th {
                    background-color: #FAF9F6 !important;
                    color: #57534E !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.08em !important;
                    text-transform: uppercase !important;
                    border-bottom: 2px solid #E7E5E4 !important;
                    padding: 14px 18px !important;
                    text-align: left !important;
                }
                .partner-portal-wrapper td {
                    border-bottom: 1px solid #FAF9F6 !important;
                    padding: 14px 18px !important;
                    background-color: #FFFFFF !important;
                    color: #44403C !important;
                    font-size: 13px !important;
                }
                .partner-portal-wrapper tr:hover td {
                    background-color: #FAF9F6 !important;
                }
            `}</style>
        </div>
    );
}
