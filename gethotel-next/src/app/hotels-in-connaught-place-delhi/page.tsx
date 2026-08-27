import type { Metadata } from "next";
import { ConnaughtPlaceDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hotels in Connaught Place (CP) Delhi — Central Business District | GetHotelStays",
  description: "Stay in central Delhi near Rajiv Chowk Metro, Janpath & India Gate. Premium and budget stays with instant booking.",
};

export default function Page() {
  return <ConnaughtPlaceDelhiHotels />;
}
