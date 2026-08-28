import type { Metadata } from "next";
import TourPackageDetails from "@/pages-legacy/TourPackageDetails";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export const metadata: Metadata = {
  title: "Tour Package Itinerary & Booking | GetHotelStays",
  description: "Book customized tour package with verified hotels, sightseeing transfers, and 24/7 dedicated assistance.",
};

export default function Page() {
  return <TourPackageDetails />;
}
