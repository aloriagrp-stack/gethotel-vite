import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface Currency {
    name: string;
    code: string;
    symbol: string;
    flag: string;
}

export interface Language {
    name: string;
    native: string;
    flag: string;
    code: string;
}

export const currencies: Currency[] = [
    { name: "Indian Rupee", code: "INR", symbol: "₹", flag: "🇮🇳" },
    { name: "US Dollar", code: "USD", symbol: "$", flag: "🇺🇸" },
    { name: "Euro", code: "EUR", symbol: "€", flag: "🇪🇺" },
    { name: "British Pound", code: "GBP", symbol: "£", flag: "🇬🇧" },
    { name: "Japanese Yen", code: "JPY", symbol: "¥", flag: "🇯🇵" },
    { name: "UAE Dirham", code: "AED", symbol: "د.إ", flag: "🇦🇪" },
    { name: "Russian Ruble", code: "RUB", symbol: "₽", flag: "🇷🇺" }
];

export const languages: Language[] = [
    { name: "English", native: "English", flag: "🇺🇸", code: "en" },
    { name: "Hindi", native: "हिन्दी", flag: "🇮🇳", code: "hi" },
    { name: "Spanish", native: "Español", flag: "🇪🇸", code: "es" },
    { name: "French", native: "Français", flag: "🇫🇷", code: "fr" },
    { name: "German", native: "Deutsch", flag: "🇩🇪", code: "de" },
    { name: "Chinese", native: "中文", flag: "🇨🇳", code: "zh" },
    { name: "Japanese", native: "日本語", flag: "🇯🇵", code: "ja" },
    { name: "Arabic", native: "العربية", flag: "🇸🇦", code: "ar" },
    { name: "Russian", native: "Русский", flag: "🇷🇺", code: "ru" },
    { name: "Portuguese", native: "Português", flag: "🇵🇹", code: "pt" }
];

interface LocaleContextType {
    langCode: string;
    currency: Currency;
    exchangeRate: number;
    changeLanguage: (code: string, shouldNavigate?: boolean) => void;
    changeCurrency: (curr: Currency) => Promise<void>;
    detectAndInitLocale: () => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Fallback rates if API fails
const fallbacks: Record<string, number> = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094,
    JPY: 1.88,
    AED: 0.044,
    RUB: 1.05
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Language state initialization
    const [langCode, setLangCodeState] = useState<string>(() => {
        // First try to check URL path prefix on reload
        const pathSegments = window.location.pathname.split("/").filter(Boolean);
        const urlLang = pathSegments[0];
        if (languages.some(l => l.code === urlLang)) {
            localStorage.setItem("user-language", urlLang);
            return urlLang;
        }

        // Second try: localStorage
        const savedLang = localStorage.getItem("user-language");
        if (savedLang && languages.some(l => l.code === savedLang)) {
            return savedLang;
        }

        // Default: 'en'
        return "en";
    });

    // 2. Currency state initialization
    const [currency, setCurrencyState] = useState<Currency>(() => {
        const savedCode = localStorage.getItem("user-currency");
        const found = currencies.find(c => c.code === savedCode);
        return found || { name: "Indian Rupee", code: "INR", symbol: "₹", flag: "🇮🇳" };
    });

    const [exchangeRate, setExchangeRate] = useState<number>(() => {
        const savedRate = localStorage.getItem("currency-rate");
        return savedRate ? parseFloat(savedRate) : (fallbacks[currency.code] || 1);
    });

    // Sync state to local storage on changes
    useEffect(() => {
        localStorage.setItem("user-language", langCode);
        localStorage.setItem("user-currency", currency.code);
        localStorage.setItem("currency-rate", String(exchangeRate));
    }, [langCode, currency, exchangeRate]);

    // Auto-sync currency based on active langCode if they don't match
    useEffect(() => {
        let targetCurrCode = currency.code;
        if (langCode === "es") targetCurrCode = "EUR";
        else if (langCode === "hi") targetCurrCode = "INR";
        else if (["de", "fr"].includes(langCode)) targetCurrCode = "EUR";
        else if (langCode === "ja") targetCurrCode = "JPY";
        else if (langCode === "ar") targetCurrCode = "AED";
        else if (langCode === "ru") targetCurrCode = "RUB";
        else if (langCode === "en") {
            // For English, use the detected local currency from geolocation, or default to INR
            const detectedCurr = localStorage.getItem("detected-local-currency") || "INR";
            targetCurrCode = detectedCurr;
        }

        if (currency.code !== targetCurrCode) {
            const foundCurr = currencies.find(c => c.code === targetCurrCode);
            if (foundCurr) {
                setCurrencyState(foundCurr);
                localStorage.setItem("user-currency", foundCurr.code);
                fetchExchangeRate(foundCurr.code);
            }
        }
    }, [langCode]);

