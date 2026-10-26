import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Plane } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near Delhi Airport | Compare & Book Online",
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
    question: "Which area should I choose for a Delhi Airport hotel?",
    answer:
      "Choose based on your terminal, flight time, transport plan and budget. Verify the property's address and route rather than relying on the phrase 'near airport' alone.",
  },
  {
    question: "Can I book a hotel for a few hours during a layover?",
    answer:
      "Some listings may support short stays; check the available duration and check-in slot for your selected date.",
  },
  {
    question: "Do hotels provide airport transfers?",
    answer:
      "Transfer services vary by property and may carry an additional charge. Confirm directly in the listing or with the property.",
  },
  {
    question: "Can I check in late at night?",
    answer:
      "Late check-in depends on the property's reception and arrival policy. Confirm your expected arrival time before booking.",
  },
  {
    question: "How much does a hotel near Delhi Airport cost?",
    answer:
      "Rates vary by date, duration, room type, demand and included services. Compare the total price displayed for your exact stay.",
  },
  {
    question: "How early should I book?",
    answer:
      "Booking ahead gives you more time to compare options, especially around busy travel dates. Always check current availability for your dates.",
  },
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
