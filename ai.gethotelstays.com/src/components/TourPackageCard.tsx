import { useState, memo } from "react";
import { Compass, Calendar, ChevronDown, ChevronUp, Check, ShieldCheck, ArrowRight, Car, Building, Sparkles, Clock, MapPin, DollarSign, XCircle, AlertTriangle } from "lucide-react";

interface ActivityItem {
  time?: string;
  activity: string;
}

interface DayPlan {
  day: number;
  title: string;
  route?: string;
  summary?: string;
  morning: ActivityItem[] | string[];
  afternoon: ActivityItem[] | string[];
  evening: ActivityItem[] | string[];
  drive_time?: string;
  stay?: string;
  meals?: string;
  experience?: string;
  highlights?: string[];
}

interface BudgetItem {
  category: string;
  amount: number;
  note?: string;
}

interface BudgetBreakdown {
  requested_budget: number;
  estimated_total: number;
  unallocated_buffer: number;
  items: BudgetItem[];
}

interface TourPackage {
  isIndiaOnlyRestriction?: boolean;
  message?: string;
  tour_title?: string;
  destination: string;
  durationDays: number;
  duration?: string;
  travelerCount: number;
  perPersonPrice: number;
  bundledTotalPrice: number;
  budget_breakdown?: BudgetBreakdown;
  conflict_notice?: string;
  highlights?: string[];
  days?: DayPlan[];
  itineraryTimeline?: DayPlan[];
  included?: string[];
  excluded?: string[];
  what_to_carry?: string[];
  best_time?: string;
  difficulty?: string;
  ideal_for?: string;
}

interface Props {
  tourPackage: TourPackage;
  theme?: "light" | "dark";
  onBookPackage?: (tour: TourPackage) => void;
}

