function parseStructuredBlocks(text) {
    // Check if text has structured room block indicators
    const hasCategoryHeaders = /(?:ROOM\s*CATEGORY|ROOM\s*\d+|CATEGORY\s*\d+|={3,}\s*ROOM)/i.test(text);
    if (!hasCategoryHeaders) return null;

    // Split text by room category headers
    const blockRegex = /(?:={3,}|-{3,}|\*{3,})*\s*(?:ROOM\s*CATEGORY\s*\d*[:\s]*|ROOM\s*\d+[:\s]*|CATEGORY\s*\d+[:\s]*)(.+?)(?=(?:={3,}|-{3,}|\*{3,})*\s*(?:ROOM\s*CATEGORY|ROOM\s*\d+|CATEGORY\s*\d+|NOTE\s*-+|$))/gis;

    const matches = [...text.matchAll(blockRegex)];
    if (!matches || matches.length === 0) return null;

    const rooms = [];

    for (let i = 0; i < matches.length; i++) {
        const fullMatch = matches[i][0];
        const headerAndBody = matches[i][1].trim();

        // Separate room title from block body
        // First line or up to first delimiter/separator
        const lines = headerAndBody.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        let titleLine = lines[0].replace(/^[:\-\=\s]+|[:\-\=\s]+$/g, '').trim();
        // If title has size or other fields in same line, extract title before them
        const titleClean = titleLine.split(/(?:-{3,}|={3,}|Size\s*:|Bed\s*:|Price\s*:)/i)[0].trim();
        if (!titleClean || titleClean.toLowerCase().includes('note')) continue;

        const blockText = headerAndBody;

        // 1. Size
        let sizeM2 = 25;
        const sizeMtMatch = blockText.match(/\((\d+)\s*sq\.?\s*m[t\.]?\)/i);
        const sizeFtMatch = blockText.match(/(\d+)\s*sq\.?\s*ft/i);
        if (sizeMtMatch) {
            sizeM2 = parseInt(sizeMtMatch[1], 10);
        } else if (sizeFtMatch) {
            sizeM2 = Math.round(parseInt(sizeFtMatch[1], 10) / 10.764);
        }

        // 2. Bed Configuration
        let bed = "1 King Bed";
        const bedMatch = blockText.match(/Bed\s*:\s*([^\n\r]+?)(?=\s*Bathroom|\s*Max|\s*Room|\s*Price|\s*$)/i);
        if (bedMatch) {
            bed = bedMatch[1].replace(/[-=]+$/, '').trim();
        }

        // 3. Max Guests / Occupancy
        let occupancy = 2;
        const occMatch = blockText.match(/(?:Max\s*Guests?|Occupancy|Guests?)\s*:\s*(\d+)/i);
        if (occMatch) {
            occupancy = parseInt(occMatch[1], 10);
        }

        // 4. Amenities
        const amenities = [];
        const amenBlockMatch = blockText.match(/Room\s*Amenities\s*:\s*([\s\S]+?)(?=\s*Price\s*Plans|\s*Price\s*:|\s*Rate\s*:|\s*={3,}|\s*-{3,}|$)/i);
        if (amenBlockMatch) {
            const rawAmen = amenBlockMatch[1].trim();
            const items = rawAmen.split(/(?:\r?\n|^)\s*-\s*|\s+-\s+/).map(a => a.trim()).filter(a => a.length > 2 && !a.toLowerCase().startsWith('price'));
            amenities.push(...items);
        }

        // 5. Price Plans / Variants
        const variants = [];
        const planRegex = /(EP|CP|MAP|AP|Room\s*Only|Bed\s*&\s*Breakfast)\s*(?:\(([^)]+)\))?\s*:\s*(?:Rs\.?|₹)?\s*([\d,]+)/gi;
        let planMatch;
        let lowestPrice = null;

        while ((planMatch = planRegex.exec(blockText)) !== null) {
            const planCode = planMatch[1].trim().toUpperCase();
            const planDesc = planMatch[2] ? planMatch[2].trim() : '';
            const price = parseInt(planMatch[3].replace(/,/g, ''), 10);

            let mealPlan = planCode;
            if (planCode === 'EP') mealPlan = "Room Only (EP)";
            else if (planCode === 'CP') mealPlan = "Bed & Breakfast (CP)";
            else if (planCode === 'MAP') mealPlan = "Half Board (MAP - Breakfast + Dinner)";
            else if (planCode === 'AP') mealPlan = "Full Board (AP - All Meals)";

            let policy = "Free cancellation till 24h";
            if (/non-refundable/i.test(planDesc)) {
                policy = "Non-Refundable";
            } else if (/free\s*cancellation/i.test(planDesc)) {
                policy = "Free cancellation";
            }

            variants.push({
                id: variants.length + 1,
                mealPlan: `${mealPlan}${planDesc ? ` (${planDesc})` : ''}`,
                price: price,
                policy: policy
            });

            if (lowestPrice === null || price < lowestPrice) {
                lowestPrice = price;
            }
        }

        // If no plans matched, extract any price
        if (lowestPrice === null) {
            const pMatch = blockText.match(/(?:Rs\.?|₹|INR)\s*([\d,]+)/i);
            if (pMatch) {
                lowestPrice = parseInt(pMatch[1].replace(/,/g, ''), 10);
            } else {
                lowestPrice = 2499;
            }
        }

        rooms.push({
            name: titleClean.replace(/\b\w/g, l => l.toUpperCase()),
            pricePerNight: lowestPrice,
            maxOccupancy: occupancy,
            bedConfiguration: bed,
            sizeM2: sizeM2,
            totalInventory: 5,
            amenities: amenities.length > 0 ? amenities : ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom"],
            variants: variants.length > 0 ? variants : [
                { id: 1, mealPlan: "Room Only (EP)", price: lowestPrice, policy: "Free cancellation till 24h" }
            ],
            images: [
                "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
            ],
            description: `${titleClean} (${sizeM2} sq.mt) featuring ${bed}, suitable for up to ${occupancy} guests.`
        });
    }

    return rooms.length > 0 ? rooms : null;
}

