import { useState, useEffect } from "react";
import { useNavigate as useRouter, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    LayoutDashboard, Calendar, Bed, 
    Layers, DollarSign, LogIn, 
    CreditCard, Star, Users, 
    BarChart3, Bell, Ticket, 
    Settings, LogOut, Menu, X,
    ChevronRight, Hotel, Search,
    TrendingUp, Plus, MessageSquare,
    Clock, Lock, XCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerLayout() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = useLocation().pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'hotel_admin')) {
            router('/partner');
        }
    }, [user, authLoading, router]);

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/partner-dashboard" },
        { id: "bookings", label: "Bookings", icon: Calendar, href: "/partner-dashboard/bookings" },
        { id: "hotel", label: "Property Info", icon: Hotel, href: "/partner-dashboard/hotel" },
        { id: "rooms", label: "Manage Rooms", icon: Bed, href: "/partner-dashboard/rooms" },
        { id: "payments", label: "Earnings", icon: CreditCard, href: "/partner-dashboard/payments" },
        { id: "coupons", label: "Promotions", icon: Ticket, href: "/partner-dashboard/coupons" },
        { id: "messages", label: "Messages", icon: MessageSquare, href: "/partner-dashboard/messages" },
        { id: "reviews", label: "Guest Reviews", icon: Star, href: "/partner-dashboard/reviews" },
        { id: "settings", label: "Settings", icon: Settings, href: "/partner-dashboard/settings" },
    ];

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        router("/partner");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar for Desktop */}
            <aside className={cn(
                "hidden lg:flex bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300",
                isCollapsed ? "w-24" : "w-72"
            )}>
                <div className="p-8 border-b border-slate-50 relative">
                    {!isCollapsed ? (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">
                                GetHotel<span className="text-blue-600 font-black italic">Stays</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Partner Portal</p>
                        </motion.div>
                    ) : null}
                    
                    {/* Toggle Button - Moved Inside */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "absolute w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm z-[60]",
                            isCollapsed ? "left-1/2 -translate-x-1/2 top-6" : "right-6 top-8"
                        )}
                    >
                        <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isPending = user?.role === 'hotel_admin' && (!user.hotel || user.hotel.length === 0);
                        const isRejected = user?.partnerRequestStatus === 'rejected';
                        const isDisabled = isPending || isRejected;
                        
                        return (
                            <Link
                                key={item.id}
                                to={isDisabled ? "#" : item.href}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-bold group transition-all",
                                    isActive 
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                                        : "text-slate-500 hover:text-slate-900",
                                    isCollapsed && "justify-center",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={(e) => {
                                    if (isDisabled) e.preventDefault();
                                }}
                                title={isCollapsed ? item.label : ""}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </div>
                                {isDisabled && !isCollapsed && <Lock className="w-3 h-3 text-slate-300" />}
                                {(isActive && !isCollapsed) && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Container */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300",
                isCollapsed ? "lg:ml-24" : "lg:ml-72"
            )}>
                {/* Top Mobile Header */}
                <header className="lg:hidden h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Hotel className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Financial Management</h1>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2.5 bg-slate-50 rounded-lg text-slate-600 border border-slate-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden">
                        <div className="w-80 h-full bg-white flex flex-col animate-slide-right">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                        <Hotel className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-slate-900 uppercase tracking-tight">Menu</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.id}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-bold transition-all",
                                                isActive ? "bg-blue-600 text-white" : "text-slate-500"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-6 border-t border-slate-100">
                                <button onClick={() => { setShowLogoutConfirm(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 text-red-600 font-bold text-sm">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6 lg:p-10">
                    {/* Pending Approval Overlay/View */}
                    {user?.partnerRequestStatus === 'rejected' ? (
                        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 -mt-20 px-8">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
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

                            <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl max-w-md w-full">
                                <p className="text-[13px] text-red-700 font-black uppercase tracking-widest leading-relaxed">
                                    This account has been permanently disabled. You will no longer be able to access the partner portal.
                                </p>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="max-w-md w-full py-5 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
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
                                    <div className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-3xl text-sm font-black uppercase tracking-[0.2em] flex items-center gap-4 border border-emerald-100/50 shadow-sm shadow-emerald-50">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                                        Review in Progress
                                    </div>
                                    <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">
                                        You will receive an email once your account is fully enabled.
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>

                {/* Mobile Sticky Action (Optional - useful for mobile-first) */}
                <div className="lg:hidden fixed bottom-6 right-6 z-40">
                    <button className="w-14 h-14 bg-blue-600 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
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
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200]"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl z-[210] overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <LogOut className="w-8 h-8 text-red-600" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-red-500/10 rounded-full blur-xl"
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
                                        className="flex-1 py-4 bg-red-600 text-white rounded-lg font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Yes, Logout
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-lg font-black hover:bg-slate-200 transition-all active:scale-95"
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
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
                @keyframes slide-right {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .shadow-glow {
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                }
            `}</style>
        </div>
    );
}



