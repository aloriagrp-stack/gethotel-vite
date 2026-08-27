import type { Metadata } from "next";
import GoaHotels from "@/pages-legacy/destinations/GoaHotels";

export const metadata: Metadata = {
  title: "Hotels in Goa — Beach Resorts & Budget Stays | GetHotelStays",
  description: "Book verified beach resorts & budget hotels in North and South Goa. Pay 12% online, rest at check-in. Instant confirmation.",
};

export default function Page() {
  return <GoaHotels />;
}
