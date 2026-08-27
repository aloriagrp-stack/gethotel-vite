import type { Metadata } from "next";
import DelhiHotels from "@/pages-legacy/destinations/DelhiHotels";
import { PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.delhi.title,
  description: PAGE_SEO.delhi.description,
  keywords: PAGE_SEO.delhi.keywords,
  alternates: {
    canonical: "https://gethotelstays.com/delhi-hotels",
  },
};

export default function Page() {
  return <DelhiHotels />;
}
