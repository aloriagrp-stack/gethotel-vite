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

    // NRI / diaspora targeting
    "india hotels for nri",
    "book india hotel from usa",
    "book india hotel from uk",
    "book india hotel from uae",
    "india hotels for overseas indians",
    "india travel accommodation",
    "hotels india international booking",
    "india hotel booking nri",
    "visit india hotels",
    "india trip hotels",

    // City-specific
    "hotels mumbai",
    "hotels delhi",
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

    // Feature-specific
    "hotels with swimming pool india",
    "hotels with breakfast included india",
    "hotels with free cancellation india",
    "pay at hotel india",
    "last minute hotel deals india",
    "hourly hotels india",
    "hotels with gym india",

    // Brand
    "gethotelstays",
    "gethotel",
    "get hotel stays india",
    "gethotelstays booking",
];

/** Per-page SEO metadata */
export const PAGE_SEO = {
    home: {
        title: "Book Best Hotels & Hourly Stays in India | GetHotelStays",
        description:
            "Book hotels in India online at unbeatable prices. Compare luxury, budget & hourly stays. Pay only 12% to book, rest at hotel. Instant confirmation!",
        keywords: [
            "hotel booking india",
            "best hotels india",
            "luxury hotels india",
            "budget hotels india",
            "boutique hotels india",
            "book hotels online india",
            "india hotels best price",
            "hotels india nri",
            "india travel accommodation",
            "gethotelstays",
        ],
        ogType: "website",
    },

    hotels: {
        title: "Hotels in India — Search & Book Online | GetHotelStays",
        description:
            "Search 10,000+ verified hotels across India. Filter by price, star rating, amenities & location. Book instantly — pay only 12% online, rest at check-in. Free cancellation available.",
        keywords: [
            "search hotels india",
            "hotels india list",
            "india hotel search",
            "best hotel deals india",
            "verified hotels india",
            "hotels with free cancellation india",
            "compare hotels india",
            "hotel prices india",
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
        url: `${SITE.url}/hotel/${hotel.id}`,
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
];
