import type { Metadata } from "next";
import ShimlaHotels from "@/pages-legacy/destinations/ShimlaHotels";

export const metadata: Metadata = {
  title: "Hotels in Shimla — Mall Road & Mountain Resorts | GetHotelStays",
  description: "Book colonial stays and mountain view hotels in Shimla on Mall Road. Instant confirmation.",
};

export default function Page() {
  return <ShimlaHotels />;
}
