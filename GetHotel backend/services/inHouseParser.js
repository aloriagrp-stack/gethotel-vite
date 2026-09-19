/**
 * In-House Deterministic NLP Chat Parser (Node.js Fallback)
 * Mirrors parser_engine.py 100%.
 * Provides zero-external-API room parsing even if the Python daemon is not active on live server.
 */

const STANDARD_ROOM_TYPES = [
    {
        pattern: /(super\s*deluxe|executive\s*deluxe)/i,
        name: "Super Deluxe Room",
        description: "Upgraded luxury room featuring panoramic city views, plush king-size bedding, and a dedicated work desk.",
        bed: "1 King Bed",
        occupancy: 2,
        sizeM2: 32,
        default_price: 3499,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Mini Bar", "City View", "Bathrobe", "Tea/Coffee Maker", "Daily Housekeeping"]
    },
    {
        pattern: /(deluxe|dx)/i,
        name: "Deluxe Room",
        description: "Spacious and elegant room equipped with contemporary decor, premium bedding, and modern bathroom amenities.",
        bed: "1 King Bed",
        occupancy: 2,
        sizeM2: 28,
        default_price: 2499,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Electric Kettle", "Wardrobe", "Toiletries", "Daily Housekeeping"]
    },
    {
        pattern: /(presidential\s*suite|royal\s*suite|luxury\s*suite|penthouse)/i,
        name: "Presidential Suite",
        description: "Opulent signature suite featuring expansive living quarters, master suite, deep soaking bathtub, and bespoke butler service.",
        bed: "1 King Bed",
        occupancy: 4,
        sizeM2: 65,
        default_price: 6999,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Bathtub", "Jacuzzi", "Living Area", "Mini Bar", "Complimentary Breakfast", "Soundproofing", "City View"]
    },
    {
        pattern: /(suite|executive\s*suite)/i,
        name: "Executive Suite",
        description: "Spacious suite with a dedicated living area, master bedroom, soaking bathtub, and executive work desk.",
        bed: "1 King Bed",
        occupancy: 3,
        sizeM2: 45,
        default_price: 4499,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Bathtub", "Living Area", "Mini Bar", "Complimentary Breakfast", "Soundproofing"]
    },
    {
        pattern: /(family\s*suite|family\s*room|quad|family)/i,
        name: "Family Room",
        description: "Spacious family accommodation featuring multiple beds, generous storage, and comfortable seating.",
        bed: "2 Double Beds",
        occupancy: 4,
        sizeM2: 38,
        default_price: 3799,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Extra Bed", "Electric Kettle", "Wardrobe", "Daily Housekeeping"]
    },
    {
        pattern: /(standard|classic|economy|budget|single)/i,
        name: "Standard Room",
        description: "Comfortable standard guest room designed for convenience and a restful stay.",
        bed: "1 Queen Bed",
        occupancy: 2,
        sizeM2: 22,
        default_price: 1899,
        amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Electric Kettle", "Daily Housekeeping"]
    }
];

const ROOM_STOCK_IMAGES = [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
];

function extractPriceFromText(text) {
    if (!text) return null;
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
        return Math.round(parseFloat(kMatch[1]) * 1000);
    }
    const numMatches = text.match(/(?:₹|rs\.?|inr|price|rate)?\s*(\d{3,6})\s*(?:rs\.?|inr|\/-)?/gi);
    if (numMatches) {
        for (const m of numMatches) {
            const digits = m.replace(/[^\d]/g, '');
            const val = parseInt(digits, 10);
            if (val && val !== 2024 && val !== 2025 && val !== 2026) {
                return val;
            }
        }
    }
    return null;
}

function extractOccupancyAndBed(roomName, desc = "") {
    const combined = `${roomName} ${desc}`.toLowerCase();
    let bed = "1 King Bed";
    if (/\b(2\s*single|twin|two\s*twin|two\s*single)\b/.test(combined)) {
        bed = "2 Twin Beds";
    } else if (/\b(queen)\b/.test(combined)) {
        bed = "1 Queen Bed";
    } else if (/\b(2\s*double|two\s*double|quad)\b/.test(combined)) {
        bed = "2 Double Beds";
    } else if (/\b(single\s*bed|1\s*single)\b/.test(combined)) {
        bed = "1 Single Bed";
    }

    let occ = 2;
    const occMatch = combined.match(/(\d+)\s*(adult|guest|person|people|pax|bed)/);
    if (occMatch) {
        occ = Math.max(1, Math.min(8, parseInt(occMatch[1], 10)));
    } else if (combined.includes('single') && !combined.includes('double')) {
        occ = 1;
    } else if (combined.includes('family') || combined.includes('quad')) {
        occ = 4;
    } else if (combined.includes('suite') || combined.includes('villa')) {
        occ = 3;
    }

    return { occupancy: occ, bed };
}

