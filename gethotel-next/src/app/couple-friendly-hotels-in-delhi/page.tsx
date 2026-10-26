import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Couple-Friendly Hotels in Delhi | Check Policies & Book",
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
    question: "Do hotels in Delhi accept unmarried couples?",
    answer:
      "Policies differ by property. Check the specific listing and confirm directly with the hotel before booking.",
  },
  {
    question: "Is local ID accepted?",
    answer:
      "Local-ID acceptance depends on the property's policy and applicable requirements. Verify the accepted documents for the exact property before confirming.",
  },
  {
    question: "What identification is required for couples?",
    answer:
      "Each property's requirements can differ. Check the listing and confirm which valid government-issued IDs are required for all adult guests.",
  },
  {
    question: "Can two adults book a room online?",
    answer:
      "You can select the correct guest count in the booking flow, but the property must permit the stay under its own policies. Verify before payment.",
  },
  {
    question: "Are couple-friendly hotels automatically safer?",
    answer:
      "No label can guarantee safety. Review the property's verified details, policies, location and available support information before booking.",
  },
  {
    question: "Can I cancel if the property's policy does not match my needs?",
    answer:
      "Cancellation eligibility depends on the rate and policy accepted at booking. Confirm requirements before paying to avoid preventable issues.",
  },
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
