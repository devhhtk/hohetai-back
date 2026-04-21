// rarity.js — Rarity scoring, Trope selection, morphology selection
// LOCKED TAXONOMY: 3 rarities, 6 tropes, 5 origens

import { MORPHOLOGIES, RARITY_TIERS, TROPES, getMorphologiesByTier } from './morphologies.js';

/**
 * Calculate a rarity score (0–100) from audio features.
 */
export function calculateRarityScore(audioFeatures) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    spectralCentroid = 2000,
    zeroCrossingRate = 0.05,
    duration = 2,
    tempo = 100,
    rms = 0.3,
  } = audioFeatures;

  // Three pillars that matter most:
  const durationPillar   = Math.min(duration / 30, 1);                    // 0-1, maxes at 30s
  const complexityPillar = Math.min(zeroCrossingRate / 0.12, 1) * 0.5 +   // ZCR component
                           Math.min(spectralCentroid / 6000, 1) * 0.5;    // spectral component
  const intensityPillar  = energy * 0.5 + Math.min(rms / 0.6, 1) * 0.5;  // energy + loudness

  // Supporting signals (smaller weight)
  const bandDiversity = ((bassEnergy + midEnergy + highEnergy) / 3);
  const tempoBonus = Math.min(tempo / 180, 1) * 0.3;

  // Base score: weighted sum of pillars (0-100 range)
  // Duration: 30%, Complexity: 30%, Intensity: 25%, Supporting: 15%
  const baseScore = (
    durationPillar * 30 +
    complexityPillar * 30 +
    intensityPillar * 25 +
    bandDiversity * 10 +
    tempoBonus * 5
  );

  // TRIFECTA BONUS — Holotype requires ALL THREE pillars strong
  // This ensures you can't get Holotype with just one extreme signal
  const trifectaMin = Math.min(durationPillar, complexityPillar, intensityPillar);
  const trifectaBonus = trifectaMin > 0.6 ? (trifectaMin - 0.6) * 25 : 0; // up to +10 bonus

  // Small jitter for variety (±2 points)
  const jitter = ((energy * 997 + tempo * 31) % 4) - 2;

  return Math.max(0, Math.min(100, baseScore + trifectaBonus + jitter));
}

/**
 * Score → Rarity label (Abundant / Endemic / Holotype)
 */
export function scoreToRarity(score) {
  for (const [rarity, config] of Object.entries(RARITY_TIERS)) {
    if (score >= config.min && score < config.max) return rarity;
  }
  return 'Abundant';
}

/**
 * Get XP reward for a given rarity.
 */
export function getRarityXP(rarity) {
  const rewards = {
    Abundant: 40,
    Endemic: 125,
    Holotype: 450,
  };
  return rewards[rarity] || 40;
}

/**
 * Select a morphology deterministically from audio features.
 */
export function selectMorphology(audioFeatures, rarityLabel) {
  const config = RARITY_TIERS[rarityLabel];
  const candidates = getMorphologiesByTier(config.tiers);

  const {
    energy = 0.5,
    spectralCentroid = 2000,
    bassEnergy = 0.5,
    highEnergy = 0.5,
    zeroCrossingRate = 0.05,
    duration = 5,
    tempo = 100,
    rms = 0.3,
  } = audioFeatures;

  // Use more audio features for better spread — multiply by primes, mod by candidate count
  const hash = Math.abs(
    Math.floor(energy * 997) +
    Math.floor(spectralCentroid * 0.37) +
    Math.floor(bassEnergy * 1013) +
    Math.floor(highEnergy * 769) +
    Math.floor(zeroCrossingRate * 4001) +
    Math.floor(duration * 311) +
    Math.floor(tempo * 127) +
    Math.floor(rms * 2003)
  );
  const idx = hash % candidates.length;

  return candidates[idx];
}

/**
 * Select Trope from audio features.
 * Phase 1: Check 12 acoustic signature overrides (2 per trope)
 * Phase 2: If no override, run 6-trope scoring wheel
 * All features come from server-side FFT extraction — no Meyda proxies needed.
 */
