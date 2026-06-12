const fs = require('fs'); 
let html = fs.readFileSync('app/page.js', 'utf8'); 

html = html.replace(
  /'en-US': 'Recent Sold:', 'ja-JP': '直近の取引:', 'zh-Hans': '最近交易:', 'zh-Hant': '最近交易:',/g, 
  "'en-US': 'Mid Rate:', 'ja-JP': 'ミッドレート:', 'zh-Hans': '中间价:', 'zh-Hant': '中間價:',"
); 
html = html.replace(
  /'ko-KR': '최근 거래:', 'ru-RU': 'Последняя продажа:', 'es-ES': 'Última venta:', 'fr-FR': 'Dernière vente:',/g, 
  "'ko-KR': '중간값:', 'ru-RU': 'Средний курс:', 'es-ES': 'Tasa media:', 'fr-FR': 'Taux médian:',"
); 
html = html.replace(
  /'de-DE': 'Zuletzt verkauft:', 'pt-BR': 'Última venda:', 'tr-TR': 'Son satış:', 'vi-VN': 'Đã bán gần đây:',/g, 
  "'de-DE': 'Mittelkurs:', 'pt-BR': 'Taxa média:', 'tr-TR': 'Orta Kur:', 'vi-VN': 'Tỷ giá giữa:',"
); 
html = html.replace(/'id-ID': 'Baru Terjual:',/g, "'id-ID': 'Nilai Tengah:',"); 
html = html.replace(/'th-TH': 'ขายล่าสุด:',/g, "'th-TH': 'อัตรากลาง:',"); 
html = html.replace(/'pl-PL': 'Ostatnio Sprzedane:',/g, "'pl-PL': 'Kurs średni:',"); 
html = html.replace(/'uk-UA': 'Нещодавно продані:'/g, "'uk-UA': 'Середній курс:'"); 
html = html.replace(/const recentSoldLabel = labelTranslations\[selectedLang\] \|\| 'Recent Sold:'/g, "const recentSoldLabel = labelTranslations[selectedLang] || 'Mid Rate:'"); 

html = html.replace(
  /'en-US': 'Sell Order:', 'ja-JP': '売却希望額:', 'zh-Hans': '期望售价:', 'zh-Hant': '期望售價:',/g, 
  "'en-US': 'Ask Price:', 'ja-JP': '売値:', 'zh-Hans': '卖价:', 'zh-Hant': '賣價:',"
); 
html = html.replace(
  /'ko-KR': '판매 희망가:', 'ru-RU': 'Запрос на продажу:', 'es-ES': 'Orden de venta:', 'fr-FR': 'Ordre de vente:',/g, 
  "'ko-KR': '매도호가:', 'ru-RU': 'Цена продажи:', 'es-ES': 'Precio de Venta:', 'fr-FR': 'Prix de vente:',"
); 
html = html.replace(
  /'de-DE': 'Verkaufsauftrag:', 'pt-BR': 'Ordem de venda:', 'tr-TR': 'Satış Emri:', 'vi-VN': 'Lệnh bán:',/g, 
  "'de-DE': 'Verkaufspreis:', 'pt-BR': 'Preço de Venda:', 'tr-TR': 'Satış Fiyatı:', 'vi-VN': 'Giá bán:',"
); 
html = html.replace(/'id-ID': 'Pesanan Jual:',/g, "'id-ID': 'Harga Jual:',"); 
html = html.replace(/'th-TH': 'คำสั่งขาย:',/g, "'th-TH': 'ราคาขาย:',"); 
html = html.replace(/'pl-PL': 'Zlecenie Sprzedaży:',/g, "'pl-PL': 'Cena sprzedaży:',"); 
html = html.replace(/'uk-UA': 'Замовлення на продаж:'/g, "'uk-UA': 'Ціна продажу:'"); 
html = html.replace(/const lowestLabel = lowestLabelTranslations\[selectedLang\] \|\| 'Sell Order:'/g, "const lowestLabel = lowestLabelTranslations[selectedLang] || 'Ask Price:'"); 

html = html.replace(
  /'en-US': 'Buy Order:', 'ja-JP': '購入希望額:', 'zh-Hans': '求购价:', 'zh-Hant': '求購價:',/g, 
  "'en-US': 'Bid Price:', 'ja-JP': '買値:', 'zh-Hans': '买价:', 'zh-Hant': '買價:',"
); 
html = html.replace(
  /'ko-KR': '구매 희망가:', 'ru-RU': 'Запрос на покупку:', 'es-ES': 'Orden de compra:', 'fr-FR': 'Ordre d\\'achat:',/g, 
  "'ko-KR': '매수호가:', 'ru-RU': 'Цена покупки:', 'es-ES': 'Precio de Compra:', 'fr-FR': 'Prix d\\'achat:',"
); 
html = html.replace(
  /'de-DE': 'Kaufauftrag:', 'pt-BR': 'Ordem de compra:', 'tr-TR': 'Alış Emri:', 'vi-VN': 'Lệnh mua:',/g, 
  "'de-DE': 'Kaufpreis:', 'pt-BR': 'Preço de Compra:', 'tr-TR': 'Alış Fiyatı:', 'vi-VN': 'Giá mua:',"
); 
html = html.replace(/'id-ID': 'Pesanan Beli:',/g, "'id-ID': 'Harga Beli:',"); 
html = html.replace(/'th-TH': 'คำสั่งซื้อ:',/g, "'th-TH': 'ราคาซื้อ:',"); 
html = html.replace(/'pl-PL': 'Zlecenie Kupna:',/g, "'pl-PL': 'Cena kupna:',"); 
html = html.replace(/'uk-UA': 'Замовлення на купівлю:'/g, "'uk-UA': 'Ціна покупки:'"); 
html = html.replace(/const buyOrderLabel = buyOrderLabelTranslations\[selectedLang\] \|\| 'Buy Order:'/g, "const buyOrderLabel = buyOrderLabelTranslations[selectedLang] || 'Bid Price:'"); 

fs.writeFileSync('app/page.js', html);
