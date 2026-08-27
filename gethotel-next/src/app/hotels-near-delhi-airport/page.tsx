import type { Metadata } from "next";
import { AirportDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hotels Near Delhi Airport (IGI T3/T2/T1) — Aerocity & Mahipalpur | GetHotelStays",
  description: "Book verified hotels near Delhi Airport with airport transfer. Ideal for flight layovers and transit passengers. Pay 12% online.",
};

export default function Page() {
  return <AirportDelhiHotels />;
}
