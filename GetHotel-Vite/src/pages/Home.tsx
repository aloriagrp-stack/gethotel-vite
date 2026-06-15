


import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Hero from "@/components/home/Hero";
import TrendingHotels from "@/components/home/TrendingHotels";
import AICopilot from "@/components/home/AICopilot";

// Lazy load non-critical, below-the-fold components to reduce initial JS execution and improve INP
const ExploreByDestinations = lazy(() => import("@/components/home/ExploreByDestinations"));
const FeaturedCollections = lazy(() => import("@/components/home/FeaturedCollections"));
const WhyGetHotel = lazy(() => import("@/components/home/WhyGetHotel"));
const HomeSEOContent = lazy(() => import("@/components/home/HomeSEOContent"));

// Placeholders to prevent Layout Shift (CLS)
const ExplorePlaceholder = () => <div className="min-h-[450px] w-full bg-transparent" />;
const CollectionsPlaceholder = () => <div className="min-h-[400px] w-full bg-transparent" />;
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
  const [trendingHotels, setTrendingHotels] = useState([]);
  const [homeConfig, setHomeConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
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

  // Fetch trending hotels
  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const res = await homepageApi.getTrendingHotels();
      if (res.success) {
        setTrendingHotels(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch trending hotels:", err);
    } finally {
      setTrendingLoading(false);
      setLoading(false);
    }
  }, []);

  // Initial fetch (no city override — let backend auto-detect)
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

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
      <Hero
        title={homeConfig?.heroTitle}
        highlight={homeConfig?.heroHighlight}
      />
      <TrendingHotels
        hotels={trendingHotels}
        loading={loading || trendingLoading}
      />
      <Suspense fallback={<ExplorePlaceholder />}>
        <ExploreByDestinations destinations={homeConfig?.destinations} loading={configLoading} />
      </Suspense>
      <Suspense fallback={<CollectionsPlaceholder />}>
        <FeaturedCollections collections={homeConfig?.collections} loading={configLoading} />
      </Suspense>
      <Suspense fallback={<WhyPlaceholder />}>
        <WhyGetHotel />
      </Suspense>
      <Suspense fallback={<SEOPlaceholder />}>
        <HomeSEOContent />
      </Suspense>
      <AICopilot />
    </main>
  );
}



