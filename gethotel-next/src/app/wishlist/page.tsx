import type { Metadata } from "next";
import ClientWishlistPage from "@/pages-legacy/Wishlist";

export const metadata: Metadata = {
  title: "My Wishlist & Saved Hotels | GetHotelStays",
};

export default function Page() {
  return <ClientWishlistPage />;
}