function extractAmenities(text) {
    const t = (text || '').toLowerCase();
    const map = {
        "Free Wi-Fi": ["wifi", "wi-fi", "internet"],
        "Air Conditioning": ["ac", "air condition", "air-condition"],
        "Flat-screen TV": ["tv", "television", "smart tv", "led tv"],
        "Private Bathroom": ["private bath", "attached bath", "bathroom"],
        "Bathtub": ["bathtub", "soaking tub", "tub"],
        "Jacuzzi": ["jacuzzi", "whirlpool"],
        "Mini Bar": ["minibar", "mini bar", "mini fridge"],
        "Balcony": ["balcony", "terrace", "patio"],
        "Complimentary Breakfast": ["breakfast", "food included"],
        "City View": ["city view", "view"]
    };
    const found = [];
    for (const [name, patterns] of Object.entries(map)) {
        if (patterns.some(p => t.includes(p))) {
            found.push(name);
        }
    }
    return found.length > 0 ? found : ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom"];
}

function parseInHousePrompt(prompt, existingRooms = [], basePrice = 2499) {
    const p = (prompt || '').trim();
    const pLower = p.toLowerCase();

    // 1. GREETING
    if (/^(hi|hello|hey|greetings|namaste)\b/i.test(pLower) && !/(room|suite|deluxe|price|rate|create|setup)/i.test(pLower)) {
        return {
            reply: "Hello! I am your In-House Room Setup Copilot.\n\nSimply describe the room configurations you need, and I will instantly structure your categories and pricing! For example:\n- *'Create 3 rooms: Deluxe at ₹2500, Super Deluxe with balcony at ₹3500, Executive Suite with bathtub at ₹5000'*\n- *'Standard budget hotel setup'*\n- *'Update Deluxe room price to ₹2800'*\n\nHow can I help configure your hotel today?",
            data: [],
            clearAllRooms: false
        };
    }

    // 2. CLEAR ALL
    if (/\b(clear\s*all|delete\s*all|remove\s*all|reset\s*rooms)\b/i.test(pLower)) {
        return {
            reply: "I have marked all existing room configurations for deletion. Please review and click 'Save to Hotel' to confirm.",
            data: [],
            clearAllRooms: true
        };
    }

    // 3. UPDATE ROOM PRICE
    const updatePrice = extractPriceFromText(p);
    if (updatePrice && existingRooms && existingRooms.length > 0) {
        const matched = existingRooms.find(r => (r.name || '').toLowerCase().split(/\s+/).some(w => w.length > 3 && pLower.includes(w)));
        if (matched && /(price|rate|cost|change|update|set)/i.test(pLower)) {
            const updatedList = existingRooms.map(r => {
                if (r.id === matched.id) {
                    return { ...r, pricePerNight: updatePrice, action: "update", isExisting: true };
                }
                return r;
            });
            return {
                reply: `I have updated the nightly rate for **${matched.name}** to **₹${updatePrice}**! Review the updated card below and click 'Save to Hotel'.`,
                data: updatedList,
                clearAllRooms: false
            };
        }
    }

function parseStructuredBlocks(text) {
    const hasCategoryHeaders = /(?:ROOM\s*CATEGORY|ROOM\s*\d+|CATEGORY\s*\d+|={3,}\s*ROOM|Price\s*Plans\s*\(per\s*night\))/i.test(text);
    if (!hasCategoryHeaders) return null;

    const blockRegex = /(?:={3,}|-{3,}|\*{3,})*\s*(?:ROOM\s*CATEGORY\s*\d*[:\s]*|ROOM\s*\d+[:\s]*|CATEGORY\s*\d+[:\s]*)(.+?)(?=(?:={3,}|-{3,}|\*{3,})*\s*(?:ROOM\s*CATEGORY|ROOM\s*\d+|CATEGORY\s*\d+|NOTE\s*-+|$))/gis;
    const matches = [...text.matchAll(blockRegex)];
    if (!matches || matches.length === 0) return null;

    const rooms = [];
    for (let i = 0; i < matches.length; i++) {
        const headerAndBody = matches[i][1].trim();
        const lines = headerAndBody.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        let titleLine = lines[0].replace(/^[:\-\=\s]+|[:\-\=\s]+$/g, '').trim();
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

            let policy = "Free cancellation till 24h";
            let cleanMealDesc = planDesc;
            if (/non-refundable/i.test(planDesc)) {
                policy = "Non-Refundable";
                cleanMealDesc = planDesc.replace(/,?\s*non-refundable/i, '').trim();
            } else if (/free\s*cancellation/i.test(planDesc)) {
                policy = "Free cancellation";
                cleanMealDesc = planDesc.replace(/,?\s*free\s*cancellation/i, '').trim();
            }

            let mealPlan = planCode;
            if (cleanMealDesc) {
                mealPlan = `${cleanMealDesc} (${planCode})`;
            } else {
                if (planCode === 'EP') mealPlan = "Room Only (EP)";
                else if (planCode === 'CP') mealPlan = "Bed & Breakfast (CP)";
                else if (planCode === 'MAP') mealPlan = "Breakfast + Lunch/Dinner (MAP)";
                else if (planCode === 'AP') mealPlan = "All Meals Included (AP)";
            }

            variants.push({
                id: variants.length + 1,
                mealPlan: mealPlan,
                price: price,
                policy: policy
            });

            if (lowestPrice === null || price < lowestPrice) {
                lowestPrice = price;
            }
        }

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
                ROOM_STOCK_IMAGES[rooms.length % ROOM_STOCK_IMAGES.length]
            ],
            description: `${titleClean} (${sizeM2} sq.mt) featuring ${bed}, suitable for up to ${occupancy} guests.`
        });
    }

    return rooms.length > 0 ? rooms : null;
}

    // 4. CHECK FOR STRUCTURED LISTINGS / BLOCKS
    const structuredRooms = parseStructuredBlocks(p);
    if (structuredRooms && structuredRooms.length > 0) {
        const roomSummary = structuredRooms.map(r => `**${r.name}** (₹${r.pricePerNight})`).join(', ');
        return {
            reply: `Extracted and structured **${structuredRooms.length} room categories** with their respective rate plans (EP, CP, MAP):\n\n${roomSummary}\n\nReview the room cards and click 'Save to Hotel' to apply them!`,
            data: structuredRooms,
            clearAllRooms: false
        };
    }

    // 5. PARSE FLAT ROOM SEGMENTS
    const cleaned = p.replace(/^(?:create|setup|add|total\s*\d+\s*rooms?[:\s]*)+/i, '').trim();
    const segments = cleaned.split(/\n+|,|;|\band\b/i).map(s => s.trim()).filter(Boolean);

    const rooms = [];
    for (let idx = 0; idx < segments.length; idx++) {
        const s = segments[idx];
        const price = extractPriceFromText(s);
        const tax = STANDARD_ROOM_TYPES.find(t => t.pattern.test(s));

        if (tax) {
            const { occupancy, bed } = extractOccupancyAndBed(tax.name, s);
            const amen = Array.from(new Set([...tax.amenities, ...extractAmenities(s)]));
            rooms.push({
                name: tax.name,
                pricePerNight: price || tax.default_price,
                maxOccupancy: occupancy,
                bedConfiguration: bed,
                sizeM2: tax.sizeM2,
                totalInventory: 5,
                amenities: amen,
                images: [ROOM_STOCK_IMAGES[idx % ROOM_STOCK_IMAGES.length]],
                description: tax.description
            });
        } else if (price && s.length >= 4) {
            const cleanedTitle = s.replace(/(?:₹|rs\.?|inr)?\s*\d{3,6}\s*(?:rs\.?|inr|\/-)?/gi, '')
                                  .replace(/\b(price|rate|with|at)\b/gi, '').trim();
            if (cleanedTitle.length >= 3) {
                const { occupancy, bed } = extractOccupancyAndBed(cleanedTitle, s);
                rooms.push({
                    name: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
                    pricePerNight: price,
                    maxOccupancy: occupancy,
                    bedConfiguration: bed,
                    sizeM2: 25,
                    totalInventory: 5,
                    amenities: extractAmenities(s),
                    images: [ROOM_STOCK_IMAGES[idx % ROOM_STOCK_IMAGES.length]],
                    description: s
                });
            }
        }
    }

    if (rooms.length === 0) {
        // Preset defaults
        rooms.push(
            { name: "Standard Room", pricePerNight: 1899, maxOccupancy: 2, bedConfiguration: "1 Queen Bed", sizeM2: 22, totalInventory: 5, amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom"], images: [ROOM_STOCK_IMAGES[0]], description: "Comfortable standard guest room." },
            { name: "Deluxe Room", pricePerNight: 2499, maxOccupancy: 2, bedConfiguration: "1 King Bed", sizeM2: 28, totalInventory: 5, amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Electric Kettle"], images: [ROOM_STOCK_IMAGES[1]], description: "Spacious deluxe room with contemporary decor." },
            { name: "Executive Suite", pricePerNight: 4299, maxOccupancy: 3, bedConfiguration: "1 King Bed", sizeM2: 45, totalInventory: 5, amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Bathtub", "Living Area"], images: [ROOM_STOCK_IMAGES[2]], description: "Spacious executive suite with luxury amenities." }
        );
    }

    const roomSummary = rooms.map(r => `**${r.name}** (₹${r.pricePerNight})`).join(', ');
    const reply = `Based on your instructions, I have drafted **${rooms.length} room categories**:\n\n${roomSummary}\n\nBed configurations, occupancy, and standard amenities have been automatically configured. Please review the cards below and click 'Save to Hotel' to apply!`;

    return {
        reply,
        data: rooms,
        clearAllRooms: false
    };
}

module.exports = {
    parseInHousePrompt
};
