import { CITIES } from "../src/lib/cityData";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://gethotelstays.com";

const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/hotels", priority: "0.9", changefreq: "daily" },
    { url: "/partner", priority: "0.7", changefreq: "weekly" },
    { url: "/list-property", priority: "0.6", changefreq: "weekly" },
    { url: "/contact", priority: "0.5", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "monthly" },
    { url: "/terms-&-conditions", priority: "0.3", changefreq: "monthly" },
    { url: "/cancellation-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/pricing-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/cookies", priority: "0.3", changefreq: "monthly" },
];

const filters = ["couple-friendly", "hourly", "budget", "luxury"];

const destinationPages = [
    { url: "/goa-hotels", priority: "0.85" },
    { url: "/jaipur-hotels", priority: "0.85" },
    { url: "/manali-hotels", priority: "0.85" },
    { url: "/shimla-hotels", priority: "0.85" },
    { url: "/udaipur-hotels", priority: "0.85" },
    { url: "/delhi-hotels", priority: "0.95" },
    { url: "/couple-friendly-hotels-in-delhi", priority: "0.90" },
    { url: "/hourly-hotels-in-delhi", priority: "0.90" },
    { url: "/hotels-near-delhi-airport", priority: "0.90" },
    { url: "/hotels-near-new-delhi-railway-station", priority: "0.90" },
    { url: "/hotels-in-connaught-place-delhi", priority: "0.90" },
    { url: "/hotels-in-karol-bagh-delhi", priority: "0.90" },
    { url: "/hotels-in-south-delhi", priority: "0.90" },
    ...CITIES.flatMap(c => [
        { url: `/hotels-in/${c.slug}`, priority: "0.80" },
        ...filters.map(f => ({ url: `/hotels-in/${c.slug}/${f}`, priority: "0.75" }))
    ]),
];

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

    xml += `</urlset>`;
    return xml;
};

const sitemapXml = generateSitemap();

// Write to public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(outputPath, sitemapXml, "utf-8");

console.log(`✅ Sitemap generated with ${staticPages.length + destinationPages.length} URLs`);
console.log(`📄 Saved to: ${outputPath}`);
