import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

const distDir = path.join(__dirname, '..', 'dist', 'client')

app.use(express.static(distDir, { index: false }))

app.use(async (req, res, next) => {
  if (req.method !== 'GET') return next()
  if (!req.accepts('html')) return next()

  try {
    const template = fs.readFileSync(
      path.join(distDir, 'index.html'),
      'utf-8'
    )

    const { render } = await import('../dist/server/entry-server.js')
    const { html, headTags } = render(req.originalUrl)

    const rendered = template
      .replace('<!--ssr-outlet-->', html)
      .replace('<!--ssr-head-->', headTags)

    res.status(200).set({ 'Content-Type': 'text/html' }).send(rendered)
  } catch (err) {
    console.error('SSR render error:', err)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`GetHotelStays SSR server running on http://localhost:${PORT}`)
})
