"use client";

import { useState } from "react";
import Image from "next/image";
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

    const validImages = (images || []).filter(img => typeof img === 'string' && img.trim() !== "");

    if (validImages.length === 0) {
        validImages.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80");
    }

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[450px] bg-slate-100 flex items-center justify-center rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No imagery provided for this property</p>
            </div>
        );
    }

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const prev = () => setActiveIndex((i) => (i - 1 + validImages.length) % validImages.length);
    const next = () => setActiveIndex((i) => (i + 1) % validImages.length);

    return (
        <>
            {/* Gallery Grid */}
            <div className="relative group/gallery overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[450px] sm:h-[550px]">
                    {/* Main image - 1st half */}
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
                        onClick={() => openLightbox(0)}
                    >
                        <Image
                            src={validImages[0]}
                            alt={`${hotelName} - main`}
                            fill
                            className="object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <Maximize2 className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                    </motion.div>

                    {/* Side images - 2nd half */}
                    {validImages.slice(1, 5).map((src, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                            className="relative cursor-pointer overflow-hidden group"
                            onClick={() => openLightbox(i + 1)}
                        >
                            <Image
                                src={src}
                                alt={`${hotelName} - photo ${i + 2}`}
                                fill
                                className="object-cover group-hover:scale-110 transition-all duration-1000 ease-out"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                loading="lazy"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>

                {/* Floating "Show all" button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-8 right-8 px-6 py-3.5 bg-white/90 backdrop-blur-xl hover:bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-premium flex items-center gap-3 transition-all active:scale-95 border border-white/50 z-10"
                >
                    <Grid2X2 className="w-4 h-4 text-brand-600" />
                    Explore {validImages.length} Imagery
                </motion.button>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center backdrop-blur-3xl"
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* Header Controls */}
                        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-[110]">
                            <div className="flex flex-col">
                                <h3 className="text-white font-black text-lg tracking-tight">{hotelName}</h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                                    Viewing {activeIndex + 1} of {validImages.length} Imagery
                                </p>
                            </div>
                            <button
                                onClick={() => setLightboxOpen(false)}
                                className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Horizontal Image Slider */}
                        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                            <motion.div 
                                className="flex h-[70vh] items-center"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -100) next();
                                    else if (info.offset.x > 100) prev();
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, x: 300, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -300, scale: 0.9 }}
                                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                        className="relative w-[90vw] h-full flex items-center justify-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Image
                                            src={validImages[activeIndex]}
                                            alt={`${hotelName} - ${activeIndex + 1}`}
                                            fill
                                            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                            sizes="100vw"
                                            unoptimized
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* Side Nav Buttons - Hidden on Mobile */}
                            <div className="hidden md:flex absolute inset-x-8 top-1/2 -translate-y-1/2 justify-between pointer-events-none">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prev(); }}
                                    className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all border border-white/10 pointer-events-auto group backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); next(); }}
                                    className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all border border-white/10 pointer-events-auto group backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Bottom Thumbnail Strip */}
                        <div className="w-full bg-slate-900/50 backdrop-blur-2xl border-t border-white/5 p-6 flex flex-col items-center gap-6">
                            <div className="flex gap-3 overflow-x-auto pb-2 max-w-full no-scrollbar px-10">
                                {validImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                                        className={cn(
                                            "relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2",
                                            i === activeIndex 
                                                ? "border-brand-500 scale-110 shadow-lg shadow-brand-500/20" 
                                                : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            alt="thumb"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {validImages.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-500",
                                            i === activeIndex ? "bg-brand-500 w-6" : "bg-white/10 w-2"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </>
    );
}
