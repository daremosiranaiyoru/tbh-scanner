const fs = require('fs');
let lines = fs.readFileSync('app/page.js', 'utf8').split('\n');

// 1. Add state
const searchOpenIdx = lines.findIndex(l => l.includes('const [searchOpen, setSearchOpen]'));
if (searchOpenIdx !== -1) {
    lines.splice(searchOpenIdx + 1, 0, `  const [howToUseOpen, setHowToUseOpen] = useState(false);`);
}

// 2. Find indices
const startIdx = lines.findIndex(l => l.includes('{/* How to Use Section */}'));
const sectionEndIdx = lines.indexOf('      </section>', startIdx);
const contentStartIdx = startIdx + 10;
let innerLines = lines.slice(contentStartIdx, sectionEndIdx);

// Remove the <h2> from innerLines
const h2Start = innerLines.findIndex(l => l.includes(`<h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>`));
if (h2Start !== -1) {
    innerLines.splice(h2Start, 3);
}

// FIX THE MISSING COMMA inside innerLines
for (let i = 0; i < innerLines.length; i++) {
    if (innerLines[i].includes(`'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này để có độ chính xác tốt nhất!' }`)) {
        if (!innerLines[i].endsWith(',')) {
            // Trim carriage return if exists, append comma, then add back carriage return if it had one
            const hasCR = innerLines[i].endsWith('\r');
            if (hasCR) {
                innerLines[i] = innerLines[i].slice(0, -1) + ',\r';
            } else {
                innerLines[i] = innerLines[i] + ',';
            }
        }
    }
}

// 3. Construct new section
let newSection = `      {/* How to Use Section */}
      <section style={{ 
        marginTop: '20px', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setHowToUseOpen(!howToUseOpen)}
          style={{
            width: '100%', padding: '18px 30px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: 'none',
            borderBottom: howToUseOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
            color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '8px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            📖 {{ 'en-US': 'How to Use', 'ja-JP': '使い方', 'zh-Hans': '使用方法', 'zh-Hant': '使用方法', 'ko-KR': '사용 방법', 'ru-RU': 'Как использовать', 'es-ES': 'Cómo usar', 'fr-FR': 'Comment utiliser', 'de-DE': 'Wie man es benutzt', 'pt-BR': 'Como usar', 'tr-TR': 'Nasıl Kullanılır', 'vi-VN': 'Cách sử dụng' }[selectedLang] || 'How to Use'}
          </span>
          <span style={{ fontSize: '1rem' }}>{howToUseOpen ? '▼' : '◀'}</span>
        </button>
        <div style={{ display: howToUseOpen ? 'block' : 'none', padding: '30px', background: 'rgba(255, 255, 255, 0.03)' }}>
` + innerLines.join('\n') + `
        </div>
      </section>`;

// 4. Splice and replace
lines.splice(startIdx, sectionEndIdx - startIdx + 1, newSection);

fs.writeFileSync('app/page.js', lines.join('\n'));
console.log('Restructured How to Use section and fixed comma!');
