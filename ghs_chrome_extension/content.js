/**
 * GHS Hotel Harvester - Content Script (Injected on Booking.com & Brevistay)
 * BULLETPROOF, UNSTOPPABLE MULTI-PLATFORM EXTRACTION ENGINE
 * - Supports Booking.com (Nightly Standard) & Brevistay (Hourly Micro-Stays: 3h, 6h, 12h)
 * - Auto-skips corporate hotel chains (Radisson, Pride, Bloom, Hyatt, OYO, etc.)
 * - Auto-scrolls all the way to bottom to trigger lazy loading
 * - Auto-dismisses sign-in / cookie popups
 * - Extracts clean URLs, names, and dynamic pricing
 * - Features on-page glass floating pill with live hotel count
 */

const isBrevistay = window.location.hostname.includes("brevistay.com");
let onPagePill = null;

// Major Corporate Hotel Chains List (Skip these so GHS targets independent boutique partners)
const BIG_CHAINS = [
  "radisson", "hyatt", "marriott", "hilton", "holiday inn", "crowne plaza",
  "novotel", "ibis", "mercure", "pullman", "sofitel", "wyndham", "ramada",
  "best western", "taj", "vivanta", "ginger", "itc", "fortune", "welcomhotel",
  "oberoi", "trident", "leela", "lemon tree", "red fox", "pride plaza",
  "pride hotel", "bloom hotel", "bloomrooms", "bloom boutique", "the lalit",
  "sarovar", "golden tulip", "royal orchid", "regenta", "the byke", "lords hotel",
  "lords inn", "lords plaza", "spree", "amritara", "summit", "7 apple",
  "the fern", "fern hotel", "clarks", "country inn", "zolo", "saltstayz",
  "fabhotel", "treebo", "oyo", "townhouse", "sterling", "club mahindra", "qotel"
];

function isCorporateChain(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return BIG_CHAINS.some(c => new RegExp(`\\b${c}\\b`, "i").test(lower));
}

function createOrUpdateOnPagePill(count, isRunning, pageNum = 1) {
  if (!onPagePill) {
    onPagePill = document.createElement("div");
    onPagePill.id = "ghs-floating-pill";
    onPagePill.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999999;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(20px) saturate(190%);
      -webkit-backdrop-filter: blur(20px) saturate(190%);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 40px;
      padding: 10px 20px;
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.4),
        0 14px 35px rgba(0, 0, 0, 0.5),
        0 0 18px rgba(56, 189, 248, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(onPagePill);
  }

  const platformLabel = isBrevistay ? "⏱️ Brevistay" : "🏨 Booking";
  const statusDot = isRunning ? "🟢 Running" : "⏸️ Paused";
  onPagePill.innerHTML = `
    <span style="display:flex;align-items:center;gap:4px;color:#38bdf8;">
      <span style="font-size:15px;filter:drop-shadow(0 0 4px #38bdf8);">⚡</span> GHS
    </span>
    <span style="height:14px;width:1px;background:rgba(255,255,255,0.2);"></span>
    <span style="color:#4ade80;font-size:14px;font-weight:800;filter:drop-shadow(0 0 6px rgba(74,222,128,0.4));">${count} Hotels</span>
    <span style="color:#94a3b8;font-size:11px;font-weight:600;">(${platformLabel} | Pg ${pageNum})</span>
    <span style="font-size:12px;padding:2px 8px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);">${statusDot}</span>
  `;
}

function cleanHotelUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const u = new URL(rawUrl, window.location.origin);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch (e) {
    return rawUrl.split("?")[0].toLowerCase();
  }
}

function dismissPopups() {
  try {
    const popups = document.querySelectorAll(
      'button[aria-label="Dismiss sign-in info."], button[aria-label="Close"], #onetrust-accept-btn-handler, [data-testid="header-sign-in-prompt-dismiss"], button[class*="close"], [aria-label*="close"]'
    );
    popups.forEach(btn => {
      if (btn && btn.offsetParent !== null) {
        btn.click();
      }
    });
  } catch (e) {}
}

