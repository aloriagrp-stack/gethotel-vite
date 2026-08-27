import type { Metadata } from "next";
import ClientHotelsPage from "@/pages-legacy/Hotels";
import { PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.hotels.title,
  description: PAGE_SEO.hotels.description,
  keywords: PAGE_SEO.hotels.keywords,
};

export default function Page() {
  return <ClientHotelsPage />;
}
