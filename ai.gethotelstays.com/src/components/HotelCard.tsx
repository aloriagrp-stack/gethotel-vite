import React from 'react';
import { Sparkles, MapPin, Heart, BookmarkCheck, ArrowRight, ShieldCheck, Zap, Check, Wifi, Coffee, Waves, Wind } from 'lucide-react';

export interface HotelData {
  id: number | string;
  name: string;
  city: string;
  thumbnail?: string | null;
  images?: string[];
  pricePerNight: number;
  promotionalPrice?: number | null;
  guestRating?: number;
  starRating?: number;
  reviewCount?: number;
  description?: string;
  mainAmenities?: string[];
  amenities?: string[];
  rooms?: any[];
}

interface HotelCardProps {
  hotels: any[];
  theme?: 'dark' | 'light';
  onOpenDetails: (hotel: any) => void;
  onInstantBook?: (hotel: any) => void;
  composerAttachment?: any;
  onTogglePin?: (hotel: any) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotels,
  theme = 'dark',
  onOpenDetails,
  onInstantBook,
  composerAttachment,
  onTogglePin
}) => {
  if (!hotels || hotels.length === 0) return null;

  const renderAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi') || a.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (a.includes('breakfast') || a.includes('coffee') || a.includes('dining')) return <Coffee className="w-3 h-3" />;
    if (a.includes('pool') || a.includes('swim')) return <Waves className="w-3 h-3" />;
    if (a.includes('ac') || a.includes('air')) return <Wind className="w-3 h-3" />;
    return <Check className="w-3 h-3 text-emerald-500" />;
  };

  return (
    <div className="mt-4 select-none w-full">
      {/* ---------------- MOBILE VIEW ONLY (Horizontal Scroll Carousel) ---------------- */}
      <div className="flex md:hidden overflow-x-auto gap-3.5 pb-2 pt-1 px-1 snap-x snap-mandatory no-scrollbar w-full">
        {hotels.map((h) => {
          const hotelPhoto =
            h.thumbnail ||
            (h.images && h.images[0]) ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          const hasDiscount = Boolean(h.promotionalPrice && h.promotionalPrice < h.pricePerNight);
          const finalPrice = h.promotionalPrice || h.pricePerNight;
          const depositAmount = Math.round(finalPrice * 0.12);

          return (
            <div
              key={h.id}
              onClick={() => onOpenDetails(h)}
              className="w-[230px] aspect-[3.8/5] shrink-0 snap-start relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-white/10 cursor-pointer group transition-all duration-300 active:scale-[0.98]"
            >
              {/* Photo Background */}
              <img
                src={hotelPhoto}
                alt={h.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top Rating & Trust Badge */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-black/65 text-amber-400 backdrop-blur-md border border-white/10 shadow-sm">
                  ★ {(h.guestRating && h.guestRating > 0 ? h.guestRating : (h.starRating || 4.5)).toFixed(1)}
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600/95 text-white backdrop-blur-md shadow-sm tracking-wide flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> 12% Deposit
                </div>
              </div>

              {/* Dark Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10 flex flex-col justify-end gap-1.5">
                <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-1">
                  {h.name}
                </h3>

                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-[11px] text-slate-300 font-medium truncate flex-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {h.city}
                  </p>

                  <div className="text-right shrink-0">
                    {hasDiscount && (
                      <span className="text-[10px] line-through text-slate-400 font-semibold mr-1">
                        ₹{h.pricePerNight.toLocaleString()}
                      </span>
                    )}
                    <span className="text-sm font-black text-white">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-medium text-slate-300 ml-0.5">/night</span>
                  </div>
                </div>

                {/* Instant Action CTA Pill */}
                <div className="pt-1 flex items-center justify-between gap-1 text-[10px] font-bold text-white/90">
                  <span className="text-[10px] text-brand-300">Reserve @ ₹{depositAmount.toLocaleString()}</span>
                  <span className="flex items-center gap-0.5 text-brand-400 group-hover:translate-x-0.5 transition-transform">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- DESKTOP VIEW ONLY (Horizontal Full Cards) ---------------- */}
      <div className="hidden md:flex flex-col w-full space-y-4">
        {hotels.map((h) => {
          const isAttached = composerAttachment?.id === h.id;
          const hotelPhoto =
            h.thumbnail ||
            (h.images && h.images[0]) ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          const hasDiscount = Boolean(h.promotionalPrice && h.promotionalPrice < h.pricePerNight);
          const finalPrice = h.promotionalPrice || h.pricePerNight;
          const depositAmount = Math.round(finalPrice * 0.12);

          // Extract amenities list
          const rawAmenities: string[] = (Array.isArray(h.mainAmenities) && h.mainAmenities.length > 0)
            ? h.mainAmenities
            : (Array.isArray(h.amenities) && h.amenities.length > 0)
            ? h.amenities
            : ["Free High-Speed Wi-Fi", "Air Conditioning", "Free Breakfast", "Swimming Pool"];
          const displayAmenities = rawAmenities.slice(0, 4);

          return (
            <div
              key={h.id}
              onClick={() => onOpenDetails(h)}
              className={`w-full rounded-3xl overflow-hidden relative border transition-all duration-300 group flex flex-row shadow-lg backdrop-blur-md cursor-pointer ${
                isAttached
                  ? 'ring-2 ring-blue-500 border-blue-500/50 ' +
                    (theme === 'dark' ? 'bg-[#121214]/80' : 'bg-white/80')
                  : theme === 'dark'
                  ? 'bg-[#121214]/65 border-white/10 hover:border-white/20 text-white'
                  : 'bg-white/70 border-slate-200/50 hover:border-slate-300 text-slate-900'
              }`}
            >
              {/* Left Side: Hotel Image */}
              <div className="relative w-[34%] min-h-full shrink-0 overflow-hidden">
                <img
                  src={hotelPhoto}
                  alt={h.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 cursor-pointer"
                  title="Click to view hotel details and rooms"
                />

                {/* AI Pick Badge */}
                <div
                  className={`absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md border uppercase tracking-wider select-none ${
                    theme === 'dark'
                      ? 'bg-[#1e293b]/80 text-[#38bdf8] border-sky-500/30'
                      : 'bg-blue-50/85 text-blue-700 border-blue-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI PICK
                </div>

                {/* 12% Deposit Banner */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/75 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Pay 12% Deposit (₹{depositAmount.toLocaleString()})</span>
                </div>
              </div>

              {/* Right Side: Content info */}
              <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3
                        className={`text-lg md:text-xl font-bold tracking-tight ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {h.name}
                      </h3>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-[#27272a]/80 text-[#fbbf24] backdrop-blur-sm">
                        ★ {(h.guestRating && h.guestRating > 0 ? h.guestRating : (h.starRating || 4.5)).toFixed(1)}
                      </div>
                    </div>
                    {onTogglePin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(h);
                        }}
                        className={`p-2 rounded-full border transition-all ${
                          isAttached
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : theme === 'dark'
                            ? 'bg-[#27272a]/50 border-white/5 text-slate-400 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                        title={isAttached ? 'Unpin hotel' : 'Pin hotel to chat'}
                      >
                        {isAttached ? <BookmarkCheck className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <p
                    className={`flex items-center gap-1.5 text-xs font-semibold mt-1.5 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{h.city}</span>
                  </p>

                  {/* Why This Hotel Trust Badges (from ChatGHS Intelligence Bible) */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <Check className="w-3 h-3" /> Free Cancellation
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-blue-950/40 border-blue-800/40 text-blue-300'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <Zap className="w-3 h-3" /> Instant Confirmation
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      <ShieldCheck className="w-3 h-3" /> 9.2 Cleanliness Score
                    </span>
                  </div>

                  {/* Amenity Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {displayAmenities.map((am, aIdx) => (
                      <span
                        key={aIdx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold select-none border transition-colors ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {renderAmenityIcon(am)}
                        <span>{am}</span>
                      </span>
                    ))}
                  </div>

                  {h.description && (
                    <p
                      className={`text-xs mt-2.5 line-clamp-2 leading-relaxed ${
                        theme === 'dark' ? 'text-slate-300 font-normal' : 'text-slate-600 font-normal'
                      }`}
                    >
                      {h.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Price & Action CTA */}
                <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-200/40 dark:border-white/5">
                  <div>
                    {hasDiscount && (
                      <span className="text-xs line-through text-slate-400 font-semibold mr-1.5">
                        ₹{h.pricePerNight.toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`text-2xl font-extrabold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      ₹{finalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/night</span>
                    <div className="text-[11px] font-bold text-emerald-500 mt-0.5">
                      Pay only ₹{depositAmount.toLocaleString()} today
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {onInstantBook && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInstantBook(h);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Instant Book</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(h);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>View Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelCard;
