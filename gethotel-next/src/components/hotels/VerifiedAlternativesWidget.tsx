'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, Star, MapPin, Zap, ArrowRight, Heart, Sparkles } from 'lucide-react';
import delhiHotelsRaw from '@/data/delhiHotelsLive.json';

interface VerifiedAlternativesWidgetProps {
  currentHotelId?: number | string;
  city?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function VerifiedAlternativesWidget({
  currentHotelId,
  city = 'Delhi',
  limit = 3,
  title = 'Verified Hotels in Delhi (Instant Online Booking)',
  subtitle = 'Can’t reach the front desk or need guaranteed check-in? Pay only 12% online deposit to lock your room, balance at check-in with 100% couple-friendly guarantee.',
}: VerifiedAlternativesWidgetProps) {
  const alternatives = useMemo(() => {
    const all = delhiHotelsRaw as any[];
    const currIdStr = String(currentHotelId || '');
    const filtered = all.filter((h) => String(h.id) !== currIdStr && h.isActive !== false);

    // Pick top hotels with thumbnails and rooms
    const withRooms = filtered.filter((h) => h.room && h.room.length > 0 && h.thumbnail);
    return (withRooms.length >= limit ? withRooms : filtered).slice(0, limit);
  }, [currentHotelId, limit]);

  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Instant Booking • 12% Deposit
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <a
          href="/hotels/delhi"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 shrink-0 self-start sm:self-auto hover:underline"
        >
          <span>View All 40+ Verified Stays</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {alternatives.map((h) => {
          const price = Number(h.pricePerNight || 999);
          const deposit = Math.round(price * 0.12);
          const hotelUrl = `/hotel/${h.id}`;
          const cleanImage = h.thumbnail || (Array.isArray(h.images) && h.images[0]) || '/og-image.jpg';
          const area = h.address ? h.address.split(',').slice(-3, -1).join(', ').trim() || h.city : h.city || 'Delhi NCR';

          return (
            <div
              key={h.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={cleanImage}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Verified Stay
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {h.guestRating && h.guestRating > 0 ? h.guestRating : '4.3'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{area || 'Delhi'}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {h.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-semibold text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">Couple Friendly</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">Local ID OK</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Instant Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 pt-0">
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Starting from
                    </div>
                    <div className="text-base font-black text-slate-900">
                      ₹{price.toLocaleString('en-IN')}
                      <span className="text-[11px] font-normal text-slate-400"> /night</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      Pay ₹{deposit.toLocaleString('en-IN')} deposit now
                    </div>
                  </div>

                  <a
                    href={hotelUrl}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Sell Tour Banner */}
      <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-black text-sm">
            🕌
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Planning to visit Agra? Same-Day Taj Mahal Private Tour from Delhi
            </div>
            <div className="text-[11px] text-slate-600">
              AC private car pickup from your Delhi hotel, express highway, monument entry & buffet lunch included.
            </div>
          </div>
        </div>

        <a
          href="/packages/taj-mahal-agra-private-car-tour-from-delhi-with-5-lunch-63011p1/"
          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <span>Explore Agra Tour</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
