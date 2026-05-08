"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlueWavesBackground from "@/components/home/BlueWavesBackground";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isNoLayoutPage = pathname?.startsWith("/admin") || pathname?.startsWith("/partner") || pathname === "/login" || pathname === "/register" || pathname === "/partner-dashboard" || pathname === "/.controlhub";

    if (isNoLayoutPage) {
        return <main className="relative z-10">{children}</main>;
    }

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen">
                <BlueWavesBackground />
                <main className="relative">{children}</main>
            </div>
            <Footer />
        </>
    );
}
