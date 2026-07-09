import React, { useEffect, useState, useRef } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Plane, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function Flights() {
  const [iframeHeight, setIframeHeight] = useState(250);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "resize-iframe") {
        setIframeHeight(event.data.height);
        setLoaded(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      <SEOHead
        title="Book Cheap Flights Online | GetHotelStays"
        description="Search, compare, and book flights globally with GetHotelStays. Find the best airfares with our premium metasearch engine powered by Travelpayouts."
        keywords={["flights", "book flights", "cheap airfares", "metasearch flights", "travelpayouts", "gethotelstays flights"]}
        ogType="website"
        ogUrl={window.location.href}
        canonicalUrl={window.location.href}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-50/50 via-blue-50 to-sky-100/30 text-slate-900 pt-6 pb-10 md:pt-10 md:pb-14 px-4 md:px-8 border-b border-slate-100">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-950"
          >
            Compare & Book <span className="text-brand-600 font-black">Affordable Flights</span>
          </motion.h1>
        </div>
      </div>

      {/* Widget Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-4 pb-16 relative z-20 flex-grow">
        {/* Search Widget Container - transparent to allow iframe dropdowns to overflow floatingly */}
        <div className="min-h-[220px] transition-all relative">
          {/* Custom Premium Skeleton Loader (with card style during load) */}
          {!loaded && (
            <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col justify-center items-center z-30">
              <div className="flex items-center gap-3 mb-4 text-slate-800 font-semibold text-lg animate-pulse">
                <Compass className="w-6 h-6 text-brand-600 animate-spin" />
                <span>Loading flight search panel...</span>
              </div>
              <div className="w-full max-w-3xl flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-12 bg-brand-600/10 rounded-xl animate-pulse self-end w-40" />
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={`/flights-widget.html${window.location.search}`}
            style={{ height: `${iframeHeight}px`, minHeight: "550px" }}
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            className="w-full border-none transition-all duration-300 relative z-10 bg-transparent"
            title="Flight Search Widget"
          />
        </div>
      </div>
    </main>
  );
}
