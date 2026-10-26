import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near Sir Ganga Ram Hospital, Delhi | Book a Stay",
  description:
    "Find accommodation near Sir Ganga Ram Hospital in Delhi for patient attendants and hospital visits. Check location, room details and booking policies.",
  keywords: [
    "hotels near Sir Ganga Ram Hospital",
    "accommodation near Ganga Ram Hospital Delhi",
    "rooms near Sir Ganga Ram Hospital",
    "hotels near BLK hospital",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-ganga-ram-hospital",
  },
  openGraph: {
    title: "Hotels Near Sir Ganga Ram Hospital, Delhi | Book a Stay",
    description:
      "Find accommodation near Sir Ganga Ram Hospital in Delhi for patient attendants and hospital visits. Check location, room details and booking policies.",
    url: "https://gethotelstays.com/hotels-near-ganga-ram-hospital",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Reduce travel uncertainty around a hospital visit",
    paragraphs: [
      "When appointments or visiting hours shape your day, the hotel's actual route matters. Check the address and current travel options, and allow time for traffic and hospital access.",
    ],
  },
  {
    h2: "Prioritize practical comfort",
    paragraphs: [
      "Review room occupancy, lift access, air conditioning, Wi-Fi and other listed facilities according to your needs. If mobility access, quiet surroundings or specific arrangements are essential, confirm them directly with the property.",
    ],
  },
  {
    h2: "Keep plans flexible where possible",
    paragraphs: [
      "Hospital schedules can change. Read cancellation and modification rules carefully, and check whether your selected rate permits changes before confirming.",
    ],
  },
];

const FAQS = [
  {
    question: "Where should I stay when visiting Sir Ganga Ram Hospital?",
    answer:
      "Choose a property based on its verified address and route to the hospital entrance you need. Confirm travel arrangements for your visit time.",
  },
  {
    question: "Are there hotels for patient attendants?",
    answer:
      "Accommodation may be available in the surrounding area, but facilities and policies vary by property. Review the listing and confirm any specific needs.",
  },
  {
    question: "Can I book for one night or a short stay?",
    answer:
      "Available durations depend on the property and booking options shown for your dates.",
  },
  {
    question: "Can I cancel if a hospital appointment changes?",
    answer:
      "That depends on the rate's cancellation and modification terms. Read them before booking and choose a flexible option if available and suitable.",
  },
  {
    question: "Do properties provide wheelchair access or lifts?",
    answer:
      "Accessibility features vary. Check the listing and contact the property to confirm exact access arrangements.",
  },
  {
    question: "Are the hotels affiliated with the hospital?",
    answer:
      "Do not assume affiliation. Confirm any claimed relationship directly with the hospital or property; GetHotelStays listings should not imply endorsement without evidence.",
  },
];

const INTERNAL_LINKS = [
  { label: "🏥 Hotels Near AIIMS Delhi", href: "/hotels-near-aiims-delhi" },
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.gangaRamHospital);

  return (
    <LandingPageTemplate
      pageSlug="hotels-near-ganga-ram-hospital"
      canonicalUrl="https://gethotelstays.com/hotels-near-ganga-ram-hospital"
      breadcrumbLabel="Hotels Near Sir Ganga Ram Hospital"
      badgeText="Accommodation for Patient Attendants & Family Visits"
      badgeIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hotels Near Sir Ganga Ram Hospital, Delhi | Book a Stay"
      heroCopy="Visiting Sir Ganga Ram Hospital in Delhi? Compare nearby accommodation for appointments, treatment visits or supporting a family member. Check each property's exact address, travel route, check-in policy and total price before booking on GetHotelStays."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Close proximity to Sir Ganga Ram & BLK-Max Super Speciality Hospital"
    />
  );
}
