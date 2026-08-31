'use client';
import { useEffect, useState } from "react";
import { useParams, useLocation } from "@/lib/navigation";
import HotelDetailContent from "./HotelDetailContent";
import { hotelApi } from "@/lib/api";
import { getHotelUrl } from "@/lib/utils";
import SEOHead from "@/components/common/SEOHead";
import Loader from "@/components/common/Loader";
import { buildHotelSEO, buildHotelSchema, buildBreadcrumbSchema, SITE } from "@/lib/seo";

interface HotelDetailPageProps {
    hotelId?: string;
}

export default function HotelDetailPage({ hotelId }: HotelDetailPageProps = {}) {
    const navParams = useParams<{ id?: string }>();
    const location = useLocation();

    // Resolve id from prop, next navigation params, or window pathname
    let rawId = hotelId || (typeof navParams?.id === 'string' ? navParams.id : undefined);
    if (!rawId && typeof window !== 'undefined') {
        const pathname = location?.pathname || window.location.pathname;
        const match = pathname.match(/\/hotel\/([^\/\?]+)/);
        if (match && match[1]) {
            rawId = match[1];
        }
    }
    const id = rawId ? decodeURIComponent(rawId).trim() : "";

    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchHotel = async () => {
            if (!id) {
                setLoading(false);
                setError(true);
                return;
            }
            try {
                setLoading(true);
                const json = await hotelApi.getHotel(id);
                if (json.success && json.data) {
                    setHotel(json.data);
                    setError(false);
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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#050505] text-white">
                <h2 className="text-3xl font-black mb-3">404 - Hotel Not Found</h2>
                <p className="text-neutral-400 text-sm mb-6 max-w-md">
                    We couldn't find the requested property. It may have been moved or updated.
                </p>
                <a 
                    href="/hotels" 
                    className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all"
                >
                    Browse All Verified Hotels
                </a>
            </div>
        );
    }

    const seoData = buildHotelSEO(hotel);
    const hotelSchema = buildHotelSchema(hotel, hotel.reviews || []);
    const cityUrl = hotel.city && ["goa", "jaipur", "manali", "shimla", "udaipur", "delhi"].includes(hotel.city.toLowerCase().trim())
        ? `/${hotel.city.toLowerCase().trim()}-hotels`
        : `/hotels?city=${encodeURIComponent(hotel.city || "")}`;

    const cleanUrl = `${SITE.url}${getHotelUrl(hotel.id, hotel.name)}`;

    const breadcrumb = buildBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Hotels", url: "/hotels" },
        { name: hotel.city || "India", url: cityUrl },
        { name: hotel.name, url: getHotelUrl(hotel.id, hotel.name) },
    ]);

    return (
        <>
            <SEOHead
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                ogType="place"
                ogImage={seoData.ogImage}
                ogUrl={cleanUrl}
                canonicalUrl={cleanUrl}
                schemas={[hotelSchema, breadcrumb]}
            />
            <HotelDetailContent initialHotel={hotel} id={String(hotel.id || id)} />
        </>
    );
}
