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
