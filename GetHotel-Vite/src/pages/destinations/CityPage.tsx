import { useParams, Navigate } from "react-router-dom";
import DestinationLanding from "./DestinationLanding";
import { getCityBySlug, getCitySEO, CITIES } from "@/lib/cityData";

export default function CityPage() {
    const { citySlug, filterSlug, lang } = useParams<{ citySlug: string; filterSlug?: string; lang?: string }>();
    const currentLang = lang || "en";
    const cityData = getCityBySlug(citySlug || "");

    if (!cityData) {
        return <Navigate to={`/${currentLang}/hotels`} replace />;
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
            urlSlug={cityData.slug}
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
