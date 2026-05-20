

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
    Menu, X, MapPin, User, Heart, Bell, Hotel, Globe,
    LogOut, Settings, ClipboardList, ChevronDown, UserRound, CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navTranslations: Record<string, Record<string, string>> = {
    en: { home: "Home", hotels: "Hotels", bookings: "My Bookings" },
    hi: { home: "होम", hotels: "होटल", bookings: "मेरी बुकिंग" },
    de: { home: "Startseite", hotels: "Hotels", bookings: "Buchungen" },
    ja: { home: "ホーム", hotels: "ホテル", bookings: "予約" },
    fr: { home: "Accueil", hotels: "Hôtels", bookings: "Réservations" },
    es: { home: "Inicio", hotels: "Hoteles", bookings: "Mis Reservas" },
    zh: { home: "首页", hotels: "酒店", bookings: "我的预订" },
    ar: { home: "الرئيسية", hotels: "الفنادق", bookings: "حجوزاتي" },
    ru: { home: "Главная", hotels: "Отели", bookings: "Бронирования" },
    pt: { home: "Início", hotels: "Hotéis", bookings: "Reservas" }
};

export default function Navbar() {
    const [langCode, setLangCode] = useState("en");

    useEffect(() => {
        const saved = localStorage.getItem('user-language');
        if (saved) setLangCode(saved);

        const handleSync = () => {
            const current = localStorage.getItem('user-language');
            if (current) setLangCode(current);
        };
        window.addEventListener('storage', handleSync);
        window.addEventListener('languageChanged', handleSync);

        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('languageChanged', handleSync);
        };
    }, []);

    const t = (key: string) => navTranslations[langCode]?.[key] || navTranslations['en'][key] || key;

    const navLinks = [
        { href: "/", label: t('home') },
        { href: "/hotels", label: t('hotels') },
        { href: "/my-bookings", label: t('bookings') },
    ];
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileMobileOpen, setProfileMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { count: wishlistCount } = useWishlist();
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLoginToast, setShowLoginToast] = useState(false);

    // Auth warning modal state
    const [actionPopup, setActionPopup] = useState<{isOpen: boolean, message: string}>({ isOpen: false, message: "" });

    // Lock body scroll when mobile menus or auth warning modal are open
    useEffect(() => {
        if (mobileOpen || profileMobileOpen || actionPopup.isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen, profileMobileOpen, actionPopup.isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        // Check for login flag - use a session-based check to prevent repeats on refresh
        const justLoggedIn = localStorage.getItem('just_logged_in');
        if (justLoggedIn === 'true') {
            // Remove it immediately so it can't be triggered again
            localStorage.removeItem('just_logged_in');

            setShowLoginToast(true);

            // Birthday Dash (Confetti)
            const end = Date.now() + 2000;
            const colors = ["#2563eb", "#059669", "#fbbf24", "#ef4444"];
            const isMobile = window.innerWidth < 768;

            (function frame() {
                confetti({
                    particleCount: isMobile ? 1 : 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: isMobile ? 1 : 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();

            // Auto hide after 5 seconds
            const timer = setTimeout(() => {
                setShowLoginToast(false);
            }, 5000);

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                clearTimeout(timer);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        setDropdownOpen(false);
    };

    return (
        <header className="sticky top-0 left-0 right-0 z-[100] bg-white border-b border-slate-100 py-3 md:py-4">
            <div className="w-full max-w-none mx-auto px-3 md:px-8 flex items-center justify-between">
                {/* Logo Section */}
                <Link
                    to="/"
                    className="relative z-[110] flex items-center gap-2 outline-none border-none group"
                >
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-950 italic group-hover:text-brand-600 transition-colors">
                        GetHotelStays<span className="text-brand-600 not-italic">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className={cn("hidden items-center gap-10 absolute left-1/2 -translate-x-1/2", pathname !== "/list-property" && "md:flex")}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            onClick={(e) => {
                                if (link.href === "/my-bookings" && !user) {
                                    e.preventDefault();
                                    setActionPopup({ isOpen: true, message: "Please log in first to view your bookings." });
                                }
                            }}
                            className={cn(
                                "text-sm font-bold transition-all duration-300 relative group/nav",
                                pathname === link.href
                                    ? "text-brand-600"
                                    : "text-slate-600 hover:text-brand-600"
                            )}
                        >
                            {link.label}
                            <div 
                                className={cn(
                                    "absolute -bottom-1 left-0 h-0.5 bg-brand-600 rounded-full transition-all duration-300",
                                    pathname === link.href ? "w-full" : "w-0 group-hover/nav:w-full"
                                )}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className={cn("hidden items-center gap-4 shrink-0 md:flex")}>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all">
                        <Bell className="w-5 h-5" />
                    </button>

                    <Link
                        to="/wishlist"
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <Heart className="w-5 h-5" />
                        {wishlistCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                                {wishlistCount > 9 ? "9+" : wishlistCount}
                            </span>
                        )}
                    </Link>

                    <div className="w-px h-6 mx-1 bg-slate-200" />

                    {!user && (
                        <Link
                            to="/list-property"
                            className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sky-200 transition-all hover:scale-105"
                        >
                            <Hotel className="w-3.5 h-3.5" />
                            List Your Property
                        </Link>
                    )}

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => {
                                if (user) {
                                    setDropdownOpen(!dropdownOpen);
                                } else {
                                    window.location.href = "/login";
                                }
                            }}
                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-950 text-white rounded-full hover:bg-slate-900 transition-all"
                        >
                            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="text-xs font-black tracking-tight">
                                {user ? (user.name?.split(' ')[0] || 'Profile') : 'Login'}
                            </span>
                            {user && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", dropdownOpen && "rotate-180")} />}
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && user && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-60 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden py-2"
                                >
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-slate-700 hover:bg-slate-50 transition-all border-b border-slate-50">
                                        <UserRound className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-bold">My Profile</span>
                                    </Link>
                                    <Link to="/list-property" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-slate-700 hover:bg-slate-50 transition-all border-b border-slate-50">
                                        <Hotel className="w-5 h-5 text-sky-600" />
                                        <span className="text-sm font-bold">List Your Property</span>
                                    </Link>
                                    <button onClick={() => { setShowLogoutConfirm(true); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3.5 text-red-600 hover:bg-red-50 transition-all">
                                        <LogOut className="w-5 h-5" />
                                        <span className="text-sm font-bold">Log Out</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Actions (Profile + Hamburger) */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (user) {
                                setProfileMobileOpen(true);
                            } else {
                                window.location.href = "/login";
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 border border-slate-200"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-lg font-black text-slate-400 uppercase italic">
                                {user ? (user.name || "U").charAt(0) : <User className="w-5 h-5" />}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 text-white"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[110]"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[120] shadow-2xl px-6 pt-12 pb-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8 gap-4">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                                                    {user.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-950 leading-tight">Hello, {user.name?.split(' ')[0]}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Premium Member</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-left">
                                        <h3 className="text-xl font-black text-slate-950 leading-tight">Welcome!</h3>
                                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Sign in to unlock exclusive deals.</p>
                                    </div>
                                )}
                                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {user ? (
                                    <div className="space-y-6 pt-2">
                                        <nav className="space-y-1">
                                            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                                <MapPin className="w-5 h-5 text-brand-600" /> Home
                                            </Link>

                                            <Link to="/hotels" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                                <Hotel className="w-5 h-5 text-brand-600" /> Hotels
                                            </Link>
                                            <Link to="/list-property" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                                <Hotel className="w-5 h-5 text-sky-600" /> List Your Property
                                            </Link>
                                        </nav>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <nav className="space-y-1">
                                            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold">
                                                <MapPin className="w-5 h-5 text-brand-600" /> Home
                                            </Link>
                                            <Link to="/hotels" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold">
                                                <Hotel className="w-5 h-5 text-brand-600" /> Hotels
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setMobileOpen(false);
                                                    setActionPopup({ isOpen: true, message: "Please log in first to view your bookings." });
                                                }}
                                                className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold text-left"
                                            >
                                                <ClipboardList className="w-5 h-5 text-brand-600" /> My Bookings
                                            </button>
                                        </nav>
                                        <div className="px-4 space-y-3 pt-6">
                                            <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-slate-950 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest">Sign In</Link>
                                            <Link to="/login?mode=signup" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-white text-slate-950 border-2 border-slate-950 rounded-[24px] text-[10px] font-black uppercase tracking-widest">Create Account</Link>
                                            <Link to="/list-property" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-sky-50 text-sky-700 border border-sky-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest mt-4">List Your Property</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Profile Menu */}
            <AnimatePresence>
                {profileMobileOpen && user && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[110]"
                            onClick={() => setProfileMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[120] shadow-2xl px-6 pt-12 pb-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-black italic">My Profile<span className="text-brand-600">.</span></span>
                                <button onClick={() => setProfileMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-6 pt-2">
                                    <nav className="space-y-1">
                                        <Link to="/profile" onClick={() => setProfileMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                            <UserRound className="w-5 h-5 text-slate-400" /> My Account
                                        </Link>
                                        <Link to="/my-bookings" onClick={() => setProfileMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                            <ClipboardList className="w-5 h-5 text-brand-600" /> My Bookings
                                        </Link>
                                        <button onClick={() => { setShowLogoutConfirm(true); setProfileMobileOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-red-50 text-red-600 font-bold">
                                            <LogOut className="w-5 h-5" /> Log Out
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Login Success Modal (Centered with Blur) */}
            <AnimatePresence>
                {showLoginToast && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[200]"
                            onClick={() => setShowLoginToast(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-[90%] max-w-sm"
                            onClick={() => setShowLoginToast(false)}
                        >
                            <div className="bg-white rounded-[48px] p-10 text-center shadow-2xl shadow-brand-500/10 border border-brand-50">
                                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                    <CheckCircle2 className="w-12 h-12 text-brand-600" />
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-brand-400 rounded-full"
                                    />
                                </div>
                                <h3 className="text-3xl font-black text-slate-950 mb-3 tracking-tight">
                                    Login <span className="text-brand-600 italic">Successful!</span>
                                </h3>
                                <p className="text-slate-500 font-bold leading-relaxed">
                                    Welcome back! You have successfully logged into your account.
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <div className="px-6 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Click anywhere to dismiss
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[48px] z-[210] overflow-hidden shadow-2xl border border-slate-100"
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
                                    Are you sure you want to logout? We'll miss you!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Yes, Logout
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        No, Stay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom Login Intercept Modal */}
            <AnimatePresence>
                {actionPopup.isOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setActionPopup({ ...actionPopup, isOpen: false })} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                            className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-100"
                        >
                            <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-xl font-black italic text-slate-900 mb-2">
                                Authentication Required
                            </h3>
                            <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
                                {actionPopup.message}
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setActionPopup({ ...actionPopup, isOpen: false })} 
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setActionPopup({ ...actionPopup, isOpen: false });
                                        navigate("/login?redirect=/my-bookings");
                                    }} 
                                    className="flex-1 py-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-brand-700 transition-colors"
                                >
                                    Log In Now
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}



