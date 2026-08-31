import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SITE_URL = 'https://gethotelstays.com';

// Supported language codes that should redirect to default canonical root
const REDIRECT_LANGS = new Set([
  'en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt',
  'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'
]);

// 1:1 Clean 301 Target Map (Eradicate intermediate redirects)
const LEGACY_301_MAP: Record<string, string> = {
  '/delhi-hotels': '/hotels/delhi',
  '/hotels-in-delhi': '/hotels/delhi',
  '/hotels-in-connaught-place-delhi': '/hotels/delhi/connaught-place',
  '/hotels-in-karol-bagh-delhi': '/hotels/delhi/karol-bagh',
  '/hotels-in-south-delhi': '/hotels/delhi/south-delhi',
  '/hotels-near-delhi-airport': '/hotels/delhi/near-delhi-airport',
  '/hotels-near-new-delhi-railway-station': '/hotels/delhi/near-new-delhi-railway-station',
  '/contact': '/contact-us',
  '/privacy': '/privacy-policy',
  '/cookies': '/cookie-policy',
  '/terms-&-conditions': '/terms-of-service',
  '/terms': '/terms-of-service',
};

export function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  // 1. Bypass static assets, next internals, api, and files with extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    (!pathname.startsWith('/.controlhub') && /\.[a-zA-Z0-9]+$/.test(pathname))
  ) {
    return NextResponse.next();
  }

  let cleanPath = pathname;

  // 2. Normalize Lowercase URLs
  if (cleanPath !== cleanPath.toLowerCase()) {
    cleanPath = cleanPath.toLowerCase();
  }

  // 3. Handle Language Prefixes (/en/hotels -> /hotels)
  const segments = cleanPath.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && REDIRECT_LANGS.has(firstSegment.toLowerCase())) {
    const remainingSegments = segments.slice(1);
    const targetPath = remainingSegments.length > 0 ? '/' + remainingSegments.join('/') : '/';
    const destination = new URL(targetPath + search, origin);
    return NextResponse.redirect(destination, { status: 301 });
  }

  // 4. Handle Legacy 301 Redirections
  if (LEGACY_301_MAP[cleanPath]) {
    const destination = new URL(LEGACY_301_MAP[cleanPath] + search, origin);
    return NextResponse.redirect(destination, { status: 301 });
  }

  // 5. Execute 301 Redirect if cleanPath differed from original pathname
  if (cleanPath !== pathname) {
    const destination = new URL(cleanPath + search, origin);
    return NextResponse.redirect(destination, { status: 301 });
  }

  // 6. Inject Canonical Link HTTP Header on clean 200 responses
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const response = NextResponse.next();
  response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
  response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
