import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HotelDetailContent from "./HotelDetailContent";
import { hotelApi } from "@/lib/api";
import SEO from "@/components/common/SEO";

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
        return <div className="min-h-screen flex items-center justify-center">Loading hotel details...</div>;
    }

    if (error || !hotel) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">404 - Hotel Not Found</div>;
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": hotel.name,
        "description": hotel.description,
        "image": hotel.thumbnail || hotel.images?.[0],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": hotel.city,
            "streetAddress": hotel.address
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": hotel.guestRating || 4.5,
            "reviewCount": hotel.reviewCount || 100
        },
        "priceRange": `₹${hotel.pricePerNight}+`
    };

    return (
        <>
            <SEO 
                title={`${hotel.name} — Book Hotel in ${hotel.city} | GetHotel`}
                description={`Book your stay at ${hotel.name} in ${hotel.city}. Best prices guaranteed for premium rooms and amenities. ${hotel.description?.substring(0, 150)}...`}
                keywords={`${hotel.name}, hotels in ${hotel.city}, budget hotels ${hotel.city}, premium stays india`}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HotelDetailContent initialHotel={hotel} id={id!} />
        </>
    );
}
