import type { Metadata } from "next";
import CookiePolicy from "@/pages-legacy/CookiePolicy";

export const metadata: Metadata = {
  title: "Cookie Policy | GetHotelStays",
  description: "Learn about how cookies and tracking technologies are used on GetHotelStays.",
};

export default function Page() {
  return <CookiePolicy />;
}
