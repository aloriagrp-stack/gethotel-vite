import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://gethotelstays.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // 1. High-Value Core 200 Endpoints (Strictly Canonical, No /en prefix, Clean 200s)
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/hotels`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/packages`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/flights`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/partner`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE_URL}/list-property`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE_URL}/contact-us`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.50 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
    { url: `${BASE_URL}/cancellation-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
    { url: `${BASE_URL}/pricing-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.40 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.30 },
  ];

  // 2. High-Equity Live Destination Landing Pages (Verified 200 Routes)
  const destinationRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/hotels/delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/goa-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/jaipur-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/manali-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/shimla-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/udaipur-hotels`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/couple-friendly-hotels-in-delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
    { url: `${BASE_URL}/hourly-hotels-in-delhi`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.90 },
  ];

  // 3. Dynamic Delhi Area & Landmark Hubs (Inventory-Gated 200 Endpoints)
  const delhiSubAreas = [
    'connaught-place',
    'karol-bagh',
    'south-delhi',
    'near-delhi-airport',
    'near-new-delhi-railway-station',
    'mahipalpur',
    'aerocity',
    'paharganj',
    'chandni-chowk',
    'dwarka',
  ];

  const subAreaRoutes: MetadataRoute.Sitemap = delhiSubAreas.map((slug) => ({
    url: `${BASE_URL}/hotels/delhi/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.80,
  }));

  // 4. Fetch Live Active Hotel Detail URLs from Backend API
  let hotelRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiBase = process.env.GHS_API_URL || 'https://gethotelstays.com/api';
    const res = await fetch(`${apiBase}/hotels?limit=500`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const hotels = json?.data || [];
      hotelRoutes = hotels.map((h: { id: number; slug?: string; updated_at?: string }) => ({
        url: `${BASE_URL}/hotel/${h.id}`,
        lastModified: h.updated_at ? new Date(h.updated_at).toISOString() : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    }
  } catch {
    // Graceful fallback during offline build
  }

  return [...coreRoutes, ...destinationRoutes, ...subAreaRoutes, ...hotelRoutes];
}
