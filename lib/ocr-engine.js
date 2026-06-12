let iconDB = {}; // In-memory database: { filename: { bgr: cv.Mat, mask: cv.Mat } }

async function buildDatabaseFromSprite(spriteImg, spriteMap) {
  iconDB = {};
  
  // Create a canvas large enough to hold the whole sprite sheet
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteImg.width;
  spriteCanvas.height = spriteImg.height;
  const spriteCtx = spriteCanvas.getContext('2d', { willReadFrequently: true });
  spriteCtx.imageSmoothingEnabled = false;
  spriteCtx.drawImage(spriteImg, 0, 0);

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  for (const [file, pos] of Object.entries(spriteMap)) {
    ctx.clearRect(0, 0, 32, 32);
    // Draw the specific 32x32 section from the sprite
    ctx.drawImage(spriteCanvas, pos.x, pos.y, pos.width, pos.height, 0, 0, 32, 32);
    
    // --- Create 32x32 arrays for matching ---
    const imgData = ctx.getImageData(0, 0, 32, 32);
    const src = cv.matFromImageData(imgData);
    const rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    const bgrPlanes = new cv.MatVector();
    bgrPlanes.push_back(rgbaPlanes.get(2)); // Blue
    bgrPlanes.push_back(rgbaPlanes.get(1)); // Green
    bgrPlanes.push_back(rgbaPlanes.get(0)); // Red
    const bgr = new cv.Mat();
    cv.merge(bgrPlanes, bgr);
    const mask = rgbaPlanes.get(3).clone();
    
    src.delete(); rgbaPlanes.delete(); bgrPlanes.delete();

    // --- Create 32x32 mask for color sampling ---
    const fullImgData = ctx.getImageData(0, 0, 32, 32);
    const fullSrc = cv.matFromImageData(fullImgData);
    const fullPlanes = new cv.MatVector();
    cv.split(fullSrc, fullPlanes);
    const fullMask = fullPlanes.get(3).clone();
    fullSrc.delete(); fullPlanes.delete();
    
    // Ignore empty templates
    if (cv.countNonZero(mask) > 10) {
      // Create half-scale versions for fast coarse matching
      const halfBgr = new cv.Mat();
      const halfMask = new cv.Mat();
      cv.resize(bgr, halfBgr, new cv.Size(16, 11), 0, 0, cv.INTER_NEAREST);
      cv.resize(mask, halfMask, new cv.Size(16, 11), 0, 0, cv.INTER_NEAREST);
      
      // Create the maskless template for Coarse Match by filling transparent pixels with slot background [23,23,23]
      const halfBgrFilled = halfBgr.clone();
      for (let i = 0; i < 16 * 11; i++) {
        if (halfMask.data[i] === 0) {
          halfBgrFilled.data[i*3] = 23;     // Blue
          halfBgrFilled.data[i*3 + 1] = 23; // Green
          halfBgrFilled.data[i*3 + 2] = 23; // Red
        }
      }
      
      iconDB[file] = { bgr, mask, halfBgr, halfBgrFilled, halfMask, fullMask };
    } else {
      mask.delete();
      bgr.delete();
      fullMask.delete();
    }
  }
  console.log(`Loaded ${Object.keys(iconDB).length} icons into memory from Sprite Sheet.`);
}

function classifyRarity(r, g, b) {
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let d = max - min;
  let s = max === 0 ? 0 : d / max;
  let v = max / 255;
  let h = 0;

  if (max !== min) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    h /= 6;
  }
  
  h = Math.round(h * 360);

  if (s < 0.40 || v < 0.25) {
    if (v > 0.75) return "COSMIC"; // Bright White
    return "COMMON"; // Gray/Dark
  }
  
  if (h >= 45 && h <= 75) return "DIVINE"; // Yellow
  if (h > 75 && h <= 160) return "UNCOMMON"; // Green
  if (h > 160 && h <= 200) return "CELESTIAL"; // Cyan / Light Blue
  if (h > 200 && h <= 250) return "RARE"; // Blue
  if (h > 250 && h <= 300) return "ARCANA"; // Purple
  if (h > 300 && h < 345) return "BEYOND"; // Magenta/Pink
  if (h > 20 && h < 45) return "LEGENDARY"; // Orange/Gold
  if (h >= 340 || h <= 20) return "IMMORTAL"; // Red
  
  return "UNKNOWN";
}

