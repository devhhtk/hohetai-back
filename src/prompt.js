// prompt.js v3 — 6 Template Architecture
//
// 3 KIDS templates  (Abundant / Endemic / Holotype)
// 3 TWEEN templates (Abundant / Endemic / Holotype)
//
// Dr. Kai provides creature fields → Template provides EVERYTHING ELSE
// Same architecture both modes. Templates are the quality lock.

// ══════════════════════════════════════════════════════════════
// KIDS ENVIRONMENTS
// ══════════════════════════════════════════════════════════════

const KIDS_ENVIRONMENTS = {
  Terratrope:  'Soft warm earth background — gentle round hills and smooth rocks, warm golden light, light puffs of dusty clouds. Muted mineral tones, sage greens, warm stone grays. Calm and grounded.',
  Aquatrope:   'Soft ocean background — gentle teal-blue water with smooth rolling waves, sparkling droplets, cool aqua shimmer. Peaceful and watery.',
  Aerotrope:   'Soft sky background — bright cyan fading to pale turquoise, big fluffy clouds, gentle wind swirls. Open, bright, and airy.',
  Pyrotrope:   'Soft warm background — golden-orange horizon glow, smooth warm clouds, tiny floating embers. Warm and cozy, not hot or scary.',
  Floratrope:  'Soft forest background — gentle green canopy light, curling vines, round mushrooms at edges, tiny glowing pollen dots. Lush and magical.',
  Prismatrope: 'Soft crystal background — gentle turquoise glow, smooth crystal shapes catching rainbow light, soft prismatic beams. Sparkling and wondrous.',
};

// ══════════════════════════════════════════════════════════════
// TWEEN ENVIRONMENTS
// ══════════════════════════════════════════════════════════════

const TWEEN_ENVIRONMENTS = {
  Terratrope:  'Environmentally reflective rocky upland habitat focused on the immediate foreground: weathered boulders, fractured earth, sparse moss, muted mineral tones. Creature positioned on a slightly raised rock ledge. No wide scenic vista, no distant mountains or detailed horizon. Background softly blurred and understated — darker and more muted than the creature so its form and colors pop clearly. Shallow grounded depth of field. Background should feel ancient, heavy, and stone-born.',
  Aquatrope:   'Environmentally reflective tidal-pool / estuary habitat focused on the immediate foreground: slick rocks, shallow rippled water around the creature\'s limbs, a few reeds or algae clusters. Creature positioned low in shallow water or on wet stone. No wide river scene, no distant hills or open water. Any distant background softly blurred and understated — darker and more muted than the creature. Background should feel patient, predatory, and amphibious.',
  Aerotrope:   'Environmentally reflective windswept cliffside habitat focused on the immediate foreground: jagged stone perch beneath the creature, subtle airborne grit or feather-light debris. Creature perched on a rocky ledge or cliff lip. No wide open sky or sweeping cloudscapes. Background is tight dark storm-cloud atmosphere behind the creature — darker and more muted so the creature pops. Background should feel elevated, exposed, and aerodynamic.',
  Pyrotrope:   'Environmentally reflective volcanic habitat focused on the immediate foreground: cracked basalt slab, ash-dusted ground, faint heat shimmer. Creature crouched on dark volcanic rock. No wide lava landscape or dramatic eruptions. Background is dark smoky haze — darker and more muted than the creature. Restrained fissure glow only in immediate ground cracks. Background should feel geothermally active, harsh, and pressurized rather than chaotic.',
  Floratrope:  'Environmentally reflective old-growth forest habitat focused on the immediate foreground: mossy earth, gnarled roots, leaf litter, shelf fungi, ferns at the creature\'s feet. Creature standing on forest floor. No wide forest panorama or detailed canopy. Background is dark dense foliage — darker and more muted than the creature, with softly filtered light. Background should feel ancient, dense, and alive.',
  Prismatrope: 'Environmentally reflective mineral-rich geologic habitat focused on the immediate foreground: streaked stone, exposed crystal seams, fractured deposits around the creature. Creature positioned on a mineral ledge. No wide cave panorama or dramatic crystal cavern. Background is dark geological interior — darker and more muted than the creature, with restrained prismatic edge refractions only. Background should feel rare, geological, and quietly luminous.',
};

// ══════════════════════════════════════════════════════════════
// KIDS TEMPLATES — 3 complete prompts
// Swap: {CREATURE}, {COLORS}, {PATTERNING}, {ENVIRONMENT}
// Template locks: style, framing, eyes, proportions, materials, lighting
// ══════════════════════════════════════════════════════════════

function kidsAbundant(creature, colors, patterning, env) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env} The entire creature must be fully visible within the frame with generous space on all sides — no cropping, no cutoff. Painted creature illustration — detailed with visible artistic painted quality, warm and charming but with real texture and material definition. NOT photorealistic, NOT hyper-detailed, NOT glossy plastic, NOT 3D rendering, NOT colored pencil. Polished and controlled with painterly warmth.

THREE-DIMENSIONAL FORM: Strong three-dimensional volume with a naturally creature-appropriate silhouette — readable head, body, and limbs or fins. Compact and softly rounded with gentle curves and clear separation between head and body. NOT a ball, NOT compressed into a sphere.

