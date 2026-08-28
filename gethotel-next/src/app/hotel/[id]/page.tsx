import type { Metadata } from "next";
import ClientHotelDetailsPage from "@/pages-legacy/HotelDetails";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verified Hotel Stay (ID: ${id}) | GetHotelStays`,
    description: `Book verified hotel with 12% deposit online on GetHotelStays. Pay rest at check-in. Instant confirmation & free cancellation.`,
  };
}

export default function Page() {
  return <ClientHotelDetailsPage />;
}
