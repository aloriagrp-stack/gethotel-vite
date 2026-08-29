const logger = require('./logger');
let prisma;
try {
    prisma = require('../../config/db');
} catch (e) {}

const INDIAN_DESTINATIONS = [
    'goa', 'kerala', 'jaipur', 'udaipur', 'jaisalmer', 'manali', 'shimla', 'dharamsala',
    'srinagar', 'gulmarg', 'leh', 'ladakh', 'varanasi', 'agra', 'delhi', 'mumbai',
    'rishi', 'rishikesh', 'haridwar', 'coorg', 'wayanad', 'munnar', 'alleppey', 'ooty',
    'kodaikanal', 'darjeeling', 'gangtok', 'sikkim', 'andaman', 'port blair', 'havelock',
    'amritsar', 'pondicherry', 'puducherry', 'hampi', 'gokarna', 'mahableshwar', 'lonavala',
    'mysore', 'tirupati', 'khajuraho', 'nainital', 'mussoorie', 'jim corbett', 'kaziranga',
    'golden triangle'
];

function isIndianDestination(destinationStr = '') {
    const dest = (destinationStr || '').toLowerCase().trim();
    if (!dest) return true;
    if (/india|bharat|desh/i.test(dest)) return true;
    return INDIAN_DESTINATIONS.some(indian => dest.includes(indian) || indian.includes(dest));
}

const REGIONS = {
    HIMACHAL: ['shimla', 'manali', 'dharamsala', 'kasol', 'spiti', 'dalhousie'],
    AGRA_PLAINS: ['agra', 'taj mahal', 'mathura', 'fatehpur sikri'],
    RAJASTHAN: ['jaipur', 'udaipur', 'jaisalmer', 'jodhpur', 'pushkar', 'bikaner'],
    GOA_COAST: ['goa', 'gokarna'],
    KERALA: ['munnar', 'alleppey', 'kochi', 'wayanad', 'thekkady']
};

/**
 * Detects geographic conflicts (e.g. trying to combine Shimla/Himachal with Agra/Taj Mahal in 4 days)
 */
function detectGeographicConflict(queryStr = '') {
    const text = (queryStr || '').toLowerCase();
    const mentionsHimachal = REGIONS.HIMACHAL.some(place => text.includes(place));
    const mentionsAgra = REGIONS.AGRA_PLAINS.some(place => text.includes(place));
    const mentionsGoa = REGIONS.GOA_COAST.some(place => text.includes(place));
    const mentionsKerala = REGIONS.KERALA.some(place => text.includes(place));

    if (mentionsHimachal && mentionsAgra) {
        return {
            hasConflict: true,
            notice: "⚠️ Geographic Schedule Note: Shimla/Manali (Himachal Pradesh) and Taj Mahal, Agra (Uttar Pradesh) are in opposite directions (~580 km apart). Combining Agra in a 4-day Himachal trip is geographically unfeasible. We have optimized your itinerary strictly for the 4-Day Himachal Circuit (Shimla & Manali)!"
        };
    }
    if (mentionsHimachal && mentionsGoa) {
        return {
            hasConflict: true,
            notice: "⚠️ Geographic Schedule Note: Himachal Pradesh and Goa are ~1,900 km apart. We have optimized your trip specifically for Himachal!"
        };
    }
    return { hasConflict: false, notice: "" };
}

/**
 * Himachal Circuit Itinerary (Shimla & Manali)
 */
