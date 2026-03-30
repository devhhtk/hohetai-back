// image-extractor.js — Aumage Server-Side Image Feature Extraction
// Runs entirely in Cloudflare Workers (no Canvas, no DOM)
// Accepts raw image bytes → returns visual signal object
// Phase 2: Imagen (image input) pipeline
//
// Supports: PNG (native decode), JPEG (basic header parse + downsampled analysis)

// ─────────────────────────────────────────────────────────────
// PNG DECODER — Pure JS, no dependencies
// Extracts raw RGBA pixel data from PNG files
// Uses DecompressionStream (available in Workers) for inflate
// ─────────────────────────────────────────────────────────────

async function decodePNG(buffer) {
  const view = new DataView(buffer);

  // Validate PNG signature: 137 80 78 71 13 10 26 10
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== sig[i]) throw new Error('Not a valid PNG file');
  }

  // Parse chunks
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];

  while (offset < buffer.byteLength) {
    const chunkLength = view.getUint32(offset);
    const chunkType = String.fromCharCode(
      view.getUint8(offset + 4), view.getUint8(offset + 5),
      view.getUint8(offset + 6), view.getUint8(offset + 7)
    );

    if (chunkType === 'IHDR') {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      bitDepth = view.getUint8(offset + 16);
      colorType = view.getUint8(offset + 17);
    } else if (chunkType === 'IDAT') {
      idatChunks.push(new Uint8Array(buffer, offset + 8, chunkLength));
    } else if (chunkType === 'IEND') {
      break;
    }

    offset += 12 + chunkLength; // 4 length + 4 type + data + 4 crc
  }

  if (width === 0 || height === 0) throw new Error('Invalid PNG: no IHDR');
  if (bitDepth !== 8) throw new Error(`Unsupported PNG bit depth: ${bitDepth} (only 8-bit supported)`);

  // Concatenate IDAT chunks
  const totalSize = idatChunks.reduce((s, c) => s + c.length, 0);
  const compressed = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of idatChunks) {
    compressed.set(chunk, pos);
    pos += chunk.length;
  }

  // Decompress using DecompressionStream (zlib/deflate)
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  // The IDAT chunks together form a standard zlib stream (with header and footer).
  // DecompressionStream('deflate') expects the zlib header.
  writer.write(compressed);
  writer.close();

  const decompressedChunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    decompressedChunks.push(value);
  }
  const decompressedSize = decompressedChunks.reduce((s, c) => s + c.length, 0);
  const decompressed = new Uint8Array(decompressedSize);
  pos = 0;
  for (const chunk of decompressedChunks) {
    decompressed.set(chunk, pos);
    pos += chunk.length;
  }

  // Determine bytes per pixel
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const bpp = channels; // bytes per pixel at 8-bit depth
  const stride = width * bpp + 1; // +1 for filter byte per scanline

  // Unfilter scanlines → raw pixel data
  const pixels = new Uint8Array(width * height * 4); // always output RGBA
  const raw = decompressed;

  for (let y = 0; y < height; y++) {
    const filterType = raw[y * stride];
    const scanStart = y * stride + 1;
    const prevStart = (y - 1) * stride + 1;

    for (let x = 0; x < width * bpp; x++) {
      const i = scanStart + x;
      let val = raw[i];

      // PNG filter reconstruction
      const a = x >= bpp ? raw[i - bpp] : 0;                    // left
      const b = y > 0 ? raw[prevStart + x] : 0;                 // above
      const c = (x >= bpp && y > 0) ? raw[prevStart + x - bpp] : 0; // upper-left

      switch (filterType) {
        case 0: break;                                           // None
        case 1: val = (val + a) & 0xFF; break;                  // Sub
        case 2: val = (val + b) & 0xFF; break;                  // Up
        case 3: val = (val + Math.floor((a + b) / 2)) & 0xFF; break; // Average
        case 4: val = (val + paethPredictor(a, b, c)) & 0xFF; break; // Paeth
      }

      raw[i] = val; // Write back for next row's filter

      // Map to RGBA output
      const px = Math.floor(x / bpp);
      const ch = x % bpp;
      const outIdx = (y * width + px) * 4;

      if (channels === 4) {
        pixels[outIdx + ch] = val;
      } else if (channels === 3) {
        pixels[outIdx + ch] = val;
        if (ch === 2) pixels[outIdx + 3] = 255; // alpha
      } else if (channels === 2) {
        if (ch === 0) { pixels[outIdx] = pixels[outIdx + 1] = pixels[outIdx + 2] = val; }
        if (ch === 1) { pixels[outIdx + 3] = val; }
      } else { // grayscale
        pixels[outIdx] = pixels[outIdx + 1] = pixels[outIdx + 2] = val;
        pixels[outIdx + 3] = 255;
      }
    }
  }

  return { pixels, width, height, channels };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// ─────────────────────────────────────────────────────────────
