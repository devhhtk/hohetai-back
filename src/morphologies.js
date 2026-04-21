// morphologies.js — Hoheto Kai Locked Taxonomy
// SECTION 1 — TAXONOMY STACK
// Every creature has exactly: 1 Origen + 1 Trope + 1 Rarity

// ── ORIGENS (5) — How the creature was born ──
export const ORIGENS = {
  Primogen:  { signal: 'none',    desc: 'Pure genesis creature — no input signal required' },
  Resogen:   { signal: 'audio',   desc: 'Born from sound — music, voice, ambient noise' },
  Imagen:    { signal: 'image',   desc: 'Born from a photograph or visual input' },
  Kinogen:   { signal: 'video',   desc: 'Born from video — motion, scene, audio combined' },
  Synthogen: { signal: 'multi',   desc: 'Born from two or more simultaneous input types' },
};

// ── TROPES (6) — The creature's elemental family and domain ──
export const TROPES = {
  Terratrope:  { domain: 'earth',   morphTiers: ['reptile','mammal','terrestrial','invertebrate'], skin: 'Embedded pebbles, mineral deposits, moss, dust aura' },
  Aquatrope:   { domain: 'water',   morphTiers: ['aquatic_shallow','deep_sea','cephalopod'],       skin: 'Wet glistening surface, floating droplets, fluid edges' },
  Aerotrope:   { domain: 'air',     morphTiers: ['avian','arthropod_insect','microbial'],           skin: 'Feather clusters, translucent membranes, charged air' },
  Pyrotrope:   { domain: 'fire',    morphTiers: ['reptile_prehistoric','mammal_prehistoric','mythological'], skin: 'Charred fissures, molten glow, shimmering heat haze' },
  Floratrope:  { domain: 'plant',   morphTiers: ['plant_based','amphibian','hybrid'],               skin: 'Sprouting vines, bark skin, pollen aura, mycelium trails' },
  Prismatrope: { domain: 'crystal', morphTiers: ['microbial','crustacean','aquatic_prehistoric'],    skin: 'Crystal growths, frost facets, refraction membranes' },
};

// ── RARITY (3) — How rare the creature is, driven by ARS ──
export const RARITY_TIERS = {
  Abundant:    { min: 0,  max: 70,  tiers: [1,2,3,4,5],  label: 'Abundant',    color: '#8b9ead', accent: '#a0b4c0' },
  Endemic:     { min: 70, max: 94,  tiers: [6,7,8],       label: 'Endemic',     color: '#c8a870', accent: '#dbb97a' },
  Holotype:    { min: 94, max: 101, tiers: [9,10],         label: 'Holotype',    color: '#d4a0e0', accent: '#e8b8f0' },
};

// ── RARITY PROBABILITY TABLE ──
// Low ARS: Abundant 85%, Endemic 13%, Holotype 2%
// High ARS: Abundant 70%, Endemic 24%, Holotype 6%

// ── TROPE LIST (for selection) ──
export const TROPE_NAMES = [
  'Terratrope', 'Aquatrope', 'Aerotrope', 'Pyrotrope', 'Floratrope', 'Prismatrope',
];

// ── ORIGEN LIST ──
export const ORIGEN_NAMES = [
  'Primogen', 'Resogen', 'Imagen', 'Kinogen', 'Synthogen',
];

