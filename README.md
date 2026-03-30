# Aumage Card Generation Pipeline

**Cloudflare Worker** that generates complete Aumage creature cards using OpenAI's `gpt-image-1` model.

## Architecture

```
Browser → POST /api/generate → Worker → OpenAI → Backblaze B2
                                  ↓
                              Supabase (metadata)
```

One AI call. One complete card. No compositing.

## Pipeline Steps

1. **Validate** input JSON
2. **Calculate ARS** (Audio Resonance Score) from Meyda features
3. **Roll rarity** using ARS-shifted probability weights
4. **Detect variants** (Lucky Pulse, Harmonic Seven, etc.)
5. **Determine season + climate** from hemisphere and residence region
6. **Build prompt** — the complete card description for gpt-image-1
7. **Call OpenAI** — generates finished card PNG in one shot
8. **Upload to B2** — stored at `cards.aumage.ai/{catalog_id}.png`
9. **Save metadata** — immutable record in Supabase
10. **Return** card URL + metadata to browser

## Setup

```bash
# Install dependencies
npm install

# Set secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put B2_APP_KEY_ID
wrangler secret put B2_APP_KEY
wrangler secret put B2_BUCKET_ID
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY

# Run Supabase migration
# Copy supabase/migration.sql into Supabase SQL Editor and run

# Local development
wrangler dev

# Deploy
wrangler deploy
```

## Testing

```bash
# Rarity distribution simulation
node test/simulate-rarity.js

# Test with mock payload
curl -X POST http://localhost:8787/api/generate \
  -H "Content-Type: application/json" \
  -d @test/payloads.json
```

## File Structure

```
src/
  index.js      — Worker entry point, routing, pipeline orchestration
  validate.js   — Input validation
  rarity.js     — ARS calculation, rarity roll, variant detection
  season.js     — Season + climate zone determination
  prompt.js     — Card prompt builder (THE critical file)
  openai.js     — OpenAI gpt-image-1 API integration
  storage.js    — Backblaze B2 upload
  db.js         — Supabase metadata operations

supabase/
  migration.sql — Database schema + RLS policies

test/
  payloads.json       — Mock test payloads (4 creatures)
  simulate-rarity.js  — Rarity distribution validation
```

## Cost

- ~$0.19 per card (gpt-image-1, high quality, portrait)
- ~$0.006/GB/mo storage (Backblaze B2)
- $0 egress (Cloudflare Bandwidth Alliance)
- Cloudflare Worker free tier (no Paid plan needed)

## Version

v3.0.0 — Founding Resonance Era
