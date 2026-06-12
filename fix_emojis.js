const fs = require('fs');

const file = 'app/page.js';
let content = fs.readFileSync(file, 'utf8');

// Fix kofiSmallTrans
content = content.replace(
  /'id-ID': '❤️ Dukung Pengembang',\n\s*'th-TH': '❤️ สนับสนุนนักพัฒนา',\n\s*'pl-PL': '❤️ Wesprzyj Dewelopera',\n\s*'uk-UA': '❤️ Підтримати Розробника'/,
  "'id-ID': 'Dukung Biaya Server',\n    'th-TH': 'สนับสนุนค่าเซิร์ฟเวอร์',\n    'pl-PL': 'Wesprzyj koszty serwera',\n    'uk-UA': 'Підтримати оплату серверів'"
);

// Fix noticeTrans.title
content = content.replace(
  /'id-ID': '📢 Pembaruan v0.1\.2 \(Sistem Pembelian\)',\n\s*'th-TH': '📢 อัปเดต v0\.1\.2 \(ระบบการซื้อ\)',\n\s*'pl-PL': '📢 Aktualizacja v0\.1\.2 \(System Zakupów\)',\n\s*'uk-UA': '📢 Оновлення v0\.1\.2 \(Система Купівлі\)'/,
  "'id-ID': 'Pemberitahuan',\n    'th-TH': 'ประกาศ',\n    'pl-PL': 'Ogłoszenie',\n    'uk-UA': 'Повідомлення'"
);

// Fix noticeTrans.text
content = content.replace(
  /'id-ID': 'Sekarang dapat menangkap pesanan pembelian \(harga tertinggi yang dibayar pembeli secara instan\)\. Harap perhatikan fluktuasi harga karena volume perdagangan rendah\.',\n\s*'th-TH': 'ตอนนี้สามารถจับคำสั่งซื้อได้แล้ว \(ราคาสูงสุดที่ผู้ซื้อจ่ายทันที\) โปรดระวังความผันผวนของราคาเนื่องจากปริมาณการซื้อขายต่ำ',\n\s*'pl-PL': 'Teraz może przechwytywać zlecenia kupna \(najwyższa cena płacona natychmiast przez kupujących\)\. Proszę uważać na wahania cen spowodowane niskim wolumenem obrotu\.',\n\s*'uk-UA': 'Тепер може захоплювати замовлення на купівлю \(найвища ціна, яку покупці платять миттєво\)\. Будь ласка, пам\\'ятайте про коливання цін через низький обсяг торгів\.'/g,
  "'id-ID': 'Akibat penutupan pasar, beberapa item mengalami lonjakan harga yang tidak normal atau habis terjual. Harap tunggu sebentar sampai pasar dibuka kembali.',\n    'th-TH': 'เนื่องจากการปิดตลาด ไอเทมบางรายการประสบปัญหาราคาพุ่งสูงผิดปกติหรือขายหมดแล้ว โปรดรอสักครู่จนกว่าตลาดจะเปิดอีกครั้ง',\n    'pl-PL': 'Z powodu zamknięcia rynku, niektóre przedmioty odnotowują nienormalne skoki cen lub są wyprzedane. Proszę chwilę poczekać, aż rynek zostanie ponownie otwarty.',\n    'uk-UA': 'Через закриття ринку деякі предмети відчувають аномальні стрибки цін або розпродані. Будь ласка, зачекайте, поки ринок знову відкриється.'"
);

fs.writeFileSync(file, content);
console.log('Fixed incorrectly added emojis and outdated translation text!');
