import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { ArrowRight } from "lucide-react";

export default function FloatingCartPill() {
    const { user } = useAuth();
    const { cartItems, itemCount } = useCart();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { langCode } = useLocale();

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

    const hasHotel = cartItems.some(i => i.type === "hotel");
    const hasPackage = cartItems.some(i => i.type === "package");

    const getSummaryText = () => {
        if (hasHotel && hasPackage) return "1 Hotel Stay + 1 Tour Package";
        if (hasPackage) return `${itemCount} Tour Package${itemCount > 1 ? 's' : ''}`;
        return `${itemCount} Room Type${itemCount > 1 ? 's' : ''}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs sm:max-w-sm"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl text-white rounded-full p-2 pl-4 pr-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex items-center justify-between border border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 border border-blue-400/40 rounded-full flex items-center justify-center shadow-inner">
                            <span className="text-xs font-black text-blue-300">{itemCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300/80">Cart Total</span>
                            <span className="text-xs font-black italic text-white truncate">{getSummaryText()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(59,130,246,0.6)] active:scale-95 cursor-pointer shrink-0"
                        title="Proceed to Checkout"
                    >
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