CREATURE: ${creature}

FRAMING: Centered with comfortable space on all sides. Full body visible from nose to tail/fin tips. Soft contact shadow on the ground.

PROPORTIONS: Large rounded head about 45-50% of body mass, small body, short limbs/fins, slightly oversized features. Relaxed pose — clearly a Standard/common kid-tier creature.

EYES: Very large, glossy, round. Deep black pupils, warm amber-brown gradient irises. Calm, curious, friendly — NOT scary, NOT predatory.

MATERIAL: Species-appropriate, rendered softly. Fur: fine directional strands. Scales: smooth with subtle bumps. Feathers: soft clustered groups. Fins: semi-translucent with gentle veins. No sharp spikes, no hard armor — everything softened and huggable.

PATTERNING: ${patterning || 'Minimal — soft spots, simple banding, or light mottling, inspired by real animals but simplified.'}

COLOR SYSTEM: ${colors || 'Soft, natural, slightly muted with warm overall feel.'} NOT vivid neon. One or two accent colors only.

LIGHTING: Soft warm light from top-left. Gentle highlight on upper surfaces. Small fuzzy contact shadow. No dramatic rim light.

Must feel three-dimensional, touchable, collectible — a beautiful but approachable Standard creature.`;
}

function kidsEndemic(creature, colors, patterning, env) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env} The entire creature must be fully visible — no cropping. Premium painted creature illustration with RICH, LUMINOUS quality. Saturated colors, beautiful lighting, painterly depth. NOT flat, NOT dull. LUMINOUS, RICH, ALIVE.

THREE-DIMENSIONAL FORM: Strong volume, compact and softly rounded. Clear head/body separation. NOT a ball.

CREATURE: ${creature}

FRAMING: Centered. Full body visible. Soft contact shadow.

PROPORTIONS: Large rounded head ~45-50% of body mass. ENDEMIC rarity — clearly richer than Abundant. ONE defining biological feature visible and beautiful.

EYES: Oversized, glossy, luminous. Deep black pupil, warm amber-gold gradient iris. Calm, curious, friendly — a sense of wonder.

MATERIAL: Rich painted texture — individual scales, fur strands, skin grain with depth and luminosity. Defining feature (crystal, mushroom, coral) must feel GROWN from body, not attached. No jewelry, no armor.

PATTERNING: ${patterning || 'Structured-organic — asymmetrical clustering, soft banding, blotches, or rosettes. Biologically plausible.'}

COLOR SYSTEM: ${colors || 'Enhanced saturation, 3-4 dominant tones.'} Fantasy color from secondary material only. Fur stays earth-toned.

LIGHTING: Beautiful warm lighting with soft glowing highlights. Subtle iridescence on the defining feature.

Must look like PREMIUM FANTASY CARD ART — luminous, rich, atmospheric. Clearly richer than Abundant.`;
}

function kidsHolotype(creature, colors, patterning, env) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env} The entire creature must be fully visible — no cropping. Premium fantasy trading card art — RICH, LUMINOUS, ATMOSPHERIC. Rich saturated colors, dramatic lighting, painterly depth. EXCEPTIONAL detail. NOT flat, NOT dull. LUMINOUS, RICH, ALIVE.

THREE-DIMENSIONAL FORM: Strong volume, anatomically believable. More complex anatomy than lower tiers — multiple animal influences visible and cohesive.

CREATURE: ${creature}

FRAMING: Centered. Full body visible. Soft contact shadow.

PROPORTIONS: Large expressive head ~45-50% of body mass. HOLOTYPE rarity — the rarest, most spectacular specimen. Every surface tells a story.

EYES: Large, glossy, luminous. Deep black pupil, warm amber-gold gradient iris. Calm intelligence, awareness, and dignity.

MATERIAL: EXCEPTIONAL texture — every scale, strand, fin ray individually rendered. Materials MERGE: fur-to-scale transitions, skin-to-mineral veining. All features grown and biologically integrated.

PATTERNING: ${patterning || 'Bold real-animal-kingdom patterns. 30-40% clean rest space between bold markings.'}

COLOR SYSTEM: ${colors || 'Peak natural richness. Rich, striking, saturated.'} Fur stays earth-toned. Richness from pattern complexity and secondary materials.

LIGHTING: Rich dramatic lighting with luminous highlights. Every material catches light differently.

This must look like PREMIUM FANTASY CARD ART — the crown jewel of the bestiary. Luminous, rich, atmospheric, breathtaking.`;
}

// ══════════════════════════════════════════════════════════════
// TWEEN TEMPLATES — 3 complete prompts
// Swap: {CREATURE}, {EYES}, {COLORS}, {PATTERNING}, {ENVIRONMENT}, {NAME}
// Template locks: style, framing, constraints, no-glow, temperament
// ══════════════════════════════════════════════════════════════

function tweenAbundant(creature, eyes, colors, patterning, env, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env}

CREATURE: ${creature}

Eyes ${eyes || 'slightly enlarged (~1.2x) with sharp gloss, intense amber reflections, heavy upper eyelid, narrowed slit pupils — piercing, watchful, predatory'}.

Color palette: ${colors || 'stone grays, muted blues, soft earth tones'}. MUTED NATURAL EARTH TONES only. No vivid, candy, neon, or fantasy colors.

Patterning: ${patterning || 'minimal — faint mottling, soft transitions, subtle scarring'}.

CONSTRAINTS: Nothing emits light — no glow, no luminescence. Territorial predatory expression. Grounded real-animal anatomy only. No xenobiology, no extra eyes, no alien features. Lighting soft and diffused.

Full body visible. ${name}.`;
}

