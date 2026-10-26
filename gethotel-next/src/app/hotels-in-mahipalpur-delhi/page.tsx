import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Plane } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Mahipalpur, Delhi | Airport-Area Stays",
  description:
    "Compare hotels in Mahipalpur, Delhi for airport transit and overnight stays. Check the exact address, room details, check-in rules and total price.",
  keywords: [
    "hotels in Mahipalpur Delhi",
    "hotels near Delhi airport Mahipalpur",
    "budget hotels Mahipalpur",
    "Mahipalpur airport hotels",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-mahipalpur-delhi",
  },
  openGraph: {
    title: "Hotels in Mahipalpur, Delhi | Airport-Area Stays",
    description:
      "Compare hotels in Mahipalpur, Delhi for airport transit and overnight stays. Check the exact address, room details, check-in rules and total price.",
    url: "https://gethotelstays.com/hotels-in-mahipalpur-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Compare the actual route to the airport",
    paragraphs: [
      "Mahipalpur is an airport-area neighbourhood, but individual properties can differ in distance, road access and transfer time. Verify the address and route for your terminal and travel time.",
    ],
  },
  {
    h2: "Choose a room for your travel window",
    paragraphs: [
      "Check whether the available booking matches your arrival and departure times. If you need a few hours, confirm that short-stay options are explicitly available; do not assume an overnight rate covers a daytime window.",
    ],
  },
  {
    h2: "Review all charges and policies",
    paragraphs: [
      "Compare total price, facilities, guest requirements, check-in arrangements and cancellation terms. Confirm transfer service availability and fees directly if you need it.",
    ],
  },
];

const FAQS = [
  {
    question: "Is Mahipalpur a good area for an airport stay?",
    answer:
      "It may be convenient for some airport itineraries, but the right choice depends on the property's exact location and your terminal.",
  },
  {
    question: "How far is a Mahipalpur hotel from IGI Airport?",
    answer:
      "Distance and travel time vary by property, route, terminal and traffic. Check the specific address and current route rather than relying on a general estimate.",
  },
  {
    question: "Are budget hotels available in Mahipalpur?",
    answer:
      "Rates and available room types vary. Compare current listings and the complete price for your dates.",
  },
  {
    question: "Do hotels provide airport pickup?",
    answer:
      "Transfer arrangements vary by property and may cost extra. Confirm availability, pickup location and price before relying on the service.",
  },
  {
    question: "Can I book for a daytime layover?",
    answer:
      "Only if the listing offers a compatible short-stay duration and time slot. Check the booking details before payment.",
  },
  {
    question: "What if my flight is delayed?",
    answer:
      "Contact the property as soon as possible. Whether a late arrival or change is accommodated depends on the property's policy and booking terms.",
  },
];

const INTERNAL_LINKS = [
  { label: "✈️ Hotels Near Delhi Airport", href: "/hotels-near-delhi-airport" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.mahipalpur);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-mahipalpur-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-mahipalpur-delhi"
      breadcrumbLabel="Hotels in Mahipalpur"
      badgeText="Airport-Adjacent Budget & Transit Stays"
      badgeIcon={<Plane className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in Mahipalpur, Delhi | Airport-Area Stays"
      heroCopy="Need a hotel in Mahipalpur, Delhi? Compare available stays for airport transit, late arrivals and overnight visits. Check each property's exact location, route to IGI Airport, room details and total price before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Mahipalpur area, minutes from IGI Airport & Aerocity"
    />
  );
}
