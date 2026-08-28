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

const DEFAULT_PRICE = 1;

function loadDelhiConfig() {
    try {
        const nextCfg = path.join(__dirname, '..', '..', 'gethotel-next', 'src', 'data', 'delhiSeoConfig.json');
        const viteCfg = path.join(__dirname, '..', '..', 'old stack', 'GetHotel-Vite', 'src', 'data', 'delhiSeoConfig.json');
        const cfgPath = fs.existsSync(nextCfg) ? nextCfg : viteCfg;
        return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    } catch (err) {
        console.warn('[sitemap] delhiSeoConfig.json not found — skipping Delhi SEO pages:', err.message);
        return null;
    }
}

function effectivePrice(hotel) {
    if (typeof hotel.pricePerNight === 'number' && hotel.pricePerNight > DEFAULT_PRICE) return hotel.pricePerNight;
    if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0) {
        let min = null;
        for (const room of hotel.rooms) {
            if (typeof room?.pricePerNight === 'number' && room.pricePerNight > DEFAULT_PRICE) {
                min = min === null ? room.pricePerNight : Math.min(min, room.pricePerNight);
            }
        }
        if (min !== null) return min;
    }
    return null;
}

function maxOccupancy(hotel) {
    if (!Array.isArray(hotel.rooms) || hotel.rooms.length === 0) return null;
    let max = null;
    for (const room of hotel.rooms) {
        if (typeof room?.maxOccupancy === 'number') max = max === null ? room.maxOccupancy : Math.max(max, room.maxOccupancy);
    }
    return max;
}

function parseList(value) {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(' ').toLowerCase();
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.join(' ').toLowerCase() : String(parsed).toLowerCase();
        } catch (e) {
            return value.toLowerCase();
        }
    }
    return String(value).toLowerCase();
}

function amenityText(hotel) {
    const dining = typeof hotel.dining === 'string' ? hotel.dining.toLowerCase() : '';
    return [parseList(hotel.amenities), parseList(hotel.mainAmenities), dining].join(' ');
}

function matchesDelhiPage(hotel, page) {
    if (page.type === 'hub') return true;
    if (page.categoryMatch) {
        const cm = page.categoryMatch;
        if (cm.priceMax !== undefined) {
            const p = effectivePrice(hotel);
            if (p === null || p > cm.priceMax) return false;
        }
        if (cm.starMin !== undefined) {
            if (typeof hotel.starRating !== 'number' || hotel.starRating < cm.starMin) return false;
        }
        if (cm.roomOccupancyMin !== undefined) {
            const o = maxOccupancy(hotel);
            if (o === null || o < cm.roomOccupancyMin) return false;
        }
        if (Array.isArray(cm.amenityKeywords) && cm.amenityKeywords.length > 0) {
            const text = amenityText(hotel);
            if (!cm.amenityKeywords.some((k) => text.includes(String(k).toLowerCase()))) return false;
        }
        return true;
    }
    const patterns = Array.isArray(page.matchPatterns) ? page.matchPatterns : [];
    if (patterns.length === 0) return true;
    const text = `${hotel.city || ''} ${hotel.address || ''}`.toLowerCase();
    return patterns.some((p) => text.includes(String(p).toLowerCase()));
}

async function generateSitemap(prisma) {
    try {
        if (!prisma) {
            const { PrismaClient } = require('@prisma/client');
            prisma = new PrismaClient();
        }
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
            path.join(__dirname, '..', '..', 'gethotel-next', 'public', 'sitemap.xml'),
            path.join(__dirname, '..', '..', 'old stack', 'GetHotel-Vite', 'public', 'sitemap.xml')
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
            sitemapPath = path.join(__dirname, '..', '..', 'gethotel-next', 'public', 'sitemap.xml');
            
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

        // Delhi SEO ecosystem pages — inventory-gated indexability (live DB)
        const delhiConfig = loadDelhiConfig();
        if (delhiConfig && delhiConfig.hub && Array.isArray(delhiConfig.pages)) {
            const delhiHotels = await prisma.hotel.findMany({
                where: { isActive: true, city: { contains: 'Delhi' } },
                select: {
                    id: true, name: true, city: true, address: true,
                    pricePerNight: true, starRating: true,
                    amenities: true, mainAmenities: true, dining: true,
                    room: { select: { pricePerNight: true, maxOccupancy: true } }
                }
            });

            const today = new Date().toISOString().split('T')[0];
            const delhiEntries = [];
            const allPages = [{ ...delhiConfig.hub, slug: '' }, ...delhiConfig.pages];

            for (const page of allPages) {
                const count = page.slug === ''
                    ? delhiHotels.length
                    : delhiHotels.filter((h) => matchesDelhiPage(h, page)).length;
                const required = Number(page.requiredInventory) || 0;
                if (required <= 0 || count >= required) {
                    const urlPath = page.slug ? `/en/hotels/delhi/${page.slug}` : '/en/hotels/delhi';
                    const priority = page.slug
                        ? String(page.priority === 1 ? 0.9 : page.priority === 2 ? 0.8 : 0.7)
                        : String(delhiConfig.hub.sitemapPriority || '0.95');
                    delhiEntries.push({ url: `https://gethotelstays.com${urlPath}`, urlPath, priority, lastmod: today });
                }
            }

            if (delhiEntries.length > 0) {
                const existingSitemapText = baseUrls.join('\n');
                for (const entry of delhiEntries) {
                    if (!existingSitemapText.includes(entry.url)) {
                        baseUrls.push(`  <url>\n    <loc>${entry.url}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`);
                    }
                }

                const manifest = {
                    generated: today,
                    totalHotels: delhiHotels.length,
                    pages: delhiEntries.map((e) => ({ url: e.urlPath, priority: e.priority }))
                };
                const manifestPaths = [
                    path.join(path.dirname(sitemapPath), 'delhi-indexable.json'),
                    path.join(__dirname, '..', '..', 'GetHotel-Vite', 'public', 'delhi-indexable.json')
                ];
                for (const mp of manifestPaths) {
                    try {
                        fs.writeFileSync(mp, JSON.stringify(manifest, null, 2), 'utf8');
                        console.log(`[sitemap] Delhi SEO manifest written: ${mp}`);
                    } catch (e) {
                        console.warn(`[sitemap] Could not write manifest to ${mp}:`, e.message);
                    }
                }
                console.log(`[sitemap] Added ${delhiEntries.length} inventory-gated Delhi SEO page URLs (of ${allPages.length} configured).`);
            }
        }
        
        // Reassemble the sitemap.xml
        const newSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n${urlsetOpen}\n${baseUrls.join('\n')}\n${urlsetClose}\n`;
        
        fs.writeFileSync(sitemapPath, newSitemap, 'utf8');
        console.log(`[sitemap] Successfully updated sitemap.xml with ${hotels.length} hotel URLs!`);
    } catch (err) {
        console.error('[sitemap] Failed to update sitemap:', err);
    }
}

module.exports = { generateSitemap };
