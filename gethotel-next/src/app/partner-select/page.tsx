import type { Metadata } from "next";
import PartnerHotelSelect from "@/pages-legacy/PartnerHotelSelect";

export const metadata: Metadata = {
  title: "Select Property | Partner Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PartnerHotelSelect />;
}
