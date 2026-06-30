const fs = require('fs');
const path = require('path');

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

async function generateSitemap(prisma) {
    try {
        console.log('[sitemap] Fetching active hotels from database...');
        const hotels = await prisma.hotel.findMany({
            where: { isActive: true },
            select: { id: true, name: true, updatedAt: true }
        });
        
        console.log(`[sitemap] Found ${hotels.length} active hotels in database.`);
        
        // Dynamic search for sitemap.xml path
        const searchPaths = [
            path.join(__dirname, '..', '..', 'public_html', 'sitemap.xml'),
            '/home/vgyuvmpi/public_html/sitemap.xml',
            path.join(__dirname, '..', '..', 'GetHotel-Vite', 'public', 'sitemap.xml')
        ];
        
        let sitemapPath = '';
        for (const p of searchPaths) {
            if (fs.existsSync(p)) {
                sitemapPath = p;
                break;
            }
        }
        
        if (!sitemapPath) {
            console.warn('[sitemap] Warning: sitemap.xml template not found in search paths. Using local fallback.');
            sitemapPath = path.join(__dirname, '..', '..', 'GetHotel-Vite', 'public', 'sitemap.xml');
            
            // If even local directory doesn't exist, create directory recursively
            const dir = path.dirname(sitemapPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Create a basic sitemap if it completely doesn't exist
            if (!fs.existsSync(sitemapPath)) {
                const initialXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
                fs.writeFileSync(sitemapPath, initialXml, 'utf8');
            }
        }
        
        console.log(`[sitemap] Updating sitemap at: ${sitemapPath}`);
        
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
        console.log(`[sitemap] Successfully updated sitemap.xml with ${hotels.length} hotel URLs!`);
    } catch (err) {
        console.error('[sitemap] Failed to update sitemap:', err);
    }
}

module.exports = { generateSitemap };
