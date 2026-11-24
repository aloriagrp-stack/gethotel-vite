/**
 * GHS News Management Controller
 * Handles article creation, listing, updating, deletion, and instant static HTML generation
 * for news.gethotelstays.com directly from the Super Admin dashboard.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Auto-detect production vs local news directory
function getNewsDirectory() {
    const candidatePaths = [
        // Live production cPanel server paths
        '/home/vgyuvmpi/news.gethotelstays.com',
        '/home/vgyuvmpi/blogs.gethotelstays.com',
        path.resolve(__dirname, '../../news.gethotelstays.com'),
        path.resolve(__dirname, '../../blogs.gethotelstays.com'),
        path.resolve(__dirname, '../news.gethotelstays.com'),
        path.resolve(__dirname, '../blogs.gethotelstays.com'),
    ];

    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
                return p;
            }
        } catch (e) {}
    }

    // Default fallback to sibling directory
    return path.resolve(__dirname, '../../blogs.gethotelstays.com');
}

// Ensure database table exists
let tableInitialized = false;
async function ensureNewsTable() {
    if (tableInitialized) return;
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS news_article (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                category VARCHAR(100) NOT NULL,
                author VARCHAR(100) DEFAULT 'GHS Editorial Desk',
                excerpt TEXT,
                content LONGTEXT NOT NULL,
                image VARCHAR(500) DEFAULT 'assets/resort.webp',
                is_published TINYINT(1) DEFAULT 1,
                views INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        tableInitialized = true;
    } catch (err) {
        console.warn('Note on news_article table check:', err.message);
    }
}

// Helper to generate a clean URL slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Generate static HTML page matching the BBC Broadsheet template
function renderArticleHtml(article) {
    const formattedDate = new Date(article.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Format content paragraphs
    const paragraphs = (article.content || '')
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
            if (p.startsWith('### ') || p.startsWith('## ')) {
                return `<h3 class="article-subheading" style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #0f172a; margin: 32px 0 16px 0;">${p.replace(/^#+\s*/, '')}</h3>`;
            }
            return `<p style="font-size: 16.5px; line-height: 1.8; color: #1e293b; margin-bottom: 22px;">${p}</p>`;
        })
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | GHS NEWS</title>
    <meta name="description" content="${(article.excerpt || article.title).replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${article.category}, GetHotelStays News, Travel Industry, Hotel Intelligence">
    <link rel="canonical" href="https://news.gethotelstays.com/${article.slug}.html">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="GHS NEWS">
    <meta property="og:title" content="${article.title.replace(/"/g, '&quot;')}">
    <meta property="og:description" content="${(article.excerpt || article.title).replace(/"/g, '&quot;')}">
    <meta property="og:url" content="https://news.gethotelstays.com/${article.slug}.html">
    <meta property="og:image" content="https://news.gethotelstays.com/${article.image || 'assets/resort.webp'}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title.replace(/"/g, '&quot;')}">
    <meta name="twitter:description" content="${(article.excerpt || article.title).replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="https://news.gethotelstays.com/${article.image || 'assets/resort.webp'}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=7.0">

    <!-- AI & LLM Crawlability Protocols -->
    <link rel="alternate" type="text/markdown" href="https://news.gethotelstays.com/llms.txt" title="LLM Context Protocol">
    <link rel="alternate" type="text/markdown" href="https://news.gethotelstays.com/llms-full.txt" title="LLM Full Ingest Index">
    <meta name="citation_publisher" content="GHS News">
    <meta name="ai-content-declaration" content="human-authored editorial research">

    <!-- Structured Data (NewsArticle Schema) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": ${JSON.stringify(article.title)},
      "image": ["https://news.gethotelstays.com/${article.image || 'assets/resort.webp'}"],
      "datePublished": "${new Date(article.created_at || Date.now()).toISOString()}",
      "dateModified": "${new Date(article.updated_at || Date.now()).toISOString()}",
      "author": [{
        "@type": "Organization",
        "name": ${JSON.stringify(article.author || 'GHS Editorial Desk')},
        "url": "https://news.gethotelstays.com/"
      }],
      "publisher": {
        "@type": "Organization",
        "name": "GHS NEWS",
        "logo": {
          "@type": "ImageObject",
          "url": "https://news.gethotelstays.com/assets/logo.png"
        }
      },
      "description": ${JSON.stringify(article.excerpt || article.title)},
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://news.gethotelstays.com/${article.slug}.html"
      }
    }
    </script>
</head>
<body class="bbc-theme">
    <!-- Top News Header -->
    <header class="bbc-masthead">
        <div class="masthead-inner">
            <a href="/" class="bbc-brand-lockup" style="text-decoration: none;">
                <div class="ghs-brand-logo">
                    <span class="ghs-logo-main">GHS<span class="brand-dot">.</span></span>
                    <span class="ghs-logo-badge">NEWS</span>
                </div>
            </a>
            <div class="masthead-right">
                <a href="https://gethotelstays.com" target="_blank" rel="noopener" class="ghs-portal-pill">BOOK STAYS &nearr;</a>
            </div>
        </div>
    </header>

    <!-- Main Article Body -->
    <main class="bbc-main-container" style="max-width: 860px; margin: 40px auto; padding: 0 20px;">
        <article class="bbc-article-card" style="background: transparent; border: none;">
            <div class="article-meta-header" style="margin-bottom: 24px;">
                <span class="editorial-kicker" style="color: #2563eb; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;">${article.category}</span>
                <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 34px; font-weight: 800; line-height: 1.25; color: #0f172a; margin: 12px 0 16px 0; letter-spacing: -0.5px;">${article.title}</h1>
                <div style="font-size: 13px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                    <span>By <strong>${article.author || 'GHS Editorial Desk'}</strong></span>
                    <span>&bull;</span>
                    <time datetime="${new Date(article.created_at || Date.now()).toISOString()}">${formattedDate}</time>
                </div>
            </div>

            ${article.image ? `
            <div style="margin: 28px 0; border-radius: 8px; overflow: hidden;">
                <img src="${article.image}" alt="${article.title.replace(/"/g, '&quot;')}" style="width: 100%; height: auto; display: block; border-radius: 8px;">
            </div>` : ''}

            <div class="article-body-content" style="font-family: 'Inter', -apple-system, sans-serif;">
                ${paragraphs}
            </div>
        </article>
    </main>

    <!-- CLEAN EDITORIAL FOOTER (WHITE THEME) -->
    <footer class="bbc-footer" style="background-color: #ffffff !important; color: #475569 !important; border-top: 1px solid #e2e8f0; padding: 40px 20px 28px 20px; font-size: 13px; margin-top: 48px;">
        <div class="footer-inner" style="max-width: 1320px; margin: 0 auto;">
            <div class="footer-brand-line" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px;">
                <div class="ghs-brand-logo" style="display: flex; align-items: center; gap: 8px;">
                    <span class="ghs-logo-main" style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #000000;">GHS<span class="brand-dot" style="color: #2563eb;">.</span></span>
                    <span class="ghs-logo-badge" style="background: #000000; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 6px; letter-spacing: 1px;">NEWS</span>
                </div>
                <div class="footer-tagline" style="font-size: 13px; color: #64748b; font-weight: 500;">
                    Official Travel News &amp; Accommodation Intelligence Channel of <a href="https://gethotelstays.com" target="_blank" rel="noopener" style="color: #2563eb; font-weight: 600; text-decoration: underline;">GetHotelStays.com</a>
                </div>
            </div>

            <div class="footer-nav-simple" style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px;">
                <a href="/" style="color: #0f172a; font-weight: 600; text-decoration: none;">Home</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://gethotelstays.com" target="_blank" rel="noopener" style="color: #2563eb; font-weight: 600; text-decoration: none;">Book Stays (GetHotelStays.com) &rarr;</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://gethotelstays.com/about-us" target="_blank" rel="noopener" style="color: #475569; text-decoration: none;">About Us</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://gethotelstays.com/privacy-policy" target="_blank" rel="noopener" style="color: #475569; text-decoration: none;">Privacy Policy</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://gethotelstays.com/terms" target="_blank" rel="noopener" style="color: #475569; text-decoration: none;">Terms of Service</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://gethotelstays.com/contact-us" target="_blank" rel="noopener" style="color: #475569; text-decoration: none;">Contact Us</a>
            </div>

            <div class="footer-copyright" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 12px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0;">&copy; 2026 <strong style="color: #0f172a;">GHS NEWS</strong>. All rights reserved. A venture under <strong style="color: #0f172a;">Aloria Group</strong>, operating as the official news channel of <a href="https://gethotelstays.com" target="_blank" rel="noopener" style="color: #2563eb; font-weight: 600;">GetHotelStays.com</a>.</p>
                <p class="footer-credits" style="margin: 0;">Made &amp; Developed by <a href="https://alorialabs.in" target="_blank" rel="noopener" style="color: #2563eb; font-weight: 700; text-decoration: underline;">alorialabs.in</a></p>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

// Write the static file to news directory and update sitemap
function syncArticleToFile(article) {
    try {
        const newsDir = getNewsDirectory();
        if (!fs.existsSync(newsDir)) {
            console.warn('News directory not found, skipping file write:', newsDir);
            return false;
        }

        // 1. Write HTML file
        const htmlPath = path.join(newsDir, `${article.slug}.html`);
        const renderedHtml = renderArticleHtml(article);
        fs.writeFileSync(htmlPath, renderedHtml, 'utf8');

        // 2. Update sitemap.xml if URL not present
        const sitemapPath = path.join(newsDir, 'sitemap.xml');
        if (fs.existsSync(sitemapPath)) {
            let sitemap = fs.readFileSync(sitemapPath, 'utf8');
            const targetUrl = `https://news.gethotelstays.com/${article.slug}.html`;
            if (!sitemap.includes(targetUrl)) {
                const newEntry = `  <url>\n    <loc>${targetUrl}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.80</priority>\n  </url>\n</urlset>`;
                sitemap = sitemap.replace('</urlset>', newEntry);
                fs.writeFileSync(sitemapPath, sitemap, 'utf8');
            }
        }

        // 3. Update llms.txt if not present
        const llmsPath = path.join(newsDir, 'llms.txt');
        if (fs.existsSync(llmsPath)) {
            let llms = fs.readFileSync(llmsPath, 'utf8');
            const targetUrl = `https://news.gethotelstays.com/${article.slug}.html`;
            if (!llms.includes(targetUrl)) {
                llms += `\n### [${article.title}](${targetUrl})\n- **Category:** ${article.category}\n- **Summary:** ${article.excerpt || article.title}\n`;
                fs.writeFileSync(llmsPath, llms, 'utf8');
            }
        }

        return true;
    } catch (e) {
        console.error('Error in syncArticleToFile:', e);
        return false;
    }
}

