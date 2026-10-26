import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels in South Delhi | Compare Stays & Book Online",
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
    question: "Which area is best for a South Delhi hotel?",
    answer:
      "Choose the neighbourhood based on your itinerary, transport needs and budget. South Delhi is broad, so compare actual addresses.",
  },
  {
    question: "Can I find boutique hotels in South Delhi?",
    answer:
      "Availability depends on the current inventory and how each property is categorized. Review individual listings for accurate descriptions.",
  },
  {
    question: "Are hotels near Hauz Khas and Greater Kailash the same location?",
    answer:
      "No. They are different areas. Check the property's address and route before booking.",
  },
  {
    question: "How do I compare prices?",
    answer:
      "Enter your exact dates and guest count, then compare the full price and included facilities across available listings.",
  },
  {
    question: "Can I request early check-in?",
    answer:
      "Ask the property and confirm the arrangement before arrival; it may depend on availability and charges.",
  },
  {
    question: "What facilities should I verify?",
    answer:
      "Check the amenities that matter to you—such as Wi-Fi, parking, lift access and room configuration—on the individual listing.",
  },
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
