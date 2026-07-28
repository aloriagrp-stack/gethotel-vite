import { memo } from "react";
import { Plane, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  isCheapest?: boolean;
  refundable?: boolean;
  seatsLeft?: number;
}

interface Props {
  flightData: {
    origin: string;
    destination: string;
    isInternational?: boolean;
    cheapestPrice?: number;
    flights: Flight[];
  };
  theme?: "light" | "dark";
  onBookFlight?: (flight: Flight) => void;
}

const FlightCard = memo(function FlightCard({ flightData, theme = "light", onBookFlight }: Props) {
  if (!flightData || !Array.isArray(flightData.flights) || flightData.flights.length === 0) return null;

  return (
    <div className="w-full max-w-xl my-3 space-y-3 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-brand-500 shrink-0" />
          <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
            Flights: {flightData.origin} → {flightData.destination}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          Worldwide Guaranteed Lowest Fares
        </span>
      </div>

      <div className="space-y-2.5">
        {flightData.flights.map((f) => (
          <div
            key={f.id}
            className={`p-4 rounded-2xl border transition-all shadow-sm ${
              f.isCheapest
                ? theme === "dark"
                  ? "bg-[#18181c] border-emerald-500/50 shadow-emerald-950/20"
                  : "bg-emerald-50/40 border-emerald-300 shadow-emerald-100"
                : theme === "dark"
                ? "bg-[#161619] border-[#292930]"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-dashed border-slate-200/50 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60 dark:border-slate-700">
                  {f.airlineCode}
                </div>
                <div>
                  <div className={`text-xs font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                    {f.airline}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">{f.flightNumber}</div>
                </div>
              </div>

              {f.isCheapest && (
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-emerald-500 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Lowest Fare
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="text-left">
                <div className={`text-base font-black ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  {f.departureTime}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">{f.origin}</div>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 px-3">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {f.duration}
                </span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-[2px] flex-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <Plane className="w-3.5 h-3.5 text-brand-500 shrink-0 rotate-90" />
                  <div className="h-[2px] flex-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{f.stops}</span>
              </div>

              <div className="text-right">
                <div className={`text-base font-black ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  {f.arrivalTime}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">{f.destination}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Total Price</div>
                <div className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-brand-400" : "text-brand-600"}`}>
                  ₹{f.price.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBookFlight?.(f)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Select Flight</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FlightCard;
