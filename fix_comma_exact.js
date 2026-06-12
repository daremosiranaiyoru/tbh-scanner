const fs = require('fs');
let code = fs.readFileSync('app/page.js', 'utf8');

const targetStr = "'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này để có độ chính xác tốt nhất!' }";
const replacementStr = targetStr + ",";

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('app/page.js', code);
  console.log('Comma successfully injected.');
} else {
  console.log('Target string not found!');
}
