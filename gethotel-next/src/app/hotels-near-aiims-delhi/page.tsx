import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near AIIMS Delhi | Accommodation for Hospital Visits",
  description:
    "Compare accommodation near AIIMS Delhi for appointments and family visits. Check each hotel's location, accessibility, policies and total price.",
  keywords: [
    "hotels near AIIMS Delhi",
    "accommodation near AIIMS hospital",
    "rooms near AIIMS Delhi",
    "hotels near Safdarjung Hospital",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-aiims-delhi",
  },
  openGraph: {
    title: "Hotels Near AIIMS Delhi | Accommodation for Hospital Visits",
    description:
      "Compare accommodation near AIIMS Delhi for appointments and family visits. Check each hotel's location, accessibility, policies and total price.",
    url: "https://gethotelstays.com/hotels-near-aiims-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Choose based on the correct destination",
    paragraphs: [
      "AIIMS and nearby medical facilities have different entrances and locations. Check which campus, department or hospital you need to visit, then compare the hotel's address and route to that destination.",
    ],
  },
  {
    h2: "Look for facilities that support your visit",
    paragraphs: [
      "Review the property's listed lift access, room occupancy, Wi-Fi and other practical amenities. If accessibility or flexible cancellation is important, confirm the details before you book.",
    ],
  },
  {
    h2: "Plan for changes in appointment timing",
    paragraphs: [
      "Medical visits may involve waiting or schedule changes. Read cancellation and modification terms and confirm check-in arrangements, especially for early arrivals or late departures.",
    ],
  },
];

const FAQS = [
  {
    question: "How do I find a hotel near AIIMS Delhi?",
    answer:
      "Compare each listing's exact address and route to the AIIMS campus or entrance you need.",
  },
  {
    question: "Are there hotels near Safdarjung Hospital too?",
    answer:
      "Accommodation options depend on the current inventory. Verify each property's location and route to the specific hospital you plan to visit.",
  },
  {
    question: "Can patient attendants book nearby rooms?",
    answer:
      "Guests can compare available accommodation, but amenities and policies differ. Contact the property about any specific needs.",
  },
  {
    question: "Can I request an early check-in for a morning appointment?",
    answer:
      "Early check-in is subject to the property's policy and availability. Confirm the arrangement before arrival.",
  },
  {
    question: "What if my appointment date changes?",
    answer:
      "Check the booking's cancellation and modification terms. Choose a flexible rate if available and appropriate for your needs.",
  },
  {
    question: "Are hotels endorsed by AIIMS?",
    answer:
      "Do not assume endorsement or affiliation. Any such claim should be supported by official evidence.",
  },
];

const INTERNAL_LINKS = [
  { label: "🏥 Hotels Near Sir Ganga Ram Hospital", href: "/hotels-near-ganga-ram-hospital" },
  { label: "🌟 Hotels in South Delhi", href: "/hotels-in-south-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.aiimsHospital);

  return (
    <LandingPageTemplate
      pageSlug="hotels-near-aiims-delhi"
      canonicalUrl="https://gethotelstays.com/hotels-near-aiims-delhi"
      breadcrumbLabel="Hotels Near AIIMS Delhi"
      badgeText="Accommodation for Hospital Visits & Patient Attendants"
      badgeIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels Near AIIMS Delhi | Accommodation for Hospital Visits"
      heroCopy="Travelling to AIIMS Delhi for an appointment or to support a family member? Explore nearby accommodation, compare the exact location and room facilities, and review check-in and cancellation rules before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Near AIIMS & Safdarjung Hospital South Delhi corridor"
    />
  );
}
