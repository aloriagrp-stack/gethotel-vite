import { getHotelUrl } from "./utils";

/**
 * GetHotelStays — Enterprise SEO Configuration
 * Targeting: India + NRI diaspora (US, UK, UAE, Canada, Australia, Singapore)
 * Strategy: $100K-level SEO — structured data, per-page metadata, international signals
 */

export const SITE = {
    name: "GetHotelStays",
    tagline: "India's Best Hotel Booking Platform",
    url: "https://gethotelstays.com",
    logo: "https://gethotelstays.com/og-image.jpg",
    twitterHandle: "@GetHotelStays",
    foundingYear: "2024",
    phone: "+91-800-GETHOTEL",
    email: "support@gethotelstays.com",
    address: {
        street: "India",
        city: "Mumbai",
        state: "Maharashtra",
        country: "IN",
        postalCode: "400001",
    },
};

/** Primary + LSI keyword clusters for maximum coverage */
export const GLOBAL_KEYWORDS = [
    // Core transactional (high commercial intent)
    "hotel booking india",
    "book hotels india online",
    "cheap hotels india",
    "luxury hotels india",
    "budget hotels india",
    "best hotels india",
    "hotels near me india",
    "india hotel deals",
    "india hotels best price",
    "hotel reservation india",

    // NRI / diaspora targeting — HIGH CONVERTING
    "india hotels for nri",
    "book india hotel from usa",
    "book india hotel from uk",
    "book india hotel from uae",
    "book india hotel from canada",
    "book india hotel from australia",
    "book india hotel from singapore",
    "india hotels for overseas indians",
    "india travel accommodation",
    "hotels india international booking",
    "india hotel booking nri",
    "visit india hotels",
    "india trip hotels",
    "nri hotel booking india",
    "overseas indian hotel booking",
    "book hotels india from abroad",
    "india hotels international payment",

    // Delhi-specific — SEASONAL HIGH VOLUME
    "hotels in delhi",
    "delhi hotels booking",
    "cheap hotels in delhi",
    "budget hotels in delhi",
    "affordable hotels in delhi",
    "best hotels in delhi",
    "delhi hotels near me",
    "hotels in new delhi",
    "delhi hotel deals",
    "delhi hotels best price",
    "5 star hotels in delhi",
    "4 star hotels in delhi",
    "3 star hotels in delhi",
    "luxury hotels in delhi",
    "boutique hotels in delhi",
    "hotels in connaught place delhi",
    "hotels in aerocity delhi",
    "hotels near delhi airport",
    "hotels near new delhi railway station",
    "hotels in paharganj delhi",
    "hotels in karol bagh delhi",
    "hotels in chandni chowk delhi",
    "hotels in south delhi",
    "hotels in north delhi",
    "hotels in east delhi",
    "hotels in west delhi",
    "delhi hotels with free cancellation",
    "delhi hotels pay at hotel",
    "hourly hotels in delhi",
    "day use hotels in delhi",
    "couple friendly hotels in delhi",
    "family hotels in delhi",
    "business hotels in delhi",
    "wedding hotels in delhi",

    // NRI + Delhi combination — MONEY KEYWORDS
    "delhi hotels for nri",
    "book delhi hotel from usa",
    "book delhi hotel from uk",
    "book delhi hotel from uae",
    "delhi hotels international booking",
    "delhi hotels nri booking",
    "affordable delhi hotels for nri",
    "best delhi hotels for overseas indians",

    // Delhi landmarks & areas — LOCAL INTENT
    "hotels near india gate delhi",
    "hotels near qutub minar delhi",
    "hotels near lotus temple delhi",
    "hotels near akshardham delhi",
    "hotels near red fort delhi",
    "hotels near humayun tomb delhi",
    "hotels near hauz khas delhi",
    "hotels near delhi metro stations",
    "hotels in dwarka delhi",
    "hotels in rohini delhi",
    "hotels in pitampura delhi",
    "hotels in janakpuri delhi",
    "hotels in laxmi nagar delhi",
    "hotels in preet vihar delhi",
    "hotels in greater noida",
    "hotels in ghaziabad",
    "hotels in faridabad",
    "hotels in gurugram delhi ncr",
    "hotels in noida",
    "budget hotels in mahipalpur delhi",
    "luxury hotels in aerocity delhi",
    "boutique hotels in hauz khas delhi",
    "heritage hotels in chandni chowk delhi",

    // Delhi seasonal — SUMMER/WINTER/FESTIVAL
    "summer hotels in delhi with pool",
    "winter hotels in delhi with heater",
    "diwali hotels in delhi",
    "christmas hotels in delhi",
    "new year hotels in delhi",
    "wedding season hotels delhi",
    "holi hotels in delhi",
    "delhi hotels for trade fair",
    "delhi hotels for business summit",
    "delhi hotels for wedding guests",

    // Delhi transit & travel
    "hotels near delhi airport terminal 3",
    "book delhi hotel with free airport pickup",
    "delhi airport transit hotel",
    "delhi railway station hotels",
    "nizamuddin railway station hotels delhi",
    "delhi metro hotels",
    "delhi hotel with airport transfer",
    "overnight stay near delhi airport",
    "delhi hotels for early morning flight",
    "layover hotels delhi airport",

    // Delhi budget ranges
    "delhi hotels under 500",
    "delhi hotels under 1000",
    "delhi hotels under 1500",
    "delhi hotels under 2000",
    "delhi hotels under 3000",
    "cheapest hotel in delhi",
    "delhi budget hotel for family",
    "delhi budget hotel for couple",

    // NRI country-specific — DEEP TARGETING
    "book delhi hotel from usa credit card",
    "book delhi hotel from uk paypal",
    "book delhi hotel from uae dirham",
    "book delhi hotel from canada pr",
    "book delhi hotel from australia",
    "book delhi hotel from singapore",
    "book delhi hotel from germany",
    "book delhi hotel from france",
    "book delhi hotel from japan",
    "book delhi hotel from hong kong",
    "book delhi hotel from malaysia",
    "book delhi hotel from indonesia",
    "book delhi hotel from south africa",
    "book delhi hotel from netherlands",
    "book delhi hotel from italy",
    "book delhi hotel from switzerland",
    "book delhi hotel from new zealand",
    "book delhi hotel from sweden",
    "book delhi hotel from norway",
    "nri hotel booking delhi from usa",
    "nri hotel booking delhi from uk",
    "nri hotel booking delhi from canada",
    "nri hotel booking delhi from australia",
    "oci card holder hotel booking delhi",
    "overseas citizen of india hotel delhi",
    "india hotel booking for us green card holder",

    // Delhi for specific traveler types
    "solo female hotels delhi",
    "backpacker hostels delhi",
    "delhi hotels for students",
    "delhi hotels for business trip",
    "delhi hotels for vacation",
    "delhi hotels for honeymoon",
    "delhi hotels for group travel",
    "delhi hotels for senior citizens",
    "delhi hotels for doctors",
    "delhi hotels for patients",
    "delhi hotels near hospitals",
    "delhi hotels near all india institute of medical sciences",
    "delhi hotels near safdarjung hospital",
    "delhi hotels near fortis hospital",
    "delhi hotels near max hospital",

    // Delhi hotel amenities specific
    "delhi hotels with free wifi",
    "delhi hotels with breakfast",
    "delhi hotels with parking",
    "delhi hotels with gym",
    "delhi hotels with swimming pool",
    "delhi hotels with restaurant",
    "delhi hotels with room service",
    "delhi hotels with ac",
    "delhi hotels with kitchen",
    "delhi hotels with balcony",
    "delhi pet friendly hotels",
    "delhi hotels with conference room",
    "delhi hotels with rooftop restaurant",

    // Long-tail competitor keywords (people also search)
    "oyo in delhi",
    "oyo rooms delhi",
    "treebo hotels delhi",
    "fabhotels delhi",
    "ibis delhi airport",
    "lemon tree delhi",
    "ginger hotel delhi",
    "park inn delhi",
    "radisson delhi",
    "jw marriott aerocity delhi",
    "novotel aerocity delhi",
    "taj mahal hotel delhi",
    "itc hotel delhi",
    "hyatt delhi",
    "sheraton delhi",
    "booking.com delhi hotels",
    "goibibo delhi hotels",
    "makemytrip delhi hotels",
    "expedia delhi hotels",
    "hotels in delhi with price",
    "delhi hotel rates",
    "delhi hotel tariff",
    "delhi hotel packages",
    "delhi hotel discount",
    "delhi hotel coupon code",

    // NRI trip planning — INDIA BOUND
    "india trip planner delhi hotels",
    "nri india visit delhi hotel",
    "delhi hotel for nri family visit",
    "delhi hotel near nri relatives",
    "best area to stay in delhi for nri",
    "delhi hotels with international payment",
    "delhi hotels that accept paypal",
    "delhi hotels that accept amex",
    "delhi hotels with foreign exchange",
    "nri friendly hotels delhi",

    // Unique selling proposition keywords
    "pay at hotel delhi",
    "pay later hotel delhi",
    "no advance hotel delhi",
    "partial payment hotel delhi",
    "book now pay later delhi",
    "zero advance hotel booking delhi",
    "pay on arrival hotel delhi",
    "cash on arrival hotel delhi",
    "pay on check in delhi",
    "pay at check in delhi hotels",

    // Hourly & micro-stay Delhi
    "hourly stay near delhi airport",
    "hourly hotel aerocity delhi",
    "hourly hotel paharganj delhi",
    "hourly hotel mahipalpur delhi",
    "hourly hotel connaught place delhi",
    "hourly hotel karol bagh delhi",
    "rest room near delhi airport",
    "freshen up near delhi airport",
    "day use hotel near delhi airport",
    "short stay hotel delhi airport",
    "6 hour stay delhi hotel",
    "12 hour stay delhi hotel",
    "transit hotel delhi international airport",

    // City-specific (other major)
    "hotels mumbai",
    "hotels bangalore",
    "hotels goa",
    "hotels jaipur",
    "hotels hyderabad",
    "hotels chennai",
    "hotels kolkata",
    "hotels agra",
    "hotels varanasi",
    "hotels kerala",
    "hotels shimla",
    "hotels manali",
    "hotels udaipur",
    "hotels rishikesh",
    "hotels amritsar",
    "hotels lucknow",
    "hotels ahmedabad",
    "hotels surat",
    "hotels indore",
    "hotels bhopal",
    "hotels patna",
    "hotels chandigarh",
    "hotels guwahati",
    "hotels bhubaneswar",
    "hotels vizag",
    "hotels coimbatore",
    "hotels mysore",
    "hotels madurai",
    "hotels puducherry",
    "hotels nagpur",
    "hotels srinagar",
    "hotels leh ladakh",
    "hotels darjeeling",
    "hotels mcleodganj",
    "hotels dharamshala",
    "hotels haridwar",
    "hotels rishikesh",
    "hotels pushkar",
    "hotels jodhpur",
    "hotels jaisalmer",
    "hotels khajuraho",
    "hotels kochi",
    "hotels munnar",
    "hotels alleppey",
    "hotels ooty",
    "hotels coorg",

    // Segment-specific
    "boutique hotels india",
    "heritage hotels india",
    "beach resorts india",
    "hill station hotels india",
    "spa resorts india",
    "business hotels india",
    "family hotels india",
    "couple hotels india",
    "pet friendly hotels india",
    "wedding venues india",
    "luxury resorts india",
    "budget hotels india",
    "mid range hotels india",
    "homestays india",
    "hostels india",
    "serviced apartments india",
    "villa rentals india",
    "treehouse stays india",
    "houseboats india",
    "farm stays india",
    "glamping india",
    "cottage rentals india",

    // Feature-specific
    "hotels with swimming pool india",
    "hotels with breakfast included india",
    "hotels with free cancellation india",
    "pay at hotel india",
    "last minute hotel deals india",
    "hourly hotels india",
    "hotels with gym india",
    "hotels with spa india",
    "hotels with restaurant india",
    "hotels with parking india",
    "hotels with balcony india",
    "hotels with kitchen india",
    "hotels with bathtub india",
    "hotels with sea view india",
    "hotels with mountain view india",
    "hotels with garden view india",
    "hotels with terrace india",
    "hotels with ac india",
    "hotels with wifi india",
    "eco friendly hotels india",
    "all inclusive hotels india",
    "hotels with airport transfer india",
    "hotels with laundry service india",
    "hotels with room service india",
    "hotels with conference facilities india",

    // Booking intent — HIGH CONVERSION
    "book hotel online india",
    "online hotel booking india",
    "cheapest hotel booking india",
    "best hotel booking site india",
    "best hotel booking app india",
    "compare hotel prices india",
    "hotel price comparison india",
    "discount hotel booking india",
    "hotel deals india today",
    "hotel booking offers india",
    "hotel booking coupon india",
    "hotel booking cashback india",
    "hotel booking without credit card india",
    "instant hotel booking india",
    "same day hotel booking india",
    "tomorrow hotel booking india",
    "weekend hotel deals india",
    "long stay hotel discounts india",
    "corporate hotel booking india",
    "group hotel booking india",

    // NRI India travel
    "nri travel india hotel booking",
    "book hotels for india trip from abroad",
    "india vacation hotels for nri",
    "nri india trip accommodation",
    "best hotel booking platform for nri",
    "india hotel booking for us residents",
    "india hotel booking for uk residents",
    "india hotel booking for uae residents",
    "pmo nri hotel booking india",
    "nri hotel booking website india",
    "safe hotel booking india for nri",

    // Competitor brand keywords (for comparison)
    "gethotelstays vs booking.com",
    "gethotelstays vs makemytrip",
    "gethotelstays vs goibibo",
    "gethotelstays vs expedia",
    "gethotelstays vs agoda",
    "gethotelstays vs trip.com",
    "gethotelstays vs oyo",
    "gethotelstays vs treebo",
    "gethotelstays vs fabhotels",
    "gethotelstays review",
    "gethotelstays is it legit",
    "gethotelstays trustpilot",
    "gethotelstays customer review",
    "is gethotelstays safe",
    "gethotelstays refund policy",
    "gethotelstays cancellation policy",

    // Brand
    "gethotelstays",
    "gethotel",
    "get hotel stays india",
    "gethotelstays booking",
    "gethotelstays delhi",
    "gethotelstays hotel booking",
    "gethotelstays app",
    "gethotelstays customer care",
    "gethotelstays contact number",
    "gethotelstays support",
    "get hotel stays delhi",
];

