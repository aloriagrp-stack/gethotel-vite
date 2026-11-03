import type { Metadata } from "next";
import BankDetails from "@/pages-legacy/partner-dashboard/BankDetails";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Bank & Payout Details | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <BankDetails />
    </PartnerLayout>
  );
}

