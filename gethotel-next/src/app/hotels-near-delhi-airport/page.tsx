import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Plane } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near Delhi Airport (IGI T3, T2, T1) — From ₹899 with 12% Deposit | GetHotelStays",
  description:
    "Find hotels near Delhi Airport for layovers, early flights and overnight stays. Compare location, facilities, check-in rules and prices, then book online.",
  keywords: [
    "hotels near Delhi airport",
    "hotels near IGI Airport",
    "airport transit hotel Delhi",
    "hotels near Delhi airport for layover",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-delhi-airport",
  },
  openGraph: {
    title: "Hotels Near Delhi Airport | Compare & Book Online",
    description:
      "Find hotels near Delhi Airport for layovers, early flights and overnight stays. Compare location, facilities, and book online.",
    url: "https://gethotelstays.com/hotels-near-delhi-airport",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Choose the right stay for your flight",
    paragraphs: [
      "For a short layover, prioritize the time you can actually use the room and how you will travel between the airport and hotel. For an overnight stay, compare check-in hours, room facilities and the next day's departure plan.",
    ],
  },
  {
    h2: "Check the location, not just the label",
    paragraphs: [
      "Hotels described as near the airport may be in different neighbourhoods and may require a road transfer. Review the property's address and map, estimate travel time for your flight schedule, and confirm whether airport transfers are offered or separately charged.",
    ],
  },
  {
    h2: "Make arrival and departure plans clear",
    paragraphs: [
      "If your flight lands late or leaves early, confirm that the property can accommodate your arrival time. Review identification rules, cancellation terms and the final amount before confirming your booking.",
    ],
  },
];

const FAQS = [
  {
    "question": "Which is the best area to stay near Delhi Airport (IGI DEL)?",
    "answer": "Mahipalpur and Aerocity Hospitality District are the two top areas located just 5 to 10 minutes (3-5 km) from Delhi Airport Terminal 3, Terminal 2, and Terminal 1. GetHotelStays provides verified budget-to-premium properties in these hubs with 24x7 check-in."
  },
  {
    "question": "Can I book a hotel near Delhi Airport for a short layover (3-6 hours)?",
    "answer": "Yes. GetHotelStays provides flexible 3-hour and 6-hour micro-stay bookings starting from ₹499 in Mahipalpur and Aerocity, complete with attached baths, AC, and high-speed Wi-Fi to freshen up between connecting flights."
  },
  {
    "question": "How much does a hotel near Delhi Airport cost per night?",
    "answer": "Overnight stays near Delhi Airport start from ₹899 to ₹2,499 per night on GetHotelStays. With our Pay 12% Deposit model, you only pay ~₹100 to ₹300 online to guarantee your reservation."
  },
  {
    "question": "Do Delhi airport hotels offer airport pickup and drop-off?",
    "answer": "Many partner hotels in Mahipalpur provide airport taxi transfers upon request. In addition, 24/7 Uber, Ola, and Delhi Airport Express Metro connectivity are easily accessible."
  },
  {
    "question": "Can couples stay near Delhi Airport with local IDs?",
    "answer": "Yes. Verified couple-friendly airport hotels on GetHotelStays accept valid local government IDs (Aadhaar, Voter ID, Driving License) for adult guests aged 18+."
  }
];

const INTERNAL_LINKS = [
  { label: "📍 Hotels in Mahipalpur Delhi", href: "/hotels-in-mahipalpur-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.airport);

  return (
    <LandingPageTemplate
      pageSlug="hotels-near-delhi-airport"
      canonicalUrl="https://gethotelstays.com/hotels-near-delhi-airport"
      breadcrumbLabel="Hotels Near Delhi Airport"
      badgeText="IGI Airport T3 / T2 / T1 & Mahipalpur Stays"
      badgeIcon={<Plane className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels Near Delhi Airport | Compare & Book Online"
      heroCopy="Looking for a hotel near Delhi Airport? Compare available stays for a layover, late arrival, early departure or overnight stop. Check the property's exact location, transfer arrangements, check-in time and total price before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Minutes from IGI Airport Terminals & Aerocity"
    />
  );
}
