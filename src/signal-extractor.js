// signal-extractor.js — Aumage Server-Side Signal Extraction
// Runs entirely in Cloudflare Workers (no Web Audio API needed)
// Accepts raw audio bytes → returns authoritative signal object
// Phase 1: Resogen (audio) only. Imagen + Kinogen in Phase 2.

// ─────────────────────────────────────────────────────────────
// WAV PARSER
// Extracts PCM samples from WAV file bytes
// ─────────────────────────────────────────────────────────────

function parseWav(buffer) {
  const view = new DataView(buffer);

  // Validate RIFF header
  const riff = String.fromCharCode(
    view.getUint8(0), view.getUint8(1),
    view.getUint8(2), view.getUint8(3)
  );
  if (riff !== 'RIFF') throw new Error('Not a valid WAV file');

  const numChannels  = view.getUint16(22, true);
  const sampleRate   = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  // Find 'data' chunk
  let dataOffset = 36;
  while (dataOffset < buffer.byteLength - 4) {
    const chunkId = String.fromCharCode(
      view.getUint8(dataOffset),     view.getUint8(dataOffset + 1),
      view.getUint8(dataOffset + 2), view.getUint8(dataOffset + 3)
    );
    const chunkSize = view.getUint32(dataOffset + 4, true);
    if (chunkId === 'data') {
      dataOffset += 8;
      break;
    }
    dataOffset += 8 + chunkSize;
  }

  const bytesPerSample = bitsPerSample / 8;
  const totalSamples   = Math.floor((buffer.byteLength - dataOffset) / bytesPerSample / numChannels);
  const samples        = new Float32Array(totalSamples);

  // Mix down to mono, normalize to -1.0 → 1.0
  const maxVal = Math.pow(2, bitsPerSample - 1);
  for (let i = 0; i < totalSamples; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const bytePos = dataOffset + (i * numChannels + ch) * bytesPerSample;
      if (bitsPerSample === 16) {
        sum += view.getInt16(bytePos, true) / maxVal;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(bytePos);
        const b1 = view.getUint8(bytePos + 1);
        const b2 = view.getUint8(bytePos + 2);
        let val = (b2 << 16) | (b1 << 8) | b0;
        if (val >= 0x800000) val -= 0x1000000;
        sum += val / 0x800000;
      } else if (bitsPerSample === 8) {
        sum += (view.getUint8(bytePos) - 128) / 128;
      } else if (bitsPerSample === 32) {
        sum += view.getInt32(bytePos, true) / 0x80000000;
      }
    }
    samples[i] = sum / numChannels;
  }

  return { samples, sampleRate, numChannels, duration: totalSamples / sampleRate };
}

// ─────────────────────────────────────────────────────────────
// FFT — Cooley-Tukey radix-2 iterative
// Pure JS, no dependencies, works in Workers
// ─────────────────────────────────────────────────────────────

function fft(real, imag) {
  const n = real.length;
  if (n <= 1) return;

  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // Cooley-Tukey butterfly
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = real[i + k];
        const uIm = imag[i + k];
        const vRe = real[i + k + len / 2] * curRe - imag[i + k + len / 2] * curIm;
        const vIm = real[i + k + len / 2] * curRe + imag[i + k + len / 2] * curIm;  // fix: was missing sign
        // Fix: proper butterfly
        const tRe = real[i + k + len/2] * curRe - imag[i + k + len/2] * curIm;
        const tIm = real[i + k + len/2] * curIm + imag[i + k + len/2] * curRe;
        real[i + k]           = uRe + tRe;
        imag[i + k]           = uIm + tIm;
        real[i + k + len / 2] = uRe - tRe;
        imag[i + k + len / 2] = uIm - tIm;
        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}

// Apply Hann window to reduce spectral leakage
function applyHannWindow(samples) {
  const n = samples.length;
  const windowed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    windowed[i] = samples[i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
  }
  return windowed;
}

// Next power of 2 for FFT size
function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// ─────────────────────────────────────────────────────────────
// SPECTRUM ANALYSIS
// Runs FFT over overlapping frames, averages the result
// ─────────────────────────────────────────────────────────────

