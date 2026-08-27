import type { Metadata } from "next";
import { KarolBaghDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hotels in Karol Bagh Delhi — Best Value Stays & Shopping Hub | GetHotelStays",
  description: "Book comfortable family and couple stays in Karol Bagh near Gaffar Market and Ajmal Khan Road. Pay 12% online.",
};

export default function Page() {
  return <KarolBaghDelhiHotels />;
}