/** Per-page SEO metadata */
export const PAGE_SEO = {
    home: {
        title: "GetHotelStays.com | Official Site | Book Best Hotel Stays & Deals",
        description:
            "Book 10,000+ verified hotels in Delhi & across India at unbeatable prices. Luxury, budget & hourly stays. Pay only 12% online, rest at hotel. Trusted by NRIs from USA, UK, UAE. Instant confirmation & free cancellation!",
        keywords: [
            "hotel booking india",
            "best hotels india",
            "luxury hotels india",
            "budget hotels india",
            "affordable hotels india",
            "boutique hotels india",
            "book hotels online india",
            "india hotels best price",
            "hotels india nri",
            "india travel accommodation",
            "gethotelstays",
            "hotels in delhi",
            "cheap hotels in delhi",
            "budget hotels in delhi",
            "affordable hotels in delhi",
            "delhi hotels booking",
            "delhi hotel deals",
            "book delhi hotel from usa",
            "book delhi hotel from uk",
            "book delhi hotel from uae",
            "nri hotel booking delhi",
        ],
        ogType: "website",
    },

    hotels: {
        title: "Hotels in Delhi & India — Search, Compare & Book | GetHotelStays",
        description:
            "Search 10,000+ verified hotels in Delhi & across India. Filter by price, star rating, amenities & location. Budget to luxury. Pay only 12% online, rest at hotel. Free cancellation. Trusted by NRIs worldwide.",
        keywords: [
            "search hotels india",
            "hotels india list",
            "india hotel search",
            "best hotel deals india",
            "verified hotels india",
            "hotels with free cancellation india",
            "compare hotels india",
            "hotel prices india",
            "hotels in delhi",
            "delhi hotels booking",
            "cheap hotels in delhi",
            "budget hotels in delhi",
            "affordable hotels in delhi",
            "luxury hotels in delhi",
            "delhi hotels near me",
            "hotels near delhi airport",
            "hotels near new delhi railway station",
            "delhi hotels pay at hotel",
            "delhi hotels free cancellation",
        ],
        ogType: "website",
    },

    booking: {
        title: "Complete Your Hotel Booking | GetHotelStays — Secure & Instant",
        description:
            "Complete your hotel booking securely on GetHotelStays. Pay just 12% online to confirm — rest at the hotel. Instant booking confirmation & 24/7 support.",
        keywords: [
            "hotel booking confirmation india",
            "secure hotel booking",
            "pay at hotel india",
            "instant hotel booking",
        ],
        ogType: "website",
    },

    login: {
        title: "Login or Sign Up | GetHotelStays — India's Hotel Booking Platform",
        description:
            "Sign in to GetHotelStays to manage bookings, save favorites & get exclusive deals on hotels across India.",
        keywords: ["gethotelstays login", "hotel booking account india"],
        ogType: "website",
    },

    listProperty: {
        title: "List Your Hotel on GetHotelStays — Reach Millions of Travelers",
        description:
            "Partner with GetHotelStays and list your property. Access millions of Indian and NRI travelers. Easy dashboard, channel manager integration, instant payments.",
        keywords: [
            "list hotel india",
            "hotel partner india",
            "hotel management system india",
            "add hotel listing india",
            "hotel booking platform india",
            "gethotelstays partner",
        ],
        ogType: "website",
    },

    myBookings: {
        title: "My Bookings | GetHotelStays — Manage Your Hotel Reservations",
        description:
            "View and manage all your hotel bookings in one place. Download invoices, modify reservations & contact properties directly.",
        keywords: ["my hotel bookings india", "hotel reservation management"],
        ogType: "website",
    },

    wishlist: {
        title: "My Wishlist | GetHotelStays — Saved Hotels & Favorites",
        description:
            "Your saved hotels and dream stays in India. Quick access to your favorite properties on GetHotelStays.",
        keywords: ["saved hotels india", "hotel wishlist india"],
        ogType: "website",
    },

    partner: {
        title: "Hotel Partner Program | GetHotelStays — Grow Your Property Business",
        description:
            "Join GetHotelStays as a hotel partner. Zero upfront cost, instant payouts, advanced analytics, channel manager & 24/7 support. India's fastest growing hotel booking platform.",
        keywords: [
            "hotel partner program india",
            "list property india",
            "hotel booking platform partner",
            "hotel revenue management india",
            "hotel channel manager india",
        ],
        ogType: "website",
    },

    delhi: {
        title: "Hotels in Delhi — Book Budget to Luxury Stays | Pay 12% Now | GetHotelStays",
        description:
            "Book 2,000+ verified hotels in Delhi at best prices. From budget stays in Paharganj to luxury in Aerocity & Connaught Place. Pay only 12% online, rest at hotel. Free cancellation. Trusted by NRIs from USA, UK, UAE. Instant confirmation.",
        keywords: [
            "hotels in delhi",
            "delhi hotels booking",
            "cheap hotels in delhi",
            "budget hotels in delhi",
            "affordable hotels in delhi",
            "best hotels in delhi",
            "luxury hotels in delhi",
            "5 star hotels in delhi",
            "4 star hotels in delhi",
            "3 star hotels in delhi",
            "boutique hotels in delhi",
            "hotels in connaught place delhi",
            "hotels in aerocity delhi",
            "hotels near delhi airport",
            "hotels near new delhi railway station",
            "hotels in paharganj delhi",
            "hotels in karol bagh delhi",
            "hotels in chandni chowk delhi",
            "hotels in south delhi",
            "hotels in north delhi",
            "delhi hotels with free cancellation",
            "delhi hotels pay at hotel",
            "hourly hotels in delhi",
            "day use hotels in delhi",
            "couple friendly hotels in delhi",
            "family hotels in delhi",
            "business hotels in delhi",
            "wedding hotels in delhi",
            "delhi hotels for nri",
            "book delhi hotel from usa",
            "book delhi hotel from uk",
            "book delhi hotel from uae",
            "delhi hotels international booking",
            "nri hotel booking delhi",
            "affordable delhi hotels for nri",
        ],
        ogType: "website",
    },
};

