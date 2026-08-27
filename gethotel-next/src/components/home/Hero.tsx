'use client';

import React from "react";
import { useStayMode } from "@/context/StayModeContext";
import { cn } from "@/lib/utils";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { Hotel, Clock, Plane, Palmtree } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface HeroProps {
    title?: string;
    highlight?: string;
    transitionInterval?: number;
    stories?: any[];
}

export default function Hero({
    stories
}: HeroProps) {
    const { mode, setMode } = useStayMode();
    const navigate = useNavigate();
    const { lang } = useParams();
    const langCode = lang || 'en';

    return (
        <section className="relative z-20 min-h-[60vh] md:min-h-[75vh] flex flex-col items-center justify-start pt-16 md:justify-center md:pt-16 pb-12 md:pb-16 px-3 md:px-8">
            {/* Atmospheric Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-100/30 rounded-full blur-[100px]"
                />
                <div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/20 rounded-full blur-[80px]"
                />
            </div>

            <div className="relative z-10 w-full max-w-none mx-auto flex flex-col items-center text-center">

                {/* Primary Headline */}
                <div className="mb-6 md:mb-10">
                    <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] text-slate-950 font-luxury font-bold tracking-tight leading-[1.1] pb-2 flex items-center justify-center">
                        <span>
                            Where would you like to <span className="text-brand-600 italic">stay?</span>
                        </span>
                    </h2>
                </div>

                {/* Interactive Search Bar Component */}
                <div className="w-full">
                    {/* Stay Mode, Flights & Tour Packages Tabs — NO hover color change */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 w-full max-w-lg sm:max-w-none mx-auto px-2 sm:px-4">
                        <button 
                            type="button"
                            onClick={() => setMode('nightly')}
                            className={cn(
                                "w-full sm:w-auto px-3 py-2.5 md:px-5 md:py-2.5 rounded-full text-xs font-black transition-none flex items-center justify-center gap-1.5 md:gap-2 border shadow-sm cursor-pointer",
                                mode === 'nightly' 
                                    ? "bg-slate-950 text-white border-slate-950 shadow-md" 
                                    : "bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90"
                            )}
                        >
                            <Hotel className={cn("w-3.5 h-3.5 md:w-4 md:h-4", mode === 'nightly' ? "text-blue-400" : "text-slate-500")} />
                            <span>Full Day Stay</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => setMode('hourly')}
                            className={cn(
                                "w-full sm:w-auto px-3 py-2.5 md:px-5 md:py-2.5 rounded-full text-xs font-black transition-none flex items-center justify-center gap-1.5 md:gap-2 border shadow-sm cursor-pointer",
                                mode === 'hourly' 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                                    : "bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90"
                            )}
                        >
                            <Clock className={cn("w-3.5 h-3.5 md:w-4 md:h-4", mode === 'hourly' ? "text-blue-200 animate-pulse" : "text-slate-500")} />
                            <span>Hourly Stay</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate(`/${langCode}/flights`)}
                            className="w-full sm:w-auto px-3 py-2.5 md:px-5 md:py-2.5 rounded-full text-xs font-black transition-none flex items-center justify-center gap-1.5 md:gap-2 border shadow-sm bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90 cursor-pointer"
                        >
                            <Plane className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" />
                            <span>Flights</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate(`/${langCode}/packages`)}
                            className="w-full sm:w-auto px-3 py-2.5 md:px-5 md:py-2.5 rounded-full text-xs font-black transition-none flex items-center justify-center gap-1.5 md:gap-2 border shadow-sm bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/90 cursor-pointer"
                        >
                            <Palmtree className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
                            <span>Tour Packages</span>
                        </button>
                    </div>

                    <SmartSearchBar className="w-full" stories={stories} />
                </div>
            </div>

        </section>
    );
}
