import type { Metadata } from "next";
import ClientHotelDetailsPage from "@/pages-legacy/HotelDetails";

export function generateStaticParams() {
  return [{ id: "1", slug: "stay" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id, slug } = await params;
  const formattedName = slug ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : `Hotel #${id}`;
  return {
    title: `${formattedName} | Best Price Booking | GetHotelStays`,
    description: `Book ${formattedName} with 12% deposit online. Pay rest at check-in. Instant confirmation & 24/7 support.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  return <ClientHotelDetailsPage hotelId={id || slug} />;
}
