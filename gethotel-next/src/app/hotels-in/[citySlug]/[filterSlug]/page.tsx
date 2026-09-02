import type { Metadata } from "next";
import CityPage from "@/pages-legacy/destinations/CityPage";
import { CITIES, getCityBySlug, getCitySEO } from "@/lib/cityData";

const SUPPORTED_FILTERS = ["budget", "luxury", "couple-friendly", "hourly"];

export function generateStaticParams() {
  const citySlugs = [...CITIES.map((c) => c.slug), "delhi"];
  const params: { citySlug: string; filterSlug: string }[] = [];

  for (const citySlug of citySlugs) {
    for (const filterSlug of SUPPORTED_FILTERS) {
      params.push({ citySlug, filterSlug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string; filterSlug: string }>;
}): Promise<Metadata> {
  const { citySlug, filterSlug } = await params;
  const cityData = getCityBySlug(citySlug);

  if (!cityData) {
    return {
      title: "Hotels & Stays | GetHotelStays",
      description: "Book verified hotels in India at best prices. Pay 12% online, rest at check-in.",
    };
  }

  const seo = getCitySEO(cityData, filterSlug);
  const canonical = `https://gethotelstays.com/hotels-in/${citySlug}/${filterSlug}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ citySlug: string; filterSlug: string }>;
}) {
  const { citySlug, filterSlug } = await params;
  return <CityPage citySlugOverride={citySlug} filterSlugOverride={filterSlug} />;
}