function analyzeSpectrum(samples, sampleRate) {
  const FFT_SIZE   = 2048;
  const HOP_SIZE   = 512;
  const numBins    = FFT_SIZE / 2;
  const binWidth   = sampleRate / FFT_SIZE; // Hz per bin

  const magnitudeSum = new Float64Array(numBins);
  let frameCount = 0;

  // Sliding window analysis
  for (let start = 0; start + FFT_SIZE <= samples.length; start += HOP_SIZE) {
    const frame   = samples.slice(start, start + FFT_SIZE);
    const windowed = applyHannWindow(frame);

    const real = new Float64Array(FFT_SIZE);
    const imag = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) real[i] = windowed[i];

    fft(real, imag);

    for (let i = 0; i < numBins; i++) {
      magnitudeSum[i] += Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    frameCount++;
  }

  if (frameCount === 0) throw new Error('Audio too short for analysis');

  // Average magnitudes across frames
  const magnitudes = new Float64Array(numBins);
  for (let i = 0; i < numBins; i++) {
    magnitudes[i] = magnitudeSum[i] / frameCount;
  }

  return { magnitudes, binWidth, numBins };
}

// ─────────────────────────────────────────────────────────────
// FREQUENCY DOMAIN METRICS
// ─────────────────────────────────────────────────────────────

