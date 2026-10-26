import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Train } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near New Delhi Railway Station (NDLS) | Book Online",
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
    question: "How do I find a hotel close to NDLS?",
    answer:
      "Compare the address and map for each listing and check the route to the station entrance you need.",
  },
  {
    question: "Can I check in early after an overnight train?",
    answer:
      "Early check-in depends on room availability and the property's policy. Confirm it before booking; do not assume it is included.",
  },
  {
    question: "Are short-stay rooms available near the station?",
    answer:
      "Some properties may offer short-duration stays. Check the specific listing for eligible durations and time slots.",
  },
  {
    question: "Can families stay near New Delhi Railway Station?",
    answer:
      "Check each property's permitted occupancy, room configuration, identification requirements and family-related policies.",
  },
  {
    question: "Will the hotel hold my luggage?",
    answer:
      "Luggage storage is property-specific. Contact the property to confirm availability, timings and any charges.",
  },
  {
    question: "How can I compare the total cost?",
    answer:
      "Enter the correct dates and occupancy, then review taxes, fees and the final checkout summary before confirming.",
  },
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
