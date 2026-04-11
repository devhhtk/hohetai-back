// save-card.js — /api/save-card endpoint
// Receives a composited card PNG from the frontend Canvas compositor
// Uploads to B2, updates Supabase with card_url
//
// Add to index.js:
//   import { handleSaveCard } from './save-card.js';
//   // In router:
//   if (url.pathname === '/api/save-card' && method === 'POST') {
//     return handleSaveCard(request, env);
//   }

import { uploadToB2 } from './storage.js';
import { finalizeCreature } from './db.js';

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

/**
 * Handle /api/save-card
 * Expects multipart/form-data with:
 *   - card: PNG blob (the composited card image)
 *   - creature_id: string
 *   - creature_name: string (optional, for DB update)
 */
export async function handleSaveCard(request, env) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Expected multipart/form-data' }, 400);
  }

  const cardFile = formData.get('card');
  const creatureId = formData.get('creature_id');
  const creatureName = formData.get('creature_name') || '';

  if (!cardFile || !creatureId) {
    return json({ error: 'Missing card file or creature_id' }, 400);
  }

  // Get PNG bytes from uploaded blob
  let cardBytes;
  try {
    const arrayBuffer = await cardFile.arrayBuffer();
    cardBytes = new Uint8Array(arrayBuffer);
  } catch {
    return json({ error: 'Failed to read card file' }, 400);
  }

  if (cardBytes.byteLength < 1000) {
    return json({ error: 'Card file too small — likely empty' }, 400);
  }

  // Upload to B2
  const cardFileName = `creatures/${creatureId}-card.png`;
  let cardUrl;
  try {
    cardUrl = await uploadToB2(cardBytes, cardFileName, 'image/png', env);
  } catch (e) {
    console.error('B2 upload error:', e);
    return json({ error: `Storage upload failed: ${e.message}` }, 500);
  }

  // Update Supabase
  try {
    const updates = { 
      card_image_url: cardUrl,
      card_url: cardUrl // Ensure both fields are synced for the UI
    };
    if (creatureName.trim()) {
      updates.creature_name = creatureName.trim();
    }
    await finalizeCreature(env, creatureId, updates);
  } catch (e) {
    console.error('Supabase finalize error (non-fatal):', e);
    // Non-fatal — card is already on B2
  }

  return json({
    success: true,
    card_url: cardUrl,
    creature_id: creatureId,
  });
}