function computeFrequencyMetrics(magnitudes, binWidth, sampleRate) {
  const numBins     = magnitudes.length;
  const totalEnergy = magnitudes.reduce((s, m) => s + m * m, 0);

  // ── Spectral Centroid ──────────────────────────────────────
  // Weighted mean frequency — "brightness center of mass"
  let weightedSum = 0;
  let magSum      = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    weightedSum += freq * magnitudes[i];
    magSum      += magnitudes[i];
  }
  const spectralCentroid = magSum > 0 ? weightedSum / magSum : 0;

  // ── Spectral Spread ────────────────────────────────────────
  // Standard deviation around centroid — how "wide" the sound is
  let spreadSum = 0;
  for (let i = 0; i < numBins; i++) {
    const freq  = i * binWidth;
    const diff  = freq - spectralCentroid;
    spreadSum  += diff * diff * magnitudes[i];
  }
  const spectralSpread = magSum > 0 ? Math.sqrt(spreadSum / magSum) : 0;

  // ── Spectral Rolloff ───────────────────────────────────────
  // Frequency below which 85% of energy lives
  const rolloffThreshold = 0.85 * magSum;
  let cumMag = 0;
  let spectralRolloff = 0;
  for (let i = 0; i < numBins; i++) {
    cumMag += magnitudes[i];
    if (cumMag >= rolloffThreshold) {
      spectralRolloff = i * binWidth;
      break;
    }
  }

  // ── Band Energy Ratios ─────────────────────────────────────
  // Sub-bass: 20–80Hz | Bass: 80–250Hz | Low-mid: 250–500Hz
  // Mid: 500–2kHz     | High-mid: 2–4kHz | Highs: 4–20kHz
  const bands = {
    subBass:  [20,   80],
    bass:     [80,   250],
    lowMid:   [250,  500],
    mid:      [500,  2000],
    highMid:  [2000, 4000],
    highs:    [4000, 20000],
  };

  const bandEnergy = {};
  let totalBandEnergy = 0;
  for (const [name, [lo, hi]] of Object.entries(bands)) {
    let energy = 0;
    const loIdx = Math.floor(lo / binWidth);
    const hiIdx = Math.min(Math.ceil(hi / binWidth), numBins - 1);
    for (let i = loIdx; i <= hiIdx; i++) {
      energy += magnitudes[i] * magnitudes[i];
    }
    bandEnergy[name] = energy;
    totalBandEnergy += energy;
  }

  // Normalize band energies to 0–1
  const normalizedBands = {};
  for (const [name, energy] of Object.entries(bandEnergy)) {
    normalizedBands[name] = totalBandEnergy > 0 ? energy / totalBandEnergy : 0;
  }

  // ── Brightness ─────────────────────────────────────────────
  // Ratio of energy above 4kHz — pure high-frequency presence
  const brightness = normalizedBands.highs + normalizedBands.highMid * 0.5;

  // ── Warmth ─────────────────────────────────────────────────
  // Ratio of energy in low/bass registers
  const warmth = normalizedBands.subBass + normalizedBands.bass + normalizedBands.lowMid * 0.5;

  // ── Roughness (Spectral Irregularity) ─────────────────────
  // How jagged/unsmooth the spectrum is — high = gritty/distorted
  let irregularity = 0;
  for (let i = 1; i < numBins - 1; i++) {
    const diff = magnitudes[i] - (magnitudes[i-1] + magnitudes[i] + magnitudes[i+1]) / 3;
    irregularity += diff * diff;
  }
  const roughness = magSum > 0 ? Math.min(1, Math.sqrt(irregularity) / magSum) : 0;

  // ── Harmonic Ratio ─────────────────────────────────────────
  // Ratio of harmonic peaks to total energy — high = tonal, low = noisy
  // Find peak and check for harmonics
  let peakBin = 0;
  let peakMag = 0;
  for (let i = 1; i < numBins; i++) {
    if (magnitudes[i] > peakMag) { peakMag = magnitudes[i]; peakBin = i; }
  }

  let harmonicEnergy = 0;
  for (let h = 1; h <= 8; h++) {
    const hBin = peakBin * h;
    if (hBin >= numBins) break;
    // Sum energy in ±2 bins around harmonic
    for (let d = -2; d <= 2; d++) {
      const b = hBin + d;
      if (b >= 0 && b < numBins) harmonicEnergy += magnitudes[b] * magnitudes[b];
    }
  }
  const harmonicRatio = totalEnergy > 0 ? Math.min(1, harmonicEnergy / totalEnergy) : 0;

  // ── Dominant Pitch Class (0–11, chromatic) ─────────────────
  // Which semitone has the most energy — maps to color palette
  const A4 = 440;
  const chromaEnergy = new Float64Array(12);
  for (let i = 1; i < numBins; i++) {
    const freq = i * binWidth;
    if (freq < 60 || freq > 4000) continue;
    const midi    = 69 + 12 * Math.log2(freq / A4);
    const pitchClass = Math.round(midi) % 12;
    if (pitchClass >= 0 && pitchClass < 12) {
      chromaEnergy[pitchClass] += magnitudes[i] * magnitudes[i];
    }
  }
  let dominantPitchClass = 0;
  let maxChroma = 0;
  for (let i = 0; i < 12; i++) {
    if (chromaEnergy[i] > maxChroma) { maxChroma = chromaEnergy[i]; dominantPitchClass = i; }
  }

  // ── Chroma Strength ──────────────────────────────────────
  // How dominant the strongest pitch class is vs total chroma energy
  // High = clear tonal center (chime, bell), Low = diffuse pitch (noise, crowd)
  const totalChroma = chromaEnergy.reduce((s, v) => s + v, 0);
  const chromaStrength = totalChroma > 0 ? maxChroma / totalChroma : 0;

  // ── Spectral Flatness (Wiener Entropy) ────────────────────
  // Geometric mean / arithmetic mean of magnitude spectrum
  // 0 = pure tone (one frequency), 1 = white noise (flat spectrum)
  // Use log for numeric stability: exp(mean(log(mags))) / mean(mags)
  let logSum = 0;
  let linSum = 0;
  let validBins = 0;
  for (let i = 1; i < numBins; i++) {
    const m = magnitudes[i];
    if (m > 1e-10) {
      logSum += Math.log(m);
      linSum += m;
      validBins++;
    }
  }
  const spectralFlatness = validBins > 0 && linSum > 0
    ? Math.exp(logSum / validBins) / (linSum / validBins)
    : 0;

  // ── Spectral Kurtosis ─────────────────────────────────────
  // 4th moment of spectral shape — how "peaky" vs "flat" the spectrum is
  // High = sharp spectral peaks (crystal, bell), Low = smooth/broad spectrum
  let mu4 = 0;
  let mu2 = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    const diff = freq - spectralCentroid;
    const w = magnitudes[i] / (magSum || 1);
    mu2 += diff * diff * w;
    mu4 += diff * diff * diff * diff * w;
  }
  const spectralKurtosis = mu2 > 0 ? (mu4 / (mu2 * mu2)) - 3 : 0;

  // ── Spectral Crest ────────────────────────────────────────
  // Peak magnitude / mean magnitude — how "spiky" vs "flat"
  // High = one dominant frequency (pure tone), Low = spread energy (noise)
  const meanMag = numBins > 0 ? magSum / numBins : 1;
  const spectralCrest = meanMag > 0 ? peakMag / meanMag : 0;

  // ── Perceptual Sharpness ──────────────────────────────────
  // How "cutting" or "piercing" the sound feels
  // Weighted sum of high-frequency energy with increasing weight
  // Based on Zwicker's sharpness model (simplified)
  let sharpNum = 0;
  let sharpDen = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    const bark = 13 * Math.atan(0.00076 * freq) + 3.5 * Math.atan((freq / 7500) * (freq / 7500));
    const weight = bark > 15 ? 0.066 * Math.exp(0.171 * bark) : 1;
    const energy = magnitudes[i] * magnitudes[i];
    sharpNum += energy * weight * bark;
    sharpDen += energy * bark;
  }
  const perceptualSharpness = sharpDen > 0
    ? Math.min(1, (sharpNum / sharpDen - 1) / 3)
    : 0;

  // ── Perceptual Spread ─────────────────────────────────────
  // How "wide" and "full" the sound feels across the frequency range
  // Combines spectral spread with band energy distribution evenness
  // Even energy across bands = wide/full, concentrated = narrow
  const bandValues = Object.values(normalizedBands);
  const bandMean = bandValues.reduce((s, v) => s + v, 0) / bandValues.length;
  const bandVariance = bandValues.reduce((s, v) => s + (v - bandMean) * (v - bandMean), 0) / bandValues.length;
  const bandEvenness = 1 - Math.min(1, Math.sqrt(bandVariance) * 4);
  const spreadNorm = Math.min(1, spectralSpread / 3000);
  const perceptualSpread = spreadNorm * 0.5 + bandEvenness * 0.5;

  return {
    spectralCentroid:    Math.round(spectralCentroid),
    spectralSpread:      Math.round(spectralSpread),
    spectralRolloff:     Math.round(spectralRolloff),
    brightness:          parseFloat(brightness.toFixed(4)),
    warmth:              parseFloat(warmth.toFixed(4)),
    roughness:           parseFloat(roughness.toFixed(4)),
    harmonicRatio:       parseFloat(harmonicRatio.toFixed(4)),
    dominantPitchClass,
    bandEnergy:          Object.fromEntries(
      Object.entries(normalizedBands).map(([k, v]) => [k, parseFloat(v.toFixed(4))])
    ),
    spectralFlatness:    parseFloat(Math.min(1, spectralFlatness).toFixed(4)),
    spectralKurtosis:    parseFloat(Math.max(0, Math.min(20, spectralKurtosis)).toFixed(4)),
    spectralCrest:       parseFloat(Math.min(50, spectralCrest).toFixed(4)),
    perceptualSharpness: parseFloat(Math.max(0, Math.min(1, perceptualSharpness)).toFixed(4)),
    chromaStrength:      parseFloat(chromaStrength.toFixed(4)),
    perceptualSpread:    parseFloat(perceptualSpread.toFixed(4)),
  };
}

