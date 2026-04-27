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
    card_image_url: data.card_image_url || '',
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

/**
 * Get public creatures for the explore page.
 */
export async function getExploreCreatures(env, limit = 50, currentUserId = null, sort = 'latest') {
  // 1. Fetch creatures: Must have card_image_url and be public
  // We use PostgREST count features to get likes and comments counts
  let url = `${env.SUPABASE_URL}/rest/v1/creatures?select=*,likes_count:creature_likes(count),comments_count:creature_comments(count)&card_image_url=not.is.null&card_image_url=not.eq.&is_public=eq.true&limit=${limit}`;

  // Apply SQL-level ordering for Latest
  if (sort === 'latest' || sort === 'all') {
    url += '&order=created_at.desc';
  } else if (sort === 'trending' || sort === 'most_loved') {
    // We'll fetch and sort in memory since PostgREST ordering by aggregates via URL is limited.
    // We order by ID as a stable base.
    url += '&order=id.desc';
  }

  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Get Explore Creatures Failed:`, resp.status, err);
    return [];
  }

  let creatures = await resp.json();

  // Transform counts from array of objects to single number
  creatures = creatures.map(c => ({
    ...c,
    likes_count: c.likes_count?.[0]?.count || 0,
    comments_count: c.comments_count?.[0]?.count || 0,
    user_has_liked: false // Default
  }));

  // Apply In-Memory Sorting for hybrid types
  if (sort === 'most_loved') {
    creatures.sort((a, b) => b.likes_count - a.likes_count);
  } else if (sort === 'trending') {
    // Trending = Most likes + comments combined
    creatures.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));
  } else if (sort === 'random') {
    creatures.sort(() => Math.random() - 0.5);
  }

  // 2. Check if current user has liked these creatures
  if (currentUserId && creatures.length > 0) {
    try {
      const creatureIds = creatures.map(c => c.id);
      // Ensure all IDs are valid for the 'in' filter
      const validIds = creatureIds.filter(id => id && id.length > 20);
      
      if (validIds.length > 0) {
        const likesUrl = `${env.SUPABASE_URL}/rest/v1/creature_likes?user_id=eq.${currentUserId}&creature_id=in.(${validIds.join(',')})&select=creature_id`;
        const likesResp = await fetch(likesUrl, {
          headers: supabaseHeaders(env),
        });

        if (likesResp.ok) {
          const likedData = await likesResp.json();
          if (Array.isArray(likedData)) {
            const likedIds = likedData.map(l => l.creature_id);
            creatures.forEach(c => {
              if (likedIds.includes(c.id)) {
                c.user_has_liked = true;
              }
            });
          }
        }
      }
    } catch (e) {
      console.error(`[Supabase] User Liked Check Failed:`, e.message);
    }
  }

  // 3. Manual Join: Fetch profiles for the unique user_ids found
  const userIds = [...new Set(creatures.map(c => c.user_id).filter(Boolean))];
  
  if (userIds.length > 0) {
    try {
      const profileUrl = `${env.SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,display_name`;
      const profileResp = await fetch(profileUrl, {
        headers: supabaseHeaders(env),
      });

      if (profileResp.ok) {
        const profiles = await profileResp.json();
        const profileMap = {};
        profiles.forEach(p => profileMap[p.id] = p);

        // Attach profile data to each creature
        creatures.forEach(c => {
          if (c.user_id && profileMap[c.user_id]) {
            c.profiles = profileMap[c.user_id];
          }
        });
      }
    } catch (e) {
      console.error(`[Supabase] Manual Profile Join Failed:`, e.message);
      // Non-fatal, creatures will just show default names
    }
  }

  return creatures;
}

/**
 * Get comments for a specific creature, including user display names.
 */
export async function getCreatureComments(env, creatureId) {
  const url = `${env.SUPABASE_URL}/rest/v1/creature_comments?creature_id=eq.${creatureId}&select=*&order=created_at.asc`;

  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Get Comments Failed:`, resp.status, err);
    return [];
  }

  const comments = await resp.json();
  
  // Manual Join for profiles
  const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
  if (userIds.length > 0) {
    try {
      const profileUrl = `${env.SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,display_name,avatar_url`;
      const profileResp = await fetch(profileUrl, {
        headers: supabaseHeaders(env),
      });

      if (profileResp.ok) {
        const profiles = await profileResp.json();
        const profileMap = {};
        profiles.forEach(p => profileMap[p.id] = p);

        comments.forEach(c => {
          if (c.user_id && profileMap[c.user_id]) {
            c.profiles = profileMap[c.user_id];
          }
        });
      }
    } catch (e) {
      console.error(`[Supabase] Comments Profile Join Failed:`, e.message);
    }
  }

  return comments;
}

/**
 * Toggle a like for a creature.
 */
