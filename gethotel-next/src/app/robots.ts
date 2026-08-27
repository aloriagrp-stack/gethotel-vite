import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/partner-dashboard/',
          '/api/',
          '/booking/',
          '/bookings/',
          '/login',
          '/register',
          '/profile',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
          'PerplexityBot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://gethotelstays.com/sitemap.xml',
  };
}
