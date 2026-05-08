"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
    Menu, X, MapPin, User, Heart, Bell, Hotel, Globe,
    LogOut, Settings, ClipboardList, ChevronDown, UserRound, CheckCircle2
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
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { count: wishlistCount } = useWishlist();
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLoginToast, setShowLoginToast] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        // Check for login flag
        const justLoggedIn = localStorage.getItem('just_logged_in');
        if (justLoggedIn === 'true') {
            setShowLoginToast(true);
            localStorage.removeItem('just_logged_in');
            
            // Birthday Dash (Confetti)
            const end = Date.now() + 2000;
            const colors = ["#2563eb", "#059669", "#fbbf24", "#ef4444"];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: 3,
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
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo Section */}
                <Link 
                    href="/" 
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
                            href={link.href}
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
                        href="/wishlist"
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
                            href="/list-property"
                            className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sky-200 transition-all hover:scale-105"
                        >
                            <Hotel className="w-3.5 h-3.5" />
                            List Your Property
                        </Link>
                    )}

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-950 text-white rounded-full hover:bg-slate-900 transition-all"
                            >
                                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span className="text-xs font-black tracking-tight">{user.name?.split(' ')[0] || 'Profile'}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", dropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-60 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden py-2"
                                    >
                                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-slate-700 hover:bg-slate-50 transition-all border-b border-slate-50">
                                            <UserRound className="w-5 h-5 text-slate-400" />
                                            <span className="text-sm font-bold">My Profile</span>
                                        </Link>
                                        <Link href="/list-property" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-slate-700 hover:bg-slate-50 transition-all border-b border-slate-50">
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
                    ) : (
                        <Link
                            href="/login"
                            className="px-6 py-2.5 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-950 text-white"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
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
                            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[120] shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-black italic">GetHotelStays<span className="text-brand-600">.</span></span>
                                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {user ? (
                                    <div className="space-y-6 pt-2">
                                        <div className="px-4 py-6 bg-slate-50 rounded-[24px] flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center overflow-hidden">
                                                {user.photoURL ? <img src={user.photoURL} alt={user.name || "User"} /> : <User className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-950 tracking-tight">{user.name || 'Traveler'}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                            </div>
                                        </div>
                                        <nav className="space-y-1">
                                            <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold border-b border-slate-50">
                                                <UserRound className="w-5 h-5 text-slate-400" /> Profile Settings
                                            </Link>
                                            <Link href="/list-property" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold">
                                                <Hotel className="w-5 h-5 text-sky-600" /> List Your Property
                                            </Link>
                                            <button onClick={() => { setShowLogoutConfirm(true); setMobileOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-red-50 text-red-600 font-bold">
                                                <LogOut className="w-5 h-5" /> Log Out
                                            </button>
                                        </nav>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="px-4">
                                            <h3 className="text-xl font-black text-slate-950 mb-1">Welcome!</h3>
                                            <p className="text-xs text-slate-500 font-medium">Sign in to unlock exclusive deals.</p>
                                        </div>
                                        <nav className="space-y-1">
                                            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold">
                                                <MapPin className="w-5 h-5 text-brand-600" /> Home
                                            </Link>
                                            <Link href="/hotels" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-[18px] hover:bg-slate-50 text-slate-900 font-bold">
                                                <Hotel className="w-5 h-5 text-brand-600" /> Hotels
                                            </Link>
                                        </nav>
                                        <div className="px-4 space-y-3 pt-6">
                                            <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-slate-950 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest">Sign In</Link>
                                            <Link href="/login?mode=signup" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-white text-slate-950 border-2 border-slate-950 rounded-[24px] text-[10px] font-black uppercase tracking-widest">Create Account</Link>
                                            <Link href="/list-property" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center py-5 bg-sky-50 text-sky-700 border border-sky-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest mt-4">List Your Property</Link>
                                        </div>
                                    </div>
                                )}
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
                                    <div className="px-6 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
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
        </header>
    );
}
