'use client';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FlightCityData, FLIGHT_CITIES } from "@/data/flightCitiesData";

interface CityFlightLandingProps {
  cityData: FlightCityData;
}

export default function CityFlightLanding({ cityData }: CityFlightLandingProps) {
  const [iframeHeight, setIframeHeight] = useState(180);
  const [loaded, setLoaded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadCountRef = useRef(0);
  const lastGoodUrlRef = useRef("");
  const searchWidgetRef = useRef<HTMLDivElement>(null);

  // Build the widget URL pre-populated with this city's IATA code as origin
  const [widgetUrl, setWidgetUrl] = useState(
    `/flights-widget.html?origin_iata=${cityData.iata}&v=1.5.1`
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (!searchParams.has('origin_iata')) {
        searchParams.set('origin_iata', cityData.iata);
      }
      searchParams.set('v', '1.5.1');
      const url = `/flights-widget.html?${searchParams.toString()}`;
      setWidgetUrl(url);
      lastGoodUrlRef.current = url;
    }
  }, [cityData.iata]);

  const partnerIntentRef = useRef(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "resize-iframe") {
        setIframeHeight(event.data.height);
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

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
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

  // Filter other cities for bottom directory
  const otherCities = FLIGHT_CITIES.filter(c => c.slug !== cityData.slug).slice(0, 18);

  return (
    <main className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Clean Minimal Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100 py-2.5 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brand-600 transition-colors font-medium">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/flights" className="hover:text-brand-600 transition-colors font-medium">
            Flights
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Flights from {cityData.name} ({cityData.iata})</span>
        </div>
      </nav>

      {/* Compact Clean Hero Section — Same Unified White & Soft Light Glow */}
      <section className="relative overflow-hidden bg-white text-slate-900 pt-6 pb-6 md:pt-8 md:pb-8 px-4 md:px-8">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-brand-100/35 rounded-full blur-[100px]" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[100%] bg-blue-100/25 rounded-full blur-[90px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-950"
          >
            Cheap Flights from <span className="text-brand-600">{cityData.name} ({cityData.iata})</span>
          </motion.h1>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compare airfares across 100+ airlines flying from {cityData.airportName}. Real-time seat rates, zero hidden fees, and instant PNR e-ticket confirmation.
          </p>
        </div>
      </section>

      {/* Main Search Widget Section — Pre-filled with Origin */}
      <section ref={searchWidgetRef} id="flight-search-widget" className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-10 relative z-20 bg-white">
        <div className="min-h-[160px] transition-all relative">
          {!loaded && (
            <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col justify-center items-center z-30">
              <span className="text-slate-700 font-semibold text-sm mb-3">
                Loading live flights from {cityData.name}...
              </span>
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
            style={{ height: `${iframeHeight}px`, minHeight: "160px" }}
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            className="w-full border-none transition-all duration-300 relative z-10 bg-transparent"
            title={`Flight Search Engine — Flights from ${cityData.name}`}
          />
        </div>
      </section>

      {/* Popular Flight Routes from City — Clean Route Cards */}
      <section className="py-10 md:py-14 bg-white border-t border-slate-100 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-7">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Direct & Connecting Flight Routes from {cityData.name}
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5 max-w-2xl">
              Daily scheduled departures from {cityData.airportName} ({cityData.iata}) with starting fare benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cityData.routes.map((route, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                      <p className="text-xl font-bold text-slate-900">{cityData.iata}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[90px]">{cityData.name}</p>
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

      {/* Airport & Departure Guide for City */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {cityData.name} Airport Departure Guide
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5">
              Essential travel tips for passengers departing from {cityData.airportName}.
            </p>
          </div>

          <div className="space-y-4 text-slate-700 text-xs md:text-sm leading-relaxed">
            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                Airport & Terminal Information
              </h3>
              <p>
                <strong>Airport Name:</strong> {cityData.airportName} ({cityData.iata})<br />
                <strong>Terminals:</strong> {cityData.terminals}<br />
                <strong>Location & Transit:</strong> {cityData.distanceFromCenter}
              </p>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                Baggage Rules & Check-in Guidelines
              </h3>
              <p>
                Standard domestic economy tickets on IndiGo, Akasa Air, and SpiceJet departing from {cityData.name} permit <strong>15 kg check-in baggage</strong> and <strong>7 kg cabin baggage</strong>. Air India domestic economy tickets include up to <strong>20 kg check-in allowance</strong>. Web check-in opens 48 hours before scheduled departure.
              </p>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5">
                Airport Layover & Transit Hotel Rooms
              </h3>
              <p>
                Have an early morning flight or a long layover at {cityData.airportName}? GetHotelStays offers verified hotels and flexible 3, 6, and 12-hour micro-stays near {cityData.name} Airport with our signature &quot;Pay 12% Now&quot; deposit model.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href="/hotels"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  View Hotels Near {cityData.name} Airport →
                </Link>
                <span className="text-slate-300">·</span>
                <Link
                  href="/flights"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Explore All Global Flight Deals →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AEO FAQ Section for City */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions: Flights from {cityData.name}
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1.5">
              Clear answers regarding airfares, airlines, and departures from {cityData.airportName}.
            </p>
          </div>

          <div className="space-y-3">
            {cityData.faqs.map((faq, index) => {
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

      {/* Other Major Departure Cities Directory — Link Equity Matrix */}
      <section className="py-10 bg-white border-t border-slate-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Explore Flights from Other Indian Cities</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Direct and connecting flights scanning 50+ major Indian departure hubs daily.
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shrink-0"
            >
              All 50+ City Flight Hubs →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            {otherCities.map((other, idx) => (
              <Link
                key={idx}
                href={`/flights-from/${other.slug}`}
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <p className="font-bold text-slate-900">Flights from {other.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{other.iata} · {other.routes.length}+ direct routes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
