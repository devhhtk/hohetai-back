// sorting-hat.js — Creature Codex: optional GPT-4o-mini name suggestions
// Age-appropriate (13+), Pokémon energy, no romance

const SYSTEM_PROMPT = `You are the Creature Codex, a naming oracle for Audiotropes — 
creatures born from sound in the Aumage Bestiary. 

Your naming style:
- Pokémon-style compound names (e.g. "Umbradisc", "Thornveil", "Gloomfin")
- Evocative and cool, not cutesy or romantic
- 1-3 word names maximum
- Suitable for ages 13+
- No human names, no place names, no brand names
- Reflect the creature's element, form, and audio origin

Also write one short flavor text line (8-12 words, present tense, atmospheric).
Format: {"name": "...", "flavor_text": "..."}
Output ONLY the JSON. No other text.`;

const SAFETY_WORDS = [
  'kill', 'murder', 'blood', 'gore', 'sex', 'nude', 'naked',
  'hate', 'demon', 'satan', 'devil', 'war', 'weapon', 'death',
];

export async function suggestName(params, env) {
  const {
    morphologyName,
    audiotropeType,
    rarity,
    traits = [],
    season,
  } = params;

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return { name: '', flavor_text: '' };

  const userPrompt = `Creature: ${morphologyName}-type ${audiotropeType}
Rarity: ${rarity}
Traits: ${traits.join(', ')}
Season: ${season}

Suggest a name and flavor text.`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 80,
        temperature: 0.9,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) return { name: '', flavor_text: '' };

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '{}';

    // Strip markdown fences if present
    const clean = text.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(clean);

    // Safety check
    const nameLC = (parsed.name || '').toLowerCase();
    const flavorLC = (parsed.flavor_text || '').toLowerCase();
    for (const word of SAFETY_WORDS) {
      if (nameLC.includes(word) || flavorLC.includes(word)) {
        return { name: '', flavor_text: '' };
      }
    }

    return {
      name: parsed.name || '',
      flavor_text: parsed.flavor_text || '',
    };
  } catch {
    return { name: '', flavor_text: '' };
  }
}
