import config from "@/data/delhiSeoConfig.json";
import { SITE, buildBreadcrumbSchema, buildFAQSchema } from "./seo";
import { getHotelUrl, safeParse } from "./utils";

/**
 * Delhi SEO engine — drives landing-page generation, inventory-gated
 * indexability, sitemap inclusion, schema output, internal linking and the
 * SEO dashboard. All content and thresholds come from delhiSeoConfig.json.
 */

export interface DelhiSection { h2: string; text: string; }
export interface DelhiFaq { question: string; answer: string; }
export interface DelhiTour { label: string; url: string; }
export interface DelhiLandmark { name: string; distance: string; }
export interface DelhiCategoryMatch {
    priceMax?: number;
    starMin?: number;
    roomOccupancyMin?: number;
    amenityKeywords?: string[];
}
export type DelhiContentQuality = "high" | "medium" | "low";
export type DelhiPageType = "area" | "landmark" | "airport" | "rail" | "hospital" | "category";

export interface DelhiHubPage {
    slug: "";
    type: "hub";
    priority: 1;
    primaryKeyword: string;
    keywords: string[];
    title: string;
    metaDescription: string;
    h1: string;
    introduction: string;
    sections: DelhiSection[];
    faqs: DelhiFaq[];
    sitemapPriority: string;
    requiredInventory: number;
    relatedSlugs: string[];
    tours: DelhiTour[];
    whyStay: string;
    landmarks: string[];
    metros: string[];
    transport: string[];
    lastUpdated: string;
    contentQuality: DelhiContentQuality;
}

export interface DelhiPage {
    slug: string;
    type: DelhiPageType;
    priority: 1 | 2 | 3;
    primaryKeyword: string;
    keywords: string[];
    title: string;
    metaDescription: string;
    h1: string;
    introduction: string;
    sections: DelhiSection[];
    faqs: DelhiFaq[];
    matchPatterns: string[];
    requiredInventory: number;
    relatedSlugs: string[];
    tours: DelhiTour[];
    whyStay: string;
    landmarks: DelhiLandmark[];
    metros: string[];
    transport: string[];
    categoryMatch?: DelhiCategoryMatch;
    medicalNote?: boolean;
    lastUpdated: string;
    contentQuality: DelhiContentQuality;
}

export type DelhiPageLike = DelhiHubPage | DelhiPage;

export interface DelhiHotelInput {
    id: number | string;
    name: string;
    city?: string | null;
    address?: string | null;
    pricePerNight?: number | null;
    starRating?: number | null;
    guestRating?: number | null;
    reviewCount?: number | null;
    thumbnail?: string | null;
    amenities?: string[] | string | null;
    mainAmenities?: string[] | string | null;
    rooms?: { pricePerNight?: number | null; maxOccupancy?: number | null; status?: string | null }[] | null;
    [key: string]: any;
}

const hub = config.hub as unknown as DelhiHubPage;
const pages = config.pages as unknown as DelhiPage[];

export const DELHI_META = config.meta;

/** All config pages (hub excluded). */
export function delhiPages(): DelhiPage[] { return pages; }

export function delhiHub(): DelhiHubPage { return hub; }

export function getDelhiPage(slug?: string): DelhiPageLike | null {
    if (!slug || slug === "") return hub;
    return pages.find((p) => p.slug === slug) ?? null;
}

export function isHubPage(page: DelhiPageLike): page is DelhiHubPage {
    return page.type === "hub";
}

export function delhiPagePath(lang: string, slug?: string): string {
    return `/${lang}/hotels/delhi${slug ? `/${slug}` : ""}`;
}

export function delhiCanonicalUrl(lang: string, slug?: string): string {
    return `${SITE.url}${delhiPagePath(lang, slug)}`;
}

/** Short anchor label used for internal links (keyword-anchored). */
export function delhiPageLinkLabel(page: DelhiPageLike): string {
    return page.primaryKeyword;
}

const DEFAULT_PRICE = 1;

