import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const BASE_URL = 'https://gethotelstays.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  try {
    const publicSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(publicSitemapPath)) {
      const xml = fs.readFileSync(publicSitemapPath, 'utf8');
      const urlRegex = /<url>([\s\S]*?)<\/url>/g;
      let match;
      const parsedRoutes: MetadataRoute.Sitemap = [];

      while ((match = urlRegex.exec(xml)) !== null) {
        const block = match[1];
        const locMatch = block.match(/<loc>(.*?)<\/loc>/);
        if (!locMatch) continue;

        const loc = locMatch[1].trim();
        const prioMatch = block.match(/<priority>(.*?)<\/priority>/);
        const priority = prioMatch ? parseFloat(prioMatch[1].trim()) : 0.8;
        const freqMatch = block.match(/<changefreq>(.*?)<\/changefreq>/);
        const changeFrequency = (freqMatch ? freqMatch[1].trim() : 'weekly') as any;

        parsedRoutes.push({
          url: loc,
          lastModified: currentDate,
          changeFrequency,
          priority,
        });
      }

      if (parsedRoutes.length > 0) {
        return parsedRoutes;
      }
    }
  } catch (err) {
    console.warn('[sitemap.ts] Fallback due to read error:', err);
  }

  // Fallback core routes if file read fails
  return [
    { url: `${BASE_URL}`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/hotels`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/hotels/delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/packages`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/flights`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/partner`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE_URL}/list-property`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE_URL}/delhi-hotels`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/goa-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/jaipur-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/manali-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/shimla-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/udaipur-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/couple-friendly-hotels-in-delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/hourly-hotels-in-delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/contact-us`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.50 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
  ];
}
