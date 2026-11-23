'use client';

import { useState, useMemo, useEffect } from "react";
import HotelCard from "@/components/hotels/HotelCard";
import type { Hotel } from "@/types";
import { SlidersHorizontal, MapPin, ArrowUpDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface LandingHotelsGridProps {
  initialHotels: Hotel[];
  locationNote?: string;
}

export default function LandingHotelsGrid({ initialHotels, locationNote }: LandingHotelsGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [selectedDuration, setSelectedDuration] = useState<string>("3");
  const [, setCurrencyTrigger] = useState(0);

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyTrigger((prev) => prev + 1);
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () => window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  const filteredHotels = useMemo(() => {
    let list = [...initialHotels];

    const getPrice = (h: any) => {
      const hr = h.hourlyRates || {};
      const rate = Number(hr[selectedDuration] || hr[String(selectedDuration)] || hr['3'] || (h.pricePerNight || 0) * 0.35);
      return rate;
    };

    if (selectedFilter === "under1200") {
      list = list.filter((h) => getPrice(h) <= 1200);
    } else if (selectedFilter === "lift") {
      list = list.filter((h) => {
        const am: any = h.amenities;
        const amStr = typeof am === "string" ? am.toLowerCase() : JSON.stringify(am || "").toLowerCase();
        return amStr.includes("lift") || amStr.includes("elevator");
      });
    } else if (selectedFilter === "wifi") {
      list = list.filter((h) => {
        const am: any = h.amenities;
        const amStr = typeof am === "string" ? am.toLowerCase() : JSON.stringify(am || "").toLowerCase();
        return amStr.includes("wifi");
      });
    } else if (selectedFilter === "frontdesk") {
      list = list.filter((h) => {
        const am: any = h.amenities;
        const amStr = typeof am === "string" ? am.toLowerCase() : JSON.stringify(am || "").toLowerCase();
        return amStr.includes("front desk") || amStr.includes("24-hour");
      });
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.guestRating || 0) - (a.guestRating || 0));
    }

    return list;
  }, [initialHotels, selectedFilter, sortBy, selectedDuration]);

  return (
    <section className="space-y-4">
      {/* Controls Bar - Compact Single Row with Duration Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 pr-2">
          {/* Global Duration Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shrink-0 mr-1 shadow-2xs">
            {(["3", "6", "12"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDuration(d)}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                  selectedDuration === d
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {d}h Slot
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "all"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All ({initialHotels.length})
          </button>
          <button
            onClick={() => setSelectedFilter("under1200")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "under1200"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Under {formatPrice(1200)}
          </button>
          <button
            onClick={() => setSelectedFilter("frontdesk")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "frontdesk"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            24/7 Front Desk
          </button>
          <button
            onClick={() => setSelectedFilter("lift")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "lift"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Lift
          </button>
          <button
            onClick={() => setSelectedFilter("wifi")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "wifi"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Free WiFi
          </button>
        </div>

        <div className="flex items-center shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rating</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="relative group flex flex-col">
              <HotelCard hotel={hotel} stayMode="hourly" defaultDuration={selectedDuration} />
              {locationNote && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-md border border-brand-100">
                  <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                  <span className="truncate">{locationNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-600 font-semibold text-sm">
            No properties match this filter currently.
          </p>
          <button
            onClick={() => setSelectedFilter("all")}
            className="mt-3 text-xs font-bold text-brand-600 hover:underline"
          >
            Show All Available Hotels ({initialHotels.length}) →
          </button>
        </div>
      )}
    </section>
  );
}
