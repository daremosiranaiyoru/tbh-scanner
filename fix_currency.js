const fs = require('fs');
const file = 'app/page.js';
let content = fs.readFileSync(file, 'utf8');

const originalLang1 = `const langToCurrency = {
  'en-US': { code: 'USD' },
  'ja-JP': { code: 'JPY' },
  'zh-Hans': { code: 'CNY' },
  'zh-Hant': { code: 'TWD' },
  'ko-KR': { code: 'KRW' },
  'ru-RU': { code: 'RUB' },
  'es-ES': { code: 'EUR' },
  'fr-FR': { code: 'EUR' },
  'de-DE': { code: 'EUR' },
  'pt-BR': { code: 'BRL' },
  'tr-TR': { code: 'TRY' },
  'vi-VN': { code: 'VND' },
};`;

const newLang1 = `const langToCurrency = {
  'en-US': { code: 'USD' },
  'ja-JP': { code: 'JPY' },
  'zh-Hans': { code: 'CNY' },
  'zh-Hant': { code: 'TWD' },
  'ko-KR': { code: 'KRW' },
  'ru-RU': { code: 'RUB' },
  'es-ES': { code: 'EUR' },
  'fr-FR': { code: 'EUR' },
  'de-DE': { code: 'EUR' },
  'pt-BR': { code: 'BRL' },
  'tr-TR': { code: 'TRY' },
  'vi-VN': { code: 'VND' },
  'id-ID': { code: 'IDR' },
  'th-TH': { code: 'THB' },
  'pl-PL': { code: 'PLN' },
  'uk-UA': { code: 'UAH' },
};`;

const originalLang2 = `            const langToCurrency = {
              'en-US': { code: 'USD' }, 'ja-JP': { code: 'JPY' }, 'zh-Hans': { code: 'CNY' },
              'zh-Hant': { code: 'TWD' }, 'ko-KR': { code: 'KRW' }, 'ru-RU': { code: 'RUB' },
              'es-ES': { code: 'EUR' }, 'fr-FR': { code: 'EUR' }, 'de-DE': { code: 'EUR' },
              'pt-BR': { code: 'BRL' }, 'tr-TR': { code: 'TRY' }, 'vi-VN': { code: 'VND' }
            };`;

const newLang2 = `            const langToCurrency = {
              'en-US': { code: 'USD' }, 'ja-JP': { code: 'JPY' }, 'zh-Hans': { code: 'CNY' },
              'zh-Hant': { code: 'TWD' }, 'ko-KR': { code: 'KRW' }, 'ru-RU': { code: 'RUB' },
              'es-ES': { code: 'EUR' }, 'fr-FR': { code: 'EUR' }, 'de-DE': { code: 'EUR' },
              'pt-BR': { code: 'BRL' }, 'tr-TR': { code: 'TRY' }, 'vi-VN': { code: 'VND' },
              'id-ID': { code: 'IDR' }, 'th-TH': { code: 'THB' }, 'pl-PL': { code: 'PLN' },
              'uk-UA': { code: 'UAH' }
            };`;

content = content.replace(originalLang1, newLang1);
content = content.replace(originalLang2, newLang2);

content = content.replace(
  "maximumFractionDigits: curr.code === 'JPY' || curr.code === 'KRW' ? 0 : 2",
  "maximumFractionDigits: ['JPY', 'KRW', 'VND', 'IDR'].includes(curr.code) ? 0 : 2"
);

content = content.replace(
  "maximumFractionDigits: ['JPY', 'KRW', 'VND'].includes(curr.code) ? 0 : 2",
  "maximumFractionDigits: ['JPY', 'KRW', 'VND', 'IDR'].includes(curr.code) ? 0 : 2"
);

fs.writeFileSync(file, content);
console.log('Fixed langToCurrency and maximumFractionDigits');
