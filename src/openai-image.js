// openai-image.js — OpenAI Images API client for Aumage
// Calls gpt-image-1.5 directly via OpenAI API — no Replicate middleman
// Returns image bytes (PNG)
// Model: gpt-image-1.5 | Quality: medium | Size: 1024x1536
//
// Required env: OPENAI_API_KEY

const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Generate a creature image via OpenAI Images API.
 *
 * @param {string} prompt — The full creature prompt
 * @param {Object} env — Worker env (needs OPENAI_API_KEY)
 * @param {Object} [options]
 * @param {string} [options.model] — "gpt-image-1.5" (default)
 * @param {string} [options.size] — "1024x1024" (default), "1024x1536", "1536x1024"
 * @param {string} [options.quality] — "low", "medium", "high" (default)
 * @returns {Promise<Uint8Array>} PNG image bytes
 */
export async function generateImage(prompt, env, options = {}) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const model = options.model || 'gpt-image-1.5';
  const size = options.size || '1024x1536';
  const quality = options.quality || 'medium';

  const resp = await fetch(`${OPENAI_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`OpenAI image generation failed (${resp.status}): ${errBody}`);
  }

  const result = await resp.json();

  // OpenAI returns either b64_json or url depending on response_format
  // Default is url
  const imageData = result.data?.[0];
  if (!imageData) {
    throw new Error('OpenAI returned no image data: ' + JSON.stringify(result).slice(0, 200));
  }

  if (imageData.b64_json) {
    // Convert base64 to bytes
    const binary = atob(imageData.b64_json);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if (imageData.url) {
    // Fetch the image from the URL
    const imgResp = await fetch(imageData.url);
    if (!imgResp.ok) throw new Error(`Failed to fetch image from OpenAI CDN: ${imgResp.status}`);
    const arrayBuffer = await imgResp.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  throw new Error('Unexpected OpenAI response format: ' + JSON.stringify(imageData).slice(0, 200));
}
