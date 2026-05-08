// ─── Search Bar Types ─────────────────────────────────────────────────────────

export type SuggestionCategory =
    | "city"
    | "hotel"
    | "landmark"
    | "trending"
    | "nearby"
    | "recent";

export interface SearchSuggestion {
    id: string;
    label: string;
    sublabel?: string;
    category: SuggestionCategory;
    thumbnail?: string;
    emoji?: string;
    trending?: boolean;
}

export interface DateRange {
    checkIn: Date | null;
    checkOut: Date | null;
}

export interface GuestConfig {
    adults: number;
    children: number;
    rooms: number;
    childAges: number[];
}

export type GuestPreset = "solo" | "couple" | "family" | "business";

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    city?: string;
    maxPrice?: number;
    starRating?: number;
    tag?: string;
    nights?: number;
}

export type AIHintType = "rising" | "demand" | "besttime" | "deal";

export interface AIHint {
    type: AIHintType;
    label: string;
    color: string;
    pulse: boolean;
}

export interface SmartSearchState {
    destination: SearchSuggestion | null;
    dates: DateRange;
    guests: GuestConfig;
}

// Price heatmap: date string → price scalar (0 = cheapest, 1 = most expensive)
export type PriceHeatmap = Record<string, number>;
