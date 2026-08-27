'use client';


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiHints } from "@/data/searchMockData";
import { cn } from "@/lib/utils";

export default function AIHintBadge() {
    const [index, setIndex] = useState(0);

    // Rotate hints every 4 seconds
    useEffect(() => {
        const t = setInterval(() => setIndex((i) => (i + 1) % aiHints.length), 4000);
        return () => clearInterval(t);
    }, []);

    const hint = aiHints[index];

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={hint.type}
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-[11px] font-bold glass border-white/20",
                        hint.color
                    )}
                >
                    {/* Pulse dot */}
                    {hint.pulse && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white/90" />
                        </span>
                    )}
                    {hint.label}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}



