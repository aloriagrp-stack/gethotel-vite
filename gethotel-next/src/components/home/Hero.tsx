'use client';

import { useState, useEffect } from "react";
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
    title,
    highlight,
    transitionInterval,
    stories
}: HeroProps) {
    const { mode, setMode } = useStayMode();
    const navigate = useNavigate();
    const { lang } = useParams();
    const langCode = lang || 'en';

    // Typewriter Headlines state
    const defaultTitles = [
        "Where would you like to",
        "Experience luxurious stays in",
        "Book hourly & day rooms across"
    ];
    const defaultHighlights = [
        "travel?",
        "India",
        "top cities"
    ];

    const displayTitle = title || defaultTitles;
    const displayHighlight = highlight || defaultHighlights;
    const intervalMs = transitionInterval || 4000;

    const titlesArray = Array.isArray(displayTitle) ? displayTitle : [displayTitle];
    const highlightsArray = Array.isArray(displayHighlight) ? displayHighlight : [displayHighlight];
    const maxLength = Math.max(titlesArray.length, highlightsArray.length);

    const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(80);

    const currentTitle = titlesArray[currentHeadlineIndex % titlesArray.length];
    const currentHighlight = highlightsArray[currentHeadlineIndex % highlightsArray.length];

    const normalPart = `${currentTitle} `;
    const highlightPart = currentHighlight;
    const fullText = normalPart + highlightPart;

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
        <section className="relative z-20 min-h-[70vh] md:min-h-[90vh] flex flex-col items-center justify-start pt-20 md:justify-center md:pt-20 pb-12 md:pb-16 px-3 md:px-8">
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
