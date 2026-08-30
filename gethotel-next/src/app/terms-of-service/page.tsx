import type { Metadata } from "next";
import TermsOfService from "@/pages-legacy/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service | GetHotelStays",
  description: "Terms and Conditions governing the use of GetHotelStays website and hotel booking services.",
  alternates: {
    canonical: "https://gethotelstays.com/terms-of-service",
  },
};

export default function Page() {
  return <TermsOfService />;
}
