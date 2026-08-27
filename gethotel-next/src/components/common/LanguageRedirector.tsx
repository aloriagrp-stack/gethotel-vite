'use client';
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocale, languages } from "@/context/LocaleContext";

interface LanguageRedirectorProps {
    fallback?: boolean;
}

export const LanguageRedirector: React.FC<LanguageRedirectorProps> = ({ fallback = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { langCode, detectAndInitLocale } = useLocale();

    useEffect(() => {
        const handleRedirect = async () => {
            const pathname = location.pathname;
            const segments = pathname.split("/").filter(Boolean);
            const firstSegment = segments[0];

            // If the first segment is already a valid language code, we don't redirect.
            if (languages.some(l => l.code === firstSegment)) {
                return;
            }

            // Otherwise, we prepend the correct language code
            let targetLang = langCode || localStorage.getItem("user-language") || "en";

            // If no user language is saved, trigger automatic geolocation locale detection
            if (!localStorage.getItem("user-language")) {
                await detectAndInitLocale();
                // Get the updated language code from localStorage
                targetLang = localStorage.getItem("user-language") || "en";
            }

            if (fallback) {
                // If it's a fallback redirect, prepend language to the current pathname
                const newPath = `/${targetLang}${pathname}${location.search}${location.hash}`;
                navigate(newPath, { replace: true });
            } else {
                // Root redirector: go to homepage under detected language
                navigate(`/${targetLang}/`, { replace: true });
            }
        };

        handleRedirect();
    }, [location.pathname, langCode, navigate, fallback]);

    return null; // This component only performs redirects, so it returns nothing
};

export default LanguageRedirector;
