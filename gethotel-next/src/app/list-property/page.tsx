import type { Metadata } from "next";
import ListProperty from "@/pages-legacy/ListProperty";
import { PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.listProperty.title,
  description: PAGE_SEO.listProperty.description,
  keywords: PAGE_SEO.listProperty.keywords,
  alternates: {
    canonical: "https://gethotelstays.com/list-property",
  },
};

export default function Page() {
  return <ListProperty />;
}