// ─────────────────────────────────────────────────────────────
// TIME DOMAIN METRICS
// ─────────────────────────────────────────────────────────────

function computeTimeDomainMetrics(samples, sampleRate) {
  const n = samples.length;

  // ── RMS Energy ─────────────────────────────────────────────
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += samples[i] * samples[i];
  const rms = Math.sqrt(sumSq / n);

  // ── Peak Amplitude ─────────────────────────────────────────
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }

  // ── Zero Crossing Rate ─────────────────────────────────────
  let crossings = 0;
  for (let i = 1; i < n; i++) {
    if ((samples[i] >= 0) !== (samples[i-1] >= 0)) crossings++;
  }
  const zeroCrossingRate = crossings / n;

  // ── Dynamic Range ──────────────────────────────────────────
  // Compare loudest 10% vs quietest 10% of frames (128-sample chunks)
  const FRAME = 128;
  const framePowers = [];
  for (let i = 0; i + FRAME <= n; i += FRAME) {
    let sq = 0;
    for (let j = i; j < i + FRAME; j++) sq += samples[j] * samples[j];
    framePowers.push(sq / FRAME);
  }
  framePowers.sort((a, b) => a - b);
  const p10 = framePowers[Math.floor(framePowers.length * 0.10)] || 0.0001;
  const p90 = framePowers[Math.floor(framePowers.length * 0.90)] || 0.0001;
  const dynamicRange = parseFloat(Math.min(1, p90 / (p10 + 0.0001) / 100).toFixed(4));

  // ── Onset Density ──────────────────────────────────────────
  // Simple energy-flux onset detection — count sudden energy increases
  const HOP = 256;
  let prevEnergy = 0;
  let onsets = 0;
  const onsetThreshold = rms * 1.5;
  for (let i = 0; i + HOP <= n; i += HOP) {
    let energy = 0;
    for (let j = i; j < i + HOP; j++) energy += samples[j] * samples[j];
    energy /= HOP;
    if (energy - prevEnergy > onsetThreshold) onsets++;
    prevEnergy = energy;
  }
  const duration         = n / sampleRate;
  const onsetDensity     = duration > 0 ? parseFloat((onsets / duration).toFixed(4)) : 0;

  // ── BPM Estimate ───────────────────────────────────────────
  // Autocorrelation-based tempo estimation
  // Analyze frames of ~3 seconds, look for periodic onset pattern
  const CORR_FRAME = Math.min(n, sampleRate * 3);
  const energyFrames = [];
  const ENV_HOP = 64;
  for (let i = 0; i + ENV_HOP <= CORR_FRAME; i += ENV_HOP) {
    let e = 0;
    for (let j = i; j < i + ENV_HOP; j++) e += samples[j] * samples[j];
    energyFrames.push(e / ENV_HOP);
  }

  // BPM range: 60–200 → lag range in energy frames
  const minLag = Math.floor(60 / 200 * sampleRate / ENV_HOP);
  const maxLag = Math.floor(60 / 60  * sampleRate / ENV_HOP);
  let bestLag  = minLag;
  let bestCorr = -Infinity;
  for (let lag = minLag; lag <= Math.min(maxLag, energyFrames.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i + lag < energyFrames.length; i++) {
      corr += energyFrames[i] * energyFrames[i + lag];
    }
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
  }
  const bpm = parseFloat((60 / (bestLag * ENV_HOP / sampleRate)).toFixed(1));

  return {
    rms:             parseFloat(rms.toFixed(4)),
    peak:            parseFloat(peak.toFixed(4)),
    zeroCrossingRate: parseFloat(zeroCrossingRate.toFixed(4)),
    dynamicRange,
    onsetDensity,
    bpm:             Math.max(40, Math.min(220, bpm)), // clamp to sane range
    duration:        parseFloat(duration.toFixed(3)),
  };
}

