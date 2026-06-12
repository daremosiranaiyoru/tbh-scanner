const fs = require('fs');
const lines = fs.readFileSync('app/page.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('id="capture-area"'));
for (let i = idx - 2; i < idx + 30; i++) {
  console.log(`${i+1}: ${lines[i].trim()}`);
}