// VISUAL FEATURE EXTRACTION
// Operates on RGBA pixel array — downsamples for speed
// ─────────────────────────────────────────────────────────────

function extractVisualFeatures(pixels, width, height) {
  // Downsample — analyze every Nth pixel for speed in Workers
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 50000)); // cap at ~50k samples

  // Accumulators
  const hueHist = new Float64Array(360);
  const satHist = new Float64Array(100);
  const lumHist = new Float64Array(100);
  let totalR = 0, totalG = 0, totalB = 0;
  let maxLum = 0, minLum = 1;
  let samples = 0;

  // Edge detection accumulators
  let edgeSum = 0;
  let edgeCount = 0;

  // Symmetry accumulator
  let symDiff = 0;
  let symCount = 0;

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    const r = pixels[idx] / 255;
    const g = pixels[idx + 1] / 255;
    const b = pixels[idx + 2] / 255;

    totalR += r;
    totalG += g;
    totalB += b;

    // RGB → HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (max + min) / 2;

    lumHist[Math.min(99, Math.floor(lum * 100))]++;
    if (lum > maxLum) maxLum = lum;
    if (lum < minLum) minLum = lum;

    let hue = 0, sat = 0;
    if (max !== min) {
      const d = max - min;
      sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) hue = ((b - r) / d + 2) * 60;
      else hue = ((r - g) / d + 4) * 60;
    }

    hueHist[Math.floor(hue) % 360]++;
    satHist[Math.min(99, Math.floor(sat * 100))]++;
    samples++;

    // Simple edge detection — gradient magnitude with right/below neighbor
    const x = i % width;
    const y = Math.floor(i / width);
    if (x < width - 1 && y < height - 1) {
      const rIdx = (i + 1) * 4;
      const bIdx = (i + width) * 4;
      if (rIdx + 2 < pixels.length && bIdx + 2 < pixels.length) {
        const gx = Math.abs(pixels[idx] - pixels[rIdx]) +
          Math.abs(pixels[idx + 1] - pixels[rIdx + 1]) +
          Math.abs(pixels[idx + 2] - pixels[rIdx + 2]);
        const gy = Math.abs(pixels[idx] - pixels[bIdx]) +
          Math.abs(pixels[idx + 1] - pixels[bIdx + 1]) +
          Math.abs(pixels[idx + 2] - pixels[bIdx + 2]);
        edgeSum += Math.sqrt(gx * gx + gy * gy) / (255 * 3);
        edgeCount++;
      }
    }

    // Left-right symmetry check
    const mirrorX = width - 1 - x;
    if (x < width / 2) {
      const mirrorIdx = (y * width + mirrorX) * 4;
      if (mirrorIdx + 2 < pixels.length) {
        symDiff += (Math.abs(pixels[idx] - pixels[mirrorIdx]) +
          Math.abs(pixels[idx + 1] - pixels[mirrorIdx + 1]) +
          Math.abs(pixels[idx + 2] - pixels[mirrorIdx + 2])) / (255 * 3);
        symCount++;
      }
    }
  }

  // ── Compute features ──────────────────────────────────────

  // Color temperature — warm vs cool
  const avgR = totalR / samples;
  const avgG = totalG / samples;
  const avgB = totalB / samples;
  const warmth = Math.min(1, Math.max(0, (avgR - avgB + 0.5)));
  const coolness = 1 - warmth;

  // Mean saturation
  let satSum = 0, satTotal = 0;
  for (let i = 0; i < 100; i++) { satSum += i * satHist[i]; satTotal += satHist[i]; }
  const meanSaturation = satTotal > 0 ? (satSum / satTotal) / 100 : 0;

  // Mean luminance
  let lumSum = 0, lumTotal = 0;
  for (let i = 0; i < 100; i++) { lumSum += i * lumHist[i]; lumTotal += lumHist[i]; }
  const meanLuminance = lumTotal > 0 ? (lumSum / lumTotal) / 100 : 0.5;

  // Luminance contrast / dynamic range
  const luminanceContrast = maxLum - minLum;

  // Luminance distribution — variance
  const lumMean = meanLuminance * 100;
  let lumVar = 0;
  for (let i = 0; i < 100; i++) { lumVar += (i - lumMean) * (i - lumMean) * lumHist[i]; }
  const luminanceVariance = lumTotal > 0 ? Math.sqrt(lumVar / lumTotal) / 50 : 0;

  // Edge density — how "busy" the image is
  const edgeDensity = edgeCount > 0 ? Math.min(1, edgeSum / edgeCount * 3) : 0;

  // Symmetry score (1 = perfectly symmetric, 0 = totally asymmetric)
  const symmetryScore = symCount > 0 ? Math.max(0, 1 - (symDiff / symCount) * 2) : 0.5;

  // Dominant hue (0-360)
  let dominantHue = 0;
  let maxHueCount = 0;
  for (let i = 0; i < 360; i++) {
    if (hueHist[i] > maxHueCount) { maxHueCount = hueHist[i]; dominantHue = i; }
  }

  // Hue spread — how many different hues are significantly present
  const hueThreshold = maxHueCount * 0.1;
  let activeHues = 0;
  for (let i = 0; i < 360; i++) { if (hueHist[i] > hueThreshold) activeHues++; }
  const hueSpread = Math.min(1, activeHues / 180); // 0=monochrome, 1=full rainbow

  // Color complexity — combination of saturation variety and hue spread
  const colorComplexity = Math.min(1, hueSpread * 0.5 + meanSaturation * 0.3 + luminanceVariance * 0.2);

  // Image resolution/size proxy (normalized)
  const resolutionProxy = Math.min(1, Math.sqrt(width * height) / 4000);

  // Texture complexity — edge density is the best proxy
  const textureComplexity = edgeDensity;

  // Object density — high edge density + high saturation = lots of stuff
  const objectDensity = Math.min(1, edgeDensity * 0.6 + colorComplexity * 0.4);

  // Brightness — from mean luminance
  const brightness = meanLuminance;

  return {
    // Core color features
    dominantHue,           // 0-360 degrees
    warmth,                // 0-1 (warm=red-heavy, cool=blue-heavy)
    meanSaturation,        // 0-1
    meanLuminance,         // 0-1
    luminanceContrast,     // 0-1 (dynamic range)
    luminanceVariance,     // 0-1
    hueSpread,             // 0-1 (monochrome to rainbow)
    colorComplexity,       // 0-1

    // Spatial features
    edgeDensity,           // 0-1 (smooth to busy)
    symmetryScore,         // 0-1 (asymmetric to symmetric)
    textureComplexity,     // 0-1 (smooth to detailed)
    objectDensity,         // 0-1 (sparse to dense)

    // Meta
    brightness,            // 0-1
    resolutionProxy,       // 0-1 (tiny to large image)
    width,
    height,
  };
}

