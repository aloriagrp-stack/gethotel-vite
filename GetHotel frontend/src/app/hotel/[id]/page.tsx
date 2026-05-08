import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HotelDetailContent from "./HotelDetailContent";

interface Props {
    params: Promise<{ id: string }>;
}

async function fetchHotel(id: string) {
    try {
        const res = await fetch(`http://192.168.43.117:5000/api/hotels/${id}`, { 
            cache: 'no-store',
            next: { revalidate: 0 } 
        });
        if (res.ok) {
            const json = await res.json();
            return json.data;
        }
    } catch (err) {
        console.error("Backend fetch failed:", err);
    }
    
    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const hotel = await fetchHotel(id);
    if (!hotel) return { title: "Hotel Not Found" };
    
    const title = `${hotel.name} — ${hotel.city} | GetHotel Luxury Stays`;
    const description = hotel.description?.substring(0, 160) || `Book your luxury stay at ${hotel.name} in ${hotel.city}. Premium experience and best prices only on GetHotel.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [hotel.thumbnail || hotel.images?.[0] || ""],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function HotelDetailPage({ params }: Props) {
    const { id } = await params;
    const hotel = await fetchHotel(id);
    
    if (!hotel) notFound();

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HotelDetailContent initialHotel={hotel} id={id} />
        </>
    );
}
