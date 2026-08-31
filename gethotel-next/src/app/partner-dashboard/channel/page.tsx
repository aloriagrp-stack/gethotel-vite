import type { Metadata } from "next";
import ChannelSync from "@/pages-legacy/partner-dashboard/ChannelSync";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Channel Sync | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <ChannelSync />
    </PartnerLayout>
  );
}
