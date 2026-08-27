export interface CityData {
    city: string;
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    introduction: string;
    sections: { h2: string; text: string }[];
    faqs: { question: string; answer: string }[];
}

const introTemplate = (city: string, keyAttractions: string, areas: string, priceRange: string) =>
    `Welcome to ${city}, one of India's most captivating destinations. Known for ${keyAttractions}, ${city} offers a perfect blend of culture, history, and modern attractions. GetHotelStays brings you verified hotels across ${city} — from budget-friendly stays starting at ${priceRange}/night to premium luxury properties. Our unique 'Pay 12% Now' model lets you book instantly with just a small deposit. Whether you're visiting for tourism, business, or transit, find the perfect ${city} hotel with instant confirmation, free cancellation options, and 24/7 customer support. Trusted by thousands of travelers and NRIs from USA, UK, UAE, Canada, and Australia.`;

const sectionBuilder = (city: string, area1: string, areaDesc1: string, area2: string, areaDesc2: string) => [
    {
        h2: `Best Areas to Stay in ${city} — Where to Book Your Hotel`,
        text: `${city} has several distinct neighborhoods each offering a unique experience. ${area1}: ${areaDesc1} ${area2}: ${areaDesc2} All areas have verified hotels on GetHotelStays covering budget stays, mid-range options, and luxury properties.`,
    },
    {
        h2: `Affordable Hotels in ${city} for Budget Travelers`,
        text: `Traveling to ${city} on a budget? GetHotelStays offers verified budget hotels starting from affordable rates. These properties offer clean rooms, free WiFi, AC, and essential amenities. Our 'Pay 12% Now' model means you only pay a small deposit online — the rest at the hotel. Perfect for backpackers, solo travelers, and families looking for value-for-money stays.`,
    },
    {
        h2: `Business & Luxury Hotels in ${city}`,
        text: `For corporate travelers and luxury seekers, ${city} offers premium hotels with world-class amenities including conference rooms, fine dining restaurants, swimming pools, spas, and executive lounges. Book business-friendly hotels with high-speed WiFi, room service, and convenient locations. Pay just 12% online to confirm your premium ${city} hotel booking.`,
    },
    {
        h2: `Hourly & Day-Use Hotels in ${city}`,
        text: `Need a room for just a few hours in ${city}? GetHotelStays offers flexible hourly stays — choose 3, 6, or 12-hour slots at affordable rates. Perfect for transit passengers, business meetings between appointments, travelers waiting for late-night transport, or quick rest breaks. Available at select properties across ${city}. Book instantly with zero hassle.`,
    },
];

const faqBuilder = (city: string, famousFor: string) => [
    {
        question: `What are the best budget hotels in ${city}?`,
        answer: `GetHotelStays has verified budget hotels across ${city} starting from affordable rates. These properties offer clean rooms, free WiFi, AC, attached bathrooms, and are located in safe neighborhoods. Popular budget areas include the central and transit-friendly zones. All hotels are verified for quality and safety.`,
    },
    {
        question: `Which are the best areas to stay in ${city}?`,
        answer: `The best areas to stay in ${city} depend on your purpose of visit. For tourists, areas near ${famousFor} are ideal. For business travelers, central business districts offer convenient access. For budget travelers, transit-friendly neighborhoods provide great value. All areas have verified hotels on GetHotelStays with free cancellation options.`,
    },
    {
        question: `Can I book a hotel in ${city} with free cancellation?`,
        answer: `Yes! Most hotels on GetHotelStays in ${city} offer free cancellation up to 24-48 hours before check-in. You can filter by 'Free Cancellation' while searching. This is especially useful for travelers with flexible itineraries. We clearly show the cancellation policy before you book — no hidden surprises.`,
    },
    {
        question: `Are there hourly hotel options in ${city}?`,
        answer: `Yes! GetHotelStays offers hourly stays (3, 6, or 12 hours) at select properties in ${city}. Perfect for transit travelers, quick business meetings, or rest between connecting transport. Hourly hotels are available near transit hubs and central locations at budget-friendly rates.`,
    },
    {
        question: `How does the Pay 12% model work for ${city} hotels?`,
        answer: `GetHotelStays' 'Pay 12% Now' model means you pay only 12% of the total room price online to confirm your ${city} hotel booking. The remaining 88% is paid directly at the hotel when you check in. This gives you flexibility — no need to pay the full amount upfront. Most hotels accept cash, UPI, card, and international payments at check-in.`,
    },
    {
        question: `Is ${city} safe for solo travelers booking hotels online?`,
        answer: `${city} is generally safe for solo travelers. GetHotelStays verifies all properties for safety, security, and cleanliness. We recommend staying in well-connected, central areas with good transport links. Our listed hotels have 24/7 security, CCTV monitoring, and helpful staff to ensure a comfortable stay.`,
    },
];

const citySlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const CITIES: CityData[] = [
    {
        city: "New Delhi",
        slug: "new-delhi",
        title: "Hotels in New Delhi — Book Budget & Luxury Stays | GetHotelStays",
        description: "Book verified hotels in New Delhi at best prices. Budget stays in Paharganj to luxury in Aerocity. Pay 12% now, rest at hotel. Trusted by NRIs & travelers. Instant confirmation!",
        keywords: [
            "hotels in new delhi",
            "best hotels in new delhi",
            "budget hotels in new delhi",
            "luxury hotels in new delhi",
            "hotels near new delhi railway station",
            "hotels near connaught place",
            "hotels near karol bagh metro station",
            "hotels in paharganj new delhi",
            "hotels near igi airport terminal 3",
            "family hotels in new delhi",
            "couple friendly hotels in new delhi",
            "business hotels in new delhi",
            "hotels with free breakfast in new delhi",
            "hotels with parking in new delhi",
            "hotels near india gate",
            "hotels near chandni chowk",
            "hotels near red fort",
            "hotels near akshardham temple",
            "hotels for foreign tourists in delhi",
            "hotels in central delhi"
        ],
        h1: `Hotels in New Delhi — Budget, Luxury & Hourly Stays`,
        introduction: introTemplate("New Delhi", "the national capital, Connaught Place, Qutub Minar, and India Gate", "Paharganj (transit, budget), Karol Bagh (shopping, family), Aerocity (luxury, airport transit), Connaught Place (central)", "₹999"),
        sections: sectionBuilder("New Delhi", "Paharganj & Karol Bagh", "Centrally located hubs near New Delhi Railway Station, offering budget hotels, local shopping, and street food.", "Aerocity & Connaught Place", "Aerocity's high-end luxury business transit hotels near IGI Airport, and CP's iconic shopping, dining, and central business district."),
        faqs: faqBuilder("New Delhi", "India Gate, Qutub Minar, and Red Fort"),
    },
    {
        city: "Agra",
        slug: "agra",
        title: "Hotels in Agra — Book Budget & Luxury Near Taj Mahal | GetHotelStays",
        description: "Book verified hotels in Agra at best prices. Hotels near Taj Mahal, budget stays in Tajganj, luxury on Fatehabad Road. Pay 12% now, rest at hotel. Instant confirmation!",
        keywords: [
            "hotels near taj mahal",
            "hotels in agra near taj mahal",
            "budget hotels near taj mahal",
            "luxury hotels in agra",
            "hotels near agra fort",
            "family hotels in agra",
            "hotels near taj mahal east gate",
            "hotels with taj mahal view",
            "hotels in fatehabad road agra",
            "best hotels in agra"
        ],
        h1: `Hotels in Agra — Budget, Luxury & Taj View Stays`,
        introduction: introTemplate("Agra", "the iconic Taj Mahal, Agra Fort, and rich Mughal heritage", "Tajganj (monument view), Fatehabad Road (luxury resorts), Sadar Bazaar (shopping, budget)", "₹944"),
        sections: sectionBuilder("Agra", "Tajganj & Fatehabad Road", "Walkable options to the Taj Mahal with stunning dome views, alongside premium resorts on Fatehabad Road.", "Sadar Bazaar & Cantt Area", "Budget-friendly hotels close to Agra Cantt railway station, famous petha shops, and local markets."),
        faqs: faqBuilder("Agra", "the Taj Mahal, Agra Fort, and Fatehpur Sikri"),
    },
    {
        city: "Jaipur",
        slug: "jaipur",
        title: "Hotels in Jaipur — Book Heritage & Budget Stays | GetHotelStays",
        description: "Book verified hotels in Jaipur at best prices. From budget stays in Bani Park to luxury heritage palaces near Hawa Mahal. Pay 12% now, rest at hotel. Free cancellation!",
        keywords: [
            "hotels in jaipur",
            "hotels near hawa mahal",
            "heritage hotels in jaipur",
            "hotels near city palace jaipur",
            "budget hotels in jaipur",
            "luxury hotels in jaipur",
            "hotels near amer fort",
            "hotels in bapu bazaar jaipur",
            "hotels near jaipur railway station",
            "best hotels in jaipur"
        ],
        h1: `Hotels in Jaipur — Heritage Palaces, Budget & Luxury Stays`,
        introduction: introTemplate("Jaipur", "its magnificent palaces, vibrant bazaars, Pink City heritage, and royal culture", "Bani Park (budget), Amer (heritage), MI Road (central), C-Scheme (upscale)", "₹944"),
        sections: sectionBuilder("Jaipur", "Amer & Bani Park", "Heritage palaces & havelis near Amer Fort, budget hotels in Bani Park near railway station.", "MI Road & C-Scheme", "Modern commercial corridors featuring business hotels, top dining, and handloom shopping markets."),
        faqs: faqBuilder("Jaipur", "Hawa Mahal, Amber Fort, and City Palace"),
    },
    {
        city: "Manali",
        slug: "manali",
        title: "Hotels in Manali — Book Budget to Snow View Stays | GetHotelStays",
        description: "Book verified hotels in Manali at best prices. Budget stays in Old Manali, luxury resorts near Solang Valley. Pay 12% now, rest at hotel. Free cancellation!",
        keywords: [
            "hotels in manali",
            "hotels near mall road manali",
            "mountain view hotels in manali",
            "hotels near hidimba temple",
            "riverside hotels in manali",
            "hotels in old manali",
            "honeymoon hotels in manali",
            "family hotels in manali",
            "luxury hotels in manali",
            "budget hotels in manali"
        ],
        h1: `Hotels in Manali — Snow-Capped Views, Budget & Adventure Stays`,
        introduction: introTemplate("Manali", "snow-capped peaks, pine forests, adventure sports, and romantic mountain ambiance", "Old Manali (budget), Solang Valley (adventure), Mall Road (central)", "₹1200"),
        sections: sectionBuilder("Manali", "Old Manali & Mall Road", "Bohemian vibes, budget cafes, riverside stays & mountain views", "Solang Valley & Vashisht", "Adventure sports hub, skiing, snow activities & hot spring baths"),
        faqs: faqBuilder("Manali", "Solang Valley, Rohtang Pass, and Hadimba Temple"),
    },
    {
        city: "Shimla",
        slug: "shimla",
        title: "Hotels in Shimla — Book Budget to Mountain View Stays | GetHotelStays",
        description: "Book verified hotels in Shimla at best prices. Budget stays in Mall Road, luxury in Mashobra. Pay 12% now, rest at hotel. Free cancellation & instant confirmation!",
        keywords: [
            "hotels in shimla",
            "hotels near mall road shimla",
            "luxury hotels in shimla",
            "budget hotels in shimla",
            "hotels near ridge shimla",
            "family hotels in shimla",
            "hotels with mountain view shimla",
            "hotels near kufri",
            "hotels near shimla railway station",
            "honeymoon hotels in shimla"
        ],
        h1: `Hotels in Shimla — Mountain Views, Mall Road & Heritage Stays`,
        introduction: introTemplate("Shimla", "its colonial architecture, Mall Road, toy train, and panoramic Himalayan views", "Mall Road (central), Mashobra (peaceful), Lakkar Bazaar (budget)", "₹1200"),
        sections: sectionBuilder("Shimla", "Mall Road & The Ridge", "Heart of Shimla with colonial charm, shopping, cafes & iconic Himalayan views", "Mashobra & Kufri", "Peaceful mountain resorts, pine forests, adventure activities & luxury getaways"),
        faqs: faqBuilder("Shimla", "The Ridge, Jakhoo Temple, and Kufri"),
    },
    {
        city: "Goa",
        slug: "goa",
        title: "Hotels in Goa — Book Budget to Beach Resort Stays | GetHotelStays",
        description: "Book verified hotels in Goa at best prices. Budget stays in Calangute, luxury resorts in South Goa. Pay 12% now, rest at hotel. Free cancellation & instant confirmation!",
        keywords: [
            "hotels in north goa",
            "hotels in south goa",
            "hotels near baga beach",
            "hotels near calangute beach",
            "hotels near candolim beach",
            "beach hotels in goa",
            "luxury beach resorts in goa",
            "budget hotels in goa",
            "family hotels in goa",
            "couple friendly hotels in goa"
        ],
        h1: `Hotels in Goa — Beach Resorts, Budget & Hourly Stays`,
        introduction: introTemplate("Goa", "its stunning beaches, Portuguese heritage, vibrant nightlife, and water sports", "Calangute/Baga (North - party), Palolem (South - peaceful), Panjim (heritage)", "₹1200"),
        sections: sectionBuilder("Goa", "North Goa (Calangute, Baga, Anjuna)", "Party hub with beach shacks, water sports, night markets & vibrant nightlife", "South Goa (Palolem, Varca, Colva)", "Peaceful luxury resorts, quiet beaches, family-friendly & premium wellness stays"),
        faqs: faqBuilder("Goa", "Baga Beach, Basilica of Bom Jesus, and Dudhsagar Falls"),
    },
    {
        city: "Udaipur",
        slug: "udaipur",
        title: "Hotels in Udaipur — Book Budget to Lake Palace Stays | GetHotelStays",
        description: "Book verified hotels in Udaipur at best prices. Budget stays in Lal Ghat, luxury lake palaces. Pay 12% now, rest at hotel. Free cancellation & instant confirmation!",
        keywords: [
            "hotels in udaipur",
            "hotels near lake pichola",
            "lake view hotels in udaipur",
            "heritage hotels in udaipur",
            "luxury hotels in udaipur",
            "hotels near city palace udaipur",
            "budget hotels in udaipur",
            "hotels near fateh sagar lake",
            "family hotels in udaipur",
            "best hotels in udaipur"
        ],
        h1: `Hotels in Udaipur — Lake City, Budget & Royal Palace Stays`,
        introduction: introTemplate("Udaipur", "its romantic lakes, royal palaces, colorful bazaars, and Rajput heritage", "Lal Ghat (budget), City Palace area (heritage), Fateh Sagar (luxury)", "₹1200"),
        sections: sectionBuilder("Udaipur", "Lal Ghat & City Palace Area", "Heritage zone with lake-facing hotels, rooftop restaurants & royal architecture", "Fateh Sagar Lake & Badi Lake", "Premium resorts with lake views, luxury amenities & peaceful ambiance"),
        faqs: faqBuilder("Udaipur", "City Palace, Lake Pichola, and Jag Mandir"),
    },
    {
        city: "Varanasi",
        slug: "varanasi",
        title: "Hotels in Varanasi — Book Budget to Ganga View Stays | GetHotelStays",
        description: "Book verified hotels in Varanasi at best prices. Budget stays near Dashashwamedh Ghat, luxury in Sarnath. Pay 12% now, rest at hotel. Instant confirmation!",
        keywords: [
            "hotels in varanasi",
            "hotels near kashi vishwanath temple",
            "hotels near dashashwamedh ghat",
            "hotels near assi ghat",
            "budget hotels in varanasi",
            "luxury hotels in varanasi",
            "family hotels in varanasi",
            "hotels near varanasi railway station",
            "hotels near ganga ghat",
            "best hotels in varanasi"
        ],
        h1: `Hotels in Varanasi — Ganga View, Budget & Heritage Stays`,
        introduction: introTemplate("Varanasi", "its ancient ghats, spiritual atmosphere, Ganga aarti, and Banarasi silk", "Dashashwamedh Ghat (central), Assi Ghat (peaceful), Sarnath (heritage), Cantonment (budget)", "₹1200"),
        sections: sectionBuilder("Varanasi", "Dashashwamedh Ghat & Assi Ghat", "Heart of Varanasi with Ganga view hotels, evening aarti & spiritual atmosphere", "Sarnath & Cantonment", "Buddhist heritage site hotels, peaceful stays & budget-friendly cantonment area"),
        faqs: faqBuilder("Varanasi", "Kashi Vishwanath Temple, Ganga Aarti, and Sarnath"),
    },
    {
        city: "Haridwar",
        slug: "haridwar",
        title: "Hotels in Haridwar — Book Budget to Ganga Aarti View Stays | GetHotelStays",
        description: "Book verified hotels in Haridwar at best prices. Budget stays near Har Ki Pauri, luxury in Sapt Sarovar. Pay 12% now, rest at hotel. Instant confirmation!",
        keywords: [
            "hotels in haridwar",
            "haridwar hotels booking",
            "har ki pauri hotels",
            "budget hotels haridwar",
            "sapt sarovar hotels",
            "haridwar hotel deals",
            "pay at hotel haridwar",
            "haridwar dharamshala"
        ],
        h1: `Hotels in Haridwar — Ganga Aarti, Budget & Pilgrim Stays`,
        introduction: introTemplate("Haridwar", "its sacred Ganga aarti, Har Ki Pauri, spiritual atmosphere, and Kumbh Mela", "Har Ki Pauri (central), Sapt Sarovar (peaceful), Railway Road (budget)", "₹1200"),
        sections: sectionBuilder("Haridwar", "Har Ki Pauri & Kankhal", "Iconic Ganga aarti location, pilgrim hotels & spiritual atmosphere", "Sapt Sarovar & Railway Road", "Peaceful ashrams, budget hotels & convenient railway station access"),
        faqs: faqBuilder("Haridwar", "Har Ki Pauri, Ganga Aarti, and Chandi Devi Temple"),
    },
    {
        city: "Jodhpur",
        slug: "jodhpur",
        title: "Hotels in Jodhpur — Book Budget to Blue City Heritage Stays | GetHotelStays",
        description: "Book verified hotels in Jodhpur at best prices. Budget stays in Sardarpura, luxury heritage in Mehrangarh area. Pay 12% now, rest at hotel. Free cancellation!",
        keywords: [
            "hotels in jodhpur",
            "jodhpur hotels booking",
            "blue city hotels jodhpur",
            "budget hotels jodhpur",
            "mehrangarh fort hotels",
            "sardarpura jodhpur hotels",
            "jodhpur hotel deals",
            "pay at hotel jodhpur",
            "heritage hotels jodhpur"
        ],
        h1: `Hotels in Jodhpur — Blue City, Heritage Havelis & Budget Stays`,
        introduction: introTemplate("Jodhpur", "its majestic Mehrangarh Fort, blue houses, royal heritage, and delicious mirchi bada", "Sardarpura (modern), Mehrangarh area (heritage), Pali Road (budget)", "₹1200"),
        sections: sectionBuilder("Jodhpur", "Sardarpura & Mehrangarh Area", "Blue city heritage hotels, fort views, rooftop restaurants & royal havelis", "Pali Road & Railway Station Area", "Budget-friendly hotels, local markets & convenient transport access"),
        faqs: faqBuilder("Jodhpur", "Mehrangarh Fort, Jaswant Thada, and Umaid Bhawan Palace"),
    },
];

