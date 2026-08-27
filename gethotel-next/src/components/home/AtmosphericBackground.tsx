'use client';


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKGROUNDS = [
    {
        id: "goa",
        url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: "udaipur",
        url: "https://images.unsplash.com/photo-1589136142558-103348074d28?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: "shimla",
        url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: "kerala",
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2000&auto=format&fit=crop",
    },
];

export default function AtmosphericBackground() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 10000); // 10s per slide (matches Ken Burns duration)
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
            <AnimatePresence mode="sync">
                <motion.div
                    key={BACKGROUNDS[index].id}
                    className="absolute inset-0"
                    // Effect 2: Cross-Fade + Blur on exit
                    // Effect 3: Parallax Slide from right on enter
                    initial={{ opacity: 0, x: 20, filter: "blur(0px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* Effect 1: Ken Burns — slow zoom from scale 1 → 1.05 over 10s */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${BACKGROUNDS[index].url})`,
                        }}
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.05 }}
                        transition={{ duration: 10, ease: "linear" }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Gradient overlay for text readability (black/40) */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5))",
                }}
            />
        </div>
    );
}



