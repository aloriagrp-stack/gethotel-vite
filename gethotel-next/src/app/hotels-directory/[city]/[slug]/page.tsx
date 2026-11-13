import type { Metadata } from "next";
import ClientHotelDetailsPage from "@/pages-legacy/HotelDetails";

export function generateStaticParams() {
  return [{ city: "delhi", slug: "stay" }];
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; slug: string }> }): Promise<Metadata> {
  const { city: cityParam, slug } = await params;
  
  let formattedName = slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "Hotel";
  let city = cityParam ? cityParam.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "India";
  let contactPhone = "";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/hotels/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        formattedName = json.data.name;
        city = json.data.city || city;
        contactPhone = json.data.contactPhone || "";
      }
    }
  } catch (_) {}

  const title = `${formattedName}, ${city} — Verified Reception Desk, Phone & Direct Rates | GetHotelStays Directory`;
  const phoneSnippet = contactPhone ? ` (Phone: ${contactPhone})` : "";
  const description = `Direct reception contact phone number${phoneSnippet}, email & front desk address for ${formattedName}, ${city}. Call front desk directly or compare live Booking.com & MMT rates on GetHotelStays.`;

  return {
    title,
    description,
    keywords: [
      formattedName,
      `${formattedName} contact number`,
      `${formattedName} reception phone`,
      `${formattedName} address`,
      `${formattedName} booking`,
      `${formattedName} booking.com`,
      `${formattedName} makemytrip`,
      `${formattedName} price`,
      `${city} hotels directory`,
      "gethotelstays"
    ],
    openGraph: {
      title,
      description,
      siteName: "GetHotelStays Directory",
    }
  };
}

export default async function Page({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { slug } = await params;
  let initialHotel = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/hotels/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        initialHotel = json.data;
      }
    }
  } catch (_) {}

  return <ClientHotelDetailsPage hotelId={slug} initialHotel={initialHotel} />;
}