async function extractCurrentCards() {
  dismissPopups();
  const store = await chrome.storage.local.get(["ghs_harvested_hotels"]);
  const harvested = store.ghs_harvested_hotels || {};

  if (isBrevistay) {
    // ==========================================
    // BREVISTAY EXTRACTION ENGINE
    // ==========================================
    const allLinks = document.querySelectorAll('a[href*="/hotels/"]');
    allLinks.forEach(a => {
      const href = a.href || "";
      if (/\/hotels\/[a-zA-Z0-9\-]+-\d+/.test(href)) {
        const cleanUrl = cleanHotelUrl(href);

        // Find parent card container
        const cardContainer = a.closest('div[class*="hotel"], div[class*="Card"], div[class*="card"]') || a;
        const titleEl = cardContainer.querySelector('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"], [class*="Name"]');

        let name = "";
        if (titleEl && titleEl.innerText.trim()) {
          name = titleEl.innerText.trim();
        } else if (a.innerText.trim().length > 3 && !/view|book|detail|more|reserve/i.test(a.innerText)) {
          name = a.innerText.trim();
        } else {
          const rawSlug = cleanUrl.split("/").pop().replace(/-\d+$/, "").replace(/-in-[a-z0-9\-]+$/i, "");
          name = rawSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        }

        // Filter out big corporate hotel chains
        if (isCorporateChain(name)) {
          return;
        }

        let hourlyPrice = null;
        const priceMatch = cardContainer.innerText.match(/₹\s*([\d,]+)/);
        if (priceMatch) {
          hourlyPrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
        }

        if (!harvested[cleanUrl]) {
          harvested[cleanUrl] = {
            name: name,
            url: cleanUrl,
            card_price: hourlyPrice,
            source: "brevistay",
            is_hourly: true,
            harvestedAt: new Date().toISOString()
          };
        }
      }
    });

  } else {
    // ==========================================
    // BOOKING.COM EXTRACTION ENGINE
    // ==========================================
    const cards = document.querySelectorAll('[data-testid="property-card"], [data-testid="property-card-container"]');
    cards.forEach(card => {
      const linkEl = card.querySelector('a[data-testid="title-link"], a[href*="/hotel/"]');
      const titleEl = card.querySelector('[data-testid="title"], [data-testid="header-title"], h3');
      const priceEl = card.querySelector('[data-testid="price-and-discounted-price"], span[data-testid="price-and-discounted-price"]');

      if (linkEl && linkEl.href) {
        const url = cleanHotelUrl(linkEl.href);
        if (url && url.includes("/hotel/")) {
          const name = titleEl ? titleEl.innerText.trim() : (linkEl.innerText || "").trim();

          let cardPrice = null;
          if (priceEl && priceEl.innerText) {
            const digits = priceEl.innerText.replace(/[^\d]/g, "");
            if (digits) cardPrice = parseInt(digits, 10);
          } else {
            const m = card.innerText.match(/₹\s*([\d,]+)/);
            if (m) {
              const digits = m[1].replace(/,/g, "");
              cardPrice = parseInt(digits, 10);
            }
          }

          if (!harvested[url]) {
            harvested[url] = {
              name: name,
              url: url,
              card_price: cardPrice,
              source: "booking.com",
              is_hourly: false,
              harvestedAt: new Date().toISOString()
            };
          }
        }
      }
    });

    // Standalone hotel links fallback
    const allHotelLinks = document.querySelectorAll('a[href*="/hotel/"]');
    allHotelLinks.forEach(a => {
      const u = cleanHotelUrl(a.href);
      if (u && u.includes("/hotel/") && !harvested[u]) {
        const text = a.innerText.trim();
        if (text.length > 3 && !text.toLowerCase().includes("show on map") && !text.toLowerCase().includes("reviews")) {
          harvested[u] = {
            name: text,
            url: u,
            card_price: null,
            source: "booking.com",
            is_hourly: false,
            harvestedAt: new Date().toISOString()
          };
        }
      }
    });
  }

  const totalCount = Object.keys(harvested).length;
  await chrome.storage.local.set({ ghs_harvested_hotels: harvested });
  return totalCount;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findLoadMoreButton() {
  try {
    const allButtons = Array.from(document.querySelectorAll('button, a[role="button"]'));
    return allButtons.find(b => {
      if (!b || b.offsetParent === null) return false;
      const text = (b.textContent || b.innerText || "").toLowerCase().trim();
      const testId = (b.getAttribute("data-testid") || "").toLowerCase();
      return (
        testId.includes("load-more") ||
        text.includes("load more results") ||
        text.includes("load more") ||
        text.includes("show more results") ||
        text.includes("show more")
      );
    });
  } catch (e) {
    return null;
  }
}

function findNextPageButton() {
  const nextSelectors = [
    'button[aria-label="Next page"]',
    'button[aria-label="Next"]',
    'button[data-testid="pagination-next"]',
    'nav[aria-label="Pagination"] ol li:last-child button',
    'nav[aria-label="Pagination"] button:last-child',
    'a[aria-label="Next page"]',
    'a[class*="pagination-next"]',
    'li[class*="next"] a'
  ];
  for (const s of nextSelectors) {
    try {
      const el = document.querySelector(s);
      if (el && !el.disabled && el.getAttribute("aria-disabled") !== "true") {
        return el;
      }
    } catch (e) {}
  }
  return null;
}

let isAutoRunning = false;

async function runAutoHarvesterLoop() {
  if (isAutoRunning) return;
  isAutoRunning = true;

  while (isAutoRunning) {
    try {
      const state = await chrome.storage.local.get(["ghs_is_active", "ghs_pages_scanned"]);
      if (!state.ghs_is_active) {
        isAutoRunning = false;
        break;
      }

      const curPage = state.ghs_pages_scanned || 1;

      // 1. Instant Warp Jump to Page Bottom
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(400);

      // Extract cards
      const totalCount = await extractCurrentCards();
      createOrUpdateOnPagePill(totalCount, true, curPage);

      // 2. CHECK FOR "LOAD MORE RESULTS" BUTTON
      const loadMoreBtn = findLoadMoreButton();
      if (loadMoreBtn) {
        await chrome.storage.local.set({ ghs_pages_scanned: curPage + 1 });
        createOrUpdateOnPagePill(totalCount, true, curPage + 1);
        loadMoreBtn.click();
        await sleep(1500);
        continue;
      }

      // 3. CHECK FOR "NEXT PAGE" PAGINATION BUTTON
      const nextBtn = findNextPageButton();
      if (nextBtn) {
        await chrome.storage.local.set({ ghs_pages_scanned: curPage + 1 });
        createOrUpdateOnPagePill(totalCount, true, curPage + 1);
        nextBtn.click();
        await sleep(2200);
        continue;
      }

      // 4. URL PAGINATION FALLBACK
      if (!isBrevistay) {
        const currentUrl = new URL(window.location.href);
        const curOffset = parseInt(currentUrl.searchParams.get("offset") || "0", 10);
        const nextOffset = curOffset + 25;

        if (nextOffset <= 15000) {
          await chrome.storage.local.set({ ghs_pages_scanned: curPage + 1 });
          currentUrl.searchParams.set("offset", nextOffset.toString());
          window.location.href = currentUrl.toString();
          await sleep(6000);
          return;
        }
      } else {
        // Brevistay single page scroll loop
        await sleep(2000);
      }
    } catch (loopErr) {
      console.error("Harvester loop tick error:", loopErr);
      await sleep(1500);
    }
  }
}

// Auto-boot if previously active
(async () => {
  dismissPopups();
  const data = await chrome.storage.local.get(["ghs_is_active", "ghs_harvested_hotels", "ghs_pages_scanned"]);
  const count = Object.keys(data.ghs_harvested_hotels || {}).length;
  const page = data.ghs_pages_scanned || 1;

  createOrUpdateOnPagePill(count, !!data.ghs_is_active, page);

  if (data.ghs_is_active) {
    setTimeout(() => {
      runAutoHarvesterLoop();
    }, 1500);
  }
})();

// Listen to native storage state changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.ghs_is_active !== undefined) {
    if (changes.ghs_is_active.newValue) {
      runAutoHarvesterLoop();
    } else {
      isAutoRunning = false;
      extractCurrentCards().then(cnt => {
        createOrUpdateOnPagePill(cnt, false);
      });
    }
  }
});
