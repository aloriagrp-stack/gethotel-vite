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
    const finalDesc = description || "Book hotels across India at unbeatable prices. Luxury, boutique & budget stays. Pay 12% now, rest at hotel. Best price guarantee.";

    useEffect(() => {
        if (typeof document !== "undefined") {
            if (finalTitle) document.title = finalTitle;
            const descMeta = document.querySelector('meta[name="description"]');
            if (descMeta && finalDesc) {
                descMeta.setAttribute("content", finalDesc);
            }
        }
    }, [finalTitle, finalDesc]);

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
