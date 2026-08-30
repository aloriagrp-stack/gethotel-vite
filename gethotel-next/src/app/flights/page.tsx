import type { Metadata } from "next";
import Flights from "@/pages-legacy/Flights";

export const metadata: Metadata = {
  title: "Flight Search & Booking | GetHotelStays",
  description: "Search and compare domestic and international flight deals with instant confirmation on GetHotelStays.",
  alternates: {
    canonical: "https://gethotelstays.com/flights",
  },
};

export default function Page() {
  return <Flights />;
}