function tweenEndemic(creature, eyes, colors, patterning, env, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env}

CREATURE: ${creature} NOTABLE TIER — a mature alpha displaying peak natural coloration.

Eyes ${eyes || 'slightly enlarged (~1.2x) with sharp gloss, intense coloring — locked on target, fierce, territorial'}.

Color palette: ${colors || 'vivid natural animal coloring'}. VIVID but BIOLOGICALLY BELIEVABLE — think mandarin fish, fire salamander, golden eagle. Richness from biology, not magic.

Patterning: ${patterning || 'bold real-world animal patterning — banding, rosettes, countershading, or warning coloration'}. Horns/spines ~20% larger than standard.

CONSTRAINTS: Nothing emits light — no glow, no luminescence. Richness comes from BIOLOGY only. Territorial predatory expression. Grounded real-animal anatomy. No xenobiology. Lighting soft.

Full body visible. ${name}.`;
}

function tweenHolotype(creature, eyes, colors, patterning, env, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env}

CREATURE: ${creature} EXCEPTIONAL TIER — the apex specimen, a once-in-a-generation alpha. Build is NOTICEABLY MORE ROBUST — thicker limbs, broader chest, heavier skull, wider stance.

Eyes ${eyes || 'LARGER and more expressive (~1.4x natural) — deep warm amber with rich golden ring, carrying intelligence and wisdom alongside power'}.

Color palette: ${colors || 'peak natural richness — rich, striking, defined'}. DEFINED REAL-WORLD PATTERNING at peak. Fur restricted to white/blonde/brown/red-brown/black.

Patterning: ${patterning || 'defined real-world patterning — hexagonal tessellation, precise rosettes, banded coloration'}. 30-40% clean rest space between bold markings. Peak naturalist detail.

CONSTRAINTS: Nothing emits light — no glow, no luminescence. Eyes carry intelligence and wisdom alongside power. Every surface tells a story of age and dominance. Grounded real-animal anatomy. No xenobiology. Lighting soft, diffused.

Full body visible. ${name}.`;
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT — Routes to correct template
// ══════════════════════════════════════════════════════════════

export function buildCreaturePrompt({
  morphologyName = 'Unknown Creature',
  creatureDescription = '',
  creatureName = '',
  origen = 'Resogen',
  trope = 'Terratrope',
  rarity = 'Abundant',
  cardStyle = 'tween',
  kidsFields = null,
  tweenFields = null,
  // Legacy params kept for compatibility but unused by templates
  threatLevel, traits, colorPalette, season, domainOverride, element,
  colorPattern, framingStyle, mutationDesc, flavorText, stats, specimenId,
  timeOfDay, colorCloser,
}) {

  const displayName = (creatureName || morphologyName || 'UNKNOWN').toUpperCase();

  // ══════════════════════════════════════════════════════════
  // KIDS — 3 templates
  // ══════════════════════════════════════════════════════════

  if (cardStyle === 'kids') {
    const env = KIDS_ENVIRONMENTS[trope] || KIDS_ENVIRONMENTS.Terratrope;
    const k = kidsFields || {};
    const creature = k.creature_description || creatureDescription || `A small round ${morphologyName} creature with soft fur and a gentle expression. Compact body, short limbs, sitting calmly.`;
    const colors = k.color_palette || '';
    const patterning = k.patterning || '';

    if (rarity === 'Holotype') return kidsHolotype(creature, colors, patterning, env);
    if (rarity === 'Endemic')  return kidsEndemic(creature, colors, patterning, env);
    return kidsAbundant(creature, colors, patterning, env);
  }

  // ══════════════════════════════════════════════════════════
  // TWEEN — 3 templates
  // ══════════════════════════════════════════════════════════

  const env = TWEEN_ENVIRONMENTS[trope] || TWEEN_ENVIRONMENTS.Terratrope;
  const t = tweenFields || {};
  const creature = t.creature_description || creatureDescription || `A massive ${morphologyName} hybrid creature with grounded anatomy. Heavy sturdy body, functional weight-bearing limbs. Territorial pose, direct stare at viewer.`;
  const eyes = t.eyes || '';
  const colors = t.color_palette || '';
  const patterning = t.patterning || '';

  if (rarity === 'Holotype') return tweenHolotype(creature, eyes, colors, patterning, env, displayName);
  if (rarity === 'Endemic')  return tweenEndemic(creature, eyes, colors, patterning, env, displayName);
  return tweenAbundant(creature, eyes, colors, patterning, env, displayName);
}
