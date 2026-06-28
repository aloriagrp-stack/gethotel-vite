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

const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
    log: ['error', 'warn'],
});

module.exports = prisma;
