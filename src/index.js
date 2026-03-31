// index.js — Aumage Pipeline Worker v8
// Stage A: /api/generate — Dr. Kai describes creature → image via OpenAI
// Stage B: /api/compose  — card finalization (name + DB update)
// /api/extract — server-side FFT signal extraction + HMAC signing

import { buildCreaturePrompt } from './prompt.js';
import { generateImage } from './openai-image.js';
import { uploadToB2, generateCreatureId } from './storage.js';
import { createCreature, finalizeCreature, getCreature } from './db.js';
import { suggestName } from './sorting-hat.js';
import { handleSaveCard } from './save-card.js';
import { validateGenerateRequest, validateComposeRequest } from './validate.js';
import { analyzeAudio, getRarityConfig, generateStats, selectTrope, selectOrigen } from './rarity.js';
import { getSeasonFromAudio } from './season.js';
import { getMorphologyByName, getMorphologiesByTier, RARITY_TIERS } from './morphologies.js';
import { extractSignal } from './signal-extractor.js';
import { extractImageSignal } from './image-extractor.js';
import { signSignal, verifySignal, isSignalExpired } from './signal-auth.js';
import { calculateTraits, formatTraitsForAI } from './creature-traits.js';
import { describeCreature } from './dr-kai.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function err(message, status = 400) {
  return json({ error: message }, status);
}

/**
 * Verify Supabase JWT and return user ID.
 * This function now optionally verifies the signature if SUPABASE_JWT_SECRET is set,
 * and calls the Supabase Auth API to ensure the user is still active.
 */
async function getAuthUser(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];

  // 1. Quick decode to check payload (stateless)
  let payload;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    payload = JSON.parse(atob(parts[1]));
  } catch (e) {
    return null;
  }

  // 2. Real-time validation with Supabase Auth API
  // This is the most reliable way to check if a user has been deleted or revoked.
  // It works even if we don't have the JWT secret locally.
  try {
    const authUrl = `${env.SUPABASE_URL}/auth/v1/user`;
    const resp = await fetch(authUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY,
      }
    });

    if (!resp.ok) {
      console.warn('[Auth] Token invalid or user deleted/revoked');
      return null;
    }

    const userData = await resp.json();
    return userData.id || payload.sub;
  } catch (e) {
    console.error('[Auth] Real-time validation failed:', e.message);
    // Fall back to stateless if network fails (risky but keeps service up)
    return payload.sub;
  }
}

// ─────────────────────────────────────────────────────────────
// NEW: /api/extract
// Accepts raw WAV audio bytes, runs server-side FFT,
// returns signed signal object
// ─────────────────────────────────────────────────────────────

async function handleExtract(request, env) {
  // Accept raw binary body (WAV bytes)
  let audioBuffer;
  try {
    audioBuffer = await request.arrayBuffer();
  } catch (e) {
    return err('Could not read audio body');
  }

  if (!audioBuffer || audioBuffer.byteLength < 44) {
    return err('Audio body too small — minimum valid WAV is 44 bytes');
  }

  if (audioBuffer.byteLength > 50 * 1024 * 1024) {
    return err('Audio file too large — maximum 50MB');
  }

  // Run extraction
  let signal;
  try {
    signal = await extractSignal(audioBuffer, request);
  } catch (e) {
    return err(`Signal extraction failed: ${e.message}`, 422);
  }

  // Sign the signal
  let signature;
  try {
    signature = await signSignal(signal, env.SIGNAL_SECRET);
  } catch (e) {
    console.error('Signal signing error:', e);
    return err('Signal signing failed', 500);
  }

  return json({
    success: true,
    signal,
    signature,
    expiresIn: 900, // 15 minutes in seconds
  });
}

// ─────────────────────────────────────────────────────────────
// NEW: /api/extract-image
// Accepts raw PNG image bytes, extracts visual features,
// returns signed signal object (Imagen pipeline)
// ─────────────────────────────────────────────────────────────

