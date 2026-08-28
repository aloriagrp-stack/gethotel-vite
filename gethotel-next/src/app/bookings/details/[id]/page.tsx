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

export default function Page() {
  return <ClientBookingDetailsPage />;
}
