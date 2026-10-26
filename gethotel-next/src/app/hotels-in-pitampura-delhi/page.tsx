import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Pitampura, Delhi | Business & Event Stays",
  description:
    "Compare hotels in Pitampura, Delhi for business visits, family stays and local events. Check property details, location, policies and total price.",
  keywords: [
    "hotels in Pitampura Delhi",
    "hotels near Pitampura",
    "business hotels Pitampura",
    "hotels for events in Pitampura",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-pitampura-delhi",
  },
  openGraph: {
    title: "Hotels in Pitampura, Delhi | Business & Event Stays",
    description:
      "Compare hotels in Pitampura, Delhi for business visits, family stays and local events. Check property details, location, policies and total price.",
    url: "https://gethotelstays.com/hotels-in-pitampura-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Choose based on your venue or meeting",
    paragraphs: [
      "Pitampura and nearby North-West Delhi locations serve different itineraries. Compare the hotel's address and route to your meeting venue, event space or family destination before booking.",
    ],
  },
  {
    h2: "Check business and event-related needs",
    paragraphs: [
      "Review room capacity, Wi-Fi, parking, check-in times and invoice requirements where listed. If you need banquet or event facilities, verify that the specific property offers them; do not infer this from location alone.",
    ],
  },
  {
    h2: "Review the booking terms",
    paragraphs: [
      "Enter your dates and occupancy, compare the total price and read the cancellation, identification and check-in rules. For a major event, confirm room availability before making non-refundable plans.",
    ],
  },
];

const FAQS = [
  {
    question: "Are there hotels in Pitampura for business travellers?",
    answer:
      "Check current listings for location, facilities and booking terms that suit your trip.",
  },
  {
    question: "Can I find a hotel near an event venue in Pitampura?",
    answer:
      "Use the venue's exact address to compare routes and confirm the hotel's location.",
  },
  {
    question: "Does a hotel listing mean it has banquet facilities?",
    answer:
      "No. Banquet and event facilities must be explicitly listed and confirmed with the property.",
  },
  {
    question: "Is City Park a four-star hotel?",
    answer:
      "Use a star classification only if it is verified from a reliable, current source and accurately reflects the listed property. Do not infer a rating from the name.",
  },
  {
    question: "Can I book several rooms for a function?",
    answer:
      "Group availability and terms vary. Check the available inventory and confirm special arrangements with the property.",
  },
  {
    question: "What should I check before confirming?",
    answer:
      "Review the address, facilities, guest capacity, total price, check-in policy and cancellation terms.",
  },
];

const INTERNAL_LINKS = [
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.pitampura);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-pitampura-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-pitampura-delhi"
      breadcrumbLabel="Hotels in Pitampura"
      badgeText="North-West Delhi • Business & Event Stays"
      badgeIcon={<Building2 className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in Pitampura, Delhi | Business & Event Stays"
      heroCopy="Planning a business visit, family trip or event in Pitampura, Delhi? Compare available accommodation by exact location, room details, facilities and total price. Review each property's policies and book online with GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Pitampura, Netaji Subhash Place & TV Tower area"
    />
  );
}
