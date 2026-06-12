const fs = require('fs');
let lines = fs.readFileSync('app/page.js', 'utf8').split('\n');

// 1. Add the state
const commentsOpenIdx = lines.findIndex(l => l.includes('const [commentsOpen, setCommentsOpen]'));
lines.splice(commentsOpenIdx + 1, 0, `  const [searchOpen, setSearchOpen] = useState(false);`);

// 2. Find indices
const manualSearchStartIdx = lines.findIndex(l => l.includes('{/* Manual Search Section */}'));
const howToUseIdx = lines.findIndex(l => l.includes('{/* How to Use Section */}'));

// inner content boundaries
const contentStartIdx = manualSearchStartIdx + 9;
const contentEndIdx = howToUseIdx - 2; // right before </section> and the blank line

let innerLines = lines.slice(contentStartIdx, contentEndIdx);

// 3. Construct new section
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
            🔍 {{ 'en-US': 'Search & Add Items', 'ja-JP': 'アイテムを検索して追加', 'zh-Hans': '搜索并添加物品', 'zh-Hant': '搜尋並新增物品', 'ko-KR': '아이템 검색 및 추가', 'ru-RU': 'Поиск и добавление предметов', 'es-ES': 'Buscar y agregar artículos', 'fr-FR': 'Rechercher et ajouter des objets', 'de-DE': 'Suchen & Gegenstände hinzufügen', 'pt-BR': 'Buscar e Adicionar Itens', 'tr-TR': 'Öğe Ara ve Ekle', 'vi-VN': 'Tìm kiếm & Thêm Vật phẩm', 'id-ID': 'Cari & Tambah Item', 'th-TH': 'ค้นหาและเพิ่มไอเทม', 'pl-PL': 'Szukaj i dodawaj przedmioty', 'uk-UA': 'Пошук і додавання предметів' }[selectedLang] || 'Search & Add Items'}
          </span>
          <span style={{ fontSize: '1rem' }}>{searchOpen ? '▼' : '◀'}</span>
        </button>
        <div style={{ display: searchOpen ? 'block' : 'none', padding: '30px', background: 'rgba(255, 255, 255, 0.03)' }}>
` + innerLines.join('\n') + `
        </div>
      </section>
`;

// 4. Splice out old section
lines.splice(manualSearchStartIdx, howToUseIdx - manualSearchStartIdx - 1);

// 5. Inject before captureArea
const captureAreaIdx = lines.findIndex(l => l.includes('<main id="capture-area"'));
lines.splice(captureAreaIdx, 0, newManualSearch);

fs.writeFileSync('app/page.js', lines.join('\n'));
console.log('Restructured perfectly');
