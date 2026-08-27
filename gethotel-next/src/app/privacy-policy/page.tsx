import type { Metadata } from "next";
import PrivacyPolicy from "@/pages-legacy/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | GetHotelStays",
  description: "Read GetHotelStays Privacy Policy to understand how we collect, protect, and use your personal information.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