// ─────────────────────────────────────────────────────────────
// IMAGE → CREATURE TRAIT MAPPING
// Same 13 traits as audio, driven by visual features
// ─────────────────────────────────────────────────────────────

function mapVisualToCreatureFeatures(visual) {
  const {
    warmth, meanSaturation, meanLuminance, luminanceContrast,
    luminanceVariance, hueSpread, colorComplexity, edgeDensity,
    symmetryScore, textureComplexity, objectDensity, brightness,
    resolutionProxy, dominantHue,
  } = visual;

  // Map to the same feature space that audio uses
  // So creature-traits.js and rarity.js work identically
  return {
    energy: Math.min(1, meanSaturation * 0.5 + luminanceContrast * 0.5),
    bassEnergy: Math.min(1, (1 - brightness) * 0.5 + warmth * 0.3 + (1 - edgeDensity) * 0.2),
    midEnergy: Math.min(1, colorComplexity * 0.5 + hueSpread * 0.5),
    highEnergy: Math.min(1, brightness * 0.5 + edgeDensity * 0.3 + meanSaturation * 0.2),
    spectralCentroid: Math.round(brightness * 6000 + 500),
    zeroCrossingRate: textureComplexity * 0.12,
    duration: resolutionProxy * 25 + 3, // bigger image = more "developed"
    tempo: Math.round(60 + edgeDensity * 120), // busy = fast
    rms: Math.min(1, luminanceContrast * 0.5 + meanSaturation * 0.5),
    brightness: brightness,
    warmth: warmth,
    roughness: textureComplexity,
    harmonicRatio: symmetryScore * 0.6 + (1 - textureComplexity) * 0.4,
    dynamicRange: luminanceVariance,
    onsetDensity: objectDensity * 8,

    // New features for trope scoring wheel
    spectralFlatness: hueSpread * 0.6 + (1 - symmetryScore) * 0.4,
    spectralKurtosis: Math.max(0, (1 - hueSpread) * 10), // narrow hue = peaky
    spectralCrest: Math.max(1, (1 - hueSpread) * 15),
    perceptualSharpness: edgeDensity * 0.6 + luminanceContrast * 0.4,
    chromaStrength: meanSaturation * 0.5 + (1 - hueSpread) * 0.5,
    perceptualSpread: hueSpread * 0.4 + colorComplexity * 0.3 + luminanceVariance * 0.3,
    spectralSpread: Math.round(colorComplexity * 3000),
    spectralRolloff: Math.round(brightness * 6000 + 1000),
  };
}

