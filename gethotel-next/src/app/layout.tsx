import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { organizationSchema, websiteSchema, travelAgencySchema, PAGE_SEO } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0369c5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gethotelstays.com"),
  title: {
    default: PAGE_SEO.home.title,
    template: "%s | GetHotelStays",
  },
  description: PAGE_SEO.home.description,
  keywords: PAGE_SEO.home.keywords,
  authors: [{ name: "GetHotelStays" }],
  creator: "GetHotelStays",
  publisher: "GetHotelStays",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US", "en_GB", "en_AE", "en_CA", "en_AU", "en_SG"],
    url: "https://gethotelstays.com",
    siteName: "GetHotelStays",
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    images: [
      {
        url: "https://gethotelstays.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GetHotelStays — Book Best Hotels & Deals in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GetHotelStays",
    creator: "@GetHotelStays",
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "https://gethotelstays.com",
      "en-US": "https://gethotelstays.com",
      "en-GB": "https://gethotelstays.com",
      "en-AE": "https://gethotelstays.com",
      "en-CA": "https://gethotelstays.com",
      "en-AU": "https://gethotelstays.com",
      "en-SG": "https://gethotelstays.com",
      "x-default": "https://gethotelstays.com",
    },
  },
  other: {
    "google-site-verification": "M-yaXU14rnDoh4-JXkMQrwiSlWOqoo3ei2PTnrNSAFs",
    "msvalidate.01": "854D75231F8CB4CCD136C72C68768B36",
    "ahrefs-site-verification": "a22a62fecb89b0c2b8f694806a585ada2107533481fb7480bddd42eabb9489e0",
    "trustpilot-one-time-domain-verification-id": "b3b19ab6-4460-499b-a853-71461ed717a1",
    "p:domain_verify": "5af5793446d85efca8c00583c3fa9fb7",
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    "ICBM": "20.5937, 78.9629",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" prefix="og: https://ogp.me/ns#">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* JSON-LD Global Schemas for Google & AEO Answer Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }}
        />
      </head>
      <body className="antialiased selection:bg-brand-500 selection:text-white bg-surface text-slate-900 min-h-screen">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