/** Build full page title */
export const buildTitle = (pageTitle?: string) => {
    if (!pageTitle) return PAGE_SEO.home.title;
    return `${pageTitle} | GetHotelStays`;
};

/** Build hotel detail page SEO */
export const buildHotelSEO = (hotel: {
    name: string;
    city?: string;
    state?: string;
    address?: string;
    pricePerNight?: number;
    starRating?: number;
    description?: string;
    images?: string[];
}) => {
    const location = [hotel.city, hotel.state].filter(Boolean).join(", ") || "India";
    const price = hotel.pricePerNight ? `from ₹${hotel.pricePerNight?.toLocaleString("en-IN")}/night` : "";
    const stars = hotel.starRating ? `${hotel.starRating}-Star` : "";

    return {
        title: `${hotel.name} — ${stars} Hotel in ${location} ${price} | GetHotelStays`,
        description: hotel.description
            ? `${hotel.description.slice(0, 140)}... Book ${hotel.name} in ${location}. Best price guaranteed. Instant confirmation.`
            : `Book ${hotel.name} — ${stars} hotel in ${location} ${price}. Verified property, free cancellation available. Pay 12% now, rest at hotel. Instant confirmation on GetHotelStays.`,
        keywords: [
            `hotels in ${hotel.city?.toLowerCase() || "india"}`,
            `${hotel.name?.toLowerCase()} hotel`,
            `${hotel.city?.toLowerCase() || ""} hotels`,
            `book hotel ${hotel.city?.toLowerCase() || "india"}`,
            `best hotels ${hotel.city?.toLowerCase() || "india"}`,
            `${stars.toLowerCase()} hotels india`,
            "hotel booking india",
            "gethotelstays",
        ].filter(Boolean),
        ogType: "place",
        ogImage: hotel.images?.[0] || SITE.logo,
    };
};

