import { Metadata } from 'next';

const BASE_URL = 'https://gethotelstays.com';

/**
 * Builds clean, query-free, self-referencing canonical metadata.
 * Strips UTM parameters, sort filters, pagination, and session query strings.
 */
export function buildCanonicalMetadata({
  path,
  title,
  description,
  keywords,
  ogImage,
}: {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'en-US': canonicalUrl,
        'en-GB': canonicalUrl,
        'en-AE': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
  };
}
