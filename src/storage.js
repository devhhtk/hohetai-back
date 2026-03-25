// storage.js — Backblaze B2 upload

/**
 * Upload a file to B2 and return its public URL.
 */
export async function uploadToB2(imageBytes, fileName, contentType = 'image/png', env) {
  const keyId  = env.B2_KEY_ID;
  const appKey = env.B2_APPLICATION_KEY;
  const bucket = env.B2_BUCKET_NAME || 'aumage-cards';
  const cdnBase = env.CARDS_CDN_BASE || `https://f005.backblazeb2.com/file/${bucket}`;

  if (!keyId || !appKey) throw new Error('B2 credentials not configured');

  // Step 1 — Authorize
  const authString = btoa(`${keyId}:${appKey}`);
  const authResp = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: { Authorization: `Basic ${authString}` },
  });
  if (!authResp.ok) throw new Error(`B2 auth failed: ${authResp.status}`);
  const authData = await authResp.json();

  const apiUrl    = authData.apiUrl;
  const authToken = authData.authorizationToken;
  const downloadUrl = authData.downloadUrl;

  // Step 2 — Get upload URL
  const uploadUrlResp = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId: authData.allowed.bucketId }),
  });
  if (!uploadUrlResp.ok) throw new Error(`B2 get upload URL failed: ${uploadUrlResp.status}`);
  const uploadData = await uploadUrlResp.json();

  // Step 3 — Upload
  const sha1 = await computeSha1(imageBytes);
  const uploadResp = await fetch(uploadData.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: uploadData.authorizationToken,
      'X-Bz-File-Name': encodeURIComponent(fileName),
      'Content-Type': contentType,
      'Content-Length': imageBytes.length.toString(),
      'X-Bz-Content-Sha1': sha1,
    },
    body: imageBytes,
  });
  if (!uploadResp.ok) {
    const errText = await uploadResp.text();
    throw new Error(`B2 upload failed: ${uploadResp.status} ${errText}`);
  }

  // Return public URL
  const publicUrl = `${cdnBase}/${fileName}`;
  return publicUrl;
}

async function computeSha1(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique creature ID in AM-XXXXX format.
 */
export function generateCreatureId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'AM-';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
