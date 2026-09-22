const llmGateway = require('./llmGateway');

// Curated high-res Unsplash destination images
const DESTINATION_IMAGE_BANK = {
    delhi: [
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1585136917228-56eb0b36c25d?auto=format&fit=crop&w=1200&q=80"
    ],
    agra: [
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    jaipur: [
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1609137144822-0a56247c4e5f?auto=format&fit=crop&w=1200&q=80"
    ],
    udaipur: [
        "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80"
    ],
    jodhpur: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1588096344356-9a572a15c345?auto=format&fit=crop&w=1200&q=80"
    ],
    jaisalmer: [
        "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    kerala: [
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1609828913552-878988628b03?auto=format&fit=crop&w=1200&q=80"
    ],
    goa: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    ],
    kashmir: [
        "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80"
    ],
    manali: [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    ladakh: [
        "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80"
    ],
    ranthambore: [
        "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80"
    ],
    varanasi: [
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80"
    ],
    general: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    ]
};

// Helper to find relevant images for a tour based on destination/title
function resolveImagesForTour(destination = "", title = "") {
    const text = `${destination} ${title}`.toLowerCase();
    for (const [key, imgs] of Object.entries(DESTINATION_IMAGE_BANK)) {
        if (key !== "general" && text.includes(key)) {
            return {
                mainImage: imgs[0],
                gallery: imgs
            };
        }
    }
    return {
        mainImage: DESTINATION_IMAGE_BANK.general[0],
        gallery: DESTINATION_IMAGE_BANK.general
    };
}

// Helper to generate SEO Slug
function createSlug(text) {
    if (!text) return "tour-package-" + Date.now();
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

/**
 * AI Tour Package Generator & NLP Structurer
 * Generates ready-to-save tour packages from freeform prompts, raw itinerary text, or partial JSON.
 */
async function generateOrParseTours({ prompt, rawText, jsonText, destinationHint }) {
    const inputContent = (prompt || rawText || jsonText || "").trim();
    if (!inputContent) {
        throw new Error("Please provide a prompt, tour description, or raw itinerary text.");
    }

    // Check if input is already direct valid JSON
    try {
        const parsed = JSON.parse(inputContent);
        let items = [];
        if (Array.isArray(parsed)) items = parsed;
        else if (parsed.packages && Array.isArray(parsed.packages)) items = parsed.packages;
        else if (parsed.tours && Array.isArray(parsed.tours)) items = parsed.tours;
        else if (parsed.title || parsed.name) items = [parsed];

        if (items.length > 0) {
            return items.map(formatAndEnrichTour);
        }
    } catch (e) {
        // Not JSON, continue to AI generation / NLP parsing
    }

    const systemInstruction = `
You are an expert luxury & budget travel architect for GetHotelStays.com.
Your job is to generate complete, ready-to-publish Indian & international tour packages based on the user's prompt or raw itinerary text.

Strict requirements:
1. Always output ONLY a valid JSON Array of Tour Package objects. No markdown explanations outside the JSON.
2. Each package MUST include:
   - "title": (String) Captivating, authentic title (e.g. "Royal Rajasthan Heritage & Desert Safari")
   - "destination": (String) Connected destinations separated by bullet (e.g. "Jaipur • Jodhpur • Jaisalmer")
   - "duration": (String) Formatted as "X Days / Y Nights" (e.g. "6 Days / 5 Nights")
   - "price": (Number) Realistic starting price per person in INR (e.g. 19999)
   - "originalPrice": (Number) Realistic higher rack rate (e.g. 25999)
   - "discountPercent": (String) E.g. "23% OFF"
   - "badge": (String) One of: "Bestseller", "Trending", "Super Saver", "Top Rated", "Luxury", "Adventure", "Popular"
   - "includedStay": (String) E.g. "4-Star Deluxe Heritage Hotels & Luxury Swiss Tents"
   - "transport": (String) E.g. "Private AC Sedan Transfers Included"
   - "overview": (String) Engaging 2-3 paragraph overview highlighting culture, landscape, sights, and vibes.
   - "highlights": (Array of Strings) 4-6 bullet highlights (e.g. ["Sunrise visit to Taj Mahal", "Camel ride in Sam Sand Dunes"])
   - "inclusions": (Array of Strings) 5-7 clear items included (Hotel stay, daily breakfast, AC cab, sightseeing, guide, toll taxes)
   - "exclusions": (Array of Strings) 4-6 items not included (Airfare, monument entry fees, lunch & dinner unless stated, personal expenses)
   - "itinerary": (Array of Objects) Day-by-day plan:
     [
       { "day": "Day 1", "title": "Arrival & City Orientation", "desc": "Detailed description of activities, transfers, sights, and overnight stay." },
       { "day": "Day 2", "title": "Sightseeing & Highlights", "desc": "Detailed description..." }
     ]
   - "image": (String) High-res image URL (can leave empty or provide Unsplash image)
   - "gallery": (Array of Strings) Array of high-res image URLs

If the user gives multiple tours or says "create 3 packages", generate exactly that number.
If the user provides a raw text or messy website snippet, extract every detail accurately and enrich the missing parts into premium standards.
Output strictly in JSON array format.
`.trim();

    let llmResponse = "";
    try {
        llmResponse = await llmGateway.generateChatCompletion({
            systemInstruction,
            history: [],
            userQuery: inputContent + (destinationHint ? ` (Target Destination: ${destinationHint})` : "")
        });
    } catch (err) {
        console.error("[TourAiService] LLM Gateway error:", err.message);
    }

    let parsedTours = [];
    if (llmResponse) {
        // Strip markdown code fences like ```json ... ```
        const cleaned = llmResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        try {
            // Find JSON array bounds [ ... ]
            const startIdx = cleaned.indexOf('[');
            const endIdx = cleaned.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const jsonStr = cleaned.slice(startIdx, endIdx + 1);
                parsedTours = JSON.parse(jsonStr);
            } else {
                // Try parsing single object { ... }
                const objStart = cleaned.indexOf('{');
                const objEnd = cleaned.lastIndexOf('}');
                if (objStart !== -1 && objEnd !== -1) {
                    const singleObj = JSON.parse(cleaned.slice(objStart, objEnd + 1));
                    parsedTours = [singleObj];
                }
            }
        } catch (jsonErr) {
            console.warn("[TourAiService] Failed to parse JSON from LLM reply, using fallback parser:", jsonErr.message);
        }
    }

    // If LLM returned empty or failed to parse, use intelligent NLP Fallback
    if (!Array.isArray(parsedTours) || parsedTours.length === 0) {
        parsedTours = fallbackRuleBasedTourParser(inputContent, destinationHint);
    }

    // Enrich with curated images, slugs, and safety defaults
    return parsedTours.map(formatAndEnrichTour);
}

