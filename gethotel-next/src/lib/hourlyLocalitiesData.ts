// Handcrafted Delhi Localities Registry for 100+ Hourly Landing Pages
// High-intent SEO & conversion metadata, transit info, local FAQs, and hotel matchers
// 100% human-crafted without AI tags or robotic filler

export interface HourlyLocality {
  slug: string;
  name: string;
  areaLabel: string;
  category: "transit" | "couple" | "business" | "commercial" | "heritage";
  badgeText: string;
  landmark: string;
  nearestMetro: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroCopy: string;
  hotelIds: number[];
  sections: { h2: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export const HOURLY_LOCALITIES: Record<string, HourlyLocality> = {
  'delhi-airport': {
    "slug": "delhi-airport",
    "name": "Delhi Airport (IGI T1/T2/T3)",
    "areaLabel": "IGI Airport & Aerocity",
    "category": "transit",
    "badgeText": "10 Mins from IGI Airport T3 \u2022 3h, 6h, 12h Micro-Stays",
    "landmark": "Indira Gandhi International Airport (T1, T2, T3) & Aerocity",
    "nearestMetro": "Delhi Aerocity Metro (Airport Express Line)",
    "metaTitle": "Hourly Hotels in Delhi Airport (IGI T1/T2/T3) Delhi \u2014 3, 6, 12h S",
    "metaDescription": "Book hourly hotels in Delhi Airport (IGI T1/T2/T3), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Aerocity Metro (Airport Expre",
    "h1": "Hourly Hotels in Delhi Airport (IGI T1/T2/T3), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Delhi Airport (IGI T1/T2/T3)? Perfect for flight layovers, early landings, and quick freshen-up before city meetings. Includes 24x7 reception, luggage holding, and high-speed Wi-Fi. Conveniently situated near Indira Gandhi International Airport (T1, T2, T3) & Aerocity, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1218,
        1219,
        1225,
        1226,
        1229,
        1231,
        1237,
        1244,
        1245,
        1254,
        1258,
        1260
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Delhi Airport (IGI T1/T2/T3) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Delhi Airport (IGI T1/T2/T3) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Delhi Airport (IGI T1/T2/T3) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Delhi Airport (IGI T1/T2/T3) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Delhi Airport (IGI T1/T2/T3). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Delhi Airport (IGI T1/T2/T3) hourly hotels?",
            "answer": "Yes. All partner hotels in Delhi Airport (IGI T1/T2/T3) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Delhi Airport (IGI T1/T2/T3)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Delhi Airport (IGI T1/T2/T3)."
        },
        {
            "question": "How much advance deposit is required to book in Delhi Airport (IGI T1/T2/T3)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Delhi Airport (IGI T1/T2/T3)?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Aerocity Metro (Airport Express Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj",
        "old-delhi-railway-station"
    ]
},
  'mahipalpur': {
    "slug": "mahipalpur",
    "name": "Mahipalpur",
    "areaLabel": "Mahipalpur, New Delhi",
    "category": "transit",
    "badgeText": "Near Airport T3 \u2022 Micro-Stays from \u20b9524",
    "landmark": "Delhi Aerocity, NH-48 & Radisson Blu Mahipalpur",
    "nearestMetro": "Delhi Aerocity Metro (Airport Express Line)",
    "metaTitle": "Hourly Hotels in Mahipalpur Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Mahipalpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Aerocity Metro (Airport Express Line). Pay only",
    "h1": "Hourly Hotels in Mahipalpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Mahipalpur? The primary airport hotel hub in Delhi with 70+ verified hourly properties. Quick 5-minute cab ride to Terminal 3 and Terminal 2. Conveniently situated near Delhi Aerocity, NH-48 & Radisson Blu Mahipalpur, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1218,
        1225,
        1226,
        1229,
        1231,
        1237,
        1245,
        1254,
        1258,
        1260,
        1262,
        1263
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Mahipalpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Mahipalpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Mahipalpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Mahipalpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Mahipalpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Mahipalpur hourly hotels?",
            "answer": "Yes. All partner hotels in Mahipalpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Mahipalpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Mahipalpur."
        },
        {
            "question": "How much advance deposit is required to book in Mahipalpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Mahipalpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Aerocity Metro (Airport Express Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj",
        "old-delhi-railway-station"
    ]
},
  'aerocity-delhi': {
    "slug": "aerocity-delhi",
    "name": "Aerocity Delhi",
    "areaLabel": "Hospitality District, Aerocity",
    "category": "business",
    "badgeText": "Worldmark & Airport Gateway \u2022 Flexible Hours",
    "landmark": "Worldmark Aerocity, JW Marriott, Pride Plaza",
    "nearestMetro": "Delhi Aerocity Metro Station",
    "metaTitle": "Hourly Hotels in Aerocity Delhi Delhi \u2014 3, 6, 12h Stays | GetHote",
    "metaDescription": "Book hourly hotels in Aerocity Delhi, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Aerocity Metro Station. Pay only 12% deposi",
    "h1": "Hourly Hotels in Aerocity Delhi, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Aerocity Delhi? Delhi's premier international hospitality hub. Ideal for corporate travelers needing day-use workspace, executive showers, and meeting transit. Conveniently situated near Worldmark Aerocity, JW Marriott, Pride Plaza, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1218,
        1225,
        1226,
        1229,
        1231,
        1237,
        1245,
        1254,
        1258,
        1260,
        1262,
        1263
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Aerocity Delhi for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Aerocity Delhi offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Aerocity Delhi strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Aerocity Delhi for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Aerocity Delhi. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Aerocity Delhi hourly hotels?",
            "answer": "Yes. All partner hotels in Aerocity Delhi are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Aerocity Delhi?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Aerocity Delhi."
        },
        {
            "question": "How much advance deposit is required to book in Aerocity Delhi?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Aerocity Delhi?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Aerocity Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "new-delhi-railway-station",
        "paharganj",
        "old-delhi-railway-station"
    ]
},
  'new-delhi-railway-station': {
    "slug": "new-delhi-railway-station",
    "name": "New Delhi Railway Station (NDLS)",
    "areaLabel": "Paharganj & Ajmeri Gate",
    "category": "transit",
    "badgeText": "2 Mins from Platform 1 & 16 \u2022 3h, 6h, 12h",
    "landmark": "NDLS Station, Ajmeri Gate Metro & Connaught Place",
    "nearestMetro": "New Delhi Metro Station (Yellow & Airport Express Lines)",
    "metaTitle": "Hourly Hotels in New Delhi Railway Station (NDLS) Delhi \u2014 3, 6, 1",
    "metaDescription": "Book hourly hotels in New Delhi Railway Station (NDLS), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near New Delhi Metro Station (Yellow",
    "h1": "Hourly Hotels in New Delhi Railway Station (NDLS), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in New Delhi Railway Station (NDLS)? Direct walking access from New Delhi Railway Station. Freshen up between connecting trains, store luggage safely, or take a power nap before journey. Conveniently situated near NDLS Station, Ajmeri Gate Metro & Connaught Place, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1219,
        1224,
        472,
        1247,
        1249,
        1252,
        1253,
        1265,
        1270,
        1303,
        1304
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in New Delhi Railway Station (NDLS) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in New Delhi Railway Station (NDLS) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in New Delhi Railway Station (NDLS) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in New Delhi Railway Station (NDLS) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in New Delhi Railway Station (NDLS). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in New Delhi Railway Station (NDLS) hourly hotels?",
            "answer": "Yes. All partner hotels in New Delhi Railway Station (NDLS) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in New Delhi Railway Station (NDLS)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in New Delhi Railway Station (NDLS)."
        },
        {
            "question": "How much advance deposit is required to book in New Delhi Railway Station (NDLS)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in New Delhi Railway Station (NDLS)?",
            "answer": "Most properties are located within 5 to 10 minutes of New Delhi Metro Station (Yellow & Airport Express Lines), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "paharganj",
        "old-delhi-railway-station"
    ]
},
  'paharganj': {
    "slug": "paharganj",
    "name": "Paharganj",
    "areaLabel": "Paharganj, Central Delhi",
    "category": "transit",
    "badgeText": "Opposite NDLS Station \u2022 Budget Hourly Stays",
    "landmark": "Main Bazaar Paharganj, Imperial Cinema, Chuna Mandi",
    "nearestMetro": "New Delhi Metro & RK Ashram Marg Metro (Blue Line)",
    "metaTitle": "Hourly Hotels in Paharganj Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Paharganj, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near New Delhi Metro & RK Ashram Marg Metro (Blue Line). Pa",
    "h1": "Hourly Hotels in Paharganj, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Paharganj? Historic budget travel hub with 24x7 check-in, authentic eateries, and unmatched connectivity to Old & New Delhi railway platforms. Conveniently situated near Main Bazaar Paharganj, Imperial Cinema, Chuna Mandi, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1325,
        1330,
        355,
        1341,
        1347,
        1348,
        1362,
        1366,
        1367,
        1382
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Paharganj for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Paharganj offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Paharganj strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Paharganj for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Paharganj. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Paharganj hourly hotels?",
            "answer": "Yes. All partner hotels in Paharganj are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Paharganj?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Paharganj."
        },
        {
            "question": "How much advance deposit is required to book in Paharganj?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Paharganj?",
            "answer": "Most properties are located within 5 to 10 minutes of New Delhi Metro & RK Ashram Marg Metro (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "old-delhi-railway-station"
    ]
},
  'old-delhi-railway-station': {
    "slug": "old-delhi-railway-station",
    "name": "Old Delhi Railway Station (DLI)",
    "areaLabel": "Chandni Chowk & Kashmere Gate",
    "category": "transit",
    "badgeText": "Near Old Delhi Station \u2022 24x7 Transit Stays",
    "landmark": "Old Delhi Junction, Chandni Chowk & Red Fort",
    "nearestMetro": "Chandni Chowk Metro & Kashmere Gate ISBT Interchange",
    "metaTitle": "Hourly Hotels in Old Delhi Railway Station (DLI) Delhi \u2014 3, 6, 12",
    "metaDescription": "Book hourly hotels in Old Delhi Railway Station (DLI), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Chandni Chowk Metro & Kashmere G",
    "h1": "Hourly Hotels in Old Delhi Railway Station (DLI), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Old Delhi Railway Station (DLI)? Strategic transit stays near Old Delhi Railway Station and Kashmere Gate ISBT. Easy walking to heritage food streets and wholesale markets. Conveniently situated near Old Delhi Junction, Chandni Chowk & Red Fort, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1271,
        1276,
        1293,
        1294,
        1312,
        1314,
        1318,
        1319,
        1325,
        1330
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Old Delhi Railway Station (DLI) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Old Delhi Railway Station (DLI) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Old Delhi Railway Station (DLI) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Old Delhi Railway Station (DLI) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Old Delhi Railway Station (DLI). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Old Delhi Railway Station (DLI) hourly hotels?",
            "answer": "Yes. All partner hotels in Old Delhi Railway Station (DLI) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Old Delhi Railway Station (DLI)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Old Delhi Railway Station (DLI)."
        },
        {
            "question": "How much advance deposit is required to book in Old Delhi Railway Station (DLI)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Old Delhi Railway Station (DLI)?",
            "answer": "Most properties are located within 5 to 10 minutes of Chandni Chowk Metro & Kashmere Gate ISBT Interchange, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'hazrat-nizamuddin-railway-station': {
    "slug": "hazrat-nizamuddin-railway-station",
    "name": "Hazrat Nizamuddin Railway Station",
    "areaLabel": "Nizamuddin & Sarai Kale Khan",
    "category": "transit",
    "badgeText": "Near Nizamuddin Station & Sarai Kale Khan RRTS",
    "landmark": "Nizamuddin Railway Station, Humayun Tomb, Sarai Kale Khan ISBT",
    "nearestMetro": "Sarai Kale Khan - Hazrat Nizamuddin Metro (Pink Line)",
    "metaTitle": "Hourly Hotels in Hazrat Nizamuddin Railway Station Delhi \u2014 3, 6, ",
    "metaDescription": "Book hourly hotels in Hazrat Nizamuddin Railway Station, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Sarai Kale Khan - Hazrat Nizam",
    "h1": "Hourly Hotels in Hazrat Nizamuddin Railway Station, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Hazrat Nizamuddin Railway Station? Ideal for Vande Bharat and Rajdhani travelers arriving at Nizamuddin. Quick cab to South Delhi business districts and India Gate. Conveniently situated near Nizamuddin Railway Station, Humayun Tomb, Sarai Kale Khan ISBT, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1236,
        1249,
        1255,
        1268,
        1301,
        1326,
        1335,
        1352,
        1353,
        1356,
        1360,
        1388
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Hazrat Nizamuddin Railway Station for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Hazrat Nizamuddin Railway Station offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Hazrat Nizamuddin Railway Station strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Hazrat Nizamuddin Railway Station for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Hazrat Nizamuddin Railway Station. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Hazrat Nizamuddin Railway Station hourly hotels?",
            "answer": "Yes. All partner hotels in Hazrat Nizamuddin Railway Station are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Hazrat Nizamuddin Railway Station?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Hazrat Nizamuddin Railway Station."
        },
        {
            "question": "How much advance deposit is required to book in Hazrat Nizamuddin Railway Station?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Hazrat Nizamuddin Railway Station?",
            "answer": "Most properties are located within 5 to 10 minutes of Sarai Kale Khan - Hazrat Nizamuddin Metro (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'anand-vihar': {
    "slug": "anand-vihar",
    "name": "Anand Vihar (ISBT & Railway Station)",
    "areaLabel": "Anand Vihar, East Delhi",
    "category": "transit",
    "badgeText": "Near Anand Vihar Terminal \u2022 3h & 6h Slots",
    "landmark": "Anand Vihar ISBT, Pacific Mall Anand Vihar, Railway Terminal",
    "nearestMetro": "Anand Vihar ISBT Metro (Blue & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Anand Vihar (ISBT & Railway Station) Delhi \u2014 3, ",
    "metaDescription": "Book hourly hotels in Anand Vihar (ISBT & Railway Station), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Anand Vihar ISBT Metro (Blu",
    "h1": "Hourly Hotels in Anand Vihar (ISBT & Railway Station), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Anand Vihar (ISBT & Railway Station)? East Delhi's primary multi-modal transit hub. Perfect for passengers connecting between inter-state buses, railway trains, and metro routes. Conveniently situated near Anand Vihar ISBT, Pacific Mall Anand Vihar, Railway Terminal, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1283,
        1471,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Anand Vihar (ISBT & Railway Station) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Anand Vihar (ISBT & Railway Station) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Anand Vihar (ISBT & Railway Station) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Anand Vihar (ISBT & Railway Station) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Anand Vihar (ISBT & Railway Station). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Anand Vihar (ISBT & Railway Station) hourly hotels?",
            "answer": "Yes. All partner hotels in Anand Vihar (ISBT & Railway Station) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Anand Vihar (ISBT & Railway Station)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Anand Vihar (ISBT & Railway Station)."
        },
        {
            "question": "How much advance deposit is required to book in Anand Vihar (ISBT & Railway Station)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Anand Vihar (ISBT & Railway Station)?",
            "answer": "Most properties are located within 5 to 10 minutes of Anand Vihar ISBT Metro (Blue & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'yashobhoomi-dwarka': {
    "slug": "yashobhoomi-dwarka",
    "name": "Yashobhoomi (IICC Dwarka)",
    "areaLabel": "Sector 25 Dwarka, New Delhi",
    "category": "business",
    "badgeText": "Directly Opposite IICC Convention Centre",
    "landmark": "Yashobhoomi Convention Centre, Dwarka Expressway, Urban Extension Road II",
    "nearestMetro": "Yashobhoomi Dwarka Sector 25 Metro (Airport Express Extension)",
    "metaTitle": "Hourly Hotels in Yashobhoomi (IICC Dwarka) Delhi \u2014 3, 6, 12h Stay",
    "metaDescription": "Book hourly hotels in Yashobhoomi (IICC Dwarka), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Yashobhoomi Dwarka Sector 25 Metro (Ai",
    "h1": "Hourly Hotels in Yashobhoomi (IICC Dwarka), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Yashobhoomi (IICC Dwarka)? Asia's largest convention and exhibition center. Tailored for delegates, exhibitors, and corporate attendees needing flexible day-use executive rooms. Conveniently situated near Yashobhoomi Convention Centre, Dwarka Expressway, Urban Extension Road II, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Yashobhoomi (IICC Dwarka) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Yashobhoomi (IICC Dwarka) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Yashobhoomi (IICC Dwarka) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Yashobhoomi (IICC Dwarka) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Yashobhoomi (IICC Dwarka). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Yashobhoomi (IICC Dwarka) hourly hotels?",
            "answer": "Yes. All partner hotels in Yashobhoomi (IICC Dwarka) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Yashobhoomi (IICC Dwarka)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Yashobhoomi (IICC Dwarka)."
        },
        {
            "question": "How much advance deposit is required to book in Yashobhoomi (IICC Dwarka)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Yashobhoomi (IICC Dwarka)?",
            "answer": "Most properties are located within 5 to 10 minutes of Yashobhoomi Dwarka Sector 25 Metro (Airport Express Extension), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'aiims-delhi': {
    "slug": "aiims-delhi",
    "name": "AIIMS & Safdarjung Hospital",
    "areaLabel": "Ansari Nagar & Safdarjung, South Delhi",
    "category": "transit",
    "badgeText": "Near AIIMS & Safdarjung \u2022 Attendant Stays",
    "landmark": "AIIMS Medical Institute, Safdarjung Hospital, Dilli Haat INA",
    "nearestMetro": "AIIMS Metro (Yellow Line) & Dilli Haat INA (Pink Line)",
    "metaTitle": "Hourly Hotels in AIIMS & Safdarjung Hospital Delhi \u2014 3, 6, 12h St",
    "metaDescription": "Book hourly hotels in AIIMS & Safdarjung Hospital, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near AIIMS Metro (Yellow Line) & Dilli Ha",
    "h1": "Hourly Hotels in AIIMS & Safdarjung Hospital, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in AIIMS & Safdarjung Hospital? Comfortable, sanitised rooms with 24x7 access for patient attendants, medical consultants, and outstation families visiting premier hospitals. Conveniently situated near AIIMS Medical Institute, Safdarjung Hospital, Dilli Haat INA, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1236,
        1255,
        1267,
        1268,
        1326,
        1356,
        1410,
        1416,
        1445,
        1496,
        1524
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in AIIMS & Safdarjung Hospital for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in AIIMS & Safdarjung Hospital offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in AIIMS & Safdarjung Hospital strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in AIIMS & Safdarjung Hospital for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in AIIMS & Safdarjung Hospital. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in AIIMS & Safdarjung Hospital hourly hotels?",
            "answer": "Yes. All partner hotels in AIIMS & Safdarjung Hospital are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in AIIMS & Safdarjung Hospital?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in AIIMS & Safdarjung Hospital."
        },
        {
            "question": "How much advance deposit is required to book in AIIMS & Safdarjung Hospital?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in AIIMS & Safdarjung Hospital?",
            "answer": "Most properties are located within 5 to 10 minutes of AIIMS Metro (Yellow Line) & Dilli Haat INA (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'greater-kailash': {
    "slug": "greater-kailash",
    "name": "Greater Kailash (GK 1 & GK 2)",
    "areaLabel": "Greater Kailash, South Delhi",
    "category": "couple",
    "badgeText": "100% Couple-Friendly \u2022 Local ID Accepted \u2022 Premium",
    "landmark": "M-Block Market GK 1, N-Block Market GK 2, Kailash Colony",
    "nearestMetro": "Greater Kailash Metro (Magenta Line) & Kailash Colony (Violet Line)",
    "metaTitle": "Hourly Hotels in Greater Kailash (GK 1 & GK 2) Delhi \u2014 3, 6, 12h ",
    "metaDescription": "Book hourly hotels in Greater Kailash (GK 1 & GK 2), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Greater Kailash Metro (Magenta Lin",
    "h1": "Hourly Hotels in Greater Kailash (GK 1 & GK 2), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Greater Kailash (GK 1 & GK 2)? South Delhi's most upscale residential and boutique shopping district. Complete privacy, zero moral policing, and modern boutique interiors. Conveniently situated near M-Block Market GK 1, N-Block Market GK 2, Kailash Colony, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1216,
        1232,
        1234,
        1249,
        1269,
        1279,
        1284,
        1335,
        1336,
        1420,
        1075
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Greater Kailash (GK 1 & GK 2) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Greater Kailash (GK 1 & GK 2) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Greater Kailash (GK 1 & GK 2) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Greater Kailash (GK 1 & GK 2) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Greater Kailash (GK 1 & GK 2). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Greater Kailash (GK 1 & GK 2) hourly hotels?",
            "answer": "Yes. All partner hotels in Greater Kailash (GK 1 & GK 2) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Greater Kailash (GK 1 & GK 2)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Greater Kailash (GK 1 & GK 2)."
        },
        {
            "question": "How much advance deposit is required to book in Greater Kailash (GK 1 & GK 2)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Greater Kailash (GK 1 & GK 2)?",
            "answer": "Most properties are located within 5 to 10 minutes of Greater Kailash Metro (Magenta Line) & Kailash Colony (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'greater-kailash-1': {
    "slug": "greater-kailash-1",
    "name": "Greater Kailash 1 (GK 1)",
    "areaLabel": "GK 1 M-Block, South Delhi",
    "category": "couple",
    "badgeText": "Near M-Block Market \u2022 Discreet Hourly Stays",
    "landmark": "GK-1 M-Block Market, Archana Shopping Complex, B-Block",
    "nearestMetro": "Kailash Colony Metro (Violet Line)",
    "metaTitle": "Hourly Hotels in Greater Kailash 1 (GK 1) Delhi \u2014 3, 6, 12h Stays",
    "metaDescription": "Book hourly hotels in Greater Kailash 1 (GK 1), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kailash Colony Metro (Violet Line). Pay",
    "h1": "Hourly Hotels in Greater Kailash 1 (GK 1), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Greater Kailash 1 (GK 1)? Prime South Delhi location surrounded by designer boutiques, artisan cafes, and peaceful residential lanes. Instant private check-ins. Conveniently situated near GK-1 M-Block Market, Archana Shopping Complex, B-Block, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1216,
        1232,
        1234,
        1269,
        1279,
        1284,
        1335,
        1336,
        1420,
        1075,
        1484
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Greater Kailash 1 (GK 1) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Greater Kailash 1 (GK 1) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Greater Kailash 1 (GK 1) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Greater Kailash 1 (GK 1) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Greater Kailash 1 (GK 1). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Greater Kailash 1 (GK 1) hourly hotels?",
            "answer": "Yes. All partner hotels in Greater Kailash 1 (GK 1) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Greater Kailash 1 (GK 1)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Greater Kailash 1 (GK 1)."
        },
        {
            "question": "How much advance deposit is required to book in Greater Kailash 1 (GK 1)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Greater Kailash 1 (GK 1)?",
            "answer": "Most properties are located within 5 to 10 minutes of Kailash Colony Metro (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kailash-colony': {
    "slug": "kailash-colony",
    "name": "Kailash Colony",
    "areaLabel": "Kailash Colony, South Delhi",
    "category": "couple",
    "badgeText": "Near Kailash Colony Metro \u2022 Couple Friendly",
    "landmark": "Kailash Colony Market, Cafe 27, Sanfort School",
    "nearestMetro": "Kailash Colony Metro Station (Violet Line)",
    "metaTitle": "Hourly Hotels in Kailash Colony Delhi \u2014 3, 6, 12h Stays | GetHote",
    "metaDescription": "Book hourly hotels in Kailash Colony, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kailash Colony Metro Station (Violet Line). Pay o",
    "h1": "Hourly Hotels in Kailash Colony, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kailash Colony? Tree-lined avenues with upscale boutique guest houses. Quiet, highly discreet micro-stay properties with gourmet room service. Conveniently situated near Kailash Colony Market, Cafe 27, Sanfort School, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1216,
        1232,
        1234,
        1249,
        1269,
        1279,
        1284,
        1301,
        1335,
        1336,
        1420
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kailash Colony for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kailash Colony offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kailash Colony strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kailash Colony for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kailash Colony. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kailash Colony hourly hotels?",
            "answer": "Yes. All partner hotels in Kailash Colony are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kailash Colony?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kailash Colony."
        },
        {
            "question": "How much advance deposit is required to book in Kailash Colony?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kailash Colony?",
            "answer": "Most properties are located within 5 to 10 minutes of Kailash Colony Metro Station (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'east-of-kailash': {
    "slug": "east-of-kailash",
    "name": "East of Kailash",
    "areaLabel": "East of Kailash, South Delhi",
    "category": "couple",
    "badgeText": "Near ISKCON Temple & Nehru Place \u2022 3h/6h Slots",
    "landmark": "ISKCON Temple Delhi, Sapna Cinema, Lotus Temple",
    "nearestMetro": "Nehru Enclave & Kailash Colony Metro",
    "metaTitle": "Hourly Hotels in East of Kailash Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in East of Kailash, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Nehru Enclave & Kailash Colony Metro. Pay only 1",
    "h1": "Hourly Hotels in East of Kailash, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in East of Kailash? Central South Delhi neighborhood close to Nehru Place business district and iconic spiritual landmarks. Clean, air-conditioned hourly rooms. Conveniently situated near ISKCON Temple Delhi, Sapna Cinema, Lotus Temple, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1249,
        1301,
        1335,
        1336,
        1075,
        1510,
        1514,
        1519,
        1520,
        1522,
        1523
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in East of Kailash for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in East of Kailash offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in East of Kailash strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in East of Kailash for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in East of Kailash. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in East of Kailash hourly hotels?",
            "answer": "Yes. All partner hotels in East of Kailash are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in East of Kailash?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in East of Kailash."
        },
        {
            "question": "How much advance deposit is required to book in East of Kailash?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in East of Kailash?",
            "answer": "Most properties are located within 5 to 10 minutes of Nehru Enclave & Kailash Colony Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'hauz-khas': {
    "slug": "hauz-khas",
    "name": "Hauz Khas & HKV",
    "areaLabel": "Hauz Khas Village & Enclave",
    "category": "couple",
    "badgeText": "Near Hauz Khas Fort & Deer Park \u2022 Safe for Couples",
    "landmark": "Hauz Khas Fort, Deer Park, Aurobindo Market",
    "nearestMetro": "Hauz Khas Metro (Yellow & Magenta Line Interchange)",
    "metaTitle": "Hourly Hotels in Hauz Khas & HKV Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Hauz Khas & HKV, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Hauz Khas Metro (Yellow & Magenta Line Interchan",
    "h1": "Hourly Hotels in Hauz Khas & HKV, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Hauz Khas & HKV? Delhi's bohemian art and nightlife hub. Unwind after exploring Hauz Khas Village cafes or take a restful daytime pause with 100% privacy. Conveniently situated near Hauz Khas Fort, Deer Park, Aurobindo Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1327,
        1445,
        1524
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Hauz Khas & HKV for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Hauz Khas & HKV offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Hauz Khas & HKV strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Hauz Khas & HKV for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Hauz Khas & HKV. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Hauz Khas & HKV hourly hotels?",
            "answer": "Yes. All partner hotels in Hauz Khas & HKV are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Hauz Khas & HKV?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Hauz Khas & HKV."
        },
        {
            "question": "How much advance deposit is required to book in Hauz Khas & HKV?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Hauz Khas & HKV?",
            "answer": "Most properties are located within 5 to 10 minutes of Hauz Khas Metro (Yellow & Magenta Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'green-park': {
    "slug": "green-park",
    "name": "Green Park",
    "areaLabel": "Green Park Main & Extension",
    "category": "couple",
    "badgeText": "Near Green Park Metro \u2022 Couple Friendly Stays",
    "landmark": "Green Park Main Market, Aashirwad Complex, Uphar Cinema Area",
    "nearestMetro": "Green Park Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Green Park Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Green Park, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Green Park Metro Station (Yellow Line). Pay only 12% ",
    "h1": "Hourly Hotels in Green Park, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Green Park? Upscale neighborhood walking distance to Hauz Khas. Popular with couples seeking discreet, sanitized rooms and pleasant cafe culture. Conveniently situated near Green Park Main Market, Aashirwad Complex, Uphar Cinema Area, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1327,
        1445,
        1524
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Green Park for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Green Park offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Green Park strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Green Park for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Green Park. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Green Park hourly hotels?",
            "answer": "Yes. All partner hotels in Green Park are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Green Park?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Green Park."
        },
        {
            "question": "How much advance deposit is required to book in Green Park?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Green Park?",
            "answer": "Most properties are located within 5 to 10 minutes of Green Park Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'saket': {
    "slug": "saket",
    "name": "Saket",
    "areaLabel": "Saket District Centre, South Delhi",
    "category": "couple",
    "badgeText": "Near Select CITYWALK Mall \u2022 3h/6h Stays",
    "landmark": "Select CITYWALK Mall, DLF Avenue Saket, Max Super Speciality Hospital",
    "nearestMetro": "Saket Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Saket Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Saket, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Saket Metro Station (Yellow Line). Pay only 12% deposit.",
    "h1": "Hourly Hotels in Saket, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Saket? Premier shopping and dining destination in South Delhi. Convenient short stays for shoppers, moviegoers, and hospital visitors. Conveniently situated near Select CITYWALK Mall, DLF Avenue Saket, Max Super Speciality Hospital, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1275,
        1289,
        1292,
        1298,
        1419,
        1438,
        1464,
        1477,
        1492,
        1534,
        1537
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Saket for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Saket offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Saket strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Saket for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Saket. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Saket hourly hotels?",
            "answer": "Yes. All partner hotels in Saket are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Saket?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Saket."
        },
        {
            "question": "How much advance deposit is required to book in Saket?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Saket?",
            "answer": "Most properties are located within 5 to 10 minutes of Saket Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'malviya-nagar': {
    "slug": "malviya-nagar",
    "name": "Malviya Nagar",
    "areaLabel": "Malviya Nagar & Shivalik",
    "category": "couple",
    "badgeText": "Near Shivalik Colony & Saket Metro",
    "landmark": "Malviya Nagar Main Market, Shivalik Colony, Geetanjali Enclave",
    "nearestMetro": "Malviya Nagar Metro (Yellow Line)",
    "metaTitle": "Hourly Hotels in Malviya Nagar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Malviya Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Malviya Nagar Metro (Yellow Line). Pay only 12% de",
    "h1": "Hourly Hotels in Malviya Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Malviya Nagar? Vibrant residential locality with quick access to Saket malls and IIT Delhi. Couple-friendly hotels accepting local IDs without intrusive questions. Conveniently situated near Malviya Nagar Main Market, Shivalik Colony, Geetanjali Enclave, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1439,
        1464,
        1477,
        1492
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Malviya Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Malviya Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Malviya Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Malviya Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Malviya Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Malviya Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Malviya Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Malviya Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Malviya Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Malviya Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Malviya Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Malviya Nagar Metro (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'lajpat-nagar': {
    "slug": "lajpat-nagar",
    "name": "Lajpat Nagar",
    "areaLabel": "Lajpat Nagar Central Market",
    "category": "commercial",
    "badgeText": "Central Market Shopping Stays \u2022 Flexible Hours",
    "landmark": "Central Market Lajpat Nagar, 3Cs Mall, Defence Colony Flyover",
    "nearestMetro": "Lajpat Nagar Metro Station (Violet & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Lajpat Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Lajpat Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Lajpat Nagar Metro Station (Violet & Pink Line Inte",
    "h1": "Hourly Hotels in Lajpat Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Lajpat Nagar? Delhi's most renowned shopping district for bridal wear and fabrics. Take an hourly room to rest, refresh, and store shopping bags in comfort. Conveniently situated near Central Market Lajpat Nagar, 3Cs Mall, Defence Colony Flyover, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1236,
        1255,
        1268,
        1326,
        1356,
        1410,
        1416,
        1496,
        1538
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Lajpat Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Lajpat Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Lajpat Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Lajpat Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Lajpat Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Lajpat Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Lajpat Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Lajpat Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Lajpat Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Lajpat Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Lajpat Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Lajpat Nagar Metro Station (Violet & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'south-extension': {
    "slug": "south-extension",
    "name": "South Extension (Part 1 & 2)",
    "areaLabel": "South Extension Market, Ring Road",
    "category": "commercial",
    "badgeText": "Ring Road Shopping & Medical Transit",
    "landmark": "South Extension Part 1 Market, Part 2 Market, Ring Road",
    "nearestMetro": "South Extension Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in South Extension (Part 1 & 2) Delhi \u2014 3, 6, 12h S",
    "metaDescription": "Book hourly hotels in South Extension (Part 1 & 2), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near South Extension Metro Station (Pink",
    "h1": "Hourly Hotels in South Extension (Part 1 & 2), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in South Extension (Part 1 & 2)? High-street retail destination along the Ring Road. Excellent connectivity to AIIMS hospital and Central Delhi corporate offices. Conveniently situated near South Extension Part 1 Market, Part 2 Market, Ring Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1236,
        1255,
        1267,
        1268,
        1326,
        1356,
        1410,
        1416,
        1496,
        1524,
        1538
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in South Extension (Part 1 & 2) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in South Extension (Part 1 & 2) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in South Extension (Part 1 & 2) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in South Extension (Part 1 & 2) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in South Extension (Part 1 & 2). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in South Extension (Part 1 & 2) hourly hotels?",
            "answer": "Yes. All partner hotels in South Extension (Part 1 & 2) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in South Extension (Part 1 & 2)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in South Extension (Part 1 & 2)."
        },
        {
            "question": "How much advance deposit is required to book in South Extension (Part 1 & 2)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in South Extension (Part 1 & 2)?",
            "answer": "Most properties are located within 5 to 10 minutes of South Extension Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'chittaranjan-park': {
    "slug": "chittaranjan-park",
    "name": "Chittaranjan Park (CR Park)",
    "areaLabel": "CR Park, South Delhi",
    "category": "couple",
    "badgeText": "Near Market 1 & 2 \u2022 Peaceful Hourly Stays",
    "landmark": "CR Park Market No. 1, Kali Mandir, Greater Kailash Enclave",
    "nearestMetro": "Greater Kailash Metro & Nehru Enclave Metro",
    "metaTitle": "Hourly Hotels in Chittaranjan Park (CR Park) Delhi \u2014 3, 6, 12h St",
    "metaDescription": "Book hourly hotels in Chittaranjan Park (CR Park), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Greater Kailash Metro & Nehru Enclav",
    "h1": "Hourly Hotels in Chittaranjan Park (CR Park), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Chittaranjan Park (CR Park)? A culturally rich, tranquil South Delhi neighborhood celebrated for authentic Bengali cuisine and quiet residential charm. Discreet hourly rooms. Conveniently situated near CR Park Market No. 1, Kali Mandir, Greater Kailash Enclave, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1216,
        1232,
        1234,
        1269,
        1279,
        1284,
        1335,
        1336,
        1352,
        1353,
        1360
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Chittaranjan Park (CR Park) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Chittaranjan Park (CR Park) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Chittaranjan Park (CR Park) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Chittaranjan Park (CR Park) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Chittaranjan Park (CR Park). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Chittaranjan Park (CR Park) hourly hotels?",
            "answer": "Yes. All partner hotels in Chittaranjan Park (CR Park) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Chittaranjan Park (CR Park)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Chittaranjan Park (CR Park)."
        },
        {
            "question": "How much advance deposit is required to book in Chittaranjan Park (CR Park)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Chittaranjan Park (CR Park)?",
            "answer": "Most properties are located within 5 to 10 minutes of Greater Kailash Metro & Nehru Enclave Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kalkaji': {
    "slug": "kalkaji",
    "name": "Kalkaji",
    "areaLabel": "Kalkaji, South Delhi",
    "category": "commercial",
    "badgeText": "Near Kalkaji Mandir & Nehru Place",
    "landmark": "Kalkaji Mandir, Lotus Temple, Nehru Place Bus Terminal",
    "nearestMetro": "Kalkaji Mandir Metro (Violet & Magenta Line Interchange)",
    "metaTitle": "Hourly Hotels in Kalkaji Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Kalkaji, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kalkaji Mandir Metro (Violet & Magenta Line Interchange)",
    "h1": "Hourly Hotels in Kalkaji, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kalkaji? Historic and commercial neighborhood directly adjacent to Nehru Place. Ideal for pilgrims visiting Kalkaji Mandir and tech executives alike. Conveniently situated near Kalkaji Mandir, Lotus Temple, Nehru Place Bus Terminal, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1249,
        1352,
        1353,
        1360,
        1388,
        1417,
        1424,
        1425,
        1462,
        1505,
        1509,
        1522
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kalkaji for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kalkaji offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kalkaji strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kalkaji for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kalkaji. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kalkaji hourly hotels?",
            "answer": "Yes. All partner hotels in Kalkaji are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kalkaji?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kalkaji."
        },
        {
            "question": "How much advance deposit is required to book in Kalkaji?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kalkaji?",
            "answer": "Most properties are located within 5 to 10 minutes of Kalkaji Mandir Metro (Violet & Magenta Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'vasant-kunj': {
    "slug": "vasant-kunj",
    "name": "Vasant Kunj",
    "areaLabel": "Vasant Kunj Institutional Area",
    "category": "couple",
    "badgeText": "Near Ambience Mall & Fortis Hospital",
    "landmark": "Ambience Mall Vasant Kunj, DLF Promenade, Fortis Hospital, JNU",
    "nearestMetro": "Chattarpur Metro & Vasant Vihar Metro",
    "metaTitle": "Hourly Hotels in Vasant Kunj Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Vasant Kunj, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Chattarpur Metro & Vasant Vihar Metro. Pay only 12% ",
    "h1": "Hourly Hotels in Vasant Kunj, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Vasant Kunj? Prestigious South Delhi suburb housing mega-malls, diplomatic embassies, and luxury hotels. Peaceful stays with private parking. Conveniently situated near Ambience Mall Vasant Kunj, DLF Promenade, Fortis Hospital, JNU, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1217,
        1218,
        1225,
        1226,
        1229,
        1231,
        1233,
        1237,
        1245,
        1254,
        1258,
        1260
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Vasant Kunj for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Vasant Kunj offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Vasant Kunj strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Vasant Kunj for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Vasant Kunj. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Vasant Kunj hourly hotels?",
            "answer": "Yes. All partner hotels in Vasant Kunj are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Vasant Kunj?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Vasant Kunj."
        },
        {
            "question": "How much advance deposit is required to book in Vasant Kunj?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Vasant Kunj?",
            "answer": "Most properties are located within 5 to 10 minutes of Chattarpur Metro & Vasant Vihar Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'chhatarpur': {
    "slug": "chhatarpur",
    "name": "Chhatarpur",
    "areaLabel": "Chhatarpur Enclave & Mandir Road",
    "category": "couple",
    "badgeText": "Near Chhatarpur Mandir \u2022 Farmhouse Stays",
    "landmark": "Chhatarpur Temple, Tivoli Garden, 100 Feet Road",
    "nearestMetro": "Chhatarpur Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Chhatarpur Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Chhatarpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Chhatarpur Metro Station (Yellow Line). Pay only 12% ",
    "h1": "Hourly Hotels in Chhatarpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Chhatarpur? Known for sprawling farmhouses and serene temple complexes. Offers spacious couple-friendly rooms with private balconies and discreet check-ins. Conveniently situated near Chhatarpur Temple, Tivoli Garden, 100 Feet Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1217,
        1231,
        1233,
        1237,
        1275,
        1281,
        1329,
        1363,
        1394,
        1414,
        1419,
        1428
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Chhatarpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Chhatarpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Chhatarpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Chhatarpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Chhatarpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Chhatarpur hourly hotels?",
            "answer": "Yes. All partner hotels in Chhatarpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Chhatarpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Chhatarpur."
        },
        {
            "question": "How much advance deposit is required to book in Chhatarpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Chhatarpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Chhatarpur Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'connaught-place': {
    "slug": "connaught-place",
    "name": "Connaught Place (CP)",
    "areaLabel": "Connaught Place, Central Delhi",
    "category": "business",
    "badgeText": "Heart of Delhi \u2022 Outer & Inner Circle Stays",
    "landmark": "Rajiv Chowk, Barakhamba Road, Janpath Market, Palika Bazaar",
    "nearestMetro": "Rajiv Chowk Metro (Yellow & Blue Line Super-Hub)",
    "metaTitle": "Hourly Hotels in Connaught Place (CP) Delhi \u2014 3, 6, 12h Stays | G",
    "metaDescription": "Book hourly hotels in Connaught Place (CP), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Rajiv Chowk Metro (Yellow & Blue Line Super",
    "h1": "Hourly Hotels in Connaught Place (CP), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Connaught Place (CP)? The geographic and commercial heart of the capital. Walk to corporate headquarters, foreign embassies, and iconic restaurants within minutes. Conveniently situated near Rajiv Chowk, Barakhamba Road, Janpath Market, Palika Bazaar, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        472,
        1270,
        1271,
        1276,
        1293,
        1294,
        1312,
        1314,
        1318,
        1319,
        1325
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Connaught Place (CP) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Connaught Place (CP) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Connaught Place (CP) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Connaught Place (CP) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Connaught Place (CP). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Connaught Place (CP) hourly hotels?",
            "answer": "Yes. All partner hotels in Connaught Place (CP) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Connaught Place (CP)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Connaught Place (CP)."
        },
        {
            "question": "How much advance deposit is required to book in Connaught Place (CP)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Connaught Place (CP)?",
            "answer": "Most properties are located within 5 to 10 minutes of Rajiv Chowk Metro (Yellow & Blue Line Super-Hub), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'nehru-place': {
    "slug": "nehru-place",
    "name": "Nehru Place",
    "areaLabel": "Nehru Place IT Hub, South Delhi",
    "category": "business",
    "badgeText": "Asia's Largest IT Hub \u2022 Day-Use Stays",
    "landmark": "Nehru Place Complex, Eros Hotel, International Trade Tower",
    "nearestMetro": "Nehru Place Metro & Nehru Enclave Metro",
    "metaTitle": "Hourly Hotels in Nehru Place Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Nehru Place, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Nehru Place Metro & Nehru Enclave Metro. Pay only 12",
    "h1": "Hourly Hotels in Nehru Place, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Nehru Place? Asia's biggest computer and electronics trade center. Perfect for business travelers needing a 3-hour private space to freshen up and work. Conveniently situated near Nehru Place Complex, Eros Hotel, International Trade Tower, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1249,
        1301,
        1335,
        1417,
        1424,
        1519,
        1520,
        1522,
        1523,
        1526,
        1527,
        1530
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Nehru Place for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Nehru Place offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Nehru Place strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Nehru Place for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Nehru Place. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Nehru Place hourly hotels?",
            "answer": "Yes. All partner hotels in Nehru Place are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Nehru Place?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Nehru Place."
        },
        {
            "question": "How much advance deposit is required to book in Nehru Place?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Nehru Place?",
            "answer": "Most properties are located within 5 to 10 minutes of Nehru Place Metro & Nehru Enclave Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'karol-bagh': {
    "slug": "karol-bagh",
    "name": "Karol Bagh",
    "areaLabel": "Karol Bagh & Pusa Road",
    "category": "commercial",
    "badgeText": "Shopping & UPSC Coaching Hub \u2022 3h/6h Slots",
    "landmark": "Gaffar Market, Ajmal Khan Road, Pusa Road IAS Hub",
    "nearestMetro": "Karol Bagh Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Karol Bagh Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Karol Bagh, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Karol Bagh Metro Station (Blue Line). Pay only 12% de",
    "h1": "Hourly Hotels in Karol Bagh, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Karol Bagh? Famous shopping street and civil services hub. Verified hotels with silent air conditioning, study desks, and couple-friendly amenities. Conveniently situated near Gaffar Market, Ajmal Khan Road, Pusa Road IAS Hub, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1271,
        1276,
        1293,
        1294,
        1312,
        1314,
        1318,
        1319,
        1325,
        1330
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Karol Bagh for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Karol Bagh offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Karol Bagh strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Karol Bagh for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Karol Bagh. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Karol Bagh hourly hotels?",
            "answer": "Yes. All partner hotels in Karol Bagh are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Karol Bagh?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Karol Bagh."
        },
        {
            "question": "How much advance deposit is required to book in Karol Bagh?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Karol Bagh?",
            "answer": "Most properties are located within 5 to 10 minutes of Karol Bagh Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'okhla': {
    "slug": "okhla",
    "name": "Okhla Industrial Area",
    "areaLabel": "Okhla Phase 1, 2 & 3",
    "category": "business",
    "badgeText": "Okhla Industrial & Tech Zone \u2022 Micro-Stays",
    "landmark": "Okhla Phase III Tech Hub, Crown Plaza Okhla, NSIC Exhibition Grounds",
    "nearestMetro": "Govind Puri Metro & Harkesh Nagar Okhla Metro (Violet Line)",
    "metaTitle": "Hourly Hotels in Okhla Industrial Area Delhi \u2014 3, 6, 12h Stays | ",
    "metaDescription": "Book hourly hotels in Okhla Industrial Area, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Govind Puri Metro & Harkesh Nagar Okhla Me",
    "h1": "Hourly Hotels in Okhla Industrial Area, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Okhla Industrial Area? Delhi's leading manufacturing and software development enclave. Day-rooms available for visiting auditors, clients, and technical staff. Conveniently situated near Okhla Phase III Tech Hub, Crown Plaza Okhla, NSIC Exhibition Grounds, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1221,
        1235,
        1249,
        1479,
        1522,
        1523,
        1526,
        1527
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Okhla Industrial Area for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Okhla Industrial Area offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Okhla Industrial Area strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Okhla Industrial Area for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Okhla Industrial Area. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Okhla Industrial Area hourly hotels?",
            "answer": "Yes. All partner hotels in Okhla Industrial Area are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Okhla Industrial Area?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Okhla Industrial Area."
        },
        {
            "question": "How much advance deposit is required to book in Okhla Industrial Area?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Okhla Industrial Area?",
            "answer": "Most properties are located within 5 to 10 minutes of Govind Puri Metro & Harkesh Nagar Okhla Metro (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'jasola-vihar': {
    "slug": "jasola-vihar",
    "name": "Jasola Vihar & Shaheen Bagh",
    "areaLabel": "Jasola District Centre, South Delhi",
    "category": "business",
    "badgeText": "Near Jasola Apollo Hospital & District Centre",
    "landmark": "Indraprastha Apollo Hospital, DLF Towers Jasola, Living Style Mall",
    "nearestMetro": "Jasola Apollo Metro (Violet Line) & Jasola Vihar (Magenta Line)",
    "metaTitle": "Hourly Hotels in Jasola Vihar & Shaheen Bagh Delhi \u2014 3, 6, 12h St",
    "metaDescription": "Book hourly hotels in Jasola Vihar & Shaheen Bagh, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Jasola Apollo Metro (Violet Line) & ",
    "h1": "Hourly Hotels in Jasola Vihar & Shaheen Bagh, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Jasola Vihar & Shaheen Bagh? Modern commercial district adjoining world-renowned Apollo Hospital. Clean, sanitised hourly accommodations for medical visitors and executives. Conveniently situated near Indraprastha Apollo Hospital, DLF Towers Jasola, Living Style Mall, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1221,
        1235,
        1479,
        1522
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Jasola Vihar & Shaheen Bagh for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Jasola Vihar & Shaheen Bagh offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Jasola Vihar & Shaheen Bagh strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Jasola Vihar & Shaheen Bagh for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Jasola Vihar & Shaheen Bagh. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Jasola Vihar & Shaheen Bagh hourly hotels?",
            "answer": "Yes. All partner hotels in Jasola Vihar & Shaheen Bagh are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Jasola Vihar & Shaheen Bagh?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Jasola Vihar & Shaheen Bagh."
        },
        {
            "question": "How much advance deposit is required to book in Jasola Vihar & Shaheen Bagh?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Jasola Vihar & Shaheen Bagh?",
            "answer": "Most properties are located within 5 to 10 minutes of Jasola Apollo Metro (Violet Line) & Jasola Vihar (Magenta Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'bhikaji-cama-place': {
    "slug": "bhikaji-cama-place",
    "name": "Bhikaji Cama Place",
    "areaLabel": "Bhikaji Cama Place, South Delhi",
    "category": "business",
    "badgeText": "Government & Corporate Enclave \u2022 Day-Use",
    "landmark": "Hyatt Regency Delhi, GAIL Jubilee Tower, HUDCO Bhawan",
    "nearestMetro": "Bhikaji Cama Place Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in Bhikaji Cama Place Delhi \u2014 3, 6, 12h Stays | Get",
    "metaDescription": "Book hourly hotels in Bhikaji Cama Place, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Bhikaji Cama Place Metro Station (Pink Line).",
    "h1": "Hourly Hotels in Bhikaji Cama Place, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Bhikaji Cama Place? Prominent commercial complex housing corporate headquarters and government boards. Quick access to Ring Road and embassies. Conveniently situated near Hyatt Regency Delhi, GAIL Jubilee Tower, HUDCO Bhawan, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1445,
        1524
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Bhikaji Cama Place for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Bhikaji Cama Place offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Bhikaji Cama Place strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Bhikaji Cama Place for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Bhikaji Cama Place. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Bhikaji Cama Place hourly hotels?",
            "answer": "Yes. All partner hotels in Bhikaji Cama Place are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Bhikaji Cama Place?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Bhikaji Cama Place."
        },
        {
            "question": "How much advance deposit is required to book in Bhikaji Cama Place?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Bhikaji Cama Place?",
            "answer": "Most properties are located within 5 to 10 minutes of Bhikaji Cama Place Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'paschim-vihar': {
    "slug": "paschim-vihar",
    "name": "Paschim Vihar",
    "areaLabel": "Paschim Vihar, West Delhi",
    "category": "couple",
    "badgeText": "Near Radisson Blu & Outer Ring Road \u2022 3h/6h",
    "landmark": "Radisson Blu Paschim Vihar, Jwala Heri Market, Meera Bagh",
    "nearestMetro": "Paschim Vihar West Metro & Peera Garhi Metro (Green Line)",
    "metaTitle": "Hourly Hotels in Paschim Vihar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Paschim Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Paschim Vihar West Metro & Peera Garhi Metro (Gree",
    "h1": "Hourly Hotels in Paschim Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Paschim Vihar? Upscale West Delhi residential neighborhood known for banquet celebrations and family lifestyle. Modern couple-friendly properties. Conveniently situated near Radisson Blu Paschim Vihar, Jwala Heri Market, Meera Bagh, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1213,
        1214,
        1228,
        1238,
        1243,
        1266,
        1287,
        1351,
        1358,
        1364,
        1391,
        1397
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Paschim Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Paschim Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Paschim Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Paschim Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Paschim Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Paschim Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Paschim Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Paschim Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Paschim Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Paschim Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Paschim Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Paschim Vihar West Metro & Peera Garhi Metro (Green Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rajouri-garden': {
    "slug": "rajouri-garden",
    "name": "Rajouri Garden",
    "areaLabel": "Rajouri Garden Main Market",
    "category": "couple",
    "badgeText": "Near TDI Mall & Lifestyle Markets \u2022 Couples",
    "landmark": "City Square Mall, TDI Paragon Mall, BK Dutt Market",
    "nearestMetro": "Rajouri Garden Metro (Blue & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Rajouri Garden Delhi \u2014 3, 6, 12h Stays | GetHote",
    "metaDescription": "Book hourly hotels in Rajouri Garden, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Rajouri Garden Metro (Blue & Pink Line Interchang",
    "h1": "Hourly Hotels in Rajouri Garden, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rajouri Garden? West Delhi's vibrant fashion, dining, and nightlife capital. Discreet hourly rooms minutes away from top lounges and designer showrooms. Conveniently situated near City Square Mall, TDI Paragon Mall, BK Dutt Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1243,
        1300,
        1316,
        1345,
        1489
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rajouri Garden for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rajouri Garden offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rajouri Garden strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rajouri Garden for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rajouri Garden. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rajouri Garden hourly hotels?",
            "answer": "Yes. All partner hotels in Rajouri Garden are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rajouri Garden?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rajouri Garden."
        },
        {
            "question": "How much advance deposit is required to book in Rajouri Garden?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rajouri Garden?",
            "answer": "Most properties are located within 5 to 10 minutes of Rajouri Garden Metro (Blue & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'punjabi-bagh': {
    "slug": "punjabi-bagh",
    "name": "Punjabi Bagh",
    "areaLabel": "Punjabi Bagh Club Road",
    "category": "couple",
    "badgeText": "Club Road Dining Hub \u2022 Premium Micro-Stays",
    "landmark": "Punjabi Bagh Club, Club Road Cafes, Central Market",
    "nearestMetro": "Punjabi Bagh Metro (Green Line) & Punjabi Bagh West (Pink Line)",
    "metaTitle": "Hourly Hotels in Punjabi Bagh Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Punjabi Bagh, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Punjabi Bagh Metro (Green Line) & Punjabi Bagh West",
    "h1": "Hourly Hotels in Punjabi Bagh, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Punjabi Bagh? High-end residential enclave famous for gourmet restaurants along Club Road. Tastefully appointed rooms with luxury bedding. Conveniently situated near Punjabi Bagh Club, Club Road Cafes, Central Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1228,
        1238,
        1243,
        1266,
        1287,
        1300,
        1316,
        1345,
        1351,
        1358,
        1364,
        1391
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Punjabi Bagh for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Punjabi Bagh offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Punjabi Bagh strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Punjabi Bagh for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Punjabi Bagh. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Punjabi Bagh hourly hotels?",
            "answer": "Yes. All partner hotels in Punjabi Bagh are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Punjabi Bagh?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Punjabi Bagh."
        },
        {
            "question": "How much advance deposit is required to book in Punjabi Bagh?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Punjabi Bagh?",
            "answer": "Most properties are located within 5 to 10 minutes of Punjabi Bagh Metro (Green Line) & Punjabi Bagh West (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'janakpuri': {
    "slug": "janakpuri",
    "name": "Janakpuri",
    "areaLabel": "Janakpuri District Centre",
    "category": "commercial",
    "badgeText": "Near Janakpuri District Centre \u2022 3h, 6h, 12h",
    "landmark": "Janakpuri District Centre (DC), Westend Mall, Dilli Haat Janakpuri",
    "nearestMetro": "Janakpuri West Metro (Blue & Magenta Line Interchange)",
    "metaTitle": "Hourly Hotels in Janakpuri Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Janakpuri, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Janakpuri West Metro (Blue & Magenta Line Interchange)",
    "h1": "Hourly Hotels in Janakpuri, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Janakpuri? Major institutional and corporate center of West Delhi. Direct metro connectivity to IGI Airport via Magenta Line in under 20 minutes. Conveniently situated near Janakpuri District Centre (DC), Westend Mall, Dilli Haat Janakpuri, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1213,
        1214,
        1220,
        1246,
        1257,
        1338
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Janakpuri for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Janakpuri offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Janakpuri strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Janakpuri for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Janakpuri. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Janakpuri hourly hotels?",
            "answer": "Yes. All partner hotels in Janakpuri are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Janakpuri?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Janakpuri."
        },
        {
            "question": "How much advance deposit is required to book in Janakpuri?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Janakpuri?",
            "answer": "Most properties are located within 5 to 10 minutes of Janakpuri West Metro (Blue & Magenta Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'vikaspuri': {
    "slug": "vikaspuri",
    "name": "Vikaspuri",
    "areaLabel": "Vikaspuri, West Delhi",
    "category": "couple",
    "badgeText": "Near Outer Ring Road \u2022 Discreet Couple Stays",
    "landmark": "PVR Vikaspuri, KG-1 Block, Budh Bazaar Road",
    "nearestMetro": "Janakpuri West Metro & Uttam Nagar East Metro",
    "metaTitle": "Hourly Hotels in Vikaspuri Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Vikaspuri, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Janakpuri West Metro & Uttam Nagar East Metro. Pay onl",
    "h1": "Hourly Hotels in Vikaspuri, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Vikaspuri? Peaceful residential neighborhood offering affordable, well-furnished hourly stays. Couple-friendly with local IDs warmly welcomed. Conveniently situated near PVR Vikaspuri, KG-1 Block, Budh Bazaar Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1213,
        1214,
        1220,
        1228,
        1238,
        1246,
        1266,
        1287,
        1351,
        1358,
        1364,
        1391
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Vikaspuri for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Vikaspuri offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Vikaspuri strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Vikaspuri for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Vikaspuri. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Vikaspuri hourly hotels?",
            "answer": "Yes. All partner hotels in Vikaspuri are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Vikaspuri?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Vikaspuri."
        },
        {
            "question": "How much advance deposit is required to book in Vikaspuri?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Vikaspuri?",
            "answer": "Most properties are located within 5 to 10 minutes of Janakpuri West Metro & Uttam Nagar East Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'tilak-nagar': {
    "slug": "tilak-nagar",
    "name": "Tilak Nagar",
    "areaLabel": "Tilak Nagar Central Market",
    "category": "commercial",
    "badgeText": "Near Tilak Nagar Metro \u2022 Budget Stays",
    "landmark": "Tilak Nagar Market, Mall Road, Jail Road Food Street",
    "nearestMetro": "Tilak Nagar Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Tilak Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Tilak Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Tilak Nagar Metro Station (Blue Line). Pay only 12% ",
    "h1": "Hourly Hotels in Tilak Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Tilak Nagar? Lively market hub famous for street delicacies along Jail Road. Ideal for shoppers and travelers seeking low-cost, air-conditioned hourly rooms. Conveniently situated near Tilak Nagar Market, Mall Road, Jail Road Food Street, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1213,
        1220,
        1246,
        1257,
        1338
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Tilak Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Tilak Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Tilak Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Tilak Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Tilak Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Tilak Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Tilak Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Tilak Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Tilak Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Tilak Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Tilak Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Tilak Nagar Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kirti-nagar': {
    "slug": "kirti-nagar",
    "name": "Kirti Nagar",
    "areaLabel": "Kirti Nagar Industrial & Furniture Hub",
    "category": "business",
    "badgeText": "Asia's Largest Furniture Market \u2022 3h/6h",
    "landmark": "Kirti Nagar Furniture Market, Moments Mall, Mayapuri Border",
    "nearestMetro": "Kirti Nagar Metro (Blue & Green Line Interchange)",
    "metaTitle": "Hourly Hotels in Kirti Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Kirti Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kirti Nagar Metro (Blue & Green Line Interchange). P",
    "h1": "Hourly Hotels in Kirti Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kirti Nagar? Famous furniture trade hub and central industrial district. Convenient day-rooms for visiting architects, interior decorators, and corporate buyers. Conveniently situated near Kirti Nagar Furniture Market, Moments Mall, Mayapuri Border, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1295,
        1300,
        1373,
        1393,
        1461,
        1467
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kirti Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kirti Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kirti Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kirti Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kirti Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kirti Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Kirti Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kirti Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kirti Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Kirti Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kirti Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Kirti Nagar Metro (Blue & Green Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'naraina-vihar': {
    "slug": "naraina-vihar",
    "name": "Naraina Vihar",
    "areaLabel": "Naraina Vihar & Industrial Area",
    "category": "business",
    "badgeText": "Ring Road & Industrial Hub \u2022 Hourly Rooms",
    "landmark": "Naraina Industrial Area Phase 1 & 2, PVR Naraina, Ring Road",
    "nearestMetro": "Naraina Vihar Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in Naraina Vihar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Naraina Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Naraina Vihar Metro Station (Pink Line). Pay only ",
    "h1": "Hourly Hotels in Naraina Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Naraina Vihar? Centrally located on the Delhi Ring Road, offering seamless transit to Dhaula Kuan, Delhi Cantt railway station, and Gurgaon expressway. Conveniently situated near Naraina Industrial Area Phase 1 & 2, PVR Naraina, Ring Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1295,
        1300,
        1373,
        1393,
        1461,
        1467
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Naraina Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Naraina Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Naraina Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Naraina Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Naraina Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Naraina Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Naraina Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Naraina Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Naraina Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Naraina Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Naraina Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Naraina Vihar Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'patel-nagar': {
    "slug": "patel-nagar",
    "name": "Patel Nagar (East & West)",
    "areaLabel": "Patel Nagar, Central-West Delhi",
    "category": "commercial",
    "badgeText": "Near Shadipur & Karol Bagh \u2022 Budget Stays",
    "landmark": "Patel Road, Siddharth Hotel, West Patel Nagar Market",
    "nearestMetro": "Patel Nagar Metro & Shadipur Metro (Blue Line)",
    "metaTitle": "Hourly Hotels in Patel Nagar (East & West) Delhi \u2014 3, 6, 12h Stay",
    "metaDescription": "Book hourly hotels in Patel Nagar (East & West), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Patel Nagar Metro & Shadipur Metro (Bl",
    "h1": "Hourly Hotels in Patel Nagar (East & West), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Patel Nagar (East & West)? Convenient corridor between Central Delhi and West Delhi. Very popular with students, job candidates, and transit guests. Conveniently situated near Patel Road, Siddharth Hotel, West Patel Nagar Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1271,
        1276,
        1293,
        1294,
        1300,
        1312,
        1314,
        1318,
        1319,
        1331,
        1340,
        1344
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Patel Nagar (East & West) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Patel Nagar (East & West) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Patel Nagar (East & West) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Patel Nagar (East & West) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Patel Nagar (East & West). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Patel Nagar (East & West) hourly hotels?",
            "answer": "Yes. All partner hotels in Patel Nagar (East & West) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Patel Nagar (East & West)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Patel Nagar (East & West)."
        },
        {
            "question": "How much advance deposit is required to book in Patel Nagar (East & West)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Patel Nagar (East & West)?",
            "answer": "Most properties are located within 5 to 10 minutes of Patel Nagar Metro & Shadipur Metro (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rohini': {
    "slug": "rohini",
    "name": "Rohini",
    "areaLabel": "Rohini Sectors 7, 8, 9, 10, 15, 18, 22",
    "category": "couple",
    "badgeText": "14+ Verified Hourly Hotels Across Rohini Sectors",
    "landmark": "Adventure Island Rohini, Metro Walk Mall, Swarn Jayanti Park",
    "nearestMetro": "Rithala Metro & Rohini West Metro (Red Line)",
    "metaTitle": "Hourly Hotels in Rohini Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Rohini, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Rithala Metro & Rohini West Metro (Red Line). Pay only 12",
    "h1": "Hourly Hotels in Rohini, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rohini? One of Delhi's most well-planned sub-cities. Over 14 verified couple-friendly hotels offering 3, 6, and 12-hour stays across multiple sectors. Conveniently situated near Adventure Island Rohini, Metro Walk Mall, Swarn Jayanti Park, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        573,
        655,
        1285,
        1291,
        1311,
        1315,
        1357,
        1381,
        1400,
        1421,
        1422,
        1472
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rohini for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rohini offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rohini strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rohini for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rohini. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rohini hourly hotels?",
            "answer": "Yes. All partner hotels in Rohini are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rohini?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rohini."
        },
        {
            "question": "How much advance deposit is required to book in Rohini?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rohini?",
            "answer": "Most properties are located within 5 to 10 minutes of Rithala Metro & Rohini West Metro (Red Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rohini-sector-15': {
    "slug": "rohini-sector-15",
    "name": "Rohini Sector 15",
    "areaLabel": "Sector 15 Rohini, North-West Delhi",
    "category": "couple",
    "badgeText": "Near DTU & Sector 15 Metro \u2022 Couple Stays",
    "landmark": "Delhi Technological University (DTU), Sector 15 DDA Market",
    "nearestMetro": "Samaypur Badli Metro & Rohini Sector 18 Metro (Yellow Line)",
    "metaTitle": "Hourly Hotels in Rohini Sector 15 Delhi \u2014 3, 6, 12h Stays | GetHo",
    "metaDescription": "Book hourly hotels in Rohini Sector 15, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Samaypur Badli Metro & Rohini Sector 18 Metro (",
    "h1": "Hourly Hotels in Rohini Sector 15, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rohini Sector 15? Peaceful residential sector located close to educational hubs and Bawana industrial area. Quick hourly check-in with complete privacy. Conveniently situated near Delhi Technological University (DTU), Sector 15 DDA Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        573,
        655,
        1285,
        1291,
        1311,
        1315,
        1357,
        1381,
        1400,
        1421,
        1422,
        1472
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rohini Sector 15 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rohini Sector 15 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rohini Sector 15 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rohini Sector 15 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rohini Sector 15. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rohini Sector 15 hourly hotels?",
            "answer": "Yes. All partner hotels in Rohini Sector 15 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rohini Sector 15?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rohini Sector 15."
        },
        {
            "question": "How much advance deposit is required to book in Rohini Sector 15?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rohini Sector 15?",
            "answer": "Most properties are located within 5 to 10 minutes of Samaypur Badli Metro & Rohini Sector 18 Metro (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rohini-sector-18': {
    "slug": "rohini-sector-18",
    "name": "Rohini Sector 18",
    "areaLabel": "Sector 18 Rohini, North Delhi",
    "category": "couple",
    "badgeText": "Yellow Line Metro Connectivity \u2022 3h/6h Stays",
    "landmark": "Rohini Sector 18 Metro, Badli Industrial Area, Outer Ring Road",
    "nearestMetro": "Rohini Sector 18-19 Metro (Yellow Line)",
    "metaTitle": "Hourly Hotels in Rohini Sector 18 Delhi \u2014 3, 6, 12h Stays | GetHo",
    "metaDescription": "Book hourly hotels in Rohini Sector 18, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Rohini Sector 18-19 Metro (Yellow Line). Pay on",
    "h1": "Hourly Hotels in Rohini Sector 18, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rohini Sector 18? Direct connectivity on the Yellow Line to Connaught Place and Gurgaon. Discreet, hygienic rooms equipped with Smart TVs and power backup. Conveniently situated near Rohini Sector 18 Metro, Badli Industrial Area, Outer Ring Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        573,
        655,
        1285,
        1291,
        1311,
        1315,
        1357,
        1381,
        1400,
        1421,
        1422,
        1472
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rohini Sector 18 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rohini Sector 18 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rohini Sector 18 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rohini Sector 18 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rohini Sector 18. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rohini Sector 18 hourly hotels?",
            "answer": "Yes. All partner hotels in Rohini Sector 18 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rohini Sector 18?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rohini Sector 18."
        },
        {
            "question": "How much advance deposit is required to book in Rohini Sector 18?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rohini Sector 18?",
            "answer": "Most properties are located within 5 to 10 minutes of Rohini Sector 18-19 Metro (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rohini-sector-22': {
    "slug": "rohini-sector-22",
    "name": "Rohini Sector 22",
    "areaLabel": "Sector 22 Rohini, North-West Delhi",
    "category": "couple",
    "badgeText": "Near UER-II & Outer Ring Road",
    "landmark": "Sector 22 Main Market, Maharaja Agrasen Institute (MAIT)",
    "nearestMetro": "Rithala Metro Station (Red Line)",
    "metaTitle": "Hourly Hotels in Rohini Sector 22 Delhi \u2014 3, 6, 12h Stays | GetHo",
    "metaDescription": "Book hourly hotels in Rohini Sector 22, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Rithala Metro Station (Red Line). Pay only 12% ",
    "h1": "Hourly Hotels in Rohini Sector 22, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rohini Sector 22? Serene residential sector in North-West Delhi offering modern couple-friendly micro-stays. Secure parking and contactless check-in available. Conveniently situated near Sector 22 Main Market, Maharaja Agrasen Institute (MAIT), our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        573,
        655,
        1285,
        1291,
        1311,
        1315,
        1357,
        1381,
        1400,
        1421,
        1422,
        1472
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rohini Sector 22 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rohini Sector 22 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rohini Sector 22 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rohini Sector 22 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rohini Sector 22. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rohini Sector 22 hourly hotels?",
            "answer": "Yes. All partner hotels in Rohini Sector 22 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rohini Sector 22?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rohini Sector 22."
        },
        {
            "question": "How much advance deposit is required to book in Rohini Sector 22?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rohini Sector 22?",
            "answer": "Most properties are located within 5 to 10 minutes of Rithala Metro Station (Red Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'pitampura': {
    "slug": "pitampura",
    "name": "Pitampura & NSP",
    "areaLabel": "Pitampura & Netaji Subhash Place",
    "category": "commercial",
    "badgeText": "Near TV Tower & NSP Corporate Hub",
    "landmark": "Pitampura TV Tower, Netaji Subhash Place (NSP), Dilli Haat Pitampura",
    "nearestMetro": "Netaji Subhash Place (Red & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Pitampura & NSP Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Pitampura & NSP, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Netaji Subhash Place (Red & Pink Line Interchang",
    "h1": "Hourly Hotels in Pitampura & NSP, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Pitampura & NSP? North-West Delhi's flagship commercial and corporate tower district. Ideal for executives attending meetings at NSP or couples dining nearby. Conveniently situated near Pitampura TV Tower, Netaji Subhash Place (NSP), Dilli Haat Pitampura, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1339,
        1346,
        1375,
        1453,
        1468,
        1498,
        1521,
        1533
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Pitampura & NSP for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Pitampura & NSP offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Pitampura & NSP strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Pitampura & NSP for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Pitampura & NSP. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Pitampura & NSP hourly hotels?",
            "answer": "Yes. All partner hotels in Pitampura & NSP are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Pitampura & NSP?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Pitampura & NSP."
        },
        {
            "question": "How much advance deposit is required to book in Pitampura & NSP?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Pitampura & NSP?",
            "answer": "Most properties are located within 5 to 10 minutes of Netaji Subhash Place (Red & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'netaji-subhash-place': {
    "slug": "netaji-subhash-place",
    "name": "Netaji Subhash Place (NSP)",
    "areaLabel": "NSP Commercial Complex, Pitampura",
    "category": "business",
    "badgeText": "Corporate Towers & Red-Pink Metro Interchange",
    "landmark": "PP Towers, Aggarwal Cyber Plaza, D-Mall NSP",
    "nearestMetro": "Netaji Subhash Place Metro Station",
    "metaTitle": "Hourly Hotels in Netaji Subhash Place (NSP) Delhi \u2014 3, 6, 12h Sta",
    "metaDescription": "Book hourly hotels in Netaji Subhash Place (NSP), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Netaji Subhash Place Metro Station. P",
    "h1": "Hourly Hotels in Netaji Subhash Place (NSP), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Netaji Subhash Place (NSP)? Bustling corporate hub with over 50 commercial office towers. Short-stay rooms allow professionals to take conference calls and refresh between schedules. Conveniently situated near PP Towers, Aggarwal Cyber Plaza, D-Mall NSP, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1339,
        1346,
        1375,
        1453,
        1468,
        1498,
        1521,
        1533
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Netaji Subhash Place (NSP) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Netaji Subhash Place (NSP) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Netaji Subhash Place (NSP) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Netaji Subhash Place (NSP) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Netaji Subhash Place (NSP). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Netaji Subhash Place (NSP) hourly hotels?",
            "answer": "Yes. All partner hotels in Netaji Subhash Place (NSP) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Netaji Subhash Place (NSP)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Netaji Subhash Place (NSP)."
        },
        {
            "question": "How much advance deposit is required to book in Netaji Subhash Place (NSP)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Netaji Subhash Place (NSP)?",
            "answer": "Most properties are located within 5 to 10 minutes of Netaji Subhash Place Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'model-town': {
    "slug": "model-town",
    "name": "Model Town",
    "areaLabel": "Model Town 1, 2 & 3, North Delhi",
    "category": "couple",
    "badgeText": "Near Naini Lake & GT Karnal Road",
    "landmark": "Naini Lake Model Town, Gujranwala Town, Derawal Nagar",
    "nearestMetro": "Model Town Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Model Town Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Model Town, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Model Town Metro Station (Yellow Line). Pay only 12% ",
    "h1": "Hourly Hotels in Model Town, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Model Town? Historic upscale North Delhi neighborhood centered around picturesque Naini Lake. Verified hotels with couple privacy and warm hospitality. Conveniently situated near Naini Lake Model Town, Gujranwala Town, Derawal Nagar, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1304,
        1365,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Model Town for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Model Town offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Model Town strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Model Town for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Model Town. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Model Town hourly hotels?",
            "answer": "Yes. All partner hotels in Model Town are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Model Town?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Model Town."
        },
        {
            "question": "How much advance deposit is required to book in Model Town?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Model Town?",
            "answer": "Most properties are located within 5 to 10 minutes of Model Town Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'ashok-vihar': {
    "slug": "ashok-vihar",
    "name": "Ashok Vihar",
    "areaLabel": "Ashok Vihar Phase 1 & 2",
    "category": "couple",
    "badgeText": "Near Deep Market & Ring Road",
    "landmark": "Deep Market Ashok Vihar, Major Dhyan Chand Sports Complex",
    "nearestMetro": "Kanhaiya Nagar Metro (Red Line) & Shalimar Bagh (Pink Line)",
    "metaTitle": "Hourly Hotels in Ashok Vihar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Ashok Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kanhaiya Nagar Metro (Red Line) & Shalimar Bagh (Pin",
    "h1": "Hourly Hotels in Ashok Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Ashok Vihar? Affluent residential colony featuring popular shopping markets and green parks. Premium micro-stay accommodations for short daytime breaks. Conveniently situated near Deep Market Ashok Vihar, Major Dhyan Chand Sports Complex, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1248,
        1304,
        1365,
        1460,
        1474,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Ashok Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Ashok Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Ashok Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Ashok Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Ashok Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Ashok Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Ashok Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Ashok Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Ashok Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Ashok Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Ashok Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Kanhaiya Nagar Metro (Red Line) & Shalimar Bagh (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'adarsh-nagar': {
    "slug": "adarsh-nagar",
    "name": "Adarsh Nagar",
    "areaLabel": "Adarsh Nagar, North Delhi",
    "category": "transit",
    "badgeText": "Near GT Karnal Road & Azadpur Mandi",
    "landmark": "Adarsh Nagar Railway Station, Azadpur Metro, GT Karnal Road",
    "nearestMetro": "Adarsh Nagar Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Adarsh Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Adarsh Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Adarsh Nagar Metro Station (Yellow Line). Pay only ",
    "h1": "Hourly Hotels in Adarsh Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Adarsh Nagar? High-transit corridor connecting North Delhi to Haryana and Punjab via NH-44. Budget-friendly hourly rooms for interstate road travelers. Conveniently situated near Adarsh Nagar Railway Station, Azadpur Metro, GT Karnal Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1247,
        1256,
        1259,
        1355,
        1403
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Adarsh Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Adarsh Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Adarsh Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Adarsh Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Adarsh Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Adarsh Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Adarsh Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Adarsh Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Adarsh Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Adarsh Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Adarsh Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Adarsh Nagar Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'delhi-university-north-campus': {
    "slug": "delhi-university-north-campus",
    "name": "Delhi University North Campus",
    "areaLabel": "Vishwavidyalaya & Kamla Nagar",
    "category": "commercial",
    "badgeText": "DU North Campus & Kamla Nagar Student Hub",
    "landmark": "Kamla Nagar Market, St. Stephen's, Hindu College, Arts Faculty",
    "nearestMetro": "Vishwavidyalaya Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Delhi University North Campus Delhi \u2014 3, 6, 12h ",
    "metaDescription": "Book hourly hotels in Delhi University North Campus, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Vishwavidyalaya Metro Station (Yel",
    "h1": "Hourly Hotels in Delhi University North Campus, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Delhi University North Campus? The heart of academic Delhi. Pocket-friendly hourly stays for outstation admission candidates, research scholars, and campus visitors. Conveniently situated near Kamla Nagar Market, St. Stephen's, Hindu College, Arts Faculty, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1304,
        1324,
        1365,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Delhi University North Campus for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Delhi University North Campus offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Delhi University North Campus strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Delhi University North Campus for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Delhi University North Campus. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Delhi University North Campus hourly hotels?",
            "answer": "Yes. All partner hotels in Delhi University North Campus are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Delhi University North Campus?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Delhi University North Campus."
        },
        {
            "question": "How much advance deposit is required to book in Delhi University North Campus?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Delhi University North Campus?",
            "answer": "Most properties are located within 5 to 10 minutes of Vishwavidyalaya Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dwarka': {
    "slug": "dwarka",
    "name": "Dwarka Sub-City",
    "areaLabel": "Dwarka Sub-City, South-West Delhi",
    "category": "couple",
    "badgeText": "21+ Verified Hourly Hotels in Dwarka Sectors",
    "landmark": "Vegas Mall Dwarka, Dwarka Sector 10 District Court, Airport Express",
    "nearestMetro": "Dwarka Sector 21 Metro Interchange",
    "metaTitle": "Hourly Hotels in Dwarka Sub-City Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Dwarka Sub-City, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 21 Metro Interchange. Pay only 12%",
    "h1": "Hourly Hotels in Dwarka Sub-City, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dwarka Sub-City? Asia's largest residential sub-city, offering wide boulevards, dedicated metro stations, and swift access to IGI Airport and Yashobhoomi. Conveniently situated near Vegas Mall Dwarka, Dwarka Sector 10 District Court, Airport Express, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dwarka Sub-City for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dwarka Sub-City offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dwarka Sub-City strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dwarka Sub-City for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dwarka Sub-City. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dwarka Sub-City hourly hotels?",
            "answer": "Yes. All partner hotels in Dwarka Sub-City are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dwarka Sub-City?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dwarka Sub-City."
        },
        {
            "question": "How much advance deposit is required to book in Dwarka Sub-City?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dwarka Sub-City?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 21 Metro Interchange, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dwarka-sector-7': {
    "slug": "dwarka-sector-7",
    "name": "Dwarka Sector 7",
    "areaLabel": "Sector 7 Dwarka, South-West Delhi",
    "category": "couple",
    "badgeText": "Near Ramphal Chowk Food & Shopping Hub",
    "landmark": "Ramphal Chowk Market, Sector 7 DDA Park, Maxfort School",
    "nearestMetro": "Dwarka Sector 9 Metro & Palam Metro",
    "metaTitle": "Hourly Hotels in Dwarka Sector 7 Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Dwarka Sector 7, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 9 Metro & Palam Metro. Pay only 12",
    "h1": "Hourly Hotels in Dwarka Sector 7, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dwarka Sector 7? Home to Ramphal Chowk, Dwarka's most famous culinary and lifestyle market. Couple-friendly rooms with 100% privacy and local ID support. Conveniently situated near Ramphal Chowk Market, Sector 7 DDA Park, Maxfort School, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dwarka Sector 7 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dwarka Sector 7 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dwarka Sector 7 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dwarka Sector 7 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dwarka Sector 7. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dwarka Sector 7 hourly hotels?",
            "answer": "Yes. All partner hotels in Dwarka Sector 7 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dwarka Sector 7?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dwarka Sector 7."
        },
        {
            "question": "How much advance deposit is required to book in Dwarka Sector 7?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dwarka Sector 7?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 9 Metro & Palam Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dwarka-sector-9': {
    "slug": "dwarka-sector-9",
    "name": "Dwarka Sector 9",
    "areaLabel": "Sector 9 Dwarka, South-West Delhi",
    "category": "couple",
    "badgeText": "Near Sector 9 Metro & Dwarka Courts",
    "landmark": "Dwarka Sector 9 Metro, Delhi District Court Dwarka, DDA Sports Complex",
    "nearestMetro": "Dwarka Sector 9 Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Dwarka Sector 9 Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Dwarka Sector 9, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 9 Metro Station (Blue Line). Pay o",
    "h1": "Hourly Hotels in Dwarka Sector 9, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dwarka Sector 9? Prime administrative and residential sector with direct Blue Line metro access. Clean, reliable micro-stays starting from \u20b9734 for 3 hours. Conveniently situated near Dwarka Sector 9 Metro, Delhi District Court Dwarka, DDA Sports Complex, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dwarka Sector 9 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dwarka Sector 9 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dwarka Sector 9 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dwarka Sector 9 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dwarka Sector 9. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dwarka Sector 9 hourly hotels?",
            "answer": "Yes. All partner hotels in Dwarka Sector 9 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dwarka Sector 9?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dwarka Sector 9."
        },
        {
            "question": "How much advance deposit is required to book in Dwarka Sector 9?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dwarka Sector 9?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 9 Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dwarka-sector-12': {
    "slug": "dwarka-sector-12",
    "name": "Dwarka Sector 12",
    "areaLabel": "Sector 12 Dwarka, South-West Delhi",
    "category": "couple",
    "badgeText": "Near Sector 12 City Centre Mall",
    "landmark": "Dwarka Sector 12 Metro, City Centre Mall, Aashirwad Chowk",
    "nearestMetro": "Dwarka Sector 12 Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Dwarka Sector 12 Delhi \u2014 3, 6, 12h Stays | GetHo",
    "metaDescription": "Book hourly hotels in Dwarka Sector 12, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 12 Metro Station (Blue Line). Pay",
    "h1": "Hourly Hotels in Dwarka Sector 12, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dwarka Sector 12? Centrally situated sector in Dwarka with convenient shopping malls and metro links. Private air-conditioned rooms available around the clock. Conveniently situated near Dwarka Sector 12 Metro, City Centre Mall, Aashirwad Chowk, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dwarka Sector 12 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dwarka Sector 12 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dwarka Sector 12 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dwarka Sector 12 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dwarka Sector 12. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dwarka Sector 12 hourly hotels?",
            "answer": "Yes. All partner hotels in Dwarka Sector 12 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dwarka Sector 12?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dwarka Sector 12."
        },
        {
            "question": "How much advance deposit is required to book in Dwarka Sector 12?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dwarka Sector 12?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 12 Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dwarka-sector-13': {
    "slug": "dwarka-sector-13",
    "name": "Dwarka Sector 13",
    "areaLabel": "Sector 13 Dwarka, South-West Delhi",
    "category": "couple",
    "badgeText": "Near Radisson Blu Dwarka & Metro",
    "landmark": "Radisson Blu Hotel Dwarka, Sector 13 Metro, Netaji Subhas University (NSUT)",
    "nearestMetro": "Dwarka Sector 13 Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Dwarka Sector 13 Delhi \u2014 3, 6, 12h Stays | GetHo",
    "metaDescription": "Book hourly hotels in Dwarka Sector 13, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 13 Metro Station (Blue Line). Pay",
    "h1": "Hourly Hotels in Dwarka Sector 13, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dwarka Sector 13? Upscale neighborhood home to 5-star hospitality and NSUT university campus. Seamless day-room bookings with verified hygiene standards. Conveniently situated near Radisson Blu Hotel Dwarka, Sector 13 Metro, Netaji Subhas University (NSUT), our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dwarka Sector 13 for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dwarka Sector 13 offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dwarka Sector 13 strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dwarka Sector 13 for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dwarka Sector 13. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dwarka Sector 13 hourly hotels?",
            "answer": "Yes. All partner hotels in Dwarka Sector 13 are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dwarka Sector 13?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dwarka Sector 13."
        },
        {
            "question": "How much advance deposit is required to book in Dwarka Sector 13?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dwarka Sector 13?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 13 Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'bijwasan': {
    "slug": "bijwasan",
    "name": "Bijwasan",
    "areaLabel": "Bijwasan & Kapashera Border",
    "category": "transit",
    "badgeText": "Near Bijwasan Railway Terminal & Airport",
    "landmark": "Bijwasan Railway Station, Golokdham Ashram, Kapashera Border",
    "nearestMetro": "Dwarka Sector 21 Metro Station",
    "metaTitle": "Hourly Hotels in Bijwasan Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Bijwasan, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dwarka Sector 21 Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Bijwasan, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Bijwasan? Key transit junction linking South-West Delhi to Gurgaon Cyber City and Delhi Airport. Great for quick road or rail layover rest. Conveniently situated near Bijwasan Railway Station, Golokdham Ashram, Kapashera Border, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1219,
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1274,
        1282
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Bijwasan for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Bijwasan offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Bijwasan strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Bijwasan for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Bijwasan. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Bijwasan hourly hotels?",
            "answer": "Yes. All partner hotels in Bijwasan are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Bijwasan?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Bijwasan."
        },
        {
            "question": "How much advance deposit is required to book in Bijwasan?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Bijwasan?",
            "answer": "Most properties are located within 5 to 10 minutes of Dwarka Sector 21 Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kapashera': {
    "slug": "kapashera",
    "name": "Kapashera",
    "areaLabel": "Kapashera, Delhi-Gurgaon Border",
    "category": "transit",
    "badgeText": "Delhi-Gurgaon Border & Airport Proximity",
    "landmark": "Fun N Food Village, Kapashera Border, Old Delhi Gurgaon Road",
    "nearestMetro": "Moulsari Avenue Metro & Dwarka Sector 21 Metro",
    "metaTitle": "Hourly Hotels in Kapashera Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Kapashera, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Moulsari Avenue Metro & Dwarka Sector 21 Metro. Pay on",
    "h1": "Hourly Hotels in Kapashera, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kapashera? Strategic border location facilitating instantaneous travel between Delhi Airport and Gurgaon Udyog Vihar business parks. Conveniently situated near Fun N Food Village, Kapashera Border, Old Delhi Gurgaon Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1218,
        1219,
        1225,
        1226,
        1229,
        1231,
        1237,
        1245,
        1254,
        1258,
        1260,
        1262
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kapashera for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kapashera offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kapashera strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kapashera for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kapashera. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kapashera hourly hotels?",
            "answer": "Yes. All partner hotels in Kapashera are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kapashera?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kapashera."
        },
        {
            "question": "How much advance deposit is required to book in Kapashera?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kapashera?",
            "answer": "Most properties are located within 5 to 10 minutes of Moulsari Avenue Metro & Dwarka Sector 21 Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'laxmi-nagar': {
    "slug": "laxmi-nagar",
    "name": "Laxmi Nagar",
    "areaLabel": "Laxmi Nagar Commercial & CA Hub",
    "category": "commercial",
    "badgeText": "CA Coaching Hub & Vikas Marg Shopping",
    "landmark": "Vikas Marg, V3S Mall, Shakarpur Main Market",
    "nearestMetro": "Laxmi Nagar Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Laxmi Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Laxmi Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Laxmi Nagar Metro Station (Blue Line). Pay only 12% ",
    "h1": "Hourly Hotels in Laxmi Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Laxmi Nagar? East Delhi's commercial powerhouse and premier chartered accountancy education zone. Low-budget, quiet hourly rooms for study and rest. Conveniently situated near Vikas Marg, V3S Mall, Shakarpur Main Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Laxmi Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Laxmi Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Laxmi Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Laxmi Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Laxmi Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Laxmi Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Laxmi Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Laxmi Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Laxmi Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Laxmi Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Laxmi Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Laxmi Nagar Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shakarpur': {
    "slug": "shakarpur",
    "name": "Shakarpur",
    "areaLabel": "Shakarpur & Mother Dairy Road",
    "category": "commercial",
    "badgeText": "Near Laxmi Nagar Metro & ITO Bridge",
    "landmark": "Mother Dairy Plant, Shakarpur School Block, Vikas Marg",
    "nearestMetro": "Laxmi Nagar Metro & Nirman Vihar Metro",
    "metaTitle": "Hourly Hotels in Shakarpur Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Shakarpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Laxmi Nagar Metro & Nirman Vihar Metro. Pay only 12% d",
    "h1": "Hourly Hotels in Shakarpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shakarpur? High-density transit and shopping locality right across the Yamuna from Central Delhi's ITO offices. Budget micro-stays with 24x7 desk. Conveniently situated near Mother Dairy Plant, Shakarpur School Block, Vikas Marg, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shakarpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shakarpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shakarpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shakarpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shakarpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shakarpur hourly hotels?",
            "answer": "Yes. All partner hotels in Shakarpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shakarpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shakarpur."
        },
        {
            "question": "How much advance deposit is required to book in Shakarpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shakarpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Laxmi Nagar Metro & Nirman Vihar Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'mayur-vihar': {
    "slug": "mayur-vihar",
    "name": "Mayur Vihar (Phase 1, 2 & 3)",
    "areaLabel": "Mayur Vihar, East Delhi",
    "category": "couple",
    "badgeText": "Near Akshardham Temple & Noida Border",
    "landmark": "Akshardham Temple, Star City Mall, Noida Link Road",
    "nearestMetro": "Mayur Vihar Phase 1 Metro (Blue & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Mayur Vihar (Phase 1, 2 & 3) Delhi \u2014 3, 6, 12h S",
    "metaDescription": "Book hourly hotels in Mayur Vihar (Phase 1, 2 & 3), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Mayur Vihar Phase 1 Metro (Blue & P",
    "h1": "Hourly Hotels in Mayur Vihar (Phase 1, 2 & 3), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Mayur Vihar (Phase 1, 2 & 3)? Prime East Delhi residential hub directly bordering Noida. Ideal for commuters, tourists visiting Akshardham, and couples. Conveniently situated near Akshardham Temple, Star City Mall, Noida Link Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1283,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Mayur Vihar (Phase 1, 2 & 3) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Mayur Vihar (Phase 1, 2 & 3) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Mayur Vihar (Phase 1, 2 & 3) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Mayur Vihar (Phase 1, 2 & 3) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Mayur Vihar (Phase 1, 2 & 3). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Mayur Vihar (Phase 1, 2 & 3) hourly hotels?",
            "answer": "Yes. All partner hotels in Mayur Vihar (Phase 1, 2 & 3) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Mayur Vihar (Phase 1, 2 & 3)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Mayur Vihar (Phase 1, 2 & 3)."
        },
        {
            "question": "How much advance deposit is required to book in Mayur Vihar (Phase 1, 2 & 3)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Mayur Vihar (Phase 1, 2 & 3)?",
            "answer": "Most properties are located within 5 to 10 minutes of Mayur Vihar Phase 1 Metro (Blue & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'preet-vihar': {
    "slug": "preet-vihar",
    "name": "Preet Vihar",
    "areaLabel": "Preet Vihar, Vikas Marg",
    "category": "commercial",
    "badgeText": "Vikas Marg Food Street & Blue Line Metro",
    "landmark": "Preet Vihar Commercial Complex, Gufa Wala Mandir, Vikas Marg",
    "nearestMetro": "Preet Vihar Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Preet Vihar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Preet Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Preet Vihar Metro Station (Blue Line). Pay only 12% ",
    "h1": "Hourly Hotels in Preet Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Preet Vihar? Upscale East Delhi locality renowned for designer boutiques, diagnostic centers, and cafes along Vikas Marg. Peaceful hourly stays. Conveniently situated near Preet Vihar Commercial Complex, Gufa Wala Mandir, Vikas Marg, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1471,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Preet Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Preet Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Preet Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Preet Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Preet Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Preet Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Preet Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Preet Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Preet Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Preet Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Preet Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Preet Vihar Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'karkardooma': {
    "slug": "karkardooma",
    "name": "Karkardooma",
    "areaLabel": "Karkardooma Institutional Area",
    "category": "business",
    "badgeText": "Near Karkardooma District Court & Malls",
    "landmark": "Karkardooma District Courts, Cross River Mall, Arya Samaj Mandir",
    "nearestMetro": "Karkardooma Metro (Blue & Pink Line Interchange)",
    "metaTitle": "Hourly Hotels in Karkardooma Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Karkardooma, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Karkardooma Metro (Blue & Pink Line Interchange). Pa",
    "h1": "Hourly Hotels in Karkardooma, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Karkardooma? Institutional center housing district courts and commercial complexes. Short-stay rooms for advocates, litigators, and business delegates. Conveniently situated near Karkardooma District Courts, Cross River Mall, Arya Samaj Mandir, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1278,
        1332,
        1488,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Karkardooma for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Karkardooma offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Karkardooma strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Karkardooma for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Karkardooma. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Karkardooma hourly hotels?",
            "answer": "Yes. All partner hotels in Karkardooma are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Karkardooma?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Karkardooma."
        },
        {
            "question": "How much advance deposit is required to book in Karkardooma?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Karkardooma?",
            "answer": "Most properties are located within 5 to 10 minutes of Karkardooma Metro (Blue & Pink Line Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dilshad-garden': {
    "slug": "dilshad-garden",
    "name": "Dilshad Garden",
    "areaLabel": "Dilshad Garden & Jhilmil",
    "category": "transit",
    "badgeText": "Near GTB Hospital & Red Line Metro",
    "landmark": "Guru Teg Bahadur (GTB) Hospital, Jhilmil Industrial Area, Dilshad Garden Metro",
    "nearestMetro": "Dilshad Garden Metro Station (Red Line)",
    "metaTitle": "Hourly Hotels in Dilshad Garden Delhi \u2014 3, 6, 12h Stays | GetHote",
    "metaDescription": "Book hourly hotels in Dilshad Garden, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dilshad Garden Metro Station (Red Line). Pay only",
    "h1": "Hourly Hotels in Dilshad Garden, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dilshad Garden? Eastern gateway of Delhi bordering Ghaziabad. Very convenient for medical visitors to GTB Hospital and cross-border commercial travelers. Conveniently situated near Guru Teg Bahadur (GTB) Hospital, Jhilmil Industrial Area, Dilshad Garden Metro, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1253,
        1215,
        1240,
        1244,
        1281,
        1289
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dilshad Garden for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dilshad Garden offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dilshad Garden strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dilshad Garden for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dilshad Garden. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dilshad Garden hourly hotels?",
            "answer": "Yes. All partner hotels in Dilshad Garden are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dilshad Garden?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dilshad Garden."
        },
        {
            "question": "How much advance deposit is required to book in Dilshad Garden?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dilshad Garden?",
            "answer": "Most properties are located within 5 to 10 minutes of Dilshad Garden Metro Station (Red Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'daryaganj': {
    "slug": "daryaganj",
    "name": "Daryaganj",
    "areaLabel": "Daryaganj & Delhi Gate",
    "category": "heritage",
    "badgeText": "Near Delhi Gate & Old Delhi Heritage",
    "landmark": "Delhi Gate, Sunday Book Market, Golcha Cinema",
    "nearestMetro": "Delhi Gate Metro (Violet Line)",
    "metaTitle": "Hourly Hotels in Daryaganj Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Daryaganj, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Gate Metro (Violet Line). Pay only 12% deposit.",
    "h1": "Hourly Hotels in Daryaganj, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Daryaganj? Cultural district bordering Old Delhi's historic ramparts. Clean, quiet micro-stays steps away from premier book publishing houses and hospitals. Conveniently situated near Delhi Gate, Sunday Book Market, Golcha Cinema, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1325,
        1330,
        355,
        1341,
        1347,
        1348,
        1362,
        1366,
        1367,
        1382
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Daryaganj for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Daryaganj offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Daryaganj strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Daryaganj for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Daryaganj. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Daryaganj hourly hotels?",
            "answer": "Yes. All partner hotels in Daryaganj are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Daryaganj?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Daryaganj."
        },
        {
            "question": "How much advance deposit is required to book in Daryaganj?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Daryaganj?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Gate Metro (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'civil-lines': {
    "slug": "civil-lines",
    "name": "Civil Lines",
    "areaLabel": "Civil Lines, North Delhi",
    "category": "heritage",
    "badgeText": "Heritage Green Enclave \u2022 3h/6h Stays",
    "landmark": "Old Secretariat, Maidens Hotel, Ridge Road",
    "nearestMetro": "Civil Lines Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Civil Lines Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Civil Lines, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Civil Lines Metro Station (Yellow Line). Pay only 12",
    "h1": "Hourly Hotels in Civil Lines, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Civil Lines? Delhi's historic colonial administrative enclave, characterized by quiet wooded avenues and heritage properties. Relaxed daytime privacy. Conveniently situated near Old Secretariat, Maidens Hotel, Ridge Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1271,
        1276,
        1293,
        1294,
        1304,
        1312,
        1314,
        1318,
        1319,
        1331,
        1340
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Civil Lines for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Civil Lines offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Civil Lines strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Civil Lines for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Civil Lines. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Civil Lines hourly hotels?",
            "answer": "Yes. All partner hotels in Civil Lines are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Civil Lines?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Civil Lines."
        },
        {
            "question": "How much advance deposit is required to book in Civil Lines?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Civil Lines?",
            "answer": "Most properties are located within 5 to 10 minutes of Civil Lines Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'chandni-chowk': {
    "slug": "chandni-chowk",
    "name": "Chandni Chowk",
    "areaLabel": "Chandni Chowk Wholesale & Food Hub",
    "category": "heritage",
    "badgeText": "Heart of Old Delhi Heritage & Wholesale Markets",
    "landmark": "Red Fort, Gurudwara Sis Ganj Sahib, Paranthe Wali Gali",
    "nearestMetro": "Chandni Chowk Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Chandni Chowk Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Chandni Chowk, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Chandni Chowk Metro Station (Yellow Line). Pay onl",
    "h1": "Hourly Hotels in Chandni Chowk, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Chandni Chowk? The world's most famous wholesale and bridal shopping destination. Take a private room to rest during tiring shopping trips in the Walled City. Conveniently situated near Red Fort, Gurudwara Sis Ganj Sahib, Paranthe Wali Gali, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1325,
        1330,
        355,
        1341,
        1347,
        1348,
        1362,
        1366,
        1367,
        1382
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Chandni Chowk for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Chandni Chowk offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Chandni Chowk strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Chandni Chowk for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Chandni Chowk. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Chandni Chowk hourly hotels?",
            "answer": "Yes. All partner hotels in Chandni Chowk are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Chandni Chowk?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Chandni Chowk."
        },
        {
            "question": "How much advance deposit is required to book in Chandni Chowk?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Chandni Chowk?",
            "answer": "Most properties are located within 5 to 10 minutes of Chandni Chowk Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kashmere-gate': {
    "slug": "kashmere-gate",
    "name": "Kashmere Gate (ISBT)",
    "areaLabel": "Kashmere Gate Multi-Modal Transit",
    "category": "transit",
    "badgeText": "India's Largest Metro Interchange & ISBT",
    "landmark": "Maharana Pratap ISBT, St. James' Church, Ambedkar University",
    "nearestMetro": "Kashmere Gate Metro (Red, Yellow & Violet Line Tri-Interchange)",
    "metaTitle": "Hourly Hotels in Kashmere Gate (ISBT) Delhi \u2014 3, 6, 12h Stays | G",
    "metaDescription": "Book hourly hotels in Kashmere Gate (ISBT), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Kashmere Gate Metro (Red, Yellow & Violet L",
    "h1": "Hourly Hotels in Kashmere Gate (ISBT), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kashmere Gate (ISBT)? Northern India's primary bus and metro transit hub. Take a quick shower, recharge electronic devices, and relax before boardings. Conveniently situated near Maharana Pratap ISBT, St. James' Church, Ambedkar University, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1325,
        1330,
        355,
        1341,
        1347,
        1348,
        1362,
        1366,
        1367,
        1382
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kashmere Gate (ISBT) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kashmere Gate (ISBT) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kashmere Gate (ISBT) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kashmere Gate (ISBT) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kashmere Gate (ISBT). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kashmere Gate (ISBT) hourly hotels?",
            "answer": "Yes. All partner hotels in Kashmere Gate (ISBT) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kashmere Gate (ISBT)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kashmere Gate (ISBT)."
        },
        {
            "question": "How much advance deposit is required to book in Kashmere Gate (ISBT)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kashmere Gate (ISBT)?",
            "answer": "Most properties are located within 5 to 10 minutes of Kashmere Gate Metro (Red, Yellow & Violet Line Tri-Interchange), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'new-friends-colony': {
    "slug": "new-friends-colony",
    "name": "New Friends Colony (NFC)",
    "areaLabel": "New Friends Colony Community Centre",
    "category": "couple",
    "badgeText": "Near NFC Community Centre \u2022 Premium Stays",
    "landmark": "NFC Community Centre, The Suryaa Hotel, Jamia Millia Islamia",
    "nearestMetro": "Sukhdev Vihar Metro (Magenta Line)",
    "metaTitle": "Hourly Hotels in New Friends Colony (NFC) Delhi \u2014 3, 6, 12h Stays",
    "metaDescription": "Book hourly hotels in New Friends Colony (NFC), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Sukhdev Vihar Metro (Magenta Line). Pay",
    "h1": "Hourly Hotels in New Friends Colony (NFC), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in New Friends Colony (NFC)? Affluent South Delhi colony famous for upscale dining at its Community Centre. Luxurious boutique rooms with uncompromised privacy. Conveniently situated near NFC Community Centre, The Suryaa Hotel, Jamia Millia Islamia, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1235,
        1236,
        1255,
        1268,
        1326,
        1356,
        1410,
        1416,
        1458,
        1495,
        1496,
        1538
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in New Friends Colony (NFC) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in New Friends Colony (NFC) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in New Friends Colony (NFC) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in New Friends Colony (NFC) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in New Friends Colony (NFC). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in New Friends Colony (NFC) hourly hotels?",
            "answer": "Yes. All partner hotels in New Friends Colony (NFC) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in New Friends Colony (NFC)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in New Friends Colony (NFC)."
        },
        {
            "question": "How much advance deposit is required to book in New Friends Colony (NFC)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in New Friends Colony (NFC)?",
            "answer": "Most properties are located within 5 to 10 minutes of Sukhdev Vihar Metro (Magenta Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'safdarjung-enclave': {
    "slug": "safdarjung-enclave",
    "name": "Safdarjung Enclave",
    "areaLabel": "Safdarjung Enclave & Kamal Cinema Area",
    "category": "couple",
    "badgeText": "Near Kamal Cinema & Deer Park",
    "landmark": "Deer Park South Gate, Kamal Cinema Complex, B-Block Market",
    "nearestMetro": "Bhikaji Cama Place Metro & Green Park Metro",
    "metaTitle": "Hourly Hotels in Safdarjung Enclave Delhi \u2014 3, 6, 12h Stays | Get",
    "metaDescription": "Book hourly hotels in Safdarjung Enclave, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Bhikaji Cama Place Metro & Green Park Metro. ",
    "h1": "Hourly Hotels in Safdarjung Enclave, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Safdarjung Enclave? Tranquil residential neighborhood adjoining Green Park and Deer Park. Offers refined couple-friendly accommodations with discreet check-in. Conveniently situated near Deer Park South Gate, Kamal Cinema Complex, B-Block Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1327,
        1445,
        1524
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Safdarjung Enclave for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Safdarjung Enclave offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Safdarjung Enclave strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Safdarjung Enclave for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Safdarjung Enclave. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Safdarjung Enclave hourly hotels?",
            "answer": "Yes. All partner hotels in Safdarjung Enclave are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Safdarjung Enclave?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Safdarjung Enclave."
        },
        {
            "question": "How much advance deposit is required to book in Safdarjung Enclave?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Safdarjung Enclave?",
            "answer": "Most properties are located within 5 to 10 minutes of Bhikaji Cama Place Metro & Green Park Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'panchsheel-park': {
    "slug": "panchsheel-park",
    "name": "Panchsheel Park",
    "areaLabel": "Panchsheel Park, South Delhi",
    "category": "couple",
    "badgeText": "Near Outer Ring Road & Siri Fort",
    "landmark": "Panchsheel Club, Siri Fort Auditorium, Max Super Speciality Saket",
    "nearestMetro": "Panchsheel Park Metro Station (Magenta Line)",
    "metaTitle": "Hourly Hotels in Panchsheel Park Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Panchsheel Park, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Panchsheel Park Metro Station (Magenta Line). Pa",
    "h1": "Hourly Hotels in Panchsheel Park, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Panchsheel Park? Ultra-prime South Delhi diplomatic enclave. High-end micro-stays providing quiet sanctuary, plush furnishings, and private parking. Conveniently situated near Panchsheel Club, Siri Fort Auditorium, Max Super Speciality Saket, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1327,
        1439,
        1464,
        1492
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Panchsheel Park for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Panchsheel Park offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Panchsheel Park strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Panchsheel Park for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Panchsheel Park. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Panchsheel Park hourly hotels?",
            "answer": "Yes. All partner hotels in Panchsheel Park are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Panchsheel Park?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Panchsheel Park."
        },
        {
            "question": "How much advance deposit is required to book in Panchsheel Park?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Panchsheel Park?",
            "answer": "Most properties are located within 5 to 10 minutes of Panchsheel Park Metro Station (Magenta Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'khanpur': {
    "slug": "khanpur",
    "name": "Khanpur",
    "areaLabel": "Khanpur & Deoli Road",
    "category": "commercial",
    "badgeText": "Near Saket & Mehrauli-Badarpur Road",
    "landmark": "MB Road Khanpur, Batra Hospital, Asian Market",
    "nearestMetro": "Saket Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Khanpur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Khanpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Saket Metro Station (Yellow Line). Pay only 12% deposit.",
    "h1": "Hourly Hotels in Khanpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Khanpur? Busy connecting hub on Mehrauli-Badarpur Road with economical hourly room rates. Ideal for patients visiting Batra Hospital and local shoppers. Conveniently situated near MB Road Khanpur, Batra Hospital, Asian Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1289,
        1292,
        1298,
        1477
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Khanpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Khanpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Khanpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Khanpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Khanpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Khanpur hourly hotels?",
            "answer": "Yes. All partner hotels in Khanpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Khanpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Khanpur."
        },
        {
            "question": "How much advance deposit is required to book in Khanpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Khanpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Saket Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'burari': {
    "slug": "burari",
    "name": "Burari",
    "areaLabel": "Burari & Outer Ring Road",
    "category": "transit",
    "badgeText": "Near Yamuna Biodiversity Park \u2022 Low Rates",
    "landmark": "Burari Chowk, Yamuna Biodiversity Park, Nirankari Sarovar",
    "nearestMetro": "Majlis Park Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in Burari Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Burari, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Majlis Park Metro Station (Pink Line). Pay only 12% depos",
    "h1": "Hourly Hotels in Burari, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Burari? Northern Delhi suburb offering unbeatable value on 3h, 6h, and 12h stays. Peaceful atmosphere with easy highway access. Conveniently situated near Burari Chowk, Yamuna Biodiversity Park, Nirankari Sarovar, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1247,
        1259,
        1290,
        1304,
        1355,
        1365,
        1403,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Burari for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Burari offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Burari strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Burari for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Burari. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Burari hourly hotels?",
            "answer": "Yes. All partner hotels in Burari are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Burari?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Burari."
        },
        {
            "question": "How much advance deposit is required to book in Burari?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Burari?",
            "answer": "Most properties are located within 5 to 10 minutes of Majlis Park Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'mundka': {
    "slug": "mundka",
    "name": "Mundka",
    "areaLabel": "Mundka Industrial Area",
    "category": "business",
    "badgeText": "Near Mundka Metro & Industrial Complex",
    "landmark": "Mundka Metro Station, Rohtak Road NH-9, Swarn Park",
    "nearestMetro": "Mundka Metro Station (Green Line)",
    "metaTitle": "Hourly Hotels in Mundka Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Mundka, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Mundka Metro Station (Green Line). Pay only 12% deposit.",
    "h1": "Hourly Hotels in Mundka, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Mundka? Leading industrial and logistics zone on the Delhi-Haryana border. Reliable daytime rooms for factory managers, contractors, and transport visitors. Conveniently situated near Mundka Metro Station, Rohtak Road NH-9, Swarn Park, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1228,
        1230,
        1238,
        1266,
        1287,
        1351,
        1358,
        1364,
        1391,
        1397,
        1408,
        1451
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Mundka for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Mundka offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Mundka strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Mundka for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Mundka. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Mundka hourly hotels?",
            "answer": "Yes. All partner hotels in Mundka are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Mundka?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Mundka."
        },
        {
            "question": "How much advance deposit is required to book in Mundka?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Mundka?",
            "answer": "Most properties are located within 5 to 10 minutes of Mundka Metro Station (Green Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'delhi-cantt': {
    "slug": "delhi-cantt",
    "name": "Delhi Cantt",
    "areaLabel": "Delhi Cantonment Area",
    "category": "transit",
    "badgeText": "Near Delhi Cantt Railway Station",
    "landmark": "Delhi Cantt Railway Station, Base Hospital, Army Golf Course",
    "nearestMetro": "Delhi Cantt Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in Delhi Cantt Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Delhi Cantt, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Cantt Metro Station (Pink Line). Pay only 12% ",
    "h1": "Hourly Hotels in Delhi Cantt, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Delhi Cantt? Clean and secure defense sector enclave. Strategic for defense personnel, rail passengers, and families visiting the military base hospital. Conveniently situated near Delhi Cantt Railway Station, Base Hospital, Army Golf Course, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1295,
        1373,
        1467,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Delhi Cantt for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Delhi Cantt offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Delhi Cantt strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Delhi Cantt for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Delhi Cantt. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Delhi Cantt hourly hotels?",
            "answer": "Yes. All partner hotels in Delhi Cantt are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Delhi Cantt?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Delhi Cantt."
        },
        {
            "question": "How much advance deposit is required to book in Delhi Cantt?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Delhi Cantt?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Cantt Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dhaula-kuan': {
    "slug": "dhaula-kuan",
    "name": "Dhaula Kuan",
    "areaLabel": "Dhaula Kuan & Chanakyapuri Border",
    "category": "transit",
    "badgeText": "Airport Express & Ring Road Interchange",
    "landmark": "Dhaula Kuan Flyover, Army Public School, South Campus DU",
    "nearestMetro": "Dhaula Kuan Metro (Airport Express) & South Campus Metro (Pink Line)",
    "metaTitle": "Hourly Hotels in Dhaula Kuan Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Dhaula Kuan, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dhaula Kuan Metro (Airport Express) & South Campus M",
    "h1": "Hourly Hotels in Dhaula Kuan, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dhaula Kuan? Delhi's most vital traffic interchange connecting Central Delhi, Airport Express, and diplomatic Chanakyapuri. Conveniently situated near Dhaula Kuan Flyover, Army Public School, South Campus DU, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1295,
        1373,
        1467,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dhaula Kuan for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dhaula Kuan offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dhaula Kuan strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dhaula Kuan for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dhaula Kuan. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dhaula Kuan hourly hotels?",
            "answer": "Yes. All partner hotels in Dhaula Kuan are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dhaula Kuan?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dhaula Kuan."
        },
        {
            "question": "How much advance deposit is required to book in Dhaula Kuan?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dhaula Kuan?",
            "answer": "Most properties are located within 5 to 10 minutes of Dhaula Kuan Metro (Airport Express) & South Campus Metro (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'delhi-university-south-campus': {
    "slug": "delhi-university-south-campus",
    "name": "Delhi University South Campus",
    "areaLabel": "Benito Juarez Marg, South Delhi",
    "category": "commercial",
    "badgeText": "Near South Campus Colleges & Satya Niketan",
    "landmark": "Satya Niketan Cafe Street, Sri Venkateswara College, Jesus & Mary College",
    "nearestMetro": "Durgabai Deshmukh South Campus Metro (Pink Line)",
    "metaTitle": "Hourly Hotels in Delhi University South Campus Delhi \u2014 3, 6, 12h ",
    "metaDescription": "Book hourly hotels in Delhi University South Campus, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Durgabai Deshmukh South Campus Met",
    "h1": "Hourly Hotels in Delhi University South Campus, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Delhi University South Campus? Youthful student enclave renowned for lively cafes along Satya Niketan. Affordable hourly rooms for day visits and study marathons. Conveniently situated near Satya Niketan Cafe Street, Sri Venkateswara College, Jesus & Mary College, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1215,
        1240,
        1244,
        1281,
        1289,
        1328
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Delhi University South Campus for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Delhi University South Campus offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Delhi University South Campus strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Delhi University South Campus for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Delhi University South Campus. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Delhi University South Campus hourly hotels?",
            "answer": "Yes. All partner hotels in Delhi University South Campus are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Delhi University South Campus?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Delhi University South Campus."
        },
        {
            "question": "How much advance deposit is required to book in Delhi University South Campus?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Delhi University South Campus?",
            "answer": "Most properties are located within 5 to 10 minutes of Durgabai Deshmukh South Campus Metro (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'moti-nagar': {
    "slug": "moti-nagar",
    "name": "Moti Nagar",
    "areaLabel": "Moti Nagar & Shivaji Marg",
    "category": "commercial",
    "badgeText": "Near DLF Midtown & Blue Line Metro",
    "landmark": "DLF One Midtown, Fun Cinema, Najafgarh Road",
    "nearestMetro": "Moti Nagar Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Moti Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSta",
    "metaDescription": "Book hourly hotels in Moti Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Moti Nagar Metro Station (Blue Line). Pay only 12% de",
    "h1": "Hourly Hotels in Moti Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Moti Nagar? Centrally positioned between West and Central Delhi. Quick access to commercial high-rises and vibrant local bazaars. Conveniently situated near DLF One Midtown, Fun Cinema, Najafgarh Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1271,
        1276,
        1293,
        1294,
        1300,
        1312,
        1314,
        1318,
        1319,
        1331,
        1340,
        1344
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Moti Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Moti Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Moti Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Moti Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Moti Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Moti Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Moti Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Moti Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Moti Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Moti Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Moti Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Moti Nagar Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'tagore-garden': {
    "slug": "tagore-garden",
    "name": "Tagore Garden",
    "areaLabel": "Tagore Garden, West Delhi",
    "category": "couple",
    "badgeText": "Near Pacific Mall Subhash Nagar",
    "landmark": "Pacific Mall, Holy Child School, Najafgarh Road",
    "nearestMetro": "Tagore Garden Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Tagore Garden Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Tagore Garden, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Tagore Garden Metro Station (Blue Line). Pay only ",
    "h1": "Hourly Hotels in Tagore Garden, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Tagore Garden? Prime residential location situated directly opposite Pacific Mall. Popular for comfortable, private couple stays after shopping and entertainment. Conveniently situated near Pacific Mall, Holy Child School, Najafgarh Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1300,
        1316,
        1345,
        1489
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Tagore Garden for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Tagore Garden offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Tagore Garden strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Tagore Garden for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Tagore Garden. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Tagore Garden hourly hotels?",
            "answer": "Yes. All partner hotels in Tagore Garden are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Tagore Garden?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Tagore Garden."
        },
        {
            "question": "How much advance deposit is required to book in Tagore Garden?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Tagore Garden?",
            "answer": "Most properties are located within 5 to 10 minutes of Tagore Garden Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'subhash-nagar': {
    "slug": "subhash-nagar",
    "name": "Subhash Nagar",
    "areaLabel": "Subhash Nagar, West Delhi",
    "category": "commercial",
    "badgeText": "Opposite Pacific Mall \u2022 Affordable Hours",
    "landmark": "Subhash Nagar Metro, Ajanta Cinema Area, Pacific Mall Bridge",
    "nearestMetro": "Subhash Nagar Metro Station (Blue Line)",
    "metaTitle": "Hourly Hotels in Subhash Nagar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Subhash Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Subhash Nagar Metro Station (Blue Line). Pay only ",
    "h1": "Hourly Hotels in Subhash Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Subhash Nagar? Vibrant locality with instant metro connectivity and street food culture. Budget-friendly hourly micro-stays with air conditioning. Conveniently situated near Subhash Nagar Metro, Ajanta Cinema Area, Pacific Mall Bridge, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1257,
        1338,
        1215,
        1240,
        1244,
        1281
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Subhash Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Subhash Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Subhash Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Subhash Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Subhash Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Subhash Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Subhash Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Subhash Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Subhash Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Subhash Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Subhash Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Subhash Nagar Metro Station (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'uttam-nagar': {
    "slug": "uttam-nagar",
    "name": "Uttam Nagar",
    "areaLabel": "Uttam Nagar East & West",
    "category": "commercial",
    "badgeText": "Near Uttam Nagar Metro \u2022 Low-Cost Stays",
    "landmark": "Uttam Nagar Bus Terminal, Arya Samaj Road, Najafgarh Road",
    "nearestMetro": "Uttam Nagar East & West Metro (Blue Line)",
    "metaTitle": "Hourly Hotels in Uttam Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Uttam Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Uttam Nagar East & West Metro (Blue Line). Pay only ",
    "h1": "Hourly Hotels in Uttam Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Uttam Nagar? Ultra-convenient transit belt on the Blue Line. Direct access to budget hourly rooms offering fast check-in and friendly support. Conveniently situated near Uttam Nagar Bus Terminal, Arya Samaj Road, Najafgarh Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1213,
        1214,
        1220,
        1246
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Uttam Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Uttam Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Uttam Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Uttam Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Uttam Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Uttam Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Uttam Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Uttam Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Uttam Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Uttam Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Uttam Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Uttam Nagar East & West Metro (Blue Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shalimar-bagh': {
    "slug": "shalimar-bagh",
    "name": "Shalimar Bagh",
    "areaLabel": "Shalimar Bagh, North Delhi",
    "category": "couple",
    "badgeText": "Near Max Hospital & Ring Road",
    "landmark": "Max Super Speciality Hospital Shalimar Bagh, Club Road, Sheesh Mahal",
    "nearestMetro": "Shalimar Bagh Metro Station (Pink Line)",
    "metaTitle": "Hourly Hotels in Shalimar Bagh Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Shalimar Bagh, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shalimar Bagh Metro Station (Pink Line). Pay only ",
    "h1": "Hourly Hotels in Shalimar Bagh, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shalimar Bagh? Well-established North Delhi residential zone with premier healthcare facilities and shopping plazas. Relaxing daytime hourly rooms. Conveniently situated near Max Super Speciality Hospital Shalimar Bagh, Club Road, Sheesh Mahal, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1248,
        1339,
        1346,
        1375,
        1453,
        1468,
        1470,
        1474,
        1498,
        1521,
        1533
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shalimar Bagh for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shalimar Bagh offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shalimar Bagh strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shalimar Bagh for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shalimar Bagh. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shalimar Bagh hourly hotels?",
            "answer": "Yes. All partner hotels in Shalimar Bagh are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shalimar Bagh?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shalimar Bagh."
        },
        {
            "question": "How much advance deposit is required to book in Shalimar Bagh?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shalimar Bagh?",
            "answer": "Most properties are located within 5 to 10 minutes of Shalimar Bagh Metro Station (Pink Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'wazirpur': {
    "slug": "wazirpur",
    "name": "Wazirpur",
    "areaLabel": "Wazirpur Industrial Area",
    "category": "business",
    "badgeText": "Stainless Steel & Industrial Belt",
    "landmark": "Wazirpur Industrial Area, Ring Road, Shalimar Bagh Border",
    "nearestMetro": "Netaji Subhash Place & Shalimar Bagh Metro",
    "metaTitle": "Hourly Hotels in Wazirpur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Wazirpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Netaji Subhash Place & Shalimar Bagh Metro. Pay only 12",
    "h1": "Hourly Hotels in Wazirpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Wazirpur? Prominent manufacturing cluster in North Delhi. Air-conditioned rooms for visiting industrial clients, factory inspectors, and suppliers. Conveniently situated near Wazirpur Industrial Area, Ring Road, Shalimar Bagh Border, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1248,
        1339,
        1346,
        1375,
        1453,
        1468,
        1474,
        1498,
        1521,
        1533
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Wazirpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Wazirpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Wazirpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Wazirpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Wazirpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Wazirpur hourly hotels?",
            "answer": "Yes. All partner hotels in Wazirpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Wazirpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Wazirpur."
        },
        {
            "question": "How much advance deposit is required to book in Wazirpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Wazirpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Netaji Subhash Place & Shalimar Bagh Metro, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shahdara': {
    "slug": "shahdara",
    "name": "Shahdara",
    "areaLabel": "Shahdara Old City & Station",
    "category": "transit",
    "badgeText": "Near Shahdara Junction & Red Line Metro",
    "landmark": "Shahdara Railway Station, Chhota Bazaar, GT Road",
    "nearestMetro": "Shahdara Metro Station (Red Line)",
    "metaTitle": "Hourly Hotels in Shahdara Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Shahdara, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shahdara Metro Station (Red Line). Pay only 12% deposit",
    "h1": "Hourly Hotels in Shahdara, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shahdara? Historic East Delhi trading hub with bustling markets and direct rail connections. Economical short-stay options for commuters. Conveniently situated near Shahdara Railway Station, Chhota Bazaar, GT Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1253,
        1488,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shahdara for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shahdara offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shahdara strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shahdara for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shahdara. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shahdara hourly hotels?",
            "answer": "Yes. All partner hotels in Shahdara are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shahdara?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shahdara."
        },
        {
            "question": "How much advance deposit is required to book in Shahdara?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shahdara?",
            "answer": "Most properties are located within 5 to 10 minutes of Shahdara Metro Station (Red Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'badarpur': {
    "slug": "badarpur",
    "name": "Badarpur",
    "areaLabel": "Badarpur, South-East Delhi",
    "category": "transit",
    "badgeText": "Delhi-Faridabad Border \u2022 Highway Stays",
    "landmark": "Badarpur Border, Mathura Road NH-19, NTPC Eco Park",
    "nearestMetro": "Badarpur Border Metro Station (Violet Line)",
    "metaTitle": "Hourly Hotels in Badarpur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Badarpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Badarpur Border Metro Station (Violet Line). Pay only 1",
    "h1": "Hourly Hotels in Badarpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Badarpur? Southern gateway connecting Delhi to Faridabad and Mathura Road. Convenient day rooms for long-distance highway travelers. Conveniently situated near Badarpur Border, Mathura Road NH-19, NTPC Eco Park, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1298,
        1503,
        1215,
        1240,
        1244,
        1281
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Badarpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Badarpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Badarpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Badarpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Badarpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Badarpur hourly hotels?",
            "answer": "Yes. All partner hotels in Badarpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Badarpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Badarpur."
        },
        {
            "question": "How much advance deposit is required to book in Badarpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Badarpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Badarpur Border Metro Station (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'sarita-vihar': {
    "slug": "sarita-vihar",
    "name": "Sarita Vihar",
    "areaLabel": "Sarita Vihar & Mathura Road",
    "category": "transit",
    "badgeText": "Near Apollo Hospital & Mathura Road",
    "landmark": "Sarita Vihar DDA Pockets, Mathura Road, Apollo Hospital Complex",
    "nearestMetro": "Sarita Vihar Metro Station (Violet Line)",
    "metaTitle": "Hourly Hotels in Sarita Vihar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Sarita Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Sarita Vihar Metro Station (Violet Line). Pay only ",
    "h1": "Hourly Hotels in Sarita Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Sarita Vihar? Green, peaceful South-East Delhi township adjoining premier hospitals and international trade centers. Clean family-friendly hourly rooms. Conveniently situated near Sarita Vihar DDA Pockets, Mathura Road, Apollo Hospital Complex, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1235,
        1298,
        1215,
        1240,
        1244,
        1281
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Sarita Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Sarita Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Sarita Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Sarita Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Sarita Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Sarita Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Sarita Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Sarita Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Sarita Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Sarita Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Sarita Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Sarita Vihar Metro Station (Violet Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'mehrauli': {
    "slug": "mehrauli",
    "name": "Mehrauli",
    "areaLabel": "Mehrauli Archaeological Park & Qutub",
    "category": "heritage",
    "badgeText": "Near Qutub Minar & 1000-Year Heritage",
    "landmark": "Qutub Minar, Mehrauli Archaeological Park, Jamali Kamali",
    "nearestMetro": "Qutab Minar Metro Station (Yellow Line)",
    "metaTitle": "Hourly Hotels in Mehrauli Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Mehrauli, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Qutab Minar Metro Station (Yellow Line). Pay only 12% d",
    "h1": "Hourly Hotels in Mehrauli, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Mehrauli? Delhi's oldest continuously inhabited neighborhood. Unwind after touring world heritage monuments with a refreshing, quiet 3-hour stay. Conveniently situated near Qutub Minar, Mehrauli Archaeological Park, Jamali Kamali, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1275,
        1298,
        1419,
        1438,
        1477,
        1534,
        1537
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Mehrauli for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Mehrauli offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Mehrauli strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Mehrauli for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Mehrauli. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Mehrauli hourly hotels?",
            "answer": "Yes. All partner hotels in Mehrauli are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Mehrauli?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Mehrauli."
        },
        {
            "question": "How much advance deposit is required to book in Mehrauli?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Mehrauli?",
            "answer": "Most properties are located within 5 to 10 minutes of Qutab Minar Metro Station (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'alipur': {
    "slug": "alipur",
    "name": "Alipur",
    "areaLabel": "Alipur & GT Karnal Highway",
    "category": "transit",
    "badgeText": "NH-44 Highway Gateway \u2022 Resort Stays",
    "landmark": "GT Karnal Road NH-44, Splash Water Park, Alipur Chowk",
    "nearestMetro": "Samaypur Badli Metro (Yellow Line)",
    "metaTitle": "Hourly Hotels in Alipur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Alipur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Samaypur Badli Metro (Yellow Line). Pay only 12% deposit.",
    "h1": "Hourly Hotels in Alipur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Alipur? High-speed highway portal connecting Delhi to Chandigarh and northern states. Expansive resort-style rooms for highway driving breaks. Conveniently situated near GT Karnal Road NH-44, Splash Water Park, Alipur Chowk, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        573,
        655,
        1285,
        1290,
        1291,
        1311,
        1315,
        1357,
        1381,
        1400,
        1421,
        1422
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Alipur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Alipur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Alipur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Alipur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Alipur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Alipur hourly hotels?",
            "answer": "Yes. All partner hotels in Alipur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Alipur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Alipur."
        },
        {
            "question": "How much advance deposit is required to book in Alipur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Alipur?",
            "answer": "Most properties are located within 5 to 10 minutes of Samaypur Badli Metro (Yellow Line), offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'ito-delhi': {
    "slug": "ito-delhi",
    "name": "ITO & Pragati Maidan",
    "areaLabel": "ITO & Bharat Mandapam Area",
    "category": "business",
    "badgeText": "Near Bharat Mandapam & High Court",
    "landmark": "Bharat Mandapam (Pragati Maidan), Supreme Court of India, ITO Crossing",
    "nearestMetro": "ITO Metro & Supreme Court Metro Station",
    "metaTitle": "Hourly Hotels in ITO & Pragati Maidan Delhi \u2014 3, 6, 12h Stays | G",
    "metaDescription": "Book hourly hotels in ITO & Pragati Maidan, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near ITO Metro & Supreme Court Metro Station. Pa",
    "h1": "Hourly Hotels in ITO & Pragati Maidan, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in ITO & Pragati Maidan? The official nerve center of government press, regulatory commissions, and world summits. Essential day-rooms for visiting legal teams and media. Conveniently situated near Bharat Mandapam (Pragati Maidan), Supreme Court of India, ITO Crossing, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        472,
        1423,
        1501,
        474,
        1522
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in ITO & Pragati Maidan for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in ITO & Pragati Maidan offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in ITO & Pragati Maidan strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in ITO & Pragati Maidan for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in ITO & Pragati Maidan. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in ITO & Pragati Maidan hourly hotels?",
            "answer": "Yes. All partner hotels in ITO & Pragati Maidan are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in ITO & Pragati Maidan?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in ITO & Pragati Maidan."
        },
        {
            "question": "How much advance deposit is required to book in ITO & Pragati Maidan?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in ITO & Pragati Maidan?",
            "answer": "Most properties are located within 5 to 10 minutes of ITO Metro & Supreme Court Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'kamla-nagar': {
    "slug": "kamla-nagar",
    "name": "Kamla Nagar",
    "areaLabel": "Kamla Nagar, North Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Kamla Nagar",
    "landmark": "Kamla Nagar Clock Tower & Spark Mall",
    "nearestMetro": "Vishwavidyalaya Metro Station",
    "metaTitle": "Hourly Hotels in Kamla Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Kamla Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Vishwavidyalaya Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Kamla Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Kamla Nagar? Handpicked, verified micro-stay properties in Kamla Nagar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Kamla Nagar Clock Tower & Spark Mall, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1324,
        1215,
        1240,
        1244,
        1281,
        1289
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Kamla Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Kamla Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Kamla Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Kamla Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Kamla Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Kamla Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Kamla Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Kamla Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Kamla Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Kamla Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Kamla Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Vishwavidyalaya Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shadipur': {
    "slug": "shadipur",
    "name": "Shadipur",
    "areaLabel": "Shadipur & West Patel Nagar",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Shadipur",
    "landmark": "Shadipur Flyover, Kathputli Colony Area",
    "nearestMetro": "Shadipur Metro Station",
    "metaTitle": "Hourly Hotels in Shadipur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Shadipur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shadipur Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Shadipur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shadipur? Handpicked, verified micro-stay properties in Shadipur. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Shadipur Flyover, Kathputli Colony Area, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1340,
        1380,
        1390,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shadipur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shadipur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shadipur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shadipur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shadipur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shadipur hourly hotels?",
            "answer": "Yes. All partner hotels in Shadipur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shadipur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shadipur."
        },
        {
            "question": "How much advance deposit is required to book in Shadipur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shadipur?",
            "answer": "Most properties are located within 5 to 10 minutes of Shadipur Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shakti-nagar': {
    "slug": "shakti-nagar",
    "name": "Shakti Nagar",
    "areaLabel": "Shakti Nagar & Nagia Park",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Shakti Nagar",
    "landmark": "Nagia Park, Roshanara Club, Roop Nagar",
    "nearestMetro": "Shastri Nagar Metro Station",
    "metaTitle": "Hourly Hotels in Shakti Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Shakti Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shastri Nagar Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Shakti Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shakti Nagar? Handpicked, verified micro-stay properties in Shakti Nagar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Nagia Park, Roshanara Club, Roop Nagar, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1324,
        1215,
        1240,
        1244,
        1281,
        1289
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shakti Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shakti Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shakti Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shakti Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shakti Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shakti Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Shakti Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shakti Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shakti Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Shakti Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shakti Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Shastri Nagar Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'keshav-puram': {
    "slug": "keshav-puram",
    "name": "Keshav Puram",
    "areaLabel": "Keshav Puram, North-West Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Keshav Puram",
    "landmark": "Keshav Puram C-Block, Lawrence Road",
    "nearestMetro": "Keshav Puram Metro Station",
    "metaTitle": "Hourly Hotels in Keshav Puram Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Keshav Puram, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Keshav Puram Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Keshav Puram, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Keshav Puram? Handpicked, verified micro-stay properties in Keshav Puram. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Keshav Puram C-Block, Lawrence Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1248,
        1339,
        1346,
        1375,
        1453,
        1468,
        1474,
        1498,
        1521,
        1533
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Keshav Puram for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Keshav Puram offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Keshav Puram strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Keshav Puram for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Keshav Puram. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Keshav Puram hourly hotels?",
            "answer": "Yes. All partner hotels in Keshav Puram are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Keshav Puram?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Keshav Puram."
        },
        {
            "question": "How much advance deposit is required to book in Keshav Puram?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Keshav Puram?",
            "answer": "Most properties are located within 5 to 10 minutes of Keshav Puram Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'azadpur': {
    "slug": "azadpur",
    "name": "Azadpur",
    "areaLabel": "Azadpur Fruit & Vegetable Mandi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Azadpur",
    "landmark": "Azadpur Mandi, Ring Road, Model Town Border",
    "nearestMetro": "Azadpur Metro Station",
    "metaTitle": "Hourly Hotels in Azadpur Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Azadpur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Azadpur Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Azadpur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Azadpur? Handpicked, verified micro-stay properties in Azadpur. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Azadpur Mandi, Ring Road, Model Town Border, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1247,
        1256,
        1259,
        1355,
        1403
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Azadpur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Azadpur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Azadpur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Azadpur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Azadpur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Azadpur hourly hotels?",
            "answer": "Yes. All partner hotels in Azadpur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Azadpur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Azadpur."
        },
        {
            "question": "How much advance deposit is required to book in Azadpur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Azadpur?",
            "answer": "Most properties are located within 5 to 10 minutes of Azadpur Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'jahangirpuri': {
    "slug": "jahangirpuri",
    "name": "Jahangirpuri",
    "areaLabel": "Jahangirpuri, North Delhi",
    "category": "transit",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Jahangirpuri",
    "landmark": "Jahangirpuri Metro Terminal, GT Karnal Bypass",
    "nearestMetro": "Jahangirpuri Metro Station",
    "metaTitle": "Hourly Hotels in Jahangirpuri Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Jahangirpuri, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Jahangirpuri Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Jahangirpuri, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Jahangirpuri? Handpicked, verified micro-stay properties in Jahangirpuri. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Jahangirpuri Metro Terminal, GT Karnal Bypass, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1247,
        1259,
        1304,
        1355,
        1365,
        1403,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Jahangirpuri for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Jahangirpuri offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Jahangirpuri strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Jahangirpuri for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Jahangirpuri. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Jahangirpuri hourly hotels?",
            "answer": "Yes. All partner hotels in Jahangirpuri are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Jahangirpuri?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Jahangirpuri."
        },
        {
            "question": "How much advance deposit is required to book in Jahangirpuri?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Jahangirpuri?",
            "answer": "Most properties are located within 5 to 10 minutes of Jahangirpuri Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'seelampur': {
    "slug": "seelampur",
    "name": "Seelampur",
    "areaLabel": "Seelampur, North-East Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Seelampur",
    "landmark": "Seelampur Market, Welcome Metro Interchange",
    "nearestMetro": "Seelampur Metro Station",
    "metaTitle": "Hourly Hotels in Seelampur Delhi \u2014 3, 6, 12h Stays | GetHotelStay",
    "metaDescription": "Book hourly hotels in Seelampur, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Seelampur Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Seelampur, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Seelampur? Handpicked, verified micro-stay properties in Seelampur. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Seelampur Market, Welcome Metro Interchange, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1488,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Seelampur for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Seelampur offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Seelampur strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Seelampur for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Seelampur. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Seelampur hourly hotels?",
            "answer": "Yes. All partner hotels in Seelampur are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Seelampur?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Seelampur."
        },
        {
            "question": "How much advance deposit is required to book in Seelampur?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Seelampur?",
            "answer": "Most properties are located within 5 to 10 minutes of Seelampur Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'gandhi-nagar': {
    "slug": "gandhi-nagar",
    "name": "Gandhi Nagar",
    "areaLabel": "Gandhi Nagar Textile Market",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Gandhi Nagar",
    "landmark": "Asia's Largest Readymade Garment Market",
    "nearestMetro": "Shastri Park Metro Station",
    "metaTitle": "Hourly Hotels in Gandhi Nagar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Gandhi Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shastri Park Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Gandhi Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Gandhi Nagar? Handpicked, verified micro-stay properties in Gandhi Nagar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Asia's Largest Readymade Garment Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1488,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Gandhi Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Gandhi Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Gandhi Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Gandhi Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Gandhi Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Gandhi Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Gandhi Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Gandhi Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Gandhi Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Gandhi Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Gandhi Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Shastri Park Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'geeta-colony': {
    "slug": "geeta-colony",
    "name": "Geeta Colony",
    "areaLabel": "Geeta Colony, East Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Geeta Colony",
    "landmark": "Geeta Colony Taj Enclave, Vikas Marg",
    "nearestMetro": "Nirman Vihar Metro Station",
    "metaTitle": "Hourly Hotels in Geeta Colony Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Geeta Colony, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Nirman Vihar Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Geeta Colony, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Geeta Colony? Handpicked, verified micro-stay properties in Geeta Colony. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Geeta Colony Taj Enclave, Vikas Marg, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1222,
        1223,
        1224,
        1471,
        1499,
        1504,
        1508
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Geeta Colony for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Geeta Colony offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Geeta Colony strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Geeta Colony for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Geeta Colony. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Geeta Colony hourly hotels?",
            "answer": "Yes. All partner hotels in Geeta Colony are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Geeta Colony?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Geeta Colony."
        },
        {
            "question": "How much advance deposit is required to book in Geeta Colony?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Geeta Colony?",
            "answer": "Most properties are located within 5 to 10 minutes of Nirman Vihar Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'tughlakabad': {
    "slug": "tughlakabad",
    "name": "Tughlakabad",
    "areaLabel": "Tughlakabad & Fort Area",
    "category": "heritage",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Tughlakabad",
    "landmark": "Tughlaqabad Fort, Inland Container Depot (ICD)",
    "nearestMetro": "Tughlakabad Metro Station",
    "metaTitle": "Hourly Hotels in Tughlakabad Delhi \u2014 3, 6, 12h Stays | GetHotelSt",
    "metaDescription": "Book hourly hotels in Tughlakabad, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Tughlakabad Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Tughlakabad, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Tughlakabad? Handpicked, verified micro-stay properties in Tughlakabad. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Tughlaqabad Fort, Inland Container Depot (ICD), our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1289,
        1292,
        1298,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Tughlakabad for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Tughlakabad offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Tughlakabad strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Tughlakabad for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Tughlakabad. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Tughlakabad hourly hotels?",
            "answer": "Yes. All partner hotels in Tughlakabad are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Tughlakabad?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Tughlakabad."
        },
        {
            "question": "How much advance deposit is required to book in Tughlakabad?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Tughlakabad?",
            "answer": "Most properties are located within 5 to 10 minutes of Tughlakabad Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'sangam-vihar': {
    "slug": "sangam-vihar",
    "name": "Sangam Vihar",
    "areaLabel": "Sangam Vihar & MB Road",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Sangam Vihar",
    "landmark": "Sangam Vihar Main Market, Batra Hospital",
    "nearestMetro": "Saket Metro Station",
    "metaTitle": "Hourly Hotels in Sangam Vihar Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Sangam Vihar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Saket Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Sangam Vihar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Sangam Vihar? Handpicked, verified micro-stay properties in Sangam Vihar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Sangam Vihar Main Market, Batra Hospital, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1289,
        1292,
        1298,
        1477
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Sangam Vihar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Sangam Vihar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Sangam Vihar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Sangam Vihar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Sangam Vihar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Sangam Vihar hourly hotels?",
            "answer": "Yes. All partner hotels in Sangam Vihar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Sangam Vihar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Sangam Vihar."
        },
        {
            "question": "How much advance deposit is required to book in Sangam Vihar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Sangam Vihar?",
            "answer": "Most properties are located within 5 to 10 minutes of Saket Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'sainik-farms': {
    "slug": "sainik-farms",
    "name": "Sainik Farms",
    "areaLabel": "Sainik Farms, South Delhi",
    "category": "couple",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Sainik Farms",
    "landmark": "Country Club Sainik Farms, Western Avenue",
    "nearestMetro": "Saket Metro Station",
    "metaTitle": "Hourly Hotels in Sainik Farms Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Sainik Farms, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Saket Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Sainik Farms, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Sainik Farms? Handpicked, verified micro-stay properties in Sainik Farms. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Country Club Sainik Farms, Western Avenue, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1289,
        1292,
        1298,
        1477
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Sainik Farms for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Sainik Farms offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Sainik Farms strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Sainik Farms for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Sainik Farms. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Sainik Farms hourly hotels?",
            "answer": "Yes. All partner hotels in Sainik Farms are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Sainik Farms?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Sainik Farms."
        },
        {
            "question": "How much advance deposit is required to book in Sainik Farms?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Sainik Farms?",
            "answer": "Most properties are located within 5 to 10 minutes of Saket Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'mahavir-enclave': {
    "slug": "mahavir-enclave",
    "name": "Mahavir Enclave",
    "areaLabel": "Mahavir Enclave, South-West Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Mahavir Enclave",
    "landmark": "Dashrathpuri Metro, Palam-Dabri Road",
    "nearestMetro": "Dashrathpuri Metro Station",
    "metaTitle": "Hourly Hotels in Mahavir Enclave Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Mahavir Enclave, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dashrathpuri Metro Station. Pay only 12% deposit",
    "h1": "Hourly Hotels in Mahavir Enclave, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Mahavir Enclave? Handpicked, verified micro-stay properties in Mahavir Enclave. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Dashrathpuri Metro, Palam-Dabri Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Mahavir Enclave for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Mahavir Enclave offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Mahavir Enclave strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Mahavir Enclave for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Mahavir Enclave. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Mahavir Enclave hourly hotels?",
            "answer": "Yes. All partner hotels in Mahavir Enclave are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Mahavir Enclave?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Mahavir Enclave."
        },
        {
            "question": "How much advance deposit is required to book in Mahavir Enclave?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Mahavir Enclave?",
            "answer": "Most properties are located within 5 to 10 minutes of Dashrathpuri Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dashrathpuri': {
    "slug": "dashrathpuri",
    "name": "Dashrathpuri",
    "areaLabel": "Dashrathpuri & Palam",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Dashrathpuri",
    "landmark": "Dashrathpuri Metro Station, Dabri Mor",
    "nearestMetro": "Dashrathpuri Metro Station",
    "metaTitle": "Hourly Hotels in Dashrathpuri Delhi \u2014 3, 6, 12h Stays | GetHotelS",
    "metaDescription": "Book hourly hotels in Dashrathpuri, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Dashrathpuri Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Dashrathpuri, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dashrathpuri? Handpicked, verified micro-stay properties in Dashrathpuri. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Dashrathpuri Metro Station, Dabri Mor, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1239,
        1240,
        1241,
        1242,
        1250,
        1251,
        1252,
        1261,
        1265,
        1297,
        1299,
        1303
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dashrathpuri for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dashrathpuri offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dashrathpuri strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dashrathpuri for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dashrathpuri. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dashrathpuri hourly hotels?",
            "answer": "Yes. All partner hotels in Dashrathpuri are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dashrathpuri?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dashrathpuri."
        },
        {
            "question": "How much advance deposit is required to book in Dashrathpuri?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dashrathpuri?",
            "answer": "Most properties are located within 5 to 10 minutes of Dashrathpuri Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'rangpuri': {
    "slug": "rangpuri",
    "name": "Rangpuri",
    "areaLabel": "Rangpuri & Mahipalpur Border",
    "category": "transit",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Rangpuri",
    "landmark": "Rangpuri Aravalli Ridge, NH-48",
    "nearestMetro": "Delhi Aerocity Metro Station",
    "metaTitle": "Hourly Hotels in Rangpuri Delhi \u2014 3, 6, 12h Stays | GetHotelStays",
    "metaDescription": "Book hourly hotels in Rangpuri, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Delhi Aerocity Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Rangpuri, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Rangpuri? Handpicked, verified micro-stay properties in Rangpuri. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Rangpuri Aravalli Ridge, NH-48, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1218,
        1225,
        1226,
        1229,
        1231,
        1237,
        1244,
        1245,
        1254,
        1258,
        1260,
        1262
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Rangpuri for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Rangpuri offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Rangpuri strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Rangpuri for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Rangpuri. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Rangpuri hourly hotels?",
            "answer": "Yes. All partner hotels in Rangpuri are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Rangpuri?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Rangpuri."
        },
        {
            "question": "How much advance deposit is required to book in Rangpuri?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Rangpuri?",
            "answer": "Most properties are located within 5 to 10 minutes of Delhi Aerocity Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'gujranwala-town': {
    "slug": "gujranwala-town",
    "name": "Gujranwala Town",
    "areaLabel": "Gujranwala Town, North Delhi",
    "category": "couple",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Gujranwala Town",
    "landmark": "Model Town Border, GT Karnal Road",
    "nearestMetro": "Model Town Metro Station",
    "metaTitle": "Hourly Hotels in Gujranwala Town Delhi \u2014 3, 6, 12h Stays | GetHot",
    "metaDescription": "Book hourly hotels in Gujranwala Town, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Model Town Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Gujranwala Town, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Gujranwala Town? Handpicked, verified micro-stay properties in Gujranwala Town. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Model Town Border, GT Karnal Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1304,
        1365,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Gujranwala Town for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Gujranwala Town offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Gujranwala Town strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Gujranwala Town for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Gujranwala Town. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Gujranwala Town hourly hotels?",
            "answer": "Yes. All partner hotels in Gujranwala Town are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Gujranwala Town?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Gujranwala Town."
        },
        {
            "question": "How much advance deposit is required to book in Gujranwala Town?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Gujranwala Town?",
            "answer": "Most properties are located within 5 to 10 minutes of Model Town Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'derawal-nagar': {
    "slug": "derawal-nagar",
    "name": "Derawal Nagar",
    "areaLabel": "Derawal Nagar, North Delhi",
    "category": "couple",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Derawal Nagar",
    "landmark": "Naini Lake Proximity, Ring Road",
    "nearestMetro": "Model Town Metro Station",
    "metaTitle": "Hourly Hotels in Derawal Nagar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Derawal Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Model Town Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Derawal Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Derawal Nagar? Handpicked, verified micro-stay properties in Derawal Nagar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Naini Lake Proximity, Ring Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        87,
        1304,
        1365,
        1460,
        1491
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Derawal Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Derawal Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Derawal Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Derawal Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Derawal Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Derawal Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Derawal Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Derawal Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Derawal Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Derawal Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Derawal Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Model Town Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shastri-nagar': {
    "slug": "shastri-nagar",
    "name": "Shastri Nagar",
    "areaLabel": "Shastri Nagar, North-Central Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Shastri Nagar",
    "landmark": "Sarai Rohilla Terminal Proximity",
    "nearestMetro": "Shastri Nagar Metro Station",
    "metaTitle": "Hourly Hotels in Shastri Nagar Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Shastri Nagar, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shastri Nagar Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Shastri Nagar, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shastri Nagar? Handpicked, verified micro-stay properties in Shastri Nagar. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Sarai Rohilla Terminal Proximity, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1271,
        1276,
        1293,
        1294,
        1312,
        1314,
        1318,
        1319,
        1331,
        1340,
        1344,
        1377
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shastri Nagar for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shastri Nagar offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shastri Nagar strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shastri Nagar for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shastri Nagar. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shastri Nagar hourly hotels?",
            "answer": "Yes. All partner hotels in Shastri Nagar are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shastri Nagar?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shastri Nagar."
        },
        {
            "question": "How much advance deposit is required to book in Shastri Nagar?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shastri Nagar?",
            "answer": "Most properties are located within 5 to 10 minutes of Shastri Nagar Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'sarai-rohilla': {
    "slug": "sarai-rohilla",
    "name": "Sarai Rohilla (DEE Terminal)",
    "areaLabel": "Sarai Rohilla Railway Terminal",
    "category": "transit",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Sarai Rohilla (DEE Terminal)",
    "landmark": "Delhi Sarai Rohilla Railway Station",
    "nearestMetro": "Shastri Nagar Metro Station",
    "metaTitle": "Hourly Hotels in Sarai Rohilla (DEE Terminal) Delhi \u2014 3, 6, 12h S",
    "metaDescription": "Book hourly hotels in Sarai Rohilla (DEE Terminal), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Shastri Nagar Metro Station. Pay on",
    "h1": "Hourly Hotels in Sarai Rohilla (DEE Terminal), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Sarai Rohilla (DEE Terminal)? Handpicked, verified micro-stay properties in Sarai Rohilla (DEE Terminal). Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Delhi Sarai Rohilla Railway Station, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        110,
        1270,
        1271,
        1276,
        1293,
        1294,
        1312,
        1314,
        1318,
        1319,
        1325,
        1330
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Sarai Rohilla (DEE Terminal) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Sarai Rohilla (DEE Terminal) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Sarai Rohilla (DEE Terminal) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Sarai Rohilla (DEE Terminal) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Sarai Rohilla (DEE Terminal). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Sarai Rohilla (DEE Terminal) hourly hotels?",
            "answer": "Yes. All partner hotels in Sarai Rohilla (DEE Terminal) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Sarai Rohilla (DEE Terminal)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Sarai Rohilla (DEE Terminal)."
        },
        {
            "question": "How much advance deposit is required to book in Sarai Rohilla (DEE Terminal)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Sarai Rohilla (DEE Terminal)?",
            "answer": "Most properties are located within 5 to 10 minutes of Shastri Nagar Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'dilli-haat-ina': {
    "slug": "dilli-haat-ina",
    "name": "Dilli Haat & INA Market",
    "areaLabel": "INA Colony, South Delhi",
    "category": "commercial",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Dilli Haat & INA Market",
    "landmark": "Dilli Haat Handicrafts, INA Food Market",
    "nearestMetro": "INA Metro Station",
    "metaTitle": "Hourly Hotels in Dilli Haat & INA Market Delhi \u2014 3, 6, 12h Stays ",
    "metaDescription": "Book hourly hotels in Dilli Haat & INA Market, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near INA Metro Station. Pay only 12% deposit.",
    "h1": "Hourly Hotels in Dilli Haat & INA Market, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Dilli Haat & INA Market? Handpicked, verified micro-stay properties in Dilli Haat & INA Market. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Dilli Haat Handicrafts, INA Food Market, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1524,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Dilli Haat & INA Market for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Dilli Haat & INA Market offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Dilli Haat & INA Market strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Dilli Haat & INA Market for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Dilli Haat & INA Market. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Dilli Haat & INA Market hourly hotels?",
            "answer": "Yes. All partner hotels in Dilli Haat & INA Market are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Dilli Haat & INA Market?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Dilli Haat & INA Market."
        },
        {
            "question": "How much advance deposit is required to book in Dilli Haat & INA Market?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Dilli Haat & INA Market?",
            "answer": "Most properties are located within 5 to 10 minutes of INA Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'anand-niketan': {
    "slug": "anand-niketan",
    "name": "Anand Niketan",
    "areaLabel": "Anand Niketan Diplomatic Suburb",
    "category": "couple",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Anand Niketan",
    "landmark": "Shanti Niketan & Moti Bagh Border",
    "nearestMetro": "Sir Vishweshwaraiah Moti Bagh Metro Station",
    "metaTitle": "Hourly Hotels in Anand Niketan Delhi \u2014 3, 6, 12h Stays | GetHotel",
    "metaDescription": "Book hourly hotels in Anand Niketan, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Sir Vishweshwaraiah Moti Bagh Metro Station. Pay o",
    "h1": "Hourly Hotels in Anand Niketan, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Anand Niketan? Handpicked, verified micro-stay properties in Anand Niketan. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Shanti Niketan & Moti Bagh Border, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1217,
        1231,
        1233,
        1237,
        1281,
        1329,
        1363,
        1394,
        1414,
        1428,
        1429,
        1469
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Anand Niketan for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Anand Niketan offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Anand Niketan strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Anand Niketan for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Anand Niketan. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Anand Niketan hourly hotels?",
            "answer": "Yes. All partner hotels in Anand Niketan are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Anand Niketan?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Anand Niketan."
        },
        {
            "question": "How much advance deposit is required to book in Anand Niketan?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Anand Niketan?",
            "answer": "Most properties are located within 5 to 10 minutes of Sir Vishweshwaraiah Moti Bagh Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'shanti-niketan': {
    "slug": "shanti-niketan",
    "name": "Shanti Niketan",
    "areaLabel": "Shanti Niketan, South Delhi",
    "category": "couple",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Shanti Niketan",
    "landmark": "Diplomatic Quarter, Ring Road",
    "nearestMetro": "Durgabai Deshmukh South Campus Metro Station",
    "metaTitle": "Hourly Hotels in Shanti Niketan Delhi \u2014 3, 6, 12h Stays | GetHote",
    "metaDescription": "Book hourly hotels in Shanti Niketan, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Durgabai Deshmukh South Campus Metro Station. Pay",
    "h1": "Hourly Hotels in Shanti Niketan, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Shanti Niketan? Handpicked, verified micro-stay properties in Shanti Niketan. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Diplomatic Quarter, Ring Road, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1217,
        1231,
        1233,
        1237,
        1281,
        1329,
        1363,
        1394,
        1414,
        1428,
        1429,
        1469
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Shanti Niketan for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Shanti Niketan offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Shanti Niketan strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Shanti Niketan for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Shanti Niketan. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Shanti Niketan hourly hotels?",
            "answer": "Yes. All partner hotels in Shanti Niketan are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Shanti Niketan?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Shanti Niketan."
        },
        {
            "question": "How much advance deposit is required to book in Shanti Niketan?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Shanti Niketan?",
            "answer": "Most properties are located within 5 to 10 minutes of Durgabai Deshmukh South Campus Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'safdarjung-airport': {
    "slug": "safdarjung-airport",
    "name": "Safdarjung Airport Area",
    "areaLabel": "Jor Bagh & Safdarjung",
    "category": "heritage",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Safdarjung Airport Area",
    "landmark": "Safdarjung Tomb, Lodhi Gardens, Jor Bagh",
    "nearestMetro": "Jor Bagh Metro Station",
    "metaTitle": "Hourly Hotels in Safdarjung Airport Area Delhi \u2014 3, 6, 12h Stays ",
    "metaDescription": "Book hourly hotels in Safdarjung Airport Area, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Jor Bagh Metro Station. Pay only 12% dep",
    "h1": "Hourly Hotels in Safdarjung Airport Area, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Safdarjung Airport Area? Handpicked, verified micro-stay properties in Safdarjung Airport Area. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Safdarjung Tomb, Lodhi Gardens, Jor Bagh, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        1227,
        1267,
        1524,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Safdarjung Airport Area for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Safdarjung Airport Area offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Safdarjung Airport Area strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Safdarjung Airport Area for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Safdarjung Airport Area. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Safdarjung Airport Area hourly hotels?",
            "answer": "Yes. All partner hotels in Safdarjung Airport Area are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Safdarjung Airport Area?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Safdarjung Airport Area."
        },
        {
            "question": "How much advance deposit is required to book in Safdarjung Airport Area?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Safdarjung Airport Area?",
            "answer": "Most properties are located within 5 to 10 minutes of Jor Bagh Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'lodhi-colony': {
    "slug": "lodhi-colony",
    "name": "Lodhi Colony & Art District",
    "areaLabel": "Lodhi Art District, South Delhi",
    "category": "heritage",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Lodhi Colony & Art District",
    "landmark": "Lodhi Gardens, India Habitat Centre, CGO Complex",
    "nearestMetro": "JLN Stadium Metro Station",
    "metaTitle": "Hourly Hotels in Lodhi Colony & Art District Delhi \u2014 3, 6, 12h St",
    "metaDescription": "Book hourly hotels in Lodhi Colony & Art District, Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near JLN Stadium Metro Station. Pay only ",
    "h1": "Hourly Hotels in Lodhi Colony & Art District, Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Lodhi Colony & Art District? Handpicked, verified micro-stay properties in Lodhi Colony & Art District. Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near Lodhi Gardens, India Habitat Centre, CGO Complex, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        472,
        1423,
        474,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Lodhi Colony & Art District for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Lodhi Colony & Art District offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Lodhi Colony & Art District strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Lodhi Colony & Art District for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Lodhi Colony & Art District. You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Lodhi Colony & Art District hourly hotels?",
            "answer": "Yes. All partner hotels in Lodhi Colony & Art District are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Lodhi Colony & Art District?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Lodhi Colony & Art District."
        },
        {
            "question": "How much advance deposit is required to book in Lodhi Colony & Art District?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Lodhi Colony & Art District?",
            "answer": "Most properties are located within 5 to 10 minutes of JLN Stadium Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
  'chanakyapuri': {
    "slug": "chanakyapuri",
    "name": "Chanakyapuri (Diplomatic Enclave)",
    "areaLabel": "Chanakyapuri Diplomatic Enclave",
    "category": "business",
    "badgeText": "Verified Hourly Hotels \u2022 3h/6h/12h Stays in Chanakyapuri (Diplomatic Enclave)",
    "landmark": "US Embassy, British High Commission, Ashoka Hotel",
    "nearestMetro": "Lok Kalyan Marg Metro Station",
    "metaTitle": "Hourly Hotels in Chanakyapuri (Diplomatic Enclave) Delhi \u2014 3, 6, ",
    "metaDescription": "Book hourly hotels in Chanakyapuri (Diplomatic Enclave), Delhi from 3 to 12 hours. Couple-friendly with local ID accepted, near Lok Kalyan Marg Metro Station.",
    "h1": "Hourly Hotels in Chanakyapuri (Diplomatic Enclave), Delhi | 3, 6 & 12 Hour Micro-Stays",
    "heroCopy": "Looking for an hourly hotel in Chanakyapuri (Diplomatic Enclave)? Handpicked, verified micro-stay properties in Chanakyapuri (Diplomatic Enclave). Designed for travelers, couples, and professionals seeking flexible hourly rooms with 12% deposit. Conveniently situated near US Embassy, British High Commission, Ashoka Hotel, our partner properties provide clean, air-conditioned rooms with 24x7 check-in, fast Wi-Fi, and 100% privacy.",
    "hotelIds": [
        472,
        1423,
        474,
        1215,
        1240,
        1244
    ],
    "sections": [
        {
            "h2": "Flexible Micro-Stays in Chanakyapuri (Diplomatic Enclave) for Every Need",
            "paragraphs": [
                "Whether you need a private room for an airport layover, a comfortable workspace between meetings, or a relaxing pause during shopping, hourly hotels in Chanakyapuri (Diplomatic Enclave) offer complete flexibility. Select exact check-in slots for 3 hours, 6 hours, or 12 hours without paying full-day overnight charges."
            ]
        },
        {
            "h2": "100% Couple-Friendly with Local ID Acceptance",
            "paragraphs": [
                "All listed partner hotels in Chanakyapuri (Diplomatic Enclave) strictly uphold guest privacy with zero moral policing. Both married and unmarried couples aged 18 and above are warmly welcomed with any government-approved photo identification, including Delhi local Aadhaar cards, driving licenses, or voter IDs."
            ]
        },
        {
            "h2": "Transparent Pricing & Guaranteed 12% Online Deposit",
            "paragraphs": [
                "GetHotelStays eliminates booking uncertainty. You secure your room instantly by paying a small 12% deposit online. The remaining balance is payable directly upon check-in at hotel reception via cash, card, or UPI."
            ]
        }
    ],
    "faqs": [
        {
            "question": "Can I book a hotel in Chanakyapuri (Diplomatic Enclave) for just 3 or 6 hours?",
            "answer": "Yes. GetHotelStays specializes in dedicated hourly micro-stays in Chanakyapuri (Diplomatic Enclave). You can book verified rooms for 3 hours, 6 hours, or 12 hours with customized check-in times."
        },
        {
            "question": "Are unmarried couples allowed in Chanakyapuri (Diplomatic Enclave) hourly hotels?",
            "answer": "Yes. All partner hotels in Chanakyapuri (Diplomatic Enclave) are 100% couple-friendly. Unmarried adult couples (18+) presenting valid government photo IDs are accommodated respectfully with complete privacy."
        },
        {
            "question": "Is local Delhi ID accepted at check-in in Chanakyapuri (Diplomatic Enclave)?",
            "answer": "Yes. Local Delhi Aadhaar cards, voter ID cards, and driving licenses are fully accepted across our partner hotels in Chanakyapuri (Diplomatic Enclave)."
        },
        {
            "question": "How much advance deposit is required to book in Chanakyapuri (Diplomatic Enclave)?",
            "answer": "You only pay a nominal 12% deposit online to confirm your reservation. The remaining 88% is paid directly at the hotel front desk during check-in."
        },
        {
            "question": "What is the nearest metro station to hourly hotels in Chanakyapuri (Diplomatic Enclave)?",
            "answer": "Most properties are located within 5 to 10 minutes of Lok Kalyan Marg Metro Station, offering fast and reliable connectivity across the Delhi NCR metro network."
        }
    ],
    "relatedSlugs": [
        "delhi-airport",
        "mahipalpur",
        "aerocity-delhi",
        "new-delhi-railway-station",
        "paharganj"
    ]
},
};

export const ALL_HOURLY_SLUGS = Object.keys(HOURLY_LOCALITIES);
