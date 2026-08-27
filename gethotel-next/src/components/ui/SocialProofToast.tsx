'use client';


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShoppingBag, Users } from "lucide-react";
import { useLocation } from "react-router-dom";

const SIMULATED_DATA = [
    { name: "Rahul S.", city: "Delhi", hotel: "Grand Palace", time: "5 mins ago" },
    { name: "Priya M.", city: "Mumbai", hotel: "Royal Heritage", time: "12 mins ago" },
    { name: "Amit K.", city: "Jaipur", hotel: "The Oberoi", time: "22 mins ago" },
    { name: "Sneha R.", city: "Agra", hotel: "ITC Mughal", time: "45 mins ago" },
    { name: "Vikram T.", city: "Bangalore", hotel: "Vivanta", time: "1 hour ago" }
];

export default function SocialProofToast() {
    const [current, setCurrent] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const pathname = useLocation().pathname;

    // Do not show on admin or partner dashboards
    const isAdminOrPartner = pathname.startsWith('/admin') || pathname.startsWith('/partner-dashboard') || pathname.startsWith('/.controlhub');

    useEffect(() => {
        if (isAdminOrPartner) return;
        const showRandomToast = () => {
            const random = SIMULATED_DATA[Math.floor(Math.random() * SIMULATED_DATA.length)];
            setCurrent(random);
            setVisible(true);

            // Hide after 6 seconds
            setTimeout(() => {
                setVisible(false);
            }, 6000);
        };

        // Initial delay before first toast
        const initialTimer = setTimeout(showRandomToast, 10000);
        
        // Periodic cycle
        const interval = setInterval(showRandomToast, 35000); 

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [isAdminOrPartner]);

    if (isAdminOrPartner) return null;

    return (
        <AnimatePresence>
            {visible && current && (
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-8 left-8 z-[100] hidden md:flex items-center gap-4 bg-white/80 backdrop-blur-2xl p-4 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-sm"
                >
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest italic">Recent Booking</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                            <span className="font-black">{current.name}</span> from {current.city}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">Booked <span className="text-slate-900 font-bold">{current.hotel}</span> • {current.time}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}



