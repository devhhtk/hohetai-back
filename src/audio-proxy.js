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

  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.victr.me',
    'https://pipedapi.adminforge.de'
  ];

  let lastError = null;

  // 1. Try Cobalt Instances first (supports YT and Spotify)
  for (const instance of instances) {
    try {
      console.log(`[AudioProxy] Trying Cobalt: ${instance}`);
      const response = await fetch(instance, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          url: url,
          audioFormat: 'wav',
          isAudioOnly: true,
          aQuality: 'max'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'redirect' || result.status === 'stream' || result.status === 'success') {
          return result.url;
        }
      } else {
        console.warn(`[AudioProxy] Cobalt ${instance} failed: ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  // 2. Try Piped API Fallback (YouTube Only)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    for (const piped of pipedInstances) {
      try {
        console.log(`[AudioProxy] Trying Piped Fallback: ${piped}`);
        const response = await fetch(`${piped}/streams/${videoId}`);
        if (!response.ok) continue;

        const data = await response.json();
        // Preferred audio stream (highest quality m4a/webm)
        const audioStream = data.audioStreams?.find(s => s.format === 'M4A') || data.audioStreams?.[0];
        if (audioStream?.url) return audioStream.url;
      } catch (err) {
        console.warn(`[AudioProxy] Piped ${piped} failed: ${err.message}`);
      }
    }
  }

  throw new Error(`Extraction failed: All nodes (Cobalt & Piped) are currently blocking requests from this IP. Please try a different video or direct audio link.`);
}