/** Organization JSON-LD schema */
export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetHotelStays",
    alternateName: ["GetHotel", "GetHotel Stays"],
    url: SITE.url,
    logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/og-image.jpg`,
        width: 1200,
        height: 630,
    },
    description:
        "GetHotelStays is India's premier online hotel booking platform, offering luxury, boutique and budget hotels across India. Trusted by travelers from India, USA, UK, UAE & worldwide.",
    foundingDate: SITE.foundingYear,
    contactPoint: [
        {
            "@type": "ContactPoint",
            telephone: SITE.phone,
            contactType: "customer support",
            availableLanguage: ["English", "Hindi"],
            areaServed: ["IN", "US", "GB", "AE", "CA", "AU", "SG"],
        },
    ],
    address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
    },
    sameAs: [
        "https://www.facebook.com/gethotelstays",
        "https://www.instagram.com/gethotelstays",
        "https://twitter.com/gethotelstays",
        "https://www.linkedin.com/company/gethotelstays",
        "https://www.youtube.com/@gethotelstays",
    ],
};

/** WebSite schema with SearchAction (enables Google Sitelinks search box) */
export const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetHotelStays",
    alternateName: "GetHotel — Hotel Booking India",
    url: SITE.url,
    description: "Book the best hotels in India. Luxury, boutique & budget stays at unbeatable prices.",
    inLanguage: ["en-IN", "en"],
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE.url}/hotels?city={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

/** TravelAgency / Online Hotel Booking Service schema */
export const travelAgencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "GetHotelStays",
    url: SITE.url,
    logo: `${SITE.url}/og-image.jpg`,
    image: `${SITE.url}/og-image.jpg`,
    description: "India's best online hotel booking platform with 10,000+ verified properties.",
    telephone: SITE.phone,
    priceRange: "₹₹-₹₹₹₹",
    address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.postalCode,
        addressCountry: SITE.address.country,
    },
    areaServed: {
        "@type": "Country",
        name: "India",
    },
    hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Hotel Stays India",
        itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "LodgingBusiness", name: "Luxury Hotels India" } },
            { "@type": "Offer", itemOffered: { "@type": "LodgingBusiness", name: "Budget Hotels India" } },
            { "@type": "Offer", itemOffered: { "@type": "LodgingBusiness", name: "Boutique Hotels India" } },
            { "@type": "Offer", itemOffered: { "@type": "Resort", name: "Beach Resorts India" } },
            { "@type": "Offer", itemOffered: { "@type": "Resort", name: "Hill Station Resorts India" } },
        ],
    },
};

/** Build Hotel (LodgingBusiness) JSON-LD for a specific hotel page */
export const buildHotelSchema = (hotel: any, reviews?: any[]) => {
    const images = (() => {
        try {
            const imgs = Array.isArray(hotel.images)
                ? hotel.images
                : typeof hotel.images === "string"
                ? JSON.parse(hotel.images)
                : [];
            const filtered = imgs.filter(Boolean);
            if (filtered.length === 0 && hotel.thumbnail) {
                return [hotel.thumbnail];
            }
            return filtered.slice(0, 5);
        } catch {
            return hotel.thumbnail ? [hotel.thumbnail] : [SITE.logo];
        }
    })();

    const finalImages = images.length > 0 ? images : [hotel.thumbnail || SITE.logo];

    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        name: hotel.name,
        description: hotel.description || `Book ${hotel.name} — premium hotel in ${hotel.city || "India"}.`,
        url: `${SITE.url}${getHotelUrl(hotel.id, hotel.name)}`,
        telephone: hotel.phone || undefined,
        email: hotel.email || undefined,
        starRating: hotel.starRating
            ? { "@type": "Rating", ratingValue: hotel.starRating, bestRating: 5 }
            : undefined,
        address: {
            "@type": "PostalAddress",
            streetAddress: hotel.address,
            addressLocality: hotel.city,
            addressRegion: hotel.state,
            addressCountry: "IN",
        },
        geo: hotel.lat && hotel.lng
            ? { "@type": "GeoCoordinates", latitude: hotel.lat, longitude: hotel.lng }
            : undefined,
        priceRange: hotel.pricePerNight
            ? `₹${hotel.pricePerNight?.toLocaleString("en-IN")}+/night`
            : "₹₹-₹₹₹",
        image: finalImages,
        checkinTime: hotel.checkInTime || "14:00",
        checkoutTime: hotel.checkOutTime || "12:00",
        amenityFeature: (() => {
            try {
                const amenities = Array.isArray(hotel.amenities)
                    ? hotel.amenities
                    : JSON.parse(hotel.amenities || "[]");
                return amenities.map((a: string) => ({
                    "@type": "LocationFeatureSpecification",
                    name: a,
                    value: true,
                }));
            } catch {
                return [];
            }
        })(),
    };

    // Add aggregate rating if reviews exist
    if (hotel.rating && hotel.reviewCount) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: hotel.rating,
            reviewCount: hotel.reviewCount,
            bestRating: 10,
            worstRating: 1,
        };
    }

    // Add individual reviews
    if (reviews && reviews.length > 0) {
        schema.review = reviews.slice(0, 3).map((r: any) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.guestName || "Verified Guest" },
            reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 10,
            },
            reviewBody: r.comment || r.review,
            datePublished: r.createdAt || r.date,
        }));
    }

    return schema;
};

/** Breadcrumb schema builder */
export const buildBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${SITE.url}${item.url}`,
    })),
});

