# Delhi SEO Strategy — Inventory-Gated /hotels/delhi Ecosystem

Status: **Implemented & verified 2026-08-13**

## Objective
Make Delhi the #1 organic acquisition market for GetHotelStays via a data-driven, inventory-gated page ecosystem at `/en/hotels/delhi` + `/en/hotels/delhi/:slug`.

## Hard Rules
1. **No doorway pages.** A page is only indexable when live inventory genuinely matches it: `matchedHotels >= requiredInventory` (`isDelhiPageIndexable` in `src/lib/delhiSeo.ts`). Everything else renders with `noindex, nofollow` and an honest empty state.
2. **No invented prices.** `hotel.pricePerNight` = ₹1 placeholder is ignored (`getEffectivePrice`). Real prices only from `room.pricePerNight > 1`. `₹X` placeholders resolve to a real "from" price; otherwise fall back to "honest live rates" text.
3. **`{count}` always live.** Titles, descriptions, intros and FAQs are filled from the actual matched inventory count.

## Architecture
- **Config DB:** `GetHotel-Vite/src/data/delhiSeoConfig.json` — hub + 45 pages (areas, landmarks, hospitals, railway stations, terminals, categories, amenities). Fields: slug, type, priority, primaryKeyword, keywords, title/metaDescription/h1 (with `{count}`/`₹X`), sections, faqs, matchPatterns, categoryMatch, requiredInventory, relatedSlugs, tours, whyStay, landmarks, metros, transport, lastUpdated, contentQuality.
- **Engine:** `GetHotel-Vite/src/lib/delhiSeo.ts` — types, `matchesDelhiPage`, `delhiMatchedHotels`, `getDelhiFromPrice`, `isDelhiPageIndexable`, `fillDelhiTemplate`, `buildDelhiContext`, `buildDelhiSchemas` (BreadcrumbList, CollectionPage, ItemList, FAQPage), `buildDelhiSitemapEntries`, `DELHI_LEGACY_ALIASES`, `resolveDelhiLegacy`, `resolveDelhiKeywordUrl`, and the cached inventory loader `loadDelhiInventory` (5-min TTL; API base = `GHS_API_URL` env on server, else prod/dev API; endpoint `/hotels/search?city=Delhi&limit=200`).
- **Page:** `src/pages/delhi/DelhiLandingPage.tsx` — SSR-seeded from cache, client refetch, per-page head via `SEOHead` (incl. noindex + schemas), hotels grid (HotelCard), whyStay/sections/landmarks/metros/FAQs/tours/related-links, 404 fallback for unknown slugs.
- **Routing:** client `App.tsx` (lazy) + `AppSSR.tsx` (static). Legacy redirects: `/delhi-hotels`, `/hotels-near-delhi-airport`, `/hotels-in-*` → canonical; `/hotels-in/delhi/hourly|couple-friendly` → existing legacy pages; `/hotels-in/delhi/budget|luxury|family|business` → engine pages. `admin/super/delhi-seo` → `AdminDelhiSeo.tsx` dashboard.
- **Sitemaps:** backend `utils/sitemap.js` queries active Delhi hotels + rooms, computes indexable pages with the same rules, writes `delhi-indexable.json` (→ `public_html/` and `GetHotel-Vite/public/`) and emits `/en/hotels/delhi*` URLs (weekly). Frontend `scripts/generate-sitemap.ts` consumes the manifest (skips with warning if absent).

## Current Live Status (prod inventory, 45 active Delhi hotels)
- Indexable: hub, `mahipalpur`, `near-delhi-airport`, `near-terminal-3`*, `business`, `with-parking`, `with-airport-transfer` — 6 URLs in sitemap (82 total).
- All other pages auto-noindex until inventory grows. Adding hotels (esp. Paharganj/CP/Karol Bagh/Railway stations, real room prices) flips pages to indexable automatically — no code change needed.
- `near-terminal-1` pattern list excludes bare "mahipalpur" so T1 stays distinct from the airport-area pages.

## Runbook
- Regenerate sitemap + manifest: `node scripts/generate_sitemap.js` (backend) then `npm run sitemap` (frontend).
- Verify matching matrix with live DB: `node scripts/export-delhi-hotels.js` (backend) → `npx tsx --tsconfig tsconfig.app.json scripts/verify-delhi-seo.ts` (frontend).
- Deploy: `npm run build` + `npm run build:ssr` (SSR now wraps LocaleProvider/CartProvider, strips `/:lang` basename, emits robots meta).

## Known Notes / Next Steps
- `DelhiHotels.tsx` legacy claim "2,000+ verified hotels" is unused now (routes retired to redirects) — remove import when convenient.
- Add more Delhi hotels + real room prices to unlock the remaining 40 noindex pages (Karol Bagh, CP, railway stations, AIIMS corridor are highest demand).
- Watch Google Search Console for `/en/hotels/delhi/*` impressions; extend the same engine pattern to other cities when proven.
