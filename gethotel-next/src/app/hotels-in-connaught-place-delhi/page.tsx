import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Connaught Place (CP) Delhi — Central Hub Stays | GetHotelStays",
  description:
    "Find hotels in Connaught Place (CP), Delhi. Compare location, room facilities, check-in policies and total price for business or leisure stays.",
  keywords: [
    "hotels in Connaught Place Delhi",
    "hotels in CP Delhi",
    "places to stay near Connaught Place",
    "central Delhi hotels",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-connaught-place-delhi",
  },
  openGraph: {
    title: "Hotels in Connaught Place, Delhi | Central Delhi Stays",
    description:
      "Find hotels in Connaught Place (CP), Delhi. Compare location, room facilities, check-in policies and total price for business or leisure stays.",
    url: "https://gethotelstays.com/hotels-in-connaught-place-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Make central Delhi work for your itinerary",
    paragraphs: [
      "Connaught Place can suit travellers who need access to central business, dining, shopping or sightseeing areas. Compare the hotel's exact location with your planned destinations and transport options.",
    ],
  },
  {
    h2: "Compare the details that affect your stay",
    paragraphs: [
      "Look at room capacity, amenities, check-in times, payment rules and cancellation terms. Confirm essential facilities with the property if they are not clearly listed.",
    ],
  },
  {
    h2: "Book with clear expectations",
    paragraphs: [
      "Select the correct dates and guest count, review the full checkout amount and keep your confirmation details available. For late arrivals or special requests, confirm the property's arrangements in advance.",
    ],
  },
];

const FAQS = [
  {
    "question": "Why stay in Connaught Place Delhi?",
    "answer": "Connaught Place (CP) is the ultimate central hub of Delhi, surrounded by heritage Georgian architecture, premier dining, shopping, and Rajiv Chowk metro station connecting all parts of Delhi NCR."
  },
  {
    "question": "What is the price range for CP hotels on GetHotelStays?",
    "answer": "Options range from comfortable budget-boutique stays from ₹1,499 to premium business hotels. All feature our 12% advance deposit guarantee."
  }
];

const INTERNAL_LINKS = [
  { label: "🌟 Hotels in South Delhi", href: "/hotels-in-south-delhi" },
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.connaughtPlace);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-connaught-place-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-connaught-place-delhi"
      breadcrumbLabel="Hotels in Connaught Place"
      badgeText="Central Delhi • Rajiv Chowk Interchange"
      badgeIcon={<Landmark className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in Connaught Place, Delhi | Central Delhi Stays"
      heroCopy="Stay close to your plans in central Delhi. Explore available hotels in Connaught Place (CP), compare room details and policies, and check the exact address before booking online with GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Central Delhi location with direct Metro connections"
    />
  );
}
