

import { useEffect } from "react";

export default function GlobalTranslator() {
    useEffect(() => {
        const initGoogleTranslate = () => {
            if ((window as any).google && (window as any).google.translate && (window as any).google.translate.TranslateElement) {
                new (window as any).google.translate.TranslateElement({
                    pageLanguage: 'en',
                    layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };

        (window as any).googleTranslateElementInit = initGoogleTranslate;

        // Load Google Translate Script securely
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(addScript);
        } else {
            initGoogleTranslate();
        }

        const setTranslateCookie = (lang: string) => {
            const cookieValue = `/en/${lang}`;
            document.cookie = `googtrans=${cookieValue}; path=/;`;
            document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;
            const hostParts = window.location.hostname.split('.');
            if (hostParts.length > 2) {
                const baseDomain = hostParts.slice(-2).join('.');
                document.cookie = `googtrans=${cookieValue}; path=/; domain=.${baseDomain};`;
            }
        };

        // Persistence Logic
        const applySavedLanguage = () => {
            const savedLangCode = localStorage.getItem('user-language') || 'en';
            setTranslateCookie(savedLangCode);

            // Also trigger standard select element if Google Translate is already rendered
            const checkExist = setInterval(() => {
                const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                if (select) {
                    if (select.value !== savedLangCode) {
                        select.value = savedLangCode;
                        select.dispatchEvent(new Event('change'));
                    }
                    clearInterval(checkExist);
                }
            }, 200);
            setTimeout(() => clearInterval(checkExist), 5000);
        };

        // Force hide / remove the google translate top bar using Javascript observers
        const cleanTranslateBar = () => {
            // Target all iframes to find any translation elements (from widget or extensions)
            const allIframes = document.querySelectorAll('iframe');
            allIframes.forEach((frame: any) => {
                const id = frame.id || '';
                const klass = frame.className || '';
                const src = frame.src || '';
                if (
                    id.toLowerCase().includes('translate') || 
                    klass.toLowerCase().includes('translate') || 
                    klass.toLowerCase().includes('goog-te') ||
                    src.toLowerCase().includes('translate')
                ) {
                    frame.style.setProperty('display', 'none', 'important');
                    frame.style.setProperty('visibility', 'hidden', 'important');
                    frame.style.setProperty('height', '0', 'important');
                }
            });

            // Target general skiptranslate and goog-te classes
            const googTeElements = document.querySelectorAll('.goog-te-banner-frame, .goog-te-banner, .skiptranslate, #google_translate_element');
            googTeElements.forEach((el: any) => {
                if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('height', '0', 'important');
                }
            });

            if (document.body) {
                document.body.style.setProperty('top', '0px', 'important');
                document.body.style.setProperty('position', 'static', 'important');
            }
            const htmlEl = document.documentElement;
            if (htmlEl) {
                htmlEl.style.setProperty('margin-top', '0px', 'important');
            }
        };

        const cleanupInterval = setInterval(cleanTranslateBar, 100);

        // Watch for language changes
        window.addEventListener('languageChanged', applySavedLanguage);
        applySavedLanguage(); // Run on mount

        return () => {
            clearInterval(cleanupInterval);
            window.removeEventListener('languageChanged', applySavedLanguage);
        };
    }, []);

    return (
        <>
            <div id="google_translate_element" style={{ display: 'none' }} />
            <style>{`
                /* Hide Google Translate top bar frame */
                iframe.goog-te-banner-frame,
                .goog-te-banner-frame,
                #goog-gt-tt,
                .goog-te-balloon-frame {
                    display: none !important;
                }
                /* Override dynamic spacing added to html/body */
                html {
                    margin-top: 0px !important;
                }
                body {
                    top: 0px !important;
                    position: static !important;
                }
                .goog-te-gadget-icon {
                    display: none !important;
                }
                .goog-tooltip {
                    display: none !important;
                }
                .goog-tooltip:hover {
                    display: none !important;
                }
                .goog-text-highlight {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
        </>
    );
}



