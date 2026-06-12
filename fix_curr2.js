const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');
content = content.replace(/'vi-VN': \{ code: 'VND' \}(,?)/g, "'vi-VN': { code: 'VND' },\n  'id-ID': { code: 'IDR' },\n  'th-TH': { code: 'THB' },\n  'pl-PL': { code: 'PLN' },\n  'uk-UA': { code: 'UAH' },");
fs.writeFileSync('app/page.js', content);
console.log('Fixed langToCurrency');
