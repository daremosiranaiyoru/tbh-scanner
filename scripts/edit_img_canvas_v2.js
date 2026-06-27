const { createCanvas, loadImage, Image } = require('canvas');
const fs = require('fs');

async function run() {
  const imagePath = 'public/images/tips_autoscroll_2_base.png';
  const outPath = 'public/images/tips_autoscroll_2.png';
  
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(img, 0, 0);
  
  // Revised coordinates based on square cells
  // Grid start X ~90, Y ~76, cell ~52x52
  // Col 2 (index 1) -> center X = 90 + 52*1 + 26 = 168
  // Diamond is one row higher than previous calculation (so Row 2 instead of Row 3)
  const cx = 168;
  const cy = 154;
  
  // Draw blue circle (bright red was rejected, they want blue. Wait, user originally wanted blue, then I did blue but it was misaligned and bad cursor. Let's do a nice blue circle.)
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, 2 * Math.PI, false);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#00bfff';
  ctx.stroke();
  
  // Outer glow for the blue circle
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, 2 * Math.PI, false);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0, 191, 255, 0.4)';
  ctx.stroke();
  
  // Inner glow for the blue circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI, false);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 191, 255, 0.6)';
  ctx.stroke();

  // Draw proper cursor using an SVG loaded as an image
  const svgCursor = `
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5L24 21L17.5 21L21.5 29L18 30.5L14 22.5L9 27.5L8 5Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>
  `;
  const cursorImg = new Image();
  cursorImg.onload = () => {
    // Position cursor so its tip (8,5) is slightly below right of the center
    // Or just pointing exactly at the center
    ctx.drawImage(cursorImg, cx - 8, cy - 5);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);
    console.log('Done with improved cursor and position!');
  };
  cursorImg.src = 'data:image/svg+xml;base64,' + Buffer.from(svgCursor).toString('base64');
}

run();
