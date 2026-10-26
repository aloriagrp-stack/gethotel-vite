import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Sunrise } from "lucide-react";

export const metadata: Metadata = {
  title: "Early Check-In Hotels in Delhi | Check Morning Availability",
  description:
    "Looking for an early check-in hotel in Delhi? Compare properties and confirm room availability, arrival time, extra charges and booking rules online.",
  keywords: [
    "early check in hotels in Delhi",
    "hotels with early check in Delhi",
    "hotel check in at 6 AM Delhi",
    "morning check in hotels Delhi",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/early-check-in-hotels-in-delhi",
  },
  openGraph: {
    title: "Early Check-In Hotels in Delhi | Check Morning Availability",
    description:
      "Looking for an early check-in hotel in Delhi? Compare properties and confirm room availability, arrival time, extra charges and booking rules online.",
    url: "https://gethotelstays.com/early-check-in-hotels-in-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Do not assume a standard booking starts at dawn",
    paragraphs: [
      "A reservation for the previous night or same day may be treated differently by each property. If you need a room at 5 AM, 6 AM or 7 AM, confirm the exact date and time with the property and review how the booking is priced.",
    ],
  },
  {
    h2: "Match the booking to your arrival",
    paragraphs: [
      "Enter the correct arrival date and guest details. If you arrive from a late-night train or early flight, check whether you need to reserve the previous night, choose an hourly option or obtain written confirmation of an early check-in arrangement.",
    ],
  },
  {
    h2: "Confirm charges and room access",
    paragraphs: [
      "Ask whether early access has an extra charge, whether a room is guaranteed at arrival and what happens if your transport is delayed. Keep the confirmation available when you arrive.",
    ],
  },
];

const FAQS = [
  {
    question: "Can I check into a Delhi hotel at 5 AM?",
    answer:
      "Only if the property offers or confirms access at that time. Confirm the exact date, arrival time and any extra charge before booking.",
  },
  {
    question: "Is early check-in free?",
    answer:
      "Not always. Charges and eligibility depend on the property's policy and room availability.",
  },
  {
    question: "Should I book the previous night for a 6 AM arrival?",
    answer:
      "That may be one option, but policies vary. Ask the property which booking arrangement guarantees access at your required time.",
  },
  {
    question: "Are early check-in and 24-hour check-in the same?",
    answer:
      "No. A property's reception hours and its room check-in rules are separate. Confirm both.",
  },
  {
    question: "Can a train or flight delay affect early check-in?",
    answer:
      "It can affect arrival arrangements. Contact the property promptly if your estimated arrival changes.",
  },
  {
    question: "Can I use an hourly hotel for an early morning arrival?",
    answer:
      "Some properties may offer a compatible short-stay slot. Check the exact duration, time and room-access terms.",
  },
];

const INTERNAL_LINKS = [
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "✈️ Hotels Near Delhi Airport", href: "/hotels-near-delhi-airport" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 Hotels in Paharganj Delhi", href: "/hotels-in-paharganj-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.earlyCheckIn);

  return (
    <LandingPageTemplate
      pageSlug="early-check-in-hotels-in-delhi"
      canonicalUrl="https://gethotelstays.com/early-check-in-hotels-in-delhi"
      breadcrumbLabel="Early Check-In Hotels in Delhi"
      badgeText="Morning Arrivals • 5 AM / 6 AM / 7 AM Check-In Support"
      badgeIcon={<Sunrise className="w-3.5 h-3.5 text-brand-600" />}
      h1="Early Check-In Hotels in Delhi | Check Morning Availability"
      heroCopy="Arriving in Delhi early in the morning? Find a hotel that can accommodate your arrival time. Compare available properties and confirm whether early check-in is guaranteed, subject to availability or charged separately before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="24/7 reception desks with early arrival options"
    />
  );
}