/** FAQ schema builder */
export const buildFAQSchema = (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
        },
    })),
});

/** Home page FAQ — high search volume queries */
export const HOME_FAQS = [
    {
        question: "How do I book a hotel on GetHotelStays?",
        answer: "Search for hotels by city or destination, choose your dates and guests, select your preferred room, and pay just 12% online to confirm. You pay the rest directly at the hotel.",
    },
    {
        question: "Can NRIs (Non-Resident Indians) book hotels in India on GetHotelStays?",
        answer: "Yes! GetHotelStays is the preferred hotel booking platform for NRIs. We accept international cards, PayPal, and all major payment methods. Book hotels in India from USA, UK, UAE, Canada, Australia, or anywhere in the world.",
    },
    {
        question: "Is my booking guaranteed on GetHotelStays?",
        answer: "100% guaranteed. All properties on GetHotelStays are verified. Once you pay the 12% advance, your room is instantly confirmed with a booking ID. You receive email confirmation immediately.",
    },
    {
        question: "What is the cancellation policy?",
        answer: "Most hotels on GetHotelStays offer free cancellation up to 24-48 hours before check-in. The cancellation policy varies by property and is clearly shown before you book.",
    },
    {
        question: "Why should I use GetHotelStays instead of other booking platforms?",
        answer: "GetHotelStays offers the best hotel rates in India with a unique Pay 12% Now model — you only pay a small deposit online and the rest at the hotel. We also offer no booking fees, instant confirmation, and 24/7 customer support.",
    },
    {
        question: "Which cities in India can I book hotels in?",
        answer: "GetHotelStays has hotels in 500+ cities and destinations across India including Mumbai, Delhi, Bangalore, Goa, Jaipur, Hyderabad, Chennai, Kolkata, Agra, Varanasi, Kerala, Shimla, Manali, Udaipur, Rishikesh, and many more.",
    },
    {
        question: "Can I book hourly hotels or day-use rooms on GetHotelStays?",
        answer: "Yes! GetHotelStays offers hourly hotel bookings for transit stays, business meetings, or quick rest breaks. Available in select properties across major Indian cities.",
    },
    {
        question: "Does GetHotelStays have a mobile app?",
        answer: "GetHotelStays works perfectly on mobile browsers. Our mobile-optimized website gives you the full app experience without any download required.",
    },
    {
        question: "How can NRIs book affordable hotels in Delhi from USA, UK, or UAE?",
        answer: "NRIs can easily book affordable hotels in Delhi on GetHotelStays. Simply visit the Delhi hotels page, choose your dates, and pay just 12% online using international credit cards, debit cards, or PayPal. The rest is paid at the hotel. We have 2,000+ verified budget to luxury properties across Delhi including Aerocity, Connaught Place, Paharganj, and Karol Bagh.",
    },
    {
        question: "What are the best affordable hotels in Delhi for budget travelers?",
        answer: "Delhi offers excellent budget hotels in areas like Paharganj, Karol Bagh, and Chandni Chowk. On GetHotelStays, you can find verified budget hotels starting from ₹999/night. These properties offer clean rooms, free WiFi, breakfast options, and are close to Delhi's top attractions like Red Fort, India Gate, and Qutub Minar.",
    },
    {
        question: "Are there hotels near Delhi Airport for international travelers?",
        answer: "Yes! Aerocity and Mahipalpur near Delhi Airport have dozens of verified hotels on GetHotelStays. Ideal for international travelers with early flights or late arrivals. Many offer free airport pickup, hourly stays for transit, and soundproof rooms. Book from anywhere in the world with our international payment options.",
    },
    {
        question: "Can I book Delhi hotels with free cancellation?",
        answer: "Most hotels in Delhi on GetHotelStays offer free cancellation up to 24-48 hours before check-in. You can filter by 'free cancellation' while searching. This is especially useful for NRIs planning flexible India trips.",
    },
    {
        question: "What documents are needed for hotel check-in in Delhi?",
        answer: "Indian nationals can check in with Aadhaar, Driving License, or any government ID. For NRIs, a valid Indian passport or OCI card works. Foreign nationals must present their passport and valid visa. All hotels on GetHotelStays accept these documents for a smooth check-in.",
    },
    {
        question: "What is the best time to visit Delhi for affordable hotel rates?",
        answer: "The best time for affordable hotel rates in Delhi is during the off-season (March-September) when prices are 30-50% lower than peak season (October-February). However, even during peak season, GetHotelStays offers competitive rates year-round with our 'Pay 12% Now' model. Book 2-3 weeks in advance for the best deals.",
    },
    {
        question: "How much does a hotel in Delhi cost per night on GetHotelStays?",
        answer: "Hotel prices in Delhi on GetHotelStays range from ₹500-₹999/night for budget stays in Paharganj/Mahipalpur, ₹1,000-₹2,500/night for mid-range in Karol Bagh/Connaught Place, and ₹3,000-₹15,000+/night for luxury in Aerocity/South Delhi. You only pay 12% online — the rest at the hotel.",
    },
    {
        question: "Can I book a hotel in Delhi for someone else?",
        answer: "Yes! NRIs frequently book Delhi hotels on GetHotelStays for family members, friends, or business associates visiting India. Simply enter the guest's name and contact details during booking. The guest can check in with their own ID. You pay 12% online — they pay the rest at the hotel.",
    },
    {
        question: "Are there hotels near Delhi's business districts for corporate travelers?",
        answer: "Absolutely! Delhi has excellent business hotels in Connaught Place, Aerocity, Gurugram, and Noida. These areas offer corporate-friendly hotels with conference rooms, business centers, high-speed WiFi, and executive lounges. GetHotelStays has verified options for corporate travelers with special business rates.",
    },
    {
        question: "What is the Pay 12% Now model for Delhi hotels?",
        answer: "GetHotelStays' 'Pay 12% Now' model means you only pay 12% of the total room price online to confirm your booking. The remaining 88% is paid directly at the hotel in Delhi when you check in. This gives you flexibility — no need to pay the full amount upfront. Most Delhi hotels accept cash, UPI, card, and international payments at check-in.",
    },
];

