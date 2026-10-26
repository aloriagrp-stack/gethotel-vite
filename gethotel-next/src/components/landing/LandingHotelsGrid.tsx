'use client';

import { useState, useMemo } from "react";
import HotelCard from "@/components/hotels/HotelCard";
import type { Hotel } from "@/types";
import { SlidersHorizontal, MapPin, ArrowUpDown } from "lucide-react";

interface LandingHotelsGridProps {
  initialHotels: Hotel[];
  locationNote?: string;
}

export default function LandingHotelsGrid({ initialHotels, locationNote }: LandingHotelsGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");

  const filteredHotels = useMemo(() => {
    let list = [...initialHotels];

    if (selectedFilter === "under1200") {
      list = list.filter((h) => (h.pricePerNight || 0) <= 1200);
    } else if (selectedFilter === "lift") {
      list = list.filter((h) => {
        const amStr = typeof h.amenities === "string" ? h.amenities.toLowerCase() : JSON.stringify(h.amenities || "").toLowerCase();
        return amStr.includes("lift") || amStr.includes("elevator");
      });
    } else if (selectedFilter === "wifi") {
      list = list.filter((h) => {
        const amStr = typeof h.amenities === "string" ? h.amenities.toLowerCase() : JSON.stringify(h.amenities || "").toLowerCase();
        return amStr.includes("wifi");
      });
    } else if (selectedFilter === "frontdesk") {
      list = list.filter((h) => {
        const amStr = typeof h.amenities === "string" ? h.amenities.toLowerCase() : JSON.stringify(h.amenities || "").toLowerCase();
        return amStr.includes("front desk") || amStr.includes("24-hour");
      });
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.guestRating || 0) - (a.guestRating || 0));
    }

    return list;
  }, [initialHotels, selectedFilter, sortBy]);

  return (
    <section className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "all"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Available ({initialHotels.length})
          </button>
          <button
            onClick={() => setSelectedFilter("under1200")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "under1200"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Under ₹1,200
          </button>
          <button
            onClick={() => setSelectedFilter("frontdesk")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "frontdesk"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            24/7 Front Desk
          </button>
          <button
            onClick={() => setSelectedFilter("lift")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "lift"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            With Lift / Elevator
          </button>
          <button
            onClick={() => setSelectedFilter("wifi")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === "wifi"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Free High-Speed WiFi
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Guest Rating</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="relative group flex flex-col">
              <HotelCard hotel={hotel} />
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
