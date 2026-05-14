

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface WishlistContextValue {
    wishlist: string[];
    toggle: (hotelId: string) => void;
    isWishlisted: (hotelId: string) => boolean;
    count: number;
}

const WishlistContext = createContext<WishlistContextValue>({
    wishlist: [],
    toggle: () => { },
    isWishlisted: () => false,
    count: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [toast, setToast] = useState<{ show: boolean; message: string } | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("stayease_wishlist");
            if (stored) setWishlist(JSON.parse(stored));
        } catch { }
    }, []);

    const fireConfetti = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 50 : 150;
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

        // Fire from corners
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0, y: 1 } });
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 1, y: 1 } });
        fire(0.2, { spread: 60, origin: { x: 0, y: 0 } });
        fire(0.2, { spread: 60, origin: { x: 1, y: 0 } });
    }, []);

    const toggle = useCallback((hotelId: string) => {
        const isAdding = !wishlist.includes(hotelId);
        const next = isAdding
            ? [...wishlist, hotelId]
            : wishlist.filter((id) => id !== hotelId);
        
        setWishlist(next);

        if (isAdding) {
            setToast({ show: true, message: "Item added to wishlist" });
            fireConfetti();
            setTimeout(() => setToast(null), 3000);
        }

        try {
            localStorage.setItem("stayease_wishlist", JSON.stringify(next));
        } catch { }
    }, [wishlist, fireConfetti]);

    const isWishlisted = useCallback(
        (hotelId: string) => wishlist.includes(hotelId),
        [wishlist]
    );

    return (
        <WishlistContext.Provider
            value={{ wishlist, toggle, isWishlisted, count: wishlist.length }}
        >
            {children}
            {/* Global Toast Notification */}
            {toast?.show && (
                <div className="fixed top-8 right-8 z-[9999]">
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="bg-white/95 backdrop-blur-2xl border border-white/50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500 fill-red-500" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{toast.message}</p>
                    </motion.div>
                </div>
            )}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);



