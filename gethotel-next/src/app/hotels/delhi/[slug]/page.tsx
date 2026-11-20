import type { Metadata } from "next";
import DelhiLandingPage from "@/pages-legacy/delhi/DelhiLandingPage";
import { delhiPages, getDelhiPage, buildDelhiContext, buildDelhiSchemas } from "@/lib/delhiSeo";

export function generateStaticParams() {
  const pages = delhiPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDelhiPage(slug);

  if (!page) {
    return {
      title: { absolute: "Hotels in Delhi | GetHotelStays" },
      description: "Book verified hotels in Delhi at best prices. Pay 12% online, rest at hotel.",
    };
  }

  const ctx = buildDelhiContext([], slug);
  let rawTitle = ctx?.title || page.title;
  rawTitle = rawTitle.replace(/\s*\|\s*GetHotelStays\s*$/i, "").trim();
  const cleanTitle = `${rawTitle} | GetHotelStays`;
  const description = ctx?.metaDescription || page.metaDescription;
  const canonical = `https://gethotelstays.com/hotels/delhi/${slug}`;

  return {
    title: {
      absolute: cleanTitle,
    },
    description,
    keywords: page.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: cleanTitle,
      description,
      url: canonical,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDelhiPage(slug);
  const ctx = page ? buildDelhiContext([], slug) : null;
  const schemas = ctx ? buildDelhiSchemas(ctx, "en") : [];

  return (
    <>
      {schemas.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <DelhiLandingPage slugOverride={slug} />
    </>
  );
}
