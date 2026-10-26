import Link from "next/link";
import type { Hotel } from "@/types";
import LandingHotelsGrid from "./LandingHotelsGrid";
import { ChevronRight, HelpCircle, ShieldCheck } from "lucide-react";

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

  // Clean visible H1 (without trailing pipe suffixes for clean UI)
  const cleanH1 = h1.includes("|") ? h1.split("|")[0].trim() : h1;

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
        {/* Compact, Clean Top Header — Room Cards Start Immediately! */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Link href="/hotels/delhi" className="hover:text-brand-600 transition-colors">Delhi</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 truncate">{breadcrumbLabel}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                  {cleanH1}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-800">{hotels.length} verified stays available</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">Pay 12% deposit</span>
                  {badgeText && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 truncate">{badgeText}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Cards Immediately Displayed Above the Fold */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-12">
          {/* Hotel Cards Grid with instant filter pills */}
          <div id="hotels-grid">
            <LandingHotelsGrid initialHotels={hotels} locationNote={locationNote} />
          </div>

          {/* Deep Content, Overview & Location Guidance Placed Nicely Below Cards */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                About Stays in {breadcrumbLabel}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {heroCopy}
              </p>
            </div>

            {sections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                {sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[11px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{section.h2}</span>
                    </h3>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-600 leading-relaxed">
                        {p}
                      </p>
                    ))}
                    {section.listItems && section.listItems.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        {section.listItems.map((item, lIdx) => (
                          <li key={lIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Clear answers to key questions about room access, identification requirements, and booking terms.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, index) => (
                  <details key={index} className="group py-3.5 cursor-pointer" open={index === 0}>
                    <summary className="flex items-center justify-between font-bold text-slate-900 text-sm list-none">
                      <span>{faq.question}</span>
                      <span className="ml-4 text-brand-600 transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="mt-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Internal Links Matrix */}
          {internalLinks.length > 0 && (
            <section className="bg-slate-100/80 rounded-2xl p-5 sm:p-6 space-y-3.5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Explore More Delhi Stays & Destination Guides
              </h3>
              <div className="flex flex-wrap gap-2">
                {internalLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
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
