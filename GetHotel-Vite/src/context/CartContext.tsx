import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CartItem {
    id: string;
    type: "hotel" | "package";
    title: string;
    subtitle?: string;
    image?: string;
    price: number;
    details: {
        hotelId?: string;
        roomId?: string;
        roomName?: string;
        variantName?: string;
        packageId?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: number;
        nights?: number;
        duration?: string;
        stayType?: string;
        travelers?: number;
    };
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => boolean;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
    cartWarning: string | null;
    clearWarning: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "ghs_unified_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse cart items:", e);
            return [];
        }
    });

    const [cartWarning, setCartWarning] = useState<string | null>(null);

    // Clear cart if user is not authenticated
    useEffect(() => {
        if (!user) {
            setCartItems([]);
            try {
                localStorage.removeItem(CART_STORAGE_KEY);
            } catch (e) {}
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } catch (e) {
                console.error("Failed to save cart items:", e);
            }
        }
    }, [cartItems, user]);

    const addToCart = (newItem: CartItem): boolean => {
        const hasPackage = cartItems.some(i => i.type === "package");
        const hasHotel = cartItems.some(i => i.type === "hotel");

        // Conflict check: User already has tour package in cart
        if (newItem.type === "hotel" && hasPackage) {
            setCartWarning("Cannot add hotel stay because your cart already includes a tour package with hotel stays included.");
            return false;
        }

        // Conflict check: User already has hotel in cart
        if (newItem.type === "package" && hasHotel) {
            setCartWarning("Cannot add tour package because your cart already has an individual hotel stay selected.");
            return false;
        }

        setCartItems(prev => {
            const filtered = prev.filter(i => i.id !== newItem.id);
            return [...filtered, newItem];
        });
        return true;
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const clearWarning = () => {
        setCartWarning(null);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const itemCount = cartItems.length;

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalAmount, itemCount, cartWarning, clearWarning }}>
            {children}

            {/* Global Conflict Warning Modal */}
            <AnimatePresence>
                {cartWarning && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
                            onClick={clearWarning}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center z-10 space-y-4 border border-slate-100"
                        >
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Cart Notice</h3>
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                {cartWarning}
                            </p>
                            <button
                                onClick={clearWarning}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                            >
                                Understood
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
