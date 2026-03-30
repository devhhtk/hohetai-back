// ============================================================
// RARITY SYSTEM SIMULATION
// Run: node test/simulate-rarity.js
// Validates ARS-shifted probability distribution at all tiers
// ============================================================

// Inline the functions for standalone testing
const BASE = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 0.9, primatrope: 0.08, megatrope: 0.02 };
const MAX  = { common: 40, uncommon: 30, rare: 18, epic: 8, legendary: 3, primatrope: 0.7, megatrope: 0.3 };
const TIERS = Object.keys(BASE);

function rollRarity(ars) {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const t of TIERS) {
    cum += BASE[t] + (MAX[t] - BASE[t]) * ars;
    if (roll < cum) return t;
  }
  return 'common';
}

function simulate(ars, n = 100000) {
  const counts = {};
  for (let i = 0; i < n; i++) {
    const tier = rollRarity(ars);
    counts[tier] = (counts[tier] || 0) + 1;
  }
  return counts;
}

console.log('═══════════════════════════════════════');
console.log('AUMAGE RARITY SIMULATION (100k per ARS)');
console.log('═══════════════════════════════════════\n');

let allPass = true;

for (const ars of [0, 0.25, 0.5, 0.75, 1.0]) {
  const counts = simulate(ars);
  console.log(`ARS = ${ars.toFixed(2)}`);
  console.log('─────────────────────────────────────');

  for (const tier of TIERS) {
    const expected = BASE[tier] + (MAX[tier] - BASE[tier]) * ars;
    const actual = (counts[tier] || 0) / 1000;
    const diff = Math.abs(expected - actual);
    const tolerance = Math.max(expected * 0.3, 0.1); // 30% or 0.1% absolute
    const pass = diff < tolerance;
    if (!pass) allPass = false;

    const status = pass ? '✅' : '❌';
    console.log(`  ${status} ${tier.padEnd(12)} expected ${expected.toFixed(2).padStart(6)}%  actual ${actual.toFixed(2).padStart(6)}%  (Δ ${diff.toFixed(2)}%)`);
  }
  console.log();
}

// Odds comparison
console.log('═══════════════════════════════════════');
console.log('WHISPER vs SYMPHONY — Odds Multiplier');
console.log('═══════════════════════════════════════\n');
for (const t of TIERS) {
  const mult = (MAX[t] / BASE[t]).toFixed(1);
  console.log(`  ${t.padEnd(12)} ${BASE[t].toFixed(2)}% → ${MAX[t].toFixed(2)}%  (${mult}x)`);
}

console.log(`\n${allPass ? '✅ ALL DISTRIBUTIONS WITHIN TOLERANCE' : '❌ SOME DISTRIBUTIONS OUT OF TOLERANCE'}`);
process.exit(allPass ? 0 : 1);
