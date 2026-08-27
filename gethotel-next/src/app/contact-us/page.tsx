import type { Metadata } from "next";
import ContactUs from "@/pages-legacy/ContactUs";

export const metadata: Metadata = {
  title: "Contact Us & 24/7 Support | GetHotelStays",
  description: "Get in touch with GetHotelStays customer care team for instant booking assistance, partner inquiries, or support.",
};

export default function Page() {
  return <ContactUs />;
}
