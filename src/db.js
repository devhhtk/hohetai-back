// db.js — Supabase database operations

function supabaseHeaders(env) {
  return {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

/**
 * Create a new creature record (Stage A — no name yet).
 */
export async function createCreature(env, data) {
  const url = `${env.SUPABASE_URL}/rest/v1/creatures`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify({
      id: data.creature_id,
      user_id: data.userId,
      creature_url: data.creature_url,
      rarity: data.rarity,
      morphology: data.morphology,
      audiotrope_type: data.audiotropeType,
      traits: data.traits,
      stats: data.stats,
      flavor_text: data.flavorText,
      season: data.season,
      status: 'pending_name',
      created_at: new Date().toISOString(),
    }),
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
      card_url: data.card_url,
      status: 'complete',
      finalized_at: new Date().toISOString(),
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
export async function getCreature(env, creatureId) {
  const url = `${env.SUPABASE_URL}/rest/v1/creatures?id=eq.${creatureId}&select=*`;

  const resp = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase get creature failed: ${resp.status} ${err}`);
  }

  const rows = await resp.json();
  return rows[0] || null;
}
