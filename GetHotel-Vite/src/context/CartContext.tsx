import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
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

    const addToCart = (newItem: CartItem) => {
        setCartItems(prev => {
            // Remove existing item of same id or replace
            const filtered = prev.filter(i => i.id !== newItem.id);
            return [...filtered, newItem];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const itemCount = cartItems.length;

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalAmount, itemCount }}>
            {children}
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