// Controller Methods

exports.getArticles = async (req, res) => {
    try {
        await ensureNewsTable();
        const articles = await prisma.$queryRawUnsafe(`
            SELECT * FROM news_article ORDER BY created_at DESC
        `);
        return res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (err) {
        console.error('getArticles error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch articles', error: err.message });
    }
};

exports.createArticle = async (req, res) => {
    try {
        await ensureNewsTable();
        const { title, category, content, excerpt, author, image } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
        }

        const slug = slugify(title);
        const articleAuthor = author || 'GHS Editorial Desk';
        const articleImage = image || 'assets/resort.webp';
        const articleExcerpt = excerpt || content.substring(0, 160).replace(/\n/g, ' ') + '...';

        // Check slug collision
        const existing = await prisma.$queryRawUnsafe(`
            SELECT id FROM news_article WHERE slug = ?
        `, slug);

        let finalSlug = slug;
        if (existing && existing.length > 0) {
            finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        await prisma.$queryRawUnsafe(`
            INSERT INTO news_article (title, slug, category, author, excerpt, content, image, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, title, finalSlug, category, articleAuthor, articleExcerpt, content, articleImage);

        const createdRows = await prisma.$queryRawUnsafe(`
            SELECT * FROM news_article WHERE slug = ?
        `, finalSlug);

        const newArticle = createdRows[0];

        // Instant static HTML sync
        const fileWritten = syncArticleToFile(newArticle);

        return res.status(201).json({
            success: true,
            message: 'News article published successfully!',
            liveUrl: `https://news.gethotelstays.com/${finalSlug}.html`,
            fileGenerated: fileWritten,
            data: newArticle
        });
    } catch (err) {
        console.error('createArticle error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create article', error: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        await ensureNewsTable();
        const id = parseInt(req.params.id);
        const { title, category, content, excerpt, author, image, is_published } = req.body;

        const existing = await prisma.$queryRawUnsafe(`
            SELECT * FROM news_article WHERE id = ?
        `, id);

        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        const updatedTitle = title || existing[0].title;
        const updatedCategory = category || existing[0].category;
        const updatedContent = content || existing[0].content;
        const updatedExcerpt = excerpt || existing[0].excerpt;
        const updatedAuthor = author || existing[0].author;
        const updatedImage = image || existing[0].image;
        const updatedPublished = is_published !== undefined ? (is_published ? 1 : 0) : existing[0].is_published;

        await prisma.$queryRawUnsafe(`
            UPDATE news_article 
            SET title = ?, category = ?, content = ?, excerpt = ?, author = ?, image = ?, is_published = ?
            WHERE id = ?
        `, updatedTitle, updatedCategory, updatedContent, updatedExcerpt, updatedAuthor, updatedImage, updatedPublished, id);

        const refreshed = await prisma.$queryRawUnsafe(`
            SELECT * FROM news_article WHERE id = ?
        `, id);

        // Regenerate static HTML
        syncArticleToFile(refreshed[0]);

        return res.status(200).json({
            success: true,
            message: 'Article updated & static files synchronized!',
            liveUrl: `https://news.gethotelstays.com/${refreshed[0].slug}.html`,
            data: refreshed[0]
        });
    } catch (err) {
        console.error('updateArticle error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update article', error: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        await ensureNewsTable();
        const id = parseInt(req.params.id);

        const existing = await prisma.$queryRawUnsafe(`
            SELECT * FROM news_article WHERE id = ?
        `, id);

        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        const slug = existing[0].slug;

        await prisma.$queryRawUnsafe(`
            DELETE FROM news_article WHERE id = ?
        `, id);

        // Delete physical HTML file if exists
        try {
            const newsDir = getNewsDirectory();
            const filePath = path.join(newsDir, `${slug}.html`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.warn('Failed to delete physical html file:', e.message);
        }

        return res.status(200).json({ success: true, message: 'Article deleted successfully' });
    } catch (err) {
        console.error('deleteArticle error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete article', error: err.message });
    }
};
