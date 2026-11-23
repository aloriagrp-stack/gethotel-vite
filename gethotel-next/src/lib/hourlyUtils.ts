export const HOURLY_TIME_SLOTS = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
];

export const MIN_HOURLY_LEAD_HOURS = 4;

/**
 * Parses date + time string into a Date object.
 * Supports:
 * - "02:00 PM", "2:00 PM", "@ 02:00 PM"
 * - "14:00", "14:30"
 * - "2:00 PM - 3:00 PM"
 */
export function parseSlotDateTime(date: Date | string, timeStr: string): Date {
    const baseDate = typeof date === 'string' ? new Date(date) : new Date(date);
    let clean = (timeStr || "12:00 PM").replace(/^@\s*/, '').trim();
    if (clean.includes("-")) {
        clean = clean.split("-")[0].trim();
    }
    
    const parts = clean.split(" ");
    const timePart = parts[0] || "12:00";
    const modifier = parts[1]; // AM / PM

    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr || "0", 10);

    if (modifier) {
        if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    const slotDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0);
    return slotDate;
}

/**
 * Checks if a given time slot has at least 4 hours advance notice.
 */
export function isHourlySlotAllowed(date: Date | string, timeStr: string, minLeadHours = MIN_HOURLY_LEAD_HOURS): boolean {
    const slotDate = parseSlotDateTime(date, timeStr);
    const minAllowedTime = new Date(Date.now() + minLeadHours * 60 * 60 * 1000);
    return slotDate.getTime() >= minAllowedTime.getTime();
}

/**
 * Checks if a date has at least one valid slot (latest slot 11:00 PM >= Now + 4 hours).
 */
export function isHourlyDateAllowed(date: Date | string, minLeadHours = MIN_HOURLY_LEAD_HOURS): boolean {
    return isHourlySlotAllowed(date, "11:00 PM", minLeadHours);
}

/**
 * Returns the earliest valid date & time slot for hourly bookings (>= 4 hours from now).
 */
export function getEarliestHourlySlot(minLeadHours = MIN_HOURLY_LEAD_HOURS): { date: Date; timeStr: string } {
    const check = new Date();
    check.setHours(0, 0, 0, 0);

    for (let d = 0; d < 30; d++) {
        const candidateDate = new Date(check);
        candidateDate.setDate(candidateDate.getDate() + d);
        if (isHourlyDateAllowed(candidateDate, minLeadHours)) {
            for (const slot of HOURLY_TIME_SLOTS) {
                if (isHourlySlotAllowed(candidateDate, slot, minLeadHours)) {
                    return { date: candidateDate, timeStr: slot };
                }
            }
        }
    }

    const fallback = new Date(Date.now() + minLeadHours * 60 * 60 * 1000);
    return { date: fallback, timeStr: "12:00 PM" };
}

/**
 * Formats a date to YYYY-MM-DD using local time zone.
 */
export function formatLocalDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export interface SanitizedHourlyRates {
    r3: number;
    r6: number;
    r12: number;
    rates: { "3": number; "6": number; "12": number };
    getPrice: (dur: string | number) => number;
}

/**
 * Strict Market-Standard Sanity & Strict Hierarchy Guarantee:
 * Mathematically guarantees: Rate(3h) < Rate(6h) < Rate(12h)
 * Used across HotelCard, HotelDetailContent, and checkout to ensure 100% price parity.
 */
export function getSanitizedHourlyRates(hotelOrRoom: any, fallbackNightly?: number): SanitizedHourlyRates {
    const safeParse = (val: any, fallback: any) => {
        if (!val) return fallback;
        if (typeof val === 'object') return val;
        try { return JSON.parse(val); } catch { return fallback; }
    };

    // 1. Extract raw hourly rates from hotel or room
    const directRates = typeof hotelOrRoom?.hourlyRates === 'string'
        ? safeParse(hotelOrRoom.hourlyRates, {})
        : (hotelOrRoom?.hourlyRates || safeParse(hotelOrRoom?.hourly_rates, {}));

    const nightly = Number(hotelOrRoom?.pricePerNight || fallbackNightly || 1499);

    let raw3 = Number(directRates?.['3'] || directRates?.[3] || 0);
    let raw6 = Number(directRates?.['6'] || directRates?.[6] || 0);
    let raw12 = Number(directRates?.['12'] || directRates?.[12] || 0);

    // 2. Sanitize 3-Hour Slot (Realistic budget range ₹499 - ₹2,200)
    let r3 = raw3;
    if (!r3 || r3 < 400 || r3 > 2200 || r3 >= nightly) {
        r3 = Math.max(499, Math.min(2200, Math.round(nightly * 0.32)));
    }

    // 3. Sanitize 6-Hour Slot (Strictly > r3, realistic range)
    let r6 = raw6;
    const minSensibleR6 = Math.max(r3 + 200, Math.round(r3 * 1.30));
    if (!r6 || r6 <= r3 || r6 > 3200 || r6 >= nightly) {
        r6 = Math.max(minSensibleR6, Math.round(nightly * 0.48));
    }
    // Hard guarantee: r6 must strictly exceed r3
    if (r6 <= r3) {
        r6 = Math.round(r3 * 1.35);
    }

    // 4. Sanitize 12-Hour Slot (Strictly > r6)
    let r12 = raw12;
    const minSensibleR12 = Math.max(r6 + 250, Math.round(r6 * 1.25));
    if (!r12 || r12 <= r6 || r12 > 4500) {
        r12 = Math.max(minSensibleR12, Math.round(nightly * 0.68));
    }
    // Hard guarantee: r12 must strictly exceed r6
    if (r12 <= r6) {
        r12 = Math.round(r6 * 1.30);
    }

    const rates = { "3": r3, "6": r6, "12": r12 };

    const getPrice = (dur: string | number): number => {
        const d = String(dur);
        if (d === "12") return r12;
        if (d === "6") return r6;
        return r3;
    };

    return { r3, r6, r12, rates, getPrice };
}

