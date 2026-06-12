const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

content = content.replace(
  "style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: (results.length > 0 || isScanning) ? '600px' : 'auto', transition: 'border 0.3s' }}",
  "style={{ border: 'none', padding: '20px', display: 'flex', flexDirection: 'column', height: (results.length > 0 || isScanning) ? '600px' : 'auto', transition: 'border 0.3s' }}"
);

content = content.replace(
  "style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}",
  "style={{ border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}"
);

content = content.replace(
  "<div className={`glass-panel ${styles.resultsPanel}`}>\n            <div className={styles.resultsHeader}>",
  "<div className={`glass-panel ${styles.resultsPanel}`} style={{ border: 'none' }}>\n            <div className={styles.resultsHeader}>"
);

fs.writeFileSync('app/page.js', content);
console.log('Removed outer borders');
