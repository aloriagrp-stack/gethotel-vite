import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityFlightLanding from "@/components/flights/CityFlightLanding";
import { FLIGHT_CITIES, getFlightCityBySlug } from "@/data/flightCitiesData";
import {
  buildFAQSchema,
  buildBreadcrumbSchema,
  SITE,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return FLIGHT_CITIES.map((c) => ({
    city: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const cityData = getFlightCityBySlug(resolvedParams.city);

  if (!cityData) {
    return {
      title: "Flight Search | GetHotelStays",
      description: "Compare cheap flight deals on GetHotelStays.",
    };
  }

  const canonicalUrl = `${SITE.url}/flights-from/${cityData.slug}/`;

  return {
    title: {
      absolute: cityData.metaTitle,
    },
    description: cityData.metaDescription,
    keywords: cityData.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cityData.metaTitle,
      description: cityData.metaDescription,
      url: canonicalUrl,
      siteName: SITE.name,
      images: [
        {
          url: `${SITE.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `Cheap Flights from ${cityData.name} (${cityData.iata}) — GetHotelStays`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: cityData.metaTitle,
      description: cityData.metaDescription,
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
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const cityData = getFlightCityBySlug(resolvedParams.city);

  if (!cityData) {
    notFound();
  }

  const faqSchema = buildFAQSchema(cityData.faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Flights", url: "/flights" },
    { name: `Flights from ${cityData.name}`, url: `/flights-from/${cityData.slug}` },
  ]);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `GetHotelStays — Flights from ${cityData.name} (${cityData.iata})`,
    url: `${SITE.url}/flights-from/${cityData.slug}`,
    applicationCategory: "TravelApplication",
    operatingSystem: "All",
    description: `Compare real-time airfares from ${cityData.airportName} (${cityData.iata}) across 100+ airlines. Lowest ticket prices guaranteed with instant e-ticket issuance.`,
    provider: {
      "@type": "TravelAgency",
      name: SITE.name,
      url: SITE.url,
      telephone: SITE.phone,
      email: SITE.email,
    },
  };

  const routesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Popular Flights from ${cityData.name} (${cityData.iata})`,
    itemListElement: cityData.routes.map((r, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `Flight from ${cityData.name} (${cityData.iata}) to ${r.to} (${r.toCode})`,
      description: `${r.type} flight from ${cityData.name} to ${r.to} starting at ${r.price} with duration of ${r.duration}.`,
    })),
  };

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(routesSchema) }}
      />
      <CityFlightLanding cityData={cityData} />
    </>
  );
}
