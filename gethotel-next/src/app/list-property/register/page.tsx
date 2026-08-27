import type { Metadata } from "next";
import ListPropertyRegister from "@/pages-legacy/ListPropertyRegister";

export const metadata: Metadata = {
  title: "Register Your Property | GetHotelStays Partner",
  description: "Register your hotel property on GetHotelStays and start receiving bookings immediately.",
};

export default function Page() {
  return <ListPropertyRegister />;
}
