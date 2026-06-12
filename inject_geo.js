const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

const target = `  useEffect(() => {
    // Load admin secret and preferred language if available
    if (typeof window !== 'undefined') {
      setIsAdminSecret(localStorage.getItem('adminSecret'));
      const savedLang = localStorage.getItem('preferredLang');
      if (savedLang) {
        setSelectedLang(savedLang);
      }
    }
  }, []);`;

const replacement = `  useEffect(() => {
    // Load admin secret and preferred language if available
    if (typeof window !== 'undefined') {
      setIsAdminSecret(localStorage.getItem('adminSecret'));
      const savedLang = localStorage.getItem('preferredLang');
      if (savedLang) {
        setSelectedLang(savedLang);
      } else {
        // Auto-detect language via geo IP
        fetch('/api/geo')
          .then(res => res.json())
          .then(data => {
            if (data.country) {
              const country = data.country.toUpperCase();
              let autoLang = 'en-US';
              if (country === 'JP') autoLang = 'ja-JP';
              else if (['CN', 'HK', 'TW'].includes(country)) autoLang = 'zh-Hans';
              else if (country === 'KR') autoLang = 'ko-KR';
              else if (['RU', 'BY', 'KZ'].includes(country)) autoLang = 'ru-RU';
              else if (['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE'].includes(country)) autoLang = 'es-ES';
              else if (['FR', 'BE', 'CH'].includes(country)) autoLang = 'fr-FR';
              else if (['DE', 'AT'].includes(country)) autoLang = 'de-DE';
              else if (['BR', 'PT'].includes(country)) autoLang = 'pt-BR';
              else if (country === 'TR') autoLang = 'tr-TR';
              else if (country === 'VN') autoLang = 'vi-VN';
              else if (country === 'ID') autoLang = 'id-ID';
              else if (country === 'TH') autoLang = 'th-TH';
              else if (country === 'PL') autoLang = 'pl-PL';
              else if (country === 'UA') autoLang = 'uk-UA';
              
              setSelectedLang(autoLang);
            }
          })
          .catch(err => console.error('Failed to fetch geo:', err));
      }
    }
  }, []);`;

// Handle possible \r\n vs \n issues by normalizing both to a regex that ignores whitespace differences
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^$\{\}()|[\\]\\\\]/g, '\\\\$&');
}

const targetRegex = new RegExp(escapeRegExp(target).replace(/\\n/g, '\\s+'), 'g');
content = content.replace(targetRegex, replacement);

fs.writeFileSync('app/page.js', content);
console.log('Injected geo logic');
