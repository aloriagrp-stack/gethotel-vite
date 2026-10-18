const { parseInHousePrompt } = require('../services/inHouseParser');

const testText = `================================================== ROOM CATEGORY 3: DELUXE TRIPLE BED ROOM
-------------------------------------------------- Size : 170 sq.ft (16 sq.mt) Bed : 1 Queen Bed + 1 Single Bed Bathroom : 1 Max Guests : 3 Room Amenities: - Smoking Room - Bathroom - Housekeeping - In-room Dining - Laundry Service - Air Conditioning Price Plans (per night): EP (Room Only, Free Cancellation) : Rs 2,750 CP (Room + Breakfast, Free Cancellation) : Rs 3,405 MAP (Breakfast + Lunch/Dinner, Free Cancellation) : Rs 4,059 ================================================== ROOM CATEGORY 4: FAMILY ROOM ================================================== Size : 200 sq.ft (19 sq.mt) Bed : 2 Queen Beds Bathroom : 1 Max Guests : 4 Room Amenities: - Mineral Water - In-room Dining - Bathroom - Housekeeping - Air Conditioning - Room Service Price Plans (per night): EP (Room Only, Free Cancellation) : Rs 3,143 CP (Room + Breakfast, Non-Refundable) : Rs 3,536 MAP (Breakfast + Lunch/Dinner, Free Cancellation) : Rs 4,016 --------------------- NOTE --------------------- - AP (all meals) plan not available on this listing - only EP, CP, MAP shown. - Prices shown are per night, base occupancy, as per selected dates (23-24 Sep 2026). Prices may vary with dates.`;

const res = parseInHousePrompt(testText);
console.log('Result count:', res.data ? res.data.length : 0);
console.log('Reply:', res.reply);
console.log('Rooms:', JSON.stringify(res.data, null, 2));
