// Comprehensive Indian Destinations & Localities for GetHotelStays
const ALL_DESTINATIONS = [
    // --- Major Metros & Capital Hubs ---
    { id: "city-delhi", label: "New Delhi", queryCity: "Delhi", sublabel: "National Capital Region, India", aliases: ["delhi", "new delhi", "ncr", "dilli"], category: "city", emoji: "🏙️" },
    { id: "city-mumbai", label: "Mumbai", queryCity: "Mumbai", sublabel: "Maharashtra, India", aliases: ["mumbai", "bombay", "maharashtra"], category: "city", emoji: "🏙️" },
    { id: "city-bangalore", label: "Bengaluru", queryCity: "Bangalore", sublabel: "Karnataka, India", aliases: ["bangalore", "bengaluru", "karnataka"], category: "city", emoji: "🏙️" },
    { id: "city-kolkata", label: "Kolkata", queryCity: "Kolkata", sublabel: "West Bengal, India", aliases: ["kolkata", "calcutta", "west bengal"], category: "city", emoji: "🏙️" },
    { id: "city-chennai", label: "Chennai", queryCity: "Chennai", sublabel: "Tamil Nadu, India", aliases: ["chennai", "madras", "tamil nadu"], category: "city", emoji: "🏙️" },
    { id: "city-hyderabad", label: "Hyderabad", queryCity: "Hyderabad", sublabel: "Telangana, India", aliases: ["hyderabad", "telangana"], category: "city", emoji: "🏙️" },
    { id: "city-pune", label: "Pune", queryCity: "Pune", sublabel: "Maharashtra, India", aliases: ["pune", "maharashtra"], category: "city", emoji: "🏙️" },
    { id: "city-ahmedabad", label: "Ahmedabad", queryCity: "Ahmedabad", sublabel: "Gujarat, India", aliases: ["ahmedabad", "gujarat"], category: "city", emoji: "🏙️" },
    { id: "city-gurugram", label: "Gurugram", queryCity: "Gurugram", sublabel: "Delhi NCR, Haryana", aliases: ["gurugram", "gurgaon", "haryana"], category: "city", emoji: "🏙️" },
    { id: "city-noida", label: "Noida", queryCity: "Noida", sublabel: "Delhi NCR, Uttar Pradesh", aliases: ["noida", "greater noida", "up"], category: "city", emoji: "🏙️" },

    // --- Leisure, Heritage & Tourist Capitals ---
    { id: "city-agra", label: "Agra", queryCity: "Agra", sublabel: "Uttar Pradesh, India", aliases: ["agra", "taj mahal", "up", "uttar pradesh"], category: "city", emoji: "🕌" },
    { id: "city-jaipur", label: "Jaipur", queryCity: "Jaipur", sublabel: "Rajasthan, India", aliases: ["jaipur", "pink city", "rajasthan"], category: "city", emoji: "🏰" },
    { id: "city-udaipur", label: "Udaipur", queryCity: "Udaipur", sublabel: "Rajasthan, India", aliases: ["udaipur", "city of lakes", "rajasthan"], category: "city", emoji: "🏰" },
    { id: "city-jodhpur", label: "Jodhpur", queryCity: "Jodhpur", sublabel: "Rajasthan, India", aliases: ["jodhpur", "blue city", "rajasthan"], category: "city", emoji: "🏰" },
    { id: "city-goa", label: "Goa", queryCity: "Goa", sublabel: "Beach & Coastal Hub, India", aliases: ["goa", "north goa", "south goa"], category: "city", emoji: "🏖️" },
    { id: "city-kochi", label: "Kochi", queryCity: "Kochi", sublabel: "Kerala, India", aliases: ["kochi", "cochin", "kerala"], category: "city", emoji: "🌴" },
    { id: "city-manali", label: "Manali", queryCity: "Manali", sublabel: "Himachal Pradesh, India", aliases: ["manali", "kullu", "himachal", "himachal pradesh"], category: "city", emoji: "🏔️" },
    { id: "city-shimla", label: "Shimla", queryCity: "Shimla", sublabel: "Himachal Pradesh, India", aliases: ["shimla", "himachal", "himachal pradesh"], category: "city", emoji: "🏔️" },
    { id: "city-varanasi", label: "Varanasi", queryCity: "Varanasi", sublabel: "Uttar Pradesh, India", aliases: ["varanasi", "banaras", "kashi", "up"], category: "city", emoji: "🕉️" },
    { id: "city-rishikesh", label: "Rishikesh", queryCity: "Rishikesh", sublabel: "Uttarakhand, India", aliases: ["rishikesh", "uttarakhand"], category: "city", emoji: "🧘" },
    { id: "city-haridwar", label: "Haridwar", queryCity: "Haridwar", sublabel: "Uttarakhand, India", aliases: ["haridwar", "uttarakhand"], category: "city", emoji: "🕉️" },
    { id: "city-mussoorie", label: "Mussoorie", queryCity: "Mussoorie", sublabel: "Uttarakhand, India", aliases: ["mussoorie", "uttarakhand"], category: "city", emoji: "🏔️" },
    { id: "city-amritsar", label: "Amritsar", queryCity: "Amritsar", sublabel: "Punjab, India", aliases: ["amritsar", "golden temple", "punjab"], category: "city", emoji: "🛕" },
    { id: "city-chandigarh", label: "Chandigarh", queryCity: "Chandigarh", sublabel: "Punjab & Haryana, India", aliases: ["chandigarh", "punjab", "haryana"], category: "city", emoji: "🏙️" },
    { id: "city-ayodhya", label: "Ayodhya", queryCity: "Ayodhya", sublabel: "Uttar Pradesh, India", aliases: ["ayodhya", "ram mandir", "up"], category: "city", emoji: "🛕" },
    { id: "city-munnar", label: "Munnar", queryCity: "Munnar", sublabel: "Kerala, India", aliases: ["munnar", "kerala"], category: "city", emoji: "🍃" },
    { id: "city-ooty", label: "Ooty", queryCity: "Ooty", sublabel: "Tamil Nadu, India", aliases: ["ooty", "tamil nadu"], category: "city", emoji: "⛰️" },
    { id: "city-puri", label: "Puri", queryCity: "Puri", sublabel: "Odisha, India", aliases: ["puri", "jagannath puri", "odisha"], category: "city", emoji: "🏖️" },

    // --- Key Localities in Delhi NCR ---
    { id: "area-paharganj", label: "Paharganj, New Delhi", queryCity: "Paharganj", sublabel: "Central Delhi, India", aliases: ["paharganj", "pahar ganj", "new delhi railway station", "ndls"], category: "city", emoji: "📍" },
    { id: "area-karol-bagh", label: "Karol Bagh, New Delhi", queryCity: "Karol Bagh", sublabel: "Central Delhi, India", aliases: ["karol bagh", "karolbagh"], category: "city", emoji: "📍" },
    { id: "area-connaught-place", label: "Connaught Place, New Delhi", queryCity: "Connaught Place", sublabel: "Central Business District, Delhi", aliases: ["connaught place", "cp", "rajiv chowk"], category: "city", emoji: "📍" },
    { id: "area-mahipalpur", label: "Mahipalpur, New Delhi", queryCity: "Mahipalpur", sublabel: "Near Delhi Airport (IGI), Delhi", aliases: ["mahipalpur", "delhi airport", "igi airport"], category: "city", emoji: "✈️" },
    { id: "area-aerocity", label: "Aerocity, New Delhi", queryCity: "Aerocity", sublabel: "Hospitality District, Delhi Airport", aliases: ["aerocity", "aero city"], category: "city", emoji: "✈️" },
    { id: "area-dwarka", label: "Dwarka, New Delhi", queryCity: "Dwarka", sublabel: "Near Yashobhoomi & IGI Airport", aliases: ["dwarka", "yashobhoomi"], category: "city", emoji: "📍" },

    // --- Key Localities in Goa ---
    { id: "area-candolim", label: "Candolim, Goa", queryCity: "Candolim", sublabel: "North Goa Beach, India", aliases: ["candolim", "candolim beach"], category: "city", emoji: "🏖️" },
    { id: "area-calangute", label: "Calangute, Goa", queryCity: "Calangute", sublabel: "North Goa Beach, India", aliases: ["calangute", "calangute beach"], category: "city", emoji: "🏖️" },
    { id: "area-baga", label: "Baga, Goa", queryCity: "Baga", sublabel: "North Goa Beach, India", aliases: ["baga", "baga beach"], category: "city", emoji: "🏖️" },
    { id: "area-panaji", label: "Panaji, Goa", queryCity: "Panaji", sublabel: "Capital City, Goa", aliases: ["panaji", "panjim"], category: "city", emoji: "📍" },

    // --- Key Localities in Mumbai ---
    { id: "area-colaba", label: "Colaba, Mumbai", queryCity: "Colaba", sublabel: "South Mumbai, India", aliases: ["colaba", "gateway of india"], category: "city", emoji: "📍" },
    { id: "area-bandra", label: "Bandra, Mumbai", queryCity: "Bandra", sublabel: "Western Suburbs, Mumbai", aliases: ["bandra", "bandra west"], category: "city", emoji: "📍" },
    { id: "area-andheri", label: "Andheri, Mumbai", queryCity: "Andheri", sublabel: "Near Mumbai Airport, Maharashtra", aliases: ["andheri", "mumbai airport"], category: "city", emoji: "✈️" },

    // --- Key Localities in Agra ---
    { id: "area-tajganj", label: "Tajganj, Agra", queryCity: "Tajganj", sublabel: "Near Taj Mahal, Uttar Pradesh", aliases: ["tajganj", "taj ganj"], category: "city", emoji: "🕌" },
    { id: "area-fatehabad", label: "Fatehabad Road, Agra", queryCity: "Fatehabad Road", sublabel: "Hotel & Tourist Hub, Agra", aliases: ["fatehabad road", "fatehabad"], category: "city", emoji: "📍" },

    // --- Key Localities in Bangalore ---
    { id: "area-mg-road", label: "MG Road, Bengaluru", queryCity: "MG Road", sublabel: "Central Bengaluru, Karnataka", aliases: ["mg road", "m.g. road"], category: "city", emoji: "📍" },
    { id: "area-koramangala", label: "Koramangala, Bengaluru", queryCity: "Koramangala", sublabel: "South Bengaluru, Karnataka", aliases: ["koramangala"], category: "city", emoji: "📍" },
    { id: "area-indiranagar", label: "Indiranagar, Bengaluru", queryCity: "Indiranagar", sublabel: "East Bengaluru, Karnataka", aliases: ["indiranagar", "indira nagar"], category: "city", emoji: "📍" }
];

module.exports = { ALL_DESTINATIONS };
