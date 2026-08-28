import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = [
  'en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt',
  'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, api routes, and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    (!pathname.startsWith('/.controlhub') && /\.[a-zA-Z0-9]+$/.test(pathname))
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // If the first segment is a supported language code
  if (firstSegment && SUPPORTED_LANGS.includes(firstSegment.toLowerCase())) {
    const targetPath = '/' + segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = targetPath || '/';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
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
