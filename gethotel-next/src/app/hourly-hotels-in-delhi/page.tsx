import type { Metadata } from "next";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHotelsByIds, DELHI_LANDING_HOTEL_MAP } from "@/lib/delhiHotelsHelper";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Hourly Hotels in Delhi | Book a Room for a Few Hours",
  description:
    "Find hotels in Delhi for short stays by the hour. Compare available properties, check current rates and policies, and book your preferred room online with GetHotelStays.",
  keywords: [
    "hourly hotels in Delhi",
    "hotels for a few hours in Delhi",
    "short stay hotels Delhi",
    "day-use hotel Delhi",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hourly-hotels-in-delhi",
  },
  openGraph: {
    title: "Hourly Hotels in Delhi | Book a Room for a Few Hours",
    description:
      "Find hotels in Delhi for short stays by the hour. Compare available properties and book online.",
    url: "https://gethotelstays.com/hourly-hotels-in-delhi",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const SECTIONS = [
  {
    h2: "Find a stay that fits your schedule",
    paragraphs: [
      "An hourly hotel can be useful when you need a private place to rest, freshen up between appointments, work quietly or bridge a gap between arrival and departure. Availability and minimum booking duration vary by property, so select your date and check-in time before choosing a room.",
    ],
  },
  {
    h2: "Choose by location, timing and total price",
    paragraphs: [
      "Start with the part of Delhi you need to be in. Review the listed room facilities, permitted occupancy, check-in window, taxes and fees, and cancellation policy. A low headline rate is only useful if the room is available for the hours you need.",
    ],
  },
  {
    h2: "Book directly on GetHotelStays",
    paragraphs: [
      "Select an available property, enter your stay details and review the complete booking summary before payment or confirmation. Keep the confirmation details handy and contact the property or platform support if your arrival time changes.",
    ],
  },
];

const FAQS = [
  {
    question: "Can I book a hotel in Delhi for only a few hours?",
    answer:
      "Some properties may offer hourly or short-duration stays. Check the property's available duration and time slots on the listing before booking.",
  },
  {
    question: "Are hourly hotel bookings available all day?",
    answer:
      "Not necessarily. Availability, check-in windows and minimum duration depend on each property and the selected date.",
  },
  {
    question: "What documents do I need to check in?",
    answer:
      "Requirements vary by property. Review the listing and confirm which valid government-issued identification documents are accepted before booking.",
  },
  {
    question: "Is the displayed price the final price?",
    answer:
      "Review the checkout summary for taxes, fees, duration and any other charges before confirming.",
  },
  {
    question: "Can I cancel an hourly booking?",
    answer:
      "Cancellation rules differ by property and rate plan. Read the cancellation terms shown for your selected booking before payment.",
  },
  {
    question: "How do I book an hourly hotel on GetHotelStays?",
    answer:
      "Choose your location, date and time, compare available properties, review the policies and complete the booking flow on GetHotelStays.",
  },
];

const INTERNAL_LINKS = [
  { label: "✈️ Hotels Near Delhi Airport", href: "/hotels-near-delhi-airport" },
  { label: "🚆 Hotels Near New Delhi Railway Station", href: "/hotels-near-new-delhi-railway-station" },
  { label: "🌅 Early Check-in Hotels in Delhi", href: "/early-check-in-hotels-in-delhi" },
  { label: "❤️ Couple Friendly Hotels in Delhi", href: "/couple-friendly-hotels-in-delhi" },
  { label: "📍 All Hotels in Delhi", href: "/hotels/delhi" },
];

export default function Page() {
  const hotels = getHotelsByIds(DELHI_LANDING_HOTEL_MAP.hourly);

  return (
    <LandingPageTemplate
      pageSlug="hourly-hotels-in-delhi"
      canonicalUrl="https://gethotelstays.com/hourly-hotels-in-delhi"
      breadcrumbLabel="Hourly Hotels in Delhi"
      badgeText="Flexible 3h / 6h / 12h Micro-Stays"
      badgeIcon={<Clock className="w-3.5 h-3.5 text-brand-600" />}
      h1="Hourly Hotels in Delhi | Book a Room for a Few Hours"
      heroCopy="Need a room in Delhi for just a few hours? Explore available short-stay hotels on GetHotelStays, compare the details that matter, and book online. Check each property's available time slots, total price, identification requirements and cancellation terms before confirming."
      sections={SECTIONS}
      faqs={FAQS}
      internalLinks={INTERNAL_LINKS}
      hotels={hotels}
      locationNote="Flexible short stay options available"
    />
  );
}
