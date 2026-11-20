import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Couple-Friendly Hotels in Delhi — Local ID Accepted & Pay 12% Deposit | GetHotelStays",
  description:
    "Explore couple-friendly hotel options in Delhi. Review each property's guest, identification and check-in policies, compare prices and book online.",
  keywords: [
    "couple friendly hotels in Delhi",
    "hotels for couples in Delhi",
    "unmarried couples hotels Delhi",
    "couple stay Delhi",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/couple-friendly-hotels-in-delhi",
  },
  openGraph: {
    title: "Couple-Friendly Hotels in Delhi | Check Policies & Book",
    description:
      "Explore couple-friendly hotel options in Delhi. Review each property's guest, identification and check-in policies, compare prices and book online.",
    url: "https://gethotelstays.com/couple-friendly-hotels-in-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Check the property's policy before you book",
    paragraphs: [
      "A property's acceptance policy may depend on guest age, valid identification and its own terms. Read the listing carefully and contact the property if any requirement is unclear. Do not assume that every hotel follows the same policy.",
    ],
  },
  {
    h2: "Prioritize transparent and reliable details",
    paragraphs: [
      "Review the full address, room description, amenities, payment terms and cancellation policy. A clear listing helps you choose a stay that matches your needs and reduces surprises at check-in.",
    ],
  },
  {
    h2: "Complete the booking with accurate guest details",
    paragraphs: [
      "Enter the correct guest count and stay dates. Bring the valid identification documents required by the property, and ensure all guests meet its stated check-in conditions.",
    ],
  },
];

const FAQS = [
  {
    "question": "Do hotels in Delhi accept unmarried couples?",
    "answer": "Yes, absolutely. Under Indian law and Supreme Court rulings, no law prevents two consenting adult citizens (18+) from staying together in a hotel room. On GetHotelStays, all hotels tagged couple-friendly explicitly welcome unmarried couples without moral policing, intrusive questions, or discrimination."
  },
  {
    "question": "Is local Delhi ID accepted for couple check-in?",
    "answer": "Yes. Every couple-friendly hotel on GetHotelStays explicitly accepts valid government photo ID cards including Delhi state Aadhaar cards, Voter IDs, and Driving Licenses for both adult guests."
  },
  {
    "question": "How does payment work for couple-friendly hotel bookings?",
    "answer": "GetHotelStays uses a unique Pay 12% Deposit model. You only pay a 12% deposit online to lock in your reservation, and settle the remaining 88% at hotel reception during check-in via cash, UPI, or credit/debit card."
  },
  {
    "question": "Are rooms clean, secure, and private?",
    "answer": "Yes. All properties undergo strict verification ensuring private check-in, 100% guest confidentiality, sanitized rooms with attached washrooms, and zero third-party disclosure of your personal details."
  },
  {
    "question": "Can I book a room for only a few hours (hourly stay)?",
    "answer": "Yes. GetHotelStays provides flexible micro-stays in Delhi (3-hour, 6-hour, and 12-hour slots) starting from ₹399 in popular areas like Mahipalpur, Aerocity, Paharganj, Saket, and Karol Bagh."
  },
  {
    "question": "Can I cancel my couple-friendly booking if plans change?",
    "answer": "Yes. GetHotelStays offers transparent cancellation policies. Most verified rooms can be cancelled prior to check-in with complete deposit refund."
  }
];

const INTERNAL_LINKS = [
  { label: "🌟 Hotels in South Delhi", href: "/hotels-in-south-delhi" },
  { label: "🏛️ Hotels in Connaught Place Delhi", href: "/hotels-in-connaught-place-delhi" },
  { label: "🛍️ Hotels in Karol Bagh Delhi", href: "/hotels-in-karol-bagh-delhi" },
  { label: "⚡ Hourly Hotels in Delhi", href: "/hourly-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.coupleFriendly);

  return (
    <LandingPageTemplate
      pageSlug="couple-friendly-hotels-in-delhi"
      canonicalUrl="https://gethotelstays.com/couple-friendly-hotels-in-delhi"
      breadcrumbLabel="Couple-Friendly Hotels in Delhi"
      badgeText="Adult Guests (18+) • Transparent Policies"
      badgeIcon={<Heart className="w-3.5 h-3.5 text-brand-600" />}
      h1="Couple-Friendly Hotels in Delhi | Check Policies & Book"
      heroCopy="Planning a stay as a couple in Delhi? Compare available properties on GetHotelStays and review each hotel's guest policy, valid ID requirements, check-in rules and cancellation terms before booking. Policies can vary, so confirm the rules for your selected property and dates."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Guest and check-in policies verified on listing"
    />
  );
}
