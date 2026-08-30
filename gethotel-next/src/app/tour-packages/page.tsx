import type { Metadata } from "next";
import TourPackages from "@/pages-legacy/TourPackages";

export const metadata: Metadata = {
  title: "Tour & Holiday Packages in India | GetHotelStays",
  description: "Explore curated holiday packages, golden triangle tours, beach holidays, and hill station escapes across India.",
  alternates: {
    canonical: "https://gethotelstays.com/tour-packages",
  },
};

export default function Page() {
  return <TourPackages />;
}
