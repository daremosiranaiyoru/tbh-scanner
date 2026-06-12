const fs = require('fs');
let lines = fs.readFileSync('app/page.js', 'utf8').split('\n');

// 1. Add the state
const commentsOpenIdx = lines.findIndex(l => l.includes('const [commentsOpen, setCommentsOpen]'));
if (commentsOpenIdx !== -1) {
    lines.splice(commentsOpenIdx + 1, 0, `  const [searchOpen, setSearchOpen] = useState(false);`);
}

// Re-find indices because we inserted a line
const manualSearchStartIdx = lines.findIndex(l => l.includes('{/* Manual Search Section */}'));
const anonymousCommentsIdx = lines.findIndex(l => l.includes('{/* Anonymous Comments Section */}'));
const captureAreaIdx = lines.findIndex(l => l.includes('<main id="capture-area"'));

if (manualSearchStartIdx !== -1 && anonymousCommentsIdx !== -1 && captureAreaIdx !== -1) {
    // 2. Extract the Manual Search Section (ends right before Anonymous Comments Section)
    const endIdx = anonymousCommentsIdx - 1; // The blank line before the comment section
    let manualSearchLines = lines.splice(manualSearchStartIdx, endIdx - manualSearchStartIdx);
    
    // 3. Modify the Manual Search section to be collapsible
    // manualSearchLines[1] is `<section style={{`
    // Find the title `searchTrans` and move it outside the collapsible div if needed, or just use the same pattern as comments
    // Actually, `searchTrans` is defined inside an IIFE `(() => { ... })()`. It's better to just put the header inside the section but before the content.
    // Replace `<section style={{ ... }}>` with `<section style={{ marginBottom: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>`
    
    let newManualSearch = `      {/* Manual Search Section */}
      <section style={{ 
        marginBottom: '20px', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          style={{
            width: '100%', padding: '18px 30px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: 'none',
            borderBottom: searchOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
            color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '8px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔍 {selectedLang === 'ja-JP' ? 'アイテムを検索して追加' : (selectedLang === 'en-US' ? 'Search & Add Items' : 'Search & Add Items')}
          </span>
          <span style={{ fontSize: '1rem' }}>{searchOpen ? '▼' : '◀'}</span>
        </button>
        <div style={{ display: searchOpen ? 'block' : 'none', padding: '30px', background: 'rgba(255, 255, 255, 0.03)' }}>`;

    // Extract the body from the original section
    // skip the `<section style={{...}}>` part
    let sectionTagClosed = false;
    let bodyLines = [];
    let insideSection = false;
    for (let i = 1; i < manualSearchLines.length; i++) {
        if (!insideSection) {
            if (manualSearchLines[i].includes('}}>')) {
                insideSection = true;
            }
        } else {
            if (i === manualSearchLines.length - 1 && manualSearchLines[i].includes('</section>')) {
                // skip closing tag
                break;
            }
            bodyLines.push(manualSearchLines[i]);
        }
    }
    
    newManualSearch += '\n' + bodyLines.join('\n') + `\n        </div>\n      </section>`;
    
    // 4. Inject it right before the captureArea
    const newCaptureAreaIdx = lines.findIndex(l => l.includes('<main id="capture-area"'));
    lines.splice(newCaptureAreaIdx, 0, newManualSearch);
    
    fs.writeFileSync('app/page.js', lines.join('\n'));
    console.log('Restructured Manual Search successfully.');
} else {
    console.log('Could not find all required section indices.');
    console.log('manualSearchStartIdx:', manualSearchStartIdx);
    console.log('anonymousCommentsIdx:', anonymousCommentsIdx);
    console.log('captureAreaIdx:', captureAreaIdx);
}
