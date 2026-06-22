import { useParams, Navigate } from "react-router-dom";
import DestinationLanding from "./DestinationLanding";
import { getCityBySlug, CITIES } from "@/lib/cityData";

export default function CityPage() {
    const { citySlug } = useParams<{ citySlug: string }>();
    const cityData = getCityBySlug(citySlug || "");

    if (!cityData) {
        return <Navigate to="/hotels" replace />;
    }

    return (
        <DestinationLanding
            city={cityData.city}
            title={cityData.title}
            description={cityData.description}
            keywords={cityData.keywords}
            h1={cityData.h1}
            introduction={cityData.introduction}
            sections={cityData.sections}
            faqs={cityData.faqs}
            urlSlug={cityData.slug}
            urlPrefix="/hotels-in/"
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
