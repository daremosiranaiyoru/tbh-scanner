const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// Use regex to match regardless of spacing/newlines
content = content.replace(
  /className=\{`glass-panel \$\{dragActive \? styles\.dragActive : ''\}`\}\s+style=\{\{ border: 'none', padding: '20px', display: 'flex', flexDirection: 'column', height: \(results\.length > 0 \|\| isScanning\) \? '600px' : 'auto', transition: 'border 0\.3s' \}\}/g,
  "className={`glass-panel ${dragActive ? styles.dragActive : ''}`} \n          style={{ border: 'none', boxShadow: 'none', padding: '20px', display: 'flex', flexDirection: 'column', height: (results.length > 0 || isScanning) ? '600px' : 'auto', transition: 'border 0.3s' }}"
);

content = content.replace(
  /className=\{`glass-panel \$\{styles\.resultsPanel\}`\}\s+style=\{\{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' \}\}/g,
  "className={`glass-panel ${styles.resultsPanel}`} style={{ border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}"
);

content = content.replace(
  /className=\{`glass-panel \$\{styles\.resultsPanel\}`\}>\s*<div className=\{styles\.resultsHeader\}>/g,
  "className={`glass-panel ${styles.resultsPanel}`} style={{ border: 'none', boxShadow: 'none' }}>\n            <div className={styles.resultsHeader}>"
);

fs.writeFileSync('app/page.js', content);
console.log('Removed outer borders and box-shadow');
