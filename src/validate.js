// validate.js — Request validation v5

/**
 * Validate /api/generate request.
 * Accepts either raw audioFeatures OR pre-processed creature attributes from frontend.
 */
export function validateGenerateRequest(body) {
  if (!body) return 'Request body is required';
  if (!body.userId) return 'userId is required';

  // Accept either raw audioFeatures or processed creature attributes
  const hasAudioFeatures = body.audioFeatures && typeof body.audioFeatures === 'object';
  const hasProcessedData = body.morphology || body.audiotropeType;

  if (!hasAudioFeatures && !hasProcessedData) {
    return 'Either audioFeatures or processed creature attributes (morphology, audiotropeType) are required';
  }

  return null; // valid
}

/**
 * Validate /api/compose request.
 */
export function validateComposeRequest(body) {
  if (!body) return 'Request body is required';
  if (!body.userId) return 'userId is required';
  if (!body.creature_id) return 'creature_id is required';
  if (!body.creature_url) return 'creature_url is required';

  const name = (body.creature_name || '').trim();
  if (!name) return 'creature_name is required';
  if (name.length < 2) return 'creature_name must be at least 2 characters';
  if (name.length > 40) return 'creature_name must be 40 characters or less';

  const BLOCKED = ['kill', 'murder', 'sex', 'nude', 'naked', 'porn', 'hate'];
  const nameLower = name.toLowerCase();
  for (const word of BLOCKED) {
    if (nameLower.includes(word)) return 'creature_name contains inappropriate content';
  }

  return null; // valid
}