// ─────────────────────────────────────────────────────────────
// IMAGE TROPE SCORING
// Same scoring wheel as audio but using visual feature mappings
// The selectTrope function in rarity.js handles this —
// we just need to map visual features to the same input space
// ─────────────────────────────────────────────────────────────

// Visual trope hints (used for logging, actual selection uses rarity.js)
function getVisualTropeHint(visual) {
  const { warmth, brightness, edgeDensity, meanSaturation,
    textureComplexity, symmetryScore, luminanceContrast } = visual;

  if (warmth > 0.7 && luminanceContrast > 0.5) return 'Pyrotrope';
  if (brightness > 0.65 && edgeDensity < 0.3) return 'Aerotrope';
  if (warmth < 0.4 && brightness > 0.5 && symmetryScore > 0.6) return 'Prismatrope';
  if (warmth > 0.5 && meanSaturation > 0.4 && textureComplexity > 0.4) return 'Floratrope';
  if (brightness < 0.4 && edgeDensity < 0.4) return 'Aquatrope';
  return 'Terratrope';
}

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE EXTRACTION
// Pull 3 dominant colors for the creature
// ─────────────────────────────────────────────────────────────

function extractColorPalette(pixels, width, height) {
  // Simple k-means-ish: bucket colors into 27 bins (3x3x3 RGB)
  const buckets = new Array(27).fill(null).map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
  const step = Math.max(1, Math.floor(width * height / 20000));

  for (let i = 0; i < width * height; i += step) {
    const idx = i * 4;
    const rBin = Math.min(2, Math.floor(pixels[idx] / 86));
    const gBin = Math.min(2, Math.floor(pixels[idx + 1] / 86));
    const bBin = Math.min(2, Math.floor(pixels[idx + 2] / 86));
    const bin = rBin * 9 + gBin * 3 + bBin;
    buckets[bin].r += pixels[idx];
    buckets[bin].g += pixels[idx + 1];
    buckets[bin].b += pixels[idx + 2];
    buckets[bin].count++;
  }

  // Sort by count, take top 3
  const sorted = buckets
    .filter(b => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(b => {
      const r = Math.round(b.r / b.count);
      const g = Math.round(b.g / b.count);
      const bl = Math.round(b.b / b.count);
      return rgbToColorName(r, g, bl);
    });

  return sorted.length >= 3 ? sorted : ['warm gray', 'soft blue', 'muted gold'];
}

function rgbToColorName(r, g, b) {
  const lum = (r + g + b) / 3;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

  // Low saturation = gray/neutral
  if (sat < 0.15) {
    if (lum > 200) return 'soft white';
    if (lum > 150) return 'pale silver';
    if (lum > 100) return 'warm gray';
    if (lum > 50) return 'slate gray';
    return 'deep charcoal';
  }

  // Determine hue family
  const hue = rgbToHue(r, g, b);

  const prefix = lum > 180 ? 'pale' : lum > 120 ? 'soft' : lum > 70 ? 'rich' : 'deep';

  if (hue < 15 || hue >= 345) return `${prefix} red`;
  if (hue < 35) return `${prefix} orange`;
  if (hue < 65) return `${prefix} gold`;
  if (hue < 80) return `${prefix} yellow`;
  if (hue < 155) return `${prefix} green`;
  if (hue < 185) return `${prefix} teal`;
  if (hue < 250) return `${prefix} blue`;
  if (hue < 290) return `${prefix} purple`;
  if (hue < 345) return `${prefix} magenta`;
  return `${prefix} red`;
}

function rgbToHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return h;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT ENTROPY (shared with audio — import or duplicate)
// ─────────────────────────────────────────────────────────────

async function getImageContextEntropy(request) {
  const now = new Date();
  const timestamp = now.getTime();
  const hour = now.getUTCHours();
  const timeOfDay =
    hour >= 5 && hour < 8 ? 'dawn' :
      hour >= 8 && hour < 17 ? 'day' :
        hour >= 17 && hour < 20 ? 'dusk' : 'night';
  const month = now.getUTCMonth();
  const season =
    month >= 2 && month <= 4 ? 'spring' :
      month >= 5 && month <= 7 ? 'summer' :
        month >= 8 && month <= 10 ? 'autumn' : 'winter';
  const cfLat = parseFloat(request.headers.get('CF-Latitude') || '0');
  const cfLon = parseFloat(request.headers.get('CF-Longitude') || '0');
  const lat = Math.round(cfLat * 10) / 10;
  const lon = Math.round(cfLon * 10) / 10;
  const region = request.headers.get('CF-IPCountry') || 'XX';

  let weather = { condition: 'unknown', temperature: 15, windspeed: 0 };
  if (lat !== 0 || lon !== 0) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&forecast_days=1`;
      const resp = await fetch(weatherUrl, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        const cw = data.current_weather || {};
        const code = cw.weathercode || 0;
        const condition =
          code === 0 ? 'clear' : code <= 3 ? 'cloudy' : code <= 49 ? 'foggy' :
            code <= 69 ? 'rainy' : code <= 79 ? 'snowy' : code <= 99 ? 'stormy' : 'unknown';
        weather = {
          condition,
          temperature: Math.round(cw.temperature ?? 15),
          windspeed: Math.round(cw.windspeed ?? 0),
        };
      }
    } catch (_) { }
  }

  return { timestamp, timeOfDay, season, lat, lon, region, weather };
}

// ─────────────────────────────────────────────────────────────
// SIGNAL INTELLIGENCE — IMAGE VERSION
// Maps visual metrics → Aumage taxonomy axes
// ─────────────────────────────────────────────────────────────

function buildImageIntelligence(visual, creatureFeatures, context) {
  const { warmth, brightness, edgeDensity, meanSaturation,
    textureComplexity, symmetryScore, luminanceContrast,
    hueSpread, colorComplexity, resolutionProxy, dominantHue } = visual;

  const tropeHint = getVisualTropeHint(visual);

  // ARS for images — visual complexity score
  const ars = parseFloat(Math.min(1,
    colorComplexity * 0.25 +
    edgeDensity * 0.20 +
    luminanceContrast * 0.20 +
    meanSaturation * 0.15 +
    resolutionProxy * 0.10 +
    textureComplexity * 0.10
  ).toFixed(4));

  const weatherBonus =
    context.weather.condition === 'stormy' ? 0.08 :
      context.weather.condition === 'clear' ? 0.03 :
        context.weather.condition === 'snowy' ? 0.05 : 0;
  const timeBonus =
    context.timeOfDay === 'dawn' ? 0.04 :
      context.timeOfDay === 'night' ? 0.06 : 0;
  const contextModifier = parseFloat(Math.min(0.15, weatherBonus + timeBonus).toFixed(4));

  return {
    tropeSignal: tropeHint,
    tropeStrength: 'weak', // Image tropes are softer signals than audio
    ars,
    contextModifier,
    arsAdjusted: parseFloat(Math.min(1, ars + contextModifier).toFixed(4)),
    evolutionProxy: resolutionProxy,
    intelligence: parseFloat(Math.min(1, colorComplexity * 0.4 + symmetryScore * 0.3 + edgeDensity * 0.3).toFixed(4)),
    bodySize: parseFloat(Math.min(1, (1 - brightness) * 0.4 + warmth * 0.3 + resolutionProxy * 0.3).toFixed(4)),
    surfaceTexture: parseFloat(textureComplexity.toFixed(4)),
    patternDetail: parseFloat(Math.min(1, edgeDensity * 0.5 + hueSpread * 0.5).toFixed(4)),
    colorPalette: Math.floor(dominantHue / 30) % 12, // Map hue to 0-11 like audio pitch class
    bpm: Math.round(60 + edgeDensity * 120),
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN EXTRACTION FUNCTION
// ─────────────────────────────────────────────────────────────

export async function extractImageSignal(imageBuffer, request) {
  // 1. Detect File Type
  const view = new Uint8Array(imageBuffer);
  const isPng = view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47;
  const isJpeg = view[0] === 0xFF && view[1] === 0xD8;

  if (!isPng) {
    if (isJpeg) {
      throw new Error('Only PNG images are currently supported. Please convert your JPEG to PNG and try again.');
    }
    throw new Error('Unsupported image format. Please upload a valid PNG image.');
  }

  // 2. Decode PNG
  let decoded;
  try {
    decoded = await decodePNG(imageBuffer);
  } catch (e) {
    throw new Error(`PNG decode failed: ${e.message}`);
  }

  const { pixels, width, height } = decoded;
  if (width < 10 || height < 10) throw new Error('Image too small (minimum 10x10)');
  if (width > 10000 || height > 10000) throw new Error('Image too large (maximum 10000x10000)');

  // 2. Extract visual features
  const visual = extractVisualFeatures(pixels, width, height);

  // 3. Map to creature feature space
  const creatureFeatures = mapVisualToCreatureFeatures(visual);

  // 4. Extract color palette
  const colorPalette = extractColorPalette(pixels, width, height);

  // 5. Context entropy
  const context = await getImageContextEntropy(request);

  // 6. Build intelligence
  const intelligence = buildImageIntelligence(visual, creatureFeatures, context);

  // 7. Assemble signal
  return {
    version: '1.0',
    origen: 'Imagen',
    extractedAt: context.timestamp,
    visual,
    creatureFeatures,
    colorPalette,
    context,
    intelligence,
  };
}
