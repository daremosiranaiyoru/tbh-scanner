const fs = require('fs');

// Read and normalize line endings
let code = fs.readFileSync('app/page.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Add state variable for the collapsible UI
if (!code.includes('const [howToUseOpen, setHowToUseOpen]')) {
  code = code.replace(
    'const [searchOpen, setSearchOpen] = useState(false);',
    'const [searchOpen, setSearchOpen] = useState(false);\n  const [howToUseOpen, setHowToUseOpen] = useState(false);'
  );
}

// 2. Fix the missing comma in the translations object
code = code.replace(
  "'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này để có độ chính xác tốt nhất!' }\n  'id-ID':",
  "'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này để có độ chính xác tốt nhất!' },\n  'id-ID':"
);

// 3. Find and replace the How to Use section exactly
const startMarker = '{/* How to Use Section */}';
const startIdx = code.indexOf(startMarker);

// Find the very next </section> after the startMarker
const endTag = '</section>';
const endIdx = code.indexOf(endTag, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  // Extract everything inside <section ...> and </section>
  const originalSection = code.substring(startIdx, endIdx + endTag.length);
  
  // Find the content inside the inner IIFE
  const iifeStart = originalSection.indexOf('{(() => {');
  const iifeEnd = originalSection.lastIndexOf('})()}');
  
  if (iifeStart !== -1 && iifeEnd !== -1) {
    let innerContent = originalSection.substring(iifeStart, iifeEnd + '})()}'.length);
    
    // Remove the redundant <h2> from innerContent
    innerContent = innerContent.replace(/<h2 style=\{\{ fontSize: '1\.5rem', marginBottom: '16px', color: 'white' \}\}>\s*\{guideTrans\.title\[selectedLang\] \|\| guideTrans\.title\['en-US'\]\}\s*<\/h2>/, '');

    const newSection = `{/* How to Use Section */}
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
          ${innerContent}
        </div>
      </section>`;

    code = code.replace(originalSection, newSection);
  }
}

fs.writeFileSync('app/page.js', code);
console.log('Restructured successfully');
