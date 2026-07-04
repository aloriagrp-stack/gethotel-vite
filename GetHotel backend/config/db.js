const path = require('path');
const { execSync } = require('child_process');

const fs = require('fs');
const rootDir = path.join(__dirname, '..');
const generatedClientPath = path.join(rootDir, 'node_modules', '.prisma', 'client', 'index.js');

if (!fs.existsSync(generatedClientPath)) {
    try {
        const { execSync } = require('child_process');
        const prismaCliPath = path.join(rootDir, 'node_modules', 'prisma', 'build', 'index.js');
        const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
        console.log('[db.js] Generated Prisma Client not found. Running prisma generate...');
        const cmd = `"${process.execPath}" "${prismaCliPath}" generate --schema="${schemaPath}"`;
        execSync(cmd, {
            cwd: rootDir,
            stdio: 'inherit',
            timeout: 120000,
            env: {
                ...process.env,
                PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true',
            }
        });
        console.log('[db.js] Prisma Client generated successfully!');
    } catch (err) {
        console.error('[db.js] Warning: prisma generate failed:', err.message);
    }
} else {
    console.log('[db.js] Prisma Client already exists. Skipping generation.');
}

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL;
console.log('[db.js] DB host:', DATABASE_URL ? DATABASE_URL.split('@')[1] : 'NOT SET');

const prismaRaw = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
    log: ['error', 'warn'],
});

// Auto-regenerate sitemap on hotel additions, updates, deletions, or status toggling
const { generateSitemap } = require('../utils/sitemap');

const prisma = prismaRaw.$extends({
    query: {
        hotel: {
            async $allOperations({ model, operation, args, query }) {
                const result = await query(args);
                
                const mutations = ['create', 'createMany', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany'];
                if (mutations.includes(operation)) {
                    if (process.env.NODE_ENV === 'production') {
                        console.log(`[db.js] Prisma detected mutations on Hotel model (${operation}). Triggering sitemap auto-generation...`);
                        generateSitemap(prismaRaw).catch(err => console.error('[db.js] Auto-sitemap generation failed:', err));
                    } else {
                        console.log(`[db.js] Prisma detected mutations on Hotel model (${operation}). Skipping auto-sitemap generation in development to prevent Vite reloads.`);
                    }
                }
                
                return result;
            }
        }
    }
});

module.exports = prisma;
