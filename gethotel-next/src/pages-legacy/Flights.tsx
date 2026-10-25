'use client';
import React, { useEffect, useState, useRef, useCallback } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PAGE_SEO,
  FLIGHTS_FAQS,
  POPULAR_DOMESTIC_ROUTES,
  POPULAR_INTL_ROUTES,
} from "@/lib/seo";
import { FLIGHT_CITIES } from "@/data/flightCitiesData";

export default function Flights() {
  const [iframeHeight, setIframeHeight] = useState(180);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeRouteTab, setActiveRouteTab] = useState<"domestic" | "international">("domestic");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadCountRef = useRef(0);
  const lastGoodUrlRef = useRef("");
  const searchWidgetRef = useRef<HTMLDivElement>(null);

  // Build the initial widget URL
  const [widgetUrl, setWidgetUrl] = useState("/flights-widget.html?v=1.5.1");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `/flights-widget.html${window.location.search ? window.location.search + '&' : '?'}v=1.5.1`;
      setWidgetUrl(url);
      lastGoodUrlRef.current = url;
    }
  }, []);

  const partnerIntentRef = useRef(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "resize-iframe") {
        setIframeHeight(event.data.height);
        if (event.data.isDropdownOpen !== undefined) {
          setIsDropdownOpen(event.data.isDropdownOpen);
        }
        if (event.data.hasResults !== undefined) {
          setHasResults(event.data.hasResults);
        }
        setLoaded(true);
      }

      if (event.data.type === "widget-url-update" && event.data.url) {
        const url = event.data.url;
        if (url.includes("flights-widget")) {
          lastGoodUrlRef.current = url;
        }
      }

      if (event.data.type === "flight-partner-intent") {
        partnerIntentRef.current = true;
        setTimeout(() => { partnerIntentRef.current = false; }, 10000);
      }
    };

    const handleParentClick = (e: MouseEvent) => {
      if (searchWidgetRef.current && !searchWidgetRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        try {
          iframeRef.current?.contentWindow?.postMessage({ type: 'close-dropdown' }, '*');
        } catch (err) {}
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("click", handleParentClick);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("click", handleParentClick);
    };
  }, []);

  // SAFETY NET: Detect if iframe navigated to cross-origin
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      if (reloadCountRef.current >= 3) return;

      try {
        const href = iframe.contentWindow?.location?.href || "";

        if (
          href.includes("booking.com") ||
          href.includes("hotellook") ||
          href.includes("hotelscombined")
        ) {
          reloadCountRef.current++;
          iframe.src = lastGoodUrlRef.current || widgetUrl;
        } else if (href.includes("flights-widget")) {
          lastGoodUrlRef.current = href;
          reloadCountRef.current = 0;
        }
      } catch (e) {
        if (partnerIntentRef.current) {
          partnerIntentRef.current = false;
          return;
        }
        reloadCountRef.current++;
        iframe.src = lastGoodUrlRef.current || widgetUrl;
      }
    };

    iframe.addEventListener("load", handleIframeLoad);
    return () => iframe.removeEventListener("load", handleIframeLoad);
  }, [widgetUrl]);

  const scrollToSearch = useCallback(() => {
    if (searchWidgetRef.current) {
      searchWidgetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const airlinesList = [
    { name: "IndiGo", fleet: "350+ Aircraft", desc: "Punctual, extensive domestic network & budget routes across India." },
    { name: "Air India", fleet: "Full-Service Fleet", desc: "National carrier with complimentary meals, checked baggage & global routes." },
    { name: "Akasa Air", fleet: "Boeing 737 MAX", desc: "Brand new fleet, comfortable seating, on-time performance & budget airfares." },
    { name: "SpiceJet", fleet: "Regional & Metro", desc: "Affordable regional connectivity, direct domestic routes & holiday flights." },
    { name: "Emirates", fleet: "A380 & B777", desc: "Luxury international flights connecting India to Dubai and 140+ destinations." },
    { name: "Singapore Airlines", fleet: "Long-Haul Premium", desc: "Superior comfort connecting South East Asia, Australia, and North America." },
    { name: "Qatar Airways", fleet: "Global Network", desc: "Doha transit connecting India to Europe, the United Kingdom, and the Americas." },
    { name: "Etihad Airways", fleet: "Modern Fleet", desc: "Abu Dhabi flights with US Pre-Clearance and global intercontinental links." },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <SEOHead
        title="Book Cheap Flights Online: Compare Airfare Deals | GetHotelStays"
        description={PAGE_SEO.flights.description}
        keywords={PAGE_SEO.flights.keywords}
        ogType="website"
        ogUrl={typeof window !== 'undefined' ? window.location.href : ""}
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : ""}
      />

      {/* Clean Minimal Breadcrumb without harsh bottom border */}
      <nav aria-label="Breadcrumb" className="bg-white py-2.5 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-600 transition-colors font-medium">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Flights</span>
          <span className="text-slate-300">/</span>
          <span className="text-brand-600 hidden sm:inline">Domestic & International Airfares</span>
        </div>
      </nav>

      {/* Unified Hero + Search Widget + Popular Routes on the same continuous surface */}
      <section className="relative overflow-visible bg-slate-50/50 text-slate-900 pt-6 pb-12 md:pt-8 md:pb-16 px-4 md:px-8">
        {/* Soft Ambient Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-brand-100/35 rounded-full blur-[100px]" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[100%] bg-blue-100/25 rounded-full blur-[90px]" />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-950"
          >
            Compare & Book <span className="text-brand-600">Cheap Flights Online</span>
          </motion.h1>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search 100+ airlines across 50,000+ domestic and international routes with live seat tariffs, transparent fares, and instant PNR e-ticket confirmation.
          </p>
        </div>

        {/* Main Search Widget Section — HIGH STACKING CONTEXT (z-50) */}
        <div ref={searchWidgetRef} id="flight-search-widget" className="max-w-7xl mx-auto w-full relative z-50 mb-8 md:mb-10">
          <div
            className="w-full relative transition-all duration-300"
            style={{ minHeight: hasResults ? `${iframeHeight}px` : "175px" }}
          >
            {!loaded && (
              <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-center items-center z-10">
                <span className="text-slate-700 font-semibold text-sm mb-3">Loading flight search...</span>
                <div className="w-full max-w-2xl flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                    <div className="h-11 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="h-11 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="h-11 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="h-11 bg-slate-50 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={widgetUrl}
              style={{
                height: `${iframeHeight}px`,
                minHeight: "175px",
                position: isDropdownOpen && !hasResults ? "absolute" : "relative",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 50,
              }}
              scrolling="no"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              className="w-full border-none transition-all duration-300 bg-transparent"
              title="Flight Search Engine"
            />
          </div>
        </div>

        {/* Popular Flight Routes Section — Same background surface, LOWER STACKING CONTEXT (z-10) */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Domestic & International Flight Routes
              </h2>
              <p className="text-slate-600 text-xs md:text-sm mt-1.5 max-w-2xl">
                Daily scheduled direct and connecting flights across major Indian hubs and international destinations.
              </p>
            </div>

            {/* Clean Tab Switcher */}
            <div className="inline-flex p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/80 shrink-0 self-start md:self-auto shadow-sm">
              <button
                type="button"
                onClick={() => setActiveRouteTab("domestic")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRouteTab === "domestic"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Domestic Routes
              </button>
              <button
                type="button"
                onClick={() => setActiveRouteTab("international")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRouteTab === "international"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                International Routes
              </button>
            </div>
          </div>

          {/* Clean Route Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(activeRouteTab === "domestic" ? POPULAR_DOMESTIC_ROUTES : POPULAR_INTL_ROUTES).map((route, idx) => (
              <div
                key={idx}
                className="p-5 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200/80 hover:border-brand-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-600">
                      {route.type} · {route.duration}
                    </span>
                    <span className="text-[11px] text-slate-400">Daily</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 my-3">
                    <div className="text-left">
                      <p className="text-xl font-bold text-slate-900">{route.fromCode}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[90px]">{route.from}</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-2">
                      <div className="w-full flex items-center">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-xs text-slate-400 px-1.5 font-mono">→</span>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">{route.toCode}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[90px]">{route.to}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 my-2">
                    {route.carriers.join(", ")}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">Starting from</span>
                    <span className="text-base font-bold text-brand-600">{route.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToSearch}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-600 text-slate-800 hover:text-white transition-colors border border-slate-200"
                  >
                    Search Fares
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose GetHotelStays */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Compare Flights on GetHotelStays
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-2">
              Smart metasearch comparison combined with verified transit hotel bookings across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Real-Time Metasearch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan fares from 100+ airlines simultaneously. Compare flight timings, durations, and layovers to find the lowest airfare on every route.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1.5">100% Fare Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero surprise convenience fees. All base fares, fuel surcharges, airport fees, and applicable taxes are presented upfront before booking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Airport Layover Stays</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Have a 4-6 hour layover at Delhi or Mumbai airports? Reserve flexible 3, 6, or 12-hour hotel rooms in Aerocity at up to 70% off standard tariffs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1.5">24/7 Dedicated Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assistance with PNR lookups, e-ticket downloads, web check-in links, and flight rescheduling whenever you need travel guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leading Airline Partners Grid */}
      <section className="py-10 md:py-14 bg-white border-t border-slate-100 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Compare 100+ Leading Airline Partners
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5">
              Live scheduled inventory from major domestic and global carriers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {airlinesList.map((airline, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <h3 className="font-bold text-slate-900 text-sm">{airline.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{airline.fleet}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{airline.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Semantic Travel Guide & Insider Tips */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Guide to Finding Cheap Flights in India
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5">
              Key strategies to secure lower airfares across domestic and international routes.
            </p>
          </div>

          <div className="space-y-4 text-slate-700 text-xs md:text-sm leading-relaxed">
            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                1. Optimal Advance Booking Windows for Domestic & International Flights
              </h3>
              <p>
                In India, dynamic pricing algorithms steeply increase ticket prices within 7 days of scheduled departure. For domestic sectors (such as <strong>Delhi to Mumbai</strong> or <strong>Bangalore to Goa</strong>), booking <strong>3 to 4 weeks in advance</strong> offers the best chance of securing base inventory without surge pricing. For international journeys (including <strong>Dubai, Singapore, London, or Toronto</strong>), reserving <strong>6 to 8 weeks ahead</strong> ensures optimal cabin fare availability.
              </p>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                2. Understanding Checked & Cabin Baggage Rules
              </h3>
              <p>
                Standard domestic economy tickets on IndiGo, Akasa Air, and SpiceJet allow <strong>15 kg of check-in baggage</strong> and <strong>7 kg of hand baggage</strong> per passenger. Air India domestic economy permits up to <strong>20 kg check-in baggage</strong>. If you require extra baggage, pre-booking additional weight online prior to check-in is up to <strong>60% cheaper</strong> than paying at terminal airport counters.
              </p>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                3. Layover Stays: Hourly Rooms at Delhi (DEL) & Mumbai (BOM) Airports
              </h3>
              <p>
                Long flight layovers can be spent resting comfortably. Through GetHotelStays, passengers transiting through Indira Gandhi International Airport (DEL) can reserve flexible <strong>3-hour, 6-hour, or 12-hour hourly stays</strong> in Aerocity and Mahipalpur (located 5 to 10 minutes from Terminal 3/2/1), saving up to <strong>70% compared to full overnight rates</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href="/hotels-near-delhi-airport"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Hotels Near Delhi Airport (DEL) →
                </Link>
                <span className="text-slate-300">·</span>
                <Link
                  href="/hourly-hotels-in-delhi"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Hourly Hotels for Transit Layovers →
                </Link>
              </div>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                4. Flight Bookings for NRI & International Travelers
              </h3>
              <p>
                GetHotelStays caters to global Indian travelers residing across the USA, UK, UAE, Canada, and Australia. Payment options support major international credit and debit cards (Visa, MasterCard, American Express) with automated multi-currency conversion, 3D Secure verification, and digital e-ticket delivery directly via email and WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AEO FAQ Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5">
              Clear answers regarding flight comparisons, e-tickets, baggage, and cancellations.
            </p>
          </div>

          <div className="space-y-3">
            {FLIGHTS_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors bg-white hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm md:text-base"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 font-mono text-lg shrink-0 w-6 text-center">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 md:px-5 pb-5 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 50 Departure Cities Directory — Core Programmatic SEO Linking Hub */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-7">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cheap Flights from 50+ Departure Cities Across India
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5 max-w-2xl">
              Browse dedicated flight hubs for major metro, regional, and tourist gateways with direct fares and airport guides.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 text-xs">
            {FLIGHT_CITIES.map((city, idx) => (
              <Link
                key={idx}
                href={`/flights-from/${city.slug}`}
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <p className="font-bold text-slate-900">Flights from {city.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{city.iata} · {city.routes.length}+ routes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking & Hotel Destination Grid — Consistent White & Soft Light Theme */}
      <section className="py-10 bg-white border-t border-slate-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Need a Hotel for Your Flight Layover or Holiday?</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Book verified hotels with our Pay 12% Deposit model across 500+ Indian destinations.
              </p>
            </div>
            <Link
              href="/hotels"
              className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shrink-0"
            >
              Explore 10,000+ Hotels →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <Link href="/delhi-hotels" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Hotels in Delhi</p>
              <p className="text-[11px] text-slate-500 mt-0.5">2,000+ stays</p>
            </Link>
            <Link href="/hotels-near-delhi-airport" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Delhi Airport Hotels</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Near T3/T2/T1 Aerocity</p>
            </Link>
            <Link href="/goa-hotels" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Hotels in Goa</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Beachfront & villas</p>
            </Link>
            <Link href="/jaipur-hotels" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Hotels in Jaipur</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Heritage havelis</p>
            </Link>
            <Link href="/hourly-hotels-in-delhi" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Hourly Hotels</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Micro stays</p>
            </Link>
            <Link href="/packages" className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all">
              <p className="font-bold text-slate-900">Holiday Packages</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tour itineraries</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
