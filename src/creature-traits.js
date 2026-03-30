// creature-traits.js — Deterministic Creature Trait Calculator
// Audio features → 13 visual traits that define how the creature LOOKS
// Same sound produces the same trait profile EVERY TIME
//
// Traits are passed to Dr. Kai (GPT-4o-mini) who writes the creature description

/**
 * Calculate all creature traits from audio features.
 * Every trait is deterministic — same input, same output.
 *
 * @param {Object} audio — audio features from extraction
 * @returns {Object} — complete creature trait profile
 */
export function calculateTraits(audio) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    spectralCentroid = 2000,
    zeroCrossingRate = 0.05,
    duration = 5,
    tempo = 100,
    rms = 0.3,
    brightness = 0.5,
    warmth = 0.5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    dynamicRange = 0.3,
    onsetDensity = 0.5,
  } = audio;

  // Normalized helpers (0–1 range)
  const complexity = Math.min(zeroCrossingRate / 0.15, 1);
  const spectralNorm = Math.min(spectralCentroid / 8000, 1);

  return {
    // ── 1. EVOLUTION STAGE (duration) ──
    evolutionStage: calcEvolutionStage(duration),

    // ── 2. INTELLIGENCE (complexity + harmonic ratio) ──
    intelligence: calcIntelligence(complexity, harmonicRatio),

    // ── 3. TEMPERAMENT (energy + roughness) ──
    temperament: calcTemperament(energy, roughness, harmonicRatio),

    // ── 4. ECOLOGICAL ROLE (energy + duration + complexity) ──
    ecologicalRole: calcEcologicalRole(energy, duration, complexity),

    // ── 5. SOCIAL BEHAVIOR (onset density + harmonic ratio) ──
    socialBehavior: calcSocialBehavior(onsetDensity, harmonicRatio),

    // ── 6. PHYSICAL MASS (bass energy) ──
    physicalMass: calcPhysicalMass(bassEnergy),

    // ── 7. MOVEMENT STYLE (tempo) ──
    movementStyle: calcMovementStyle(tempo),

    // ── 8. SURFACE TEXTURE (roughness) ──
    surfaceTexture: calcSurfaceTexture(roughness),

    // ── 9. VISIBILITY (spectral brightness) ──
    visibility: calcVisibility(spectralNorm, brightness),

    // ── 10. BIOLUMINESCENCE (harmonic ratio + brightness) ──
    bioluminescence: calcBioluminescence(harmonicRatio, brightness),

    // ── 11. BODY SYMMETRY (onset regularity) ──
    bodySymmetry: calcBodySymmetry(onsetDensity, tempo),

    // ── 12. AGE / WEATHERING (duration + dynamic range) ──
    age: calcAge(duration, dynamicRange),

    // ── 13. EMOTIONAL RANGE (dynamic range) ──
    emotionalRange: calcEmotionalRange(dynamicRange),
  };
}

// ══════════════════════════════════════════════════════════════
// INDIVIDUAL TRAIT CALCULATORS
// All deterministic — same input, same output
// ══════════════════════════════════════════════════════════════

function calcEvolutionStage(duration) {
  if (duration < 3)  return { stage: 'microscopic', label: 'Microbe-scale', sizeDesc: 'tiny, fits on a fingertip' };
  if (duration < 7)  return { stage: 'primitive',   label: 'Primitive',     sizeDesc: 'small, palm-sized' };
  if (duration < 15) return { stage: 'basic',       label: 'Basic',         sizeDesc: 'cat-sized, compact' };
  if (duration < 25) return { stage: 'developed',   label: 'Developed',     sizeDesc: 'dog-sized, substantial' };
  if (duration < 40) return { stage: 'advanced',    label: 'Advanced',      sizeDesc: 'deer-sized, imposing' };
  return               { stage: 'apex',        label: 'Apex',          sizeDesc: 'massive, environment-dominating' };
}

function calcIntelligence(complexity, harmonicRatio) {
  const score = (complexity * 0.6) + (harmonicRatio * 0.4);
  if (score < 0.2) return { level: 'mindless',     eyeDesc: 'vestigial eye spots or no visible eyes, blank expression' };
  if (score < 0.35) return { level: 'basic',        eyeDesc: 'small beady eyes, simple and unaware' };
  if (score < 0.5) return { level: 'reactive',      eyeDesc: 'simple but attentive eyes, alert to stimuli' };
  if (score < 0.65) return { level: 'aware',        eyeDesc: 'clear expressive eyes suggesting a thinking mind' };
  if (score < 0.8) return { level: 'intelligent',   eyeDesc: 'bright alert eyes with visible curiosity and focus' };
  return              { level: 'transcendent', eyeDesc: 'large luminous eyes radiating deep wisdom and ancient understanding' };
}

