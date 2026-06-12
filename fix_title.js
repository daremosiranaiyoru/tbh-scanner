const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

const target = "🔍 {selectedLang === 'ja-JP' ? 'アイテムを検索して追加' : (selectedLang === 'en-US' ? 'Search & Add Items' : 'Search & Add Items')}";

const replacement = "🔍 {{ 'en-US': 'Search & Add Items', 'ja-JP': 'アイテムを検索して追加', 'zh-Hans': '搜索并添加物品', 'zh-Hant': '搜尋並新增物品', 'ko-KR': '아이템 검색 및 추가', 'ru-RU': 'Поиск и добавление предметов', 'es-ES': 'Buscar y agregar artículos', 'fr-FR': 'Rechercher et ajouter des objets', 'de-DE': 'Suchen & Gegenstände hinzufügen', 'pt-BR': 'Buscar e Adicionar Itens', 'tr-TR': 'Öğe Ara ve Ekle', 'vi-VN': 'Tìm kiếm & Thêm Vật phẩm', 'id-ID': 'Cari & Tambah Item', 'th-TH': 'ค้นหาและเพิ่มไอเทม', 'pl-PL': 'Szukaj i dodawaj przedmioty', 'uk-UA': 'Пошук і додавання предметів' }[selectedLang] || 'Search & Add Items'}";

content = content.replace(target, replacement);
fs.writeFileSync('app/page.js', content);
console.log('Fixed header translation');
