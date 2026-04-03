/**
 * audio-proxy.js — Aumage YouTube/Spotify Audio Resolver
 * 
 * Uses Cobalt API (https://api.cobalt.tools) or similar to resolve
 * platform URLs into direct audio download links.
 */

export async function resolveAudioUrl(url, env) {
  // Determine source
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  const isSpotify = /spotify\.com/.test(url);

  if (!isYouTube && !isSpotify) {
    // If it's a direct audio link, just return it
    if (/\.(mp3|wav|ogg|flv|m4a)$/i.test(url)) return url;
    throw new Error('Unsupported URL. Please use a YouTube or Spotify link.');
  }

  const instances = [
    'https://api.cobalt.tools/api/json',
    'https://co.wuk.sh/api/json',
    'https://cobalt.crstck.top/api/json',
    'https://cobalt.miz.icu/api/json'
  ];

  let lastError = null;

  for (const instance of instances) {
    try {
      console.log(`[AudioProxy] Trying instance: ${instance}`);
      const response = await fetch(instance, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Referer': 'https://cobalt.tools/'
        },
        body: JSON.stringify({
          url: url,
          audioFormat: 'wav',
          isAudioOnly: true,
          aQuality: 'max'
        })
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          console.warn(`[AudioProxy] ${instance} blocked/rate-limited (HTTP ${response.status})`);
          continue; // Try next instance
        }
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'error') {
        console.warn(`[AudioProxy] ${instance} reported error: ${result.text}`);
        continue;
      }

      if (result.status === 'redirect' || result.status === 'stream' || result.status === 'success') {
        return result.url;
      }
    } catch (err) {
      console.warn(`[AudioProxy] Failed with ${instance}: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Could not extract audio from URL: All extraction nodes are currently busy or blocking requests. ${lastError ? lastError.message : ''}`);
}
