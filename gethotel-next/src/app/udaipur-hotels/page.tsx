import type { Metadata } from "next";
import UdaipurHotels from "@/pages-legacy/destinations/UdaipurHotels";

export const metadata: Metadata = {
  title: "Hotels in Udaipur — Lakeview Heritage Palaces & Stays | GetHotelStays",
  description: "Book lakefront heritage hotels in Udaipur near Lake Pichola. Pay 12% deposit online.",
};

export default function Page() {
  return <UdaipurHotels />;
}
