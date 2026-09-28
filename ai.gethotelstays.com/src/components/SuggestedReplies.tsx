import { memo, useMemo } from "react";
import { Sparkles, ArrowRight, BedDouble, ShieldCheck, Compass, Plane } from "lucide-react";

interface Props {
  responseType?: string;
  hotels?: any[];
  tourPackage?: any;
  flights?: any;
  onSend: (text: string) => void;
  theme?: 'light' | 'dark';
}

const SuggestedReplies = memo(function SuggestedReplies({
  responseType,
  hotels,
  tourPackage,
  flights,
  onSend,
  theme = 'light'
}: Props) {
  const suggestions = useMemo(() => {
    // 1. Hotel results received
    if (hotels && hotels.length > 0) {
      const topHotel = hotels[0]?.name || "the top hotel";
      return [
        { label: "Show rooms & photos", icon: BedDouble, prompt: `Show available rooms and photos for ${topHotel}` },
        { label: "Under ₹3,500/night only", icon: Sparkles, prompt: "Filter hotels under ₹3,500 per night" },
        { label: "With breakfast & pool", icon: ShieldCheck, prompt: "Which of these have swimming pool and free breakfast?" },
        { label: "Near metro / transport", icon: ArrowRight, prompt: "Which hotel is closest to metro or airport transport?" }
      ];
    }

    // 2. Tour package inquiry
    if (tourPackage) {
      return [
        { label: "Can we customize day 2?", icon: Compass, prompt: "Can we customize the day 2 itinerary in this tour?" },
        { label: "What meals are included?", icon: Sparkles, prompt: "Which meals, entry tickets, and transfers are included?" },
        { label: "Book this package", icon: ArrowRight, prompt: "I'd like to book this tour package, what are next steps?" }
      ];
    }

    // 3. Flight results
    if (flights) {
      return [
        { label: "Cheapest vs fastest", icon: Plane, prompt: "Compare the cheapest flight with the fastest direct flight" },
        { label: "Evening flights only", icon: ArrowRight, prompt: "Show only evening departures after 6 PM" },
        { label: "Include hotel package", icon: Sparkles, prompt: "Can you bundle this flight with a luxury stay?" }
      ];
    }

    // 4. Room details
    if (responseType === 'rooms') {
      return [
        { label: "Book this room", icon: BedDouble, prompt: "I want to reserve this room with 12% deposit" },
        { label: "Cancellation policy", icon: ShieldCheck, prompt: "What is the cancellation and refund policy?" },
        { label: "Compare with other rooms", icon: ArrowRight, prompt: "Compare amenities with other room options" }
      ];
    }

    // 5. Default smart travel discovery suggestions
    return [
      { label: "Top luxury hotels in Goa", icon: Sparkles, prompt: "Find luxury beachfront resorts in North Goa near the sea" },
      { label: "Heritage havelis in Jaipur", icon: Compass, prompt: "Recommend heritage haveli hotels in Jaipur under ₹5,000" },
      { label: "Mountain stays in Manali", icon: ArrowRight, prompt: "Best cozy mountain view stays in Manali with breakfast" },
      { label: "Business stays near Delhi Aerocity", icon: ShieldCheck, prompt: "Find business hotels near Delhi Aerocity with airport shuttle" }
    ];
  }, [responseType, hotels, tourPackage, flights]);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3.5 mb-1.5 animate-fade-in">
      <span className={`text-[11px] font-bold uppercase tracking-wider select-none mr-1 flex items-center gap-1 ${
        theme === 'dark' ? "text-slate-400" : "text-slate-500"
      }`}>
        <Sparkles className="w-3 h-3 text-brand-400" />
        Suggested:
      </span>
      {suggestions.map((s, i) => {
        const Icon = s.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSend(s.prompt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer shadow-xs select-none active:scale-95 group ${
              theme === 'dark'
                ? "bg-[#18181c]/90 border-[#2e2e34] text-slate-200 hover:bg-[#25252d] hover:border-brand-500/50 hover:text-white"
                : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
              theme === 'dark' ? "text-brand-400" : "text-brand-500"
            }`} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default SuggestedReplies;
