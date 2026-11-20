import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Train } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near New Delhi Railway Station (NDLS) — Paharganj & Ajmeri Gate | GetHotelStays",
  description:
    "Compare hotels near New Delhi Railway Station (NDLS) for train arrivals, departures and short stays. Check location, check-in rules and total price.",
  keywords: [
    "hotels near New Delhi Railway Station",
    "hotels near NDLS",
    "hotels near New Delhi railway station for family",
    "rooms near NDLS station",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
  },
  openGraph: {
    title: "Hotels Near New Delhi Railway Station (NDLS) | Book Online",
    description:
      "Compare hotels near New Delhi Railway Station (NDLS) for train arrivals, departures and short stays.",
    url: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Plan around your train time",
    paragraphs: [
      "If your train arrives early or departs late, check whether the room will be available at the time you need it. A standard overnight booking may not include early access or a late checkout unless the property confirms it.",
    ],
  },
  {
    h2: "Check the actual route to NDLS",
    paragraphs: [
      "Listings in central Delhi can have different routes and traffic conditions. Check the exact address and map, and allow extra time for station entry, luggage and local traffic.",
    ],
  },
  {
    h2: "Make group and luggage needs clear",
    paragraphs: [
      "For family or group travel, verify occupancy limits, bed configuration, lift access and luggage arrangements where relevant. Confirm any special requests with the property before completing the booking.",
    ],
  },
];

const FAQS = [
  {
    "question": "Which side of New Delhi Railway Station has the best hotels?",
    "answer": "Paharganj (Pahar Ganj / Chelmsford Road side) and Ajmeri Gate side offer hundreds of budget and mid-range hotels within 200m to 800m of NDLS platforms. GetHotelStays curates vetted, clean properties with lift access and 24x7 check-in."
  },
  {
    "question": "What is the starting price for NDLS hotels on GetHotelStays?",
    "answer": "Verified rooms near New Delhi Railway Station start from ₹799 per night. Under GetHotelStays' 12% deposit policy, you only pay ~₹95 online to hold the room and pay the rest at reception."
  },
  {
    "question": "Can I get early morning check-in after arriving on an early train?",
    "answer": "Yes. Many NDLS hotels on GetHotelStays offer 24-hour reception and flexible early morning check-in options for passengers arriving on early Rajdhani, Shatabdi, or Vande Bharat expresses."
  },
  {
    "question": "Are hotels near NDLS couple friendly?",
    "answer": "Yes. Selected partner hotels in Paharganj and CP-adjacent streets are 100% couple-friendly and accept local government IDs without hassle."
  }
];

const INTERNAL_LINKS = [
  { label: "📍 Hotels in Paharganj Delhi", href: "/hotels-in-paharganj-delhi" },
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.ndls);

  return (
    <LandingPageTemplate
      pageSlug="hotels-near-new-delhi-railway-station"
      canonicalUrl="https://gethotelstays.com/hotels-near-new-delhi-railway-station"
      breadcrumbLabel="Hotels Near NDLS"
      badgeText="Platform 1 (Paharganj Exit) — 2 to 5 Mins Walk"
      badgeIcon={<Train className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels Near New Delhi Railway Station (NDLS) | Book Online"
      heroCopy="Arriving at or departing from New Delhi Railway Station (NDLS)? Find a hotel that fits your train schedule. Compare the property's address, route to the station, check-in window, room details and total cost before booking online with GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Walking distance to NDLS Platform 1 & RK Ashram Metro"
    />
  );
}
