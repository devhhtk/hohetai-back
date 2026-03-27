// db.js — Supabase database operations

function supabaseHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

/**
 * Create a new creature record (Stage A — no name yet).
 * Aligned with migration.sql schema.
 */
export async function createCreature(env, data) {
  const url = `${env.SUPABASE_URL}/rest/v1/creatures`;

  // Generate metadata required by schema
  const timestamp = Date.now();
  const catalogId = `CAT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const body = {
    id:                data.creature_id, // MUST BE UUID
    user_id:           data.userId,
    serial_number:     data.serial_number, // The AM-XXXXX ID from Worker
    catalog_id:        catalogId,
    base_rarity:       (data.rarity || 'common').toLowerCase(),
    ars:                data.ars || 0.5,
    trope_class:       data.trope,
    morphology:        data.morphology,
    element:           data.element || 'neutral',
    residence_region:  data.region || 'Unknown',
    climate_zone:      data.climate || 'Temperate',
    season:            (data.season || 'spring').toLowerCase(),
    hemisphere:        data.hemisphere || 'northern',
    waveform_hash:     data.waveform_hash || `hash-${timestamp}`,
    prompt_hash:       data.prompt_hash || `prompt-${timestamp}`,
    generation_number: data.generation_number || 0,
    card_url:          data.creature_url || '',
    creature_name:     data.creature_name || null,
    variant_tags:      { ...(data.stats || {}), ...(data.traits || {}) },
    annotation_features: data.labels || [],
    mint_timestamp:    new Date().toISOString(),
    flavor_text:       data.flavorText || null,
    created_at:        new Date().toISOString(),
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase create creature failed: ${resp.status} ${err}`);
  }

  const rows = await resp.json();
  return rows[0];
}

/**
 * Finalize a creature record (Stage B — name + card_url set).
 */
export async function finalizeCreature(env, creatureId, data) {
  const url = `${env.SUPABASE_URL}/rest/v1/creatures?id=eq.${creatureId}`;

  const resp = await fetch(url, {
    method: 'PATCH',
    headers: supabaseHeaders(env),
    body: JSON.stringify({
      creature_name: data.creature_name,
      card_url:      data.card_url || '',
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase finalize creature failed: ${resp.status} ${err}`);
  }

  const rows = await resp.json();
  return rows[0];
}

/**
 * Get a creature record by ID.
 */
export async function getCreature(env, id) {
  const url = `${env.SUPABASE_URL}/rest/v1/creatures?id=eq.${id}&select=*`;

  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase get creature failed: ${resp.status} ${err}`);
  }

  const rows = await resp.json();
  return rows[0] || null;
}