/** Real bookable price for a hotel: hotel.pricePerNight when > 1, else cheapest room price > 1, else null. */
export function getEffectivePrice(hotel: DelhiHotelInput): number | null {
    const hotelPrice = typeof hotel.pricePerNight === "number" ? hotel.pricePerNight : null;
    if (hotelPrice !== null && hotelPrice > DEFAULT_PRICE) return hotelPrice;
    if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0) {
        let min: number | null = null;
        for (const room of hotel.rooms) {
            const p = typeof room?.pricePerNight === "number" ? room.pricePerNight : null;
            if (p !== null && p > DEFAULT_PRICE) {
                min = min === null ? p : Math.min(min, p);
            }
        }
        if (min !== null) return min;
    }
    return null;
}

/** Max confirmed guest capacity across rooms (for family/occupancy matching). */
function getMaxOccupancy(hotel: DelhiHotelInput): number | null {
    if (!Array.isArray(hotel.rooms) || hotel.rooms.length === 0) return null;
    let max: number | null = null;
    for (const room of hotel.rooms) {
        const o = typeof room?.maxOccupancy === "number" ? room.maxOccupancy : null;
        if (o !== null) max = max === null ? o : Math.max(max, o);
    }
    return max;
}

function normalizeAmenities(value: string[] | string | null | undefined): string {
    const list = safeParse(value, []);
    if (Array.isArray(list)) return list.join(" ").toLowerCase();
    return String(list ?? "").toLowerCase();
}

function hotelSearchText(hotel: DelhiHotelInput): string {
    return `${hotel.city ?? ""} ${hotel.address ?? ""}`.toLowerCase();
}

function hotelAmenityText(hotel: DelhiHotelInput): string {
    const parts = [normalizeAmenities(hotel.amenities), normalizeAmenities(hotel.mainAmenities)];
    if (typeof hotel.dining === "string") parts.push(hotel.dining.toLowerCase());
    return parts.join(" ");
}

function matchesCategory(hotel: DelhiHotelInput, cm: DelhiCategoryMatch): boolean {
    if (cm.priceMax !== undefined) {
        const p = getEffectivePrice(hotel);
        if (p === null || p > cm.priceMax) return false;
    }
    if (cm.starMin !== undefined) {
        const s = typeof hotel.starRating === "number" ? hotel.starRating : null;
        if (s === null || s < cm.starMin) return false;
    }
    if (cm.roomOccupancyMin !== undefined) {
        const o = getMaxOccupancy(hotel);
        if (o === null || o < cm.roomOccupancyMin) return false;
    }
    if (Array.isArray(cm.amenityKeywords) && cm.amenityKeywords.length > 0) {
        const text = hotelAmenityText(hotel);
        if (!cm.amenityKeywords.some((k) => text.includes(k.toLowerCase()))) return false;
    }
    return true;
}

/** Whether a hotel genuinely belongs to a Delhi page. */
export function matchesDelhiPage(hotel: DelhiHotelInput, page: DelhiPageLike): boolean {
    if (isHubPage(page)) return true;
    if (page.categoryMatch) return matchesCategory(hotel, page.categoryMatch);
    if (!Array.isArray(page.matchPatterns) || page.matchPatterns.length === 0) return true;
    const text = hotelSearchText(hotel);
    return page.matchPatterns.some((p) => text.includes(p.toLowerCase()));
}

export function delhiMatchedHotels(hotels: DelhiHotelInput[], page: DelhiPageLike): DelhiHotelInput[] {
    return hotels.filter((h) => matchesDelhiPage(h, page));
}

/** Minimum real price among hotels, or null when no real price exists. */
export function getDelhiFromPrice(hotels: DelhiHotelInput[]): number | null {
    let min: number | null = null;
    for (const h of hotels) {
        const p = getEffectivePrice(h);
        if (p !== null) min = min === null ? p : Math.min(min, p);
    }
    return min;
}

/** Indexability quality gate: real inventory >= requiredInventory. */
export function isDelhiPageIndexable(page: DelhiPageLike, count: number): boolean {
    if (page.requiredInventory <= 0) return true;
    return count >= page.requiredInventory;
}

