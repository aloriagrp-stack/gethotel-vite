import type { Metadata } from "next";
import AboutUs from "@/pages-legacy/AboutUs";

export const metadata: Metadata = {
  title: "About Us | GetHotelStays — Our Story, Vision & Leadership",
  description:
    "Discover the story behind GetHotelStays. Founded by Khushal Chand Aloria and Shriyansh Aloria (CEO), part of Aloria Group. Building flexible, verified hotel bookings across India with pay 12% deposit options.",
  keywords: [
    "GetHotelStays",
    "About GetHotelStays",
    "Khushal Chand Aloria",
    "Shriyansh Aloria",
    "Aloria Group",
    "hotel booking platform India",
    "flexible hotel bookings",
    "hourly stays",
    "verified hotels",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/about-us",
  },
  openGraph: {
    title: "About Us | GetHotelStays — Making Travel Easier, One Journey at a Time",
    description:
      "GetHotelStays is a travel platform built to make travel planning easier, hotel bookings more flexible, and travel experiences more convenient. Led by Khushal Chand Aloria & Shriyansh Aloria.",
    url: "https://gethotelstays.com/about-us",
    siteName: "GetHotelStays",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | GetHotelStays",
    description:
      "GetHotelStays is an Indian hotel booking platform offering flexible stays and payment options. Part of Aloria Group.",
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://gethotelstays.com/about-us/#webpage",
      "url": "https://gethotelstays.com/about-us",
      "name": "About Us | GetHotelStays",
      "description":
        "The official story, leadership, and vision of GetHotelStays, founded by Khushal Chand Aloria and Shriyansh Aloria as part of Aloria Group.",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://gethotelstays.com/#website",
        "url": "https://gethotelstays.com",
        "name": "GetHotelStays",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://gethotelstays.com/#organization",
      "name": "GetHotelStays",
      "alternateName": ["GHS", "GetHotelStays.com"],
      "url": "https://gethotelstays.com",
      "logo": "https://gethotelstays.com/logo.png",
      "foundingDate": "2026-04",
      "founders": [
        {
          "@type": "Person",
          "name": "Khushal Chand Aloria",
          "jobTitle": "Co-Founder",
        },
        {
          "@type": "Person",
          "name": "Shriyansh Aloria",
          "jobTitle": "Co-Founder & CEO",
        },
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "Aloria Group",
        "foundingDate": "2025",
      },
      "description":
        "GetHotelStays is a growing hotel booking and travel platform in India offering flexible stay options, hourly and nightly bookings, and flexible payments (pay 12% deposit online, remaining at check-in).",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutUs />
    </>
  );
}
