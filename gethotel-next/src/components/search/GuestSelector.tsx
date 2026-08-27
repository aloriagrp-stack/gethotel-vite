'use client';


import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Minus, ChevronDown, Baby } from "lucide-react";
import type { GuestConfig, GuestPreset } from "@/types/search";
import { cn } from "@/lib/utils";

interface GuestSelectorProps {
    value: GuestConfig;
    onChange: (g: GuestConfig) => void;
    isActive: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

const PRESETS: { id: GuestPreset; label: string; emoji: string; adults: number; children: number; rooms: number }[] = [
    { id: "solo", label: "Solo Trip", emoji: "🧳", adults: 1, children: 0, rooms: 1 },
    { id: "couple", label: "Couple", emoji: "💑", adults: 2, children: 0, rooms: 1 },
    { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", adults: 2, children: 2, rooms: 1 },
    { id: "business", label: "Business", emoji: "💼", adults: 1, children: 0, rooms: 1 },
];

const CHILD_AGES = Array.from({ length: 18 }, (_, i) => i);

function Counter({
    label, sublabel, value, onChange, min = 0, max = 10,
}: {
    label: string; sublabel?: string; value: number;
    onChange: (n: number) => void; min?: number; max?: number;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
            </div>
            <div className="flex items-center gap-3">
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    disabled={value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 hover:text-brand-600 transition-colors"
                >
                    <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="text-base font-bold text-slate-900 w-5 text-center tabular-nums">{value}</span>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    disabled={value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 hover:text-brand-600 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </motion.button>
            </div>
        </div>
    );
}

function guestSummary(g: GuestConfig): string {
    const parts = [`${g.adults} adult${g.adults > 1 ? "s" : ""}`];
    if (g.children > 0) parts.push(`${g.children} child${g.children > 1 ? "ren" : ""}`);
    parts.push(`${g.rooms} room${g.rooms > 1 ? "s" : ""}`);
    return parts.join(", ");
}

export default function GuestSelector({ value, onChange, isActive, onActivate, onDeactivate }: GuestSelectorProps) {
    const applyPreset = (p: typeof PRESETS[0]) => {
        const childAges = p.children > 0 ? Array.from({ length: p.children }, () => 5) : [];
        onChange({ adults: p.adults, children: p.children, rooms: p.rooms, childAges });
    };

    const updateChildren = (n: number) => {
        const childAges = Array.from({ length: n }, (_, i) => value.childAges[i] ?? 5);
        onChange({ ...value, children: n, childAges });
    };

    const updateChildAge = (idx: number, age: number) => {
        const childAges = [...value.childAges];
        childAges[idx] = age;
        onChange({ ...value, childAges });
    };

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
                    <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guests & Rooms</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{guestSummary(value)}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", isActive && "rotate-180")} />
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] border border-slate-100 z-[100] p-5"
                    >
                        {/* Preset Pills */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {PRESETS.map((p) => {
                                const active =
                                    value.adults === p.adults &&
                                    value.children === p.children &&
                                    value.rooms === p.rooms;
                                return (
                                    <motion.button
                                        key={p.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => applyPreset(p)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-xs font-medium transition-all",
                                            active
                                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <span className="text-lg">{p.emoji}</span>
                                        <span className="leading-tight text-center">{p.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Counters */}
                        <div className="bg-slate-50/60 rounded-2xl px-4">
                            <Counter
                                label="Adults"
                                sublabel="Ages 18+"
                                value={value.adults}
                                onChange={(n) => onChange({ ...value, adults: n })}
                                min={1}
                            />
                            <Counter
                                label="Children"
                                sublabel="Ages 0–17"
                                value={value.children}
                                onChange={updateChildren}
                            />
                            <Counter
                                label="Rooms"
                                value={value.rooms}
                                onChange={(n) => onChange({ ...value, rooms: n })}
                                min={1}
                            />
                        </div>

                        {/* Child age selectors */}
                        <AnimatePresence>
                            {value.children > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-3 bg-amber-50 rounded-2xl">
                                        <p className="text-[11px] font-bold text-amber-700 mb-2 flex items-center gap-1">
                                            <Baby className="w-3.5 h-3.5" /> Child ages at time of stay
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {value.childAges.map((age, idx) => (
                                                <select
                                                    key={idx}
                                                    value={age}
                                                    onChange={(e) => updateChildAge(idx, +e.target.value)}
                                                    className="text-xs font-semibold bg-white border border-amber-200 rounded-lg px-2 py-1 text-amber-800 outline-none focus:ring-1 focus:ring-amber-400"
                                                >
                                                    {CHILD_AGES.map((a) => (
                                                        <option key={a} value={a}>{a === 0 ? "< 1 yr" : `${a} yr${a > 1 ? "s" : ""}`}</option>
                                                    ))}
                                                </select>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Done */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={onDeactivate}
                            className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-2xl transition-colors"
                        >
                            Done · {guestSummary(value)}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



