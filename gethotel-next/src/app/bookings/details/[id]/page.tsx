import type { Metadata } from "next";
import ClientBookingDetailsPage from "@/pages-legacy/BookingDetails";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export const metadata: Metadata = {
  title: "Booking Confirmation & Details | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ params }: { params?: Promise<{ id: string }> | { id: string } }) {
  let resolvedId = "";
  if (params) {
    const p = await Promise.resolve(params);
    resolvedId = p?.id || "";
  }
  return <ClientBookingDetailsPage bookingId={resolvedId} />;
}
