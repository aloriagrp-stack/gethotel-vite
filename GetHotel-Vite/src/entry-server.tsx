import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AppSSR from './AppSSR'
import { enableCollection, getCollectedHead, resetCollectedHead } from './lib/ssr-head'
import { SITE } from './lib/seo'
import { loadDelhiInventory } from './lib/delhiSeo'
import { languages } from './context/LocaleContext'

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  get length() { return 0 },
  key: () => null,
}

if (typeof globalThis !== 'undefined') {
  if (!('localStorage' in globalThis)) {
    ;(globalThis as any).localStorage = noopStorage
  }
  if (!('sessionStorage' in globalThis)) {
    ;(globalThis as any).sessionStorage = noopStorage
  }
}

function buildHeadTags(collected: any) {
  if (!collected) return ''

  const title = collected.title || 'GetHotelStays.com | Official Site | Book Best Hotel Stays & Deals'
  const desc = collected.description || 'Book hotels across India at unbeatable prices. Luxury, boutique & budget stays. Pay 12% now, rest at hotel. Best price guarantee.'
  const canonical = collected.canonicalUrl || SITE.url
  const keywords = collected.keywords?.length ? collected.keywords.join(', ') : ''

  const tags = [
    `<title>${title.replace(/</g, '&lt;')}</title>`,
    `<meta name="description" content="${desc.replace(/"/g, '&quot;')}" />`,
    keywords ? `<meta name="keywords" content="${keywords}" />` : '',
    `<meta name="robots" content="${collected.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}" />`,
    `<meta property="og:title" content="${title.replace(/</g, '&lt;')}" />`,
    `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="twitter:title" content="${title.replace(/</g, '&lt;')}" />`,
    `<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />`,
  ]

  if (collected.schemas?.length) {
    collected.schemas.forEach((schema: any) => {
      tags.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    })
  }

  return tags.filter(Boolean).join('\n    ')
}

export async function render(url: string) {
  enableCollection()
  resetCollectedHead()

  await loadDelhiInventory()

  const helmetContext: Record<string, any> = {}

  const pathname = url.split('?')[0]
  const segments = pathname.split('/').filter(Boolean)
  const lang = segments.length > 0 && languages.some((l) => l.code === segments[0]) ? segments[0] : ''
  const basename = lang ? `/${lang}` : ''

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={pathname} basename={basename}>
        <AppSSR />
      </StaticRouter>
    </HelmetProvider>
  )

  const collected = getCollectedHead()
  const headTags = buildHeadTags(collected)

  return { html, headTags }
}
