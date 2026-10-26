import Link from "next/link";
import type { Hotel } from "@/types";
import LandingHotelsGrid from "./LandingHotelsGrid";
import { ChevronRight, HelpCircle, CheckCircle, ArrowDown } from "lucide-react";

export interface LandingSection {
  h2: string;
  paragraphs: string[];
  listItems?: string[];
}

export interface LandingFAQ {
  question: string;
  answer: string;
}

export interface LandingInternalLink {
  label: string;
  href: string;
}

export interface LandingPageTemplateProps {
  pageSlug: string;
  canonicalUrl: string;
  breadcrumbLabel: string;
  badgeText: string;
  badgeIcon?: React.ReactNode;
  h1: string;
  heroCopy: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  sections: LandingSection[];
  faqs: LandingFAQ[];
  internalLinks: LandingInternalLink[];
  hotels: Hotel[];
  locationNote?: string;
}

export default function LandingPageTemplate({
  pageSlug,
  canonicalUrl,
  breadcrumbLabel,
  badgeText,
  badgeIcon,
  h1,
  heroCopy,
  primaryCtaText = "Check availability",
  secondaryCtaText = "Compare hotels",
  sections,
  faqs,
  internalLinks,
  hotels,
  locationNote,
}: LandingPageTemplateProps) {
  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gethotelstays.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Hotels in Delhi",
        item: "https://gethotelstays.com/hotels/delhi",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: breadcrumbLabel,
        item: canonicalUrl,
      },
    ],
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Collection Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: heroCopy,
    url: canonicalUrl,
    numberOfItems: hotels.length,
    about: {
      "@type": "Place",
      name: "Delhi",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi",
        addressRegion: "Delhi",
        addressCountry: "IN",
      },
    },
  };

  // ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    numberOfItems: hotels.length,
    itemListElement: hotels.map((h, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Hotel",
        name: h.name,
        description: h.description || `${h.name} situated in ${h.city || "Delhi"}.`,
        image: h.thumbnail || "https://gethotelstays.com/og-image.jpg",
        priceRange: `₹${h.pricePerNight || 1200} - ₹${(h.pricePerNight || 1200) * 2}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: h.address || "Delhi",
          addressLocality: h.city || "Delhi",
          addressRegion: "Delhi",
          addressCountry: "IN",
        },
        starRating: {
          "@type": "Rating",
          ratingValue: String(h.starRating || 3),
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(h.guestRating && h.guestRating > 0 ? h.guestRating : 4.1),
          reviewCount: String(h.reviewCount && h.reviewCount > 0 ? h.reviewCount : 50),
        },
        offers: {
          "@type": "Offer",
          price: String(h.pricePerNight || 1200),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `https://gethotelstays.com/hotel/${h.id}-${(h.name || "hotel").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        },
      },
    })),
  };

  return (
    <>
      {/* Schema Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <main className="min-h-screen bg-slate-50/50 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/hotels/delhi" className="hover:text-brand-600 transition-colors">Hotels in Delhi</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold truncate">{breadcrumbLabel}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-slate-50/70 border-b border-slate-200/80 pt-6 pb-8 md:pt-10 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
              {badgeIcon}
              <span>{badgeText}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {h1}
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-4xl leading-relaxed font-normal">
              {heroCopy}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#hotels-grid"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>{primaryCtaText}</span>
                <ArrowDown className="w-4 h-4" />
              </a>
              <a
                href="#hotels-grid"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <span>{secondaryCtaText}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Content & Hotels Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Live Listings Grid */}
          <div id="hotels-grid" className="scroll-mt-8">
            <LandingHotelsGrid initialHotels={hotels} locationNote={locationNote} />
          </div>

          {/* Editorial Guidance & Content Sections */}
          {sections.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 space-y-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Location Guidance & Essential Stay Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Important details regarding booking policies, room facilities, check-in windows, and transit routes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700 text-sm leading-relaxed">
                {sections.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{section.h2}</span>
                    </h3>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {p}
                      </p>
                    ))}
                    {section.listItems && section.listItems.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                        {section.listItems.map((item, lIdx) => (
                          <li key={lIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-brand-600 shrink-0" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Clear answers to key questions about room access, identification requirements, and booking terms.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, index) => (
                  <details key={index} className="group py-4 cursor-pointer" open={index === 0}>
                    <summary className="flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base list-none">
                      <span>{faq.question}</span>
                      <span className="ml-4 text-brand-600 transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="mt-3 text-slate-600 text-xs sm:text-sm leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Internal Links Matrix */}
          {internalLinks.length > 0 && (
            <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Explore More Delhi Stays & Destination Guides
              </h3>
              <div className="flex flex-wrap gap-2">
                {internalLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
