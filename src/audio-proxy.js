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

  console.log(`[AudioProxy] Resolving: ${url}`);

  // Using Cobalt API
  // Note: Cobalt is an open-source downloader. We use their public API.
  // Docs: https://github.com/imputnet/cobalt/blob/current/docs/API.md
  try {
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        audioFormat: 'wav', // Prefer WAV for the FFT extractor
        isAudioOnly: true,
        aQuality: 'max',
        vCodec: 'h264' // ignored for audio only
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Cobalt API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.text || 'Failed to resolve audio URL');
    }

    if (result.status === 'redirect' || result.status === 'stream' || result.status === 'success') {
      return result.url;
    }

    throw new Error(`Unexpected Cobalt status: ${result.status}`);
  } catch (err) {
    console.error(`[AudioProxy] Error: ${err.message}`);
    throw new Error(`Could not extract audio from URL: ${err.message}`);
  }
}
