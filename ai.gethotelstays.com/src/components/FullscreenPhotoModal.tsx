import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullscreenPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export default function FullscreenPhotoModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = "Photo Gallery"
}: FullscreenPhotoModalProps) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const validImages = images && images.length > 0 
    ? images 
    : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"];

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  // Keyboard navigation & escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full flex items-center justify-between px-5 py-4 text-white z-10 shrink-0 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          <h4 className="text-sm sm:text-base font-extrabold truncate text-white/90">{title}</h4>
          <span className="text-xs text-slate-400 font-medium">
            Photo {activeIdx + 1} of {validImages.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Fullscreen Image Area */}
      <div 
        className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-6 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={validImages[activeIdx]}
          alt={`${title} - Photo ${activeIdx + 1}`}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-300"
        />

        {/* Previous Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-transform active:scale-90 cursor-pointer shadow-lg z-20"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-transform active:scale-90 cursor-pointer shadow-lg z-20"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {validImages.length > 1 && (
        <div 
          className="w-full flex items-center justify-center gap-2 px-4 py-3 pb-6 z-10 shrink-0 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                activeIdx === idx 
                  ? 'border-brand-500 scale-105 opacity-100 shadow-md ring-2 ring-brand-500/50' 
                  : 'border-transparent opacity-40 hover:opacity-80'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
