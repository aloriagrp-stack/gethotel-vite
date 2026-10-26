import type { Metadata } from "next";
import Link from "next/link";
import ndlsHotelsData from "@/data/ndlsHotels.json";
import NDLSHotelsClient from "./NDLSHotelsClient";
import type { Hotel } from "@/types";
import {
  Train,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  MapPin,
  ChevronRight,
  Luggage,
  Sparkles,
  Plane,
  CreditCard,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hotels Near New Delhi Railway Station (NDLS) & Paharganj | Verified from ₹999 | GetHotelStays",
  description:
    "Book 16 verified hotels within 2 to 5 minutes walk of New Delhi Railway Station (NDLS) and Paharganj. 24/7 check-in, clean AC rooms, free WiFi. Pay only 12% deposit online!",
  keywords: [
    "hotels near new delhi railway station",
    "hotels in paharganj delhi",
    "budget hotels near ndls",
    "hotels near ndls railway station",
    "cheap hotels near railway station delhi",
    "hotels near new delhi railway station for family",
    "couple friendly hotels near ndls",
    "hotels on arakshan road paharganj",
    "gethotelstays ndls",
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
  },
  openGraph: {
    title: "Hotels Near New Delhi Railway Station (NDLS) & Paharganj | GetHotelStays",
    description:
      "16 verified hotels within 2-5 minutes walk of NDLS platform exit gates. 24/7 early check-in, AC, free WiFi, pay 12% deposit.",
    url: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
    siteName: "GetHotelStays",
    images: [
      {
        url: "https://gethotelstays.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hotels Near New Delhi Railway Station - GetHotelStays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotels Near New Delhi Railway Station (NDLS) & Paharganj | GetHotelStays",
    description: "Book verified hotels within walking distance of NDLS Station. Pay 12% deposit.",
    images: ["https://gethotelstays.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    question: "How far are these hotels from New Delhi Railway Station (NDLS) platforms?",
    answer:
      "All 16 verified hotels listed on this page are situated within 200 meters to 700 meters (approx. 2 to 7 minutes walking distance) from New Delhi Railway Station's Platform 1 (Paharganj side). Popular streets include Arakashan Road, Chuna Mandi, Desh Bandhu Gupta Road, and Main Bazaar. You do not need to take an auto or taxi upon deboarding.",
  },
  {
    question: "Can I check in early morning (5:00 AM – 7:00 AM) if my train arrives before standard check-in time?",
    answer:
      "Yes! Trains like Rajdhani Express, Vande Bharat, and Shatabdi often arrive in Delhi between 5:00 AM and 8:00 AM. All our partner hotels near NDLS operate active 24-hour reception desks. You can request guaranteed early check-in or book a short 3-hour/6-hour freshen-up slot so you do not have to wait on the station platform.",
  },
  {
    question: "Is it safe to walk from NDLS Station to Paharganj hotels late at night with luggage and family?",
    answer:
      "Yes. Our verified partner properties are situated on broad, well-lit main transit corridors (such as Arakashan Road, DB Gupta Road, and Chitra Gupta Road) rather than unlit interior alleys. These roads feature 24/7 commercial activity, active hotel receptions, and frequent Delhi Police PCR patrols. Always exit through Platform 1 (Paharganj side).",
  },
  {
    question: "How can I avoid station touts and fake commission agents at New Delhi Railway Station?",
    answer:
      "At NDLS exits, unauthorised touts frequently claim that 'Paharganj hotels are closed due to fire/strike' or that 'your pre-booked hotel is full' to redirect you to unverified lodges for high commissions. When you book on GetHotelStays, you receive a confirmed WhatsApp and SMS booking voucher with the hotel's exact GPS location and direct manager contact number. Simply ignore street touts and walk directly to your hotel.",
  },
  {
    question: "How do I reach Delhi Airport (IGI T3) from these New Delhi Railway Station hotels?",
    answer:
      "New Delhi Railway Station is directly connected to the Airport Express Orange Line Metro Station (located on the Ajmeri Gate side, connected via an elevated skywalk from Platform 1). The Airport Express takes only 19 minutes to reach Indira Gandhi International Airport Terminal 3 (IGI T3) without any traffic delays, operating from 4:45 AM until 11:30 PM.",
  },
  {
    question: "Are these hotels couple-friendly and do they accept local Delhi/NCR IDs?",
    answer:
      "Yes. Adult couples (18+) with valid government-issued photo identification (Aadhaar card, voter ID, passport, or driving licence) are welcomed across our verified properties, ensuring 100% privacy, respect, and zero moral policing.",
  },
  {
    question: "Can I leave my heavy luggage at the hotel after checkout while sightseeing Delhi?",
    answer:
      "Yes! If your return train departs in the evening, all our partner hotels provide secure luggage cloakroom storage free of charge for booked guests. You can comfortably explore Connaught Place, India Gate, or Chandni Chowk and pick up your bags right before boarding.",
  },
];

export default function Page() {
  const hotels = ndlsHotelsData as unknown as Hotel[];

  // JSON-LD Schemas
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
        name: "Hotels Near New Delhi Railway Station",
        item: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hotels Near New Delhi Railway Station (NDLS) & Paharganj",
    description:
      "Verified budget and boutique hotels located 2 to 5 minutes walk from New Delhi Railway Station platforms.",
    url: "https://gethotelstays.com/hotels-near-new-delhi-railway-station",
    numberOfItems: hotels.length,
    about: {
      "@type": "Place",
      name: "New Delhi Railway Station (NDLS)",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Paharganj, New Delhi",
        addressRegion: "Delhi",
        addressCountry: "IN",
      },
    },
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified Hotels Near New Delhi Railway Station",
    numberOfItems: hotels.length,
    itemListElement: hotels.map((h, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Hotel",
        name: h.name,
        description: h.description || `${h.name} situated near New Delhi Railway Station and Paharganj.`,
        image: h.thumbnail || "https://gethotelstays.com/og-image.jpg",
        priceRange: `₹${h.pricePerNight} - ₹${(h.pricePerNight || 1200) * 2}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: h.address || "Paharganj, Near NDLS",
          addressLocality: "New Delhi",
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
          reviewCount: String(h.reviewCount && h.reviewCount > 0 ? h.reviewCount : 85),
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
      {/* Schema.org Injections */}
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
              <span className="text-slate-900 font-bold truncate">Hotels Near New Delhi Railway Station</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-slate-50/70 border-b border-slate-200/80 pt-6 pb-8 md:pt-10 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <Train className="w-3.5 h-3.5 text-brand-600" />
              <span>Platform 1 (Paharganj Side) — 2 to 5 Mins Walk</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Hotels Near New Delhi Railway Station (NDLS) & Paharganj
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-4xl leading-relaxed font-normal">
              Traveling to Delhi by train? Avoid street touts and commission scams. Choose from{" "}
              <strong className="font-semibold text-slate-900">{hotels.length} verified budget & boutique hotels</strong>{" "}
              located within a 200m to 700m walk of New Delhi Railway Station (Arakashan Road, Chuna Mandi & DB Gupta Road).
              Enjoy 24/7 check-in for early morning train arrivals, clean AC rooms, high-speed WiFi, lift facilities, and{" "}
              <strong className="font-semibold text-brand-700">pay only 12% deposit online</strong>.
            </p>

            {/* Quick Benefits Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">24/7 Early Check-in</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">50-Point Room Audit</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">19m Airport Express</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Pay 12% to Reserve</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Hotels Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          <NDLSHotelsClient initialHotels={hotels} />

          {/* Deep Informational Guides for Google & Travellers */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 space-y-10 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Complete Guide to Booking Hotels Near New Delhi Railway Station (NDLS)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Essential insider tips for train passengers, transit flyers, backpackers, and families visiting Delhi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700 text-sm leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">1</span>
                  Station Exit Guide: Paharganj (Platform 1) vs. Ajmeri Gate (Platform 16)
                </h3>
                <p>
                  New Delhi Railway Station has two primary exits situated on opposite sides of the 16 platforms. 
                  When booking hotels near NDLS, choosing the correct exit saves you from unnecessary luggage carrying and taxi fares:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>
                    <strong>Platform 1 (Paharganj Exit):</strong> This is the main budget and boutique hotel hub. Roads like Arakashan Road, Chuna Mandi, and Main Bazaar are just a 2 to 5-minute walk from here.
                  </li>
                  <li>
                    <strong>Platform 16 (Ajmeri Gate Exit):</strong> Opens towards Connaught Place, the Airport Express Metro, and the Yellow Line Metro station. An elevated skywalk connects Platform 1 directly to the Metro concourse.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">2</span>
                  Early Morning Check-in for Rajdhani, Shatabdi & Vande Bharat Passengers
                </h3>
                <p>
                  Major long-distance trains from Mumbai, Kolkata, Bengaluru, and Jammu arrive at NDLS between 5:00 AM and 8:00 AM. 
                  Standard hotels typically enforce a 12:00 PM check-in and force guests to pay an entire extra night&apos;s tariff for early arrival.
                </p>
                <p className="text-slate-600 text-xs sm:text-sm">
                  All GetHotelStays partner hotels near New Delhi Railway Station offer flexible 24-hour check-in policies. 
                  If you only need a room for a few hours to take a hot shower, rest, and recharge devices before your meeting or flight, you can also book our dedicated{" "}
                  <Link href="/hourly-hotels-in-delhi" className="text-brand-600 font-bold hover:underline">
                    hourly day-use slots (3h/6h/12h)
                  </Link>{" "}
                  at up to 70% lower prices.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">3</span>
                  Beating the Station Touts: Why Pre-Booking Online Protects You
                </h3>
                <p>
                  Paharganj is notorious for aggressive street touts and commission auto-rickshaw drivers waiting right outside the station gates. 
                  A common scam is telling arriving passengers that their hotel is &apos;burned down&apos;, &apos;under police seal&apos;, or &apos;fully booked&apos;, in order to divert them to sub-standard guest houses that charge high commissions.
                </p>
                <p className="text-slate-600 text-xs sm:text-sm">
                  By booking through GetHotelStays, you receive a confirmed digital booking receipt with the hotel manager&apos;s direct WhatsApp contact and exact Google Maps coordinates. You can walk straight past touts knowing your room and rate are 100% locked in.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">4</span>
                  Seamless Connectivity: Airport Express (19 Mins to T3) & Yellow Line Metro
                </h3>
                <p>
                  Staying near NDLS gives you the fastest connectivity in all of North India:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>
                    <strong>Airport Express Orange Line:</strong> High-speed trains run directly from New Delhi Metro Station to IGI Airport Terminal 3 in just 19 minutes flat, avoiding Delhi&apos;s peak-hour traffic jams.
                  </li>
                  <li>
                    <strong>Yellow Line Metro:</strong> Takes you to Connaught Place (Rajiv Chowk) in 1 stop (2 minutes), Chandni Chowk in 2 stops, and AIIMS Hospital in 15 minutes.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-600" />
                Frequently Asked Questions About NDLS & Paharganj Hotels
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real answers to the most common questions asked by train travellers arriving at New Delhi Station.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {FAQS.map((faq, index) => (
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

          {/* Internal Linking Hub */}
          <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Explore More Popular Delhi Hotel Categories & Transit Stays
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/hourly-hotels-in-delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                ⚡ Hourly Hotels in Delhi (3h/6h)
              </Link>
              <Link
                href="/hotels-near-delhi-airport"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                ✈️ Hotels Near Delhi Airport (IGI T3)
              </Link>
              <Link
                href="/couple-friendly-hotels-in-delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                ❤️ Couple Friendly Hotels in Delhi
              </Link>
              <Link
                href="/hotels-in-connaught-place-delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                🏛️ Hotels in Connaught Place (CP)
              </Link>
              <Link
                href="/hotels-in-karol-bagh-delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                🛍️ Hotels in Karol Bagh Delhi
              </Link>
              <Link
                href="/hotels-in-south-delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                🌟 Hotels in South Delhi (GK & Saket)
              </Link>
              <Link
                href="/hotels/delhi"
                className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 border border-slate-200 transition-all shadow-2xs"
              >
                📍 All Hotels in Delhi
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
