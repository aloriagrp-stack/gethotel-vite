import type { Metadata } from "next";
import CityPage from "@/pages-legacy/destinations/CityPage";
import { CITIES, getCityBySlug, getCitySEO } from "@/lib/cityData";

export function generateStaticParams() {
  const slugs = CITIES.map((c) => ({ citySlug: c.slug }));
  slugs.push({ citySlug: "delhi" });
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string }>;
}): Promise<Metadata> {
  const { citySlug } = await params;
  const cityData = getCityBySlug(citySlug);

  if (!cityData) {
    return {
      title: "Hotels in India | GetHotelStays",
      description: "Book verified hotels in India at best prices. Pay 12% online, rest at hotel.",
    };
  }

  const seo = getCitySEO(cityData);
  const canonical = `https://gethotelstays.com/hotels-in/${citySlug}`;

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
  params: Promise<{ citySlug: string }>;
}) {
  const { citySlug } = await params;
  return <CityPage citySlugOverride={citySlug} />;
}