const testText = `================================================== ROOM CATEGORY 3: DELUXE TRIPLE BED ROOM
-------------------------------------------------- Size : 170 sq.ft (16 sq.mt) Bed : 1 Queen Bed + 1 Single Bed Bathroom : 1 Max Guests : 3 Room Amenities: - Smoking Room - Bathroom - Housekeeping - In-room Dining - Laundry Service - Air Conditioning Price Plans (per night): EP (Room Only, Free Cancellation) : Rs 2,750 CP (Room + Breakfast, Free Cancellation) : Rs 3,405 MAP (Breakfast + Lunch/Dinner, Free Cancellation) : Rs 4,059 ================================================== ROOM CATEGORY 4: FAMILY ROOM ================================================== Size : 200 sq.ft (19 sq.mt) Bed : 2 Queen Beds Bathroom : 1 Max Guests : 4 Room Amenities: - Mineral Water - In-room Dining - Bathroom - Housekeeping - Air Conditioning - Room Service Price Plans (per night): EP (Room Only, Free Cancellation) : Rs 3,143 CP (Room + Breakfast, Non-Refundable) : Rs 3,536 MAP (Breakfast + Lunch/Dinner, Free Cancellation) : Rs 4,016 --------------------- NOTE --------------------- - AP (all meals) plan not available on this listing - only EP, CP, MAP shown. - Prices shown are per night, base occupancy, as per selected dates (23-24 Sep 2026). Prices may vary with dates.`;

const parsed = parseStructuredBlocks(testText);
console.log('Parsed count:', parsed ? parsed.length : 0);
console.log(JSON.stringify(parsed, null, 2));