// Fallback intelligent parser when LLM is unavailable or returns non-JSON
function fallbackRuleBasedTourParser(text, destinationHint) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const titleCandidate = lines[0] || "Custom Handcrafted Tour Package";
    const cleanedTitle = titleCandidate.replace(/^[#*\-0-9.:\s]+/, "").slice(0, 80) || "Exotic Holiday Experience";

    const dest = destinationHint || (text.toLowerCase().includes("kerala") ? "Kochi • Munnar • Thekkady • Alleppey" :
                  text.toLowerCase().includes("rajasthan") ? "Jaipur • Jodhpur • Udaipur" :
                  text.toLowerCase().includes("kashmir") ? "Srinagar • Gulmarg • Pahalgam" :
                  text.toLowerCase().includes("manali") ? "Shimla • Kullu • Manali" :
                  text.toLowerCase().includes("goa") ? "North Goa • South Goa" : "Delhi • Agra • Jaipur");

    // Detect price if present in text
    let price = 15999;
    const priceMatch = text.match(/(?:rs\.?|inr|₹)\s*([0-9,]+)/i);
    if (priceMatch) {
        const p = parseInt(priceMatch[1].replace(/,/g, ""), 10);
        if (p > 1000 && p < 1000000) price = p;
    }

    const originalPrice = Math.round(price * 1.28);
    const discountPercent = `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;

    // Extract day lines if any
    const days = [];
    let currentDay = null;
    for (const line of lines) {
        const dayMatch = line.match(/^day\s*(\d+)[:\-\s]*(.*)/i);
        if (dayMatch) {
            if (currentDay) days.push(currentDay);
            currentDay = {
                day: `Day ${dayMatch[1]}`,
                title: dayMatch[2] || `Exploration Day ${dayMatch[1]}`,
                desc: ""
            };
        } else if (currentDay) {
            currentDay.desc += (currentDay.desc ? " " : "") + line;
        }
    }
    if (currentDay) days.push(currentDay);

    const itinerary = days.length > 0 ? days : [
        { day: "Day 1", title: "Arrival & Welcome", desc: `Arrive at the destination, transfer to premium hotel, orientation and relaxing evening.` },
        { day: "Day 2", title: "Cultural Heritage & Sightseeing", desc: `Full day guided sightseeing of iconic landmarks, heritage monuments, and local bazaars.` },
        { day: "Day 3", title: "Scenic Journey & Exploration", desc: `Scenic travel to next destination, visiting viewpoints and scenic stops on the way.` },
        { day: "Day 4", title: "Local Experiences & Leisure", desc: `Unique regional activities, cultural performance, local cuisine, and shopping.` },
        { day: "Day 5", title: "Departure", desc: `Morning breakfast, check-out and transfer to airport/railway station with memorable experiences.` }
    ];

    const durationStr = `${itinerary.length} Days / ${itinerary.length - 1} Nights`;

    return [{
        title: cleanedTitle,
        destination: dest,
        duration: durationStr,
        price,
        originalPrice,
        discountPercent,
        badge: "Bestseller",
        includedStay: "4-Star Deluxe Resorts & Heritage Hotels",
        transport: "Private AC Sedan Transfers Included",
        overview: `${cleanedTitle} offers an unforgettable travel experience exploring ${dest}. Perfectly paced with verified stays, expert guided transfers, and curated regional highlights for a relaxing holiday.`,
        highlights: [
            "Comfortable private AC transportation throughout",
            "Handpicked 4-star stays with daily breakfast",
            "Guided sightseeing tours of major landmarks",
            "24/7 on-trip concierge and local assistance"
        ],
        inclusions: [
            `${itinerary.length - 1} Nights hotel stay on double sharing basis`,
            "Daily buffet breakfast at hotels",
            "Private air-conditioned vehicle for all transfers & sightseeing",
            "Driver allowances, toll tax, parking, and state permits",
            "All taxes included"
        ],
        exclusions: [
            "Flight / Train tickets",
            "Monument entrance tickets and camera fees",
            "Personal expenses, room service, laundry and tips",
            "Travel insurance"
        ],
        itinerary
    }];
}

// Ensures all fields are standardized, slug is unique, and images are beautiful
function formatAndEnrichTour(tour, index = 0) {
    const title = (tour.title || tour.tour_name || tour.name || "Handcrafted Tour Package").trim();
    const destination = (tour.destination || tour.route || tour.city || "India").trim();
    
    // Auto-resolve high-res images if missing or placeholder
    const resolvedMedia = resolveImagesForTour(destination, title);
    const mainImage = (tour.image && tour.image.startsWith("http")) ? tour.image : resolvedMedia.mainImage;
    const gallery = Array.isArray(tour.gallery) && tour.gallery.length > 0 
        ? tour.gallery.filter(g => typeof g === 'string' && g.startsWith("http")) 
        : resolvedMedia.gallery;

    // Price safety
    let price = 15999;
    if (tour.price !== undefined && !isNaN(parseFloat(tour.price))) {
        price = parseFloat(tour.price);
    } else if (tour.price_starting_inr) {
        price = parseFloat(tour.price_starting_inr);
    }

    let originalPrice = tour.originalPrice || tour.original_price ? parseFloat(tour.originalPrice || tour.original_price) : Math.round(price * 1.25);
    let discountPercent = tour.discountPercent || tour.discount_percent || `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;

    // Duration formatting
    let duration = "5 Days / 4 Nights";
    if (typeof tour.duration === 'string' && tour.duration.trim()) {
        duration = tour.duration.trim();
    } else if (typeof tour.duration === 'object' && tour.duration.days) {
        duration = `${tour.duration.days} Days / ${tour.duration.nights || tour.duration.days - 1} Nights`;
    }

    // Slug
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const slug = tour.slug || `${createSlug(title)}-${randomSuffix}`;

    return {
        id: `draft-${Date.now()}-${index}`,
        title,
        slug,
        destination,
        duration,
        price,
        originalPrice,
        discountPercent,
        rating: parseFloat(tour.rating || 4.9),
        reviewsCount: parseInt(tour.reviewsCount || tour.reviews_count || 48, 10),
        badge: tour.badge || "Bestseller",
        includedStay: tour.includedStay || tour.included_stay || "4-Star Deluxe Stays Included",
        transport: tour.transport || "Private AC Sedan Transfers Included",
        image: mainImage,
        gallery: gallery.length > 0 ? gallery : [mainImage],
        overview: tour.overview || `${title} provides an exceptional journey across ${destination}. Crafted for travelers seeking comfort, authentic culture, and memorable experiences.`,
        highlights: Array.isArray(tour.highlights) ? tour.highlights : [],
        inclusions: Array.isArray(tour.inclusions) ? tour.inclusions : [
            "Handpicked 4-star hotel accommodations",
            "Daily complimentary buffet breakfast",
            "Private AC vehicle for all transfers and sightseeing",
            "Dedicated driver allowances, fuel, tolls and state permits"
        ],
        exclusions: Array.isArray(tour.exclusions) ? tour.exclusions : [
            "Airfare or train fare",
            "Monument entrance fees",
            "Meals not specified in inclusions",
            "Personal expenses and tips"
        ],
        itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [
            { day: "Day 1", title: "Arrival & Check-in", desc: "Arrival at destination, private transfer to hotel, evening leisure." },
            { day: "Day 2", title: "Guided City Sightseeing", desc: "Full day tour covering prominent heritage sites and viewpoints." },
            { day: "Day 3", title: "Departure", desc: "Breakfast at hotel, transfer to airport/station with cherished memories." }
        ]
    };
}

module.exports = {
    generateOrParseTours,
    resolveImagesForTour,
    createSlug
};
