import type { Metadata } from "next";
import { HourlyDelhiHotels } from "@/pages-legacy/destinations/DelhiSubLandings";

export const metadata: Metadata = {
  title: "Hourly Hotels in Delhi — Day-Use Rooms 3h/6h/12h Slots | GetHotelStays",
  description: "Book hourly hotels in Delhi for 3, 6, or 12-hour stays near Delhi Airport and Railway Stations. Save up to 70% vs full day rates.",
};

export default function Page() {
  return <HourlyDelhiHotels />;
}
