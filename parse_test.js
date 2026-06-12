const fs = require('fs');
const html = fs.readFileSync('scrape.html', 'utf8');

// Try raw string search
console.log('HTML length:', html.length);
console.log('Contains buy_order_graph:', html.includes('buy_order_graph'));
console.log('Contains buy_order:', html.includes('buy_order'));
console.log('Contains Market_LoadOrderSpread:', html.includes('Market_LoadOrderSpread'));
console.log('Contains highest_buy_order:', html.includes('highest_buy_order'));
console.log('Contains order_book:', html.includes('order_book'));

// Search for any price-like data
const numArrayMatch = html.match(/\[\d+,\d+,\d+,\d+,\d+/);
if (numArrayMatch) console.log('Num array found:', numArrayMatch[0]);

// Show first 1000 chars
console.log('\nFirst 500 chars:');
console.log(html.slice(0, 500));
