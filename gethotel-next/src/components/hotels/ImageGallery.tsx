'use client';

import { useState, useRef, useEffect } from "react";
import Image from "@/components/common/Image";
import { X, ChevronLeft, ChevronRight, Grid2X2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    images?: string[];
    hotelName: string;
}

export default function ImageGallery({ images = [], hotelName }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const validImages = (images || []).filter(img => typeof img === 'string' && img.trim() !== "");

    if (validImages.length === 0) {
        validImages.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80");
    }

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightboxOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [lightboxOpen]);

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const prev = () => setActiveIndex((i) => (i - 1 + validImages.length) % validImages.length);
    const next = () => setActiveIndex((i) => (i + 1) % validImages.length);

    const scrollNext = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    const scrollPrev = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Desktop View: Collage Grid */}
            <div className="hidden md:block relative group/gallery overflow-hidden rounded-[40px] border-4 border-white shadow-2xl">
                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[550px]">
                    <motion.div
                        className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
                        onClick={() => openLightbox(0)}
                    >
                        <Image src={validImages[0]} alt={hotelName} fill className="object-cover group-hover:scale-105 transition-all duration-1000" priority unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <Maximize2 className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    {validImages.slice(1, 5).map((src, i) => (
                        <div key={i} className="relative cursor-pointer overflow-hidden group" onClick={() => openLightbox(i + 1)}>
                            <Image src={src} alt={hotelName} fill className="object-cover group-hover:scale-110 transition-all duration-1000" unoptimized />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                        </div>
                    ))}
                </div>

                <button onClick={() => openLightbox(0)} className="absolute bottom-8 right-8 px-6 py-3 bg-white/90 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center gap-3">
                    <Grid2X2 className="w-4 h-4 text-brand-600" />
                    View All {validImages.length} Photos
                </button>
            </div>

            {/* Mobile View: 4:3 Slider with Arrows (Booking.com style) */}
            <div className="md:hidden relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg group/slider">
                <div 
                    ref={sliderRef}
                    className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                    onScroll={(e) => {
                        const index = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth);
                        if (index !== activeIndex) setActiveIndex(index);
                    }}
                >
                    {validImages.map((src, i) => (
                        <div key={i} className="w-full h-full shrink-0 snap-center relative" onClick={() => openLightbox(i)}>
                            <Image src={src} alt={hotelName} fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        </div>
                    ))}
                </div>
                
                {/* Navigation Arrows (Booking Style) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded flex items-center justify-center shadow-md active:scale-90 transition-all"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-800" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded flex items-center justify-center shadow-md active:scale-90 transition-all"
                >
                    <ChevronRight className="w-5 h-5 text-slate-800" />
                </button>

                {/* Counter Badge (Bottom Right) */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-lg z-10 border border-white/20">
                    {activeIndex + 1} / {validImages.length}
                </div>
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-between"
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* Header */}
                        <div 
                            className="w-full px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between border-b border-slate-100 bg-white z-[130]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col">
                                <h3 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight truncate max-w-[260px] sm:max-w-md">
                                    {hotelName}
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                    {activeIndex + 1} / {validImages.length}
                                </p>
                            </div>
                            <button 
                                onClick={() => setLightboxOpen(false)} 
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image Viewer */}
                        <div 
                            className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-6 bg-slate-50/50 select-none overflow-hidden"
                            onClick={() => setLightboxOpen(false)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 0.98 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-full max-w-5xl h-full flex items-center justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img 
                                        src={validImages[activeIndex]} 
                                        alt={`${hotelName} photo ${activeIndex + 1}`} 
                                        className="max-w-full max-h-[72vh] sm:max-h-[80vh] w-auto h-auto object-contain mx-auto select-none" 
                                    />
                                </motion.div>
                            </AnimatePresence>
                            
                            {validImages.length > 1 && (
                                <>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); prev(); }} 
                                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 active:scale-95 transition-all z-20 cursor-pointer"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); next(); }} 
                                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 active:scale-95 transition-all z-20 cursor-pointer"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Bottom Thumbnail Strip */}
                        {validImages.length > 1 && (
                            <div 
                                className="w-full py-3 px-4 border-t border-slate-100 bg-white flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar z-[130]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {validImages.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={cn(
                                            "relative w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden shrink-0 transition-all border-2 cursor-pointer",
                                            idx === activeIndex 
                                                ? "border-brand-600 ring-2 ring-brand-100 scale-105" 
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={src} alt="thumbnail" fill className="object-cover" unoptimized />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
