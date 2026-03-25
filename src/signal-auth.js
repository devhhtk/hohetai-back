// signal-auth.js — HMAC-SHA256 signing for Aumage signal objects
// Uses Web Crypto API (available natively in Cloudflare Workers)
// Secret key stored as Worker secret: SIGNAL_SECRET

// ─────────────────────────────────────────────────────────────
// KEY DERIVATION
// Imports the raw secret string as a CryptoKey for HMAC-SHA256
// ─────────────────────────────────────────────────────────────

async function importKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,          // not extractable
    ['sign', 'verify']
  );
}

// ─────────────────────────────────────────────────────────────
// CANONICAL SIGNAL STRING
// Deterministic serialization — field order locked so signature
// is stable across JSON.stringify implementations
// ─────────────────────────────────────────────────────────────

function canonicalize(signal) {
  // We sign the core fields that matter for creature generation
  // Context is included so time/location/weather are tamper-evident too
  const payload = {
    version:     signal.version,
    origen:      signal.origen,
    extractedAt: signal.extractedAt,
    // Frequency axes
    spectralCentroid:  signal.frequency.spectralCentroid,
    spectralSpread:    signal.frequency.spectralSpread,
    spectralRolloff:   signal.frequency.spectralRolloff,
    brightness:        signal.frequency.brightness,
    warmth:            signal.frequency.warmth,
    roughness:         signal.frequency.roughness,
    harmonicRatio:     signal.frequency.harmonicRatio,
    dominantPitchClass: signal.frequency.dominantPitchClass,
    // Time axes
    rms:               signal.time.rms,
    peak:              signal.time.peak,
    zeroCrossingRate:  signal.time.zeroCrossingRate,
    dynamicRange:      signal.time.dynamicRange,
    onsetDensity:      signal.time.onsetDensity,
    bpm:               signal.time.bpm,
    duration:          signal.time.duration,
    // Context entropy
    timestamp:         signal.context.timestamp,
    timeOfDay:         signal.context.timeOfDay,
    season:            signal.context.season,
    lat:               signal.context.lat,
    lon:               signal.context.lon,
    region:            signal.context.region,
    weatherCondition:  signal.context.weather.condition,
    temperature:       signal.context.weather.temperature,
    // Intelligence layer
    tropeSignal:       signal.intelligence.tropeSignal,
    tropeStrength:     signal.intelligence.tropeStrength,
    ars:               signal.intelligence.ars,
    arsAdjusted:       signal.intelligence.arsAdjusted,
    contextModifier:   signal.intelligence.contextModifier,
  };
  return JSON.stringify(payload);
}

// ─────────────────────────────────────────────────────────────
// SIGN
// Returns base64url-encoded HMAC signature
// ─────────────────────────────────────────────────────────────

export async function signSignal(signal, secret) {
  if (!secret) throw new Error('SIGNAL_SECRET not configured');

  const key       = await importKey(secret);
  const canonical = canonicalize(signal);
  const encoder   = new TextEncoder();
  const sigBytes  = await crypto.subtle.sign('HMAC', key, encoder.encode(canonical));

  // Convert to base64url
  const sigArray = Array.from(new Uint8Array(sigBytes));
  const base64   = btoa(String.fromCharCode(...sigArray));
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return base64url;
}

// ─────────────────────────────────────────────────────────────
// VERIFY
// Returns true if signature matches signal, false otherwise
// ─────────────────────────────────────────────────────────────

export async function verifySignal(signal, signature, secret) {
  if (!secret)    return false;
  if (!signature) return false;

  try {
    const key       = await importKey(secret);
    const canonical = canonicalize(signal);
    const encoder   = new TextEncoder();

    // Decode base64url → ArrayBuffer
    const base64  = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary  = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) sigBytes[i] = binary.charCodeAt(i);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(canonical)
    );
  } catch (_) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// SIGNAL EXPIRY CHECK
// Signals expire after 15 minutes — prevents replay attacks
// ─────────────────────────────────────────────────────────────

export function isSignalExpired(signal, maxAgeMs = 15 * 60 * 1000) {
  if (!signal?.context?.timestamp) return true;
  return Date.now() - signal.context.timestamp > maxAgeMs;
}