async function loadDatabase() {
  try {
      const spriteRes = await fetch('/icons_sprite.png');
      const spriteBlob = await spriteRes.blob();
      const spriteUrl = URL.createObjectURL(spriteBlob);
      const spriteImg = new Image();
      await new Promise((resolve, reject) => {
          spriteImg.onload = resolve;
          spriteImg.onerror = reject;
          spriteImg.src = spriteUrl;
      });

      const mapRes = await fetch('/sprite_map.json');
      const spriteMap = await mapRes.json();
      
      await buildDatabaseFromSprite(spriteImg, spriteMap);
  } catch (e) {
      console.error("Failed to load sprite or map", e);
  }
}

function autoDetectGrid(bgrSrc) {
  // 1. Calculate color variation for all cols and rows (User's Algorithm)
  let colVariations = new Float32Array(bgrSrc.cols);
  for (let x = 0; x < bgrSrc.cols; x++) {
      let variation = 0;
      for (let y = 0; y < bgrSrc.rows - 1; y++) {
          let idx1 = (y * bgrSrc.cols + x) * 3;
          let idx2 = ((y+1) * bgrSrc.cols + x) * 3;
          variation += Math.abs(bgrSrc.data[idx1] - bgrSrc.data[idx2]) + 
                       Math.abs(bgrSrc.data[idx1+1] - bgrSrc.data[idx2+1]) + 
                       Math.abs(bgrSrc.data[idx1+2] - bgrSrc.data[idx2+2]);
      }
      colVariations[x] = variation;
  }

  let rowVariations = new Float32Array(bgrSrc.rows);
  for (let y = 0; y < bgrSrc.rows; y++) {
      let variation = 0;
      for (let x = 0; x < bgrSrc.cols - 1; x++) {
          let idx1 = (y * bgrSrc.cols + x) * 3;
          let idx2 = (y * bgrSrc.cols + x + 1) * 3;
          variation += Math.abs(bgrSrc.data[idx1] - bgrSrc.data[idx2]) + 
                       Math.abs(bgrSrc.data[idx1+1] - bgrSrc.data[idx2+1]) + 
                       Math.abs(bgrSrc.data[idx1+2] - bgrSrc.data[idx2+2]);
      }
      rowVariations[y] = variation;
  }
  
  // 2. Find cell size using Autocorrelation on variations
  let bestDx = 38, minDiffCol = Infinity;
  for (let dx = 30; dx <= 100; dx++) {
      let diff = 0, count = 0;
      for (let x = 0; x < bgrSrc.cols - dx; x++) {
          diff += Math.abs(colVariations[x] - colVariations[x + dx]);
          count++;
      }
      if (count > 0 && diff/count < minDiffCol) { minDiffCol = diff/count; bestDx = dx; }
  }
  
  let bestDy = 38, minDiffRow = Infinity;
  for (let dy = 30; dy <= 100; dy++) {
      let diff = 0, count = 0;
      for (let y = 0; y < bgrSrc.rows - dy; y++) {
          diff += Math.abs(rowVariations[y] - rowVariations[y + dy]);
          count++;
      }
      if (count > 0 && diff/count < minDiffRow) { minDiffRow = diff/count; bestDy = dy; }
  }
  
  let expectedCellSize = Math.min(bestDx, bestDy);
  if (expectedCellSize < 30 || expectedCellSize > 100) expectedCellSize = 38;

  // 3. Find the best phase (startX, startY) that minimizes the total color variation
  let phaseScoresX = new Float32Array(expectedCellSize);
  for (let offset = 0; offset < expectedCellSize; offset++) {
      let score = 0, count = 0;
      for (let x = offset; x < bgrSrc.cols; x += expectedCellSize) {
          score += colVariations[x];
          count++;
      }
      phaseScoresX[offset] = count > 0 ? score/count : Infinity;
  }

  let phaseScoresY = new Float32Array(expectedCellSize);
  for (let offset = 0; offset < expectedCellSize; offset++) {
      let score = 0, count = 0;
      for (let y = offset; y < bgrSrc.rows; y += expectedCellSize) {
          score += rowVariations[y];
          count++;
      }
      phaseScoresY[offset] = count > 0 ? score/count : Infinity;
  }

  function findValleyCenter(scores) {
      let minScore = Infinity;
      let minIdx = 0;
      let n = scores.length;
      for (let i = 0; i < n; i++) {
          if (scores[i] < minScore) { minScore = scores[i]; minIdx = i; }
      }
      let threshold = minScore * 1.5 + (minScore === 0 ? 100 : 0);
      let left = minIdx, right = minIdx;
      while (scores[(left - 1 + n) % n] <= threshold && (minIdx - left) < n/2) left--;
      while (scores[(right + 1) % n] <= threshold && (right - minIdx) < n/2) right++;
      let center = Math.floor((left + right) / 2);
      return (center + n) % n;
  }

  let bestStartX = findValleyCenter(phaseScoresX);
  let bestStartY = findValleyCenter(phaseScoresY);

  return { expectedCellSize, bestStartX, bestStartY };
}

