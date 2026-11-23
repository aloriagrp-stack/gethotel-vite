import type { Metadata } from "next";
import ClientHotelDetailsPage from "@/pages-legacy/HotelDetails";
import { allDelhiHotels } from "@/lib/delhiHotelsHelper";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let formattedName = id ? id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : `Hotel #${id}`;
  let city = "India";
  let isDirectory = false;
  let contactPhone = "";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/hotels/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        formattedName = json.data.name;
        city = json.data.city || "India";
        isDirectory = json.data.listingType === "directory";
        contactPhone = json.data.contactPhone || "";
      }
    }
  } catch (_) {}

  if (!formattedName || formattedName === `Hotel #${id}`) {
    const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanSlug = slugify(id);
    const staticMatch = (allDelhiHotels as any[]).find((h: any) =>
      String(h.id) === id ||
      slugify(h.name) === cleanSlug ||
      slugify(h.name).includes(cleanSlug) ||
      cleanSlug.includes(slugify(h.name))
    );
    if (staticMatch) {
      formattedName = staticMatch.name;
      city = staticMatch.city || "India";
      contactPhone = staticMatch.contactPhone || "";
    }
  }

  const title = isDirectory
    ? `${formattedName}, ${city} — Verified Contact Number, Phone & Rates | GetHotelStays`
    : `${formattedName}, ${city} — Best Price Booking, Rooms & Deals | GetHotelStays`;

  const phoneSnippet = contactPhone ? ` (Phone: ${contactPhone})` : "";
  const description = isDirectory
    ? `Direct contact phone number${phoneSnippet}, email & reception address for ${formattedName}, ${city}. Call front desk directly or compare live Booking.com & MMT deals on GetHotelStays.`
    : `Book ${formattedName} in ${city} online with 12% deposit. Verified property, couple-friendly, instant confirmation & 24/7 support on GetHotelStays.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      formattedName,
      `${formattedName} contact number`,
      `${formattedName} phone number`,
      `${formattedName} address`,
      `${formattedName} booking`,
      `${formattedName} booking.com`,
      `${formattedName} makemytrip`,
      `${formattedName} price`,
      `${city} hotels`,
      "gethotelstays"
    ],
    openGraph: {
      title,
      description,
      siteName: "GetHotelStays",
    }
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialHotel = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/hotels/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        initialHotel = json.data;
      }
    }
  } catch (_) {}

  if (!initialHotel) {
    const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanSlug = slugify(id);
    const staticMatch = (allDelhiHotels as any[]).find((h: any) =>
      String(h.id) === id ||
      slugify(h.name) === cleanSlug ||
      slugify(h.name).includes(cleanSlug) ||
      cleanSlug.includes(slugify(h.name))
    );
    if (staticMatch) {
      initialHotel = staticMatch;
    }
  }

  let hotelSchema = null;
  if (initialHotel) {
    hotelSchema = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "name": initialHotel.name,
      "description": initialHotel.description || `Stay at ${initialHotel.name} in ${initialHotel.city || 'Delhi, India'}. Best rates, verified amenities and flexible check-in on GetHotelStays.`,
      "image": initialHotel.thumbnail || (Array.isArray(initialHotel.images) ? initialHotel.images[0] : null),
      "telephone": initialHotel.contactPhone || "+91-800-GETHOTEL",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": initialHotel.address || initialHotel.city || "Delhi",
        "addressLocality": initialHotel.city || "Delhi",
        "addressCountry": "IN"
      },
      "priceRange": initialHotel.pricePerNight ? `₹${initialHotel.pricePerNight}` : "₹999 - ₹4,999",
      "starRating": {
        "@type": "Rating",
        "ratingValue": initialHotel.starRating || 4
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": initialHotel.guestRating || 4.5,
        "reviewCount": initialHotel.reviewCount || 48,
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  }

  return (
    <>
      {hotelSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
        />
      )}
      <ClientHotelDetailsPage hotelId={id} initialHotel={initialHotel} />
    </>
  );
}
