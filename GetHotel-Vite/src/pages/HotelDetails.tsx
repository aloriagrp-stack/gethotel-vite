import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HotelDetailContent from "./HotelDetailContent";
import { hotelApi } from "@/lib/api";
import SEOHead from "@/components/common/SEOHead";
import Loader from "@/components/common/Loader";
import { buildHotelSEO, buildHotelSchema, buildBreadcrumbSchema, SITE } from "@/lib/seo";

export default function HotelDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                if (!id) return;
                const json = await hotelApi.getHotel(id);
                if (json.success) {
                    setHotel(json.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Backend fetch failed:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    if (loading) {
        return <Loader variant="fullscreen" text="Loading hotel details..." />;
    }

    if (error || !hotel) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">404 - Hotel Not Found</div>;
    }

    const seoData = buildHotelSEO(hotel);
    const hotelSchema = buildHotelSchema(hotel, hotel.reviews || []);
    const cityUrl = hotel.city && ["goa", "jaipur", "manali", "shimla", "udaipur"].includes(hotel.city.toLowerCase().trim())
        ? `/${hotel.city.toLowerCase().trim()}-hotels`
        : `/hotels?city=${encodeURIComponent(hotel.city || "")}`;

    const breadcrumb = buildBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Hotels", url: "/hotels" },
        { name: hotel.city || "India", url: cityUrl },
        { name: hotel.name, url: `/hotel/${hotel.id}` },
    ]);

    return (
        <>
            <SEOHead
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                ogType="place"
                ogImage={seoData.ogImage}
                ogUrl={`${SITE.url}/hotel/${hotel.id}`}
                canonicalUrl={`${SITE.url}/hotel/${hotel.id}`}
                schemas={[hotelSchema, breadcrumb]}
            />
            <HotelDetailContent initialHotel={hotel} id={id!} />
        </>
    );
}
