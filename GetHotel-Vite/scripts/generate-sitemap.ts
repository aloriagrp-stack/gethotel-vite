import { CITIES } from "../src/lib/cityData";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://gethotelstays.com";

interface PageEntry {
    url: string;
    priority: string;
    changefreq?: string;
}

const staticPages: PageEntry[] = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/en", priority: "1.0", changefreq: "daily" },
    { url: "/en/hotels-in-delhi", priority: "1.0", changefreq: "daily" },
    { url: "/hotels-in-delhi", priority: "1.0", changefreq: "daily" },
    { url: "/hotels-in-delhi.html", priority: "1.0", changefreq: "daily" },
    { url: "/en/hotels", priority: "0.95", changefreq: "daily" },
    { url: "/en/packages", priority: "0.95", changefreq: "daily" },
    { url: "/en/flights", priority: "0.90", changefreq: "daily" },
    { url: "/en/partner", priority: "0.70", changefreq: "weekly" },
    { url: "/en/list-property", priority: "0.65", changefreq: "weekly" },
    { url: "/en/contact", priority: "0.50", changefreq: "monthly" },
    { url: "/en/privacy", priority: "0.30", changefreq: "monthly" },
    { url: "/en/terms-&-conditions", priority: "0.30", changefreq: "monthly" },
    { url: "/en/cancellation-policy", priority: "0.30", changefreq: "monthly" },
    { url: "/en/pricing-policy", priority: "0.30", changefreq: "monthly" },
    { url: "/en/cookies", priority: "0.30", changefreq: "monthly" },
];

const filters = ["couple-friendly", "hourly", "budget", "luxury"];

const destinationPages: PageEntry[] = [
    { url: "/en/delhi-hotels", priority: "0.95", changefreq: "daily" },
    { url: "/en/hotels-in-delhi", priority: "1.0", changefreq: "daily" },
    { url: "/en/couple-friendly-hotels-in-delhi", priority: "0.90", changefreq: "daily" },
    { url: "/en/hourly-hotels-in-delhi", priority: "0.90", changefreq: "daily" },
    { url: "/en/hotels-near-delhi-airport", priority: "0.90", changefreq: "daily" },
    { url: "/en/hotels-near-new-delhi-railway-station", priority: "0.90", changefreq: "daily" },
    { url: "/en/hotels-in-connaught-place-delhi", priority: "0.90", changefreq: "daily" },
    { url: "/en/hotels-in-karol-bagh-delhi", priority: "0.90", changefreq: "daily" },
    { url: "/en/hotels-in-south-delhi", priority: "0.90", changefreq: "daily" },
    { url: "/en/goa-hotels", priority: "0.85", changefreq: "weekly" },
    { url: "/en/jaipur-hotels", priority: "0.85", changefreq: "weekly" },
    { url: "/en/manali-hotels", priority: "0.85", changefreq: "weekly" },
    { url: "/en/shimla-hotels", priority: "0.85", changefreq: "weekly" },
    { url: "/en/udaipur-hotels", priority: "0.85", changefreq: "weekly" },
    ...CITIES.flatMap(c => [
        { url: `/en/hotels-in/${c.slug}`, priority: "0.80", changefreq: "weekly" },
        ...filters.map(f => ({ url: `/en/hotels-in/${c.slug}/${f}`, priority: "0.75", changefreq: "weekly" }))
    ]),
];

// Delhi SEO ecosystem pages — only indexable ones, as computed live by the backend
const __manifestDir = path.join(process.cwd(), "public");
const manifestPath = path.join(__manifestDir, "delhi-indexable.json");
let delhiIndexablePages: PageEntry[] = [];

if (fs.existsSync(manifestPath)) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        if (Array.isArray(manifest.pages)) {
            delhiIndexablePages = manifest.pages
                .filter((p: any) => p && typeof p.url === "string" && p.priority)
                .map((p: any) => ({
                    url: p.url,
                    priority: String(p.priority),
                    changefreq: p.changefreq || "weekly"
                }));
        }
    } catch (err) {
        console.warn("[sitemap] Could not parse delhi-indexable.json — skipping Delhi pages:", err);
    }
}

const escapeXml = (unsafe: string): string => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/&amp;amp;/g, "&amp;"); // Prevent double-escaping
};

const generateSitemap = (): string => {
    const now = new Date().toISOString().split("T")[0];

    // Deduplicate URLs
    const seen = new Set<string>();
    const allUrls: PageEntry[] = [];

    for (const page of [...staticPages, ...destinationPages, ...delhiIndexablePages]) {
        if (!seen.has(page.url)) {
            seen.add(page.url);
            allUrls.push(page);
        }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of allUrls) {
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}${escapeXml(page.url)}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq || "daily"}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
};

const sitemapXml = generateSitemap();

// Write to public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(outputPath, sitemapXml, "utf-8");

console.log(`✅ Sitemap generated successfully with deduplicated URLs`);
console.log(`📄 Saved to: ${outputPath}`);
