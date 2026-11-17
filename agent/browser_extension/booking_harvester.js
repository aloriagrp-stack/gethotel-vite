/**
 * GHS BOOKING.COM ULTRA-FAST LINK & RATE EXTRACTOR
 * Paste this in your Chrome DevTools Console (F12 -> Console) on any Booking.com search page.
 * 
 * Features:
 * - Floating HUD widget showing live hotel count & page number.
 * - Auto-scrolls each page to load all property cards.
 * - Auto-clicks 'Next page' until all pages in the city are harvested.
 * - Auto-downloads 'booking_hotels_queue.json' when finished or when you click Stop.
 */

(function () {
    if (window.__GHS_HARVESTER_ACTIVE) {
        alert("GHS Harvester is already running on this page!");
        return;
    }
    window.__GHS_HARVESTER_ACTIVE = true;

    const harvestedHotels = new Map();
    let isRunning = false;
    let pageCount = 1;

    // 1. Create Floating HUD
    const hud = document.createElement("div");
    hud.id = "ghs-hud";
    hud.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999999;
        background: #0f172a;
        color: #f8fafc;
        border: 2px solid #38bdf8;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.6);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        min-width: 280px;
    `;

    hud.innerHTML = `
        <div style="font-weight: bold; font-size: 15px; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>⚡ GHS Fast Link Harvester</span>
            <span id="ghs-spinner" style="display:none; font-size: 12px;">🔄 Harvesting...</span>
        </div>
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">Hotels Collected: <strong id="ghs-count" style="color: #4ade80; font-size: 16px;">0</strong></div>
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">Pages Scanned: <strong id="ghs-pages" style="color: #cbd5e1;">1</strong></div>
        <div style="display: flex; gap: 8px;">
            <button id="ghs-start-btn" style="flex: 1; padding: 8px 12px; background: #22c55e; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">🚀 Start Auto</button>
            <button id="ghs-download-btn" style="flex: 1; padding: 8px 12px; background: #0284c7; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">💾 Download JSON</button>
        </div>
        <div id="ghs-status" style="font-size: 11px; color: #cbd5e1; margin-top: 8px; text-align: center;">Click Start to begin auto-pagination</div>
    `;

    document.body.appendChild(hud);

    const countEl = document.getElementById("ghs-count");
    const pagesEl = document.getElementById("ghs-pages");
    const statusEl = document.getElementById("ghs-status");
    const spinnerEl = document.getElementById("ghs-spinner");
    const startBtn = document.getElementById("ghs-start-btn");
    const downloadBtn = document.getElementById("ghs-download-btn");

    function cleanUrl(rawUrl) {
        if (!rawUrl) return "";
        try {
            const u = new URL(rawUrl, window.location.origin);
            return `${u.origin}${u.pathname}`;
        } catch (e) {
            return rawUrl.split("?")[0];
        }
    }

    function extractCurrentPageCards() {
        const cards = document.querySelectorAll('[data-testid="property-card"]');
        let newFound = 0;

        cards.forEach(card => {
            const titleLink = card.querySelector('a[data-testid="title-link"], a[href*="/hotel/"]');
            const titleEl = card.querySelector('[data-testid="title"]');
            const priceEl = card.querySelector('[data-testid="price-and-discounted-price"], span[data-testid="price-and-discounted-price"]');
            
            if (titleLink && titleLink.href) {
                const url = cleanUrl(titleLink.href);
                const name = titleEl ? titleEl.innerText.trim() : (titleLink.innerText || "").trim();
                
                let cardPrice = null;
                if (priceEl && priceEl.innerText) {
                    const priceDigits = priceEl.innerText.replace(/[^\d]/g, "");
                    if (priceDigits) cardPrice = parseInt(priceDigits, 10);
                }

                if (url && !harvestedHotels.has(url)) {
                    harvestedHotels.set(url, {
                        name: name,
                        url: url,
                        card_price: cardPrice,
                        harvestedAt: new Date().toISOString()
                    });
                    newFound++;
                }
            }
        });

        countEl.innerText = harvestedHotels.size;
        return newFound;
    }

    function downloadJSON() {
        if (harvestedHotels.size === 0) {
            alert("No hotels collected yet! Let it scan first.");
            return;
        }
        const dataList = Array.from(harvestedHotels.values());
        const blob = new Blob([JSON.stringify(dataList, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        a.download = `booking_delhi_hotels_${dataList.length}_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        statusEl.innerText = `Saved ${dataList.length} hotels to Downloads!`;
    }

    async function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function autoScrollAndHarvest() {
        isRunning = true;
        startBtn.innerText = "⏸️ Pause";
        startBtn.style.background = "#eab308";
        spinnerEl.style.display = "inline";

        while (isRunning) {
            statusEl.innerText = `Scanning page ${pageCount}...`;
            
            // Smooth scroll down to trigger lazy loading
            for (let i = 0; i < 6; i++) {
                window.scrollBy(0, window.innerHeight * 0.8);
                await sleep(400);
                extractCurrentPageCards();
            }

            extractCurrentPageCards();
            statusEl.innerText = `Page ${pageCount} done. Total: ${harvestedHotels.size}`;

            // Find Next Page Button
            const nextBtn = document.querySelector('button[aria-label="Next page"], button[aria-label="Next"], [aria-label="Next page"] button');
            
            if (nextBtn && !nextBtn.disabled) {
                statusEl.innerText = `Navigating to page ${pageCount + 1}...`;
                await sleep(800);
                nextBtn.click();
                pageCount++;
                pagesEl.innerText = pageCount;
                await sleep(2500); // Wait for page DOM reload
            } else {
                statusEl.innerText = `🏁 All pages reached! Collected ${harvestedHotels.size} hotels.`;
                isRunning = false;
                startBtn.innerText = "🚀 Done";
                startBtn.style.background = "#22c55e";
                spinnerEl.style.display = "none";
                downloadJSON();
                break;
            }
        }
    }

    startBtn.onclick = () => {
        if (!isRunning) {
            autoScrollAndHarvest();
        } else {
            isRunning = false;
            startBtn.innerText = "▶️ Resume";
            startBtn.style.background = "#22c55e";
            spinnerEl.style.display = "none";
            statusEl.innerText = "Paused.";
        }
    };

    downloadBtn.onclick = downloadJSON;

    // Initial extract of what's already visible
    extractCurrentPageCards();
})();
