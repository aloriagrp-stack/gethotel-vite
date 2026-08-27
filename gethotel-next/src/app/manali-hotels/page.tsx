import type { Metadata } from "next";
import ManaliHotels from "@/pages-legacy/destinations/ManaliHotels";

export const metadata: Metadata = {
  title: "Hotels in Manali — Mountain View Resorts & Stays | GetHotelStays",
  description: "Book mountain view resorts and luxury cottages in Manali. Pay 12% online, rest at check-in.",
};

export default function Page() {
  return <ManaliHotels />;
}
