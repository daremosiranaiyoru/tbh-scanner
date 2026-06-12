const fs = require('fs');
let code = fs.readFileSync('app/page.js', 'utf8');

// Fix missing comma
code = code.replace(/example:\s*\{([^}]+)\}\s*'id-ID':/g, "example: {$1},\n  'id-ID':");

fs.writeFileSync('app/page.js', code);
console.log('Fixed comma');