export function formatInr(amount: number): string {
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

export interface DelhiTemplateContext {
    count: number;
    fromPrice: number | null;
}

/** Fills {count} and ₹X placeholders. Never invents a price when none is available. */
export function fillDelhiTemplate(text: string, ctx: DelhiTemplateContext): string {
    let out = text.replaceAll("{count}", String(ctx.count));
    if (ctx.fromPrice !== null) {
        out = out.replaceAll("₹X", formatInr(ctx.fromPrice));
    } else {
        out = out.replace(" from ₹X", "");
        out = out.replaceAll("₹X", "honest live rates");
    }
    return out;
}

export interface DelhiRenderContext extends DelhiTemplateContext {
    page: DelhiPageLike;
    indexable: boolean;
    matched: DelhiHotelInput[];
    title: string;
    metaDescription: string;
    h1: string;
    introduction: string;
    faqs: DelhiFaq[];
}

/** Full computed context for a Delhi page from live hotel inventory. */
export function buildDelhiContext(hotels: DelhiHotelInput[], slug?: string): DelhiRenderContext | null {
    const page = getDelhiPage(slug);
    if (!page) return null;
    const matched = delhiMatchedHotels(hotels, page);
    const count = matched.length;
    const fromPrice = getDelhiFromPrice(matched);
    const tpl: DelhiTemplateContext = { count, fromPrice };
    return {
        page,
        indexable: isDelhiPageIndexable(page, count),
        matched,
        count,
        fromPrice,
        title: fillDelhiTemplate(page.title, tpl),
        metaDescription: fillDelhiTemplate(page.metaDescription, tpl),
        h1: fillDelhiTemplate(page.h1, tpl),
        introduction: fillDelhiTemplate(page.introduction, tpl),
        faqs: page.faqs.map((f) => ({ question: fillDelhiTemplate(f.question, tpl), answer: fillDelhiTemplate(f.answer, tpl) })),
    };
}

/** Schema.org output for a Delhi page (breadcrumb, CollectionPage, ItemList, FAQ). */
export function buildDelhiSchemas(ctx: DelhiRenderContext, lang: string): object[] {
    const page = ctx.page;
    const path = delhiPagePath(lang, page.slug);
    const schemas: object[] = [];

    const crumbs = [
        { name: "Home", url: "/" },
        { name: "Hotels", url: `/${lang}/hotels` },
        { name: "Hotels in Delhi", url: `/${lang}/hotels/delhi` },
    ];
    if (!isHubPage(page)) {
        crumbs.push({ name: ctx.h1.split("—")[0].trim(), url: path });
    }
    schemas.push(buildBreadcrumbSchema(crumbs));

    schemas.push({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE.url}${path}`,
        url: `${SITE.url}${path}`,
        name: ctx.title,
        description: ctx.metaDescription,
        numberOfItems: ctx.count,
        about: { "@type": "City", name: "Delhi", containedInPlace: { "@type": "Country", name: "India" } },
        isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    });

    if (ctx.matched.length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            numberOfItems: ctx.matched.length,
            itemListElement: ctx.matched.slice(0, 12).map((h, i) => {
                const item: any = {
                    "@type": "ListItem",
                    position: i + 1,
                    name: h.name,
                    url: `${SITE.url}${getHotelUrl(h.id, h.name)}`,
                };
                const p = getEffectivePrice(h);
                if (p !== null) {
                    item.offers = { "@type": "Offer", price: String(p), priceCurrency: "INR" };
                }
                return item;
            }),
        });
    }

    if (ctx.indexable && ctx.faqs.length >= 2) {
        schemas.push(buildFAQSchema(ctx.faqs));
    }

    return schemas;
}

/** Sitemap entries for indexable Delhi pages. */
export function buildDelhiSitemapEntries(hotels: DelhiHotelInput[], lang = "en"): { url: string; priority: string }[] {
    const entries: { url: string; priority: string }[] = [];
    const h = delhiHub();
    if (isDelhiPageIndexable(h, hotels.length)) {
        entries.push({ url: delhiPagePath(lang), priority: h.sitemapPriority });
    }
    for (const page of pages) {
        const count = delhiMatchedHotels(hotels, page).length;
        if (isDelhiPageIndexable(page, count)) {
            entries.push({ url: delhiPagePath(lang, page.slug), priority: String(page.priority === 1 ? 0.9 : page.priority === 2 ? 0.8 : 0.7) });
        }
    }
    return entries;
}

/**
 * Legacy URL → canonical target. Value is either a Delhi page slug or a full
 * path (when an existing canonical page should win, e.g. couple-friendly/hourly).
 */
export const DELHI_LEGACY_ALIASES: Record<string, string> = {
    "delhi-hotels": "",
    "hotels-in-connaught-place-delhi": "connaught-place",
    "hotels-in-karol-bagh-delhi": "karol-bagh",
    "hotels-in-south-delhi": "south-delhi",
    "hotels-near-delhi-airport": "near-delhi-airport",
    "hotels-near-new-delhi-railway-station": "near-new-delhi-railway-station",
    "hotels-in-delhi": "",
    "hotels-in-delhi/budget": "budget",
    "hotels-in-delhi/luxury": "luxury",
    "hotels-in-delhi/family": "family",
    "hotels-in-delhi/business": "business",
    "hotels-in-delhi/hourly": "/hourly-hotels-in-delhi",
    "hotels-in-delhi/couple-friendly": "/couple-friendly-hotels-in-delhi",
};

/** Resolve a legacy path to its canonical destination (slug or full path). */
export function resolveDelhiLegacy(path: string): string | null {
    const p = path.replace(/^\//, "").replace(/\/$/, "");
    if (!(p in DELHI_LEGACY_ALIASES)) return null;
    const target = DELHI_LEGACY_ALIASES[p];
    return target.startsWith("/") ? target : delhiPagePath("en", target || undefined);
}

/** Keyword → URL resolver (exact match against primary keywords and keyword lists). */
export function resolveDelhiKeywordUrl(keyword: string, lang = "en"): string | null {
    const k = keyword.toLowerCase().trim();
    const candidates: DelhiPageLike[] = [hub, ...pages];
    for (const p of candidates) {
        if (p.primaryKeyword.toLowerCase() === k) return delhiPagePath(lang, p.slug || undefined);
    }
    for (const p of candidates) {
        if (p.keywords.some((kw) => kw.toLowerCase() === k)) return delhiPagePath(lang, p.slug || undefined);
    }
    return null;
}

/* ─────────────────────── Inventory loading (SSR + dashboard) ─────────────────────── */

const INVENTORY_TTL_MS = 5 * 60 * 1000;

let inventoryCache: { hotels: DelhiHotelInput[]; fetchedAt: number } | null = null;

export function getDelhiInventory(): DelhiHotelInput[] {
    return inventoryCache?.hotels ?? [];
}

export function setDelhiInventory(hotels: DelhiHotelInput[]): void {
    inventoryCache = { hotels, fetchedAt: Date.now() };
}

function delhiApiBase(): string {
    const g = globalThis as any;
    if (typeof g?.process?.env?.GHS_API_URL === "string" && g.process.env.GHS_API_URL) {
        return g.process.env.GHS_API_URL;
    }
    return import.meta.env.MODE === "production" ? "https://gethotelstays.com/api" : "http://localhost:5000/api";
}

export function normalizeDelhiHotels(data: any[] | undefined | null): DelhiHotelInput[] {
    if (!Array.isArray(data)) return [];
    return data
        .filter((h) => h && h.id && h.name)
        .map((h) => {
            const rooms = Array.isArray(h.rooms)
                ? h.rooms.map((r: any) => ({
                    pricePerNight: typeof r?.pricePerNight === "number" ? r.pricePerNight : null,
                    maxOccupancy: typeof r?.maxOccupancy === "number" ? r.maxOccupancy : null,
                    status: r?.status ?? null,
                }))
                : null;
            return { ...h, rooms };
        });
}

/**
 * Best-effort load of the live Delhi inventory (cached). Returns the stored
 * list on failure so callers can render conservatively (noindex).
 */
export async function loadDelhiInventory(force = false): Promise<DelhiHotelInput[]> {
    const now = Date.now();
    if (!force && inventoryCache && now - inventoryCache.fetchedAt < INVENTORY_TTL_MS) {
        return inventoryCache.hotels;
    }
    try {
        const res = await fetch(`${delhiApiBase()}/hotels/search?city=Delhi&limit=200&unblock-debug=1`, {
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(12000),
        });
        const json: any = await res.json();
        if (res.ok && json?.success && Array.isArray(json.data)) {
            const hotels = normalizeDelhiHotels(json.data);
            setDelhiInventory(hotels);
            return hotels;
        }
        return getDelhiInventory();
    } catch (err) {
        console.error("[delhiSeo] Failed to load Delhi inventory:", err);
        return getDelhiInventory();
    }
}