const TourPackageCard = memo(function TourPackageCard({ tourPackage, theme = "light", onBookPackage }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  if (!tourPackage || tourPackage.isIndiaOnlyRestriction) return null;

  const toggleDay = (dayNum: number) => {
    setExpandedDay(prev => (prev === dayNum ? null : dayNum));
  };

  const daysList = tourPackage.days || tourPackage.itineraryTimeline || [];
  const inclusions = tourPackage.included || [
    'Private AC Car & Fuel',
    'Handpicked Partner Hotel Stay',
    'Daily Breakfast Included',
    'Airport / Station Transfers',
    'Toll, Parking & Driver Charges'
  ];
  const exclusions = tourPackage.excluded || ['Airfare / Train Tickets', 'Monument Entry Tickets', 'Personal Expenses'];
  const budget = tourPackage.budget_breakdown;

  return (
    <div className={`w-full max-w-xl my-4 rounded-3xl border overflow-hidden shadow-2xl transition-all font-sans ${
      theme === "dark" ? "bg-[#141417] border-[#292932] text-slate-100" : "bg-white border-slate-200/90 text-slate-900"
    }`}>
      {/* 1. TOUR HEADER BANNER */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-5.5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25">
                🇮🇳 Luxury Itinerary Engine
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
              {tourPackage.tour_title || `${tourPackage.destination} Special Package`}
            </h3>
            <p className="text-xs text-white/90 font-semibold mt-1.5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{tourPackage.duration || `${tourPackage.durationDays} Days / ${tourPackage.durationDays - 1} Nights`}</span>
              <span>•</span>
              <span>{tourPackage.travelerCount} Travelers</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{tourPackage.destination}</span>
            </p>
          </div>
          <Compass className="w-11 h-11 text-white/30 shrink-0 hidden sm:block" />
        </div>
      </div>

      {/* GEOGRAPHIC CONFLICT WARNING CALLOUT BANNER */}
      {tourPackage.conflict_notice && (
        <div className="p-3.5 mx-4 mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{tourPackage.conflict_notice}</div>
        </div>
      )}

      {/* 2. VISUAL BUDGET COMPONENT (Mathematical Breakdown) */}
      {budget && (
        <div className="p-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#101013]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Estimated Budget Allocation
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-xl font-black ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  ₹{budget.estimated_total?.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  of ₹{budget.requested_budget?.toLocaleString()} Budget
                </span>
              </div>
            </div>
            {budget.unallocated_buffer > 0 && (
              <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-right">
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">
                  + ₹{budget.unallocated_buffer?.toLocaleString()} Buffer
                </span>
                <span className="text-[9px] font-medium text-slate-400">Emergency & Shopping</span>
              </div>
            )}
          </div>

          {/* Itemized Budget Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {budget.items.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border ${
                  theme === "dark" ? "bg-[#1a1a1f] border-[#292932]" : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 truncate">{item.category}</div>
                <div className={`text-sm font-extrabold mt-0.5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  ₹{item.amount?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ACCORDION DAY-BY-DAY TIMELINE */}
      <div className="p-4 space-y-3">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Day-by-Day Chronological Itinerary</span>
          <span className="text-[10px] font-normal text-slate-400">Click day to expand</span>
        </div>

        {daysList.map((item) => {
          const isExpanded = expandedDay === item.day;

          // Helper to normalize morning/afternoon/evening arrays
          const parseActivities = (act: any): ActivityItem[] => {
            if (!act) return [];
            if (Array.isArray(act)) {
              return act.map(a => (typeof a === "string" ? { activity: a } : a));
            }
            if (typeof act === "string") return [{ activity: act }];
            return [];
          };

          const morningList = parseActivities(item.morning);
          const afternoonList = parseActivities(item.afternoon);
          const eveningList = parseActivities(item.evening);

          return (
            <div
              key={item.day}
              className={`rounded-2xl border transition-all overflow-hidden ${
                theme === "dark" ? "border-[#25252c] bg-[#18181c]" : "border-slate-200/90 bg-white"
              }`}
            >
              {/* Day Header Accordion Toggle */}
              <button
                type="button"
                onClick={() => toggleDay(item.day)}
                className={`w-full flex items-center justify-between p-3.5 text-left transition-colors cursor-pointer ${
                  theme === "dark" ? "hover:bg-[#202026]" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                    0{item.day}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                        {item.title}
                      </span>
                      {item.route && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                          {item.route}
                        </span>
                      )}
                    </div>
                    {item.summary && (
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-brand-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Day Details Timeline Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 text-xs space-y-3.5 border-t border-dashed border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  {/* Morning Block */}
                  {morningList.length > 0 && (
                    <div>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                        🌅 Morning
                      </span>
                      <div className="space-y-1.5 pl-1">
                        {morningList.map((m, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {m.time && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {m.time}
                              </span>
                            )}
                            <span className="leading-relaxed text-[11px] font-semibold">{m.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Block */}
                  {afternoonList.length > 0 && (
                    <div>
                      <span className="font-extrabold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 mb-1.5">
                        ☀️ Afternoon
                      </span>
                      <div className="space-y-1.5 pl-1">
                        {afternoonList.map((a, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {a.time && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 shrink-0 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {a.time}
                              </span>
                            )}
                            <span className="leading-relaxed text-[11px] font-semibold">{a.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Block */}
                  {eveningList.length > 0 && (
                    <div>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5">
                        🌙 Evening
                      </span>
                      <div className="space-y-1.5 pl-1">
                        {eveningList.map((e, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {e.time && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shrink-0 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {e.time}
                              </span>
                            )}
                            <span className="leading-relaxed text-[11px] font-semibold">{e.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visual Chips: Stay • Drive Time • Meals */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {item.stay && (
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                        <Building className="w-3 h-3" /> Stay: {item.stay}
                      </span>
                    )}
                    {item.drive_time && (
                      <span className="px-2.5 py-1 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[11px] font-bold text-brand-600 dark:text-brand-300 flex items-center gap-1">
                        <Car className="w-3 h-3" /> Drive: {item.drive_time}
                      </span>
                    )}
                    {item.experience && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {item.experience}
                      </span>
                    )}
                  </div>

                  {/* Highlights Bullet Badges */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                        ✨ Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.highlights.map((hl, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            • {hl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. SECTIONS AFTER ITINERARY (Inclusions & Exclusions) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#101013] space-y-3">
        {/* Inclusions */}
        <div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> What's Included:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inclusions.map((inc, idx) => (
              <span key={idx} className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500 shrink-0" /> {inc}
              </span>
            ))}
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <div className="text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> What's Not Included:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exclusions.map((exc, idx) => (
              <span key={idx} className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-500 shrink-0" /> {exc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PRICING FOOTER & BOOK ACTION */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-100/70 dark:bg-[#141417] flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            All-Inclusive Guaranteed Quote
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${theme === "dark" ? "text-brand-400" : "text-brand-600"}`}>
              ₹{tourPackage.bundledTotalPrice?.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              (₹{tourPackage.perPersonPrice?.toLocaleString()}/person)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBookPackage?.(tourPackage)}
          className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <span>Book Custom Tour</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default TourPackageCard;
