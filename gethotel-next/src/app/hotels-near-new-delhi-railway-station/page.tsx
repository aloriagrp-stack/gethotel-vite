import type { Metadata } from "next";
import { RailwayStationDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hotels Near New Delhi Railway Station (NDLS) & Paharganj | GetHotelStays",
  description: "Book affordable hotels within walking distance of New Delhi Railway Station (NDLS) and Paharganj. Instant check-in & 24/7 support.",
};

export default function Page() {
  return <RailwayStationDelhiHotels />;
}
