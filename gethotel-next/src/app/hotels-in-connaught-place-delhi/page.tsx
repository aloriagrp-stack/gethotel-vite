import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Connaught Place, Delhi | Central Delhi Stays",
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
    question: "Why book a hotel in Connaught Place?",
    answer:
      "It may be convenient for central Delhi plans, including meetings, dining and sightseeing. Choose based on the actual locations you need to reach.",
  },
  {
    question: "Are hotels in CP expensive?",
    answer:
      "Rates vary by date, property, room type and demand. Compare total prices for your dates instead of assuming one fixed price.",
  },
  {
    question: "How do I check whether a hotel is actually near CP?",
    answer:
      "Review its full address and map, then compare the route with your itinerary.",
  },
  {
    question: "Can I book a short stay in central Delhi?",
    answer:
      "Some properties may offer short stays. Check the available duration and time slots on each listing.",
  },
  {
    question: "Are parking and Wi-Fi included?",
    answer:
      "Amenities and charges vary by property. Confirm the details on the listing before booking.",
  },
  {
    question: "What is important for a business trip?",
    answer:
      "Check location, Wi-Fi if needed, desk/workspace details where listed, check-in timing, invoice requirements and cancellation terms.",
  },
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
