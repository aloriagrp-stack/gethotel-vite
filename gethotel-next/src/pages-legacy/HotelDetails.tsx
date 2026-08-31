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

    // Resolve id dynamically: prioritize actual window URL pathname over hardcoded static params
    let extracted = '';
    if (typeof window !== 'undefined') {
        const pathname = location?.pathname || window.location.pathname;
        const match = pathname.match(/\/hotel\/([^\/\?]+)/);
        if (match && match[1]) {
            extracted = match[1];
        }
    }
    if (!extracted) {
        extracted = (typeof navParams?.id === 'string' ? navParams.id : '') || hotelId || '';
    }
    const id = extracted ? decodeURIComponent(extracted).trim() : "";

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
                    return;
                }
                throw new Error(json.message || "Hotel not found via direct ID");
            } catch (err) {
                console.error("Direct fetch failed, attempting fallback lookup:", err);
                try {
                    const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    const cleanSlug = slugify(id);

                    // Fallback 1: Query full hotels list
                    const listRes = await hotelApi.getHotels();
                    const hotelsList: any[] = listRes.data || [];
                    
                    const matched = hotelsList.find((h: any) => 
                        String(h.id) === id || 
                        slugify(h.name) === cleanSlug || 
                        slugify(h.name).includes(cleanSlug) || 
                        cleanSlug.includes(slugify(h.name))
                    );

                    if (matched) {
                        const fullRes = await hotelApi.getHotel(String(matched.id));
                        if (fullRes.success && fullRes.data) {
                            setHotel(fullRes.data);
                            setError(false);
                            return;
                        }
                    }
                    setError(true);
                } catch (fallbackErr) {
                    console.error("Fallback lookup failed:", fallbackErr);
                    setError(true);
                }
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
