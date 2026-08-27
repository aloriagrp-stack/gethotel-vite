import type { Metadata } from "next";
import { SouthDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hotels in South Delhi — Boutique Stays near Hauz Khas & Saket | GetHotelStays",
  description: "Book luxury and boutique hotels in South Delhi near Select Citywalk, Greater Kailash and Hauz Khas Village.",
};

export default function Page() {
  return <SouthDelhiHotels />;
}
