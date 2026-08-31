import type { Metadata } from "next";
import Coupons from "@/pages-legacy/partner-dashboard/Coupons";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Promotions & Coupons | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Coupons />
    </PartnerLayout>
  );
}
