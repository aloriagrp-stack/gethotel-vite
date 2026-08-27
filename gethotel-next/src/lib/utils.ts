import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency?: string): string {
    const targetCurrency = currency && currency !== "INR" 
        ? currency 
        : (typeof window !== "undefined" ? (localStorage.getItem("user-currency") || "INR") : "INR");

    let convertedAmount = amount;
    if (targetCurrency !== "INR") {
        const rateStr = typeof window !== "undefined" ? localStorage.getItem("currency-rate") : null;
        const rate = rateStr ? parseFloat(rateStr) : 1;
        convertedAmount = amount * rate;
    }

    const localeMap: Record<string, string> = {
        INR: "en-IN",
        USD: "en-US",
        EUR: "es-ES",
        MXN: "es-MX",
        GBP: "en-GB",
        JPY: "ja-JP",
        AED: "ar-AE",
        RUB: "ru-RU",
    };
    const locale = localeMap[targetCurrency] || "en-US";

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: targetCurrency,
        maximumFractionDigits: 0,
    }).format(convertedAmount || 0);
}

export function formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "";
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function formatDateLocal(date: Date | null | string): string {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function ratingLabel(rating: number): string {
    if (rating >= 9.5) return "Exceptional";
    if (rating >= 9) return "Superb";
    if (rating >= 8.5) return "Excellent";
    if (rating >= 8) return "Very Good";
    if (rating >= 7) return "Good";
    return "Fair";
}

export function ratingColor(rating: number): string {
    if (rating >= 9) return "bg-emerald-600";
    if (rating >= 8) return "bg-green-600";
    if (rating >= 7) return "bg-yellow-500";
    return "bg-orange-500";
}

export function statusColor(status: string): {
    bg: string;
    text: string;
    border: string;
} {
    switch (status) {
        case "confirmed":
            return {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
            };
        case "pending":
            return {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
            };
        case "cancelled":
            return {
                bg: "bg-red-50",
                text: "text-red-700",
                border: "border-red-200",
            };
        case "completed":
            return {
                bg: "bg-sky-50",
                text: "text-sky-700",
                border: "border-sky-200",
            };
        default:
            return {
                bg: "bg-slate-50",
                text: "text-slate-700",
                border: "border-slate-200",
            };
    }
}

export function amenityIcon(amenity: string): string {
    const icons: Record<string, string> = {
        wifi: "📶",
        pool: "🏊",
        spa: "💆",
        gym: "🏋️",
        restaurant: "🍽️",
        bar: "🍹",
        parking: "🅿️",
        airport_shuttle: "🚌",
        pet_friendly: "🐾",
        air_conditioning: "❄️",
        room_service: "🛎️",
        laundry: "👕",
        conference_room: "💼",
        ev_charging: "⚡",
        beach_access: "🏖️",
        kids_club: "🧒",
        cctv: "🛡️",
        balcony: "🖼️",
        terrace: "🏡",
        breakfast: "🍳",
        geyser: "🚿",
    };
    return icons[amenity] ?? "✓";
}

export function amenityLabel(amenity: string): string {
    const labels: Record<string, string> = {
        wifi: "Free Wi-Fi",
        pool: "Swimming Pool",
        spa: "Spa & Wellness",
        gym: "Fitness Center",
        restaurant: "Restaurant",
        bar: "Bar & Lounge",
        parking: "Free Parking",
        airport_shuttle: "Airport Shuttle",
        pet_friendly: "Pet Friendly",
        air_conditioning: "Air Conditioning",
        room_service: "24/7 Room Service",
        laundry: "Laundry Service",
        conference_room: "Conference Room",
        ev_charging: "EV Charging",
        beach_access: "Beach Access",
        kids_club: "Kids Club",
        cctv: "CCTV Camera",
        balcony: "Private Balcony",
        terrace: "Garden Terrace",
        breakfast: "Free Breakfast",
        geyser: "Geyser/Hot Water",
    };
    return labels[amenity] ?? amenity;
}

export function safeParse(data: any, fallback: any = []) {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return data;
    
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            // Recursive check for double-encoded strings
            if (typeof parsed === 'string') return safeParse(parsed, fallback);
            return parsed || fallback;
        } catch (e) {
            // Handle comma-separated fallback for images if needed
            if (data.includes(',') && Array.isArray(fallback) && fallback.length === 0) {
                return data.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            return fallback;
        }
    }
    return data;
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function getHotelUrl(id: number | string, name?: string): string {
    if (!name) return `/hotel/${id}`;
    return `/hotel/${slugify(name)}`;
}

