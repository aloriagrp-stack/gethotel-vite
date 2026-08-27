import type { Metadata } from "next";
import PartnerDashboard from "@/pages-legacy/partner-dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Partner Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PartnerDashboard />;
}