/** Delhi-specific FAQs for NRI + budget + seasonal traffic */
export const DELHI_FAQS = [
    {
        question: "What are the best affordable hotels in Delhi for NRI travelers?",
        answer: "GetHotelStays offers verified affordable hotels across Delhi for NRI travelers. Top budget-friendly areas include Paharganh (backpacker hub), Karol Bagh (mid-range), and Mahipalpur (near airport). Prices start from ₹999/night. All properties offer free WiFi, AC, and are verified for quality. Pay just 12% online using your international card — rest at hotel.",
    },
    {
        question: "How can I book a hotel in Delhi from the USA?",
        answer: "Booking a Delhi hotel from the USA is simple on GetHotelStays. Visit our Delhi hotels page, search by area or price, and complete your booking. We accept all US-issued credit/debit cards and PayPal. Pay only 12% to confirm, rest at the hotel. You'll get instant confirmation via email with a booking ID.",
    },
    {
        question: "Which area in Delhi is best for first-time international visitors?",
        answer: "For first-time international visitors, we recommend Aerocity (luxury, airport proximity), Connaught Place (central, iconic), or Karol Bagh (affordable, good food). All areas have verified hotels on GetHotelStays with easy access to Delhi Metro, major attractions, and 24/7 check-in.",
    },
    {
        question: "Are there hourly/day-use hotels in Delhi for transit passengers?",
        answer: "Yes! GetHotelStays offers hourly stays (3, 6, or 12 hours) in Delhi near the airport and railway stations. Perfect for transit passengers, business meetings, or quick rest between flights. Available in Aerocity, Mahipalpur, and Paharganj at affordable rates.",
    },
    {
        question: "What is the cheapest area to stay in Delhi for budget travelers?",
        answer: "Paharganj is the most budget-friendly area in Delhi with hotels starting from ₹500-999/night. Karol Bagh also offers good value for money. For travelers arriving from abroad, Mahipalpur near the airport has budget hotels from ₹800/night. All listed hotels on GetHotelStays are verified and safe for international travelers.",
    },
    {
        question: "Can I pay at the hotel in Delhi instead of paying online?",
        answer: "GetHotelStays uses a 'Pay 12% Now' model — you pay a small deposit (12%) online to confirm your booking, and the remaining amount is paid directly at the hotel in Delhi. This ensures your room is guaranteed while giving you payment flexibility. Most Delhi hotels on our platform accept cash, UPI, card, and international payments at check-in.",
    },
    {
        question: "Which Delhi hotels are near the main tourist attractions?",
        answer: "Hotels near Connaught Place offer proximity to India Gate, Rashtrapati Bhavan, and shopping areas. Properties near Chandni Chowk are close to Red Fort and Jama Masjid. Aerocity hotels provide easy access to Qutub Minar and Lotus Temple. All these areas have verified, affordable hotels on GetHotelStays.",
    },
    {
        question: "Is Delhi safe for solo female travelers booking hotels online?",
        answer: "Yes, Delhi has many safe and verified hotels for solo female travelers. On GetHotelStays, we verify all properties for safety, security, and cleanliness. We recommend areas like South Delhi (Hauz Khas, Saket), Connaught Place, and Aerocity for solo travelers. All our listed hotels have 24/7 security and CCTV monitoring.",
    },
    {
        question: "Can I book a hotel in Delhi using PayPal from abroad?",
        answer: "Yes! GetHotelStays accepts PayPal payments for Delhi hotel bookings from international travelers. You can also use Visa, Mastercard, Amex, and international debit cards. Pay just 12% via PayPal to confirm your booking — the remaining amount is paid at the hotel in Delhi. Instant confirmation with booking ID emailed to you.",
    },
    {
        question: "Which Delhi hotels have free airport pickup for international travelers?",
        answer: "Many hotels in Aerocity and Mahipalpur near Delhi Airport offer free airport pickup/drop for international travelers. Premium hotels in Aerocity like JW Marriott, Novotel, and Lemon Tree provide complimentary airport transfers. Budget hotels in Mahipalpur also offer paid pickup services starting from ₹200. Check the hotel amenities on GetHotelStays for 'Airport Transfer' availability.",
    },
    {
        question: "Are there good hotels near Delhi's shopping areas for NRI families?",
        answer: "Yes! NRI families visiting Delhi love staying near these shopping areas: Connaught Place (luxury brands, Janpath), Karol Bagh (budget shopping, street food), South Ex/Hauz Khas (boutiques, cafes), and Chandni Chowk (traditional Indian markets). All these areas have verified family-friendly hotels on GetHotelStays with spacious rooms, WiFi, and breakfast included.",
    },
    {
        question: "What is the cheapest way to book hotels in Delhi?",
        answer: "The cheapest way to book hotels in Delhi is through GetHotelStays. Here's how to save: (1) Book budget areas like Paharganj or Mahipalpur (from ₹500/night), (2) Use our 'Pay 12% Now' model to avoid full upfront payment, (3) Book for longer stays to get discounts, (4) Look for free cancellation options (most hotels offer it), (5) Book directly on GetHotelStays to avoid third-party markup fees.",
    },
    {
        question: "How can NRIs book Delhi hotels without an Indian phone number?",
        answer: "No problem! NRIs can book Delhi hotels on GetHotelStays using their international phone number. Simply enter your country code and number during booking. We'll send booking confirmation via email. At check-in, the hotel may ask for a local contact number, but many Delhi hotels now accept international numbers for NRI guests.",
    },
    {
        question: "Which Delhi hotels are near top tourist attractions for NRIs visiting India?",
        answer: "Top Delhi attractions and nearby hotels: (1) Red Fort & Jama Masjid — hotels in Chandni Chowk/Daryaganj, (2) India Gate & Rashtrapati Bhavan — hotels in Connaught Place, (3) Qutub Minar — hotels in Aerocity/South Delhi, (4) Lotus Temple — hotels in Kalkaji/South Delhi, (5) Akshardham Temple — hotels in Noida/Pandav Nagar. All verified on GetHotelStays with instant booking and free cancellation options.",
    },
    {
        question: "What currency can NRIs use to pay for Delhi hotels on GetHotelStays?",
        answer: "NRIs can pay the 12% deposit online using USD, GBP, EUR, AUD, CAD, SGD, or AED — our payment gateway automatically converts. The remaining 88% can be paid at the Delhi hotel in Indian Rupees (INR), or some hotels accept USD. We accept Visa, Mastercard, Amex, PayPal, and international debit cards with no hidden conversion fees.",
    },
];

/** City-specific schema builder */
export const buildCitySchema = (city: string, description: string, image?: string) => ({
    "@context": "https://schema.org",
    "@type": "City",
    name: city,
    url: `${SITE.url}/${city.toLowerCase().replace(/\s+/g, '-')}-hotels`,
    description: description,
    containedInPlace: {
        "@type": "Country",
        name: "India",
    },
});

/** Build structured data for a city hotel listing page with aggregate offers */
export const buildCityHotelListingSchema = (city: string, hotelCount: number, priceRange: string) => ({
    "@context": "https://schema.org",
    "@type": ["ItemList", "Product"],
    name: `Hotels in ${city}`,
    description: `Book verified hotels in ${city} at best prices. ${hotelCount}+ properties available. Budget to luxury. Pay 12% now, rest at hotel.`,
    url: `${SITE.url}/${city.toLowerCase().replace(/\s+/g, '-')}-hotels`,
    numberOfItems: hotelCount,
    offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        priceRange: priceRange,
        offerCount: hotelCount,
        availability: "https://schema.org/InStock",
    },
    areaServed: {
        "@type": "City",
        name: city,
        containedInPlace: { "@type": "Country", name: "India" },
    },
});
