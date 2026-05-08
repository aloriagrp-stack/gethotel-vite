"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { DestinationStory, StorySlide } from "@/data/stories";
import { useRouter } from "next/navigation";

interface DestinationStoryViewerProps {
    story: DestinationStory | null;
    onClose: () => void;
    onNext?: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per slide

export default function DestinationStoryViewer({ story, onClose, onNext }: DestinationStoryViewerProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const slides = story?.slides || [];
    const currentSlide = slides[currentSlideIndex];

    const nextSlide = useCallback(() => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex((prev) => prev + 1);
            setProgress(0);
        } else if (onNext) {
            setCurrentSlideIndex(0);
            setProgress(0);
            onNext();
        } else {
            onClose();
        }
    }, [currentSlideIndex, slides.length, onClose, onNext]);

    const prevSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex((prev) => prev - 1);
            setProgress(0);
        }
    }, [currentSlideIndex]);

    // Scroll Lock when story is open
    useEffect(() => {
        if (story) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [story]);

    useEffect(() => {
        if (!story || isPaused) return;

        const interval = 50; // Update progress every 50ms
        const step = (interval / STORY_DURATION) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [story, isPaused, nextSlide]);

    useEffect(() => {
        // Reset slide index when story changes (during autoplay)
        if (story) {
            setCurrentSlideIndex(0);
            setProgress(0);
        }
    }, [story?.id]);

    if (!story || !mounted) return null;

    const handleAction = () => {
        router.push(`/hotels?city=${story.city}`);
        onClose();
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y > 150) {
            onClose();
        } else {
            controls.start({ y: 0 });
        }
    };

    const content = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-0 md:p-4 touch-none"
            >
                {/* Close Button - Desktop Only */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[100000] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors hidden md:block"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Story Container with Swipe to Close */}
                <motion.div 
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    className="relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col cursor-grab active:cursor-grabbing"
                >

                    {/* Progress Bars */}
                    <div className="absolute top-4 left-4 right-4 z-[100001] flex gap-1.5">
                        {slides.map((_, index) => (
                            <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: index === currentSlideIndex ? `${progress}%` : index < currentSlideIndex ? "100%" : "0%"
                                    }}
                                    transition={{ duration: 0.1, ease: "linear" }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-10 left-5 right-5 z-[100001] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-brand-500 p-[2px] bg-slate-800">
                                <img
                                    src={story.slides[0].image}
                                    alt={story.city}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-base tracking-tight drop-shadow-md">{story.city}</span>
                                <span className="text-white/70 text-[10px] font-medium uppercase tracking-widest drop-shadow-md">Destination Story</span>
                            </div>
                        </div>
                        {/* Close button for mobile inside the header */}
                        <button onClick={onClose} className="md:hidden p-2 text-white/80 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div
                        className="relative flex-1"
                        onPointerDown={() => setIsPaused(true)}
                        onPointerUp={() => setIsPaused(false)}
                    >
                        {/* Slide Image */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlideIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={currentSlide.image}
                                    className="w-full h-full object-cover"
                                    alt={currentSlide.title}
                                />
                                {/* Improved Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />
                                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/50 to-transparent" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide Content */}
                        <div className="absolute bottom-28 left-6 right-6 z-40">
                            <motion.div
                                key={currentSlideIndex}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <h3 className="text-white font-display font-black text-3xl mb-3 leading-tight drop-shadow-lg">{currentSlide.title}</h3>
                                <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium drop-shadow-md">
                                    {currentSlide.description}
                                </p>
                            </motion.div>
                        </div>

                        {/* Navigation Areas (Tappable zones) - Moved to not overlap header/footer */}
                        <div className="absolute top-24 bottom-32 inset-x-0 z-[10000] flex">
                            <div className="w-[30%] cursor-pointer h-full" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
                            <div className="flex-1 cursor-pointer h-full" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
                        </div>
                    </div>

                    {/* Footer / Call to Action - Elevated z-index */}
                    <div className="absolute bottom-0 inset-x-0 p-6 z-[100001] bg-gradient-to-t from-black to-transparent">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(); }}
                            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-all active:scale-[0.98] shadow-2xl cursor-pointer"
                        >
                            Explore {story.city}
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Desktop Navigation Arrows */}
                    <div className="hidden lg:block absolute inset-y-0 -left-16 flex items-center">
                        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className={currentSlideIndex === 0 ? "hidden" : "p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md"}>
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="hidden lg:block absolute inset-y-0 -right-16 flex items-center">
                        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    return createPortal(content, document.body);
}