export const getCityBySlug = (slug: string): CityData | undefined =>
    CITIES.find(c => c.slug === slug);

export const getCityByCityName = (name: string): CityData | undefined =>
    CITIES.find(c => c.city.toLowerCase() === name.toLowerCase());

export const CITY_SLUGS = CITIES.map(c => c.slug);
export const CITY_NAMES = CITIES.map(c => c.city);

export interface CitySEOData {
    city: string;
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    introduction: string;
    sections: { h2: string; text: string }[];
    faqs: { question: string; answer: string }[];
}

export const getCitySEO = (cityData: CityData, filterSlug?: string): CitySEOData => {
    const { city, slug } = cityData;
    if (!filterSlug) {
        return {
            city,
            slug,
            title: cityData.title,
            description: cityData.description,
            keywords: cityData.keywords,
            h1: cityData.h1,
            introduction: cityData.introduction,
            sections: cityData.sections,
            faqs: cityData.faqs,
        };
    }

    const cleanFilter = filterSlug.toLowerCase().trim();

    if (cleanFilter === "couple-friendly") {
        return {
            city,
            slug: `${slug}/couple-friendly`,
            title: `Couple Friendly Hotels in ${city} — Safe Stays for Unmarried Couples | GetHotelStays`,
            description: `Book safe and secure couple friendly hotels in ${city} at best prices. Pay 12% online, rest at hotel. Local IDs & unmarried couples accepted. Free cancellation!`,
            keywords: [
                `couple friendly hotels in ${city.toLowerCase()}`,
                `unmarried couples hotel ${city.toLowerCase()}`,
                `safe hotels for couples in ${city.toLowerCase()}`,
                `local id accepted hotels ${city.toLowerCase()}`,
                `hotels in ${city.toLowerCase()} for unmarried couples`
            ],
            h1: `Couple Friendly Hotels in ${city} — Unmarried Couples Welcome`,
            introduction: `Looking for a safe, private space in ${city}? GetHotelStays offers a handpicked list of couple-friendly hotels in ${city} that accept unmarried couples and local IDs. Book your stay securely with our 'Pay 12% Now' model — pay only a small 12% deposit online and the balance directly at check-in. Enjoy premium hospitality, 24/7 front desk security, and complete privacy.`,
            sections: [
                {
                    h2: `Safe & Secure Couple Friendly Hotels in ${city}`,
                    text: `All our couple-friendly hotels in ${city} are verified to ensure absolute privacy and security for unmarried couples. Standard hotel rules apply, but rest assured, you will experience zero hassle during check-in. Local government identity proofs are accepted at all listed properties.`
                },
                {
                    h2: `Why Book Couple Friendly Hotels on GetHotelStays?`,
                    text: `We prioritize your comfort and safety. With our unique 'Pay 12% Now' model, you can book instantly without paying the full amount upfront. Our customer support is available 24/7 to resolve any issues. Enjoy flexible cancellation options at select properties in ${city}.`
                }
            ],
            faqs: [
                {
                    question: `Do hotels in ${city} accept unmarried couples?`,
                    answer: `Yes, absolutely! GetHotelStays has partner hotels across ${city} that welcome unmarried couples. You can search easily on our platform as these hotels are fully verified.`
                },
                {
                    question: `Is local ID accepted at couple friendly hotels in ${city}?`,
                    answer: `Yes, most couple-friendly hotels in ${city} accept local IDs (like Aadhaar, Voter Card, Driving License) for check-in. A valid ID is required for both guests.`
                }
            ]
        };
    }

    if (cleanFilter === "hourly") {
        return {
            city,
            slug: `${slug}/hourly`,
            title: `Hourly Hotels in ${city} — Book 3, 6 & 12 Hour Rooms | GetHotelStays`,
            description: `Book verified hourly hotels in ${city} at lowest rates. Save money with flexible 3, 6, and 12-hour slots. Pay 12% now, rest at hotel. Instant booking & free cancellation!`,
            keywords: [
                `hourly hotels in ${city.toLowerCase()}`,
                `microstay hotels ${city.toLowerCase()}`,
                `3 hour hotel booking ${city.toLowerCase()}`,
                `hotels for few hours ${city.toLowerCase()}`,
                `day use hotels ${city.toLowerCase()}`,
                `transit hotels in ${city.toLowerCase()}`
            ],
            h1: `Hourly & Day-Use Hotels in ${city}`,
            introduction: `Need a place to rest, freshen up, or work between travel transits in ${city}? GetHotelStays offers flexible hourly stays. Choose 3, 6, or 12-hour slots at handpicked, verified hotels in ${city}. Our 'Pay 12% Now' model lets you book instantly with a minimum deposit. Save up to 60% compared to full-day rates, and pay only for the hours you use!`,
            sections: [
                {
                    h2: `Save Money with Flexible Microstays in ${city}`,
                    text: `Hourly bookings are perfect for transit passengers waiting for connections, business travelers between meetings, or tourists looking for a quick rest. Why pay for a full 24 hours when you only need a few? GetHotelStays offers slot bookings at top properties in ${city}.`
                },
                {
                    h2: `Hourly Hotels near Transit Hubs in ${city}`,
                    text: `We offer hourly hotels near major transit areas in ${city} (such as airports, railway stations, and central terminals) to minimize commute times. Book securely and enjoy all standard amenities including free Wi-Fi, air conditioning, and room service.`
                }
            ],
            faqs: [
                {
                    question: `How does hourly hotel booking work in ${city}?`,
                    answer: `Select your check-in time and choose a slot duration of 3, 6, or 12 hours. Pay 12% online to confirm, and the balance at check-in. Your booking expires after the slot duration.`
                },
                {
                    question: `Are hourly hotels in ${city} safe?`,
                    answer: `Yes, all hourly hotels are premium, verified properties. They maintain the same high safety and cleanliness standards as full-day bookings.`
                }
            ]
        };
    }

    if (cleanFilter === "budget") {
        return {
            city,
            slug: `${slug}/budget`,
            title: `Budget Hotels in ${city} — Cheap & Clean Stays from ₹699 | GetHotelStays`,
            description: `Book best budget hotels in ${city} starting at lowest prices. Clean rooms, free WiFi, and AC. Pay 12% now, rest at hotel. Safe & family-friendly stays!`,
            keywords: [
                `budget hotels in ${city.toLowerCase()}`,
                `cheap hotels ${city.toLowerCase()}`,
                `affordable stay ${city.toLowerCase()}`,
                `hotels under 1500 ${city.toLowerCase()}`,
                `low price hotels ${city.toLowerCase()}`,
                `cheap accommodation in ${city.toLowerCase()}`
            ],
            h1: `Budget-Friendly Hotels in ${city}`,
            introduction: `Traveling to ${city} shouldn't break the bank. GetHotelStays offers verified budget hotels in ${city} starting from cheap rates. These pocket-friendly properties provide essential amenities like free Wi-Fi, clean linen, air conditioning, and 24/7 security. Pay only 12% online to lock in the lowest rates and the rest at the hotel.`,
            sections: [
                {
                    h2: `Affordable Stays in Central ${city}`,
                    text: `Our budget accommodations are strategically located near major markets, tourist spots, and public transport links in ${city}, helping you save on local travel costs. Choose from guest houses, homestays, and budget transit hotels.`
                },
                {
                    h2: `High Quality at Lower Prices`,
                    text: `Lower price doesn't mean compromise. Every budget hotel on GetHotelStays undergoes a rigorous quality check to ensure cleanliness, hygiene, safe drinking water, and working amenities. Ideal for solo travelers, backpackers, and families.`
                }
            ],
            faqs: [
                {
                    question: `What amenities are included in budget hotels in ${city}?`,
                    answer: `Most budget hotels on our platform provide free Wi-Fi, clean beds, private bathrooms, air conditioning, and complimentary drinking water.`
                },
                {
                    question: `Can I book cheap hotels in ${city} with pay-at-hotel option?`,
                    answer: `Yes! With our 'Pay 12% Now' model, you only pay a tiny deposit of 12% online to confirm the booking, and the rest (88%) is paid directly at check-in.`
                }
            ]
        };
    }

    if (cleanFilter === "luxury") {
        return {
            city,
            slug: `${slug}/luxury`,
            title: `Luxury Hotels in ${city} — Book 5-Star Resorts & Stays | GetHotelStays`,
            description: `Book premium luxury hotels and 5-star resorts in ${city}. World-class hospitality, fine dining, swimming pool, and spa. Pay 12% now, rest at hotel. Book now!`,
            keywords: [
                `luxury hotels in ${city.toLowerCase()}`,
                `5 star hotels ${city.toLowerCase()}`,
                `premium resorts ${city.toLowerCase()}`,
                `best luxury stays ${city.toLowerCase()}`,
                `boutique hotels ${city.toLowerCase()}`,
                `resorts in ${city.toLowerCase()}`
            ],
            h1: `Premium & Luxury Hotels in ${city}`,
            introduction: `Experience premium hospitality and world-class luxury in ${city}. GetHotelStays brings you a curated list of top-tier 4-star and 5-star hotels and luxury resorts in ${city}. Indulge in premium rooms, fine dining restaurants, infinity pools, serene spas, and exceptional guest services. Secure your luxury reservation by paying only 12% online now.`,
            sections: [
                {
                    h2: `Premium Amenities & World-Class Hospitality in ${city}`,
                    text: `Our luxury properties in ${city} feature top-of-the-line amenities such as executive lounges, fitness centers, multi-cuisine dining, concierge services, and valet parking. Perfect for business elites, honeymooners, and leisure travelers.`
                },
                {
                    h2: `Boutique & Heritage Stays in ${city}`,
                    text: `For a unique experience, explore heritage luxury hotels and boutique properties in ${city} that blend local culture with modern grandeur. Get exclusive deals, free cancellations on select dates, and dynamic upgrades.`
                }
            ],
            faqs: [
                {
                    question: `Do luxury hotels in ${city} accept international cards?`,
                    answer: `Yes, all our luxury hotel partners accept major credit/debit cards, UPI, netbanking, and cash at check-in.`
                },
                {
                    question: `Are swimming pools and spa access free in ${city} luxury hotels?`,
                    answer: `Generally, pool access is complimentary for in-house guests, while spa treatments and fine dining services are charged extra. Please review the hotel details section before booking.`
                }
            ]
        };
    }

    // Default Fallback
    return {
        city,
        slug,
        title: cityData.title,
        description: cityData.description,
        keywords: cityData.keywords,
        h1: cityData.h1,
        introduction: cityData.introduction,
        sections: cityData.sections,
        faqs: cityData.faqs,
    };
};
