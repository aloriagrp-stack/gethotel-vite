import type { Metadata } from "next";
import SuperAdminDashboard from "@/pages-legacy/admin/AdminDashboard";
import AdminLayout from "@/components/layout/AdminLayout";

export function generateStaticParams() {
  return [{ slug: ["dashboard"] }];
}

export const metadata: Metadata = {
  title: "Super Admin Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <AdminLayout>
      <SuperAdminDashboard />
    </AdminLayout>
  );
}
