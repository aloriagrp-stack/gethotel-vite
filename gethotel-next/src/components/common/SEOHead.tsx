'use client';

import React, { useEffect } from "react";
import { SITE } from "@/lib/seo";

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
}: SEOHeadProps) {
    const finalTitle = title || "GetHotelStays.com | Official Site | Book Best Hotel Stays & Deals";
    const finalDesc = description || "Book hotels and handpicked tours across India at unbeatable prices with best price guarantee.";
    const finalCanonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : undefined);
    const finalImage = ogImage || "https://gethotelstays.com/images/og-share-cover.jpg";

    useEffect(() => {
        if (typeof document === "undefined") return;

        // 1. Title
        if (finalTitle) document.title = finalTitle;

        // Helper to upsert meta tags
        const setMeta = (attr: "name" | "property", key: string, value: string) => {
            if (!value) return;
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute("content", value);
        };

        // 2. Primary Meta Tags
        setMeta("name", "description", finalDesc);
        if (keywords.length > 0) {
            setMeta("name", "keywords", keywords.join(", "));
        }
        setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

        // 3. OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Perplexity)
        setMeta("property", "og:title", finalTitle);
        setMeta("property", "og:description", finalDesc);
        setMeta("property", "og:type", ogType);
        if (finalImage) setMeta("property", "og:image", finalImage);
        if (finalCanonical) setMeta("property", "og:url", finalCanonical);
        setMeta("property", "og:site_name", "GetHotelStays");
        setMeta("property", "og:locale", "en_IN");

        // 4. Twitter Card Tags (X, ChatGPT, AI Crawlers)
        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", finalTitle);
        setMeta("name", "twitter:description", finalDesc);
        if (finalImage) setMeta("name", "twitter:image", finalImage);

        // 5. Canonical Link Tag
        if (finalCanonical) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement("link");
                link.setAttribute("rel", "canonical");
                document.head.appendChild(link);
            }
            link.setAttribute("href", finalCanonical);
        }
    }, [finalTitle, finalDesc, finalCanonical, finalImage, ogType, noIndex, keywords]);

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
