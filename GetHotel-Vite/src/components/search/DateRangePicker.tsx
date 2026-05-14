

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { priceHeatmap, getDatePreset } from "@/data/searchMockData";
import type { DateRange } from "@/types/search";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
    value: DateRange;
    onChange: (r: DateRange) => void;
    isActive: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DATE_PRESETS = [
    { id: "this-weekend", label: "This Weekend" },
    { id: "next-weekend", label: "Next Weekend" },
    { id: "cheapest", label: "Cheapest 2 Nights ✨" },
    { id: "flexible", label: "Flexible Dates" },
];

function priceColor(score: number): string {
    if (score < 0.35) return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
    if (score < 0.65) return "bg-amber-50 text-amber-700 hover:bg-amber-100";
    return "bg-red-50 text-red-600 hover:bg-red-100";
}

function formatDisplay(d: Date | null): string {
    if (!d) return "";
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(d: Date, ci: Date | null, co: Date | null) {
    if (!ci || !co) return false;
    return d > ci && d < co;
}

export default function DateRangePicker({
    value,
    onChange,
    isActive,
    onActivate,
    onDeactivate,
}: DateRangePickerProps) {
    const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
    const [leftMonth, setLeftMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [hovered, setHovered] = useState<Date | null>(null);
    const [selecting, setSelecting] = useState<"checkIn" | "checkOut">("checkIn");

    const rightMonth = useMemo(() => {
        let m = leftMonth.month + 1;
        let y = leftMonth.year;
        if (m > 11) { m = 0; y++; }
        return { year: y, month: m };
    }, [leftMonth]);

    const advance = (dir: 1 | -1) => {
        setLeftMonth((prev) => {
            let m = prev.month + dir;
            let y = prev.year;
            if (m < 0) { m = 11; y--; }
            if (m > 11) { m = 0; y++; }
            return { year: y, month: m };
        });
    };

    const nights = useMemo(() => {
        if (!value.checkIn || !value.checkOut) return 0;
        return Math.round((value.checkOut.getTime() - value.checkIn.getTime()) / 86400000);
    }, [value]);

    const handleDayClick = (d: Date) => {
        if (d < today) return;
        if (selecting === "checkIn" || !value.checkIn || (value.checkIn && value.checkOut)) {
            onChange({ checkIn: d, checkOut: null });
            setSelecting("checkOut");
        } else {
            if (d <= value.checkIn!) {
                onChange({ checkIn: d, checkOut: null });
                setSelecting("checkOut");
            } else {
                onChange({ ...value, checkOut: d });
                setSelecting("checkIn");
                setTimeout(onDeactivate, 200);
            }
        }
    };

    const applyPreset = (id: string) => {
        const preset = getDatePreset(id);
        onChange({ checkIn: preset.checkIn, checkOut: preset.checkOut });
        setSelecting("checkIn");
        setTimeout(onDeactivate, 200);
    };

    const displayCheckIn = value.checkIn ? formatDisplay(value.checkIn) : "";
    const displayCheckOut = value.checkOut ? formatDisplay(value.checkOut) : "";

    return (
        <div className="relative">
            {/* Trigger */}
            <motion.div
                className={cn(
                    "flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-colors duration-200",
                    isActive ? "bg-white ring-2 ring-brand-400 shadow-lg" : "hover:bg-slate-50/80"
                )}
                onClick={onActivate}
                whileHover={{ scale: isActive ? 1 : 1.005 }}
                transition={{ duration: 0.15 }}
            >
                <div className={cn("shrink-0 transition-colors", isActive ? "text-brand-600" : "text-slate-400")}>
                    <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Check-in — Check-out
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold", value.checkIn ? "text-slate-900" : "text-slate-400")}>
                            {displayCheckIn || "Add dates"}
                        </span>
                        {value.checkIn && (
                            <>
                                <span className="w-4 h-px bg-slate-300" />
                                <span className={cn("text-sm font-semibold", value.checkOut ? "text-slate-900" : "text-slate-400")}>
                                    {displayCheckOut || "Add date"}
                                </span>
                            </>
                        )}
                    </div>
                    {nights > 0 && (
                        <p className="text-[10px] text-brand-600 font-semibold mt-0.5">{nights} night{nights > 1 ? "s" : ""}</p>
                    )}
                </div>
            </motion.div>

            {/* Calendar Dropdown */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] border border-slate-100 z-[100] p-5 w-[680px] max-w-[96vw]"
                    >
                        {/* Presets */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {DATE_PRESETS.map((p) => (
                                <motion.button
                                    key={p.id}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => applyPreset(p.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
                                >
                                    <Zap className="w-3 h-3" /> {p.label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Heatmap legend */}
                        <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-500 font-medium">
                            <span>Price:</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-200 inline-block" />Low</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-200 inline-block" />Mid</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-200 inline-block" />High</span>
                        </div>

                        {/* Dual Calendar */}
                        <div className="grid grid-cols-2 gap-6">
                            {[leftMonth, rightMonth].map((mo, idx) => (
                                <MonthCalendar
                                    key={`${mo.year}-${mo.month}`}
                                    year={mo.year}
                                    month={mo.month}
                                    today={today}
                                    checkIn={value.checkIn}
                                    checkOut={value.checkOut}
                                    hovered={hovered}
                                    onHover={setHovered}
                                    onClick={handleDayClick}
                                    showLeft={idx === 0}
                                    showRight={idx === 1}
                                    onPrev={() => advance(-1)}
                                    onNext={() => advance(1)}
                                />
                            ))}
                        </div>

                        {/* Status bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                {!value.checkIn ? "Select check-in date" :
                                    !value.checkOut ? "Now select check-out date" :
                                        `${nights} night${nights > 1 ? "s" : ""} · ${formatDisplay(value.checkIn)} → ${formatDisplay(value.checkOut)}`}
                            </p>
                            {value.checkIn && value.checkOut && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onDeactivate}
                                    className="text-xs font-bold text-brand-600 hover:text-brand-800"
                                >
                                    Done ✓
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Month Calendar ────────────────────────────────────────────────────────────

function MonthCalendar({
    year, month, today, checkIn, checkOut, hovered, onHover, onClick,
    showLeft, showRight, onPrev, onNext,
}: {
    year: number; month: number; today: Date;
    checkIn: Date | null; checkOut: Date | null;
    hovered: Date | null;
    onHover: (d: Date | null) => void;
    onClick: (d: Date) => void;
    showLeft: boolean; showRight: boolean;
    onPrev: () => void; onNext: () => void;
}) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    const effectiveEnd = checkOut ?? hovered;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                {showLeft ? (
                    <button onClick={onPrev} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                ) : <div />}
                <h4 className="text-sm font-bold text-slate-900">{MONTH_NAMES[month]} {year}</h4>
                {showRight ? (
                    <button onClick={onNext} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                ) : <div />}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d) => (
                    <div key={d} className="text-[10px] font-bold text-slate-400 text-center py-1">{d}</div>
                ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const key = d.toISOString().split("T")[0];
                    const heatScore = priceHeatmap[key] ?? 0.5;
                    const isPast = d < today;
                    const isCI = checkIn && isSameDay(d, checkIn);
                    const isCO = checkOut && isSameDay(d, checkOut);
                    const inRange = isInRange(d, checkIn, effectiveEnd ?? null);
                    const isHov = hovered && isSameDay(d, hovered);

                    return (
                        <motion.button
                            key={key}
                            disabled={isPast}
                            whileHover={isPast ? {} : { scale: 1.15 }}
                            transition={{ duration: 0.1 }}
                            onMouseEnter={() => !isPast && onHover(d)}
                            onMouseLeave={() => onHover(null)}
                            onClick={() => !isPast && onClick(d)}
                            className={cn(
                                "relative flex flex-col items-center justify-center h-9 text-xs font-medium rounded-xl transition-all duration-100",
                                isPast && "opacity-30 cursor-not-allowed",
                                (isCI || isCO) && "bg-brand-600 !text-white font-bold shadow-md shadow-brand-200 z-10",
                                inRange && !isCI && !isCO && "bg-brand-50 text-brand-700 rounded-none",
                                !isCI && !isCO && !inRange && !isPast && priceColor(heatScore),
                                isCI && "rounded-l-xl",
                                isCO && "rounded-r-xl",
                            )}
                        >
                            <span>{d.getDate()}</span>
                            {/* Price dot */}
                            {!isPast && !isCI && !isCO && (
                                <span className={cn(
                                    "w-1 h-1 rounded-full mt-0.5",
                                    heatScore < 0.35 ? "bg-emerald-400" : heatScore < 0.65 ? "bg-amber-400" : "bg-red-400"
                                )} />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}



