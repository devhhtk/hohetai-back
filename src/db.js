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
    id: data.creature_id || data.id,
    user_id: data.userId || data.user_id,
    image_url: data.image_url || data.creature_url || null,
    video_url: data.video_url || null,
    audio_source: data.audio_source || null,
    audio_storage_path: data.audio_storage_path || null,
    link_url: data.link_url || null,
    fingerprint: data.fingerprint || null,
    seed: data.seed || null,
    mode: data.mode || 'creature',
    style: data.style || 'realistic',
    features: data.features || {},
    visuals: data.visuals || {},
    prompt_text: data.prompt_text || null,
    is_public: data.is_public !== undefined ? data.is_public : true,
    folder_id: data.folder_id || null,
    serial_number: data.serial_number,
    catalog_id: catalogId,
    base_rarity: (data.rarity || 'common').toLowerCase(),
    ars: data.ars || 0.5,
    trope_class: data.trope,
    morphology: data.morphology,
    tier: data.tier || '1',
    element: data.element || 'neutral',
    domain: data.domain || 'terrestrial',
    variant_tags: data.variant_tags || { ...(data.stats || {}), ...(data.traits || {}) },
    mint_timestamp: data.mint_timestamp || new Date().toISOString(),
    residence_region: data.region || 'Unknown',
    climate_zone: data.climate || 'Temperate',
    season: (data.season || 'spring').toLowerCase(),
    hemisphere: data.hemisphere || 'northern',
    waveform_hash: data.waveform_hash || `hash-${timestamp}`,
    generation_number: data.generation_number || 0,
    card_url: data.creature_url || data.card_url || '',
    card_image_url: data.card_image_url || data.creature_url || data.card_url || '',
    frame_variant: data.frame_variant || 'standard',
    annotation_features: data.labels || data.annotation_features || [],
    prompt_hash: data.prompt_hash || `prompt-${timestamp}`,
    creature_name: data.creature_name || null,
    flavor_text: data.flavorText || data.flavor_text || null,
    climate_mastery: data.climate_mastery || null,
    created_at: new Date().toISOString(),
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[Supabase] Create Failed:`, resp.status, errText);
    throw new Error(`Supabase create creature failed: ${resp.status} ${errText}`);
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
    body: JSON.stringify(data),
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

/**
 * Get a user's profile record (level, total_xp).
 */
export async function getUserProfile(env, userId) {
  const url = `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`;

  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Get Profile Failed:`, resp.status, err);
    return null;
  }

  const rows = await resp.json();
  return rows[0] || null;
}

/**
 * Get all level requirements.
 */
export async function getLevels(env) {
  const url = `${env.SUPABASE_URL}/rest/v1/levels?select=*&order=level.asc`;

  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Get Levels Failed:`, resp.status, err);
    return [];
  }

  return await resp.json();
}

/**
 * Ensure a user profile exists (creates one with defaults if missing).
 */
export async function ensureProfileExists(env, userId) {
  const profile = await getUserProfile(env, userId);
  const today = new Date().toISOString().split('T')[0];

  if (profile) {
    // If profile exists, check if streak needs update
    if (profile.last_login_date !== today) {
      return await updateStreak(env, userId, profile);
    }
    return profile;
  }

  // Create new profile
  const url = `${env.SUPABASE_URL}/rest/v1/profiles`;
  const body = {
    id: userId,
    level: 1,
    total_xp: 0,
    streak_count: 1,
    last_login_date: today,
    last_reward_index: 0,
    last_claimed_day: null,
    updated_at: new Date().toISOString(),
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(env),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Create Profile Failed:`, resp.status, err);
    return null;
  }

  const rows = await resp.json();
  return rows[0];
}

/**
 * Internal helper to update login streak logic.
 */
async function updateStreak(env, userId, profile) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = profile.streak_count || 0;
  
  if (profile.last_login_date === yesterdayStr) {
    newStreak += 1;
  } else if (profile.last_login_date !== todayStr) {
    // Missed a day or more
    newStreak = 1;
  } else {
    // Already updated today
    return profile;
  }

  // Cap streak at 30 for the monthly cycle
  if (newStreak > 30) newStreak = 30;

  const url = `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...supabaseHeaders(env),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      streak_count: newStreak,
      last_login_date: todayStr,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!resp.ok) return profile; // Fail silently, return old profile
  const rows = await resp.json();
  return rows[0];
}

/**
 * Add XP to a user profile and check for Level Up.
 * Logic: Current level is n. Target to reach level n+1 is levels[level=n].xp_required.
 */
export async function addExperience(env, userId, xpAmount) {
  // 1. Get current profile (this will also update streak if needed)
  const profile = await ensureProfileExists(env, userId);
  if (!profile) return null;

  const oldLevel = profile.level || 1;
  const newTotalXp = (profile.total_xp || 0) + xpAmount;
  let newLevel = oldLevel;

  // 2. Fetch all levels to check for progress
  const levels = await getLevels(env);
  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);

  for (const lvl of sortedLevels) {
    if (newTotalXp >= lvl.xp_required) {
      if (lvl.level >= newLevel) {
        newLevel = lvl.level + 1;
      }
    }
  }

  const leveledUp = newLevel > oldLevel;

  // 3. Update profile
  const url = `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...supabaseHeaders(env),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      total_xp: newTotalXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Update XP Failed:`, resp.status, err);
    return null;
  }

  const resultRows = await resp.json();
  return {
    profile: resultRows[0],
    leveledUp,
    xpGained: xpAmount,
  };
}

/**
 * Claim the next available streak reward.
 */
export async function claimStreakReward(env, userId, xpAmount) {
  const profile = await ensureProfileExists(env, userId);
  if (!profile) throw new Error('Profile not found');

  const nextIndex = (profile.last_reward_index || 0) + 1;

  // Verification: Sequential claim
  if (nextIndex > profile.streak_count) {
    throw new Error('Reward not yet earned. Keep logging in!');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic: User grants reward index and we update the profile
  const url = `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...supabaseHeaders(env),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      last_reward_index: nextIndex,
      last_claimed_day: todayStr,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Claim failed: ${err}`);
  }

  // Grant the XP associated with this reward
  return await addExperience(env, userId, xpAmount);
}
