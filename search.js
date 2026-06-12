const fs = require('fs');
const lines = fs.readFileSync('app/page.js', 'utf8').split('\n');
const searchTerms = ['searchWrapperRef', 'アイテムを検索して追加', 'capture-area', 'commentsOpen', 'Manual Search'];
lines.forEach((l, i) => {
  if (searchTerms.some(t => l.includes(t))) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
