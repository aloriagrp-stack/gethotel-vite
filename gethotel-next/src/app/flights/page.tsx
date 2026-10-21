import type { Metadata } from "next";
import Flights from "@/pages-legacy/Flights";
import {
  PAGE_SEO,
  FLIGHTS_FAQS,
  POPULAR_DOMESTIC_ROUTES,
  POPULAR_INTL_ROUTES,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildFlightServiceSchema,
  buildFlightRoutesSchema,
  SITE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Book Cheap Flights Online: Compare Airfare Deals | GetHotelStays",
  },
  description: PAGE_SEO.flights.description,
  keywords: PAGE_SEO.flights.keywords,
  alternates: {
    canonical: `${SITE.url}/flights`,
  },
  openGraph: {
    title: PAGE_SEO.flights.title,
    description: PAGE_SEO.flights.description,
    url: `${SITE.url}/flights`,
    siteName: SITE.name,
    images: [
      {
        url: `${SITE.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "GetHotelStays Flights Metasearch — Best Airfare Deals",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.flights.title,
    description: PAGE_SEO.flights.description,
    images: [`${SITE.url}/og-image.jpg`],
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

export default function Page() {
  const faqSchema = buildFAQSchema(FLIGHTS_FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Flights", url: "/flights" },
  ]);
  const flightServiceSchema = buildFlightServiceSchema();
  const routesSchema = buildFlightRoutesSchema([
    ...POPULAR_DOMESTIC_ROUTES,
    ...POPULAR_INTL_ROUTES,
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flightServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(routesSchema) }}
      />
      <Flights />
    </>
  );
}

