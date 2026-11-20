import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Karol Bagh Delhi — Shopping & Family Stays from ₹999 | GetHotelStays",
  description:
    "Explore hotels in Karol Bagh, Delhi for shopping, family visits and business trips. Compare room details, location, policies and total prices.",
  keywords: [
    "hotels in Karol Bagh Delhi",
    "budget hotels in Karol Bagh",
    "family hotels Karol Bagh",
    "places to stay Karol Bagh",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-karol-bagh-delhi",
  },
  openGraph: {
    title: "Hotels in Karol Bagh, Delhi | Compare Rooms & Book Online",
    description:
      "Explore hotels in Karol Bagh, Delhi for shopping, family visits and business trips. Compare room details, location, policies and total prices.",
    url: "https://gethotelstays.com/hotels-in-karol-bagh-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Choose a location that suits your plans",
    paragraphs: [
      "Karol Bagh is a busy Delhi neighbourhood known for shopping and local commerce. Pick a property based on the places you plan to visit and check its exact address and route rather than relying only on the neighbourhood name.",
    ],
  },
  {
    h2: "Compare comfort and practical facilities",
    paragraphs: [
      "Review occupancy, bed type, air conditioning, Wi-Fi, lift access, parking and other facilities only as listed for the individual property. If a feature is essential, confirm it before booking.",
    ],
  },
  {
    h2: "Know the full price and rules",
    paragraphs: [
      "Enter your dates and guest count to compare relevant options. Read the cancellation terms, check-in window, identification requirements and final price before completing the reservation.",
    ],
  },
];

const FAQS = [
  {
    "question": "Why choose Karol Bagh for a hotel in Delhi?",
    "answer": "Karol Bagh is famous for its vibrant shopping streets (Ajmal Khan Road, Gaffar Market), premier vegetarian dining, and direct Blue Line metro connectivity to CP and Dwarka."
  },
  {
    "question": "Are Karol Bagh hotels couple friendly on GetHotelStays?",
    "answer": "Yes. Verified Karol Bagh hotels welcome couples with valid local photo IDs and provide sanitised, private rooms with 12% deposit booking."
  }
];

const INTERNAL_LINKS = [
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 Hotels in Paharganj Delhi", href: "/hotels-in-paharganj-delhi" },
  { label: "🏛️ Hotels in Connaught Place Delhi", href: "/hotels-in-connaught-place-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.karolBagh);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-karol-bagh-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-karol-bagh-delhi"
      breadcrumbLabel="Hotels in Karol Bagh"
      badgeText="WEA, Saraswati Marg & Ajmal Khan Road"
      badgeIcon={<ShoppingBag className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in Karol Bagh, Delhi | Compare Rooms & Book Online"
      heroCopy="Looking for a hotel in Karol Bagh, Delhi? Compare available stays by location, room type, facilities and total price. Whether you're visiting for shopping, family plans or work, review the property's details and check-in policies before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Near Karol Bagh Metro (Blue Line) & local shopping markets"
    />
  );
}
