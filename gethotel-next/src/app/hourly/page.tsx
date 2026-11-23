import type { Metadata } from "next";
import ClientHomePage from "@/pages-legacy/Home";
import { PAGE_SEO, HOME_FAQS, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hourly Hotels & Micro Stays in India — 3, 6 & 12 Hours | GetHotelStays",
  description: "Book flexible hourly hotel rooms in Delhi and across India for 3, 6, or 12 hours. Couple friendly, 100% refund protection, pay 12% deposit.",
  keywords: [
    "hourly hotels",
    "hourly stays",
    "hourly hotels in delhi",
    "3 hours hotel stay",
    "6 hours hotel stay",
    "12 hours micro stay",
    "day use hotel rooms",
    "couple friendly hourly hotels",
    "gethotelstays hourly"
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hourly",
  },
  openGraph: {
    title: "Hourly Hotels & Micro Stays in India | GetHotelStays",
    description: "Book flexible hourly hotel rooms in Delhi and across India for 3, 6, or 12 hours. Pay 12% deposit.",
    url: "https://gethotelstays.com/hourly",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

export default function HourlyPage() {
  const faqSchema = buildFAQSchema(HOME_FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Hourly Stays", url: "/hourly" }
  ]);

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
      <ClientHomePage initialMode="hourly" />
    </>
  );
}
