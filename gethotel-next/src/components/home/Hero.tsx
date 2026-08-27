'use client';

import { useState, useEffect } from "react";
import { useStayMode } from "@/context/StayModeContext";
import { cn } from "@/lib/utils";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { Hotel, Clock, Plane, Palmtree } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Image from "@/components/common/Image";

interface HeroProps {
    title?: string;
    highlight?: string;
    transitionInterval?: number;
    stories?: any[];
}

export default function Hero({
    title = "Find Verified Hotels & Stays",
    highlight = "at Best Prices",
    transitionInterval = 6000,
    stories
}: HeroProps) {
    const { mode, setMode } = useStayMode();
    const navigate = useNavigate();
    const { lang } = useParams();
    const langCode = lang || 'en';

    return (
        <section className="relative w-full pt-6 md:pt-10 pb-6 md:pb-10 overflow-hidden flex flex-col items-center justify-center">
            {/* Background subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center text-center">
                {/* Hero Title */}
                <div className="max-w-3xl mx-auto mb-6 md:mb-8 space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
                        {title} <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">{highlight}</span>
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-500 max-w-xl mx-auto">
                        Pay only 12% online deposit. Balance at check-in. Trusted by worldwide travelers.
                    </p>
                </div>

                {/* Interactive Search Bar Component */}
                <div className="w-full">
                    {/* Stay Mode, Flights & Tour Packages Tabs */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 w-full max-w-lg sm:max-w-none mx-auto px-2 sm:px-4">
                        <button 
                            type="button"
                            onClick={() => setMode('nightly')}
                            className={cn(
                                "w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                                mode === 'nightly' 
                                    ? "bg-slate-950 text-white border-slate-950 shadow-md scale-[1.02]" 
                                    : "bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white hover:text-slate-950"
                            )}
                        >
                            <Hotel className={cn("w-4 h-4", mode === 'nightly' ? "text-blue-400" : "text-slate-500")} />
                            <span>Full Day Stay</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => setMode('hourly')}
                            className={cn(
                                "w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                                mode === 'hourly' 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]" 
                                    : "bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white hover:text-blue-600"
                            )}
                        >
                            <Clock className={cn("w-4 h-4", mode === 'hourly' ? "text-blue-200 animate-pulse" : "text-slate-500")} />
                            <span>Hourly Stay</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate(`/${langCode}/flights`)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer"
                        >
                            <Plane className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            <span>Flights</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate(`/${langCode}/packages`)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/90 hover:bg-slate-950 hover:text-white hover:border-slate-950 group cursor-pointer"
                        >
                            <Palmtree className="w-4 h-4 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
                            <span>Tour Packages</span>
                        </button>
                    </div>

                    <SmartSearchBar className="w-full" stories={stories} />
                </div>
            </div>
        </section>
    );
}
