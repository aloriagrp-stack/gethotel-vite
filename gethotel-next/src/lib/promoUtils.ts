// Promotional coupon validation utilities

export const isMobileDevice = (): boolean => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
};

export interface StayDetails {
    checkIn: string; // ISO format date string (e.g. YYYY-MM-DD)
    checkOut: string; // ISO format date string
    basePrice: number; // Subtotal price of the stay before discount
    nights: number;
    roomId?: string | number;
}

export interface ValidationResult {
    valid: boolean;
    reason?: string;
}

/**
 * Validates a coupon against a specific booking/stay parameters
 */
export const validateCoupon = (coupon: any, stay: StayDetails): ValidationResult => {
    // 1. Check coupon activity status
    const isActive = coupon.isActive !== false && coupon.status !== 'inactive';
    if (!isActive) {
        return { valid: false, reason: "This coupon is no longer active." };
    }

    // 2. Check general date validity (today is within coupon start and end date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    // Normalize date objects for comparison
    const compareStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const compareEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (today < compareStart) {
        return { valid: false, reason: "This coupon promotion has not started yet." };
    }
    if (today > compareEnd) {
        return { valid: false, reason: "This coupon promotion has expired." };
    }

    // 3. Check minimum stay requirement
    if (coupon.minStay && stay.nights < Number(coupon.minStay)) {
        return { valid: false, reason: `Minimum stay of ${coupon.minStay} nights is required for this offer.` };
    }

    // 4. Check minimum booking amount restriction
    if (coupon.minBookingAmt && stay.basePrice < Number(coupon.minBookingAmt)) {
        return { valid: false, reason: `This coupon requires a minimum booking amount of ₹${coupon.minBookingAmt}.` };
    }

    // 5. Check room assignment rules
    if (stay.roomId && coupon.applyToRooms && coupon.applyToRooms !== 'all') {
        const allowedRooms = String(coupon.applyToRooms)
            .split(',')
            .map(id => id.trim());
        if (!allowedRooms.includes(String(stay.roomId))) {
            return { valid: false, reason: "This coupon is not applicable to the selected room category." };
        }
    }

    // 6. Check advanced promoType specific rules
    const type = coupon.promoType || 'standard';

    if (type === 'mobile_only') {
        if (!isMobileDevice()) {
            return { valid: false, reason: "This coupon is exclusive to mobile device bookings." };
        }
    }

    else if (type === 'last_minute') {
        if (!stay.checkIn) return { valid: false, reason: "Check-in date is required for this last-minute deal." };
        const checkInDate = new Date(stay.checkIn);
        const checkInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
        const diffMs = checkInDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        // Allowed check-in: today (0) or tomorrow (1)
        if (diffDays < 0 || diffDays > 1) {
            return { valid: false, reason: "Last minute deals are only valid for bookings check-in today or tomorrow." };
        }
    }

    else if (type === 'early_bird') {
        if (!stay.checkIn) return { valid: false, reason: "Check-in date is required for early bird verification." };
        const checkInDate = new Date(stay.checkIn);
        const checkInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
        const diffMs = checkInDay.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Requires check-in to be at least 7 days in advance
        if (diffDays < 7) {
            return { valid: false, reason: "Early bird specials require booking at least 7 days in advance." };
        }
    }

    else if (type === 'weekend') {
        if (!stay.checkIn) return { valid: false, reason: "Check-in date is required." };
        const checkInDate = new Date(stay.checkIn);
        const dayOfWeek = checkInDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 5 && dayOfWeek !== 6) {
            return { valid: false, reason: "Weekend deals are only valid for check-in on Friday, Saturday, or Sunday." };
        }
    }

    else if (type === 'long_stay') {
        const requiredNights = Math.max(3, Number(coupon.minStay) || 3);
        if (stay.nights < requiredNights) {
            return { valid: false, reason: `Long stay incentive requires booking a stay of at least ${requiredNights} nights.` };
        }
    }

    return { valid: true };
};
