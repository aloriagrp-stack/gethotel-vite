const fs = require('fs');
const path = require('path');

function getDirSize(dirPath) {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    size += getDirSize(filePath);
                }
            } else {
                size += stats.size;
            }
        }
    } catch (e) {}
    return size;
}

const backendDir = 'D:\\shriyansh stock\\travell app project\\GetHotel backend';
const items = fs.readdirSync(backendDir);
const results = [];
for (const item of items) {
    const itemPath = path.join(backendDir, item);
    const stats = fs.statSync(itemPath);
    let size = 0;
    if (stats.isDirectory()) {
        size = getDirSize(itemPath);
    } else {
        size = stats.size;
    }
    results.push({ name: item, sizeMB: (size / (1024 * 1024)).toFixed(2) });
}
results.sort((a, b) => b.sizeMB - a.sizeMB);
console.log(JSON.stringify(results, null, 2));
