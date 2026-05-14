
import { useState, useRef } from "react";
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
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center backdrop-blur-3xl"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-[110]">
                            <div className="flex flex-col">
                                <h3 className="text-white font-black text-lg italic">{hotelName}</h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{activeIndex + 1} / {validImages.length}</p>
                            </div>
                            <button onClick={() => setLightboxOpen(false)} className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="relative w-full flex-1 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
                                    className="relative w-[90vw] h-[70vh]"
                                >
                                    <Image src={validImages[activeIndex]} alt="fullscreen" fill className="object-contain" unoptimized />
                                </motion.div>
                            </AnimatePresence>
                            
                            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white"><ChevronLeft className="w-6 h-6" /></button>
                            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-6 h-6" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
