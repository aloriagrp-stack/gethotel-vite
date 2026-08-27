'use client';


import { motion } from "framer-motion";
import { quickActions } from "@/data/searchMockData";
import type { QuickAction, SmartSearchState } from "@/types/search";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
    onApply: (action: QuickAction, updates: Partial<SmartSearchState>) => void;
}

export default function QuickActions({ onApply }: QuickActionsProps) {
    const handle = (action: QuickAction) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + (action.nights ?? 2));

        // Next Friday for weekend actions
        const nextFri = new Date();
        const daysToFri = (5 - nextFri.getDay() + 7) % 7 || 7;
        nextFri.setDate(nextFri.getDate() + daysToFri);
        nextFri.setHours(0, 0, 0, 0);
        const nextSun = new Date(nextFri);
        nextSun.setDate(nextSun.getDate() + 2);

        let updates: Partial<SmartSearchState> = {};

        switch (action.id) {
            case "tonight":
                updates = {
                    destination: { id: "mumbai", label: "Mumbai", sublabel: "3,800 hotels", category: "city", emoji: "🌆" },
                    dates: { checkIn: tomorrow, checkOut: dayAfter },
                };
                break;
            case "weekend":
                updates = {
                    dates: { checkIn: nextFri, checkOut: nextSun },
                };
                break;
            case "fivestar":
                updates = {
                    destination: { id: "udaipur", label: "Udaipur", sublabel: "5-Star Stays", category: "city", emoji: "⭐" },
                };
                break;
            case "business":
                updates = {
                    destination: { id: "bangalore", label: "Bangalore", sublabel: "Business Stays", category: "city", emoji: "💼" },
                    guests: { adults: 1, children: 0, rooms: 1, childAges: [] },
                };
                break;
        }

        onApply(action, updates);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest shrink-0">Quick:</span>
            {quickActions.map((action, i) => (
                <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handle(action)}
                    className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all",
                        "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40",
                        "backdrop-blur-sm shadow-sm"
                    )}
                >
                    <span>{action.icon}</span>
                    {action.label}
                </motion.button>
            ))}
        </div>
    );
}