// ── MORPHOLOGIES (79 creatures across 10 tiers) ──
export const MORPHOLOGIES = [
  // ── TIER 1 — Abundant (10) ──
  { id: 'flatfish',    name: 'Flatfish',       tier: 1, domain: 'aquatic',      labels: ['SURFACE','HEAD','FINS','TAIL'] },
  { id: 'moth',        name: 'Moth',           tier: 1, domain: 'aerial',       labels: ['WINGS','ANTENNAE','BODY','LEGS'] },
  { id: 'beetle',      name: 'Beetle',         tier: 1, domain: 'terrestrial',  labels: ['HEAD','CARAPACE','LIMBS','WINGS'] },
  { id: 'fern',        name: 'Fern',           tier: 1, domain: 'flora',        labels: ['FRONDS','STEM','ROOTS','SPORES'] },
  { id: 'coral',       name: 'Coral',          tier: 1, domain: 'aquatic',      labels: ['POLYPS','BRANCHES','BASE','TENDRILS'] },
  { id: 'slug',        name: 'Slug',           tier: 1, domain: 'terrestrial',  labels: ['MANTLE','HEAD','FOOT','TENTACLES'] },
  { id: 'minnow',      name: 'Minnow',         tier: 1, domain: 'aquatic',      labels: ['FINS','SCALES','TAIL','GILLS'] },
  { id: 'grub',        name: 'Grub',           tier: 1, domain: 'terrestrial',  labels: ['SEGMENTS','HEAD','LIMBS','TAIL'] },
  { id: 'mushroom',    name: 'Mushroom',       tier: 1, domain: 'flora',        labels: ['CAP','GILLS','STALK','MYCELIUM'] },
  { id: 'guppy',       name: 'Guppy',          tier: 1, domain: 'aquatic',      labels: ['FINS','TAIL','SCALES','EYES'] },

  // ── TIER 2 — Abundant (8) ──
  { id: 'gecko',       name: 'Gecko',          tier: 2, domain: 'terrestrial',  labels: ['HEAD','LIMBS','TAIL','SCALES'] },
  { id: 'dragonfly',   name: 'Dragonfly',      tier: 2, domain: 'aerial',       labels: ['WINGS','EYES','ABDOMEN','LEGS'] },
  { id: 'crayfish',    name: 'Crayfish',       tier: 2, domain: 'aquatic',      labels: ['CLAWS','CARAPACE','ANTENNAE','TAIL'] },
  { id: 'centipede',   name: 'Centipede',      tier: 2, domain: 'terrestrial',  labels: ['HEAD','SEGMENTS','LEGS','MANDIBLES'] },
  { id: 'anemone',     name: 'Sea Anemone',    tier: 2, domain: 'aquatic',      labels: ['TENTACLES','COLUMN','DISC','BASE'] },
  { id: 'mantis',      name: 'Mantis',         tier: 2, domain: 'terrestrial',  labels: ['RAPTORIAL ARMS','WINGS','HEAD','ABDOMEN'] },
  { id: 'toad',        name: 'Toad',           tier: 2, domain: 'terrestrial',  labels: ['SKIN','LIMBS','HEAD','EYES'] },
  { id: 'cactus',      name: 'Cactus',         tier: 2, domain: 'flora',        labels: ['SPINES','PADS','AREOLES','ROOTS'] },

  // ── TIER 3 — Abundant (9) ──
  { id: 'bat',         name: 'Bat',            tier: 3, domain: 'aerial',       labels: ['WINGS','EARS','CLAWS','TAIL'] },
  { id: 'eel',         name: 'Eel',            tier: 3, domain: 'aquatic',      labels: ['HEAD','BODY','FINS','TAIL'] },
  { id: 'mantis_shrimp', name: 'Mantis Shrimp', tier: 3, domain: 'aquatic',    labels: ['RAPTORIAL CLAWS','CARAPACE','EYES','TAIL'] },
  { id: 'axolotl',     name: 'Axolotl',        tier: 3, domain: 'aquatic',      labels: ['GILLS','LIMBS','HEAD','TAIL'] },
  { id: 'pangolin',    name: 'Pangolin',        tier: 3, domain: 'terrestrial', labels: ['SCALES','CLAWS','SNOUT','TAIL'] },
  { id: 'owl',         name: 'Owl',            tier: 3, domain: 'aerial',       labels: ['WINGS','TALONS','DISC','BEAK'] },
  { id: 'venus_trap',  name: 'Venus Flytrap',  tier: 3, domain: 'flora',        labels: ['LOBES','TRIGGER HAIRS','PETIOLE','ROOTS'] },
  { id: 'cuttlefish',  name: 'Cuttlefish',     tier: 3, domain: 'aquatic',      labels: ['MANTLE','TENTACLES','FINS','EYES'] },
  { id: 'scorpion',    name: 'Scorpion',        tier: 3, domain: 'terrestrial', labels: ['PINCERS','STINGER','CARAPACE','LEGS'] },

  // ── TIER 4 — Abundant (8) ──
  { id: 'manta_ray',   name: 'Manta Ray',      tier: 4, domain: 'aquatic',      labels: ['WINGS','CEPHALIC FINS','TAIL','GILLS'] },
  { id: 'chameleon',   name: 'Chameleon',      tier: 4, domain: 'terrestrial',  labels: ['CASQUE','TONGUE','FEET','TAIL'] },
  { id: 'harpy',       name: 'Harpy',          tier: 4, domain: 'aerial',       labels: ['WINGS','TALONS','CREST','BEAK'] },
  { id: 'vampire_squid', name: 'Vampire Squid', tier: 4, domain: 'aquatic',     labels: ['WEBBING','FINS','PHOTOPHORES','ARMS'] },
  { id: 'basilisk',    name: 'Basilisk',        tier: 4, domain: 'terrestrial', labels: ['CREST','SCALES','LIMBS','TAIL'] },
  { id: 'sundew',      name: 'Sundew',          tier: 4, domain: 'flora',       labels: ['TENTACLES','MUCILAGE','LEAF','ROOTS'] },
  { id: 'mimic_octopus', name: 'Mimic Octopus', tier: 4, domain: 'aquatic',    labels: ['ARMS','MANTLE','SUCKERS','EYES'] },
  { id: 'jumping_spider', name: 'Jumping Spider', tier: 4, domain: 'terrestrial', labels: ['EYES','PEDIPALPS','LEGS','ABDOMEN'] },

  // ── TIER 5 — Abundant (8) ──
  { id: 'narwhal',     name: 'Narwhal',         tier: 5, domain: 'aquatic',     labels: ['TUSK','MELON','FLUKES','BODY'] },
  { id: 'glaucus',     name: 'Blue Dragon',     tier: 5, domain: 'aquatic',     labels: ['CERATA','FOOT','HEAD','RHINOPHORES'] },
  { id: 'bio_jelly',   name: 'Bioluminescent Jelly', tier: 5, domain: 'aquatic', labels: ['BELL','TENTACLES','ORAL ARMS','PHOTOPHORES'] },
  { id: 'thunderhawk', name: 'Thunderhawk',     tier: 5, domain: 'aerial',      labels: ['WINGS','TALONS','CREST','TAIL'] },
  { id: 'thornback',   name: 'Thornback',       tier: 5, domain: 'terrestrial', labels: ['SPINES','CARAPACE','LIMBS','TAIL'] },
  { id: 'crystalvine', name: 'Crystal Vine',    tier: 5, domain: 'flora',       labels: ['CRYSTALS','TENDRILS','NODE','ROOTS'] },
  { id: 'wraith_moth', name: 'Wraith Moth',     tier: 5, domain: 'aerial',      labels: ['WINGS','ANTENNAE','EYESPOTS','BODY'] },
  { id: 'archerfish',  name: 'Archerfish',      tier: 5, domain: 'aquatic',     labels: ['SNOUT','FINS','SCALES','TAIL'] },

  // ── TIER 6 — Endemic (7) ──
  { id: 'leviathan_eel', name: 'Leviathan Eel', tier: 6, domain: 'aquatic',    labels: ['MAW','BODY','FINS','TAIL'] },
  { id: 'ember_serpent', name: 'Ember Serpent', tier: 6, domain: 'terrestrial', labels: ['HEAD','SCALES','BODY','TAIL'] },
  { id: 'stormwing',   name: 'Stormwing',       tier: 6, domain: 'aerial',      labels: ['WINGS','WINGTIPS','CREST','TAIL'] },
  { id: 'deepcrawler', name: 'Deepcrawler',     tier: 6, domain: 'aquatic',     labels: ['MANDIBLES','CARAPACE','LIMBS','PHOTOPHORES'] },
  { id: 'voidbloom',   name: 'Voidbloom',       tier: 6, domain: 'flora',       labels: ['PETALS','STAMEN','TENDRILS','ROOTS'] },
  { id: 'ironshell',   name: 'Ironshell',        tier: 6, domain: 'terrestrial', labels: ['SHELL','LIMBS','HEAD','TAIL'] },
  { id: 'resonant_beetle', name: 'Resonant Beetle', tier: 6, domain: 'terrestrial', labels: ['CARAPACE','RESONATORS','LIMBS','MANDIBLES'] },

  // ── TIER 7 — Endemic (7) ──
  { id: 'kraken_spawn', name: 'Kraken Spawn',   tier: 7, domain: 'aquatic',     labels: ['TENTACLES','MANTLE','BEAK','EYES'] },
  { id: 'phoenix_chick', name: 'Phoenix Chick', tier: 7, domain: 'aerial',      labels: ['WINGS','CREST','TAIL FEATHERS','TALONS'] },
  { id: 'shadow_stalker', name: 'Shadow Stalker', tier: 7, domain: 'terrestrial', labels: ['SHADE FORM','CLAWS','EYES','TAIL'] },
  { id: 'aurora_ray',  name: 'Aurora Ray',      tier: 7, domain: 'aquatic',     labels: ['WINGS','CHROMATOPHORES','TAIL','STINGER'] },
  { id: 'stone_colossus', name: 'Stone Colossus', tier: 7, domain: 'terrestrial', labels: ['CARAPACE','LIMBS','CORE','HEAD'] },
  { id: 'tempest_wyrm', name: 'Tempest Wyrm',   tier: 7, domain: 'aerial',      labels: ['WINGS','BODY','TAIL','HEAD'] },
  { id: 'ancient_mycelium', name: 'Ancient Mycelium', tier: 7, domain: 'flora', labels: ['NETWORK','FRUITING BODY','HYPHAE','SPORE SAC'] },

  // ── TIER 8 — Endemic (7) ──
  { id: 'abyssal_leviathan', name: 'Abyssal Leviathan', tier: 8, domain: 'aquatic', labels: ['MAWS','BODY','FINS','TAIL'] },
  { id: 'celestial_hawk', name: 'Celestial Hawk', tier: 8, domain: 'aerial',    labels: ['STAR WINGS','CORONA','TALONS','TAIL'] },
  { id: 'void_carapace', name: 'Void Carapace', tier: 8, domain: 'terrestrial', labels: ['NULL SHELL','LIMBS','VOID CORE','HEAD'] },
  { id: 'primordial_jelly', name: 'Primordial Jelly', tier: 8, domain: 'aquatic', labels: ['BELL','TENDRILS','NUCLEUS','LIGHT ORGANS'] },
  { id: 'world_tree',  name: 'World Tree',      tier: 8, domain: 'flora',        labels: ['CROWN','TRUNK','ROOTS','HEARTWOOD'] },
  { id: 'thunder_titan', name: 'Thunder Titan', tier: 8, domain: 'terrestrial', labels: ['STORM MANE','BODY','CLAWS','TAIL'] },
  { id: 'dream_weaver', name: 'Dream Weaver',   tier: 8, domain: 'aerial',      labels: ['SILK WINGS','SPINNERETS','EYES','BODY'] },

  // ── TIER 9 — Holotype (8) ──
  { id: 'god_whale',   name: 'God Whale',        tier: 9, domain: 'aquatic',    labels: ['FLUKES','BARNACLE CROWN','BALEEN','BODY'] },
  { id: 'star_serpent', name: 'Star Serpent',    tier: 9, domain: 'aerial',     labels: ['CONSTELLATION SCALES','HEAD','BODY','TAIL'] },
  { id: 'ancient_tortoise', name: 'Ancient Tortoise', tier: 9, domain: 'terrestrial', labels: ['WORLD SHELL','LIMBS','HEAD','TAIL'] },
  { id: 'void_blossom', name: 'Void Blossom',    tier: 9, domain: 'flora',      labels: ['NULL PETALS','STAMEN','ROOTS','AURA'] },
  { id: 'aurora_titan', name: 'Aurora Titan',    tier: 9, domain: 'aerial',     labels: ['LIGHT WINGS','CORONA','CLAWS','TAIL'] },
  { id: 'deep_elder',  name: 'Deep Elder',       tier: 9, domain: 'aquatic',    labels: ['TENTACLE CROWN','MANTLE','VOID EYES','BODY'] },
  { id: 'epoch_beetle', name: 'Epoch Beetle',    tier: 9, domain: 'terrestrial', labels: ['TIME CARAPACE','LIMBS','MANDIBLES','AURA'] },
  { id: 'storm_sovereign', name: 'Storm Sovereign', tier: 9, domain: 'aerial', labels: ['LIGHTNING WINGS','CREST','CLAWS','STORM TAIL'] },

  // ── TIER 10 — Holotype (7) ──
  { id: 'omega_leviathan', name: 'Omega Leviathan', tier: 10, domain: 'aquatic', labels: ['VOID MAWS','COSMIC BODY','REALITY FINS','DIMENSIONAL TAIL'] },
  { id: 'chronos_wyrm', name: 'Chronos Wyrm',   tier: 10, domain: 'aerial',     labels: ['TIME WINGS','TEMPORAL BODY','REALITY CLAWS','AEON TAIL'] },
  { id: 'primordial_god', name: 'Primordial God', tier: 10, domain: 'terrestrial', labels: ['DIVINE CARAPACE','VOID LIMBS','WORLD CORE','ETERNAL HEAD'] },
  { id: 'genesis_bloom', name: 'Genesis Bloom', tier: 10, domain: 'flora',      labels: ['CREATION PETALS','REALITY ROOTS','COSMIC STAMEN','VOID AURA'] },
  { id: 'abyssal_sovereign', name: 'Abyssal Sovereign', tier: 10, domain: 'aquatic', labels: ['REALITY TENTACLES','VOID MANTLE','COSMIC EYES','TEMPORAL BODY'] },
  { id: 'eternal_phoenix', name: 'Eternal Phoenix', tier: 10, domain: 'aerial', labels: ['STAR WINGS','COSMIC CREST','VOID TALONS','INFINITY TAIL'] },
  { id: 'world_devourer', name: 'World Devourer', tier: 10, domain: 'terrestrial', labels: ['VOID MAWS','REALITY BODY','COSMIC CLAWS','DIMENSIONAL TAIL'] },
];

export function getMorphologiesByTier(tiers) {
  return MORPHOLOGIES.filter(m => tiers.includes(m.tier));
}

export function getMorphologyById(id) {
  return MORPHOLOGIES.find(m => m.id === id);
}

export function getMorphologyByName(name) {
  return MORPHOLOGIES.find(m => m.name.toLowerCase() === name.toLowerCase());
}