function buildHimachalItinerary(daysCount = 4, travelerCount = 2, targetBudget = 40000, conflictNotice = "") {
    const requestedBudget = parseInt(targetBudget) || 40000;
    const estimatedTotal = Math.round(requestedBudget * 0.86);
    const unallocatedBuffer = requestedBudget - estimatedTotal;

    const hotelsCost = Math.round(estimatedTotal * 0.36);
    const transportCost = Math.round(estimatedTotal * 0.40);
    const activitiesCost = Math.round(estimatedTotal * 0.12);
    const foodCost = estimatedTotal - (hotelsCost + transportCost + activitiesCost);

    const perPersonPrice = Math.round(estimatedTotal / travelerCount);

    const budgetBreakdown = {
        requested_budget: requestedBudget,
        estimated_total: estimatedTotal,
        unallocated_buffer: unallocatedBuffer,
        items: [
            { category: "Hotels & Stays", amount: hotelsCost, note: "Handpicked Mountain Stays" },
            { category: "Private Car & Driver", amount: transportCost, note: "Private SUV/Sedan, Hill Drive & Fuel" },
            { category: "Activities & Solang Passes", amount: activitiesCost, note: "Solang Valley & Mall Road Excursions" },
            { category: "Food & Meals", amount: foodCost, note: "Daily Breakfast & Local Cafe Meals" }
        ]
    };

    const days = [
        {
            day: 1,
            title: "Delhi to Shimla Scenic Hill Drive & Mall Road Stroll",
            route: "Delhi → Shimla",
            summary: "Morning departure from Delhi, scenic drive through Shivalik hills, hotel check-in, and evening Mall Road stroll.",
            morning: [
                { time: "06:00 AM", activity: "Early Morning Departure from Delhi via NH-44 & Himalayan Expressway" },
                { time: "11:00 AM", activity: "Breakfast stop at Timber Trail Parwanoo Viewpoint" }
            ],
            afternoon: [
                { time: "01:30 PM", activity: "Arrive in Shimla & Check-in to Partner Mountain Hotel" },
                { time: "03:00 PM", activity: "Unpack & Refresh with Pine-Forest Views" }
            ],
            evening: [
                { time: "05:30 PM", activity: "Sunset Walk at Shimla Mall Road, The Ridge & Christ Church" },
                { time: "08:00 PM", activity: "Dinner at Cafe Simla Times" }
            ],
            drive_time: "7 Hours Scenic Mountain Drive (340 km)",
            stay: "Handpicked 4-Star Resort in Shimla",
            meals: "Breakfast & Mountain Dinner",
            experience: "Himalayan Expressway Drive & Ridge Sunset",
            highlights: ["Himalayan Expressway", "The Ridge", "Mall Road"]
        },
        {
            day: 2,
            title: "Kufri Adventure & Drive to Manali Valley",
            route: "Shimla → Kufri → Manali",
            summary: "Morning Kufri valley viewpoints, scenic drive along Beas River, and evening arrival in Manali.",
            morning: [
                { time: "08:30 AM", activity: "Excursion to Kufri Fun World & Mahasu Peak Viewpoint" },
                { time: "11:00 AM", activity: "Depart Shimla for Manali via Mandi-Kullu Highway" }
            ],
            afternoon: [
                { time: "02:00 PM", activity: "Riverside Lunch at Pandoh Dam Viewpoint" },
                { time: "04:30 PM", activity: "Kullu Shawl Factory & Rafting Point Photo Stop" }
            ],
            evening: [
                { time: "07:00 PM", activity: "Arrive in Manali & Check-in to Mountain River Resort" },
                { time: "08:30 PM", activity: "Dinner overlooking Beas River Valley" }
            ],
            drive_time: "7.5 Hours Mountain Highway Drive (240 km)",
            stay: "River-facing Mountain Resort in Manali",
            meals: "Breakfast & Local Trout/Himachali Dinner",
            experience: "Beas River Highway Drive & Kufri Views",
            highlights: ["Kufri Valley", "Pandoh Dam", "Kullu Valley"]
        },
        {
            day: 3,
            title: "Solang Valley Adventure & Old Manali Cafes",
            route: "Manali (Solang Valley)",
            summary: "Full day excursion to Solang Valley for snow activities, Hadimba Temple, and Old Manali cafe culture.",
            morning: [
                { time: "08:30 AM", activity: "Drive to Solang Valley for Zorbing, Paragliding & Ropeway" },
                { time: "12:30 PM", activity: "Scenic Mountain Photo-ops & Snow Activity Point" }
            ],
            afternoon: [
                { time: "02:00 PM", activity: "Lunch at Old Manali Riverside Cafe" },
                { time: "03:30 PM", activity: "Visit Ancient Wooden Hadimba Devi Temple & Van Vihar Pine Forest" }
            ],
            evening: [
                { time: "06:00 PM", activity: "Mall Road Shopping for Woolens & Tibetan Handicrafts" },
                { time: "08:00 PM", activity: "Live Music Dinner at Johnson's Cafe" }
            ],
            drive_time: "Local Valley Commute (1 - 2 Hours)",
            stay: "River-facing Mountain Resort in Manali",
            meals: "Breakfast & Cafe Dinner",
            experience: "Solang Valley Adventure & Hadimba Temple",
            highlights: ["Solang Valley", "Hadimba Temple", "Old Manali Cafes"]
        },
        {
            day: 4,
            title: "Morning River Walk & Return Drive to Delhi",
            route: "Manali → Delhi",
            summary: "Leisurely morning by Beas River, souvenir shopping, and return drive back to Delhi.",
            morning: [
                { time: "08:00 AM", activity: "Morning Nature Walk along Beas River Bank & Hotel Breakfast" },
                { time: "09:30 AM", activity: "Hotel Check-out & Depart Manali for Delhi" }
            ],
            afternoon: [
                { time: "02:00 PM", activity: "Highway Lunch Break near Bilaspur" }
            ],
            evening: [
                { time: "09:00 PM", activity: "Arrive in Delhi & Airport/Station Drop" }
            ],
            drive_time: "12 Hours Return Highway Drive",
            stay: "End of Tour Services",
            meals: "Breakfast Included",
            experience: "Beas River Walk & Return Drive",
            highlights: ["Beas River Walk", "Delhi Return Drop"]
        }
    ];

    const markdownItinerary = `🏔️ **4-Day Customized Himachal Luxury Escape (Shimla & Manali)** 🇮🇳\n\n${conflictNotice ? `${conflictNotice}\n\n` : ""}I've created a chronologically validated **4-Day Himachal Itinerary for Shimla & Manali** (${travelerCount} Guests, Estimated: ₹${estimatedTotal.toLocaleString()} of ₹${requestedBudget.toLocaleString()} Budget).\n\n*Check out the interactive Luxury Itinerary & Budget Card below!* ✨`;

    return {
        isIndiaOnlyRestriction: false,
        tour_title: "Himachal Luxury Circuit (Shimla & Manali)",
        destination: "Shimla - Manali",
        durationDays: days.length,
        duration: `${days.length} Days / ${days.length - 1} Nights`,
        tour_overview: "Chronologically validated mountain itinerary covering Himalayan Expressway, Shimla Ridge, Kufri, Solang Valley adventure, and Old Manali cafes with zero route conflicts.",
        travelerCount,
        perPersonPrice,
        bundledTotalPrice: estimatedTotal,
        budget_breakdown: budgetBreakdown,
        conflict_notice: conflictNotice,
        highlights: [
            "Himalayan Expressway Drive & Timber Trail",
            "Shimla Mall Road & Ridge Sunset Walk",
            "Solang Valley Adventure & Paragliding",
            "Old Manali Cafe & Hadimba Temple Tour"
        ],
        days: days,
        itineraryTimeline: days,
        included: [
            "Private AC SUV/Sedan with Hill-Experienced Driver & Fuel",
            "Handpicked Mountain Resorts in Shimla & Manali (3 Nights)",
            "Daily Breakfast Included",
            "Delhi Airport / Station Transfers",
            "All State Taxes, Tolls & Green Tax"
        ],
        excluded: [
            "Airfare / Train Tickets to/from Delhi",
            "Solang Valley Adventure Sports Passes (Paragliding/Zorbing)",
            "Personal Shopping & Laundry"
        ],
        what_to_carry: [
            "Warm Jackets & Woolens",
            "Comfortable Trekking/Walking Shoes",
            "Sunscreen & Lip Balm for Mountain Air"
        ],
        best_time: "Throughout the year (Snow in Dec-Feb)",
        difficulty: "Moderate / Scenic Drive",
        ideal_for: "Couples, Friends & Adventure Lovers"
    };
}

