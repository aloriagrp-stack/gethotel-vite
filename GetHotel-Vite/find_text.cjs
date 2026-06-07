const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'HotelDetailContent.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);

for (let idx = 1800; idx < lines.length; idx++) {
  const line = lines[idx];
  if (line.toLowerCase().includes('stay') || line.toLowerCase().includes('price') || line.toLowerCase().includes('nights')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
}
