import type { Metadata } from "next";
import Inventory from "@/pages-legacy/partner-dashboard/Inventory";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Rates & Inventory | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Inventory />
    </PartnerLayout>
  );
}
