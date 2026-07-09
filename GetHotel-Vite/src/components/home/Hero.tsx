

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Calendar, MapPin, Users, Hotel, Clock, Plane } from "lucide-react";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import { useStayMode } from "@/context/StayModeContext";
import { cn } from "@/lib/utils";

export default function Hero({ title, highlight, transitionInterval, stories }: { title?: string, highlight?: string, transitionInterval?: number | string, stories?: any[] }) {
    const { mode, setMode } = useStayMode();
    const navigate = useNavigate();
    const { langCode } = useLocale();
    const displayTitle = title || "Where would you";
    const displayHighlight = highlight || "like to stay?";

    // Split comma-separated headlines
    const titlesList = displayTitle.split(",").map(t => t.trim());
    const highlightsList = displayHighlight.split(",").map(h => h.trim());
    const maxLength = Math.max(titlesList.length, highlightsList.length);

    const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(80);

    // Get current title & highlight combination
    const currentTitle = titlesList[currentHeadlineIndex % titlesList.length];
    const currentHighlight = highlightsList[currentHeadlineIndex % highlightsList.length];
    // Add a trailing space to the title if it doesn't have one to separate it from the highlight
    const normalPart = currentTitle + (currentTitle.endsWith(" ") ? "" : " ");
    const fullText = normalPart + currentHighlight;

    const intervalMs = (transitionInterval ? parseInt(transitionInterval.toString()) : 3) * 1000;

    // Reset state when headlines configuration changes from backend/props
    useEffect(() => {
        setCurrentHeadlineIndex(0);
        setCurrentText("");
        setIsDeleting(false);
    }, [displayTitle, displayHighlight]);

    useEffect(() => {
        let timer: any;

        const handleType = () => {
            if (!isDeleting) {
                // Typing characters
                const nextText = fullText.substring(0, currentText.length + 1);
                setCurrentText(nextText);
                setTypingSpeed(80);

                if (nextText === fullText) {
                    // Headline typed completely, pause based on admin configuration
                    timer = setTimeout(() => {
                        setIsDeleting(true);
                    }, intervalMs);
                    return;
                }
            } else {
                // Deleting characters
                const nextText = fullText.substring(0, currentText.length - 1);
                setCurrentText(nextText);
                setTypingSpeed(30);

                if (nextText === "") {
                    // Done deleting, move to next headline combination
                    setIsDeleting(false);
                    setCurrentHeadlineIndex((prev) => (prev + 1) % maxLength);
                    setTypingSpeed(150);
                    return;
                }
            }

            timer = setTimeout(handleType, typingSpeed);
        };

        timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentHeadlineIndex, displayTitle, displayHighlight, intervalMs]);

    // Determine the render split
    const normalTextToRender = currentText.substring(0, normalPart.length);
    const highlightTextToRender = currentText.length > normalPart.length 
        ? currentText.substring(normalPart.length) 
        : "";

    return (
        <section className="relative z-20 min-h-[70vh] md:min-h-[90vh] flex flex-col items-center justify-center pt-16 md:pt-20 pb-12 md:pb-16 px-3 md:px-8">
            {/* Atmospheric Background Elements (Static for Performance) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-100/30 rounded-full blur-[100px] will-change-transform"
                />
                <div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/20 rounded-full blur-[80px] will-change-transform"
                />
            </div>

            <div className="relative z-10 w-full max-w-none mx-auto flex flex-col items-center text-center">

                {/* Primary Headline */}
                <div className="mb-6 md:mb-10">
                    <h2 className="text-4xl md:text-[90px] text-slate-950 font-luxury font-bold tracking-[-0.01em] leading-[1.1] pb-2 min-h-[80px] md:min-h-[200px] flex items-end justify-center">
                        <div className="w-full">
                            <span>{normalTextToRender}</span>
                            {highlightTextToRender && (
                                <span className="text-brand-600 italic font-bold">
                                    {highlightTextToRender}
                                </span>
                            )}
                            <span className="typing-cursor ml-1" />
                        </div>
                    </h2>
                    <style>{`
                        @keyframes cursor-blink {
                            50% { border-color: transparent; }
                        }
                        .typing-cursor {
                            border-right: 3.5px solid #4f46e5;
                            animation: cursor-blink 0.75s step-end infinite;
                            display: inline-block;
                            height: 0.85em;
                            vertical-align: middle;
                        }
                    `}</style>
                </div>

                {/* Interactive Search Bar Component */}
                <div className="w-full">
                    {/* Stay Mode & Flights Tabs */}
                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 w-full overflow-x-auto no-scrollbar py-1 px-4">
                        <button 
                            type="button"
                            onClick={() => setMode('nightly')}
                            className={cn(
                                "px-3.5 py-2.5 md:px-6 md:py-3 rounded-full text-[10px] md:text-xs font-black transition-all duration-300 flex items-center gap-1.5 md:gap-2 border shadow-sm shrink-0",
                                mode === 'nightly' 
                                    ? "bg-slate-950 text-white border-slate-950 scale-105" 
                                    : "bg-white/80 backdrop-blur-md text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-950"
                            )}
                        >
                            <Hotel className={cn("w-3 h-3.5 md:w-3.5 md:h-3.5", mode === 'nightly' ? "text-brand-400" : "text-slate-500")} />
                            <span>Full Day Stay</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMode('hourly')}
                            className={cn(
                                "px-3.5 py-2.5 md:px-6 md:py-3 rounded-full text-[10px] md:text-xs font-black transition-all duration-300 flex items-center gap-1.5 md:gap-2 border shadow-sm shrink-0",
                                mode === 'hourly' 
                                    ? "bg-blue-600 text-white border-blue-600 scale-105" 
                                    : "bg-white/80 backdrop-blur-md text-slate-600 border-slate-200/80 hover:bg-white hover:text-blue-600"
                            )}
                        >
                            <Clock className={cn("w-3 h-3.5 md:w-3.5 md:h-3.5", mode === 'hourly' ? "text-blue-200 animate-pulse" : "text-slate-500")} />
                            <span>Hourly Stay</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate(`/${langCode}/flights`)}
                            className="px-3.5 py-2.5 md:px-6 md:py-3 rounded-full text-[10px] md:text-xs font-black transition-all duration-300 flex items-center gap-1.5 md:gap-2 border shadow-sm bg-white/80 backdrop-blur-md text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-950 shrink-0"
                        >
                            <Plane className="w-3 h-3.5 md:w-3.5 md:h-3.5 text-slate-500" />
                            <span>Flights</span>
                        </button>
                    </div>

                    <SmartSearchBar className="w-full" stories={stories} />
                </div>
            </div>

        </section>
    );
}



