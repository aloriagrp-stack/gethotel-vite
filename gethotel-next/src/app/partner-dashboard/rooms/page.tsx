import type { Metadata } from "next";
import Rooms from "@/pages-legacy/partner-dashboard/Rooms";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Manage Rooms | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Rooms />
    </PartnerLayout>
  );
}
