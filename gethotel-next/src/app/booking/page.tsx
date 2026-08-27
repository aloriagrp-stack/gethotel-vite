import type { Metadata } from "next";
import ClientBookingPage from "@/pages-legacy/Booking";

export const metadata: Metadata = {
  title: "Complete Your Hotel Booking | GetHotelStays — 12% Deposit Online",
  description: "Secure your reservation with just 12% advance deposit. Instant booking confirmation and 24/7 customer care.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ClientBookingPage />;
}
