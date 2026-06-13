const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

async function generateSprite() {
  console.log("Reading icons_manifest.json...");
  const manifest = JSON.parse(fs.readFileSync('public/icons_manifest.json', 'utf8'));

  // Include ALL icons in the sprite sheet so the frontend NEVER falls back to individual image requests
  const filteredPaths = manifest;

  const ICON_SIZE = 32;
  const COLS = 20; // 20 columns = 640px width
  const ROWS = Math.ceil(filteredPaths.length / COLS);
  
  const width = COLS * ICON_SIZE;
  const height = ROWS * ICON_SIZE;

  console.log(`Generating sprite sheet for ${filteredPaths.length} icons...`);
  console.log(`Sprite Dimensions: ${width}x${height}`);

  // Create a transparent master image using Jimp v1 syntax
  const sprite = new Jimp({ width, height, color: 0x00000000 });
  const spriteMap = {};

  for (let i = 0; i < filteredPaths.length; i++) {
    const file = filteredPaths[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    
    const x = col * ICON_SIZE;
    const y = row * ICON_SIZE;

    try {
      const icon = await Jimp.read(path.join('public/icons', file));
      
      // OpenCV engine expects 32x32 images
      if (icon.bitmap.width !== ICON_SIZE || icon.bitmap.height !== ICON_SIZE) {
         icon.resize({ w: ICON_SIZE, h: ICON_SIZE, mode: 'nearestNeighbor' });
      }
      
      sprite.composite(icon, x, y);
      
      // Save metadata
      spriteMap[file] = { x, y, width: ICON_SIZE, height: ICON_SIZE };
    } catch (e) {
      console.error(`Failed to process ${file}:`, e);
    }
    
    if (i % 50 === 0 && i > 0) {
      console.log(`Processed ${i} / ${filteredPaths.length} icons...`);
    }
  }

  console.log("Writing sprite to public/icons_sprite.png...");
  await sprite.write('public/icons_sprite.png');
  
  console.log("Writing sprite map to public/sprite_map.json...");
  fs.writeFileSync('public/sprite_map.json', JSON.stringify(spriteMap, null, 2));
  
  console.log("Done! Sprite sheet and map generated successfully.");
}

generateSprite().catch(console.error);
