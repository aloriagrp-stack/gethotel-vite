import type { Metadata } from "next";
import PartnerLanding from "@/pages-legacy/PartnerLanding";
import { PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.partner.title,
  description: PAGE_SEO.partner.description,
  keywords: PAGE_SEO.partner.keywords,
  alternates: {
    canonical: "https://gethotelstays.com/partner",
  },
};

export default function Page() {
  return <PartnerLanding />;
}
