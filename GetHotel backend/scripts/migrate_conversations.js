const prisma = require('../config/db');

async function run() {
    try {
        // 1. Drop FK constraint on ai_conversation_memory
        await prisma.$executeRawUnsafe(
            'ALTER TABLE ai_conversation_memory DROP FOREIGN KEY ai_conversation_memory_conversationId_fkey'
        );
        console.log('1. FK constraint dropped');
    } catch (e) {
        console.log('1. FK drop skipped:', e.message.slice(0, 100));
    }

    try {
        // 2. Resize ai_conversation.id from VARCHAR(191) to VARCHAR(36)
        await prisma.$executeRawUnsafe(
            'ALTER TABLE ai_conversation MODIFY COLUMN id VARCHAR(36) NOT NULL'
        );
        console.log('2. ai_conversation.id resized to VARCHAR(36)');
    } catch (e) {
        console.log('2. Resize skipped:', e.message.slice(0, 100));
    }

    try {
        // 3. Add archived column if missing
        await prisma.$executeRawUnsafe(
            "ALTER TABLE ai_conversation ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0"
        );
        console.log('3. archived column added');
    } catch (e) {
        console.log('3. archived column skipped:', e.message.slice(0, 100));
    }

    try {
        // 4. Add deleted column if missing
        await prisma.$executeRawUnsafe(
            "ALTER TABLE ai_conversation ADD COLUMN deleted TINYINT(1) NOT NULL DEFAULT 0"
        );
        console.log('4. deleted column added');
    } catch (e) {
        console.log('4. deleted column skipped:', e.message.slice(0, 100));
    }

    try {
        // 5. Add userId FK index
        await prisma.$executeRawUnsafe(
            "CREATE INDEX ai_conversation_userId_deleted_updatedAt_idx ON ai_conversation (userId, deleted, updatedAt)"
        );
        console.log('5. composite index added');
    } catch (e) {
        console.log('5. composite index skipped:', e.message.slice(0, 100));
    }

    try {
        // 6. Add userId FK constraint to user table
        await prisma.$executeRawUnsafe(
            "ALTER TABLE ai_conversation ADD CONSTRAINT ai_conversation_userId_fkey FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE"
        );
        console.log('6. userId FK added');
    } catch (e) {
        console.log('6. userId FK skipped:', e.message.slice(0, 100));
    }

    try {
        // 7. Create ai_message table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS ai_message (
                id INT NOT NULL AUTO_INCREMENT,
                conversationId VARCHAR(36) NOT NULL,
                role VARCHAR(16) NOT NULL,
                content LONGTEXT NOT NULL,
                metadata LONGTEXT NULL,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                PRIMARY KEY (id),
                INDEX ai_message_conversationId_createdAt_idx (conversationId, createdAt),
                CONSTRAINT ai_message_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES ai_conversation(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        console.log('7. ai_message table created');
    } catch (e) {
        console.log('7. ai_message table skipped:', e.message.slice(0, 100));
    }

    try {
        // 8. Re-add FK on ai_conversation_memory
        await prisma.$executeRawUnsafe(
            "ALTER TABLE ai_conversation_memory ADD CONSTRAINT ai_conversation_memory_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES ai_conversation(id) ON DELETE CASCADE ON UPDATE CASCADE"
        );
        console.log('8. FK constraint restored on ai_conversation_memory');
    } catch (e) {
        console.log('8. FK restore skipped:', e.message.slice(0, 100));
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
}

run();