async function handleExtractImage(request, env) {
  let imageBuffer;
  try {
    imageBuffer = await request.arrayBuffer();
  } catch (e) {
    return err('Could not read image body');
  }

  if (!imageBuffer || imageBuffer.byteLength < 100) {
    return err('Image body too small');
  }

  if (imageBuffer.byteLength > 20 * 1024 * 1024) {
    return err('Image too large — maximum 20MB');
  }

  // Run image extraction
  let signal;
  try {
    signal = await extractImageSignal(imageBuffer, request);
  } catch (e) {
    return err(`Image extraction failed: ${e.message}`, 422);
  }

  console.log('[Image] Extracted |', signal.visual.width, 'x', signal.visual.height,
    '| ARS:', signal.intelligence.arsAdjusted,
    '| Trope hint:', signal.intelligence.tropeSignal);

  // Sign the signal
  let signature;
  try {
    signature = await signSignal(signal, env.SIGNAL_SECRET);
  } catch (e) {
    console.error('Signal signing error:', e);
    return err('Signal signing failed', 500);
  }

  return json({
    success: true,
    signal,
    signature,
    expiresIn: 900,
  });
}

// ─────────────────────────────────────────────────────────────
// STAGE A — /api/generate
// Now requires a valid signed signal when SIGNAL_SECRET is set
// ─────────────────────────────────────────────────────────────