export function selectTrope(audioFeatures, origen = 'Resogen') {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    rms = 0.3,
    brightness = 0.5,
    warmth = 0.5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    zeroCrossingRate = 0.05,
    onsetDensity = 0.5,
    dynamicRange = 0.3,
    spectralCentroid = 2000,
    spectralSpread = 1000,
    spectralRolloff = 2000,
    spectralFlatness = 0.5,
    spectralKurtosis = 0,
    spectralCrest = 1,
    perceptualSharpness = 0.5,
    chromaStrength = 0.5,
    perceptualSpread = 0.5,
  } = audioFeatures;

  // Normalize features that aren't already 0–1
  const centroidNorm = Math.min(1, spectralCentroid / 8000);
  const spreadNorm   = Math.min(1, spectralSpread / 3000);
  const rolloffNorm  = Math.min(1, spectralRolloff / 8000);
  const kurtosisNorm = Math.min(1, Math.max(0, spectralKurtosis / 10));
  const crestNorm    = Math.min(1, spectralCrest / 20);
  const zcrNorm      = Math.min(1, zeroCrossingRate / 0.15);
  const fluxProxy    = Math.min(1, onsetDensity * 0.6 + dynamicRange * 0.4);

  // ═══════════════════════════════════════════════════════════
  const isAudio = origen === 'Resogen' || origen === 'Primogen';
  const overrides = [];

  // Phase 1 Overrides are ONLY for audio sources (as they detect specific waveform patterns)
  if (isAudio) {
    // ── TERRATROPE overrides ──────────────────────────────────
  // 1A: Deep sustained rumble (earthquake, heavy machinery, low growl)
  if (bassEnergy > 0.7 && centroidNorm < 0.2 && rms > 0.5 && dynamicRange < 0.2) {
    overrides.push({ trope: 'Terratrope', confidence: 4, tag: 'deep-rumble' });
  }
  // 1B: Grinding / dragging stone (sustained rough bass, no rhythm)
  if (rms > 0.4 && centroidNorm < 0.25 && roughness > 0.6 && harmonicRatio < 0.3 && onsetDensity < 0.3) {
    overrides.push({ trope: 'Terratrope', confidence: 5, tag: 'grinding-stone' });
  }
  // 1C: Muddy/sludgy earth (broad but grounded, wet soil, swamp)
  if (spreadNorm > 0.5 && centroidNorm < 0.3 && rms > 0.4 && fluxProxy < 0.25) {
    overrides.push({ trope: 'Terratrope', confidence: 4, tag: 'muddy-earth' });
  }

  // ── AQUATROPE overrides ───────────────────────────────────
  // 2A: Running water, rain, ocean waves (broadband, zero transients)
  if (centroidNorm < 0.35 && onsetDensity < 0.15 && perceptualSpread > 0.6 && perceptualSharpness < 0.2) {
    overrides.push({ trope: 'Aquatrope', confidence: 4, tag: 'flowing-water' });
  }
  // 2B: Underwater / whale song (smooth, tonal, quiet, zero harshness)
  if (harmonicRatio > 0.7 && rms < 0.15 && roughness < 0.15 && perceptualSharpness < 0.15) {
    overrides.push({ trope: 'Aquatrope', confidence: 4, tag: 'underwater' });
  }
  // 2C: Bubbling / effervescent (fizzy, spread, moderate energy)
  if (perceptualSpread > 0.6 && fluxProxy > 0.4 && centroidNorm < 0.4 && rms > 0.2 && rms < 0.5) {
    overrides.push({ trope: 'Aquatrope', confidence: 4, tag: 'bubbling' });
  }

  // ── AEROTROPE overrides ───────────────────────────────────
  // 3A: Pure wind / breath (flat spectrum, high frequency, no events)
  if (spectralFlatness > 0.6 && centroidNorm > 0.5 && onsetDensity < 0.15 && rms < 0.2) {
    overrides.push({ trope: 'Aerotrope', confidence: 4, tag: 'wind-breath' });
  }
  // 3B: Whistling / flute (light, diffuse, almost no bass)
  if (centroidNorm > 0.6 && bassEnergy < 0.1 && rms < 0.25 && perceptualSpread > 0.5) {
    overrides.push({ trope: 'Aerotrope', confidence: 4, tag: 'whistle-flute' });
  }
  // 3C: Insect swarm / fluttering wings (erratic, high-pitched, light)
  if (zcrNorm > 0.6 && centroidNorm > 0.5 && rms < 0.25 && dynamicRange > 0.4) {
    overrides.push({ trope: 'Aerotrope', confidence: 4, tag: 'insect-flutter' });
  }

  // ── PYROTROPE overrides ───────────────────────────────────
  // 4A: Crackling fire / sizzling (sharp transients in noisy spectrum)
  if (onsetDensity > 0.6 && perceptualSharpness > 0.6 && dynamicRange > 0.5 && spectralFlatness > 0.4) {
    overrides.push({ trope: 'Pyrotrope', confidence: 4, tag: 'crackling-fire' });
  }
  // 4B: Explosion / roar / distortion (loud, rough, bright, atonal)
  if (rms > 0.7 && roughness > 0.6 && centroidNorm > 0.4 && harmonicRatio < 0.3) {
    overrides.push({ trope: 'Pyrotrope', confidence: 4, tag: 'explosion-roar' });
  }
  // 4C: Electrical crackle / sparks (sharp, bright, peaky but not flat noise)
  if (perceptualSharpness > 0.7 && centroidNorm > 0.5 && fluxProxy > 0.3 && spectralFlatness < 0.4) {
    overrides.push({ trope: 'Pyrotrope', confidence: 4, tag: 'electrical-spark' });
  }

  // ── FLORATROPE overrides ──────────────────────────────────
  // 5A: Gentle acoustic / soft singing / birdsong (organic, tonal, lush)
  if (harmonicRatio > 0.6 && perceptualSharpness < 0.2 && roughness < 0.2 && perceptualSpread > 0.4) {
    overrides.push({ trope: 'Floratrope', confidence: 4, tag: 'organic-tonal' });
  }
  // 5B: Rustling / subtle organic texture (broadband, gentle, no transients)
  if (harmonicRatio > 0.4 && roughness < 0.25 && perceptualSpread > 0.5 && perceptualSharpness < 0.2 && zcrNorm < 0.3) {
    overrides.push({ trope: 'Floratrope', confidence: 4, tag: 'rustling-organic' });
  }

  // ── PRISMATROPE overrides ─────────────────────────────────
  // 6A: Bell / glass chime / crystal bowl (one sharp peak, clean spectrum)
  if (kurtosisNorm > 0.6 && chromaStrength > 0.6 && spectralFlatness < 0.2 && centroidNorm > 0.4) {
    overrides.push({ trope: 'Prismatrope', confidence: 4, tag: 'bell-chime' });
  }
  // 6B: Sustained pure high tone / singing bowl (clean, bright, still)
  if (harmonicRatio > 0.7 && centroidNorm > 0.5 && roughness < 0.1 && onsetDensity < 0.1) {
    overrides.push({ trope: 'Prismatrope', confidence: 4, tag: 'resonance-sustain' });
  }
  // 6C: Shimmering / glassy resonance tail (frost chimes, ice settling)
  if (rolloffNorm > 0.6 && kurtosisNorm > 0.4 && chromaStrength > 0.5 && fluxProxy < 0.2) {
    overrides.push({ trope: 'Prismatrope', confidence: 4, tag: 'shimmer-glass' });
  }

  // ── Check if any override fired ───────────────────────────
  if (overrides.length > 0) {
    // Pick highest confidence — ties broken by first match
    overrides.sort((a, b) => b.confidence - a.confidence);
    console.log(`[Trope] Override: ${overrides[0].trope} (${overrides[0].tag}) | ${overrides.length} total matches`);
    return overrides[0].trope;
  }
}

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: SCORING WHEEL
  // Every trope scored 0–1 against the full feature set
  // Highest score wins — no waterfall priority
  // ═══════════════════════════════════════════════════════════

  const scores = {
    Terratrope:  (1 - centroidNorm) * rms * (1 - perceptualSharpness) * spectralFlatness,

    Aquatrope:   (1 - perceptualSharpness) * perceptualSpread * fluxProxy * (1 - crestNorm),

    Aerotrope:   centroidNorm * (1 - rms) * fluxProxy * perceptualSpread,

    Pyrotrope:   perceptualSharpness * fluxProxy * centroidNorm * spectralFlatness,

    Floratrope:  (chromaStrength / (spectralFlatness + 0.01)) / 10 *  // organicProxy, scaled down
                 perceptualSpread *
                 (1 - roughness) *
                 harmonicRatio *
                 zcrNorm,

    Prismatrope: kurtosisNorm * (1 - spectralFlatness) * chromaStrength * centroidNorm,
  };

  // Find winner
  let bestTrope = 'Terratrope';
  let bestScore = -1;
  for (const [trope, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTrope = trope;
    }
  }

  console.log(`[Trope] Scoring wheel: ${bestTrope} (${bestScore.toFixed(4)}) |`,
    Object.entries(scores).map(([t, s]) => `${t.slice(0,5)}=${s.toFixed(3)}`).join(' '));

  return bestTrope;
}

