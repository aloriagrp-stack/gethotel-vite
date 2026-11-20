import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in Paharganj Delhi — Budget Stays Near NDLS & CP from ₹799 | GetHotelStays",
  description:
    "Explore available hotels in Paharganj, Delhi. Compare location, room facilities, check-in policies and total prices before booking online.",
  keywords: [
    "hotels in Paharganj Delhi",
    "budget hotels Paharganj",
    "hotels near New Delhi Railway Station Paharganj",
    "Paharganj rooms",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-paharganj-delhi",
  },
  openGraph: {
    title: "Hotels in Paharganj, Delhi | Compare Available Stays",
    description:
      "Explore available hotels in Paharganj, Delhi. Compare location, room facilities, check-in policies and total prices before booking online.",
    url: "https://gethotelstays.com/hotels-in-paharganj-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "A practical base for exploring Delhi",
    paragraphs: [
      "Paharganj is often considered by travellers looking for accommodation in the New Delhi Railway Station area. Check each hotel's exact location, access route and surroundings to decide whether it suits your plans.",
    ],
  },
  {
    h2: "Compare rooms, not just nightly rates",
    paragraphs: [
      "Review room size and type where provided, occupancy, facilities, house rules and guest requirements. Check the total for your exact dates because prices and availability can change.",
    ],
  },
  {
    h2: "Confirm your arrival arrangements",
    paragraphs: [
      "If arriving late, carrying luggage or travelling with family, check reception hours, access details and the property's policies before confirming your reservation.",
    ],
  },
];

const FAQS = [
  {
    "question": "Is Paharganj safe for family and solo travelers?",
    "answer": "Yes. When booking verified properties through GetHotelStays, you get hand-inspected hotels located on main market lanes and Chitra Gupta Road with CCTV surveillance, 24/7 front desk security, and clean modern rooms."
  },
  {
    "question": "How close is Paharganj to Connaught Place?",
    "answer": "Paharganj is right next to Connaught Place (1.5 km, about 5 minutes by auto or 1 metro station from RK Ashram Marg or NDLS to Rajiv Chowk)."
  },
  {
    "question": "How do I book Paharganj hotels on GetHotelStays?",
    "answer": "Select your dates or hours, pay only 12% advance deposit online via UPI/card, and pay the remaining 88% at the hotel desk upon arrival."
  }
];

const INTERNAL_LINKS = [
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.paharganj);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-paharganj-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-paharganj-delhi"
      breadcrumbLabel="Hotels in Paharganj"
      badgeText="Paharganj Main Bazaar, Arakashan Road & Chuna Mandi"
      badgeIcon={<Building2 className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in Paharganj, Delhi | Compare Available Stays"
      heroCopy="Looking for a stay in Paharganj, Delhi? Compare available properties, review room details and check the route to your destinations. Choose based on your dates, guest needs and total price, then book online with GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Paharganj commercial area, walkable to NDLS Platform 1"
    />
  );
}
