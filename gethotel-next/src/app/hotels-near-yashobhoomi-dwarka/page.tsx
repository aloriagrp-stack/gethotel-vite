import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near Yashobhoomi, Dwarka, Delhi | Book a Stay",
  description:
    "Find accommodation near Yashobhoomi Convention Centre in Dwarka, Delhi. Compare location, facilities, check-in rules and total prices for your event dates.",
  keywords: [
    "hotels near Yashobhoomi",
    "hotels near Yashobhoomi Dwarka",
    "accommodation near India International Convention and Expo Centre",
    "hotels in Dwarka Delhi",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-yashobhoomi-dwarka",
  },
  openGraph: {
    title: "Hotels Near Yashobhoomi, Dwarka, Delhi | Book a Stay",
    description:
      "Find accommodation near Yashobhoomi Convention Centre in Dwarka, Delhi. Compare location, facilities, check-in rules and total prices for your event dates.",
    url: "https://gethotelstays.com/hotels-near-yashobhoomi-dwarka",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Book around your event schedule",
    paragraphs: [
      "Event dates can create concentrated demand. Check availability for the exact nights you need, and compare arrival time, cancellation terms and the property's route to the venue.",
    ],
  },
  {
    h2: "Verify the route and venue entrance",
    paragraphs: [
      "The best option depends on the event entrance, your transport plan and the hotel's address. Review the map and allow time for traffic, security checks and event entry.",
    ],
  },
  {
    h2: "Plan for teams and longer days",
    paragraphs: [
      "For business travel, check occupancy, bed configuration, Wi-Fi and invoice needs where applicable. Confirm group requirements and any special arrangements with the property before booking.",
    ],
  },
];

const FAQS = [
  {
    question: "How do I choose a hotel near Yashobhoomi?",
    answer:
      "Compare the property's exact address and route to the venue entrance relevant to your event.",
  },
  {
    question: "Should I book early for an exhibition?",
    answer:
      "Booking early can give you more choice, but availability and rates depend on the event and dates. Check current inventory.",
  },
  {
    question: "Are hotels in Dwarka all close to Yashobhoomi?",
    answer:
      "No. Dwarka covers a broad area. Verify the individual address and route before choosing.",
  },
  {
    question: "Can I book multiple rooms for a team?",
    answer:
      "Availability and group booking terms vary by property. Check the booking flow and contact the property for arrangements that are not shown.",
  },
  {
    question: "Can I cancel if an event schedule changes?",
    answer:
      "Cancellation and modification terms depend on the selected rate. Review them before confirming.",
  },
  {
    question: "Are transfers to Yashobhoomi included?",
    answer:
      "Do not assume so. Confirm any shuttle or transfer service and charges directly with the property.",
  },
];

const INTERNAL_LINKS = [
  { label: "✈️ Hotels Near Delhi Airport", href: "/hotels-near-delhi-airport" },
  { label: "📍 Hotels in Mahipalpur Delhi", href: "/hotels-in-mahipalpur-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.yashobhoomiDwarka);

  return (
    <LandingPageTemplate
      pageSlug="hotels-near-yashobhoomi-dwarka"
      canonicalUrl="https://gethotelstays.com/hotels-near-yashobhoomi-dwarka"
      breadcrumbLabel="Hotels Near Yashobhoomi Dwarka"
      badgeText="India International Convention & Expo Centre (IICC)"
      badgeIcon={<Building className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels Near Yashobhoomi, Dwarka, Delhi | Book a Stay"
      heroCopy="Attending an exhibition, conference or event at Yashobhoomi in Dwarka? Compare available hotels for your event dates, check the route to the venue and review room details before booking online with GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Dwarka Sector 13 & 25 corridor near Yashobhoomi & Metro"
    />
  );
}
