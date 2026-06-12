const fs = require('fs');

const items = JSON.parse(fs.readFileSync('public/items.json', 'utf8'));

const gearBases = {
  SWORD: 300001, // Long Sword
  BOW: 310001, // Short Bow
  STAFF: 320001, // Wooden Staff
  SCEPTER: 330001, // Novice Scepter
  CROSSBOW: 340001, // Crossbow
  AXE: 350001, // Wooden Axe
  SHIELD: 400001, // Buckler (Wait, maybe just use 'Shield'?) Let's use 400002 Wooden Shield
  ARROW: 410001, // Wooden Arrow
  ORB: 420001, // Magic Orb
  TOME: 430001, // Prayer Tome
  BOLT: 440001, // Short Bolt
  HATCHET: 450001, // Short Hatchet
  HELMET: 500001, // Wooden Helmet
  ARMOR: 510001, // Wooden Armor
  GLOVES: 520001, // Leather Gloves
  BOOTS: 530001, // Wooden Boots
  AMULET: 600001, // Copper Amulet
  EARING: 611011, // Copper Earring
  RING: 620001, // Copper Ring
  BRACER: 630001 // Copper Bracer
};

const prefixes = {
  'en-US': ['Wooden ', 'Copper ', 'Long ', 'Short ', 'Novice ', 'Magic ', 'Prayer ', 'Leather ', 'Small '],
  'ja-JP': ['ウッド', 'コッパー', 'コパー', 'ロング', 'ショート', 'ノービス', 'マジック', 'プレイヤー', 'レザー', 'スモール'],
  'zh-Hans': ['木制', '木', '铜制', '铜', '长', '短', '新手', '魔法', '祈祷', '皮革', '小'],
  'zh-Hant': ['木製', '木', '銅製', '銅', '長', '短', '新手', '魔法', '祈禱', '皮革', '小'],
  'ko-KR': ['나무 ', '구리 ', '긴 ', '장', '단', '짧은 ', '초보자 ', '마법 ', '기도 ', '가죽 ', '소형 '],
  'fr-FR': [' en Bois', ' en Cuivre', ' Longue', ' Court', ' de Novice', ' Magique', ' de Prière', ' en Cuir', ' Léger', ' Courte', " d'Oreille"],
  'de-DE': ['Holz', 'Kupfer', 'Lang', 'Kurz', 'Anfänger-', 'Magische ', 'Gebets', 'Leder', 'Faust', 'Kurzer ', 'Kurze '],
  'ru-RU': ['Деревянный ', 'Деревянная ', 'Медный ', 'Медная ', 'Длинный ', 'Короткий ', 'Короткая ', 'Магическая ', 'Молитвенный ', 'Кожаные ', 'Деревянные '],
  'es-ES': [' de Madera', ' de Cobre', ' Larga', ' Corto', ' Corta', ' de Novato', ' Mágico', ' de Oración', ' de Cuero', ' Pequeña', 'Pendiente de Cobre'],
  'pt-BR': [' de Madeira', ' de Cobre', ' Longa', ' Curto', ' Curta', ' de Novato', ' Mágico', ' de Oração', ' de Couro', 'Brinco '],
  'id-ID': [' Kayu', ' Tembaga', ' Panjang', ' Pendek', ' Pemula', ' Sihir', ' Doa', ' Kulit', ' Kecil', 'Anting '],
  'th-TH': ['ไม้', 'ทองแดง', 'ยาว', 'สั้น', 'มือใหม่', 'เวทมนตร์', 'สวดมนต์', 'หนัง', 'เล็ก', 'ต่างหู'],
  'tr-TR': ['Ahşap ', 'Bakır ', 'Uzun ', 'Kısa ', 'Acemi ', 'Sihirli ', 'Dua ', 'Deri ', 'Küçük ', ' Cıvata Oku'],
  'uk-UA': ["Дерев'яна ", "Дерев'яний ", "Дерев'яні ", 'Мідна ', 'Мідний ', 'Довгий ', 'Короткий ', 'Магічна ', 'Молитовний ', 'Шкіряні ', 'Коротка '],
  'pl-PL': ['Drewniany ', 'Drewniana ', 'Drewniane ', 'Miedziana ', 'Miedziany ', 'Długi ', 'Krótki ', 'Magiczny ', 'Tomiszcze ', 'Skórzane ', 'Krótka '],
  'vi-VN': [' gỗ', ' Đồng Đỏ', ' dài', ' ngắn', ' Tập Sự', ' phép thuật', ' cầu nguyện', ' Da', ' nhỏ', ' Ngắn', 'Bông Tai ']
};

// Exceptional hardcoded matches if stripping fails to produce a clean name
const overrides = {
  'SHIELD': {
    'en-US': 'Shield',
    'ja-JP': 'シールド',
    'zh-Hans': '盾',
    'zh-Hant': '盾',
    'fr-FR': 'Bouclier',
    'de-DE': 'Schild',
    'ru-RU': 'Щит',
    'ko-KR': '방패'
  },
  'EARING': {
    'fr-FR': 'Boucle d\'Oreille',
    'de-DE': 'Ohrring',
    'es-ES': 'Pendiente',
    'pt-BR': 'Brinco',
    'id-ID': 'Anting',
    'th-TH': 'ต่างหู',
    'vi-VN': 'Bông Tai'
  }
};

const res = {};

for (const [gear, id] of Object.entries(gearBases)) {
  let item = items.find(i => i.id === id);
  if (!item) item = items.find(i => i.gear === gear);
  
  const translations = {};
  
  if (item && item.name) {
    for (const [lang, name] of Object.entries(item.name)) {
      if (overrides[gear] && overrides[gear][lang]) {
        translations[lang] = overrides[gear][lang];
        continue;
      }
      
      let cleanName = name;
      if (prefixes[lang]) {
        for (const pref of prefixes[lang]) {
          if (cleanName.startsWith(pref)) {
            cleanName = cleanName.substring(pref.length).trim();
          } else if (cleanName.endsWith(pref)) {
            cleanName = cleanName.substring(0, cleanName.length - pref.length).trim();
          }
        }
      }
      
      // Additional cleanup to make it look like a class name
      if (lang === 'en-US') {
        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
      
      translations[lang] = cleanName;
    }
  }
  
  res[gear.toLowerCase()] = translations;
}

fs.writeFileSync('public/gear_trans.json', JSON.stringify(res, null, 2), 'utf8');
console.log('Successfully generated public/gear_trans.json');
