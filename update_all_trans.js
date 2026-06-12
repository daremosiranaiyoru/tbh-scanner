const fs = require('fs');

const file = 'app/page.js';
let content = fs.readFileSync(file, 'utf8');

const transData = {
  announcementTranslations: `    'id-ID': 'Baru: Dukungan untuk penambahan item manual!',
    'th-TH': 'ใหม่: รองรับการเพิ่มไอเทมด้วยตนเอง!',
    'pl-PL': 'Nowość: Wsparcie dla ręcznego dodawania przedmiotów!',
    'uk-UA': 'Нове: Підтримка ручного додавання предметів!'`,
  titleTranslations: `    'id-ID': 'Penilai AI Taskbar Hero',
    'th-TH': 'ผู้ประเมิน AI ของ Taskbar Hero',
    'pl-PL': 'Rzeczoznawca AI Taskbar Hero',
    'uk-UA': 'Оцінювач ШІ Taskbar Hero'`,
  descTranslations: `    'id-ID': 'Menilai harga secara instan dari tangkapan layar inventaris Anda.',
    'th-TH': 'ประเมินราคาจากภาพหน้าจอช่องเก็บของของคุณทันที',
    'pl-PL': 'Błyskawicznie oceniaj ceny na podstawie zrzutów ekranu ekwipunku.',
    'uk-UA': 'Миттєво оцінюйте ціни за скріншотами інвентарю.'`,
  appraisingTranslations: `    'id-ID': 'Menilai...',
    'th-TH': 'กำลังประเมิน...',
    'pl-PL': 'Ocenianie...',
    'uk-UA': 'Оцінювання...'`,
  pleaseWaitTranslations: `    'id-ID': 'Mohon tunggu sebentar.',
    'th-TH': 'กรุณารอสักครู่',
    'pl-PL': 'Proszę chwilę poczekać.',
    'uk-UA': 'Будь ласка, зачекайте хвилинку.'`,
  clearScreenshotTranslations: `    'id-ID': 'Hapus Tangkapan Layar',
    'th-TH': 'ล้างภาพหน้าจอ',
    'pl-PL': 'Wyczyść Zrzut Ekranu',
    'uk-UA': 'Очистити скріншот'`,
  uploadTitleTranslations: `    'id-ID': 'Unggah Tangkapan Layar',
    'th-TH': 'อัปโหลดภาพหน้าจอ',
    'pl-PL': 'Prześlij Zrzut Ekranu',
    'uk-UA': 'Завантажити скріншот'`,
  uploadDescTranslations: `    'id-ID': 'Seret & jatuhkan atau tempel dari papan klip',
    'th-TH': 'ลากและวางหรือวางจากคลิปบอร์ด',
    'pl-PL': 'Przeciągnij i upuść lub wklej ze schowka',
    'uk-UA': 'Перетягніть або вставте з буфера обміну'`,
  cashoutAdTranslations: `    'id-ID': '💡 Tips: Cara menggunakan atau mencairkan saldo Steam Wallet Anda',
    'th-TH': '💡 เคล็ดลับ: วิธีใช้หรือถอนยอดคงเหลือใน Steam Wallet ของคุณ',
    'pl-PL': '💡 Wskazówka: Jak wykorzystać lub wypłacić saldo Portfela Steam',
    'uk-UA': '💡 Порада: Як використовувати або вивести баланс Гаманця Steam'`,
  kofiSmallTrans: `    'id-ID': '❤️ Dukung Pengembang',
    'th-TH': '❤️ สนับสนุนนักพัฒนา',
    'pl-PL': '❤️ Wesprzyj Dewelopera',
    'uk-UA': '❤️ Підтримати Розробника'`,
  commentsTitleTranslations: `    'id-ID': '💬 Catatan Komunitas',
    'th-TH': '💬 บันทึกชุมชน',
    'pl-PL': '💬 Notatki Społeczności',
    'uk-UA': '💬 Нотатки Спільноти'`,
  addBtnTranslations: `  'id-ID': '➕ Tambah Item Manual',
  'th-TH': '➕ เพิ่มไอเทมด้วยตนเอง',
  'pl-PL': '➕ Dodaj Przedmiot Ręcznie',
  'uk-UA': '➕ Додати Предмет Вручну'`,
  sortPriceTranslations: `  'id-ID': '💰 Urutkan Harga',
  'th-TH': '💰 เรียงตามราคา',
  'pl-PL': '💰 Sortuj po Cenie',
  'uk-UA': '💰 Сортувати за Ціною'`,
  sortRestoreTranslations: `  'id-ID': '↺ Pulihkan Urutan',
  'th-TH': '↺ กู้คืนลำดับ',
  'pl-PL': '↺ Przywróć Kolejność',
  'uk-UA': '↺ Відновити Порядок'`,
  labelTranslations: `  'id-ID': 'Baru Terjual:',
  'th-TH': 'ขายล่าสุด:',
  'pl-PL': 'Ostatnio Sprzedane:',
  'uk-UA': 'Нещодавно продані:'`,
  lowestLabelTranslations: `  'id-ID': 'Pesanan Jual:',
  'th-TH': 'คำสั่งขาย:',
  'pl-PL': 'Zlecenie Sprzedaży:',
  'uk-UA': 'Замовлення на продаж:'`,
  buyOrderLabelTranslations: `  'id-ID': 'Pesanan Beli:',
  'th-TH': 'คำสั่งซื้อ:',
  'pl-PL': 'Zlecenie Kupna:',
  'uk-UA': 'Замовлення на купівлю:'`,
  guideTrans: `  'id-ID': 'Tips: Cara bermain dan mendapatkan uang sungguhan dengan berdagang',
  'th-TH': 'เคล็ดลับ: วิธีการเล่นและรับเงินจริงจากการซื้อขาย',
  'pl-PL': 'Wskazówki: Jak grać i zarabiać prawdziwe pieniądze dzięki handlowi',
  'uk-UA': 'Поради: Як грати та заробляти реальні гроші на торгівлі'`
};

