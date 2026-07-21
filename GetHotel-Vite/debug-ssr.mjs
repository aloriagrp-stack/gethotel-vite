import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

const App = (await import('./dist/server/entry-server.js')).default
console.log('App:', typeof App)

const helmetContext = {}
const html = renderToString(
  HelmetProvider({ context: helmetContext, children:
    StaticRouter({ location: '/', children: App() })
  })
)

console.log('helmetContext keys:', Object.keys(helmetContext))
if (helmetContext.helmet) {
  console.log('helmet keys:', Object.keys(helmetContext.helmet))
  console.log('title type:', typeof helmetContext.helmet.title)
  console.log('title toString:', helmetContext.helmet.title?.toString())
}
