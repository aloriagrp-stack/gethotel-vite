'use client';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Har route change pe page ko top pe scroll karta hai.
 * App.tsx mein <Router> ke andar place karo.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname.includes('/admin')) return;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}
