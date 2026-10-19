export interface BookingBreakdown {
    roomCount: number;
    variantIdx: number;
    nights: number;
    durationHours: number;
    isHourly: boolean;
    mealPlan: string;
    specialRequests?: string;
    internalNotes?: string;
    couponCode: string | null;
    discountAmount: number;
    totalPrice: number;
    netTaxable: number;
    gstTax: number;
    grossBase: number;
    rateUnit: number;
    amountPaid: number;
    amountDueAtHotel: number;
    paymentMode: 'PAY_AT_HOTEL' | 'FULL_ONLINE' | 'PARTIAL';
    commissionRate: number;
    commissionAmount: number;
    partnerNetPayout: number;
}

export function parseBookingBreakdown(booking: any): BookingBreakdown {
    if (!booking) {
        return {
            roomCount: 1,
            variantIdx: 0,
            nights: 1,
            durationHours: 24,
            isHourly: false,
            mealPlan: 'Room Only',
            couponCode: null,
            discountAmount: 0,
            totalPrice: 0,
            netTaxable: 0,
            gstTax: 0,
            grossBase: 0,
            rateUnit: 0,
            amountPaid: 0,
            amountDueAtHotel: 0,
            paymentMode: 'PAY_AT_HOTEL',
            commissionRate: 12,
            commissionAmount: 0,
            partnerNetPayout: 0
        };
    }

    // 1. Room quantity & variant
    let roomCount = 1;
    let variantIdx = 0;
    try {
        if (booking.roomDetails) {
            const parsed = typeof booking.roomDetails === 'string' ? JSON.parse(booking.roomDetails) : booking.roomDetails;
            if (Array.isArray(parsed) && parsed.length > 0) {
                roomCount = parsed.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
                if (parsed[0]?.variantIdx !== undefined) {
                    variantIdx = Number(parsed[0].variantIdx);
                }
            }
        }
    } catch {
        roomCount = 1;
    }

    // 2. Dates & duration
    const checkIn = booking.checkIn ? new Date(booking.checkIn) : null;
    const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;
    const diffMs = (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()))
        ? Math.max(0, checkOut.getTime() - checkIn.getTime())
        : 86400000;
    const durationHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    const isHourly = !!(booking.room?.isHourlyEnabled && durationHours < 24);
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    // 3. Meal Plan
    const specialReq = (booking.specialRequests || "").toLowerCase();
    const hasBreakfast = variantIdx === 1 || specialReq.includes("breakfast") || (booking.room?.variants && typeof booking.room.variants === 'string' && booking.room.variants.toLowerCase().includes("breakfast") && variantIdx === 1);
    const mealPlan = hasBreakfast ? "Breakfast Included" : "Room Only";

    // 4. Notes & Coupon extraction
    const notes = booking.internalNotes || "";
    const couponMatch = notes.match(/Coupon:\s*([^|]+)/i);
    const discountMatch = notes.match(/Discount:\s*₹?(\d+)/i);
    const couponCode = couponMatch && couponMatch[1]?.trim() !== "None" && couponMatch[1]?.trim() !== "" 
        ? couponMatch[1].trim() 
        : null;
    const discountAmount = discountMatch ? Number(discountMatch[1]) : 0;

    // 5. Financials
    const totalPrice = Math.max(0, Number(booking.totalPrice) || 0);
    // Platform tax standard is 5% GST inclusive
    const netTaxable = Math.max(0, Math.round(totalPrice / 1.05));
    const gstTax = Math.max(0, totalPrice - netTaxable);
    const grossBase = netTaxable + discountAmount;
    
    // Per-unit base rate
    const unitsCount = isHourly ? (roomCount * durationHours) : (roomCount * nights);
    const rateUnit = unitsCount > 0 ? Math.round(grossBase / unitsCount) : grossBase;

    const amountPaid = Math.max(0, Number(booking.amountPaid) || 0);
    const amountDueAtHotel = Math.max(0, totalPrice - amountPaid);
    const paymentMode = amountPaid === 0 
        ? 'PAY_AT_HOTEL' 
        : (amountPaid >= totalPrice ? 'FULL_ONLINE' : 'PARTIAL');

    // 6. Commission & Revenue Split (Default: 12% Platform Commission)
    const commissionRate = Number(booking.hotel?.commissionRate) || 12;
    const commissionAmount = Math.round(totalPrice * (commissionRate / 100));
    const partnerNetPayout = Math.max(0, totalPrice - commissionAmount);

    return {
        roomCount,
        variantIdx,
        nights,
        durationHours,
        isHourly,
        mealPlan,
        specialRequests: booking.specialRequests,
        internalNotes: booking.internalNotes,
        couponCode,
        discountAmount,
        totalPrice,
        netTaxable,
        gstTax,
        grossBase,
        rateUnit,
        amountPaid,
        amountDueAtHotel,
        paymentMode,
        commissionRate,
        commissionAmount,
        partnerNetPayout
    };
}