async function handleGenerate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err('Invalid JSON body');
  }

  const validErr = validateGenerateRequest(body);
  if (validErr) return err(validErr);

  const authUserId = await getAuthUser(request, env);
  const { userId: bodyUserId, audioFeatures, traits = [] } = body;
  const userId = authUserId || bodyUserId || 'anonymous';
  let colorPalette = body.colorPalette || [];

  // Flip ENFORCE_SIGNAL to 'true' in wrangler.toml to hard-reject unsigned requests.
  const enforceSignal = env.ENFORCE_SIGNAL === 'true';

  // ── Signal Verification (anti-tamper) ─────────────────────
  const isSignal = body.signal && (body.signal.origen || body.signal.intelligence);

  if (isSignal) {
    // Signal has the expected structure
    if (env.SIGNAL_SECRET && body.signature) {
      // Full HMAC verification when secret is configured
      const valid = await verifySignal(body.signal, body.signature, env.SIGNAL_SECRET);
      if (!valid) {
        return err('Signal signature invalid — request rejected', 401);
      }
      if (isSignalExpired(body.signal)) {
        return err('Signal expired — please re-extract from audio', 401);
      }
      console.log('[v9] Signal verified (HMAC) ✓ | ARS:', body.signal.intelligence?.arsAdjusted);
    } else {
      // Trust signal structure without HMAC (SIGNAL_SECRET not yet configured)
      console.log('[v9] Signal trusted (no HMAC) | ARS:', body.signal.intelligence?.arsAdjusted);
    }
    body._verifiedSignal = body.signal;
  } else if (enforceSignal) {
    return err('Signal required — please call /api/extract first', 401);
  } else if (!body.signal) {
    console.warn('[v9] No signal provided — falling back to client audioFeatures');
  }

  // ── Determine creature attributes (LOCKED TAXONOMY) ─────
  // Every creature: 1 Origen + 1 Trope + 1 Rarity
  let rarity, morphology, trope, origen, stats, season, timeOfDay;

  const verifiedSignal = body._verifiedSignal;

  if (verifiedSignal) {
    const intel = verifiedSignal.intelligence;

    let serverFeatures;

    if (verifiedSignal.origen === 'Imagen') {
      // ── IMAGE SIGNAL — features pre-mapped by image-extractor ──
      serverFeatures = verifiedSignal.creatureFeatures;
      origen = 'Imagen';
      // Use image-extracted color palette if available
      if (verifiedSignal.colorPalette && verifiedSignal.colorPalette.length > 0) {
        colorPalette = verifiedSignal.colorPalette;
      }
      console.log('[v8] Imagen signal | ARS:', intel.arsAdjusted, '| Trope hint:', intel.tropeSignal);
    } else {
      // ── AUDIO SIGNAL — build features from frequency/time metrics ──
      const freq = verifiedSignal.frequency;
      const time = verifiedSignal.time;
      serverFeatures = {
        energy: Math.min(1, time.rms * 2.5),
        bassEnergy: freq.bandEnergy?.bass || freq.warmth * 0.7,
        midEnergy: freq.bandEnergy?.mid || 0.5,
        highEnergy: freq.bandEnergy?.highs || freq.brightness * 0.7,
        spectralCentroid: freq.spectralCentroid,
        zeroCrossingRate: time.zeroCrossingRate,
        duration: time.duration,
        tempo: time.bpm,
        rms: time.rms,
        brightness: freq.brightness,
        warmth: freq.warmth,
        roughness: freq.roughness,
        harmonicRatio: freq.harmonicRatio,
        dynamicRange: time.dynamicRange,
        onsetDensity: time.onsetDensity,
        // New spectral features for trope scoring wheel
        spectralFlatness: freq.spectralFlatness ?? 0.5,
        spectralKurtosis: freq.spectralKurtosis ?? 0,
        spectralCrest: freq.spectralCrest ?? 1,
        perceptualSharpness: freq.perceptualSharpness ?? 0.5,
        chromaStrength: freq.chromaStrength ?? 0.5,
        perceptualSpread: freq.perceptualSpread ?? 0.5,
        spectralSpread: freq.spectralSpread ?? 1000,
        spectralRolloff: freq.spectralRolloff ?? 2000,
      };
      origen = 'Resogen';
    }

    const analysis = analyzeAudio(serverFeatures);
    rarity = analysis.rarity;
    morphology = analysis.morphology;
    trope = analysis.trope;
    if (!origen) origen = analysis.origen;
    stats = generateStats(serverFeatures, parseFloat(intel.arsAdjusted) * 100);
    season = verifiedSignal.context.season;
    timeOfDay = verifiedSignal.context.timeOfDay || 'day';

  } else if (body.rarity && body.morphology) {
    // Pre-processed by frontend
    rarity = body.rarity;
    trope = body.trope || body.audiotropeType || selectTrope(audioFeatures || {});
    origen = body.origen || body.genType || selectOrigen('audio');
    stats = body.stats && Object.keys(body.stats).length > 0 && body.stats.power !== 50
      ? body.stats
      : generateStats(audioFeatures || {}, 50);
    season = body.season || getSeasonFromAudio(audioFeatures || {});
    morphology = getMorphologyByName(body.morphology);
    if (!morphology) {
      morphology = {
        name: body.morphology,
        domain: body.engine?.domain || 'terrestrial',
        tier: 1,
        labels: [],
      };
    }
  } else {
    // Raw audio features — analyze server-side
    const analysis = analyzeAudio(audioFeatures || {});
    rarity = analysis.rarity;
    morphology = analysis.morphology;
    trope = analysis.trope;
    origen = analysis.origen;
    stats = analysis.stats;
    season = getSeasonFromAudio(audioFeatures || {});
  }

  // Ensure we always have valid taxonomy values
  if (!trope) trope = selectTrope(audioFeatures || {});
  if (!origen) origen = selectOrigen('audio');

  const finalTraits = traits.length > 0 ? traits : [
    morphology.domain || 'terrestrial',
    rarity.toLowerCase(),
    trope.toLowerCase().replace('trope', ''),
  ];

  // ── Color pattern + mutation (from frontend engine or empty) ──
  const colorPattern = body.engine?.colorPattern || '';
  const mutationDesc = body.engine?.mutationDesc || '';

  // ── Calculate creature traits from audio ──────────────────
  // When verified signal exists, derive features from it (server authority).
  // Otherwise fall back to client-provided audioFeatures.
  let audioForTraits = {};

  if (body._verifiedSignal) {
    const freq = body._verifiedSignal.frequency || {};
    const time = body._verifiedSignal.time || {};
    audioForTraits = {
      energy: Math.min(1, (time.rms || 0.3) * 2.5),
      bassEnergy: freq.bandEnergy?.bass || (freq.warmth || 0.5) * 0.7,
      midEnergy: freq.bandEnergy?.mid || 0.5,
      highEnergy: freq.bandEnergy?.highs || (freq.brightness || 0.5) * 0.7,
      spectralCentroid: freq.spectralCentroid || 2000,
      zeroCrossingRate: time.zeroCrossingRate || 0.05,
      duration: time.duration || 5,
      tempo: time.bpm || 100,
      rms: time.rms || 0.3,
      brightness: freq.brightness || 0.5,
      warmth: freq.warmth || 0.5,
      roughness: freq.roughness || 0.5,
      harmonicRatio: freq.harmonicRatio || 0.5,
      dynamicRange: time.dynamicRange || 0.3,
      onsetDensity: time.onsetDensity || 0.5,
    };
  } else if (audioFeatures) {
    audioForTraits = {
      energy: audioFeatures.energy || 0.5,
      bassEnergy: audioFeatures.bassEnergy || 0.5,
      midEnergy: audioFeatures.midEnergy || 0.5,
      highEnergy: audioFeatures.highEnergy || 0.5,
      spectralCentroid: audioFeatures.spectralCentroid || 2000,
      zeroCrossingRate: audioFeatures.zeroCrossingRate || 0.05,
      duration: audioFeatures.duration || 5,
      tempo: audioFeatures.tempo || 100,
      rms: audioFeatures.rms || 0.3,
      brightness: audioFeatures.brightness || 0.5,
      warmth: audioFeatures.warmth || 0.5,
      roughness: audioFeatures.roughness || 0.5,
      harmonicRatio: audioFeatures.harmonicRatio || 0.5,
      dynamicRange: audioFeatures.dynamicRange || 0.3,
      onsetDensity: audioFeatures.onsetDensity || 0.5,
    };
  }

  const creatureTraits = calculateTraits(audioForTraits);

  // ── Dr. Kai: Generate creature description ─────────────────
  let drKaiName = '';
  let drKaiFlavorText = '';
  let threatLevel = 25;

  try {
    const traitBlock = formatTraitsForAI(creatureTraits, {
      origen,
      trope,
      rarity,
      morphologyName: morphology.name || body.morphology || 'Unknown Creature',
      domain: morphology.domain || 'terrestrial',
      colorPalette,
      colorPattern,
    });

    const cardStyle = body.cardStyle || 'tween';

    console.log('[v8] Calling Dr. Kai for', morphology.name, '|', trope, '|', rarity, '| Style:', cardStyle);

    const drKai = await describeCreature(traitBlock, env, cardStyle);
    drKaiName = drKai.name;
    drKaiFlavorText = drKai.flavor_text;
    threatLevel = drKai.threat_level;

    // Store structured fields for template-based prompt assembly
    var kidsFields = drKai.kidsFields || null;
    var tweenFields = drKai.tweenFields || null;

    console.log('[v8] Dr. Kai:', drKaiName, '| Threat:', threatLevel, kidsFields ? '| Kids fields: YES' : '', tweenFields ? '| Tween fields: YES' : '');
  } catch (e) {
    console.error('Dr. Kai non-fatal error:', e.message);
    var kidsFields = null;
    var tweenFields = null;
  }

  // ── Build creature prompt (v3 — 6 templates) ──
  const creatureId = crypto.randomUUID();
  const serialId = generateCreatureId();
  const prompt = buildCreaturePrompt({
    morphologyName: morphology.name || body.morphology || 'Unknown Creature',
    creatureName: drKaiName,
    origen,
    trope,
    rarity,
    cardStyle: body.cardStyle || 'tween',
    kidsFields,
    tweenFields,
  });

  console.log('[v8] Prompt built |', origen, '·', trope, '·', rarity, '|', drKaiName || morphology.name, '| Length:', prompt.length);

  // ── Generate creature image ────────────────────────────────
  let imageBytes;
  try {
    imageBytes = await generateImage(prompt, env);
  } catch (e) {
    console.error('Image generation error:', e);
    return err(`Image generation failed: ${e.message}`, 500);
  }

  // ── Upload to B2 ───────────────────────────────────────────
  const creatureFileName = `creatures/${creatureId}-creature.png`;

  let creatureUrl;
  try {
    creatureUrl = await uploadToB2(imageBytes, creatureFileName, 'image/png', env);
  } catch (e) {
    console.error('B2 upload error:', e);
    return err(`Storage upload failed: ${e.message}`, 500);
  }

  // ── Name: Use Dr. Kai's name, fall back to Sorting Hat ─────
  let suggestedName = drKaiName || '';
  let flavorText = drKaiFlavorText || '';

  if (!suggestedName) {
    try {
      const suggestion = await suggestName({
        morphologyName: morphology.name || body.morphology,
        trope,
        origen,
        rarity,
        traits: finalTraits,
        season,
      }, env);
      suggestedName = suggestion.name;
      flavorText = suggestion.flavor_text || flavorText;
    } catch (e) {
      console.log('Sorting Hat non-fatal error:', e.message);
    }
  }

  // ── Save to Supabase ───────────────────────────────────────
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isUUID) {
    console.warn('[v9] Invalid user_id format:', userId);
    // If not a UUID, database will reject it. We must ensure we have a valid UUID.
    // In production, we should probably reject this or use a fallback if schema allows.
  }

  try {
    const intel = verifiedSignal?.intelligence || {};
    const ctx = verifiedSignal?.context || {};

    await createCreature(env, {
      creature_id: creatureId,
      serial_number: serialId,
      userId: isUUID ? userId : null,
      creature_url: creatureUrl,
      image_url: creatureUrl,
      rarity,
      morphology: morphology.name || body.morphology,
      tier: morphology.tier || '1',
      domain: morphology.domain || 'terrestrial',
      trope,
      origen,
      ars: intel.arsAdjusted || 0.5,
      element: deriveElement(verifiedSignal || {}),
      region: ctx.region || 'Unknown',
      climate: ctx.weather?.condition || 'Temperate',
      season,
      traits: finalTraits,
      stats,
      flavorText,
      creature_name: suggestedName,
      prompt_text: prompt,
      prompt_hash: `p-${creatureId.slice(0, 8)}`,
      waveform_hash: `w-${creatureId.slice(0, 8)}`,
      features: verifiedSignal?.intelligence || {},
      visuals: verifiedSignal?.visual || {},
      audio_source: verifiedSignal?.origen === 'Imagen' ? 'upload' : 'record',
      fingerprint: body.fingerprint || null,
      seed: body.seed || null,
      mode: body.mode || 'creature',
      style: body.cardStyle || 'realistic',
      is_public: body.is_public !== undefined ? body.is_public : true,
      frame_variant: body.frame_variant || 'standard',
    });
  } catch (e) {
    console.error('Supabase error:', e);
    return err(`Database Save Failed: ${e.message}`, 500);
  }

  // Response uses locked taxonomy: origen · trope · rarity
  return json({
    success: true,
    id: creatureId,
    creature_id: creatureId,
    creature_url: creatureUrl,
    rarity,
    morphology: morphology.name || body.morphology,
    trope,
    origen,
    threat_level: threatLevel,
    creature_traits: {
      evolution: creatureTraits.evolutionStage?.label,
      intelligence: creatureTraits.intelligence?.level,
      temperament: creatureTraits.temperament?.type,
      ecological_role: creatureTraits.ecologicalRole?.role,
      social: creatureTraits.socialBehavior?.type,
      mass: creatureTraits.physicalMass?.mass,
      movement: creatureTraits.movementStyle?.style,
      texture: creatureTraits.surfaceTexture?.texture,
      visibility: creatureTraits.visibility?.type,
      bioluminescence: creatureTraits.bioluminescence?.intensity,
      symmetry: creatureTraits.bodySymmetry?.type,
      age: creatureTraits.age?.stage,
      emotion: creatureTraits.emotionalRange?.range,
    },
    // Legacy fields for frontend compatibility
    audiotrope_type: trope,
    gen_type: origen,
    traits: finalTraits,
    stats,
    flavor_text: flavorText,
    suggested_name: suggestedName,
    season,
    labels: morphology.labels || [],
    signal_verified: !!verifiedSignal,
    // Debug — Dr. Kai output + FULL IMAGE PROMPT (visible in browser console)
    _debug: {
      drKaiDescription: kidsFields ? JSON.stringify(kidsFields).slice(0, 500) : (tweenFields ? JSON.stringify(tweenFields).slice(0, 500) : ''),
      drKaiName: suggestedName,
      imagePrompt: prompt || '',
      promptLength: prompt?.length || 0,
      trope,
      origen,
      rarity,
      morphology: morphology.name,
      threatLevel,
      cardStyle: body.cardStyle || 'NOT SET',
      kidsMode: !!kidsFields,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// STAGE B — /api/compose
// ─────────────────────────────────────────────────────────────

async function handleCompose(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err('Invalid JSON body');
  }

  const validErr = validateComposeRequest(body);
  if (validErr) return err(validErr);

  const {
    creature_id,
    creature_url,
    creature_name,
    userId,
    rarity = 'Common',
    morphology = '',
    audiotrope_type = '',
    traits = [],
    stats = { power: 50, agility: 50, defense: 50, arcana: 50 },
    flavor_text = '',
    season = 'spring',
    labels = [],
  } = body;

  const authUserId = await getAuthUser(request, env);
  const effectiveUserId = authUserId || userId;

  const trimmedName = creature_name.trim();

  try {
    await finalizeCreature(env, creature_id, {
      creature_name: trimmedName,
      card_url: '',
    });
  } catch (e) {
    console.error('Supabase finalize error (non-fatal):', e);
  }

  return json({
    success: true,
    creature_id,
    creature_name: trimmedName,
  });
}

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

function handleHealth(env) {
  const checks = {
    worker: 'ok',
    browser: env.BROWSER ? 'bound' : 'MISSING',
    // replicate removed — using openai-image.js directly
    openai: env.OPENAI_API_KEY ? 'configured' : 'MISSING — add OPENAI_API_KEY',
    b2: env.B2_KEY_ID ? 'configured' : 'MISSING',
    supabase: env.SUPABASE_URL ? 'configured' : 'MISSING',
    signalSecret: env.SIGNAL_SECRET ? 'configured' : 'MISSING — add via wrangler secret put SIGNAL_SECRET',
    enforceSignal: env.ENFORCE_SIGNAL || 'false',
    environment: env.ENVIRONMENT || 'unknown',
    version: 'v8.0.0',
  };
  return json({ status: 'ok', checks });
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/health') {
      return handleHealth(env);
    }

    // NEW: Signal extraction endpoint
    if (url.pathname === '/api/extract' && method === 'POST') {
      return handleExtract(request, env);
    }

    // NEW: Image signal extraction endpoint
    if (url.pathname === '/api/extract-image' && method === 'POST') {
      return handleExtractImage(request, env);
    }

    if (url.pathname === '/api/generate' && method === 'POST') {
      return handleGenerate(request, env);
    }

    if (url.pathname === '/api/compose' && method === 'POST') {
      return handleCompose(request, env);
    }

    if (url.pathname.startsWith('/api/creatures/') && method === 'GET') {
      const creatureId = url.pathname.replace('/api/creatures/', '');
      try {
        const creature = await getCreature(env, creatureId);
        if (!creature) return err('Creature not found', 404);
        return json(creature);
      } catch (e) {
        return err(`Failed to fetch creature: ${e.message}`, 500);
      }
    }

    if (url.pathname === '/api/save-card' && method === 'POST') {
      return handleSaveCard(request, env);
    }
    
    const imagePath = url.pathname.replace('/api/image/', '');
    // Image proxy
    if (url.pathname.startsWith('/api/image/') && method === 'GET') {
      const bucket = env.B2_BUCKET_NAME || 'aumage-cards';
      const b2Url = `https://f005.backblazeb2.com/file/${bucket}/${imagePath}`;
      try {
        const resp = await fetch(b2Url);
        if (!resp.ok) return json({ error: 'Image not found' }, 404);
        const headers = new Headers(resp.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000');
        return new Response(resp.body, { status: 200, headers });
      } catch (e) {
        return json({ error: 'Image proxy failed' }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};

/**
 * Derive element name from verified signal features.
 * Maps audio characteristics to the 8-element system.
 */
function deriveElement(signal) {
  const freq = signal.frequency || {};
  const time = signal.time || {};

  const warmth = freq.warmth || 0.5;
  const brightness = freq.brightness || 0.5;
  const intensity = time.rms ? Math.min(1, time.rms * 2.5) : 0.5;
  const harmony = freq.harmonicRatio || 0.5;
  const roughness = freq.roughness || 0.5;

  if (warmth > 0.7 && intensity > 0.6) return 'fire';
  if (warmth < 0.3 && brightness > 0.5) return 'ice';
  if (intensity > 0.7 && roughness > 0.5) return 'storm';
  if (warmth > 0.4 && warmth < 0.6 && brightness < 0.4) return 'earth';
  if (intensity < 0.35 && harmony > 0.5) return 'water';
  if (harmony > 0.65 && brightness > 0.6) return 'light';
  if (brightness < 0.35 && harmony < 0.4) return 'shadow';
  if (warmth > 0.55) return 'nature';

  return 'storm';
}