// Replace regular dictionaries
for (const [key, transStr] of Object.entries(transData)) {
  const regex = new RegExp('(const ' + key + ' = \\{[\\s\\S]*?)\\n(\\s*)\\};', 'g');
  content = content.replace(regex, '$1,\\n' + transStr + '\\n$2};');
}

// Special case for noticeTrans which has nested structure
const noticeId = "    'id-ID': '📢 Pembaruan v0.1.2 (Sistem Pembelian)',";
const noticeTh = "    'th-TH': '📢 อัปเดต v0.1.2 (ระบบการซื้อ)',";
const noticePl = "    'pl-PL': '📢 Aktualizacja v0.1.2 (System Zakupów)',";
const noticeUk = "    'uk-UA': '📢 Оновлення v0.1.2 (Система Купівлі)'";

const noticeTextId = "    'id-ID': 'Sekarang dapat menangkap pesanan pembelian (harga tertinggi yang dibayar pembeli secara instan). Harap perhatikan fluktuasi harga karena volume perdagangan rendah.',";
const noticeTextTh = "    'th-TH': 'ตอนนี้สามารถจับคำสั่งซื้อได้แล้ว (ราคาสูงสุดที่ผู้ซื้อจ่ายทันที) โปรดระวังความผันผวนของราคาเนื่องจากปริมาณการซื้อขายต่ำ',";
const noticeTextPl = "    'pl-PL': 'Teraz może przechwytywać zlecenia kupna (najwyższa cena płacona natychmiast przez kupujących). Proszę uważać na wahania cen spowodowane niskim wolumenem obrotu.',";
const noticeTextUk = "    'uk-UA': 'Тепер може захоплювати замовлення на купівлю (найвища ціна, яку покупці платять миттєво). Будь ласка, пам\\'ятайте про коливання цін через низький обсяг торгів.'";

content = content.replace(
  /(title:\s*\{[\s\S]*?)(\n\s*\},)/,
  '$1,\n' + noticeId + '\n' + noticeTh + '\n' + noticePl + '\n' + noticeUk + '$2'
);

content = content.replace(
  /(text:\s*\{[\s\S]*?)(\n\s*\})/,
  '$1,\n' + noticeTextId + '\n' + noticeTextTh + '\n' + noticeTextPl + '\n' + noticeTextUk + '$2'
);

fs.writeFileSync(file, content);
console.log('Successfully updated all top-level translation dictionaries!');