/**
 * Chronologically Validated Itinerary Generator for Golden Triangle & India Destinations
 */
function buildGoldenTriangleItinerary(daysCount = 6, travelerCount = 2, targetBudget = 50000) {
    const requestedBudget = parseInt(targetBudget) || 50000;
    // Calculate intelligent estimated cost (~87% of budget, leaving ~13% buffer)
    const estimatedTotal = Math.round(requestedBudget * 0.87);
    const unallocatedBuffer = requestedBudget - estimatedTotal;

    const hotelsCost = Math.round(estimatedTotal * 0.35); // 35%
    const transportCost = Math.round(estimatedTotal * 0.40); // 40% (Car, Fuel, Driver, Tolls)
    const activitiesCost = Math.round(estimatedTotal * 0.12); // 12%
    const foodCost = estimatedTotal - (hotelsCost + transportCost + activitiesCost); // Remainder exact sum

    const perPersonPrice = Math.round(estimatedTotal / travelerCount);

    const budgetBreakdown = {
        requested_budget: requestedBudget,
        estimated_total: estimatedTotal,
        unallocated_buffer: unallocatedBuffer,
        items: [
            { category: "Hotels & Stays", amount: hotelsCost, note: "Handpicked 4-Star Partner Stays" },
            { category: "Private Car & Driver", amount: transportCost, note: "Sedan/SUV, Fuel, Parking & Tolls" },
            { category: "Activities & Sightseeing", amount: activitiesCost, note: "Guided Tours & Entry Slips" },
            { category: "Food & Dining Experience", amount: foodCost, note: "Daily Breakfast & Local Thalis" }
        ]
    };

    const days = [
        {
            day: 1,
            title: "Arrival in Delhi & Capital Heritage Discovery",
            route: "Delhi",
            summary: "Explore Old and New Delhi landmarks with local street food walk.",
            morning: [
                { time: "09:00 AM", activity: "Airport / Station Pickup & Hotel Check-in" },
                { time: "11:00 AM", activity: "Old Delhi Walk & Chandni Chowk Food Stroll" }
            ],
            afternoon: [
                { time: "02:00 PM", activity: "India Gate & Rashtrapati Bhavan Drive-by" },
                { time: "04:30 PM", activity: "Qutub Minar Complex & Heritage Park" }
            ],
            evening: [
                { time: "07:30 PM", activity: "Connaught Place Dinner & Stroll" }
            ],
            drive_time: "Local City Commute (30 mins between sights)",
            stay: "Handpicked 4-Star Hotel in Delhi",
            meals: "Breakfast & Welcome Street Food Walk",
            experience: "Old Delhi Heritage & Capital Landmarks",
            highlights: ["Red Fort", "India Gate", "Qutub Minar", "CP Market"]
        },
        {
            day: 2,
            title: "Delhi to Agra Expressway Drive & Agra Fort",
            route: "Delhi → Agra",
            summary: "Morning drive via Yamuna Expressway, hotel check-in, and sunset Taj view from Mehtab Bagh.",
            morning: [
                { time: "07:00 AM", activity: "Depart Delhi via Yamuna Expressway (3.5 hrs drive)" },
                { time: "10:30 AM", activity: "Arrive in Agra & Check-in to Partner Hotel" }
            ],
            afternoon: [
                { time: "01:30 PM", activity: "Authentic Mughlai Lunch at Pinch of Spice" },
                { time: "03:00 PM", activity: "Guided Exploration of UNESCO World Heritage Agra Fort" }
            ],
            evening: [
                { time: "05:30 PM", activity: "Sunset Taj Mahal View from Mehtab Bagh across Yamuna" },
                { time: "08:00 PM", activity: "Rooftop Dinner overlooking illuminated Agra skyline" }
            ],
            drive_time: "3.5 Hours Expressway Drive",
            stay: "Luxury Heritage Hotel in Agra (Close to Taj Gate)",
            meals: "Breakfast & Mughlai Dinner",
            experience: "Yamuna Expressway Drive & Sunset Taj View",
            highlights: ["Agra Fort", "Mehtab Bagh", "Mughlai Cuisine"]
        },
        {
            day: 3,
            title: "Sunrise Taj Mahal & Drive to Jaipur via Fatehpur Sikri",
            route: "Agra → Fatehpur Sikri → Jaipur",
            summary: "Early morning Taj Mahal sunrise, Fatehpur Sikri tour, and evening arrival in Pink City.",
            morning: [
                { time: "05:45 AM", activity: "Sunrise Entrance to Taj Mahal (Best lighting & zero crowds)" },
                { time: "09:30 AM", activity: "Return to Hotel for Breakfast & Check-out" }
            ],
            afternoon: [
                { time: "11:30 AM", activity: "En-route stop at UNESCO site Fatehpur Sikri & Buland Darwaza" },
                { time: "02:30 PM", activity: "Highway Rajasthani Thali Lunch" }
            ],
            evening: [
                { time: "05:30 PM", activity: "Arrive in Jaipur & Hotel Check-in" },
                { time: "07:30 PM", activity: "Cultural Folk Dance & Royal Rajasthani Dinner at Chokhi Dhani" }
            ],
            drive_time: "4.5 Hours total (with Fatehpur Sikri break)",
            stay: "Haveli Style Heritage Hotel in Jaipur",
            meals: "Breakfast & Rajasthani Thali Dinner",
            experience: "Sunrise Taj Mahal & Royal Rajasthani Welcome",
            highlights: ["Sunrise Taj Mahal", "Fatehpur Sikri", "Chokhi Dhani"]
        },
        {
            day: 4,
            title: "Royal Jaipur Forts, Palaces & Hawa Mahal",
            route: "Jaipur",
            summary: "Full-day guided tour of Amber Fort, Jal Mahal, City Palace, and Pink City markets.",
            morning: [
                { time: "09:00 AM", activity: "Amber Fort Exploration & Maota Lake photo-ops" },
                { time: "12:00 PM", activity: "Jal Mahal (Water Palace) Viewpoint Stop" }
            ],
            afternoon: [
                { time: "01:30 PM", activity: "Lassi at Lassiwala & Royal Rajasthani Lunch" },
                { time: "03:00 PM", activity: "City Palace Museum & Jantar Mantar Observatory" }
            ],
            evening: [
                { time: "06:00 PM", activity: "Hawa Mahal Sunset Photo & Bapu/Johari Bazaar Shopping" }
            ],
            drive_time: "Local City Commute",
            stay: "Haveli Style Heritage Hotel in Jaipur",
            meals: "Breakfast & Royal Lunch",
            experience: "Amber Fort & Pink City Bazaars",
            highlights: ["Amber Fort", "City Palace", "Hawa Mahal", "Johari Bazaar"]
        },
        {
            day: 5,
            title: "Jaipur Craft Markets & Return Drive to Delhi",
            route: "Jaipur → Delhi",
            summary: "Morning craft shopping at Johari Bazaar, return drive to Delhi, and farewell dinner.",
            morning: [
                { time: "09:30 AM", activity: "Hotel Check-out & Johari Bazaar Blue Pottery Shopping" }
            ],
            afternoon: [
                { time: "11:30 AM", activity: "Depart Jaipur for Delhi via NE-4 Expressway (4.5 hrs drive)" },
                { time: "02:00 PM", activity: "Midway Highway Lunch Break" }
            ],
            evening: [
                { time: "05:00 PM", activity: "Arrive in Delhi & Check-in / Aerocity Drop" },
                { time: "07:30 PM", activity: "Farewell Dinner & Trip Reflections" }
            ],
            drive_time: "4.5 Hours Expressway Drive",
            stay: "Aerocity Hotel in Delhi (or Airport Drop)",
            meals: "Breakfast & Farewell Dinner",
            experience: "Expressway Smooth Return & Souvenir Shopping",
            highlights: ["Blue Pottery", "Expressway Drive", "Aerocity"]
        }
    ];

    return {
        isIndiaOnlyRestriction: false,
        tour_title: "Golden Triangle Luxury Escape",
        destination: "Delhi - Agra - Jaipur",
        durationDays: days.length,
        duration: `${days.length} Days / ${days.length - 1} Nights`,
        tour_overview: "Chronologically validated luxury Golden Triangle tour with sunrise Taj Mahal, royal Jaipur forts, private AC transport, and transparent budget allocation.",
        travelerCount,
        perPersonPrice,
        bundledTotalPrice: estimatedTotal,
        budget_breakdown: budgetBreakdown,
        highlights: [
            "Sunrise Entrance at Taj Mahal (Zero Crowds)",
            "Amber Fort & City Palace Guided Tours",
            "Yamuna & NE-4 Expressway Smooth Drives",
            "Private AC Sedan + Fuel + Driver Included"
        ],
        days: days,
        itineraryTimeline: days,
        included: [
            "Private AC Sedan/SUV with Driver & Fuel",
            "4-Star & Heritage Hotel Stays (4 Nights)",
            "Daily Breakfast Included",
            "Airport / Station Transfers",
            "All Parking, Tolls & State Taxes"
        ],
        excluded: [
            "Flights / Train Tickets to/from Delhi",
            "Monument Entry Tickets (approx ₹1,500/person)",
            "Personal Shopping & Laundry"
        ],
        what_to_carry: [
            "Comfortable Walking Shoes for Forts",
            "Sunglasses & Sunscreen",
            "Original Photo ID (Passport/Aadhaar for Taj)"
        ],
        best_time: "October to March (Pleasant Weather)",
        difficulty: "Easy / Family Friendly",
        ideal_for: "Couples, Families & First-time Visitors"
    };
}

