

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { useStayMode } from "@/context/StayModeContext";
import { cn } from "@/lib/utils";

export default function Hero() {
    const { mode, setMode } = useStayMode();
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
                        className={`text-4xl md:text-[90px] text-slate-950 font-luxury font-bold tracking-[-0.01em] leading-[1.1] pb-2`}
                    >
                        Where would you <br />
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-brand-600 italic font-bold"
                        >
                            like to stay?
                        </motion.span>
                    </motion.h1>
                </div>

                {/* Interactive Search Bar Component */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: 1,
                        maxWidth: mode === 'hourly' ? "1200px" : "1000px" 
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                >
                    {/* Stay Mode Toggle (Pill Shape) */}
                    <div className="flex justify-center mb-5">
                        <div className="bg-white/40 backdrop-blur-3xl p-1 rounded-[2rem] flex items-center border border-white/40 shadow-xl w-fit">
                            <button 
                                onClick={() => setMode('nightly')}
                                className={cn(
                                    "px-7 py-2.5 rounded-[1.5rem] text-xs font-black transition-all duration-500 flex items-center gap-2 italic tracking-tight",
                                    mode === 'nightly' 
                                        ? "bg-slate-950 text-white shadow-lg scale-105" 
                                        : "text-slate-500 hover:text-slate-950"
                                )}
                            >
                                <Sparkles className={cn("w-3.5 h-3.5", mode === 'nightly' ? "text-brand-400" : "text-slate-400")} />
                                Full Day Stay
                            </button>
                            <button 
                                onClick={() => setMode('hourly')}
                                className={cn(
                                    "px-7 py-2.5 rounded-[1.5rem] text-xs font-black transition-all duration-500 flex items-center gap-2 italic tracking-tight",
                                    mode === 'hourly' 
                                        ? "bg-blue-600 text-white shadow-lg scale-105" 
                                        : "text-slate-500 hover:text-blue-600"
                                )}
                            >
                                <div className={cn("w-1.5 h-1.5 rounded-full", mode === 'hourly' ? "bg-white animate-pulse" : "bg-slate-400")} />
                                Hourly Stay
                            </button>
                        </div>
                    </div>

                    <SmartSearchBar className="w-full" />
                </motion.div>
            </div>

        </section>
    );
}



