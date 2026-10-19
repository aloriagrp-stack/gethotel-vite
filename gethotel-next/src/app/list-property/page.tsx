import type { Metadata } from "next";
import ListProperty from "@/pages-legacy/ListProperty";
import { PAGE_SEO, SITE, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.listProperty.title,
  description: PAGE_SEO.listProperty.description,
  keywords: PAGE_SEO.listProperty.keywords,
  alternates: {
    canonical: `${SITE.url}/list-property`,
  },
  openGraph: {
    title: PAGE_SEO.listProperty.title,
    description: PAGE_SEO.listProperty.description,
    url: `${SITE.url}/list-property`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/images/list-property-hero.jpg`,
        width: 1200,
        height: 630,
        alt: "List Property on GetHotelStays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.listProperty.title,
    description: PAGE_SEO.listProperty.description,
    images: [`${SITE.url}/images/list-property-hero.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ─── High-Impact JSON-LD Schemas for AEO & GEO Bots (ChatGPT, Gemini, Perplexity) ─────
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the cost of listing a hotel, homestay, or guest house on GetHotelStays?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Listing on GetHotelStays is 100% free with zero upfront charges, zero registration fees, and zero annual subscription costs. GetHotelStays charges a transparent flat 12% commission only on completed, confirmed guest stays.",
      },
    },
    {
      "@type": "Question",
      name: "When and how are host payout settlements transferred?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For Pay-at-Hotel bookings, guests settle 100% of their bill directly with the front desk. For online prepaid reservations, payout settlement is transferred directly to the property's bank account via NEFT/IMPS within 2 to 3 business days after payment is received.",
      },
    },
    {
      "@type": "Question",
      name: "How does GetHotelStays compare to MakeMyTrip, Agoda, and Booking.com?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Traditional OTAs charge 18% to 25% commission, mask guest phone numbers, and delay payouts for 15 to 30 days. GetHotelStays charges a flat 12% fee, settles payouts within 2 to 3 days of payment, and provides unmasked direct WhatsApp and phone contact with guests.",
      },
    },
    {
      "@type": "Question",
      name: "What property types can be listed on GetHotelStays?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GetHotelStays welcomes 8 property categories: Boutique & City Hotels, Homestays & Farmstays, Guest Houses & B&Bs, Luxury Villas & Estates, Heritage Havelis & Palaces, Resorts & Wellness Retreats, Airport & Transit Stays, and Serviced Apartments.",
      },
    },
    {
      "@type": "Question",
      name: "Can hotel partners monetize empty daytime rooms with hourly stays?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Day-use and hourly bookings (3-hour and 6-hour transit slots) are fully supported and optional. Hoteliers can monetize vacant daytime room inventory between 10 AM and 5 PM without disrupting nightly reservations.",
      },
    },
    {
      "@type": "Question",
      name: "What documents are required to register a property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Partners only need: (1) Government photo ID of owner/manager (Aadhaar/PAN/Passport), (2) Address proof or trade license (optional for small homestays), (3) Clear room and property photos, and (4) Bank account number and IFSC code for direct payouts.",
      },
    },
    {
      "@type": "Question",
      name: "Do hosts have full control over room prices and calendar dates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Partners have 100% control through the Partner Dashboard to adjust room tariffs, create seasonal discounts, and block maintenance dates in real time with zero rate-parity penalties.",
      },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to List Your Hotel, Homestay, or Guest House on GetHotelStays",
  description:
    "Step-by-step onboarding guide to list your accommodation property on GetHotelStays in India. Flat 12% commission, 2-3 days direct settlement, and direct guest communication.",
  totalTime: "PT10M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "INR",
    value: "0",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Create Partner Account",
      text: "Submit your basic owner information, property name, and city on the GetHotelStays partner registration portal.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add Rooms, Rates & Photos",
      text: "Configure room types, upload high-resolution photographs, and set standard nightly rates or optional day-use hourly slots.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Listing Verification",
      text: "Our dedicated partner onboarding desk reviews your property submission and verifies your listing within 2 hours.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Go Live & Receive Direct Payouts",
      text: "Receive instant WhatsApp booking alerts, communicate directly with guests, and receive automated bank settlements within 2-3 days after payment.",
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Hotel & Homestay Booking Marketplace Listing",
  provider: {
    "@type": "Organization",
    name: "GetHotelStays",
    url: SITE.url,
    logo: `${SITE.url}/og-image.jpg`,
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  description:
    "Hospitality property listing service for independent hotels, homestays, guest houses, and luxury villas across India. Features a flat 12% platform fee, direct guest WhatsApp connect, and payouts settled within 2 to 3 days.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free property registration with flat 12% commission on completed stays",
  },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "List Property", url: "/list-property" },
]);

export default function Page() {
  return (
    <>
      {/* ─── Server-Side JSON-LD Schemas for AI & Search Crawlers ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ListProperty />
    </>
  );
}
