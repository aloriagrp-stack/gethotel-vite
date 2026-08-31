import type { Metadata } from "next";
import FrontDesk from "@/pages-legacy/partner-dashboard/FrontDesk";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Front Desk Operations | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <FrontDesk />
    </PartnerLayout>
  );
}