    // Fetch live currency rates
    const fetchExchangeRate = async (targetCode: string): Promise<number> => {
        try {
            const res = await fetch("https://open.er-api.com/v6/latest/INR");
            const data = await res.json();
            if (data && data.rates) {
                const rate = data.rates[targetCode];
                if (rate) {
                    setExchangeRate(rate);
                    localStorage.setItem("currency-rate", String(rate));
                    return rate;
                }
            }
        } catch (e) {
            console.error("Error fetching exchange rates, using fallback:", e);
        }
        const fallbackRate = fallbacks[targetCode] || 1;
        setExchangeRate(fallbackRate);
        localStorage.setItem("currency-rate", String(fallbackRate));
        return fallbackRate;
    };

    // Trigger initial currency rates sync
    useEffect(() => {
        fetchExchangeRate(currency.code);
    }, []);

    // Helper to change language and redirect URL
    const changeLanguage = (code: string, shouldNavigate = true) => {
        if (!languages.some(l => l.code === code)) return;
        setLangCodeState(code);
        localStorage.setItem("user-language", code);

        // Auto-change currency based on language to match local currency
        let targetCurrCode = "INR";
        if (code === "es") {
            targetCurrCode = "EUR";
        } else if (code === "en") {
            targetCurrCode = "USD";
        } else if (code === "hi") {
            targetCurrCode = "INR";
        } else if (["de", "fr"].includes(code)) {
            targetCurrCode = "EUR";
        } else if (code === "ja") {
            targetCurrCode = "JPY";
        } else if (code === "ar") {
            targetCurrCode = "AED";
        }

        const foundCurr = currencies.find(c => c.code === targetCurrCode);
        if (foundCurr) {
            setCurrencyState(foundCurr);
            localStorage.setItem("user-currency", foundCurr.code);
            fetchExchangeRate(foundCurr.code);
        }

        // Dispatch events for legacy sync in the app
        window.dispatchEvent(new Event("languageChanged"));

        if (shouldNavigate) {
            const pathname = location.pathname;
            const segments = pathname.split("/").filter(Boolean);
            const firstSegment = segments[0];
            const isLangSegment = languages.some(l => l.code === firstSegment);

            if (isLangSegment) {
                segments[0] = code;
            } else {
                segments.unshift(code);
            }

            const newPath = "/" + segments.join("/") + location.search + location.hash;
            navigate(newPath, { replace: true });
        }
    };

    // Helper to change currency
    const changeCurrency = async (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem("user-currency", curr.code);
        await fetchExchangeRate(curr.code);
        window.dispatchEvent(new Event("currencyChanged"));
    };

    // Detect User Location (Country) and initialize language & currency accordingly
    const detectAndInitLocale = async () => {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data && data.country_code) {
                const country = data.country_code.toUpperCase();
                let targetLang = "en";
                let targetCurr = currencies.find(c => c.code === "USD")!;

                // Map country codes to locales
                if (["ES", "MX", "AR", "CO", "PE", "CL"].includes(country)) {
                    targetLang = "es";
                    targetCurr = currencies.find(c => c.code === (country === "ES" ? "EUR" : "USD")) || targetCurr;
                } else if (country === "IN") {
                    targetLang = "en"; // default for tourism
                    targetCurr = currencies.find(c => c.code === "INR")!;
                } else if (["DE", "FR", "IT", "NL", "BE"].includes(country)) {
                    targetLang = country === "DE" ? "de" : (country === "FR" ? "fr" : "en");
                    targetCurr = currencies.find(c => c.code === "EUR")!;
                } else if (country === "GB") {
                    targetLang = "en";
                    targetCurr = currencies.find(c => c.code === "GBP")!;
                } else if (country === "JP") {
                    targetLang = "ja";
                    targetCurr = currencies.find(c => c.code === "JPY")!;
                } else if (country === "AE") {
                    targetLang = "ar";
                    targetCurr = currencies.find(c => c.code === "AED")!;
                } else if (country === "RU") {
                    targetLang = "ru";
                    targetCurr = currencies.find(c => c.code === "RUB")!;
                }

                // Store detected local currency for language fallback sync
                localStorage.setItem("detected-local-currency", targetCurr.code);

                // Do not overwrite user selections if they have already manually set preferences
                if (localStorage.getItem("user-language") || localStorage.getItem("user-currency")) {
                    return;
                }

                setLangCodeState(targetLang);
                setCurrencyState(targetCurr);
                await fetchExchangeRate(targetCurr.code);
                
                // Redirect user to their detected language prefix
                changeLanguage(targetLang, true);
            }
        } catch (e) {
            console.error("Could not automatically detect location:", e);
        }
    };

    // Auto-detect location on first load
    useEffect(() => {
        detectAndInitLocale();
    }, []);

    return (
        <LocaleContext.Provider value={{ langCode, currency, exchangeRate, changeLanguage, changeCurrency, detectAndInitLocale }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
};
