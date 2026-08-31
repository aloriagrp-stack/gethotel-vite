import type { Metadata } from "next";
import Dashboard from "@/pages-legacy/partner-dashboard/Dashboard";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Partner Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Dashboard />
    </PartnerLayout>
  );
}
