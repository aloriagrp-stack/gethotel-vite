'use client';
import { useParams } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DestinationLanding from "./DestinationLanding";
import { getCityBySlug, getCitySEO, CITIES } from "@/lib/cityData";

interface CityPageProps {
    citySlugOverride?: string;
    filterSlugOverride?: string;
}

export default function CityPage({ citySlugOverride, filterSlugOverride }: CityPageProps = {}) {
    const params = useParams<{ citySlug?: string; filterSlug?: string; lang?: string }>();
    const router = useRouter();
    const citySlug = citySlugOverride || params?.citySlug;
    const filterSlug = filterSlugOverride || params?.filterSlug;
    const lang = params?.lang;
    const currentLang = lang || "en";
    const cityData = getCityBySlug(citySlug || "");

    useEffect(() => {
        if (!cityData && !citySlugOverride) {
            router.replace(`/${currentLang}/hotels`);
        }
    }, [cityData, currentLang, router, citySlugOverride]);

    if (!cityData) {
        return null;
    }

    const seoData = getCitySEO(cityData, filterSlug);

    return (
        <DestinationLanding
            city={seoData.city}
            title={seoData.title}
            description={seoData.description}
            keywords={seoData.keywords}
            h1={seoData.h1}
            introduction={seoData.introduction}
            sections={seoData.sections}
            faqs={seoData.faqs}
            urlSlug={filterSlug ? `${cityData.slug}/${filterSlug}` : cityData.slug}
            urlPrefix="/hotels-in/"
            filterSlug={filterSlug}
            internalLinks={[
                { label: "Delhi Hotels", url: `/${currentLang}/hotels-in-delhi` },
                { label: "Goa Hotels", url: `/${currentLang}/goa-hotels` },
                { label: "Jaipur Hotels", url: `/${currentLang}/jaipur-hotels` },
                { label: "Manali Hotels", url: `/${currentLang}/manali-hotels` },
                { label: "Shimla Hotels", url: `/${currentLang}/shimla-hotels` },
                { label: "Udaipur Hotels", url: `/${currentLang}/udaipur-hotels` },
                ...CITIES.filter(c => c.slug !== cityData.slug).slice(0, 6).map(c => ({
                    label: `${c.city} Hotels`,
                    url: `/${currentLang}/hotels-in/${c.slug}`,
                })),
            ]}
        />
    );
}
