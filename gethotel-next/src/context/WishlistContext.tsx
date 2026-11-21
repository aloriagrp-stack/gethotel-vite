'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextValue {
    wishlist: string[];
    toggle: (hotelId: string | number, hotelData?: any) => void;
    isWishlisted: (hotelId: string | number) => boolean;
    count: number;
    cachedHotels: Record<string, any>;
}

const WishlistContext = createContext<WishlistContextValue>({
    wishlist: [],
    toggle: () => { },
    isWishlisted: () => false,
    count: 0,
    cachedHotels: {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [cachedHotels, setCachedHotels] = useState<Record<string, any>>({});
    const [toast, setToast] = useState<{ show: boolean; message: string } | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Load from localStorage only when user is logged in
    useEffect(() => {
        if (!user) {
            setWishlist([]);
            setCachedHotels({});
            return;
        }

        try {
            const userKey = `gethotel_wishlist_${user.id}`;
            const stored = localStorage.getItem(userKey) || localStorage.getItem("stayease_wishlist") || localStorage.getItem("wishlist");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setWishlist(parsed.map(id => String(id)));
                }
            }
            const storedHotels = localStorage.getItem(`gethotel_wishlist_hotels_${user.id}`) || localStorage.getItem("gethotel_wishlist_hotels");
            if (storedHotels) {
                setCachedHotels(JSON.parse(storedHotels));
            }
        } catch { }
    }, [user]);

    const fireConfetti = useCallback(() => {
        if (typeof window === 'undefined') return;
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 35 : 80;
        const defaults = {
            origin: { y: 0.7 },
            spread: 90,
            ticks: 50,
            gravity: 1.2,
            decay: 0.94,
            startVelocity: 30,
            shapes: ['circle', 'square'],
            colors: ['#0369c5', '#1087e7', '#FF0000', '#FFD700']
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0, y: 1 } });
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 1, y: 1 } });
        fire(0.2, { spread: 60, origin: { x: 0, y: 0 } });
        fire(0.2, { spread: 60, origin: { x: 1, y: 0 } });
    }, []);

    const toggle = useCallback((hotelId: string | number, hotelData?: any) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        const idStr = String(hotelId);
        const isAdding = !wishlist.includes(idStr);
        const next = isAdding
            ? [...wishlist, idStr]
            : wishlist.filter((id) => id !== idStr);
        
        setWishlist(next);

        let nextCached = { ...cachedHotels };
        if (isAdding && hotelData) {
            nextCached[idStr] = hotelData;
            setCachedHotels(nextCached);
        } else if (!isAdding) {
            delete nextCached[idStr];
            setCachedHotels(nextCached);
        }

        if (isAdding) {
            setToast({ show: true, message: "Added to Wishlist" });
            try { fireConfetti(); } catch (_) {}
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast({ show: true, message: "Removed from Wishlist" });
            setTimeout(() => setToast(null), 2500);
        }

        try {
            const jsonStr = JSON.stringify(next);
            const userKey = `gethotel_wishlist_${user.id}`;
            localStorage.setItem(userKey, jsonStr);
            localStorage.setItem("stayease_wishlist", jsonStr);
            localStorage.setItem("wishlist", jsonStr);
            localStorage.setItem(`gethotel_wishlist_hotels_${user.id}`, JSON.stringify(nextCached));
            window.dispatchEvent(new Event("wishlist_updated"));
        } catch { }
    }, [user, wishlist, cachedHotels, fireConfetti]);

    const isWishlisted = useCallback(
        (hotelId: string | number) => {
            if (!user) return false;
            return wishlist.includes(String(hotelId));
        },
        [user, wishlist]
    );

    return (
        <WishlistContext.Provider
            value={{ wishlist, toggle, isWishlisted, count: user ? wishlist.length : 0, cachedHotels }}
        >
            {children}

            {/* Global Toast Notification */}
            <AnimatePresence>
                {toast?.show && (
                    <div className="fixed top-8 right-8 z-[9999]">
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.9 }}
                            className="bg-white/95 backdrop-blur-2xl border border-slate-100 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3"
                        >
                            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">{toast.message}</p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Auth Required Modal for Wishlist */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowAuthModal(false)} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                            className="relative w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center"
                        >
                            <div className="w-14 h-14 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center mb-5">
                                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                                Authentication Required
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
                                Please sign in or create an account to save hotels to your wishlist.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowAuthModal(false)} 
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                                        window.location.href = `/login?redirect=${currentUrl}`;
                                    }} 
                                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Sign In / Sign Up
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
