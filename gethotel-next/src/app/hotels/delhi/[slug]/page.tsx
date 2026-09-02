import type { Metadata } from "next";
import DelhiLandingPage from "@/pages-legacy/delhi/DelhiLandingPage";
import { delhiPages, getDelhiPage, buildDelhiContext } from "@/lib/delhiSeo";

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
      title: "Hotels in Delhi | GetHotelStays",
      description: "Book verified hotels in Delhi at best prices. Pay 12% online, rest at hotel.",
    };
  }

  const ctx = buildDelhiContext([], slug);
  const title = ctx?.title || page.title;
  const description = ctx?.metaDescription || page.metaDescription;
  const canonical = `https://gethotelstays.com/hotels/delhi/${slug}`;

  return {
    title,
    description,
    keywords: page.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: ctx.title,
      description: ctx.metaDescription,
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
  return <DelhiLandingPage slugOverride={slug} />;
}
