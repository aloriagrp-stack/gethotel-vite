import { useParams, Navigate } from "react-router-dom";
import DestinationLanding from "./DestinationLanding";
import { getCityBySlug, getCitySEO, CITIES } from "@/lib/cityData";

export default function CityPage() {
    const { citySlug, filterSlug } = useParams<{ citySlug: string; filterSlug?: string }>();
    const cityData = getCityBySlug(citySlug || "");

    if (!cityData) {
        return <Navigate to="/hotels" replace />;
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
                { label: "Delhi Hotels", url: "/delhi-hotels" },
                { label: "Goa Hotels", url: "/goa-hotels" },
                { label: "Jaipur Hotels", url: "/jaipur-hotels" },
                { label: "Manali Hotels", url: "/manali-hotels" },
                { label: "Shimla Hotels", url: "/shimla-hotels" },
                { label: "Udaipur Hotels", url: "/udaipur-hotels" },
                ...CITIES.filter(c => c.slug !== cityData.slug).slice(0, 6).map(c => ({
                    label: `${c.city} Hotels`,
                    url: `/hotels-in/${c.slug}`,
                })),
            ]}
        />
    );
}
