import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { getHourlyHotelsByIds } from "@/lib/delhiHotelsHelper";
import { HOURLY_LOCALITIES, ALL_HOURLY_SLUGS } from "@/lib/hourlyLocalitiesData";
import { Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateStaticParams() {
  return ALL_HOURLY_SLUGS.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const loc = HOURLY_LOCALITIES[slug];

  if (!loc) {
    return {
      title: "Hourly Hotels in Delhi | GetHotelStays",
      description: "Book flexible 3, 6, and 12-hour hotel rooms across Delhi with GetHotelStays.",
    };
  }

  const canonicalUrl = `https://gethotelstays.com/hourly/${loc.slug}/`;

  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: [
      `hourly hotels in ${loc.name} Delhi`,
      `rooms for 3 hours in ${loc.name}`,
      `couple friendly hourly hotels in ${loc.name}`,
      `day use hotel in ${loc.name} Delhi`,
      `micro stay in ${loc.name}`,
      `hotels near ${loc.landmark}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      url: canonicalUrl,
      type: "website",
      images: ["https://gethotelstays.com/og-image.jpg"],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const loc = HOURLY_LOCALITIES[slug];

  if (!loc) {
    notFound();
  }

  const hotels = getHourlyHotelsByIds(loc.hotelIds);
  const canonicalUrl = `https://gethotelstays.com/hourly/${loc.slug}/`;

  // Internal cross-links to related Delhi hourly areas
  const internalLinks = (loc.relatedSlugs || [])
    .filter((s) => HOURLY_LOCALITIES[s])
    .map((s) => ({
      label: `📍 Hourly Hotels in ${HOURLY_LOCALITIES[s].name}`,
      href: `/hourly/${s}/`,
    }));

  return (
    <LandingPageTemplate
      pageSlug={`hourly-${loc.slug}`}
      canonicalUrl={canonicalUrl}
      breadcrumbLabel={`Hourly Hotels in ${loc.name}`}
      badgeText={loc.badgeText}
      badgeIcon={<Clock className="w-3.5 h-3.5 text-brand-600" />}
      h1={loc.h1}
      heroCopy={loc.heroCopy}
      sections={loc.sections}
      faqs={loc.faqs}
      internalLinks={internalLinks}
      hotels={hotels}
      locationNote={`Verified 3h, 6h & 12h Micro-Stays near ${loc.landmark}`}
    />
  );
}
