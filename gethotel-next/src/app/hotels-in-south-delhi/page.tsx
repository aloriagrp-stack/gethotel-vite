import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in South Delhi — Premium Stays in Saket, Hauz Khas & GK | GetHotelStays",
  description:
    "Compare hotels in South Delhi for work, university visits, dining and leisure. Check the exact neighbourhood, amenities, policies and total price.",
  keywords: [
    "hotels in South Delhi",
    "hotels in Greater Kailash",
    "hotels near Hauz Khas",
    "South Delhi accommodation",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-in-south-delhi",
  },
  openGraph: {
    title: "Hotels in South Delhi | Compare Stays & Book Online",
    description:
      "Compare hotels in South Delhi for work, university visits, dining and leisure. Check the exact neighbourhood, amenities, policies and total price.",
    url: "https://gethotelstays.com/hotels-in-south-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Choose the right part of South Delhi",
    paragraphs: [
      "South Delhi covers multiple neighbourhoods with different travel patterns. Greater Kailash, Hauz Khas and nearby areas are not interchangeable; check the property's exact address and route to the place you need to visit.",
    ],
  },
  {
    h2: "Match the property to your trip",
    paragraphs: [
      "For work, check location and any listed workspace or Wi-Fi. For leisure, consider transport and nearby plans. For longer visits, review room facilities, guest capacity and applicable house rules.",
    ],
  },
  {
    h2: "Compare total cost before confirming",
    paragraphs: [
      "Rates and availability depend on the date, room type and property. Review taxes, fees, cancellation terms, identification requirements and check-in windows before booking.",
    ],
  },
];

const FAQS = [
  {
    "question": "Which areas in South Delhi have the best hotels?",
    "answer": "Saket, Greater Kailash (GK 1 & 2), Hauz Khas, Nehru Place, and Green Park offer the best combination of safe upscale residential surroundings, trendy cafes, shopping malls, and metro connectivity."
  },
  {
    "question": "Can I book couple-friendly hotels in South Delhi?",
    "answer": "Yes. South Delhi offers our highest-rated couple-friendly boutique stays accepting local IDs with complete privacy and 12% advance deposit."
  }
];

const INTERNAL_LINKS = [
  { label: "🏛️ Hotels in Connaught Place Delhi", href: "/hotels-in-connaught-place-delhi" },
  { label: "❤️ Couple Friendly Hotels in Delhi", href: "/couple-friendly-hotels-in-delhi" },
  { label: "🏥 Hotels Near AIIMS Delhi", href: "/hotels-near-aiims-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.southDelhi);

  return (
    <LandingPageTemplate
      pageSlug="hotels-in-south-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-in-south-delhi"
      breadcrumbLabel="Hotels in South Delhi"
      badgeText="GK, Hauz Khas, Nehru Place & Lajpat Nagar"
      badgeIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels in South Delhi | Compare Stays & Book Online"
      heroCopy="Need a hotel in South Delhi? Start by choosing the neighbourhood closest to your plans, then compare available properties, room facilities and booking terms. GetHotelStays helps you review your options before confirming your stay online."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="South Delhi residential, dining & corporate hubs"
    />
  );
}