/**
 * Determine Origen from input type.
 * For now, all audio input = Resogen.
 */
export function selectOrigen(inputType = 'audio') {
  const map = {
    audio: 'Resogen',
    image: 'Imagen',
    video: 'Kinogen',
    multi: 'Synthogen',
    none:  'Primogen',
  };
  return map[inputType] || 'Resogen';
}

/**
 * Generate stats (0–100) from audio features.
 * PWR = physical force, AGI = speed/reflexes, DEF = toughness, ARC = elemental potency
 */
export function generateStats(audioFeatures, rarityScore) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    rms = 0.3,
    onsetDensity = 0.5,
    duration = 5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    brightness = 0.5,
    dynamicRange = 0.3,
    chromaStrength = 0.5,
    tempo = 100,
  } = audioFeatures;

  const rarityBonus = rarityScore * 0.15;
  const tempoNorm = Math.min(1, tempo / 200);
  const durationNorm = Math.min(1, duration / 30);

  return {
    power:   Math.min(100, Math.round((rms * 0.4 + bassEnergy * 0.4 + energy * 0.2) * 80 + rarityBonus)),
    agility: Math.min(100, Math.round((tempoNorm * 0.4 + onsetDensity * 0.3 + (1 - bassEnergy) * 0.3) * 80 + rarityBonus)),
    defense: Math.min(100, Math.round((durationNorm * 0.4 + bassEnergy * 0.3 + roughness * 0.3) * 80 + rarityBonus)),
    arcana:  Math.min(100, Math.round((harmonicRatio * 0.3 + brightness * 0.3 + dynamicRange * 0.2 + chromaStrength * 0.2) * 80 + rarityBonus)),
  };
}

/**
 * Get rarity config (colors, tiers)
 */
export function getRarityConfig(rarityLabel) {
  return RARITY_TIERS[rarityLabel] || RARITY_TIERS.Abundant;
}

/**
 * Full analysis pipeline — returns all creature attributes from audio features.
 */
export function analyzeAudio(audioFeatures, origen = 'Resogen') {
  const score    = calculateRarityScore(audioFeatures);
  const rarity   = scoreToRarity(score);
  const morphology = selectMorphology(audioFeatures, rarity);
  const trope    = selectTrope(audioFeatures, origen);
  const finalOrigen = selectOrigen(origen === 'Imagen' ? 'image' : 'audio');
  const stats    = generateStats(audioFeatures, score);

  return { score, rarity, morphology, trope, origen: finalOrigen, stats };
}
