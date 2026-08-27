import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    delhiHub,
    delhiPages,
    buildDelhiContext,
    normalizeDelhiHotels,
    resolveDelhiKeywordUrl,
    resolveDelhiLegacy,
    getDelhiFromPrice,
} from "../src/lib/delhiSeo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturePath = path.join(__dirname, "fixtures", "delhi-hotels.json");
if (!fs.existsSync(fixturePath)) {
    console.error("Fixture missing — run backend scripts/export-delhi-hotels.js first.");
    process.exit(1);
}
const hotels = normalizeDelhiHotels(JSON.parse(fs.readFileSync(fixturePath, "utf-8")));
console.log(`TOTAL DELHI HOTELS: ${hotels.length}`);
console.log("");

const hub = buildDelhiContext(hotels, "");
console.log(
    `${"HUB".padEnd(36)} | count=${String(hub?.count ?? 0).padEnd(3)} req=${String(delhiHub().requiredInventory).padEnd(3)} | ${hub?.indexable ? "INDEXABLE" : "noindex"} | from=${getDelhiFromPrice(hotels) ?? "-"}`
);
let indexable = 0;
for (const page of delhiPages()) {
    const ctx = buildDelhiContext(hotels, page.slug)!;
    const matched = ctx.matched.map((h) => h.name).join("; ").slice(0, 80);
    if (ctx.indexable) indexable++;
    console.log(
        `${page.slug.padEnd(36)} | count=${String(ctx.count).padEnd(3)} req=${String(page.requiredInventory).padEnd(3)} | ${ctx.indexable ? "INDEXABLE" : "noindex"} | from=${ctx.fromPrice ?? "-"} | ${matched}`
    );
}
console.log(`\nINDEXABLE: ${indexable}/${delhiPages().length} pages + hub ${hub?.indexable ? "INDEXABLE" : "noindex"}`);
console.log("");

const checks = [
    "hotels in delhi",
    "hotels near delhi airport",
    "hotels in mahipalpur delhi",
    "hotels near aiims delhi",
    "budget hotels in delhi",
    "5 star hotels in delhi",
];
for (const k of checks) console.log(`KEYWORD "${k}" -> ${resolveDelhiKeywordUrl(k)}`);
console.log("");

const legacy = ["/delhi-hotels", "/hotels-in/delhi/budget", "/hotels-in/delhi/hourly", "/hotels-in-connaught-place-delhi"];
for (const l of legacy) console.log(`LEGACY ${l} -> ${JSON.stringify(resolveDelhiLegacy(l))}`);
