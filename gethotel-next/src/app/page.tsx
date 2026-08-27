import type { Metadata } from "next";
import ClientHomePage from "@/pages-legacy/Home";
import { PAGE_SEO, HOME_FAQS, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  keywords: PAGE_SEO.home.keywords,
  alternates: {
    canonical: "https://gethotelstays.com",
  },
  openGraph: {
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    url: "https://gethotelstays.com",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

export default function Page() {
  const faqSchema = buildFAQSchema(HOME_FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema([{ name: "Home", url: "/" }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClientHomePage />
    </>
  );
}
