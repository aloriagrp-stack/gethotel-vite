import type { SearchSuggestion, QuickAction, AIHint, PriceHeatmap } from "@/types/search";

// ─── Suggestions ──────────────────────────────────────────────────────────────

export const destinations: SearchSuggestion[] = [
    // Cities
    { id: "goa", label: "Goa", sublabel: "1,240 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=60&q=70", emoji: "🏖️" },
    { id: "mumbai", label: "Mumbai", sublabel: "3,800 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=60&q=70", emoji: "🌆" },
    { id: "jaipur", label: "Jaipur", sublabel: "980 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1477587458883-47145ed6979e?w=60&q=70", emoji: "🏰" },
    { id: "delhi", label: "Delhi", sublabel: "4,200 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=60&q=70", emoji: "🏛️" },
    { id: "kerala", label: "Kerala", sublabel: "760 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=60&q=70", emoji: "🌿" },
    { id: "shimla", label: "Shimla", sublabel: "430 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=60&q=70", emoji: "🏔️" },
    { id: "udaipur", label: "Udaipur", sublabel: "510 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1548013146-72479768bada?w=60&q=70", emoji: "🏯" },
    { id: "bangalore", label: "Bangalore", sublabel: "2,100 hotels", category: "city", thumbnail: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=60&q=70", emoji: "🌸" },
    // Hotels
    { id: "taj-goa", label: "Taj Exotica Goa", sublabel: "Benaulim, Goa · ⭐⭐⭐⭐⭐", category: "hotel", thumbnail: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=60&q=70" },
    { id: "obs-udai", label: "Oberoi Udaivilas", sublabel: "Udaipur · ⭐⭐⭐⭐⭐", category: "hotel", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=70" },
    { id: "leela-che", label: "The Leela Palace", sublabel: "Chennai · ⭐⭐⭐⭐⭐", category: "hotel", thumbnail: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=60&q=70" },
    // Landmarks
    { id: "hawa-m", label: "Hawa Mahal Area", sublabel: "Landmark · Jaipur", category: "landmark", thumbnail: "https://images.unsplash.com/photo-1477587458883-47145ed6979e?w=60&q=70", emoji: "🗺️" },
    { id: "marine-d", label: "Marine Drive", sublabel: "Landmark · Mumbai", category: "landmark", thumbnail: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=60&q=70", emoji: "🗺️" },
    // Trending
    { id: "t-kasoh", label: "Kasauli", sublabel: "Trending this weekend 🔥", category: "trending", thumbnail: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=60&q=70", trending: true },
    { id: "t-auro", label: "Auroville", sublabel: "Most searched today", category: "trending", thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=60&q=70", trending: true },
];

export const recentSearches: SearchSuggestion[] = [
    { id: "r-goa", label: "Goa", sublabel: "Searched 2 days ago", category: "recent", emoji: "🕐" },
    { id: "r-mum", label: "Mumbai", sublabel: "Searched last week", category: "recent", emoji: "🕐" },
];

// ─── Price Heatmap ────────────────────────────────────────────────────────────
// Generates mock price scalars (0 = green/cheapest, 1 = red/expensive) for next 60 days

function generateHeatmap(): PriceHeatmap {
    const map: PriceHeatmap = {};
    const now = new Date();
    for (let i = 0; i < 60; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const dow = d.getDay();
        // Weekends are pricier
        const base = dow === 0 || dow === 6 ? 0.65 : 0.3;
        map[key] = Math.min(1, base + Math.random() * 0.35);
    }
    return map;
}

export const priceHeatmap: PriceHeatmap = generateHeatmap();

// ─── Quick Actions ────────────────────────────────────────────────────────────

export const quickActions: QuickAction[] = [
    { id: "tonight", label: "Tonight Near Me", icon: "🌙", city: "Mumbai", nights: 1 },
    { id: "weekend", label: "Weekend Under ₹3,000", icon: "🎯", maxPrice: 3000, nights: 2 },
    { id: "fivestar", label: "5-Star Deals", icon: "⭐", starRating: 5 },
    { id: "business", label: "Business Stays", icon: "💼", tag: "business" },
];

// ─── AI Hints ────────────────────────────────────────────────────────────────

export const aiHints: AIHint[] = [
    { type: "rising", label: "Prices rising soon ↑", color: "bg-amber-500", pulse: true },
    { type: "demand", label: "High demand this weekend", color: "bg-red-500", pulse: true },
    { type: "besttime", label: "📅 Best time to book", color: "bg-emerald-600", pulse: false },
    { type: "deal", label: "🔥 Limited deals left", color: "bg-brand-600", pulse: true },
];

// ─── Date Presets ────────────────────────────────────────────────────────────

export function getDatePreset(id: string): { checkIn: Date; checkOut: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addDays = (d: Date, n: number) => {
        const r = new Date(d);
        r.setDate(r.getDate() + n);
        return r;
    };

    const nextWeekday = (d: Date, target: number) => {
        const result = new Date(d);
        const diff = (target - result.getDay() + 7) % 7 || 7;
        result.setDate(result.getDate() + diff);
        return result;
    };

    switch (id) {
        case "this-weekend": {
            const fri = nextWeekday(today, 5);
            return { checkIn: fri, checkOut: addDays(fri, 2) };
        }
        case "next-weekend": {
            const fri = nextWeekday(today, 5);
            const nextFri = addDays(fri, 7);
            return { checkIn: nextFri, checkOut: addDays(nextFri, 2) };
        }
        case "cheapest": {
            // Pick cheapest 2-night window in next 30 days
            let best = { day: today, score: 999 };
            for (let i = 1; i < 30; i++) {
                const d = addDays(today, i);
                const k1 = d.toISOString().split("T")[0];
                const k2 = addDays(d, 1).toISOString().split("T")[0];
                const score = (priceHeatmap[k1] ?? 0.5) + (priceHeatmap[k2] ?? 0.5);
                if (score < best.score) best = { day: d, score };
            }
            return { checkIn: best.day, checkOut: addDays(best.day, 2) };
        }
        case "flexible":
        default: {
            return { checkIn: addDays(today, 3), checkOut: addDays(today, 5) };
        }
    }
}
