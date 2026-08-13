import { CITIES } from "../src/lib/cityData";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://gethotelstays.com";

const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/en", priority: "1.0", changefreq: "daily" },
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

const destinationPages = [
    { url: "/en/goa-hotels", priority: "0.85" },
    { url: "/en/jaipur-hotels", priority: "0.85" },
    { url: "/en/manali-hotels", priority: "0.85" },
    { url: "/en/shimla-hotels", priority: "0.85" },
    { url: "/en/udaipur-hotels", priority: "0.85" },
    { url: "/en/delhi-hotels", priority: "0.95" },
    { url: "/en/couple-friendly-hotels-in-delhi", priority: "0.90" },
    { url: "/en/hourly-hotels-in-delhi", priority: "0.90" },
    { url: "/en/hotels-near-delhi-airport", priority: "0.90" },
    { url: "/en/hotels-near-new-delhi-railway-station", priority: "0.90" },
    { url: "/en/hotels-in-connaught-place-delhi", priority: "0.90" },
    { url: "/en/hotels-in-karol-bagh-delhi", priority: "0.90" },
    { url: "/en/hotels-in-south-delhi", priority: "0.90" },
    ...CITIES.flatMap(c => [
        { url: `/en/hotels-in/${c.slug}`, priority: "0.80" },
        ...filters.map(f => ({ url: `/en/hotels-in/${c.slug}/${f}`, priority: "0.75" }))
    ]),
];

// Delhi SEO ecosystem pages — only indexable ones, as computed live by the
// backend sitemap job (utils/sitemap.js) and persisted to public/delhi-indexable.json.
const __manifestDir = path.join(process.cwd(), "public");
const manifestPath = path.join(__manifestDir, "delhi-indexable.json");
let delhiIndexablePages: { url: string; priority: string }[] = [];
if (fs.existsSync(manifestPath)) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        if (Array.isArray(manifest.pages)) {
            delhiIndexablePages = manifest.pages.filter((p: any) => p?.url && p?.priority);
        }
    } catch (err) {
        console.warn("[sitemap] Could not parse delhi-indexable.json — skipping Delhi pages:", err);
    }
} else {
    console.warn("[sitemap] delhi-indexable.json not found — Delhi /hotels/delhi/ pages will be added once the backend sitemap job runs.");
}

const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const generateSitemap = () => {
    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}${escapeXml(page.url)}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    for (const page of destinationPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}${escapeXml(page.url)}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    for (const page of delhiIndexablePages) {
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}${escapeXml(page.url)}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
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

console.log(`✅ Sitemap generated with ${staticPages.length + destinationPages.length + delhiIndexablePages.length} URLs`);
console.log(`📄 Saved to: ${outputPath}`);
