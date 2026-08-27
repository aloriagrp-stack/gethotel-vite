'use client';

import { useState, useEffect, lazy, Suspense } from "react";
import Hero from "@/components/home/Hero";
import ExploreByDestinations from "@/components/home/ExploreByDestinations";
import AICopilot from "@/components/home/AICopilot";
import { useStayMode } from "@/context/StayModeContext";

// Lazy load non-critical, below-the-fold components
const WhyGetHotel = lazy(() => import("@/components/home/WhyGetHotel"));
const HomeSEOContent = lazy(() => import("@/components/home/HomeSEOContent"));

// Placeholders
const WhyPlaceholder = () => <div className="min-h-[350px] w-full bg-transparent" />;
const SEOPlaceholder = () => <div className="min-h-[500px] w-full bg-transparent animate-pulse" />;

import SEOHead from "@/components/common/SEOHead";
import { homepageApi } from "@/lib/api";
import {
    PAGE_SEO,
    organizationSchema,
    websiteSchema,
    travelAgencySchema,
    buildBreadcrumbSchema,
    buildFAQSchema,
    HOME_FAQS,
    SITE,
} from "@/lib/seo";

export default function HomePage() {
  const [homeConfig, setHomeConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch config once on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRes = await homepageApi.getConfig();
        if (configRes.success) setHomeConfig(configRes.data);
      } catch (err) {
        console.error("Failed to fetch homepage config:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <main className="flex flex-col overflow-x-hidden">
      <SEOHead
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        keywords={PAGE_SEO.home.keywords}
        ogType="website"
        ogUrl={SITE.url}
        canonicalUrl={SITE.url}
        schemas={[
            organizationSchema,
            websiteSchema,
            travelAgencySchema,
            buildBreadcrumbSchema([{ name: "Home", url: "/" }]),
            buildFAQSchema(HOME_FAQS),
        ]}
      />
      <h1 className="sr-only">GetHotelStays — Book Best Hotels & Hourly Stays in India</h1>
      
      {/* Hero Section with Search Bar */}
      <Hero
        title={homeConfig?.heroTitle}
        highlight={homeConfig?.heroHighlight}
        transitionInterval={homeConfig?.heroTransitionInterval}
        stories={homeConfig?.stories}
      />

      {/* Top Destinations / Cities Grid */}
      <ExploreByDestinations destinations={homeConfig?.destinations} loading={configLoading} />

      {/* Trust & Features Section */}
      <Suspense fallback={<WhyPlaceholder />}>
        <WhyGetHotel />
      </Suspense>

      {/* SEO Editorial Content */}
      <Suspense fallback={<SEOPlaceholder />}>
        <HomeSEOContent />
      </Suspense>

      <AICopilot />
    </main>
  );
}