// ─────────────────────────────────────────────────────────────
// CONTEXT ENTROPY LAYER
// Anti-tamper: same audio + different context = different creature
// ─────────────────────────────────────────────────────────────

async function getContextEntropy(request) {
  const now       = new Date();
  const timestamp = now.getTime();

  // Time of day bucket (dawn/day/dusk/night)
  const hour = now.getUTCHours();
  const timeOfDay =
    hour >= 5  && hour < 8  ? 'dawn'  :
    hour >= 8  && hour < 17 ? 'day'   :
    hour >= 17 && hour < 20 ? 'dusk'  : 'night';

  // Season from UTC date
  const month = now.getUTCMonth(); // 0–11
  const season =
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 7 ? 'summer' :
    month >= 8 && month <= 10 ? 'autumn' : 'winter';

  // Location from CF headers (rounded to ~10km grid)
  const rawLat = parseFloat(request.headers.get('CF-IPCountry') ? '0' : '0');
  const cfLat  = parseFloat(request.headers.get('CF-Latitude')  || '0');
  const cfLon  = parseFloat(request.headers.get('CF-Longitude') || '0');
  // Round to nearest 0.1 degree (~11km)
  const lat    = Math.round(cfLat  * 10) / 10;
  const lon    = Math.round(cfLon  * 10) / 10;
  const region = request.headers.get('CF-IPCountry') || 'XX';

  // Weather from Open-Meteo (free, no key)
  let weather = { condition: 'unknown', temperature: 15, windspeed: 0 };
  if (lat !== 0 || lon !== 0) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&forecast_days=1`;
      const resp       = await fetch(weatherUrl, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        const cw   = data.current_weather || {};
        // WMO weather codes → condition string
        const code   = cw.weathercode || 0;
        const condition =
          code === 0               ? 'clear'    :
          code <= 3                ? 'cloudy'   :
          code <= 49               ? 'foggy'    :
          code <= 69               ? 'rainy'    :
          code <= 79               ? 'snowy'    :
          code <= 99               ? 'stormy'   : 'unknown';
        weather = {
          condition,
          temperature: Math.round(cw.temperature ?? 15),
          windspeed:   Math.round(cw.windspeed   ?? 0),
        };
      }
    } catch (_) {
      // Non-fatal — weather is entropy bonus, not required
    }
  }

  return {
    timestamp,
    timeOfDay,
    season,
    lat,
    lon,
    region,
    weather,
  };
}

// ─────────────────────────────────────────────────────────────
// SIGNAL INTELLIGENCE LAYER
// Maps raw metrics → Aumage taxonomy axes
// This is the "routing engine input" — not the routing engine itself
// ─────────────────────────────────────────────────────────────

function buildSignalIntelligence(freqMetrics, timeMetrics, context) {
  const { spectralCentroid, brightness, warmth, roughness, harmonicRatio,
          spectralSpread, bandEnergy, dominantPitchClass } = freqMetrics;
  const { rms, zeroCrossingRate, dynamicRange, onsetDensity, bpm, duration } = timeMetrics;

  // ── Trope Signal (pre-routing shortcut) ───────────────────
  // Sound wins over meaning — acoustic properties determine elemental family
  let tropeSignal = null;
  let tropeStrength = 'none'; // 'strong' | 'weak' | 'none'

  if (bandEnergy.bass > 0.35 && warmth > 0.45) {
    tropeSignal = 'Terratrope'; tropeStrength = bandEnergy.bass > 0.50 ? 'strong' : 'weak';
  } else if (bandEnergy.highs > 0.30 || brightness > 0.35) {
    tropeSignal = 'Aerotrope';  tropeStrength = brightness > 0.50 ? 'strong' : 'weak';
  } else if (rms < 0.08 && zeroCrossingRate < 0.03) {
    tropeSignal = 'Aquatrope';  tropeStrength = 'strong'; // deep, still, flowing
  } else if (rms > 0.75 && dynamicRange < 0.15) {
    tropeSignal = 'Pyrotrope';  tropeStrength = 'strong'; // explosive, compressed
  } else if (harmonicRatio > 0.65 && spectralCentroid < 1500) {
    tropeSignal = 'Floratrope'; tropeStrength = 'weak';   // organic, tonal, warm
  } else if (brightness > 0.25 && roughness < 0.15) {
    tropeSignal = 'Prismatrope'; tropeStrength = 'weak';  // crystalline, clean highs
  }

  // ── ARS Score (Acoustic Rarity Score) 0–1 ─────────────────
  // Higher = better odds for Endemic/Holotype
  const complexity  = Math.min(1, zeroCrossingRate * 15);
  const intensity   = Math.min(1, rms * 2.5);
  const ars         = parseFloat((
    complexity  * 0.25 +
    intensity   * 0.20 +
    harmonicRatio * 0.20 +
    brightness  * 0.15 +
    (Math.min(duration, 10) / 10) * 0.10 +
    roughness   * 0.10
  ).toFixed(4));

  // ── Evolution Stage proxy (0–1) ───────────────────────────
  // Duration + spectral complexity → how "developed" the creature is
  const evolutionProxy = parseFloat(Math.min(1,
    (Math.min(duration, 8) / 8) * 0.5 +
    (spectralSpread / 5000)     * 0.3 +
    ars                          * 0.2
  ).toFixed(4));

  // ── Intelligence proxy (0–1) ──────────────────────────────
  // Timbre complexity + harmonic structure
  const intelligence = parseFloat(Math.min(1,
    harmonicRatio * 0.5 +
    (1 - roughness) * 0.3 +
    (spectralCentroid / 8000) * 0.2
  ).toFixed(4));

  // ── Body Size proxy (0–1) ────────────────────────────────
  // Low frequency mass + amplitude
  const bodySize = parseFloat(Math.min(1,
    warmth * 0.6 +
    (Math.min(rms, 0.8) / 0.8) * 0.4
  ).toFixed(4));

  // ── Surface Texture proxy (0–1) ──────────────────────────
  // Roughness dominant, ZCR secondary
  const surfaceTexture = parseFloat(Math.min(1,
    roughness * 0.6 +
    complexity * 0.4
  ).toFixed(4));

  // ── Pattern Detail proxy (0–1) ────────────────────────────
  // Onset density + spectral complexity
  const patternDetail = parseFloat(Math.min(1,
    Math.min(onsetDensity / 10, 1) * 0.5 +
    (spectralSpread / 5000)        * 0.5
  ).toFixed(4));

  // ── Color Palette (0–11 pitch class → color family) ──────
  const colorPalette = dominantPitchClass;

  // ── Context Easter Egg Modifier ──────────────────────────
  // Encodes time/weather into a modifier that shifts rare thresholds
  const weatherBonus =
    context.weather.condition === 'stormy' ? 0.08  :
    context.weather.condition === 'clear'  ? 0.03  :
    context.weather.condition === 'snowy'  ? 0.05  : 0;
  const timeBonus =
    context.timeOfDay === 'dawn'  ? 0.04 :
    context.timeOfDay === 'night' ? 0.06 : 0;
  const contextModifier = parseFloat(Math.min(0.15, weatherBonus + timeBonus).toFixed(4));

  return {
    tropeSignal,
    tropeStrength,
    ars,
    contextModifier,
    arsAdjusted:     parseFloat(Math.min(1, ars + contextModifier).toFixed(4)),
    evolutionProxy,
    intelligence,
    bodySize,
    surfaceTexture,
    patternDetail,
    colorPalette,
    bpm,
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN EXTRACTION FUNCTION
// ─────────────────────────────────────────────────────────────

export async function extractSignal(audioBuffer, request) {
  // 1. Parse WAV
  let parsed;
  try {
    parsed = parseWav(audioBuffer);
  } catch (e) {
    throw new Error(`Audio parsing failed: ${e.message}`);
  }

  const { samples, sampleRate, duration } = parsed;

  // Sanity check
  if (duration < 0.5) throw new Error('Audio too short (minimum 0.5 seconds)');
  if (duration > 300)  throw new Error('Audio too long (maximum 5 minutes)');

  // Downsample if needed (Workers have CPU limits — cap at 22050Hz for FFT)
  let workSamples = samples;
  let workRate    = sampleRate;
  if (sampleRate > 22050) {
    const ratio     = Math.floor(sampleRate / 22050);
    workSamples     = new Float32Array(Math.floor(samples.length / ratio));
    for (let i = 0; i < workSamples.length; i++) workSamples[i] = samples[i * ratio];
    workRate        = Math.floor(sampleRate / ratio);
  }

  // 2. Run analyses
  const { magnitudes, binWidth, numBins } = analyzeSpectrum(workSamples, workRate);
  const freqMetrics  = computeFrequencyMetrics(magnitudes, binWidth, workRate);
  const timeMetrics  = computeTimeDomainMetrics(workSamples, workRate);

  // 3. Context entropy
  const context      = await getContextEntropy(request);

  // 4. Signal Intelligence
  const intelligence = buildSignalIntelligence(freqMetrics, timeMetrics, context);

  // 5. Assemble final signal object
  return {
    version:     '1.0',
    origen:      'Resogen',
    extractedAt: context.timestamp,
    frequency:   freqMetrics,
    time:        timeMetrics,
    context,
    intelligence,
  };
}
