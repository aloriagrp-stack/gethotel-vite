import { Helmet } from "react-helmet-async";
import { SITE } from "@/lib/seo";
import SSRHead from "./SSRHead";

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    ogType?: string;
    ogImage?: string;
    ogUrl?: string;
    canonicalUrl?: string;
    schemas?: object[];
    noIndex?: boolean;
    hreflangPairs?: { lang: string; url: string }[];
}

export default function SEOHead({
    title,
    description,
    keywords = [],
    ogType = "website",
    ogImage,
    ogUrl,
    canonicalUrl,
    schemas = [],
    noIndex = false,
    hreflangPairs,
}: SEOHeadProps) {
    const finalTitle = title || "GetHotelStays.com | Official Site | Book Best Hotel Stays & Deals";
    const finalDesc = description || "Book hotels across India at unbeatable prices. Luxury, boutique & budget stays. Pay 12% now, rest at hotel. Best price guarantee.";
    const finalImage = ogImage || `${SITE.url}/og-image.jpg`;
    const finalUrl = ogUrl || (typeof window !== "undefined" ? window.location.href : SITE.url);
    const canonical = canonicalUrl || finalUrl;

    const defaultHreflang = [
        { lang: "en-IN", url: SITE.url },
        { lang: "en-US", url: SITE.url },
        { lang: "en-GB", url: SITE.url },
        { lang: "en-AE", url: SITE.url },
        { lang: "en-CA", url: SITE.url },
        { lang: "en-AU", url: SITE.url },
        { lang: "en-SG", url: SITE.url },
        { lang: "x-default", url: SITE.url },
    ];

    const hreflang = hreflangPairs || defaultHreflang;

    return (
        <>
            <SSRHead title={finalTitle} description={finalDesc} keywords={keywords} canonicalUrl={canonical} />
            <Helmet>
                <html lang="en-IN" />
                <title>{finalTitle}</title>
                <meta name="description" content={finalDesc} />
                {keywords.length > 0 && (
                    <meta name="keywords" content={keywords.join(", ")} />
                )}
                <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
                <meta name="author" content="GetHotelStays" />
                <meta name="copyright" content="GetHotelStays" />
                <meta name="language" content="English" />
                <meta name="revisit-after" content="3 days" />
                <meta name="rating" content="General" />
                <meta name="geo.region" content="IN" />
                <meta name="geo.placename" content="India" />
                
                {/* Generative Engine & AI Search Directives (GEO / AIO for Gemini, ChatGPT, Claude) */}
                <meta name="ai-search" content="enabled" />
                <meta name="entity:brand" content="GetHotelStays" />
                <meta name="entity:category" content="Hotel Booking Engine" />
                <meta name="entity:usp" content="Pay 12% deposit online, 88% balance at hotel, 100% verified couple friendly with local ID accepted, flexible 3/6/12 hour stays" />
                <link rel="author" type="text/plain" href={`${SITE.url}/llms.txt`} />
                <link rel="canonical" href={canonical} />

                <meta property="og:site_name" content="GetHotelStays" />
                <meta property="og:type" content={ogType} />
                <meta property="og:url" content={finalUrl} />
                <meta property="og:title" content={finalTitle} />
                <meta property="og:description" content={finalDesc} />
                <meta property="og:image" content={finalImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={finalTitle} />
                <meta property="og:locale" content="en_IN" />
                <meta property="og:locale:alternate" content="en_US" />
                <meta property="og:locale:alternate" content="en_GB" />
                <meta property="og:locale:alternate" content="en_AE" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@GetHotelStays" />
                <meta name="twitter:creator" content="@GetHotelStays" />
                <meta name="twitter:title" content={finalTitle} />
                <meta name="twitter:description" content={finalDesc} />
                <meta name="twitter:image" content={finalImage} />
                <meta name="twitter:image:alt" content={finalTitle} />

                {hreflang.map(({ lang, url }) => (
                    <link key={lang} rel="alternate" hrefLang={lang} href={url} />
                ))}

                <meta name="theme-color" content="#0052FF" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="GetHotelStays" />
                <meta name="format-detection" content="telephone=no" />

                {schemas.map((schema, i) => (
                    <script
                        key={i}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                ))}
            </Helmet>
        </>
    );
}