function scanIcons(canvas, scale = 'auto') {
  let debug = { templatesChecked: 0, matchesFound: 0, bestDistFound: Infinity, timeMs: 0, log: [] };
  const startTime = performance.now();
  
  let rawSrc = cv.imread(canvas);
  const rawBgr = new cv.Mat();
  cv.cvtColor(rawSrc, rawBgr, cv.COLOR_RGBA2BGR, 0);
  
  // Use user\'s algorithm to find the entire grid at once!
  let gridInfo = autoDetectGrid(rawBgr);
  let expectedCellSize = gridInfo.expectedCellSize;
  let bestStartX = gridInfo.bestStartX;
  let bestStartY = gridInfo.bestStartY;
  
  scale = expectedCellSize / 38.0;
  
  let candidateCols = [];
  let startX = bestStartX;
  while (startX - expectedCellSize >= 0) startX -= expectedCellSize;
  for (let x = startX; x < rawBgr.cols + 5; x += expectedCellSize) {
      let sumB = 0, sumG = 0, sumR = 0, count = 0;
      for (let dx = -1; dx <= 1; dx++) {
          let nx = x + dx;
          if (nx < 0 || nx >= rawBgr.cols) continue;
          for (let y = 0; y < rawBgr.rows; y++) {
              let idx = (y * rawBgr.cols + nx) * 3;
              sumB += rawBgr.data[idx];
              sumG += rawBgr.data[idx+1];
              sumR += rawBgr.data[idx+2];
              count++;
          }
      }
      candidateCols.push({ pos: x, r: sumR / count, g: sumG / count, b: sumB / count });
  }
  
  let candidateRows = [];
  let startY = bestStartY;
  while (startY - expectedCellSize >= 0) startY -= expectedCellSize;
  for (let y = startY; y < rawBgr.rows + 5; y += expectedCellSize) {
      let sumB = 0, sumG = 0, sumR = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
          let ny = y + dy;
          if (ny < 0 || ny >= rawBgr.rows) continue;
          for (let x = 0; x < rawBgr.cols; x++) {
              let idx = (ny * rawBgr.cols + x) * 3;
              sumB += rawBgr.data[idx];
              sumG += rawBgr.data[idx+1];
              sumR += rawBgr.data[idx+2];
              count++;
          }
      }
      candidateRows.push({ pos: y, r: sumR / count, g: sumG / count, b: sumB / count });
  }
  
  // --- 異なっている線（外れ値）の排除（明るさを無視して色合いだけで比較） ---
  function filterOutliersNormalized(candidateLines, axisName) {
      for (let l of candidateLines) {
          let sum = l.r + l.g + l.b;
          if (sum === 0) { l.nr = 0.333; l.ng = 0.333; l.nb = 0.333; }
          else { l.nr = l.r / sum; l.ng = l.g / sum; l.nb = l.b / sum; }
      }
      
      let nrVals = [...candidateLines].map(l => l.nr).sort((a,b)=>a-b);
      let ngVals = [...candidateLines].map(l => l.ng).sort((a,b)=>a-b);
      let nbVals = [...candidateLines].map(l => l.nb).sort((a,b)=>a-b);
      
      let medNr = nrVals[Math.floor(nrVals.length/2)];
      let medNg = ngVals[Math.floor(ngVals.length/2)];
      let medNb = nbVals[Math.floor(nbVals.length/2)];
      
      let dists = candidateLines.map(l => {
          let dr = l.nr - medNr, dg = l.ng - medNg, db = l.nb - medNb;
          let dist = Math.sqrt(dr*dr + dg*dg + db*db);
          l.dist = dist;
          return dist;
      }).sort((a,b)=>a-b);
      
      let medDist = dists[Math.floor(dists.length/2)];
      // 中央値からの距離の4倍、最低0.10。ただし、ノイズが多くても絶対に0.20を上限とする
      let threshold = Math.max(medDist * 4, 0.10); 
      threshold = Math.min(threshold, 0.20); 
      
      debug.log.push(`\n[${axisName} Lines Analysis]`);
      debug.log.push(`  Median Color: (nr:${medNr.toFixed(3)}, ng:${medNg.toFixed(3)}, nb:${medNb.toFixed(3)})`);
      debug.log.push(`  Median Dist: ${medDist.toFixed(3)}  |  Threshold: ${threshold.toFixed(3)}`);
      
      let kept = [];
      for (let l of candidateLines) {
          let action = l.dist <= threshold ? "KEPT" : "DROP";
          if (l.dist <= threshold) kept.push(l.pos);
          debug.log.push(`  Line at ${l.pos}: RGB(${Math.round(l.r)},${Math.round(l.g)},${Math.round(l.b)}) | nr:${l.nr.toFixed(3)} ng:${l.ng.toFixed(3)} nb:${l.nb.toFixed(3)} | dist: ${l.dist.toFixed(3)} -> ${action}`);
      }
      return kept;
  }

  let nativeCols = filterOutliersNormalized(candidateCols, "Vertical (X)");
  let nativeRows = filterOutliersNormalized(candidateRows, "Horizontal (Y)");

  let finalResults = [];
  const allNames = Object.keys(iconDB);
  
  for (let r = 0; r < nativeRows.length - 1; r++) {
    for (let c = 0; c < nativeCols.length - 1; c++) {
      let cx = nativeCols[c];
      let cy = nativeRows[r];
      
      // Calculate actual width and height in case the last cell is slightly clipped
      let cellW = Math.min(expectedCellSize, rawBgr.cols - cx);
      let cellH = Math.min(expectedCellSize, rawBgr.rows - cy);
      if (cellW <= 0 || cellH <= 0) continue;
      
      let cellRoi = rawBgr.roi(new cv.Rect(cx, cy, cellW, cellH));
      let cellMat = new cv.Mat();
      if (cellW !== expectedCellSize || cellH !== expectedCellSize) {
          // Pad if necessary so we have a full expectedCellSize mat
          cv.copyMakeBorder(cellRoi, cellMat, 0, expectedCellSize - cellH, 0, expectedCellSize - cellW, cv.BORDER_REPLICATE);
      } else {
          cellMat = cellRoi.clone();
      }
      cellRoi.delete();
      
      let cData = cellMat.data;
      let maxR = 0, maxG = 0, maxB = 0;

      // 左から右へ縦一列ずつ色の平均を取り、「灰色じゃなくなった」タイミングか「真っ黒になった」タイミングを探す
      let searchStartY = Math.floor(expectedCellSize * 4 / 38);
      let searchEndY = Math.floor(expectedCellSize * 30 / 38);
      let searchStartX = Math.floor(expectedCellSize * 1 / 38);
      let searchEndX = Math.floor(expectedCellSize * 18 / 38); // 左半分のみ
      
      let bestR = 120, bestG = 120, bestB = 120;
      let debugPoints = [];
      let foundColor = false;
      
      for (let x = searchStartX; x <= searchEndX; x++) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          
          for (let y = searchStartY; y <= searchEndY; y++) {
              let pixel = cellMat.ucharPtr(y, x);
              sumB += pixel[0];
              sumG += pixel[1];
              sumR += pixel[2];
              count++;
          }
          
          if (count > 0) {
              let avgR = sumR / count;
              let avgG = sumG / count;
              let avgB = sumB / count;
              let currLuma = avgR + avgG + avgB;
              
              let maxC = Math.max(avgR, avgG, avgB);
              let minC = Math.min(avgR, avgG, avgB);
              let chroma = maxC - minC;
              
              // 灰色じゃなくなった（彩度があり、暗すぎない）タイミング ＝ 色付きの枠線！
              if (chroma > 20 && maxC > 40) {
                  bestR = avgR; bestG = avgG; bestB = avgB;
                  debugPoints = [{ x: cx + x, y: cy + Math.floor((searchStartY + searchEndY) / 2) }];
                  foundColor = true;
                  break; // 発見したらそこで探査終了
              }
              
              // 色付き枠線が見つかる前に「さらに真っ黒」になった場合 ＝ 内側の黒枠に到達した！
              // つまり色付き枠線が存在しない「コモン（またはアイテムなし）」と判定
              if (maxC < 15) {
                  bestR = 120; bestG = 120; bestB = 120; // コモン扱いにする
                  debugPoints = [{ x: cx + x, y: cy + Math.floor((searchStartY + searchEndY) / 2) }];
                  foundColor = true;
                  break;
              }
          }
      }
      
      // 万が一何も見つからずに通り過ぎた場合の保険
      if (!foundColor) {
          bestR = 120; bestG = 120; bestB = 120;
      }
      
      maxR = Math.round(bestR);
      maxG = Math.round(bestG);
      maxB = Math.round(bestB);
      // スケーリング前の処理
      function nearestGrade(r, g, b) {
    // Determine maximum channel to normalize brightness
    let maxC = Math.max(r, g, b);
    let minC = Math.min(r, g, b);
    let chroma = maxC - minC;
    
    // If the color is completely gray/white (very low chroma) or pure fallback, it is COMMON/CELESTIAL
    if (chroma < 40 || maxC < 20) {
        if (maxC > 180) return 'CELESTIAL';
        return 'COMMON';
    }
    
    // Normalize to max brightness = 255 to ignore shadow effects
    let scale = 255 / Math.max(1, maxC);
    let nr = r * scale;
    let ng = g * scale;
    let nb = b * scale;

    const grades = [
        { name: 'UNCOMMON', r: 50, g: 255, b: 50 },
        { name: 'RARE', r: 50, g: 100, b: 255 },
        { name: 'LEGENDARY', r: 255, g: 150, b: 0 },
        { name: 'IMMORTAL', r: 255, g: 50, b: 50 },
        { name: 'ARCANA', r: 77, g: 23, b: 100 },
        { name: 'BEYOND', r: 255, g: 50, b: 150 },
        { name: 'CELESTIAL', r: 185, g: 227, b: 241 },
        { name: 'DIVINE', r: 255, g: 255, b: 50 }
    ];
    let bestDist = 999999;
    let bestName = 'COMMON';
    for (let g_data of grades) {
        // Normalize the reference colors similarly
        let gmax = Math.max(1, Math.max(g_data.r, g_data.g, g_data.b));
        let gscale = 255 / gmax;
        let gr = g_data.r * gscale;
        let gg = g_data.g * gscale;
        let gb = g_data.b * gscale;
        
        // Emphasize the dominant color difference by squaring the components
        let dr = nr - gr;
        let dg = ng - gg;
        let db = nb - gb;
        let dist = dr*dr + dg*dg + db*db;
        if (dist < bestDist) {
            bestDist = dist;
            bestName = g_data.name;
        }
    }
    return bestName;
}

      let candidateGrade = nearestGrade(maxR, maxG, maxB);
      
      // --- アイテムの有無判定（空セル判定） ---
      // 枠内ほぼすべてのピクセルが「黒から灰色」である時がアイテム無し
      let emptyPixelCount = 0;
      let totalInnerPixels = 0;
      let inStartX = Math.floor(expectedCellSize * 4 / 38);
      let inEndX = Math.floor(expectedCellSize * 34 / 38);
      let inStartY = Math.floor(expectedCellSize * 4 / 38);
      let inEndY = Math.floor(expectedCellSize * 34 / 38);
      
      for (let y = inStartY; y <= inEndY; y++) {
          for (let x = inStartX; x <= inEndX; x++) {
              let p = cellMat.ucharPtr(y, x);
              let maxC = Math.max(p[0], p[1], p[2]);
              let minC = Math.min(p[0], p[1], p[2]);
              let chroma = maxC - minC;
              
              // 「黒から灰色」の定義：明るすぎず（maxC < 150）、色味が少ない（chroma < 30）
              if (maxC < 150 && chroma < 30) {
                  emptyPixelCount++;
              }
              totalInnerPixels++;
          }
      }
      
      // 枠内の90%以上が黒～灰色であればアイテムなしと判定してスキップ
      if (emptyPixelCount > totalInnerPixels * 0.90) {
          finalResults.push({
              rect: { x: cx, y: cy, width: expectedCellSize, height: expectedCellSize },
              debugPoints: debugPoints // 空っぽでも赤い点は表示する
          });
          cellMat.delete();
          continue;
      }
      
      let scaledCellMat = new cv.Mat();
      let trimAmount = Math.round(expectedCellSize * 0.10);
      let roiRect = new cv.Rect(trimAmount, trimAmount, expectedCellSize - trimAmount * 2, expectedCellSize - trimAmount * 2);
      let trimmedCellMat = cellMat.roi(roiRect);
      cv.resize(trimmedCellMat, scaledCellMat, new cv.Size(34, 34), 0, 0, cv.INTER_LINEAR);
      trimmedCellMat.delete();
      let sData = scaledCellMat.data;
      
      let bestGlobalDist = Infinity;
      let bestGlobalName = null;

      for (let i = 0; i < allNames.length; i++) {
        debug.templatesChecked++;
        const name = allNames[i];
        const tData = iconDB[name].bgr.data;
        const mData = iconDB[name].mask.data;
        
        let visiblePixels = 0;
        for (let j = 0; j < 32 * 32; j++) {
            if (mData[j] !== 0) visiblePixels++;
        }
        if (visiblePixels < 20) continue; // Skip empty
        
        let bestMse = Infinity;
        
        for (let dy = 0; dy <= 2; dy++) {
          for (let dx2 = 0; dx2 <= 2; dx2++) {
            let sumSq32 = 0, sumI2_32 = 0, sumT2_32 = 0;
            let sumSq16 = 0, sumI2_16 = 0, sumT2_16 = 0;
            
            // 32x32全体と、左上16x16の両方を同時に計算する
            for (let y = 0; y < 32; y++) {
                let cellY = dy + y;
                let iRow = cellY * 34 * 3;
                let tRow = y * 32 * 3;
                let mRow = y * 32;
                
                for (let x = 0; x < 32; x++) {
                    if (mData[mRow + x] !== 0) {
                        let cellX = dx2 + x;
                        let iIdx = iRow + cellX * 3;
                        let tIdx = tRow + x * 3;
                        
                        let iB = sData[iIdx], iG = sData[iIdx+1], iR = sData[iIdx+2];
                        let tB = tData[tIdx], tG = tData[tIdx+1], tR = tData[tIdx+2];
                        
                        let db = iB - tB;
                        let dg = iG - tG;
                        let dr = iR - tR;
                        
                        let sq = db*db + dg*dg + dr*dr;
                        let i2 = iB*iB + iG*iG + iR*iR;
                        let t2 = tB*tB + tG*tG + tR*tR;
                        
                        sumSq32 += sq;
                        sumI2_32 += i2;
                        sumT2_32 += t2;
                        
                        if (x < 16 && y < 16) {
                            sumSq16 += sq;
                            sumI2_16 += i2;
                            sumT2_16 += t2;
                        }
                    }
                }
            }
            
            let denom32 = Math.sqrt(sumI2_32 * sumT2_32);
            let norm32 = denom32 > 0 ? sumSq32 / denom32 : Infinity;
            
            let denom16 = Math.sqrt(sumI2_16 * sumT2_16);
            let norm16 = denom16 > 0 ? sumSq16 / denom16 : Infinity;
            
            // 左上16x16に何も描かれていないアイテムの場合は全体スコアを採用する
            let avgNorm;
            if (norm16 === Infinity) {
                avgNorm = norm32;
            } else if (norm32 === Infinity) {
                avgNorm = norm16;
            } else {
                avgNorm = (norm32 + norm16) / 2.0;
            }
            
            if (avgNorm < bestMse) {
                bestMse = avgNorm;
            }
          }
        }
        
        if (bestMse < bestGlobalDist) {
            bestGlobalDist = bestMse;
            bestGlobalName = name;
        }
      }
      
      let detectedRarity = 'UNKNOWN';
      if (bestGlobalName) {
          let matchRate = Math.max(0, 100 - (bestGlobalDist / 1.0 * 100));
          
          debug.matchesFound++;
          finalResults.push({
              rect: { x: cx, y: cy, width: expectedCellSize, height: expectedCellSize },
              match: { 
                  name: bestGlobalName, 
                  dist: bestGlobalDist, 
                  matchRate: matchRate, 
                  rarity: candidateGrade,
                  color: `rgb(${maxR},${maxG},${maxB})`
              },
              debugPoints: debugPoints
          });
      }
      
      cellMat.delete();
      scaledCellMat.delete();
    }
  }

  rawBgr.delete();
  rawSrc.delete();
  
  debug.timeMs = Math.round(performance.now() - startTime);
  console.log('Scan completed in ' + debug.timeMs + 'ms. Found ' + debug.matchesFound + ' items.');
  
  return {
      results: finalResults,
      grid: { cols: nativeCols, rows: nativeRows },
      scale: scale,
      debug: debug
  };
}

export { scanIcons, loadDatabase, buildDatabaseFromSprite as buildDatabase };
