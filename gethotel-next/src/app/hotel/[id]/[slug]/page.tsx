import type { Metadata } from "next";
import ClientHotelDetailsPage from "@/pages-legacy/HotelDetails";

export function generateStaticParams() {
  return [{ id: "1", slug: "stay" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id, slug } = await params;
  
  let formattedName = slug ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : `Hotel #${id}`;
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

  const title = isDirectory
    ? `${formattedName}, ${city} — Verified Contact Number, Phone & Rates | GetHotelStays`
    : `${formattedName}, ${city} — Best Price Booking, Rooms & Deals | GetHotelStays`;

  const phoneSnippet = contactPhone ? ` (Phone: ${contactPhone})` : "";
  const description = isDirectory
    ? `Direct contact phone number${phoneSnippet}, email & reception address for ${formattedName}, ${city}. Call front desk directly or compare live Booking.com & MMT deals on GetHotelStays.`
    : `Book ${formattedName} in ${city} online with 12% deposit. Verified property, couple-friendly, instant confirmation & 24/7 support on GetHotelStays.`;

  return {
    title,
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

export default async function Page({ params }: { params: Promise<{ id: string; slug: string }> }) {
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

  return <ClientHotelDetailsPage hotelId={id} initialHotel={initialHotel} />;
}