function calcTemperament(energy, roughness, harmonicRatio) {
  const aggression = (energy * 0.5) + (roughness * 0.3) + ((1 - harmonicRatio) * 0.2);
  if (aggression < 0.25) return { type: 'docile',      poseDesc: 'relaxed and unthreatening, soft body language' };
  if (aggression < 0.45) return { type: 'gentle',      poseDesc: 'calm and approachable, open posture' };
  if (aggression < 0.6)  return { type: 'alert',       poseDesc: 'watchful and ready, weight shifted slightly forward' };
  if (aggression < 0.75) return { type: 'fierce',      poseDesc: 'tense and coiled, muscles visible beneath the surface' };
  return                   { type: 'aggressive',  poseDesc: 'bristling with energy, body angled forward, intense focus' };
}

function calcEcologicalRole(energy, duration, complexity) {
  const power = (energy * 0.4) + (Math.min(duration / 40, 1) * 0.3) + (complexity * 0.3);
  if (power < 0.3)  return { role: 'prey',     roleDesc: 'small and defensive, built for evasion and hiding, compact and low to the ground' };
  if (power < 0.55) return { role: 'forager',   roleDesc: 'resourceful and curious, medium build, adaptable body designed for exploring and gathering' };
  if (power < 0.8)  return { role: 'predator',  roleDesc: 'built to hunt, muscular and focused, sharp features and powerful limbs' };
  return              { role: 'apex',      roleDesc: 'massive and dominant, calm because nothing threatens it, ancient presence and effortless power' };
}

function calcSocialBehavior(onsetDensity, harmonicRatio) {
  const social = (onsetDensity * 0.5) + (harmonicRatio * 0.5);
  if (social < 0.25) return { type: 'solitary',   socialDesc: 'lone creature, self-sufficient, territorial' };
  if (social < 0.5)  return { type: 'pair',       socialDesc: 'bonds with one companion, protective' };
  if (social < 0.75) return { type: 'pack',       socialDesc: 'small group creature, cooperative' };
  return                { type: 'swarm',     socialDesc: 'colony organism, one of many, collective intelligence' };
}

function calcPhysicalMass(bassEnergy) {
  if (bassEnergy < 0.25) return { mass: 'lightweight',  massDesc: 'delicate and lightweight, thin limbs, airy build' };
  if (bassEnergy < 0.5)  return { mass: 'agile',        massDesc: 'lean and agile, balanced proportions, quick' };
  if (bassEnergy < 0.75) return { mass: 'sturdy',       massDesc: 'solid and sturdy, thick limbs, grounded build' };
  return                   { mass: 'massive',      massDesc: 'dense and heavy, thick plating or bulk, immovable presence' };
}

function calcMovementStyle(tempo) {
  if (tempo < 60)  return { style: 'sessile',    moveDesc: 'stationary or barely mobile, rooted, anchored' };
  if (tempo < 90)  return { style: 'lumbering',  moveDesc: 'slow deliberate movement, heavy footfalls' };
  if (tempo < 130) return { style: 'flowing',    moveDesc: 'smooth graceful movement, fluid and continuous' };
  if (tempo < 170) return { style: 'darting',    moveDesc: 'quick bursts of movement, sharp direction changes' };
  return              { style: 'flickering', moveDesc: 'near-instantaneous movement, almost teleporting, blurred edges' };
}

function calcSurfaceTexture(roughness) {
  if (roughness < 0.2) return { texture: 'smooth',      textureDesc: 'smooth glossy skin, sleek membrane, or soft fur' };
  if (roughness < 0.4) return { texture: 'fine',        textureDesc: 'fine-grained scales, soft feathers, or downy coat' };
  if (roughness < 0.6) return { texture: 'textured',    textureDesc: 'visible scales, bark-like patches, or ridged hide' };
  if (roughness < 0.8) return { texture: 'rough',       textureDesc: 'heavy chitinous plates, rough stone-like armor, or coarse spines' };
  return                 { texture: 'jagged',      textureDesc: 'sharp crystalline protrusions, cracked volcanic plating, or razor-edged scales' };
}

function calcVisibility(spectralNorm, brightness) {
  const vis = (spectralNorm * 0.5) + (brightness * 0.5);
  if (vis < 0.3) return { type: 'stealthy',    visDesc: 'muted colors, low-contrast markings, built to blend into surroundings' };
  if (vis < 0.6) return { type: 'balanced',    visDesc: 'natural coloring with some distinctive markings' };
  return           { type: 'bold',        visDesc: 'vivid saturated colors, high-contrast patterns, impossible to miss' };
}

