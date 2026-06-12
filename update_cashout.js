const fs = require('fs');

let content = fs.readFileSync('app/cashout/page.js', 'utf8');

const additionalTranslations = `
  'id-ID': {
    back: '← Kembali ke Pemindai',
    title: '📝 Rute pencairan alternatif untuk Steam Wallet',
    intro: 'Pernahkah Anda bertanya-tanya apakah Anda dapat mengubah dana Steam Wallet yang Anda peroleh dari Taskbar Hero menjadi uang sungguhan? Meskipun Anda tidak dapat menariknya secara langsung dari Steam, pemain veteran menggunakan situs skin pihak ketiga untuk mencairkannya ke rekening bank. Berikut penjelasan singkat tentang cara komunitas melakukannya!',
    step1Title: 'Daftar di situs perdagangan skin eksternal',
    step1Text: <>Karena Anda tidak dapat menarik dana langsung dari dompet Steam Anda, Anda perlu menggunakan situs perdagangan eksternal untuk menguangkannya. Pertama, masuk ke platform perdagangan skin global seperti <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> menggunakan akun Steam Anda. Ini adalah platform yang relatif aman dengan jutaan pengguna.</>,
    step1Note: '',
    step2Title: 'Beli item dengan likuiditas tinggi di Steam',
    step2Text: 'Selanjutnya, beli "item yang diperdagangkan secara global" di Pasar Komunitas Steam. Triknya adalah dengan memeriksa permintaan di situs perdagangan terlebih dahulu dan memilih item dengan volume tinggi seperti skin Counter-Strike 2 atau kunci Team Fortress 2. Namun, karena keamanan Steam, ada masa tunggu 7 hari sebelum Anda dapat memperdagangkan kembali item yang dibeli.',
    step3Title: 'Jual di situs perdagangan dan tarik tunai',
    step3Text: 'Setelah masa tunggu 7 hari, daftarkan item Anda di situs perdagangan seperti DMarket. Anda dapat menjual langsung ke bot mereka jika sedang terburu-buru, atau menggunakan perdagangan antar pemain jika ingin mendapatkan sedikit lebih banyak uang. Setelah terjual dan Anda mendapatkan saldo USD, Anda dapat dengan mudah menariknya ke rekening bank Anda melalui layanan seperti Payoneer untuk menyelesaikan pencairan.',
    videoTitle: '📺 Panduan Video (Referensi)',
    warningTitle: '⚠️ Catatan Penting Mengenai TOS Steam',
    warningText: 'Meskipun sepenuhnya legal, mencairkan dana melalui situs pihak ketiga secara teknis merupakan area abu-abu yang tidak didukung secara resmi oleh Ketentuan Layanan Steam. Namun, situs besar seperti DMarket telah beroperasi selama bertahun-tahun di bawah persetujuan diam-diam Valve. Ingatlah bahwa ini adalah "trik" komunitas tidak resmi yang Anda gunakan dengan risiko Anda sendiri!',
    footerTitle: '📝 Tautan Referensi',
    footerText: 'Ini adalah contoh platform eksternal yang disebutkan dalam artikel ini. Anda dapat memeriksa harga pasar yang sebenarnya di situs di bawah ini.',
    btn: 'DMarket (Situs Eksternal)'
  },
  'th-TH': {
    back: '← กลับไปที่สแกนเนอร์',
    title: '📝 เส้นทางถอนเงินทางเลือกสำหรับ Steam Wallet',
    intro: 'เคยสงสัยไหมว่าคุณสามารถเปลี่ยนเงินใน Steam Wallet ที่ได้จาก Taskbar Hero เป็นเงินจริงได้หรือไม่ แม้ว่าคุณจะไม่สามารถถอนออกจาก Steam ได้โดยตรง แต่ผู้เล่นมือเก๋าใช้เว็บไซต์ซื้อขายสกินของบุคคลที่สามเพื่อถอนเงินเข้าบัญชีธนาคาร นี่คือบทสรุปสั้นๆ ว่าพวกเขาทำได้อย่างไร!',
    step1Title: 'ลงทะเบียนบนเว็บไซต์ซื้อขายสกินภายนอก',
    step1Text: <>เนื่องจากคุณไม่สามารถถอนเงินออกจากกระเป๋าเงิน Steam ของคุณได้โดยตรง คุณต้องใช้เว็บไซต์ซื้อขายภายนอกเพื่อถอนเงินเป็นเงินสด ขั้นแรก ให้เข้าสู่ระบบแพลตฟอร์มการซื้อขายสกินระดับโลกอย่าง <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> โดยใช้บัญชี Steam ของคุณ มันเป็นแพลตฟอร์มที่ค่อนข้างปลอดภัยและมีผู้ใช้งานหลายล้านคน</>,
    step1Note: '',
    step2Title: 'ซื้อไอเทมที่มีสภาพคล่องสูงบน Steam',
    step2Text: 'ต่อไป ซื้อ "ไอเทมที่มีการซื้อขายทั่วโลก" ในตลาดชุมชน Steam เคล็ดลับคือตรวจสอบความต้องการบนเว็บไซต์ซื้อขายล่วงหน้าและเลือกไอเทมที่มีปริมาณการซื้อขายสูง เช่น สกิน Counter-Strike 2 หรือกุญแจ Team Fortress 2 อย่างไรก็ตาม เนื่องจากระบบความปลอดภัยของ Steam จึงมีระยะเวลารอคอย 7 วันก่อนที่คุณจะสามารถซื้อขายไอเทมที่ซื้อมาได้อีกครั้ง',
    step3Title: 'ขายบนเว็บไซต์ซื้อขายและถอนเงินสด',
    step3Text: 'หลังจากระยะเวลารอ 7 วัน ให้นำไอเทมของคุณไปวางขายบนเว็บไซต์ซื้อขายอย่าง DMarket คุณสามารถขายให้กับบอทของพวกเขาได้ทันทีหากคุณรีบ หรือใช้การซื้อขายระหว่างผู้เล่นหากต้องการเงินเพิ่มขึ้นเล็กน้อย เมื่อขายได้และคุณมียอดคงเหลือเป็น USD คุณสามารถถอนเข้าบัญชีธนาคารของคุณผ่านบริการอย่าง Payoneer เพื่อถอนเงินให้เสร็จสมบูรณ์ได้อย่างง่ายดาย',
    videoTitle: '📺 วิดีโอแนะนำ (ข้อมูลอ้างอิง)',
    warningTitle: '⚠️ หมายเหตุสำคัญเกี่ยวกับข้อตกลงในการให้บริการของ Steam',
    warningText: 'แม้ว่าจะถูกต้องตามกฎหมายอย่างสมบูรณ์ แต่การถอนเงินผ่านเว็บไซต์ของบุคคลที่สามในทางเทคนิคถือเป็นพื้นที่สีเทาที่ไม่ได้รับการสนับสนุนอย่างเป็นทางการจากข้อตกลงในการให้บริการของ Steam อย่างไรก็ตาม เว็บไซต์ขนาดใหญ่อย่าง DMarket ได้เปิดดำเนินการมาหลายปีภายใต้การอนุมัติโดยปริยายของ Valve โปรดจำไว้ว่านี่เป็น "เคล็ดลับ" ของชุมชนอย่างไม่เป็นทางการที่คุณต้องรับความเสี่ยงเอง!',
    footerTitle: '📝 ลิงก์อ้างอิง',
    footerText: 'นี่คือตัวอย่างของแพลตฟอร์มภายนอกที่กล่าวถึงในบทความนี้ คุณสามารถตรวจสอบราคาตลาดจริงได้ที่เว็บไซต์ด้านล่าง',
    btn: 'DMarket (เว็บไซต์ภายนอก)'
  },
  'pl-PL': {
    back: '← Powrót do skanera',
    title: '📝 Alternatywna trasa wypłaty z Portfela Steam',
    intro: 'Zastanawiałeś się kiedyś, czy możesz zamienić środki w Portfelu Steam zarobione w Taskbar Hero na prawdziwe pieniądze? Chociaż nie możesz ich wypłacić bezpośrednio ze Steam, weterani używają zewnętrznych stron ze skinami, aby wypłacić je na konto bankowe. Oto krótkie podsumowanie, jak społeczność to robi!',
    step1Title: 'Zarejestruj się na zewnętrznej stronie wymiany skinów',
    step1Text: <>Ponieważ nie możesz wypłacić środków bezpośrednio ze swojego portfela Steam, musisz użyć zewnętrznej strony do handlu, aby wypłacić gotówkę. Najpierw zaloguj się na globalną platformę handlu skinami, taką jak <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>, używając swojego konta Steam. Jest to stosunkowo bezpieczna platforma z milionami użytkowników.</>,
    step1Note: '',
    step2Title: 'Kupuj przedmioty o wysokiej płynności na Steam',
    step2Text: 'Następnie kup "globalnie handlowane przedmioty" na Rynku Społeczności Steam. Sztuką jest wcześniejsze sprawdzenie popytu na stronie handlowej i wybranie przedmiotów o dużej liczbie transakcji, takich jak skiny do Counter-Strike 2 lub klucze do Team Fortress 2. Jednak ze względu na bezpieczeństwo Steam istnieje 7-dniowy okres oczekiwania, zanim będzie można ponownie handlować kupionymi przedmiotami.',
    step3Title: 'Sprzedaj na stronie handlowej i wypłać gotówkę',
    step3Text: 'Po 7-dniowym okresie oczekiwania wystaw swoje przedmioty na stronie handlowej, takiej jak DMarket. Możesz natychmiast sprzedać je ich botom, jeśli się spieszysz, lub użyć handlu między graczami, aby uzyskać trochę więcej gotówki. Po sprzedaży i uzyskaniu salda w USD możesz łatwo wypłacić je na swoje konto bankowe za pośrednictwem usług takich jak Payoneer, aby zakończyć wypłatę.',
    videoTitle: '📺 Przewodnik wideo (Odniesienie)',
    warningTitle: '⚠️ Ważna uwaga dotycząca warunków świadczenia usług Steam',
    warningText: 'Chociaż jest to całkowicie legalne, wypłacanie przedmiotów za pośrednictwem witryn stron trzecich jest technicznie szarą strefą, która nie jest oficjalnie obsługiwana przez Warunki świadczenia usług Steam. Jednak ogromne witryny, takie jak DMarket, działają od lat za milczącą zgodą Valve. Pamiętaj tylko, że jest to nieoficjalna "sztuczka" społeczności używana na własne ryzyko!',
    footerTitle: '📝 Link referencyjny',
    footerText: 'To jest przykład zewnętrznych platform wymienionych w tym artykule. Możesz sprawdzić rzeczywiste ceny rynkowe na poniższej stronie.',
    btn: 'DMarket (Strona zewnętrzna)'
  },
  'uk-UA': {
    back: '← Назад до сканера',
    title: '📝 Альтернативний маршрут виведення коштів з Гаманця Steam',
    intro: 'Коли-небудь замислювалися, чи можна перетворити кошти з Гаманця Steam, зароблені в Taskbar Hero, на реальні гроші? Хоча ви не можете вивести їх безпосередньо зі Steam, ветерани використовують сторонні сайти зі скінами для виведення на банківський рахунок. Ось короткий огляд того, як це робить спільнота!',
    step1Title: 'Зареєструйтеся на зовнішньому сайті обміну скінами',
    step1Text: <>Оскільки ви не можете вивести кошти безпосередньо зі свого гаманця Steam, вам потрібно використовувати сторонній торговий майданчик для виведення коштів. Спочатку увійдіть на глобальну платформу торгівлі скінами, таку як <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>, використовуючи свій обліковий запис Steam. Це відносно безпечна платформа з мільйонами користувачів.</>,
    step1Note: '',
    step2Title: 'Купуйте високоліквідні предмети в Steam',
    step2Text: 'Далі купуйте "предмети, якими торгують у всьому світі" на Торговому майданчику спільноти Steam. Хитрість полягає в тому, щоб заздалегідь перевірити попит на торговому сайті і вибрати предмети з великим обсягом торгів, такі як скіни Counter-Strike 2 або ключі Team Fortress 2. Однак через політику безпеки Steam існує 7-денний період очікування, перш ніж ви зможете знову торгувати придбаними предметами.',
    step3Title: 'Продайте на торговому сайті та виведіть готівку',
    step3Text: 'Після 7-денного періоду очікування виставте свої предмети на торговому сайті, такому як DMarket. Ви можете миттєво продати їхнім ботам, якщо поспішаєте, або використовувати торгівлю між гравцями, щоб отримати трохи більше готівки. Після продажу та отримання балансу в доларах США ви можете легко вивести їх на свій банківський рахунок через такі сервіси, як Payoneer, щоб завершити виведення.',
    videoTitle: '📺 Відеопосібник (Довідка)',
    warningTitle: '⚠️ Важлива примітка щодо Умов обслуговування Steam',
    warningText: 'Хоча юридично це абсолютно нормально, виведення коштів через сторонні сайти технічно є "сірою зоною", яка офіційно не підтримується Умовами обслуговування Steam. Однак великі сайти, такі як DMarket, працюють роками за мовчазної згоди Valve. Просто пам\'ятайте, що це неофіційна "фішка" спільноти, яку ви використовуєте на свій страх і ризик!',
    footerTitle: '📝 Довідкове посилання',
    footerText: 'Це приклад зовнішніх платформ, згаданих у цій статті. Ви можете перевірити реальні ринкові ціни на сайті нижче.',
    btn: 'DMarket (Зовнішній сайт)'
  }
`;

content = content.replace('};', additionalTranslations + '\n};');
fs.writeFileSync('app/cashout/page.js', content);
console.log('Updated app/cashout/page.js');
