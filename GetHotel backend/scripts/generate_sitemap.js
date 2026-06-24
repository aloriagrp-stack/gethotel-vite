const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function run() {
    try {
        console.log('Generating sitemap with active hotels from database...');
        const hotels = await prisma.hotel.findMany({
            where: { isActive: true },
            select: { id: true, name: true, updatedAt: true }
        });
        
        console.log(`Found ${hotels.length} active hotels in database.`);
        
        // Path to frontend sitemap.xml
        const sitemapPath = path.join(__dirname, '..', '..', 'GetHotel-Vite', 'public', 'sitemap.xml');
        
        if (!fs.existsSync(sitemapPath)) {
            console.error('Error: Frontend sitemap.xml not found at:', sitemapPath);
            process.exit(1);
        }
        
        // Read existing sitemap content
        let originalSitemap = fs.readFileSync(sitemapPath, 'utf8');
        
        const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        const urlsetClose = '</urlset>';
        
        // Extract all non-hotel URLs (static pages & city landing pages) to prevent duplicates
        const urlRegex = /<url>([\s\S]*?)<\/url>/g;
        let match;
        const baseUrls = [];
        
        while ((match = urlRegex.exec(originalSitemap)) !== null) {
            const urlBlock = match[0];
            // Keep only static and city pages (which do not point to /hotel/)
            if (!urlBlock.includes('/hotel/')) {
                // Trim clean layout
                baseUrls.push(urlBlock.trim());
            }
        }
        
        // Append dynamic hotel URLs
        hotels.forEach(h => {
            const slug = slugify(h.name);
            const date = h.updatedAt ? new Date(h.updatedAt).toISOString().split('T')[0] : '2026-06-24';
            baseUrls.push(`  <url>\n    <loc>https://gethotelstays.com/hotel/${slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.90</priority>\n  </url>`);
        });
        
        // Reassemble the sitemap.xml
        const newSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n${urlsetOpen}\n${baseUrls.join('\n')}\n${urlsetClose}\n`;
        
        fs.writeFileSync(sitemapPath, newSitemap, 'utf8');
        console.log(`Successfully appended ${hotels.length} hotel URLs to sitemap.xml!`);
        
    } catch (err) {
        console.error('Sitemap generation failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
