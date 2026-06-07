

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Wallet, Hotel, Laptop, Plane, Luggage, MapPin } from "lucide-react";

export const TravelIllustration = () => {
    return (
        <div className="relative w-full h-full bg-[#EEF2FF] flex flex-col items-center justify-center overflow-hidden p-12">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 w-full max-w-lg">
                {/* Main Heading Overlay */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <h2 className="text-5xl font-black text-indigo-950 tracking-tighter leading-[1.1] mb-4">
                        Book Hotels, <br />
                        <span className="text-indigo-600 underline decoration-indigo-200">Pay Less,</span> Stay More!
                    </h2>
                    <p className="text-slate-500 text-sm font-medium max-w-xs">
                        Pay only 12% online to confirm your booking. The rest, pay at the hotel during your stay.
                    </p>
                </motion.div>

                {/* Interactive Payment Badge */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[32px] shadow-[0_20px_50px_rgba(79,70,229,0.1)] mb-12 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pay Online</p>
                            <p className="text-xl font-black text-slate-900">12%</p>
                        </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-slate-300" />

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pay at Hotel</p>
                            <p className="text-xl font-black text-slate-900">88%</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <Hotel className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Minimal Character/Room Composition (Simplified Abstract) */}
                <div className="relative h-64 w-full flex items-end justify-center">
                    {/* Window/Skyline Background */}
                    <div className="absolute inset-0 bg-white/40 rounded-t-[48px] border-t border-x border-white p-4 overflow-hidden">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex-1 bg-indigo-100/50 rounded-xl" style={{ height: `${20 + i * 15}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* Suitcase */}
                    <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute bottom-4 left-8"
                    >
                        <div className="w-12 h-16 bg-slate-800 rounded-xl relative">
                            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-6 h-4 border-2 border-slate-800 rounded-t-md" />
                            <div className="absolute inset-x-2 top-4 bottom-4 border-l border-white/10" />
                        </div>
                    </motion.div>

                    {/* Bed (Abstract) */}
                    <div className="absolute bottom-0 right-[-10%] w-2/3 h-24 bg-white rounded-tl-[32px] shadow-sm border-t border-l border-slate-100 flex items-center justify-center">
                        <div className="w-16 h-8 bg-indigo-50 rounded-lg absolute top-4 right-8" />
                    </div>

                    {/* Laptop User (Abstract Icon-based) */}
                    <motion.div 
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative z-20 flex flex-col items-center mb-4"
                    >
                        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl relative">
                            <Laptop className="w-10 h-10 text-white" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-50 flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Ready for your trip?</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Flying Plane Decoration */}
            <motion.div 
                animate={{ 
                    x: ["-10vw", "110vw"],
                    y: [0, -50, 0]
                }}
                transition={{ 
                    duration: 20, 
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-20 left-0 text-indigo-300"
            >
                <Plane className="w-8 h-8 rotate-12" />
            </motion.div>
        </div>
    );
};



