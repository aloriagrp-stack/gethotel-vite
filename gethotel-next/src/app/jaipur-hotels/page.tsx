import type { Metadata } from "next";
import JaipurHotels from "@/pages-legacy/destinations/JaipurHotels";

export const metadata: Metadata = {
  title: "Hotels in Jaipur — Heritage Stays & Luxury Palaces | GetHotelStays",
  description: "Book heritage hotels and budget stays in Jaipur near Hawa Mahal and Pink City. Pay 12% online, rest at hotel.",
};

export default function Page() {
  return <JaipurHotels />;
}
