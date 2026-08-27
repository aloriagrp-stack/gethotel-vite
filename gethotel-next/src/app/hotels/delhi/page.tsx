import type { Metadata } from "next";
import DelhiHotels from "@/pages-legacy/destinations/DelhiHotels";
import { PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.delhi.title,
  description: PAGE_SEO.delhi.description,
  keywords: PAGE_SEO.delhi.keywords,
  alternates: {
    canonical: "https://gethotelstays.com/hotels/delhi",
  },
};

export default function Page() {
  return <DelhiHotels />;
}