function calcBioluminescence(harmonicRatio, brightness) {
  const glow = (harmonicRatio * 0.6) + (brightness * 0.4);
  if (glow < 0.3) return { intensity: 'none',     glowDesc: 'no visible glow or bioluminescence' };
  if (glow < 0.5) return { intensity: 'faint',    glowDesc: 'faint inner glow visible in dim light, subtle luminous markings' };
  if (glow < 0.7) return { intensity: 'moderate', glowDesc: 'clearly glowing markings and patches, soft light emanating from within' };
  return            { intensity: 'intense', glowDesc: 'intensely bioluminescent, body radiates light, visible glow patterns across the entire form' };
}

function calcBodySymmetry(onsetDensity, tempo) {
  // Regular rhythmic patterns → bilateral symmetry
  // Irregular/chaotic → asymmetric organic forms
  const regularity = (tempo > 60 && tempo < 180) ? (1 - Math.abs(onsetDensity - 0.5) * 2) : 0.3;
  if (regularity > 0.65) return { type: 'bilateral',  symDesc: 'clean bilateral symmetry, mirrored left-right body plan' };
  if (regularity > 0.4)  return { type: 'mostly',     symDesc: 'mostly symmetrical with subtle organic asymmetry' };
  return                    { type: 'asymmetric', symDesc: 'organic asymmetric form, uneven growths, natural irregularity' };
}

function calcAge(duration, dynamicRange) {
  const age = (Math.min(duration / 40, 1) * 0.6) + (dynamicRange * 0.4);
  if (age < 0.25) return { stage: 'juvenile',  ageDesc: 'young and fresh, smooth unblemished surfaces, bright clean colors' };
  if (age < 0.5)  return { stage: 'adult',     ageDesc: 'mature and fully formed, some wear and character in the surface' };
  if (age < 0.75) return { stage: 'elder',     ageDesc: 'old and weathered, scarring and moss, faded markings, experienced presence' };
  return             { stage: 'ancient',  ageDesc: 'primordially ancient, encrusted with age, fossil-like features, timeless' };
}

function calcEmotionalRange(dynamicRange) {
  if (dynamicRange < 0.25) return { range: 'stoic',      emotionDesc: 'stoic and unreadable, minimal expression' };
  if (dynamicRange < 0.5)  return { range: 'calm',       emotionDesc: 'calm and steady, subtle emotional cues' };
  if (dynamicRange < 0.75) return { range: 'expressive', emotionDesc: 'expressive and animated, visible emotional state' };
  return                     { range: 'dramatic',  emotionDesc: 'intensely dramatic presence, every feature communicates emotion' };
}

/**
 * Format traits into a concise description block for Dr. Kai.
 * This is the creature identity card that the AI uses to write the body plan.
 *
 * taxonomy.secondaryMorphology is optional — when present, Dr. Kai
 * uses cross-morphology fusion rules (Rule F5) to merge two body plans.
 */
export function formatTraitsForAI(traits, taxonomy) {
  const secondaryLine = taxonomy.secondaryMorphology
    ? `\nSecondary Morphology: ${taxonomy.secondaryMorphology} (FEATURE DONOR — use cross-morphology fusion rules)`
    : '';

  return `CREATURE IDENTITY PROFILE:
Origen: ${taxonomy.origen}
Trope: ${taxonomy.trope}
Rarity: ${taxonomy.rarity}
Morphology: ${taxonomy.morphologyName}${secondaryLine}
Domain: ${taxonomy.domain}

AUDIO-DERIVED TRAITS:
- Size: ${traits.evolutionStage.label} — ${traits.evolutionStage.sizeDesc}
- Intelligence: ${traits.intelligence.level} — ${traits.intelligence.eyeDesc}
- Temperament: ${traits.temperament.type} — ${traits.temperament.poseDesc}
- Ecological role: ${traits.ecologicalRole.role} — ${traits.ecologicalRole.roleDesc}
- Social: ${traits.socialBehavior.type} — ${traits.socialBehavior.socialDesc}
- Mass: ${traits.physicalMass.mass} — ${traits.physicalMass.massDesc}
- Movement: ${traits.movementStyle.style} — ${traits.movementStyle.moveDesc}
- Surface: ${traits.surfaceTexture.texture} — ${traits.surfaceTexture.textureDesc}
- Visibility: ${traits.visibility.type} — ${traits.visibility.visDesc}
- Bioluminescence: ${traits.bioluminescence.intensity} — ${traits.bioluminescence.glowDesc}
- Symmetry: ${traits.bodySymmetry.type} — ${traits.bodySymmetry.symDesc}
- Age: ${traits.age.stage} — ${traits.age.ageDesc}
- Emotional range: ${traits.emotionalRange.range} — ${traits.emotionalRange.emotionDesc}

COLOR:
- Palette: ${taxonomy.colorPalette.join(', ') || 'warm gold, soft cream, muted blue'}
- Pattern: ${taxonomy.colorPattern || 'natural gradient'}`;
}
