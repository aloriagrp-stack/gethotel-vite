"""
GHS Rate Engine
Calculates true customer-facing display price matching HotelCard.tsx frontend logic,
compares with MMT/Booking.com rates, and determines the exact promotion percentage
needed so that the final customer price = (Market Price - ₹150) WITHOUT touching base room rates.
"""

from datetime import datetime

DEFAULT_OFFSET = 150  # Keep GHS exactly ₹150 cheaper than MMT/Booking.com by default


def apply_discount(price: float, val: float, discount_type: str) -> int:
    """Matches HotelCard.tsx applyDiscount function."""
    safe_val = min(val, 100) if discount_type == 'percentage' else val
    if discount_type == 'percentage':
        discounted = round(price * (1.0 - (safe_val / 100.0)))
    else:
        discounted = round(price - safe_val)
    return max(0, int(discounted))


def calculate_effective_price(hotel: dict) -> dict:
    """
    Simulates the exact price calculation done in HotelCard.tsx:
    Evaluates raw room price and applies active promotional coupon.
    """
    rooms = hotel.get("room") or []
    hotel_base_price = float(hotel.get("pricePerNight") or 0)
    
    coupons = hotel.get("coupon") or hotel.get("coupons") or []
    active_promos = []
    now = datetime.now()
    
    for c in coupons:
        if c.get("isActive") is False or c.get("is_active") is False:
            continue
        end_date = c.get("endDate")
        if end_date:
            try:
                clean_end = end_date.split("T")[0]
                if datetime.strptime(clean_end, "%Y-%m-%d") < now:
                    continue
            except Exception:
                pass
        active_promos.append(c)

    best_promo = None
    if active_promos:
        best_promo = sorted(active_promos, key=lambda x: float(x.get("discountValue") or 0), reverse=True)[0]

    min_final_price = float('inf')
    original_price = hotel_base_price
    discount_pct = 0
    has_discount = False
    applied_coupon_code = None

    if rooms:
        for r in rooms:
            room_price = float(r.get("pricePerNight") or 0)
            if room_price <= 0:
                continue

            final_p = room_price
            pct = 0
            has_promo = False

            if best_promo:
                val = float(best_promo.get("discountValue") or 0)
                dtype = best_promo.get("discountType") or "percentage"
                final_p = apply_discount(room_price, val, dtype)
                pct = int(val) if dtype == "percentage" else round((val / room_price) * 100)
                has_promo = True
                applied_coupon_code = best_promo.get("code")
            elif r.get("monthlyDiscount", 0) > 0:
                final_p = apply_discount(room_price, float(r["monthlyDiscount"]), "percentage")
                pct = int(r["monthlyDiscount"])
                has_promo = True
            elif r.get("weeklyDiscount", 0) > 0:
                final_p = apply_discount(room_price, float(r["weeklyDiscount"]), "percentage")
                pct = int(r["weeklyDiscount"])
                has_promo = True

            if final_p < min_final_price:
                min_final_price = final_p
                original_price = room_price
                discount_pct = pct
                has_discount = has_promo

    if min_final_price != float('inf'):
        display_price = int(min_final_price)
    else:
        display_price = int(hotel_base_price)
        original_price = int(hotel_base_price)

    return {
        "display_price": display_price,
        "original_price": int(original_price),
        "discount_pct": discount_pct,
        "has_discount": has_discount,
        "coupon_code": applied_coupon_code,
        "coupon_id": best_promo.get("id") if best_promo else None,
        "best_promo": best_promo,
        "rooms_count": len(rooms)
    }


def calculate_optimal_promotion(base_price: float, market_min: float, offset: int = DEFAULT_OFFSET) -> dict:
    """
    Computes required promotion percentage so that:
        base_price * (1 - needed_promo_pct / 100) = (market_min - offset)
    The base_price itself is NOT modified!
    """
    target_price = max(500, int(market_min - offset))
    
    if base_price <= target_price:
        # Base price is already low enough; no promo discount required
        needed_promo_pct = 0
    else:
        # Calculate percentage discount needed to drop base_price to target_price
        needed_promo_pct = round(((base_price - target_price) / base_price) * 100)
        needed_promo_pct = max(0, min(85, needed_promo_pct))

    resulting_display_price = round(base_price * (1.0 - (needed_promo_pct / 100.0)))
    
    return {
        "target_price": target_price,
        "needed_promo_pct": needed_promo_pct,
        "resulting_display_price": resulting_display_price,
        "diff_from_market": int(market_min - resulting_display_price)
    }


def analyze_rate(hotel: dict, market_data: dict, offset: int = DEFAULT_OFFSET) -> dict:
    """
    Full rate intelligence for a hotel:
    - Calculates effective display price with current promotion.
    - Evaluates what promotion % is required to hit (Market Min - offset).
    """
    eff = calculate_effective_price(hotel)
    ghs_price = eff["display_price"]
    base_price = eff["original_price"]
    market_avg = market_data.get("avg", 2500)
    market_min = market_data.get("min", market_avg)
    
    target_price = max(500, market_min - offset)
    diff = market_min - ghs_price
    
    promo_calc = calculate_optimal_promotion(base_price, market_min, offset)

    # Classification:
    if diff > (offset + 80):
        status = "UNDERPRICED"
        color = "red"
        advice = f"Too cheap (diff: ₹{diff})! Decrease promo from {eff['discount_pct']}% ➔ {promo_calc['needed_promo_pct']}%"
    elif (offset - 60) <= diff <= (offset + 60):
        status = "MATCHED"
        color = "green"
        advice = f"Perfect! Exactly ₹{diff} below market (~₹{offset} sweet spot)."
    else:
        status = "OVERPRICED"
        color = "yellow"
        advice = f"Overpriced! Increase promo from {eff['discount_pct']}% ➔ {promo_calc['needed_promo_pct']}%"

    return {
        "hotel_id": hotel["id"],
        "name": hotel["name"],
        "city": hotel.get("city", "Delhi"),
        "address": hotel.get("address", ""),
        "ghs_display_price": ghs_price,
        "base_room_price": base_price,
        "current_promo_pct": eff["discount_pct"],
        "coupon_code": eff["coupon_code"] or "BASIC",
        "market_min": market_min,
        "market_avg": market_avg,
        "target_price": target_price,
        "needed_promo_pct": promo_calc["needed_promo_pct"],
        "resulting_display_price": promo_calc["resulting_display_price"],
        "offset": offset,
        "diff": diff,
        "status": status,
        "color": color,
        "advice": advice,
        "rooms_count": eff["rooms_count"],
        "rooms": hotel.get("room") or []
    }