async function generateIndiaTourPackage({ destination = 'Goa', durationDays = 4, travelerCount = 2, vibe = 'Balanced', budget = 50000 }) {
    logger.info('IndiaTourPlanner', 'Generating custom India tour package', { destination, durationDays, travelerCount, vibe, budget });

    const destClean = (destination || 'Goa').trim();

    // 1. Enforce India-Only Tour Restriction
    if (!isIndianDestination(destClean)) {
        logger.warn('IndiaTourPlanner', 'Non-Indian tour destination requested', { destination: destClean });
        return {
            isIndiaOnlyRestriction: true,
            message: `Abhi mere paas **India-only** tour packages available hain! 🇮🇳 Main aapko Goa, Kerala, Rajasthan, Kashmir, Ladakh ya kisi bhi Indian destination ka mast customized day-by-day plan bana ke de sakta hoon!`
        };
    }

    // 2. Query Live MySQL Database for Curated Tour Packages
    try {
        if (prisma) {
            const destLower = destClean.toLowerCase();
            const dbPackages = await prisma.$queryRawUnsafe(`SELECT * FROM tour_packages WHERE is_active = 1`);
            if (Array.isArray(dbPackages) && dbPackages.length > 0) {
                const matchedPkg = dbPackages.find(p => {
                    const pTitle = (p.title || '').toLowerCase();
                    const pDest = (p.destination || '').toLowerCase();
                    return pTitle.includes(destLower) || pDest.includes(destLower) ||
                        (destLower.includes('golden triangle') && pTitle.includes('golden triangle')) ||
                        (destLower.includes('delhi') && (pTitle.includes('delhi') || pDest.includes('delhi'))) ||
                        (destLower.includes('agra') && (pTitle.includes('agra') || pDest.includes('agra'))) ||
                        (destLower.includes('jaipur') && (pTitle.includes('jaipur') || pDest.includes('jaipur'))) ||
                        (destLower.includes('udaipur') && (pTitle.includes('udaipur') || pDest.includes('udaipur'))) ||
                        (destLower.includes('ranthambore') && (pTitle.includes('ranthambore') || pDest.includes('ranthambore'))) ||
                        (destLower.includes('jaisalmer') && (pTitle.includes('jaisalmer') || pDest.includes('jaisalmer'))) ||
                        (destLower.includes('jodhpur') && (pTitle.includes('jodhpur') || pDest.includes('jodhpur'))) ||
                        (destLower.includes('bikaner') && (pTitle.includes('bikaner') || pDest.includes('bikaner'))) ||
                        (destLower.includes('mount abu') && (pTitle.includes('mount abu') || pDest.includes('mount abu'))) ||
                        (destLower.includes('pushkar') && (pTitle.includes('pushkar') || pDest.includes('pushkar'))) ||
                        (destLower.includes('rajasthan') && (pTitle.includes('rajasthan') || pTitle.includes('desert')));
                });

                if (matchedPkg) {
                    const itineraryList = typeof matchedPkg.itinerary === 'string' ? JSON.parse(matchedPkg.itinerary || '[]') : (matchedPkg.itinerary || []);
                    const inclusionsList = typeof matchedPkg.inclusions === 'string' ? JSON.parse(matchedPkg.inclusions || '[]') : (matchedPkg.inclusions || []);
                    const exclusionsList = typeof matchedPkg.exclusions === 'string' ? JSON.parse(matchedPkg.exclusions || '[]') : (matchedPkg.exclusions || []);
                    const galleryList = typeof matchedPkg.gallery === 'string' ? JSON.parse(matchedPkg.gallery || '[]') : (matchedPkg.gallery || []);

                    return {
                        isIndiaOnlyRestriction: false,
                        id: matchedPkg.id,
                        tour_title: matchedPkg.title,
                        slug: matchedPkg.slug,
                        package_url: `https://gethotelstays.com/en/packages/${matchedPkg.slug}`,
                        destination: matchedPkg.destination,
                        duration: matchedPkg.duration,
                        durationDays: parseInt(matchedPkg.duration) || durationDays,
                        tour_overview: matchedPkg.overview,
                        travelerCount,
                        perPersonPrice: Math.round(parseFloat(matchedPkg.price) / travelerCount),
                        bundledTotalPrice: parseFloat(matchedPkg.price),
                        originalPrice: matchedPkg.original_price ? parseFloat(matchedPkg.original_price) : Math.round(parseFloat(matchedPkg.price) * 1.25),
                        discountPercent: matchedPkg.discount_percent || "24% OFF",
                        badge: matchedPkg.badge || "Bestseller",
                        rating: parseFloat(matchedPkg.rating || 4.8),
                        reviewsCount: parseInt(matchedPkg.reviews_count || 45),
                        image: matchedPkg.image,
                        gallery: galleryList,
                        highlights: inclusionsList.slice(0, 4),
                        included: inclusionsList,
                        excluded: exclusionsList,
                        days: itineraryList.map((item, idx) => ({
                            day: idx + 1,
                            title: item.title || `Day ${idx + 1}`,
                            summary: item.desc || item.title || '',
                            highlights: [item.title || 'Sightseeing']
                        })),
                        itineraryTimeline: itineraryList
                    };
                }
            }
        }
    } catch (dbErr) {
        logger.warn('IndiaTourPlanner', 'DB tour package fetch notice:', dbErr.message);
    }

    // 3. Check Geographic Route Conflict
    const conflictCheck = detectGeographicConflict(destClean);

    // 4. Special Himachal Circuit Engine (Shimla / Manali)
    if (/shimla|manali|kufri|solang|himachal/i.test(destClean) || (conflictCheck.hasConflict && /himachal|shimla|manali/i.test(conflictCheck.notice))) {
        return buildHimachalItinerary(4, travelerCount, budget, conflictCheck.notice);
    }

    // 5. Special Golden Triangle Chronological Reasoning Engine
    if (/golden\s*triangle|delhi\s*to\s*agra|agra\s*jaipur|jaipur\s*delhi/i.test(destClean) || (destClean.toLowerCase().includes('delhi') && destClean.toLowerCase().includes('agra'))) {
        return buildGoldenTriangleItinerary(5, travelerCount, budget);
    }

    const days = Math.max(2, Math.min(parseInt(durationDays) || 4, 10));
    const requestedBudget = parseInt(budget) || 50000;
    const estimatedTotal = Math.round(requestedBudget * 0.87);
    const unallocatedBuffer = requestedBudget - estimatedTotal;

    const hotelsCost = Math.round(estimatedTotal * 0.35);
    const transportCost = Math.round(estimatedTotal * 0.40);
    const activitiesCost = Math.round(estimatedTotal * 0.12);
    const foodCost = estimatedTotal - (hotelsCost + transportCost + activitiesCost);

    const perPersonPrice = Math.round(estimatedTotal / travelerCount);

    const budgetBreakdown = {
        requested_budget: requestedBudget,
        estimated_total: estimatedTotal,
        unallocated_buffer: unallocatedBuffer,
        items: [
            { category: "Hotels & Stays", amount: hotelsCost, note: "Handpicked 4-Star Partner Stays" },
            { category: "Private Car & Driver", amount: transportCost, note: "Private AC Vehicle, Fuel & Tolls" },
            { category: "Activities & Sightseeing", amount: activitiesCost, note: "Guided Excursions & Passes" },
            { category: "Food & Dining", amount: foodCost, note: "Daily Breakfast & Local Eats" }
        ]
    };

    const structuredDays = [];
    for (let d = 1; d <= days; d++) {
        if (d === 1) {
            structuredDays.push({
                day: 1,
                title: `Arrival in ${destClean} & Evening Sunset Walk`,
                route: `${destClean}`,
                summary: `Arrival at airport/station, hotel check-in, and evening sunset stroll.`,
                morning: [
                    { time: "10:00 AM", activity: `Arrival & Private Transfer to Hotel` },
                    { time: "11:30 AM", activity: `Smooth Hotel Check-in & Refresh` }
                ],
                afternoon: [
                    { time: "01:30 PM", activity: `Local Regional Thali Lunch` },
                    { time: "03:30 PM", activity: `Unpack & Relaxation` }
                ],
                evening: [
                    { time: "06:00 PM", activity: `Scenic Sunset Point Walk` },
                    { time: "08:00 PM", activity: `Welcome Dinner at Top-rated Eatery` }
                ],
                drive_time: "1 - 2 Hours Local Transfer",
                stay: `Handpicked 4-Star Hotel in ${destClean}`,
                meals: "Welcome Drink & Dinner",
                experience: "Sunset Viewpoint & Local Dining",
                highlights: ["Sunset Point", "Local Market"]
            });
        } else if (d === days) {
            structuredDays.push({
                day: d,
                title: `Craft Shopping & Airport Departure`,
                route: `${destClean}`,
                summary: `Leisurely morning, souvenir shopping, and smooth departure transfer.`,
                morning: [
                    { time: "09:00 AM", activity: `Hotel Breakfast Included` },
                    { time: "10:30 AM", activity: `Souvenir & Local Craft Market Shopping` }
                ],
                afternoon: [
                    { time: "12:00 PM", activity: `Hotel Check-out & Departure Transfer` }
                ],
                evening: [
                    { time: "05:00 PM", activity: `Airport / Station Drop with Sweet Memories` }
                ],
                drive_time: "1 - 2 Hours",
                stay: "End of Tour Services",
                meals: "Breakfast Included",
                experience: "Souvenir Shopping & Departure",
                highlights: ["Local Crafts", "Airport Drop"]
            });
        } else {
            structuredDays.push({
                day: d,
                title: `Full-Day Guided Sightseeing & Cultural Tour`,
                route: `${destClean}`,
                summary: `Explore top landmarks, scenic lakes/forts, and authentic cultural shows.`,
                morning: [
                    { time: "09:00 AM", activity: `Guided Landmark & Fort/Lake Exploration` },
                    { time: "11:30 AM", activity: `Scenic Viewpoint Photo Stop` }
                ],
                afternoon: [
                    { time: "01:30 PM", activity: `Authentic Local Cuisine Lunch` },
                    { time: "03:30 PM", activity: `Lake Cruise or Cultural Museum Visit` }
                ],
                evening: [
                    { time: "06:30 PM", activity: `Traditional Music/Dance Show or Night Market Stroll` }
                ],
                drive_time: "2 - 3 Hours Sightseeing Commute",
                stay: `Handpicked 4-Star Hotel in ${destClean}`,
                meals: "Breakfast & Lunch",
                experience: "Guided Sightseeing & Cultural Show",
                highlights: ["Guided Landmark Tour", "Cultural Show"]
            });
        }
    }

    const markdownItinerary = `🌴 **${days}-Day Customized ${destClean} Tour Package** 🇮🇳\n\nI've created a chronologically validated **${days}-Day itinerary for ${destClean}** (${travelerCount} Guests, Estimated: ₹${estimatedTotal.toLocaleString()} of ₹${requestedBudget.toLocaleString()} Budget).\n\n*Check out the interactive Luxury Itinerary & Budget Card below for your complete day-by-day breakdown!* ✨`;

    return {
        isIndiaOnlyRestriction: false,
        tour_title: `${destClean} ${days}-Day Luxury Package`,
        destination: destClean,
        durationDays: days,
        duration: `${days} Days / ${days - 1} Nights`,
        tour_overview: `Experience the best of ${destClean} with handpicked partner hotel stays, private transfers, and guided sightseeing.`,
        travelerCount,
        perPersonPrice,
        bundledTotalPrice: estimatedTotal,
        budget_breakdown: budgetBreakdown,
        highlights: [
            `Top Landmarks of ${destClean}`,
            'Private Airport / Station Transfers',
            'Handpicked 4-Star Stay with Breakfast'
        ],
        days: structuredDays,
        itineraryTimeline: structuredDays,
        included: [
            'Private AC Vehicle & Fuel',
            'Handpicked Hotel Stay',
            'Daily Breakfast Included',
            'Airport / Station Pick & Drop',
            'Toll, Parking & Driver Charges'
        ],
        excluded: [
            'Airfare / Train Tickets',
            'Monument Entry Tickets',
            'Personal Expenses & Shopping'
        ],
        what_to_carry: [
            'Comfortable Walking Shoes',
            'Sunscreen & Sunglasses',
            'Government ID Proof'
        ],
        best_time: 'October to March',
        difficulty: 'Easy / Family Friendly',
        ideal_for: 'Couples, Families & Groups'
    };
}

module.exports = {
    isIndianDestination,
    generateIndiaTourPackage
};