export async function toggleLike(env, userId, creatureId) {
  // Check if like exists
  const checkUrl = `${env.SUPABASE_URL}/rest/v1/creature_likes?user_id=eq.${userId}&creature_id=eq.${creatureId}&select=id`;
  const checkResp = await fetch(checkUrl, {
    headers: supabaseHeaders(env),
  });

  const existing = await checkResp.json();

  if (Array.isArray(existing) && existing.length > 0) {
    // Unlike
    const delUrl = `${env.SUPABASE_URL}/rest/v1/creature_likes?id=eq.${existing[0].id}`;
    const delResp = await fetch(delUrl, {
      method: 'DELETE',
      headers: supabaseHeaders(env),
    });
    if (!delResp.ok) throw new Error(`Delete like failed: ${delResp.status}`);
    return { liked: false };
  } else {
    // Like
    const addUrl = `${env.SUPABASE_URL}/rest/v1/creature_likes`;
    const addResp = await fetch(addUrl, {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify({ user_id: userId, creature_id: creatureId }),
    });
    if (!addResp.ok) {
      const err = await addResp.text();
      // If we get a 409 (unique constraint), it means user already liked it, so we just return liked: true
      if (addResp.status === 409) return { liked: true };
      throw new Error(`Add like failed: ${addResp.status} ${err}`);
    }

    // TRIGGER NOTIFICATION
    try {
      const creature = await getCreature(env, creatureId);
      if (creature && creature.user_id && creature.user_id !== userId) {
        await createNotification(env, {
          recipient_id: creature.user_id,
          actor_id: userId,
          type: 'like',
          creature_id: creatureId,
          metadata: { message: `Someone liked your creature ${creature.creature_name || 'Card'}!` }
        });
      }
    } catch (e) {
      console.error('[Notification] Like trigger failed:', e.message);
    }

    return { liked: true };
  }
}

/**
 * Add a comment to a creature.
 */
export async function addComment(env, userId, creatureId, content) {
  const url = `${env.SUPABASE_URL}/rest/v1/creature_comments`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify({
      user_id: userId,
      creature_id: creatureId,
      content: content,
      created_at: new Date().toISOString(),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Failed to add comment: ${err}`);
  }

  const rows = await resp.json();
  const comment = rows[0];

  // TRIGGER NOTIFICATION
  try {
    const creature = await getCreature(env, creatureId);
    if (creature && creature.user_id && creature.user_id !== userId) {
      await createNotification(env, {
        recipient_id: creature.user_id,
        actor_id: userId,
        type: 'comment',
        creature_id: creatureId,
        comment_id: comment.id,
        metadata: { message: `Someone commented on your creature ${creature.creature_name || 'Card'}!` }
      });
    }
  } catch (e) {
    console.error('[Notification] Comment trigger failed:', e.message);
  }

  return comment;
}

/**
 * Internal helper to create a notification in the DB.
 */
export async function createNotification(env, data) {
  const url = `${env.SUPABASE_URL}/rest/v1/notifications`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify({
      recipient_id: data.recipient_id,
      actor_id: data.actor_id || null,
      type: data.type,
      creature_id: data.creature_id || null,
      comment_id: data.comment_id || null,
      metadata: data.metadata || {},
      is_read: false,
      created_at: new Date().toISOString(),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[Supabase] Create Notification Failed:`, resp.status, err);
  }
}

export async function saveTeam(env, userId, creatureIds, name = 'My Squad') {
  // Check if an active team already exists for this user
  const checkUrl = `${env.SUPABASE_URL}/rest/v1/teams?user_id=eq.${userId}&select=id`;
  const checkResp = await fetch(checkUrl, {
    headers: supabaseHeaders(env),
  });

  const existing = await checkResp.json();

  if (Array.isArray(existing) && existing.length > 0) {
    // Update the existing team (we update by the primary key ID found)
    const teamId = existing[0].id;
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/teams?id=eq.${teamId}`;
    const updateResp = await fetch(updateUrl, {
      method: 'PATCH',
      headers: supabaseHeaders(env),
      body: JSON.stringify({
        creature_ids: creatureIds,
        name: name,
        is_active: true
      }),
    });

    if (!updateResp.ok) {
      const err = await updateResp.text();
      throw new Error(`Update team failed: ${updateResp.status} ${err}`);
    }
    const rows = await updateResp.json();
    return rows[0];
  } else {
    // Create new team
    const addUrl = `${env.SUPABASE_URL}/rest/v1/teams`;
    const addResp = await fetch(addUrl, {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify({
        user_id: userId,
        creature_ids: creatureIds,
        name: name,
        is_active: true,
        created_at: new Date().toISOString()
      }),
    });

    if (!addResp.ok) {
      const err = await addResp.text();
      throw new Error(`Create team failed: ${addResp.status} ${err}`);
    }
    const rows = await addResp.json();
    return rows[0];
  }
}

/**
 * Get a user's team.
 */
export async function getTeam(env, userId) {
  const url = `${env.SUPABASE_URL}/rest/v1/teams?user_id=eq.${userId}&is_active=eq.true&select=*`;
  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) return null;
  const rows = await resp.json();
  return rows[0] || null;
}

/**
 * Find other users with active teams.
 */
export async function findOpponents(env, excludeUserId, limit = 5) {
  const url = `${env.SUPABASE_URL}/rest/v1/teams?user_id=neq.${excludeUserId}&is_active=eq.true&limit=${limit}&select=*,profiles(display_name,avatar_url)`;
  
  const resp = await fetch(url, {
    headers: supabaseHeaders(env),
  });

  if (!resp.ok) return [];
  return await resp.json();
}
