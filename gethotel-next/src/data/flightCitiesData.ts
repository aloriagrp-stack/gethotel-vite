export interface FlightRoute {
  to: string;
  toCode: string;
  price: string;
  duration: string;
  type: string;
  carriers: string[];
}

export interface CityFAQ {
  question: string;
  answer: string;
}

export interface FlightCityData {
  slug: string;
  name: string;
  iata: string;
  airportName: string;
  state: string;
  terminals: string;
  distanceFromCenter: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  routes: FlightRoute[];
  faqs: CityFAQ[];
}

export const FLIGHT_CITIES: FlightCityData[] = [
  {
    slug: "delhi",
    name: "Delhi",
    iata: "DEL",
    airportName: "Indira Gandhi International Airport",
    state: "Delhi NCR",
    terminals: "Terminal 1 (Domestic Low-Cost), Terminal 2 (Domestic), Terminal 3 (International & Full Service Domestic)",
    distanceFromCenter: "16 km from Connaught Place via Airport Express Metro line",
    metaTitle: "Cheap Flights from Delhi (DEL): Air Tickets & Booking | GetHotelStays",
    metaDescription: "Compare cheap flights from Delhi (DEL) to Mumbai, Bengaluru, Goa & more. Search 100+ airlines for lowest airfare, zero hidden fees & instant PNR on GetHotelStays.",
    keywords: [
      "Delhi to Mumbai flights", "Delhi to Bengaluru flights", "Delhi to Hyderabad flights", "Delhi to Kolkata flights",
      "Delhi to Pune flights", "Delhi to Chennai flights", "Delhi to Ahmedabad flights", "Delhi to Goa flights",
      "cheap flights from Delhi", "flight tickets from Delhi", "book flights from Delhi", "air tickets from Delhi"
    ],
    routes: [
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India", "Akasa Air"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,799", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,999", duration: "2h 10m", type: "Direct", carriers: ["Air India", "IndiGo"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,699", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,199", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,799", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Goa", toCode: "GOI", price: "₹3,899", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "How do I find the cheapest flights departing from Delhi (DEL)?",
        answer: "To book the lowest airfares from Delhi, search on GetHotelStays where our metasearch engine scans 100+ airlines in real time. We recommend booking domestic tickets 3 to 4 weeks prior to travel and flying on Tuesday or Wednesday for maximum discounts."
      },
      {
        question: "Which terminal does my domestic flight fly from at Delhi Airport?",
        answer: "IndiGo flights operate across Terminal 1, Terminal 2, and Terminal 3 depending on flight number. Air India and Vistara operate exclusively from Terminal 3, while Akasa Air operates from Terminal 2."
      },
      {
        question: "How far in advance should I reach Delhi Airport for flight departure?",
        answer: "For domestic departures from DEL, arrive at least 2 hours prior to scheduled departure. For international flights, arrive 3 hours before departure to complete check-in and immigration."
      },
      {
        question: "Can I book hourly layover hotel rooms near Delhi Airport?",
        answer: "Yes, GetHotelStays offers verified 3, 6, and 12-hour hourly hotels in Aerocity and Mahipalpur, just 5-10 minutes from Terminal 3, 2, and 1 at up to 70% off overnight rates."
      }
    ]
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    iata: "BOM",
    airportName: "Chhatrapati Shivaji Maharaj International Airport",
    state: "Maharashtra",
    terminals: "Terminal 1 (Domestic Chhatrapati Shivaji, Santacruz), Terminal 2 (Integrated International & Domestic, Sahar)",
    distanceFromCenter: "28 km from South Mumbai (Colaba) via Western Express Highway & Coastal Road",
    metaTitle: "Cheap Flights from Mumbai (BOM): Air Tickets & Booking | GetHotelStays",
    metaDescription: "Compare & book cheap flights from Mumbai (BOM) to Delhi, Bengaluru, Goa & Chennai. Real-time airfare comparison across 100+ airlines on GetHotelStays.",
    keywords: [
      "Mumbai to Delhi flights", "Mumbai to Bengaluru flights", "Mumbai to Goa flights", "Mumbai to Chennai flights",
      "Mumbai to Hyderabad flights", "Mumbai to Ahmedabad flights", "Mumbai to Kolkata flights", "Mumbai to Pune flights",
      "cheap flights from Mumbai", "flight tickets from Mumbai", "book flights from Mumbai", "air tickets from Mumbai"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India", "Akasa Air"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,699", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Goa", toCode: "GOI", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,299", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,999", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,199", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,499", duration: "0h 55m", type: "Connecting", carriers: ["Air India", "IndiGo"] }
    ],
    faqs: [
      {
        question: "Which airlines offer the cheapest flights from Mumbai (BOM)?",
        answer: "IndiGo and Akasa Air frequently offer the lowest base airfares on major domestic trunk routes from Mumbai (BOM), while Air India provides complimentary checked baggage and hot meals."
      },
      {
        question: "How do I travel between Terminal 1 and Terminal 2 at Mumbai Airport?",
        answer: "T1 (Santacruz) and T2 (Sahar) are approximately 5 km apart. Free inter-terminal shuttle buses operate round the clock for valid transit ticket holders, or prepaid taxis and auto-rickshaws are available."
      },
      {
        question: "Are there budget hotels near Mumbai Airport for layovers?",
        answer: "Yes, GetHotelStays lists hundreds of verified properties in Andheri East, Vile Parle, and Sakinaka near Mumbai T2, including flexible 3 and 6-hour hourly rooms."
      }
    ]
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    iata: "BLR",
    airportName: "Kempegowda International Airport",
    state: "Karnataka",
    terminals: "Terminal 1 (Domestic Flights), Terminal 2 (Award-Winning Garden Terminal for International & Select Domestic)",
    distanceFromCenter: "35 km from MG Road & Majestic via NH 44 (Bellary Road)",
    metaTitle: "Cheap Flights from Bengaluru (BLR): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Bengaluru (BLR) to Delhi, Mumbai, Kolkata, Goa & Kochi. Compare 100+ airline ticket prices instantly with GetHotelStays.",
    keywords: [
      "Bengaluru to Delhi flights", "Bengaluru to Mumbai flights", "Bengaluru to Kolkata flights", "Bengaluru to Hyderabad flights",
      "Bengaluru to Pune flights", "Bengaluru to Chennai flights", "Bengaluru to Kochi flights", "Bengaluru to Ahmedabad flights",
      "cheap flights from Bengaluru", "flight tickets from Bengaluru", "book flights from Bengaluru", "air tickets from Bengaluru"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,699", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,499", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹1,899", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,799", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Chennai", toCode: "MAA", price: "₹1,999", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] }
    ],
    faqs: [
      {
        question: "How do I reach Kempegowda Airport (BLR) from central Bangalore?",
        answer: "The BMTC Vayu Vajra luxury Volvo AC buses operate 24/7 from all major Bangalore hubs (Majestic, Whitefield, Electronic City, HSR Layout). App-based cabs (Uber/Ola) and airport taxis are also available via Bellary Road."
      },
      {
        question: "Which airlines operate from Terminal 2 at Bangalore Airport?",
        answer: "Terminal 2 handles all international flights along with domestic departures for Air India, Vistara, and select premium routes, while IndiGo primarily operates from Terminal 1."
      },
      {
        question: "What is the cheapest day to fly out of Bengaluru?",
        answer: "Mid-week flights (Tuesdays and Wednesdays) generally have up to 20% lower airfares on routes to Delhi, Mumbai, and Kolkata compared to Friday evenings and Monday mornings."
      }
    ]
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    iata: "HYD",
    airportName: "Rajiv Gandhi International Airport",
    state: "Telangana",
    terminals: "Integrated Domestic & International Passenger Terminal, Shamshabad",
    distanceFromCenter: "24 km south of Hyderabad via PV Narasimha Rao Expressway",
    metaTitle: "Cheap Flights from Hyderabad (HYD): Airfare Booking | GetHotelStays",
    metaDescription: "Book cheap flights from Hyderabad (HYD) to Delhi, Mumbai, Bengaluru & Chennai. Compare live fares from IndiGo, Air India & more on GetHotelStays.",
    keywords: [
      "Hyderabad to Delhi flights", "Hyderabad to Mumbai flights", "Hyderabad to Bengaluru flights", "Hyderabad to Chennai flights",
      "Hyderabad to Kolkata flights", "Hyderabad to Pune flights", "Hyderabad to Kochi flights", "Hyderabad to Ahmedabad flights",
      "cheap flights from Hyderabad", "flight tickets from Hyderabad", "book flights from Hyderabad", "air tickets from Hyderabad"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,799", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹1,899", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,399", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Kochi", toCode: "COK", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] }
    ],
    faqs: [
      {
        question: "How to reach Rajiv Gandhi International Airport from Secunderabad or Hitec City?",
        answer: "Pushpak Airport Liner AC buses run on scheduled intervals from Secunderabad, Hitec City, and Charminar. The PVNR Expressway provides quick 35-minute car connectivity from the city center."
      },
      {
        question: "What direct international flights operate from Hyderabad (HYD)?",
        answer: "HYD has direct flights to Dubai, Abu Dhabi, Doha, Singapore, London Heathrow, Kuwait, and Sharjah operated by Emirates, Qatar Airways, British Airways, and IndiGo."
      }
    ]
  },
  {
    slug: "chennai",
    name: "Chennai",
    iata: "MAA",
    airportName: "Chennai International Airport",
    state: "Tamil Nadu",
    terminals: "Terminal 1 (Kamaraj Domestic Terminal), Terminal 2 & 4 (Anna International Terminal), Meenambakkam",
    distanceFromCenter: "18 km southwest of Chennai city center with direct Metro connectivity",
    metaTitle: "Cheap Flights from Chennai (MAA): Air Tickets & Booking | GetHotelStays",
    metaDescription: "Compare airfares & book cheap flights from Chennai (MAA) to Delhi, Mumbai, Bengaluru, Port Blair & Kochi. Instant e-ticket on GetHotelStays.",
    keywords: [
      "Chennai to Delhi flights", "Chennai to Mumbai flights", "Chennai to Bengaluru flights", "Chennai to Hyderabad flights",
      "Chennai to Kolkata flights", "Chennai to Pune flights", "Chennai to Kochi flights", "Chennai to Coimbatore flights",
      "cheap flights from Chennai", "flight tickets from Chennai", "book flights from Chennai", "air tickets from Chennai"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹4,199", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,299", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹1,999", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,699", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,999", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Kochi", toCode: "COK", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Coimbatore", toCode: "CJB", price: "₹1,899", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Does Chennai Airport have direct metro station connectivity?",
        answer: "Yes, Chennai Airport Metro Station is connected directly to the passenger terminals via a covered walkway with travelators, linking travelers to Chennai Central and Chennai Egmore in 30 minutes."
      },
      {
        question: "Which are the most popular domestic routes from Chennai?",
        answer: "Delhi, Mumbai, Bengaluru, and Port Blair (Andaman) are the highest volume flight routes originating from Chennai International Airport."
      }
    ]
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    iata: "CCU",
    airportName: "Netaji Subhash Chandra Bose International Airport",
    state: "West Bengal",
    terminals: "Integrated L-shaped Passenger Terminal (Domestic & International), Dum Dum",
    distanceFromCenter: "17 km northeast of Kolkata city center (Esplanade)",
    metaTitle: "Cheap Flights from Kolkata (CCU): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Kolkata (CCU) to Delhi, Mumbai, Bengaluru, Guwahati & Bagdogra. Compare 100+ airlines with instant confirmation on GetHotelStays.",
    keywords: [
      "Kolkata to Delhi flights", "Kolkata to Mumbai flights", "Kolkata to Bengaluru flights", "Kolkata to Hyderabad flights",
      "Kolkata to Chennai flights", "Kolkata to Guwahati flights", "Kolkata to Bagdogra flights", "Kolkata to Bhubaneswar flights",
      "cheap flights from Kolkata", "flight tickets from Kolkata", "book flights from Kolkata", "air tickets from Kolkata"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,999", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,199", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,499", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,699", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Guwahati", toCode: "GAU", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bagdogra", toCode: "IXB", price: "₹1,999", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Bhubaneswar", toCode: "BBI", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Kolkata the main flight hub for North East India?",
        answer: "Yes, CCU serves as India's primary aviation gateway to North East destinations including Guwahati, Agartala, Imphal, Dibrugarh, and Silchar with multiple daily direct flights."
      },
      {
        question: "How do I travel from Kolkata Airport to Howrah Railway Station?",
        answer: "AC Volvo airport express buses (V1 route), prepaid yellow taxis, and app cabs run directly from the arrival zone to Howrah Railway Station (approx. 45-60 mins)."
      }
    ]
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    iata: "AMD",
    airportName: "Sardar Vallabhbhai Patel International Airport",
    state: "Gujarat",
    terminals: "Terminal 1 (Domestic), Terminal 2 (International & Select Domestic), Hansol",
    distanceFromCenter: "9 km north of Ahmedabad city center and 15 km from Gandhinagar",
    metaTitle: "Cheap Flights from Ahmedabad (AMD): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Ahmedabad (AMD) to Delhi, Mumbai, Bengaluru, Goa & Pune. Instant e-tickets and lowest airfares on GetHotelStays.",
    keywords: [
      "Ahmedabad to Delhi flights", "Ahmedabad to Mumbai flights", "Ahmedabad to Bengaluru flights", "Ahmedabad to Hyderabad flights",
      "Ahmedabad to Chennai flights", "Ahmedabad to Kolkata flights", "Ahmedabad to Pune flights", "Ahmedabad to Goa flights",
      "cheap flights from Ahmedabad", "flight tickets from Ahmedabad", "book flights from Ahmedabad", "air tickets from Ahmedabad"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,799", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Mumbai", toCode: "BOM", price: "₹1,999", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,699", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,999", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Goa", toCode: "GOI", price: "₹2,999", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] }
    ],
    faqs: [
      {
        question: "How long does a direct flight from Ahmedabad to Mumbai or Delhi take?",
        answer: "A direct flight from Ahmedabad (AMD) to Mumbai takes approximately 1 hour 15 minutes, while flying to Delhi takes around 1 hour 35 minutes."
      },
      {
        question: "What international destinations can I fly to from Ahmedabad?",
        answer: "AMD offers direct international connectivity to London Gatwick, Dubai, Abu Dhabi, Singapore, Kuwait, and Jeddah via Air India, Emirates, and Singapore Airlines."
      }
    ]
  },
  {
    slug: "kochi",
    name: "Kochi",
    iata: "COK",
    airportName: "Cochin International Airport",
    state: "Kerala",
    terminals: "Terminal 1 (Domestic), Terminal 3 (International Kerala Architecture Hub), Nedumbassery",
    distanceFromCenter: "28 km northeast of Kochi city center (Ernakulam)",
    metaTitle: "Cheap Flights from Kochi (COK): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Kochi (COK) to Delhi, Mumbai, Bengaluru, Chennai & Dubai. Search 100+ airlines for lowest fares on GetHotelStays.",
    keywords: [
      "Kochi to Delhi flights", "Kochi to Mumbai flights", "Kochi to Bengaluru flights", "Kochi to Chennai flights",
      "Kochi to Hyderabad flights", "Kochi to Kolkata flights", "Kochi to Pune flights", "Kochi to Ahmedabad flights",
      "cheap flights from Kochi", "flight tickets from Kochi", "book flights from Kochi", "air tickets from Kochi"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹4,699", duration: "3h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,999", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,999", duration: "3h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,199", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,899", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Cochin International Airport the world's first fully solar-powered airport?",
        answer: "Yes, Cochin International Airport (COK) operates 100% on solar power and is an internationally acclaimed green aviation hub."
      },
      {
        question: "How do I travel from Kochi Airport to Fort Kochi or Munnar?",
        answer: "KSRTC low-floor AC buses connect the airport to Fort Kochi and Ernakulam. Pre-booked taxis to tourist destinations like Munnar (4 hrs) and Alleppey (2.5 hrs) are available at arrivals."
      }
    ]
  },
  {
    slug: "pune",
    name: "Pune",
    iata: "PNQ",
    airportName: "Pune International Airport",
    state: "Maharashtra",
    terminals: "New Integrated Terminal Building (NITB), Lohegaon",
    distanceFromCenter: "10 km northeast of Pune Central Railway Station",
    metaTitle: "Cheap Flights from Pune (PNQ): Air Tickets & Booking | GetHotelStays",
    metaDescription: "Compare cheap flights from Pune (PNQ) to Delhi, Bengaluru, Goa, Hyderabad & Kolkata. Best airfare deals guaranteed on GetHotelStays.",
    keywords: [
      "Pune to Delhi flights", "Pune to Mumbai flights", "Pune to Bengaluru flights", "Pune to Hyderabad flights",
      "Pune to Chennai flights", "Pune to Kolkata flights", "Pune to Kochi flights", "Pune to Ahmedabad flights",
      "cheap flights from Pune", "flight tickets from Pune", "book flights from Pune", "air tickets from Pune"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,699", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,499", duration: "0h 55m", type: "Connecting", carriers: ["Air India", "IndiGo"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,799", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,399", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,999", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,299", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹3,199", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "What is the new integrated terminal at Pune Airport like?",
        answer: "The New Integrated Terminal Building (NITB) at Pune Airport offers modern passenger amenities, 10 aerobridges, expanded check-in bays, and faster security processing."
      },
      {
        question: "Which are the shortest direct flights from Pune?",
        answer: "Direct flights to Ahmedabad (1h 15m), Hyderabad (1h 15m), and Bengaluru (1h 25m) are the fastest flight routes departing from Pune Airport."
      }
    ]
  },
  {
    slug: "goa",
    name: "Goa",
    iata: "GOI",
    airportName: "Dabolim Airport & Manohar International Airport (MOPA)",
    state: "Goa",
    terminals: "GOI (Dabolim - South Goa), GOX (Manohar International - Mopa, North Goa)",
    distanceFromCenter: "Dabolim is 28 km from Panaji; MOPA is 35 km from Panaji near North Goa beaches",
    metaTitle: "Cheap Flights from Goa (GOI/GOX): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Goa to Mumbai, Delhi, Bengaluru, Hyderabad & Chennai. Compare flights from Dabolim & Mopa airports on GetHotelStays.",
    keywords: [
      "Goa to Delhi flights", "Goa to Mumbai flights", "Goa to Bengaluru flights", "Goa to Hyderabad flights",
      "Goa to Chennai flights", "Goa to Kolkata flights", "Goa to Pune flights", "Goa to Ahmedabad flights",
      "cheap flights from Goa", "flight tickets from Goa", "book flights from Goa", "air tickets from Goa"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,899", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "SpiceJet", "Akasa Air"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,399", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,999", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,699", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,499", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] }
    ],
    faqs: [
      {
        question: "Which Goa airport should I book: Dabolim (GOI) or Mopa (GOX)?",
        answer: "If you are staying in North Goa (Calangute, Baga, Anjuna, Morjim, Arambol), Mopa (GOX) is closer (30-45 mins). For South Goa (Colva, Benaulim, Palolem) or central Panaji, Dabolim (GOI) is closer."
      },
      {
        question: "How far in advance should I book flights from Goa during peak season?",
        answer: "For travel between November and January (Sunburn, Christmas, New Year), book at least 6 to 8 weeks in advance on GetHotelStays to avoid surge pricing."
      }
    ]
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    iata: "JAI",
    airportName: "Jaipur International Airport",
    state: "Rajasthan",
    terminals: "Terminal 2 (Domestic & International Hub), Sanganer",
    distanceFromCenter: "13 km south of Jaipur city center",
    metaTitle: "Cheap Flights from Jaipur (JAI): Air Tickets | GetHotelStays",
    metaDescription: "Book cheap flights from Jaipur (JAI) to Delhi, Mumbai, Bengaluru, Hyderabad & Goa. Real-time airfare comparison on GetHotelStays.",
    keywords: [
      "Jaipur to Delhi flights", "Jaipur to Mumbai flights", "Jaipur to Bengaluru flights", "Jaipur to Hyderabad flights",
      "Jaipur to Chennai flights", "Jaipur to Kolkata flights", "Jaipur to Pune flights", "Jaipur to Ahmedabad flights",
      "cheap flights from Jaipur", "flight tickets from Jaipur", "book flights from Jaipur", "air tickets from Jaipur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,199", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,299", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,999", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,899", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,299", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "Which airlines fly direct from Jaipur to Mumbai and Delhi?",
        answer: "IndiGo, Air India, and SpiceJet operate multiple daily direct flights from Jaipur to Mumbai (1h 45m) and Delhi (55 mins)."
      },
      {
        question: "Can I take international flights directly from Jaipur Airport?",
        answer: "Yes, Jaipur has direct flights to Dubai, Sharjah, Muscat, and Bangkok operated by Air Arabia, Air India Express, and SalamAir."
      }
    ]
  },
  {
    slug: "lucknow",
    name: "Lucknow",
    iata: "LKO",
    airportName: "Chaudhary Charan Singh International Airport",
    state: "Uttar Pradesh",
    terminals: "Terminal 3 (Integrated International & Domestic), Amausi",
    distanceFromCenter: "14 km southwest of Lucknow city center with direct Metro connection",
    metaTitle: "Cheap Flights from Lucknow (LKO): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Lucknow (LKO) to Delhi, Mumbai, Bengaluru, Hyderabad & Dubai. Compare 100+ airlines on GetHotelStays.",
    keywords: [
      "Lucknow to Delhi flights", "Lucknow to Mumbai flights", "Lucknow to Bengaluru flights", "Lucknow to Hyderabad flights",
      "Lucknow to Chennai flights", "Lucknow to Kolkata flights", "Lucknow to Pune flights", "Lucknow to Ahmedabad flights",
      "cheap flights from Lucknow", "flight tickets from Lucknow", "book flights from Lucknow", "air tickets from Lucknow"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,199", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,999", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,799", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Akasa Air"] }
    ],
    faqs: [
      {
        question: "Is Lucknow Airport connected to the city via metro?",
        answer: "Yes, the CCS Airport Metro Station connects directly to Charbagh Railway Station and Hazratganj in approximately 20 minutes."
      },
      {
        question: "What international flights depart from Lucknow Airport?",
        answer: "Lucknow has high-frequency direct flights to Dubai, Riyadh, Jeddah, Dammam, and Muscat operated by flydubai, Flynas, and Air India Express."
      }
    ]
  },
  {
    slug: "guwahati",
    name: "Guwahati",
    iata: "GAU",
    airportName: "Lokpriya Gopinath Bordoloi International Airport",
    state: "Assam",
    terminals: "Main Integrated Passenger Terminal, Borjhar",
    distanceFromCenter: "26 km west of Guwahati city center",
    metaTitle: "Cheap Flights from Guwahati (GAU): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Guwahati (GAU) to Kolkata, Delhi, Bengaluru & Mumbai. Lowest airfare guaranteed on GetHotelStays.",
    keywords: [
      "Guwahati to Kolkata flights", "Guwahati to Delhi flights", "Guwahati to Mumbai flights", "Guwahati to Bengaluru flights",
      "Guwahati to Hyderabad flights", "Guwahati to Chennai flights", "Guwahati to Agartala flights", "Guwahati to Imphal flights",
      "cheap flights from Guwahati", "flight tickets from Guwahati", "book flights from Guwahati", "air tickets from Guwahati"
    ],
    routes: [
      { to: "Kolkata", toCode: "CCU", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,199", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,999", duration: "3h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,899", duration: "3h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,599", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Agartala", toCode: "IXA", price: "₹1,899", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Imphal", toCode: "IMF", price: "₹1,999", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Guwahati Airport the hub for regional North East travel?",
        answer: "Yes, GAU connects all seven sister states with daily direct flights to Agartala, Imphal, Dibrugarh, Silchar, Dimapur, and Aizawl."
      },
      {
        question: "How long does a flight from Guwahati to Delhi or Kolkata take?",
        answer: "Flights to Kolkata take about 1h 15m, while non-stop flights to Delhi take approximately 2h 30m."
      }
    ]
  },
  {
    slug: "thiruvananthapuram",
    name: "Thiruvananthapuram",
    iata: "TRV",
    airportName: "Thiruvananthapuram International Airport",
    state: "Kerala",
    terminals: "Terminal 1 (Domestic, Shankumugham), Terminal 2 (International, Chackai)",
    distanceFromCenter: "4 km from city center and railway station; 16 km from Kovalam Beach",
    metaTitle: "Cheap Flights from Thiruvananthapuram (TRV) | GetHotelStays",
    metaDescription: "Book cheap flights from Thiruvananthapuram (TRV) to Delhi, Mumbai, Bengaluru & Gulf. Instant e-tickets on GetHotelStays.",
    keywords: [
      "Thiruvananthapuram to Delhi flights", "Thiruvananthapuram to Mumbai flights", "Thiruvananthapuram to Bengaluru flights", "Thiruvananthapuram to Chennai flights",
      "Thiruvananthapuram to Hyderabad flights", "Thiruvananthapuram to Kolkata flights", "Thiruvananthapuram to Kochi flights", "Thiruvananthapuram to Pune flights",
      "cheap flights from Thiruvananthapuram", "flight tickets from Thiruvananthapuram", "book flights from Thiruvananthapuram", "air tickets from Thiruvananthapuram"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹4,999", duration: "3h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,399", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹5,199", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹1,899", duration: "0h 45m", type: "Direct", carriers: ["IndiGo", "Alliance Air"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How close is Thiruvananthapuram Airport to Kovalam Beach?",
        answer: "TRV is located just 16 km from Kovalam Beach, making it one of India's closest international airports to a major beach resort destination."
      }
    ]
  },
  {
    slug: "bhubaneswar",
    name: "Bhubaneswar",
    iata: "BBI",
    airportName: "Biju Patnaik International Airport",
    state: "Odisha",
    terminals: "Terminal 1 (Domestic), Terminal 2 (International)",
    distanceFromCenter: "4 km southwest of Bhubaneswar Railway Station",
    metaTitle: "Cheap Flights from Bhubaneswar (BBI): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Bhubaneswar (BBI) to Delhi, Mumbai, Bengaluru, Hyderabad & Kolkata. Compare 100+ airlines on GetHotelStays.",
    keywords: [
      "Bhubaneswar to Delhi flights", "Bhubaneswar to Mumbai flights", "Bhubaneswar to Bengaluru flights", "Bhubaneswar to Hyderabad flights",
      "Bhubaneswar to Chennai flights", "Bhubaneswar to Kolkata flights", "Bhubaneswar to Pune flights", "Bhubaneswar to Kochi flights",
      "cheap flights from Bhubaneswar", "flight tickets from Bhubaneswar", "book flights from Bhubaneswar", "air tickets from Bhubaneswar"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,899", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,699", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹3,999", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long does a flight from Bhubaneswar to Kolkata take?",
        answer: "A direct flight from Bhubaneswar (BBI) to Kolkata (CCU) takes only 55 minutes, with multiple daily connections."
      }
    ]
  },
  {
    slug: "srinagar",
    name: "Srinagar",
    iata: "SXR",
    airportName: "Sheikh ul-Alam International Airport",
    state: "Jammu & Kashmir",
    terminals: "Main Domestic Passenger Terminal, Budgam",
    distanceFromCenter: "12 km south of Srinagar center and Dal Lake",
    metaTitle: "Cheap Flights from Srinagar (SXR): Airfare Booking | GetHotelStays",
    metaDescription: "Compare cheap flights from Srinagar (SXR) to Delhi, Mumbai, Bengaluru, Chandigarh & Jammu. Best rates on GetHotelStays.",
    keywords: [
      "Srinagar to Delhi flights", "Srinagar to Mumbai flights", "Srinagar to Bengaluru flights", "Srinagar to Hyderabad flights",
      "Srinagar to Chennai flights", "Srinagar to Kolkata flights", "Srinagar to Pune flights", "Srinagar to Ahmedabad flights",
      "cheap flights from Srinagar", "flight tickets from Srinagar", "book flights from Srinagar", "air tickets from Srinagar"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹3,299", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "SpiceJet", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,699", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,499", duration: "3h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,899", duration: "3h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹5,299", duration: "3h 40m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,999", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹4,799", duration: "2h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹4,299", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "How early should I reach Srinagar Airport for departure?",
        answer: "Due to rigorous multi-tier security checks on the airport approach road, travelers should reach Srinagar Airport at least 2.5 to 3 hours prior to scheduled departure."
      }
    ]
  },
  {
    slug: "chandigarh",
    name: "Chandigarh",
    iata: "IXC",
    airportName: "Shaheed Bhagat Singh International Airport",
    state: "Punjab / Haryana",
    terminals: "Eco-friendly Integrated Passenger Terminal, Mohali",
    distanceFromCenter: "13 km south of Sector 17 City Centre",
    metaTitle: "Cheap Flights from Chandigarh (IXC) | GetHotelStays",
    metaDescription: "Find cheap flights from Chandigarh (IXC) to Delhi, Mumbai, Bengaluru, Goa & Dubai. Compare airfares on GetHotelStays.",
    keywords: [
      "Chandigarh to Delhi flights", "Chandigarh to Mumbai flights", "Chandigarh to Bengaluru flights", "Chandigarh to Hyderabad flights",
      "Chandigarh to Chennai flights", "Chandigarh to Kolkata flights", "Chandigarh to Pune flights", "Chandigarh to Goa flights",
      "cheap flights from Chandigarh", "flight tickets from Chandigarh", "book flights from Chandigarh", "air tickets from Chandigarh"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,799", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,299", duration: "2h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,199", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,899", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Goa", toCode: "GOI", price: "₹3,999", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "Does Chandigarh Airport offer international flights?",
        answer: "Yes, IXC operates direct international flights to Dubai and Sharjah via IndiGo and Air India Express."
      }
    ]
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    iata: "VNS",
    airportName: "Lal Bahadur Shastri International Airport",
    state: "Uttar Pradesh",
    terminals: "Integrated Passenger Terminal, Babatpur",
    distanceFromCenter: "26 km northwest of Varanasi Ghats and Kashi Vishwanath Temple",
    metaTitle: "Cheap Flights from Varanasi (VNS): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Varanasi (VNS) to Delhi, Mumbai, Bengaluru, Hyderabad & Kolkata on GetHotelStays.",
    keywords: [
      "Varanasi to Delhi flights", "Varanasi to Mumbai flights", "Varanasi to Bengaluru flights", "Varanasi to Hyderabad flights",
      "Varanasi to Chennai flights", "Varanasi to Kolkata flights", "Varanasi to Pune flights", "Varanasi to Ahmedabad flights",
      "cheap flights from Varanasi", "flight tickets from Varanasi", "book flights from Varanasi", "air tickets from Varanasi"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,299", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,999", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,299", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,499", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,899", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "How long does a flight from Varanasi to Delhi take?",
        answer: "A non-stop flight from Varanasi (VNS) to Delhi (DEL) takes about 1h 25m with multiple departures daily."
      }
    ]
  },
  {
    slug: "patna",
    name: "Patna",
    iata: "PAT",
    airportName: "Jayprakash Narayan Airport",
    state: "Bihar",
    terminals: "Main Domestic Terminal, Sheikhpura",
    distanceFromCenter: "5 km southwest of Patna Junction Railway Station",
    metaTitle: "Cheap Flights from Patna (PAT): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Patna (PAT) to Delhi, Mumbai, Bengaluru, Kolkata & Hyderabad. Lowest fares on GetHotelStays.",
    keywords: [
      "Patna to Delhi flights", "Patna to Mumbai flights", "Patna to Bengaluru flights", "Patna to Hyderabad flights",
      "Patna to Chennai flights", "Patna to Kolkata flights", "Patna to Pune flights", "Patna to Ahmedabad flights",
      "cheap flights from Patna", "flight tickets from Patna", "book flights from Patna", "air tickets from Patna"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,499", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,899", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,699", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,999", duration: "2h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,199", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,799", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "Which are the most frequent routes departing from Patna Airport?",
        answer: "Delhi (DEL) and Kolkata (CCU) have the highest flight frequencies from Jayprakash Narayan Airport in Patna."
      }
    ]
  },
  {
    slug: "indore",
    name: "Indore",
    iata: "IDR",
    airportName: "Devi Ahilyabai Holkar Airport",
    state: "Madhya Pradesh",
    terminals: "Integrated Passenger Terminal, Depalpur Road",
    distanceFromCenter: "8 km west of Indore city center",
    metaTitle: "Cheap Flights from Indore (IDR): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Indore (IDR) to Delhi, Mumbai, Bengaluru, Goa & Hyderabad on GetHotelStays.",
    keywords: [
      "Indore to Delhi flights", "Indore to Mumbai flights", "Indore to Bengaluru flights", "Indore to Hyderabad flights",
      "Indore to Chennai flights", "Indore to Kolkata flights", "Indore to Pune flights", "Indore to Ahmedabad flights",
      "cheap flights from Indore", "flight tickets from Indore", "book flights from Indore", "air tickets from Indore"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,399", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,199", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,799", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,699", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,799", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹1,999", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,899", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Does Devi Ahilyabai Holkar Airport have international flights?",
        answer: "Yes, Indore has direct flights to Dubai operated weekly by Air India."
      }
    ]
  },
  {
    slug: "nagpur",
    name: "Nagpur",
    iata: "NAG",
    airportName: "Dr. Babasaheb Ambedkar International Airport",
    state: "Maharashtra",
    terminals: "Main Integrated Passenger Terminal, Sonegaon",
    distanceFromCenter: "8 km south of Nagpur city center with Metro connectivity",
    metaTitle: "Cheap Flights from Nagpur (NAG): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Nagpur (NAG) to Delhi, Mumbai, Bengaluru, Pune & Kolkata on GetHotelStays.",
    keywords: [
      "Nagpur to Delhi flights", "Nagpur to Mumbai flights", "Nagpur to Bengaluru flights", "Nagpur to Hyderabad flights",
      "Nagpur to Chennai flights", "Nagpur to Kolkata flights", "Nagpur to Pune flights", "Nagpur to Ahmedabad flights",
      "cheap flights from Nagpur", "flight tickets from Nagpur", "book flights from Nagpur", "air tickets from Nagpur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,499", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,299", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,199", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Nagpur Airport connected by Nagpur Metro?",
        answer: "Yes, Airport South Metro Station on the Orange Line is situated right outside the passenger terminal building."
      }
    ]
  },
  {
    slug: "coimbatore",
    name: "Coimbatore",
    iata: "CJB",
    airportName: "Coimbatore International Airport",
    state: "Tamil Nadu",
    terminals: "Single Integrated Passenger Terminal, Peelamedu",
    distanceFromCenter: "10 km east of Coimbatore Railway Station",
    metaTitle: "Cheap Flights from Coimbatore (CJB) | GetHotelStays",
    metaDescription: "Book cheap flights from Coimbatore (CJB) to Chennai, Bengaluru, Delhi & Mumbai. Best airfare deals on GetHotelStays.",
    keywords: [
      "Coimbatore to Chennai flights", "Coimbatore to Bengaluru flights", "Coimbatore to Delhi flights", "Coimbatore to Mumbai flights",
      "Coimbatore to Hyderabad flights", "Coimbatore to Kolkata flights", "Coimbatore to Pune flights", "Coimbatore to Kochi flights",
      "cheap flights from Coimbatore", "flight tickets from Coimbatore", "book flights from Coimbatore", "air tickets from Coimbatore"
    ],
    routes: [
      { to: "Chennai", toCode: "MAA", price: "₹1,899", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹1,999", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,499", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,299", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,699", duration: "2h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,299", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹1,799", duration: "0h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long does a flight from Coimbatore to Chennai or Bengaluru take?",
        answer: "Direct flights to Chennai and Bengaluru both take less than 1 hour."
      }
    ]
  },
  {
    slug: "visakhapatnam",
    name: "Visakhapatnam",
    iata: "VTZ",
    airportName: "Visakhapatnam International Airport",
    state: "Andhra Pradesh",
    terminals: "Integrated Passenger Terminal, NAD Kotha Road",
    distanceFromCenter: "12 km from Visakhapatnam city center",
    metaTitle: "Cheap Flights from Visakhapatnam (VTZ) | GetHotelStays",
    metaDescription: "Find cheap flights from Visakhapatnam (VTZ) to Hyderabad, Bengaluru, Delhi & Mumbai on GetHotelStays.",
    keywords: [
      "Visakhapatnam to Hyderabad flights", "Visakhapatnam to Bengaluru flights", "Visakhapatnam to Delhi flights", "Visakhapatnam to Mumbai flights",
      "Visakhapatnam to Chennai flights", "Visakhapatnam to Kolkata flights", "Visakhapatnam to Pune flights", "Visakhapatnam to Ahmedabad flights",
      "cheap flights from Visakhapatnam", "flight tickets from Visakhapatnam", "book flights from Visakhapatnam", "air tickets from Visakhapatnam"
    ],
    routes: [
      { to: "Hyderabad", toCode: "HYD", price: "₹1,999", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹3,899", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,299", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,199", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,699", duration: "2h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "What is the fastest flight route from Visakhapatnam?",
        answer: "Visakhapatnam to Hyderabad (1h 10m) is the most frequent and fastest route departing from VTZ."
      }
    ]
  },
  {
    slug: "amritsar",
    name: "Amritsar",
    iata: "ATQ",
    airportName: "Sri Guru Ram Dass Jee International Airport",
    state: "Punjab",
    terminals: "Integrated Passenger Terminal, Rajasansi",
    distanceFromCenter: "11 km northwest of Golden Temple & Amritsar city center",
    metaTitle: "Cheap Flights from Amritsar (ATQ): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Amritsar (ATQ) to Delhi, Mumbai, Bengaluru, Dubai & London on GetHotelStays.",
    keywords: [
      "Amritsar to Delhi flights", "Amritsar to Mumbai flights", "Amritsar to Bengaluru flights", "Amritsar to Hyderabad flights",
      "Amritsar to Chennai flights", "Amritsar to Kolkata flights", "Amritsar to Pune flights", "Amritsar to Ahmedabad flights",
      "cheap flights from Amritsar", "flight tickets from Amritsar", "book flights from Amritsar", "air tickets from Amritsar"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,899", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,699", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,699", duration: "3h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,999", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,499", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,999", duration: "2h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,699", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "Does Amritsar Airport have direct flights to the UK and Europe?",
        answer: "Yes, Air India operates direct flights from Amritsar to London Gatwick and Birmingham, catering to the large Punjabi diaspora."
      }
    ]
  },
  {
    slug: "dehradun",
    name: "Dehradun",
    iata: "DED",
    airportName: "Jolly Grant Airport",
    state: "Uttarakhand",
    terminals: "New Integrated Passenger Terminal, Rishikesh-Dehradun Road",
    distanceFromCenter: "25 km southeast of Dehradun and 20 km from Rishikesh",
    metaTitle: "Cheap Flights from Dehradun (DED): Air Tickets | GetHotelStays",
    metaDescription: "Book cheap flights from Dehradun (DED) to Delhi, Mumbai, Bengaluru, Lucknow & Hyderabad on GetHotelStays.",
    keywords: [
      "Dehradun to Delhi flights", "Dehradun to Mumbai flights", "Dehradun to Bengaluru flights", "Dehradun to Hyderabad flights",
      "Dehradun to Chennai flights", "Dehradun to Kolkata flights", "Dehradun to Pune flights", "Dehradun to Ahmedabad flights",
      "cheap flights from Dehradun", "flight tickets from Dehradun", "book flights from Dehradun", "air tickets from Dehradun"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,799", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,499", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,899", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,299", duration: "2h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,899", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "Is Dehradun Airport the best airport for Rishikesh and Haridwar?",
        answer: "Yes, Jolly Grant Airport is located only 20 km from Rishikesh and 35 km from Haridwar, making it the primary gateway for Char Dham pilgrims and yoga travelers."
      }
    ]
  },
  {
    slug: "ranchi",
    name: "Ranchi",
    iata: "IXR",
    airportName: "Birsa Munda Airport",
    state: "Jharkhand",
    terminals: "Integrated Passenger Terminal, Hinoo",
    distanceFromCenter: "5 km from Ranchi city center and railway station",
    metaTitle: "Cheap Flights from Ranchi (IXR): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Ranchi (IXR) to Delhi, Mumbai, Bengaluru, Kolkata & Hyderabad on GetHotelStays.",
    keywords: [
      "Ranchi to Delhi flights", "Ranchi to Mumbai flights", "Ranchi to Bengaluru flights", "Ranchi to Hyderabad flights",
      "Ranchi to Chennai flights", "Ranchi to Kolkata flights", "Ranchi to Pune flights", "Ranchi to Ahmedabad flights",
      "cheap flights from Ranchi", "flight tickets from Ranchi", "book flights from Ranchi", "air tickets from Ranchi"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,699", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,899", duration: "2h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,999", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,199", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹1,999", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long is the direct flight from Ranchi to Kolkata?",
        answer: "A direct flight from Birsa Munda Airport to Kolkata takes only 1 hour."
      }
    ]
  },
  {
    slug: "raipur",
    name: "Raipur",
    iata: "RPR",
    airportName: "Swami Vivekananda Airport",
    state: "Chhattisgarh",
    terminals: "Integrated Passenger Terminal, Mana",
    distanceFromCenter: "15 km south of Raipur city center",
    metaTitle: "Cheap Flights from Raipur (RPR): Airfare Deals | GetHotelStays",
    metaDescription: "Compare cheap flights from Raipur (RPR) to Delhi, Mumbai, Bengaluru, Hyderabad & Kolkata on GetHotelStays.",
    keywords: [
      "Raipur to Delhi flights", "Raipur to Mumbai flights", "Raipur to Bengaluru flights", "Raipur to Hyderabad flights",
      "Raipur to Chennai flights", "Raipur to Kolkata flights", "Raipur to Pune flights", "Raipur to Ahmedabad flights",
      "cheap flights from Raipur", "flight tickets from Raipur", "book flights from Raipur", "air tickets from Raipur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,799", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,699", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,299", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,899", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,199", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "What are the most popular business flight routes from Raipur?",
        answer: "Delhi, Mumbai, and Hyderabad are the top business corridors departing from Swami Vivekananda Airport in Raipur."
      }
    ]
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    iata: "UDR",
    airportName: "Maharana Pratap Airport",
    state: "Rajasthan",
    terminals: "Domestic Passenger Terminal, Dabok",
    distanceFromCenter: "22 km east of Udaipur City Palace and Lake Pichola",
    metaTitle: "Cheap Flights from Udaipur (UDR): Air Tickets | GetHotelStays",
    metaDescription: "Book cheap flights from Udaipur (UDR) to Delhi, Mumbai, Bengaluru, Hyderabad & Goa on GetHotelStays.",
    keywords: [
      "Udaipur to Delhi flights", "Udaipur to Mumbai flights", "Udaipur to Bengaluru flights", "Udaipur to Hyderabad flights",
      "Udaipur to Chennai flights", "Udaipur to Kolkata flights", "Udaipur to Pune flights", "Udaipur to Ahmedabad flights",
      "cheap flights from Udaipur", "flight tickets from Udaipur", "book flights from Udaipur", "air tickets from Udaipur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,699", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,899", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,499", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,999", duration: "2h 25m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,199", duration: "2h 35m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,199", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "How long does a flight from Udaipur to Delhi or Mumbai take?",
        answer: "Direct flights to Delhi take approximately 1h 15m, while flights to Mumbai take around 1h 25m."
      }
    ]
  },
  {
    slug: "jodhpur",
    name: "Jodhpur",
    iata: "JDH",
    airportName: "Jodhpur Airport",
    state: "Rajasthan",
    terminals: "Civil Enclave at Jodhpur Air Force Base",
    distanceFromCenter: "5 km from Jodhpur city center and Mehrangarh Fort",
    metaTitle: "Cheap Flights from Jodhpur (JDH): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Jodhpur (JDH) to Delhi, Mumbai, Bengaluru, Ahmedabad & Pune on GetHotelStays.",
    keywords: [
      "Jodhpur to Delhi flights", "Jodhpur to Mumbai flights", "Jodhpur to Bengaluru flights", "Jodhpur to Hyderabad flights",
      "Jodhpur to Chennai flights", "Jodhpur to Kolkata flights", "Jodhpur to Pune flights", "Jodhpur to Ahmedabad flights",
      "cheap flights from Jodhpur", "flight tickets from Jodhpur", "book flights from Jodhpur", "air tickets from Jodhpur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,899", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,199", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,699", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,299", duration: "2h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,499", duration: "2h 40m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,899", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How close is Jodhpur Airport to the city?",
        answer: "Jodhpur Airport is located just 5 km from the city center, taking only 15 minutes by taxi."
      }
    ]
  },
  {
    slug: "madurai",
    name: "Madurai",
    iata: "IXM",
    airportName: "Madurai Airport",
    state: "Tamil Nadu",
    terminals: "Integrated Passenger Terminal, Avaniyapuram",
    distanceFromCenter: "12 km south of Meenakshi Amman Temple",
    metaTitle: "Cheap Flights from Madurai (IXM) | GetHotelStays",
    metaDescription: "Compare cheap flights from Madurai (IXM) to Chennai, Bengaluru, Delhi & Mumbai on GetHotelStays.",
    keywords: [
      "Madurai to Chennai flights", "Madurai to Bengaluru flights", "Madurai to Delhi flights", "Madurai to Mumbai flights",
      "Madurai to Hyderabad flights", "Madurai to Kolkata flights", "Madurai to Pune flights", "Madurai to Kochi flights",
      "cheap flights from Madurai", "flight tickets from Madurai", "book flights from Madurai", "air tickets from Madurai"
    ],
    routes: [
      { to: "Chennai", toCode: "MAA", price: "₹1,799", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹1,999", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,699", duration: "3h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,899", duration: "2h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 00m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹1,999", duration: "0h 50m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Does Madurai Airport have direct flights to Sri Lanka and Dubai?",
        answer: "Yes, Madurai operates direct international flights to Colombo (SriLankan Airlines) and Dubai (Air India Express)."
      }
    ]
  },
  {
    slug: "mangalore",
    name: "Mangalore",
    iata: "IXE",
    airportName: "Mangalore International Airport",
    state: "Karnataka",
    terminals: "Integrated Passenger Terminal, Bajpe Tabletop Runway",
    distanceFromCenter: "13 km northeast of Mangalore city center",
    metaTitle: "Cheap Flights from Mangalore (IXE) | GetHotelStays",
    metaDescription: "Book cheap flights from Mangalore (IXE) to Bengaluru, Mumbai, Delhi, Chennai & Gulf on GetHotelStays.",
    keywords: [
      "Mangalore to Bengaluru flights", "Mangalore to Mumbai flights", "Mangalore to Delhi flights", "Mangalore to Chennai flights",
      "Mangalore to Hyderabad flights", "Mangalore to Kochi flights", "Mangalore to Pune flights", "Mangalore to Ahmedabad flights",
      "cheap flights from Mangalore", "flight tickets from Mangalore", "book flights from Mangalore", "air tickets from Mangalore"
    ],
    routes: [
      { to: "Bengaluru", toCode: "BLR", price: "₹1,999", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,499", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,499", duration: "2h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,699", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,599", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹2,199", duration: "1h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,899", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,499", duration: "2h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long is a flight from Mangalore to Bengaluru?",
        answer: "Direct flights from Mangalore (IXE) to Bengaluru (BLR) take only 1 hour."
      }
    ]
  },
  {
    slug: "kozhikode",
    name: "Kozhikode",
    iata: "CCJ",
    airportName: "Calicut International Airport",
    state: "Kerala",
    terminals: "Terminal 1 (Domestic), Terminal 2 (International), Karipur",
    distanceFromCenter: "28 km southeast of Kozhikode (Calicut) city center",
    metaTitle: "Cheap Flights from Kozhikode (CCJ): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Kozhikode (CCJ) to Bengaluru, Mumbai, Delhi, Chennai & Gulf hubs on GetHotelStays.",
    keywords: [
      "Kozhikode to Bengaluru flights", "Kozhikode to Mumbai flights", "Kozhikode to Delhi flights", "Kozhikode to Chennai flights",
      "Kozhikode to Hyderabad flights", "Kozhikode to Kochi flights", "Kozhikode to Pune flights", "Kozhikode to Ahmedabad flights",
      "cheap flights from Kozhikode", "flight tickets from Kozhikode", "book flights from Kozhikode", "air tickets from Kozhikode"
    ],
    routes: [
      { to: "Bengaluru", toCode: "BLR", price: "₹1,999", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,899", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,699", duration: "3h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,799", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹1,799", duration: "0h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,199", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹3,699", duration: "2h 20m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Calicut Airport a major hub for Middle East flights?",
        answer: "Yes, CCJ operates dozens of daily non-stop flights to Dubai, Doha, Riyadh, Kuwait, Bahrain, and Jeddah."
      }
    ]
  },
  {
    slug: "vijayawada",
    name: "Vijayawada",
    iata: "VGA",
    airportName: "Vijayawada International Airport",
    state: "Andhra Pradesh",
    terminals: "Integrated Passenger Terminal, Gannavaram",
    distanceFromCenter: "18 km east of Vijayawada city and Amaravati capital region",
    metaTitle: "Cheap Flights from Vijayawada (VGA) | GetHotelStays",
    metaDescription: "Compare cheap flights from Vijayawada (VGA) to Hyderabad, Bengaluru, Delhi & Mumbai on GetHotelStays.",
    keywords: [
      "Vijayawada to Hyderabad flights", "Vijayawada to Bengaluru flights", "Vijayawada to Delhi flights", "Vijayawada to Mumbai flights",
      "Vijayawada to Chennai flights", "Vijayawada to Kolkata flights", "Vijayawada to Pune flights", "Vijayawada to Visakhapatnam flights",
      "cheap flights from Vijayawada", "flight tickets from Vijayawada", "book flights from Vijayawada", "air tickets from Vijayawada"
    ],
    routes: [
      { to: "Hyderabad", toCode: "HYD", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹3,999", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,299", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,199", duration: "1h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Visakhapatnam", toCode: "VTZ", price: "₹1,899", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long is a flight from Vijayawada to Hyderabad?",
        answer: "Flights from Gannavaram Airport (VGA) to Hyderabad (HYD) take just 55 minutes."
      }
    ]
  },
  {
    slug: "tiruchirappalli",
    name: "Tiruchirappalli",
    iata: "TRZ",
    airportName: "Tiruchirappalli International Airport",
    state: "Tamil Nadu",
    terminals: "New Modern Passenger Terminal Building",
    distanceFromCenter: "5 km south of Tiruchirappalli (Trichy) railway junction",
    metaTitle: "Cheap Flights from Tiruchirappalli (TRZ) | GetHotelStays",
    metaDescription: "Book cheap flights from Tiruchirappalli (TRZ) to Chennai, Bengaluru, Singapore, Dubai & Malaysia on GetHotelStays.",
    keywords: [
      "Tiruchirappalli to Chennai flights", "Tiruchirappalli to Bengaluru flights", "Tiruchirappalli to Delhi flights", "Tiruchirappalli to Mumbai flights",
      "Tiruchirappalli to Hyderabad flights", "Tiruchirappalli to Kolkata flights", "Tiruchirappalli to Pune flights", "Tiruchirappalli to Kochi flights",
      "cheap flights from Tiruchirappalli", "flight tickets from Tiruchirappalli", "book flights from Tiruchirappalli", "air tickets from Tiruchirappalli"
    ],
    routes: [
      { to: "Chennai", toCode: "MAA", price: "₹1,699", duration: "1h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹1,899", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,699", duration: "3h 10m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,599", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,899", duration: "3h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kochi", toCode: "COK", price: "₹1,999", duration: "0h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Trichy Airport a major international gateway to Southeast Asia?",
        answer: "Yes, TRZ has high-density daily international flights to Singapore, Kuala Lumpur, Dubai, and Colombo."
      }
    ]
  },
  {
    slug: "jammu",
    name: "Jammu",
    iata: "IXJ",
    airportName: "Jammu Airport",
    state: "Jammu & Kashmir",
    terminals: "Domestic Passenger Terminal, Satwari",
    distanceFromCenter: "6 km from Jammu Tawi Railway Station",
    metaTitle: "Cheap Flights from Jammu (IXJ): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Jammu (IXJ) to Delhi, Srinagar, Mumbai & Bengaluru on GetHotelStays.",
    keywords: [
      "Jammu to Delhi flights", "Jammu to Mumbai flights", "Jammu to Bengaluru flights", "Jammu to Hyderabad flights",
      "Jammu to Chennai flights", "Jammu to Kolkata flights", "Jammu to Pune flights", "Jammu to Srinagar flights",
      "cheap flights from Jammu", "flight tickets from Jammu", "book flights from Jammu", "air tickets from Jammu"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,699", duration: "1h 20m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Srinagar", toCode: "SXR", price: "₹1,899", duration: "0h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,199", duration: "3h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,699", duration: "3h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,999", duration: "3h 35m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,699", duration: "3h 10m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹4,499", duration: "2h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Jammu Airport the closest flight gateway to Vaishno Devi?",
        answer: "Yes, Jammu Airport is located about 48 km from Katra (base camp for Vaishno Devi), with taxis and buses readily available outside the terminal."
      }
    ]
  },
  {
    slug: "leh",
    name: "Leh",
    iata: "IXL",
    airportName: "Kushok Bakula Rimpochee Airport",
    state: "Ladakh",
    terminals: "High-Altitude Passenger Terminal (3,256m ASL)",
    distanceFromCenter: "3 km southwest of Leh city center",
    metaTitle: "Cheap Flights from Leh (IXL): Airfare Booking | GetHotelStays",
    metaDescription: "Compare cheap flights from Leh Ladakh (IXL) to Delhi, Mumbai, Jammu & Chandigarh on GetHotelStays.",
    keywords: [
      "Leh to Delhi flights", "Leh to Mumbai flights", "Leh to Bengaluru flights", "Leh to Hyderabad flights",
      "Leh to Chennai flights", "Leh to Kolkata flights", "Leh to Pune flights", "Leh to Chandigarh flights",
      "cheap flights from Leh", "flight tickets from Leh", "book flights from Leh", "air tickets from Leh"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,999", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,999", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chandigarh", toCode: "IXC", price: "₹2,499", duration: "1h 00m", type: "Direct", carriers: ["Air India", "IndiGo"] },
      { to: "Jammu", toCode: "IXJ", price: "₹2,199", duration: "0h 50m", type: "Direct", carriers: ["Air India", "SpiceJet"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,699", duration: "3h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹5,199", duration: "3h 20m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹5,899", duration: "3h 50m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹5,299", duration: "3h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Why do flights from Leh only operate in the morning?",
        answer: "Due to high altitude, thin air, and strong afternoon thermal mountain winds, all commercial flights in Leh land and depart before noon for flight safety."
      }
    ]
  },
  {
    slug: "bagdogra",
    name: "Bagdogra",
    iata: "IXB",
    airportName: "Bagdogra International Airport",
    state: "West Bengal",
    terminals: "Domestic Passenger Terminal, Siliguri",
    distanceFromCenter: "16 km west of Siliguri; 68 km from Darjeeling; 120 km from Gangtok",
    metaTitle: "Cheap Flights from Bagdogra (IXB) | GetHotelStays",
    metaDescription: "Find cheap flights from Bagdogra (IXB) to Kolkata, Delhi, Bengaluru, Mumbai & Guwahati on GetHotelStays.",
    keywords: [
      "Bagdogra to Kolkata flights", "Bagdogra to Delhi flights", "Bagdogra to Mumbai flights", "Bagdogra to Bengaluru flights",
      "Bagdogra to Hyderabad flights", "Bagdogra to Chennai flights", "Bagdogra to Guwahati flights", "Bagdogra to Pune flights",
      "cheap flights from Bagdogra", "flight tickets from Bagdogra", "book flights from Bagdogra", "air tickets from Bagdogra"
    ],
    routes: [
      { to: "Kolkata", toCode: "CCU", price: "₹1,999", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Delhi", toCode: "DEL", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,699", duration: "2h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹4,499", duration: "2h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,999", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,299", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Guwahati", toCode: "GAU", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹4,499", duration: "2h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Bagdogra the primary airport for Darjeeling and Sikkim?",
        answer: "Yes, Bagdogra Airport is the main air transit hub for Darjeeling (2.5 hrs drive), Gangtok (4 hrs drive), and Kalimpong."
      }
    ]
  },
  {
    slug: "port-blair",
    name: "Port Blair",
    iata: "IXZ",
    airportName: "Veer Savarkar International Airport",
    state: "Andaman & Nicobar",
    terminals: "New Shell-Shaped Integrated Terminal Building",
    distanceFromCenter: "2 km south of Port Blair town center",
    metaTitle: "Cheap Flights from Port Blair (IXZ): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Port Blair (IXZ) to Chennai, Kolkata, Delhi & Bengaluru on GetHotelStays.",
    keywords: [
      "Port Blair to Chennai flights", "Port Blair to Kolkata flights", "Port Blair to Delhi flights", "Port Blair to Bengaluru flights",
      "Port Blair to Mumbai flights", "Port Blair to Hyderabad flights", "Port Blair to Pune flights", "Port Blair to Ahmedabad flights",
      "cheap flights from Port Blair", "flight tickets from Port Blair", "book flights from Port Blair", "air tickets from Port Blair"
    ],
    routes: [
      { to: "Chennai", toCode: "MAA", price: "₹4,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,699", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India", "SpiceJet"] },
      { to: "Delhi", toCode: "DEL", price: "₹6,999", duration: "3h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,299", duration: "2h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹5,899", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,999", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹5,499", duration: "3h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹5,999", duration: "3h 35m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long is a non-stop flight from Port Blair to mainland India?",
        answer: "Direct flights from Port Blair to Chennai take 2h 15m, while flights to Kolkata take 2h 25m and Bengaluru takes 2h 40m."
      }
    ]
  },
  {
    slug: "agartala",
    name: "Agartala",
    iata: "IXA",
    airportName: "Maharaja Bir Bikram Airport",
    state: "Tripura",
    terminals: "New Integrated Passenger Terminal",
    distanceFromCenter: "12 km northwest of Agartala city center",
    metaTitle: "Cheap Flights from Agartala (IXA): Air Tickets | GetHotelStays",
    metaDescription: "Book cheap flights from Agartala (IXA) to Kolkata, Guwahati, Delhi & Bengaluru on GetHotelStays.",
    keywords: [
      "Agartala to Kolkata flights", "Agartala to Guwahati flights", "Agartala to Delhi flights", "Agartala to Bengaluru flights",
      "Agartala to Mumbai flights", "Agartala to Hyderabad flights", "Agartala to Chennai flights", "Agartala to Silchar flights",
      "cheap flights from Agartala", "flight tickets from Agartala", "book flights from Agartala", "air tickets from Agartala"
    ],
    routes: [
      { to: "Kolkata", toCode: "CCU", price: "₹1,899", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Guwahati", toCode: "GAU", price: "₹1,899", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,299", duration: "2h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,999", duration: "3h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹5,199", duration: "3h 25m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,499", duration: "2h 50m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,799", duration: "3h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Silchar", toCode: "IXS", price: "₹1,699", duration: "0h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long does a flight from Agartala to Kolkata take?",
        answer: "A flight from Maharaja Bir Bikram Airport (IXA) to Kolkata (CCU) takes only 50 minutes."
      }
    ]
  },
  {
    slug: "imphal",
    name: "Imphal",
    iata: "IMF",
    airportName: "Bir Tikendrajit International Airport",
    state: "Manipur",
    terminals: "Main Domestic Passenger Terminal",
    distanceFromCenter: "7 km south of Imphal city center",
    metaTitle: "Cheap Flights from Imphal (IMF): Airfare Deals | GetHotelStays",
    metaDescription: "Find cheap flights from Imphal (IMF) to Guwahati, Kolkata, Delhi & Bengaluru on GetHotelStays.",
    keywords: [
      "Imphal to Guwahati flights", "Imphal to Kolkata flights", "Imphal to Delhi flights", "Imphal to Bengaluru flights",
      "Imphal to Mumbai flights", "Imphal to Hyderabad flights", "Imphal to Chennai flights", "Imphal to Agartala flights",
      "cheap flights from Imphal", "flight tickets from Imphal", "book flights from Imphal", "air tickets from Imphal"
    ],
    routes: [
      { to: "Guwahati", toCode: "GAU", price: "₹1,999", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,499", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,499", duration: "2h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹4,999", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹5,299", duration: "3h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,699", duration: "3h 00m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,899", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Agartala", toCode: "IXA", price: "₹1,799", duration: "0h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "What are the primary connections departing from Imphal Airport?",
        answer: "Guwahati, Kolkata, and Delhi are the most popular direct routes departing from Bir Tikendrajit Airport."
      }
    ]
  },
  {
    slug: "dibrugarh",
    name: "Dibrugarh",
    iata: "DIB",
    airportName: "Dibrugarh Airport",
    state: "Assam",
    terminals: "Civil Enclave, Mohanbari",
    distanceFromCenter: "15 km northeast of Dibrugarh town",
    metaTitle: "Cheap Flights from Dibrugarh (DIB): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Dibrugarh (DIB) to Guwahati, Kolkata, Delhi & Bengaluru on GetHotelStays.",
    keywords: [
      "Dibrugarh to Guwahati flights", "Dibrugarh to Kolkata flights", "Dibrugarh to Delhi flights", "Dibrugarh to Bengaluru flights",
      "Dibrugarh to Mumbai flights", "Dibrugarh to Hyderabad flights", "Dibrugarh to Chennai flights", "Dibrugarh to Agartala flights",
      "cheap flights from Dibrugarh", "flight tickets from Dibrugarh", "book flights from Dibrugarh", "air tickets from Dibrugarh"
    ],
    routes: [
      { to: "Guwahati", toCode: "GAU", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,699", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,899", duration: "3h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,299", duration: "3h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹5,499", duration: "3h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,899", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹5,199", duration: "3h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Agartala", toCode: "IXA", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Dibrugarh the easternmost civil airport in India?",
        answer: "Yes, Dibrugarh Airport (Mohanbari) is eastern India's key air gateway serving upper Assam, Arunachal Pradesh, and the tea estates."
      }
    ]
  },
  {
    slug: "silchar",
    name: "Silchar",
    iata: "IXS",
    airportName: "Silchar Airport (Kumbhirgram)",
    state: "Assam",
    terminals: "Civil Enclave at Kumbhirgram Air Force Base",
    distanceFromCenter: "29 km northeast of Silchar town",
    metaTitle: "Cheap Flights from Silchar (IXS): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Silchar (IXS) to Guwahati, Kolkata, Delhi & Bengaluru on GetHotelStays.",
    keywords: [
      "Silchar to Guwahati flights", "Silchar to Kolkata flights", "Silchar to Delhi flights", "Silchar to Bengaluru flights",
      "Silchar to Mumbai flights", "Silchar to Hyderabad flights", "Silchar to Chennai flights", "Silchar to Agartala flights",
      "cheap flights from Silchar", "flight tickets from Silchar", "book flights from Silchar", "air tickets from Silchar"
    ],
    routes: [
      { to: "Guwahati", toCode: "GAU", price: "₹1,799", duration: "0h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,299", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Delhi", toCode: "DEL", price: "₹4,699", duration: "2h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹5,199", duration: "3h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹5,399", duration: "3h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹4,799", duration: "3h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹4,999", duration: "3h 25m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Agartala", toCode: "IXA", price: "₹1,699", duration: "0h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How long is a flight from Silchar to Kolkata or Guwahati?",
        answer: "A flight from Silchar to Guwahati takes about 45 minutes, while flying to Kolkata takes around 1 hour 10 minutes."
      }
    ]
  },
  {
    slug: "prayagraj",
    name: "Prayagraj",
    iata: "IXD",
    airportName: "Prayagraj Airport",
    state: "Uttar Pradesh",
    terminals: "Civil Enclave, Bamrauli",
    distanceFromCenter: "12 km west of Prayagraj city and Triveni Sangam",
    metaTitle: "Cheap Flights from Prayagraj (IXD) | GetHotelStays",
    metaDescription: "Book cheap flights from Prayagraj (IXD) to Delhi, Mumbai, Bengaluru & Lucknow on GetHotelStays.",
    keywords: [
      "Prayagraj to Delhi flights", "Prayagraj to Mumbai flights", "Prayagraj to Bengaluru flights", "Prayagraj to Hyderabad flights",
      "Prayagraj to Chennai flights", "Prayagraj to Kolkata flights", "Prayagraj to Pune flights", "Prayagraj to Ahmedabad flights",
      "cheap flights from Prayagraj", "flight tickets from Prayagraj", "book flights from Prayagraj", "air tickets from Prayagraj"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,199", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Alliance Air"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,999", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,699", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How to reach Kumbh Mela and Sangam from Prayagraj Airport?",
        answer: "Bamrauli Airport is located 15 km from Triveni Sangam, with taxis and direct shuttle buses operating during major pilgrimage events."
      }
    ]
  },
  {
    slug: "kanpur",
    name: "Kanpur",
    iata: "KNU",
    airportName: "Kanpur Airport",
    state: "Uttar Pradesh",
    terminals: "New Civil Enclave Terminal, Chakeri",
    distanceFromCenter: "14 km east of Kanpur Central Railway Station",
    metaTitle: "Cheap Flights from Kanpur (KNU): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Kanpur (KNU) to Delhi, Mumbai, Bengaluru & Hyderabad on GetHotelStays.",
    keywords: [
      "Kanpur to Delhi flights", "Kanpur to Mumbai flights", "Kanpur to Bengaluru flights", "Kanpur to Hyderabad flights",
      "Kanpur to Chennai flights", "Kanpur to Kolkata flights", "Kanpur to Pune flights", "Kanpur to Ahmedabad flights",
      "cheap flights from Kanpur", "flight tickets from Kanpur", "book flights from Kanpur", "air tickets from Kanpur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,499", duration: "2h 05m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,999", duration: "2h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,299", duration: "1h 55m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹2,899", duration: "1h 40m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 10m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] }
    ],
    faqs: [
      {
        question: "What airlines operate from the new Kanpur Airport terminal?",
        answer: "IndiGo operates daily non-stop flights connecting Kanpur with Delhi, Mumbai, and Bengaluru."
      }
    ]
  },
  {
    slug: "agra",
    name: "Agra",
    iata: "AGR",
    airportName: "Agra Airport (Kheria Air Force Station)",
    state: "Uttar Pradesh",
    terminals: "Civil Enclave Terminal, Kheria",
    distanceFromCenter: "7 km from Agra Cantt and 12 km from the Taj Mahal",
    metaTitle: "Cheap Flights from Agra (AGR): Air Tickets | GetHotelStays",
    metaDescription: "Find cheap flights from Agra (AGR) to Delhi, Mumbai, Bengaluru, Lucknow & Goa on GetHotelStays.",
    keywords: [
      "Agra to Delhi flights", "Agra to Mumbai flights", "Agra to Bengaluru flights", "Agra to Hyderabad flights",
      "Agra to Chennai flights", "Agra to Kolkata flights", "Agra to Pune flights", "Agra to Ahmedabad flights",
      "cheap flights from Agra", "flight tickets from Agra", "book flights from Agra", "air tickets from Agra"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,899", duration: "0h 50m", type: "Direct", carriers: ["IndiGo", "Alliance Air"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,999", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,499", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 35m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,699", duration: "2h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,699", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How far is Agra Airport from the Taj Mahal?",
        answer: "Agra Airport is approximately 12 km from the Taj Mahal (about 25 minutes by taxi)."
      }
    ]
  },
  {
    slug: "jabalpur",
    name: "Jabalpur",
    iata: "JLR",
    airportName: "Jabalpur Airport (Dumna)",
    state: "Madhya Pradesh",
    terminals: "New Integrated Passenger Terminal, Dumna",
    distanceFromCenter: "25 km east of Jabalpur city center",
    metaTitle: "Cheap Flights from Jabalpur (JLR) | GetHotelStays",
    metaDescription: "Compare cheap flights from Jabalpur (JLR) to Delhi, Mumbai, Bengaluru, Hyderabad & Indore on GetHotelStays.",
    keywords: [
      "Jabalpur to Delhi flights", "Jabalpur to Mumbai flights", "Jabalpur to Bengaluru flights", "Jabalpur to Hyderabad flights",
      "Jabalpur to Chennai flights", "Jabalpur to Kolkata flights", "Jabalpur to Pune flights", "Jabalpur to Ahmedabad flights",
      "cheap flights from Jabalpur", "flight tickets from Jabalpur", "book flights from Jabalpur", "air tickets from Jabalpur"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,499", duration: "1h 35m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,899", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "SpiceJet"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,999", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,499", duration: "2h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,299", duration: "1h 55m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,999", duration: "1h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Is Jabalpur Airport the best access point for Kanha and Bandhavgarh National Parks?",
        answer: "Yes, Dumna Airport in Jabalpur is the primary air gateway for Kanha National Park (3.5 hrs) and Bandhavgarh National Park (4 hrs)."
      }
    ]
  },
  {
    slug: "vadodara",
    name: "Vadodara",
    iata: "BDQ",
    airportName: "Vadodara Airport",
    state: "Gujarat",
    terminals: "Green Integrated Passenger Terminal, Harni",
    distanceFromCenter: "6 km northeast of Vadodara Railway Station",
    metaTitle: "Cheap Flights from Vadodara (BDQ) | GetHotelStays",
    metaDescription: "Book cheap flights from Vadodara (BDQ) to Delhi, Mumbai, Bengaluru, Hyderabad & Goa on GetHotelStays.",
    keywords: [
      "Vadodara to Delhi flights", "Vadodara to Mumbai flights", "Vadodara to Bengaluru flights", "Vadodara to Hyderabad flights",
      "Vadodara to Chennai flights", "Vadodara to Kolkata flights", "Vadodara to Pune flights", "Vadodara to Ahmedabad flights",
      "cheap flights from Vadodara", "flight tickets from Vadodara", "book flights from Vadodara", "air tickets from Vadodara"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,499", duration: "1h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,199", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,499", duration: "2h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,899", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,699", duration: "2h 15m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,999", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,699", duration: "1h 20m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,799", duration: "0h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "How close is Vadodara Airport to the Statue of Unity?",
        answer: "Vadodara Airport is the closest major airport to the Statue of Unity in Kevadia (approx. 90 km, 1.5 to 2 hrs by taxi)."
      }
    ]
  },
  {
    slug: "surat",
    name: "Surat",
    iata: "STV",
    airportName: "Surat International Airport",
    state: "Gujarat",
    terminals: "New Expanded Integrated Passenger Terminal, Magdalla",
    distanceFromCenter: "12 km southwest of Surat city center",
    metaTitle: "Cheap Flights from Surat (STV): Airfare Booking | GetHotelStays",
    metaDescription: "Find cheap flights from Surat (STV) to Delhi, Mumbai, Bengaluru, Goa & Kolkata on GetHotelStays.",
    keywords: [
      "Surat to Delhi flights", "Surat to Mumbai flights", "Surat to Bengaluru flights", "Surat to Hyderabad flights",
      "Surat to Chennai flights", "Surat to Kolkata flights", "Surat to Pune flights", "Surat to Ahmedabad flights",
      "cheap flights from Surat", "flight tickets from Surat", "book flights from Surat", "air tickets from Surat"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,699", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹1,999", duration: "1h 05m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹2,899", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,499", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,899", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,299", duration: "1h 10m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,899", duration: "0h 50m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Does Surat Airport have direct flights to Dubai?",
        answer: "Yes, Air India Express operates direct non-stop flights between Surat and Dubai International Airport."
      }
    ]
  },
  {
    slug: "rajkot",
    name: "Rajkot",
    iata: "HSR",
    airportName: "Rajot International Airport (Hirasar)",
    state: "Gujarat",
    terminals: "New Greenfield Green Passenger Terminal, Hirasar",
    distanceFromCenter: "30 km east of Rajkot city center on NH 27",
    metaTitle: "Cheap Flights from Rajkot (HSR): Air Tickets | GetHotelStays",
    metaDescription: "Compare cheap flights from Rajkot (HSR) to Mumbai, Delhi, Bengaluru & Goa on GetHotelStays.",
    keywords: [
      "Rajkot to Delhi flights", "Rajkot to Mumbai flights", "Rajkot to Bengaluru flights", "Rajkot to Hyderabad flights",
      "Rajkot to Chennai flights", "Rajkot to Kolkata flights", "Rajkot to Pune flights", "Rajkot to Ahmedabad flights",
      "cheap flights from Rajkot", "flight tickets from Rajkot", "book flights from Rajkot", "air tickets from Rajkot"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹2,899", duration: "1h 50m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Mumbai", toCode: "BOM", price: "₹2,299", duration: "1h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,699", duration: "2h 15m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,199", duration: "1h 45m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,899", duration: "2h 30m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹4,199", duration: "2h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹2,699", duration: "1h 25m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹1,899", duration: "0h 45m", type: "Connecting", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "Where is the new Rajkot Greenfield Airport located?",
        answer: "The new Rajkot International Airport is situated at Hirasar along the Rajkot-Ahmedabad highway, approximately 30 km from Rajkot city."
      }
    ]
  },
  {
    slug: "gwalior",
    name: "Gwalior",
    iata: "GWL",
    airportName: "Rajmata Vijaya Raje Scindia Airport",
    state: "Madhya Pradesh",
    terminals: "New Integrated Passenger Terminal, Maharajpur",
    distanceFromCenter: "10 km northeast of Gwalior Fort & city center",
    metaTitle: "Cheap Flights from Gwalior (GWL): Air Tickets | GetHotelStays",
    metaDescription: "Book cheap flights from Gwalior (GWL) to Delhi, Mumbai, Bengaluru, Hyderabad & Ahmedabad on GetHotelStays.",
    keywords: [
      "Gwalior to Delhi flights", "Gwalior to Mumbai flights", "Gwalior to Bengaluru flights", "Gwalior to Hyderabad flights",
      "Gwalior to Chennai flights", "Gwalior to Kolkata flights", "Gwalior to Pune flights", "Gwalior to Ahmedabad flights",
      "cheap flights from Gwalior", "flight tickets from Gwalior", "book flights from Gwalior", "air tickets from Gwalior"
    ],
    routes: [
      { to: "Delhi", toCode: "DEL", price: "₹1,899", duration: "0h 55m", type: "Direct", carriers: ["Air India", "IndiGo"] },
      { to: "Mumbai", toCode: "BOM", price: "₹3,199", duration: "2h 00m", type: "Direct", carriers: ["Air India", "IndiGo"] },
      { to: "Bengaluru", toCode: "BLR", price: "₹3,899", duration: "2h 30m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Hyderabad", toCode: "HYD", price: "₹3,299", duration: "2h 00m", type: "Direct", carriers: ["IndiGo", "Air India"] },
      { to: "Chennai", toCode: "MAA", price: "₹3,999", duration: "2h 40m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Kolkata", toCode: "CCU", price: "₹3,699", duration: "2h 20m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Pune", toCode: "PNQ", price: "₹3,499", duration: "2h 05m", type: "Connecting", carriers: ["IndiGo", "Air India"] },
      { to: "Ahmedabad", toCode: "AMD", price: "₹2,699", duration: "1h 40m", type: "Direct", carriers: ["IndiGo", "Air India"] }
    ],
    faqs: [
      {
        question: "What are the direct flight connections from Gwalior Airport?",
        answer: "Gwalior has direct flights to Delhi, Mumbai, Bengaluru, and Hyderabad."
      }
    ]
  }
];

export function getFlightCityBySlug(slug: string): FlightCityData | undefined {
  const cleanSlug = slug.toLowerCase().trim().replace(/^\/|\/$/g, '');
  return FLIGHT_CITIES.find(c => c.slug === cleanSlug);
}
