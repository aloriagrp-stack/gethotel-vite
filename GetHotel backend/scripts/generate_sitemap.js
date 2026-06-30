const prisma = require('../config/db');
const { generateSitemap } = require('../utils/sitemap');

async function run() {
    try {
        await generateSitemap(prisma);
    } catch (err) {
        console.error('CLI sitemap generation failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
