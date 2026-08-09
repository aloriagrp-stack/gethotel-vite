import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import {
    ShoppingBag, X, Trash2, ArrowRight, Package, Hotel,
    CreditCard, Sparkles
} from "lucide-react";

export default function FloatingCartPill() {
    const { user } = useAuth();
    const { cartItems, itemCount, totalAmount, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { langCode } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // DO NOT show floating cart pill if user is NOT signed in or on checkout, login, register, my-bookings pages
    if (
        !user ||
        itemCount === 0 ||
        pathname.includes("/booking") ||
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/my-bookings")
    ) {
        return null;
    }

    const handleCheckout = () => {
        setIsOpen(false);
        if (cartItems.length === 1 && cartItems[0].type === "package") {
            const pkg = cartItems[0];
            const query = new URLSearchParams({
                type: "package",
                packageId: pkg.details.packageId || pkg.id,
                title: pkg.title,
                destination: pkg.subtitle || "India",
                totalAmount: String(pkg.price),
                price: String(pkg.price),
                travelers: String(pkg.details.travelers || 2),
                checkIn: pkg.details.checkIn || new Date().toISOString().split("T")[0]
            }).toString();
            navigate(`/${langCode}/booking?${query}`);
        } else if (cartItems.length === 1 && cartItems[0].type === "hotel") {
            const h = cartItems[0];
            const query = new URLSearchParams({
                hotelId: h.details.hotelId || "",
                roomId: h.details.roomId || "",
                checkIn: h.details.checkIn || "",
                checkOut: h.details.checkOut || "",
                guests: String(h.details.guests || 2)
            }).toString();
            navigate(`/${langCode}/booking?${query}`);
        } else {
            navigate(`/${langCode}/booking?cart=true`);
        }
    };

    const handleDiscardAll = () => {
        clearCart();
        setIsOpen(false);
    };

    // Genie-effect animation variants
    const panelVariants = {
        hidden: {
            opacity: 0,
            scale: 0.1,
            y: 200,
            x: -120,
            borderRadius: "50%",
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            x: 0,
            borderRadius: "28px",
            transition: {
                type: "spring" as const,
                damping: 22,
                stiffness: 260,
                mass: 0.8,
            }
        },
        exit: {
            opacity: 0,
            scale: 0.08,
            y: 200,
            x: -120,
            borderRadius: "50%",
            transition: {
                type: "spring" as const,
                damping: 28,
                stiffness: 350,
                mass: 0.6,
            }
        }
    };

    return (
        <>
            {/* Floating Circular Cart Button — Bottom Left */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        ref={buttonRef}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 18, stiffness: 300 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 left-5 z-[100] w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,99,235,0.5),0_0_0_3px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.7)] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/25"
                        title="View Cart"
                    >
                        <ShoppingBag className="w-6 h-6 text-white" />

                        {/* Item count badge */}
                        <span className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md min-w-[22px] min-h-[22px]">
                            {itemCount}
                        </span>

                        {/* Pulse ring animation */}
                        <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Expanded Cart Panel with Genie Effect */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Blurred Backdrop — tap to close */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[150] bg-slate-950/50 backdrop-blur-md"
                        />

                        {/* Genie-expanding Cart Panel */}
                        <motion.div
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed z-[160] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md max-h-[80vh] flex flex-col"
                            style={{ transformOrigin: "bottom left" }}
                        >
                            <div className="bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.25)] border border-slate-200/80 overflow-hidden flex flex-col max-h-[80vh]">
                                {/* Header */}
                                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                                            <ShoppingBag className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                                Your Cart
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {itemCount} item{itemCount > 1 ? "s" : ""} added
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>

                                {/* Cart Items List (scrollable) */}
                                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, height: 0 }}
                                            className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 group"
                                        >
                                            {/* Item Image */}
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                                    {item.type === "package" ? (
                                                        <Package className="w-6 h-6 text-blue-500" />
                                                    ) : (
                                                        <Hotel className="w-6 h-6 text-blue-500" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Item Info */}
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 block">
                                                            {item.type === "package" ? "Tour Package" : "Hotel Stay"}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                                                            {item.title}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 opacity-60 group-hover:opacity-100"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    </button>
                                                </div>
                                                {item.subtitle && (
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">{item.subtitle}</p>
                                                )}
                                                <p className="text-sm font-black text-slate-900">
                                                    ₹{item.price?.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Footer — Total + Actions */}
                                <div className="px-5 pt-3 pb-5 border-t border-slate-100 space-y-3 shrink-0 bg-white">
                                    {/* Total */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
                                        <span className="text-lg font-black text-slate-950">₹{totalAmount.toLocaleString("en-IN")}</span>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.6)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Proceed to Checkout
                                    </button>

                                    {/* Discard All */}
                                    <button
                                        onClick={handleDiscardAll}
                                        className="w-full py-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Discard All Items
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
