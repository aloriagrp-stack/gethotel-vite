import type { Metadata } from "next";
import PricingPolicy from "@/pages-legacy/PricingPolicy";

export const metadata: Metadata = {
  title: "Pricing & Payment Policy | GetHotelStays — 12% Deposit Model",
  description: "Transparent pricing breakdown, dynamic GST compliance, and pay-at-hotel terms on GetHotelStays.",
};

export default function Page() {
  return <PricingPolicy />;
}
