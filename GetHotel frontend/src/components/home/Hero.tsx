"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { Playfair_Display } from "next/font/google";

const luxuryFont = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "600", "800"] });

export default function Hero() {
    return (
        <section className="relative z-20 min-h-[70vh] md:min-h-[90vh] flex flex-col items-center justify-center pt-16 md:pt-20 pb-12 md:pb-16 px-6 overflow-hidden">
            {/* Atmospheric Background Elements (Static for Performance) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-100/30 rounded-full blur-[100px] will-change-transform"
                />
                <div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/20 rounded-full blur-[80px] will-change-transform"
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">

                {/* Primary Headline */}
                <div className="overflow-hidden mb-8 md:mb-12">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={`${luxuryFont.className} text-4xl md:text-[90px] text-slate-950 tracking-[-0.02em] leading-[1] pb-2`}
                    >
                        Where would you <br />
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-brand-600 italic font-semibold"
                        >
                            like to stay?
                        </motion.span>
                    </motion.h1>
                </div>

                {/* Interactive Search Bar Component */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full"
                >
                    <SmartSearchBar className="w-full" />
                </motion.div>
            </div>

        </section>
    );
}
