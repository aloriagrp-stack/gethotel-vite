"use client";

import { useEffect } from "react";

export default function GlobalTranslator() {
    useEffect(() => {
        // Load Google Translate Script
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(addScript);
        }

        (window as any).googleTranslateElementInit = () => {
            new (window as any).google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };

        // Persistence Logic
        const applySavedLanguage = () => {
            const savedLangCode = localStorage.getItem('user-language');
            if (savedLangCode && savedLangCode !== 'en') {
                const checkExist = setInterval(() => {
                    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                    if (select) {
                        select.value = savedLangCode;
                        select.dispatchEvent(new Event('change'));
                        clearInterval(checkExist);
                    }
                }, 200);
                setTimeout(() => clearInterval(checkExist), 10000);
            } else if (savedLangCode === 'en') {
                const checkExist = setInterval(() => {
                    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                    if (select) {
                        const original = document.querySelector('.goog-te-banner-frame .goog-te-button button') as any;
                        if (original && original.innerText.includes('Restore')) {
                             original.click();
                        }
                        clearInterval(checkExist);
                    }
                }, 200);
                setTimeout(() => clearInterval(checkExist), 5000);
            }
        };

        // Watch for language changes from Profile page
        window.addEventListener('languageChanged', applySavedLanguage);
        applySavedLanguage(); // Run on mount

        return () => window.removeEventListener('languageChanged', applySavedLanguage);
    }, []);

    return (
        <>
            <div id="google_translate_element" style={{ display: 'none' }} />
            <style jsx global>{`
                .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
                body { top: 0px !important; }
                .goog-tooltip { display: none !important; }
                .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            `}</style>
        </>
    );
}
