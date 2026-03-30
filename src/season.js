// season.js — Determine creature season

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const SEASON_LORE = {
  spring: { label: 'Vernal',  symbol: '◈', description: 'Born of awakening' },
  summer: { label: 'Estival', symbol: '◉', description: 'Born of intensity' },
  autumn: { label: 'Autumnal',symbol: '◆', description: 'Born of transition' },
  winter: { label: 'Hibernal',symbol: '◇', description: 'Born of stillness' },
};

export function getCurrentSeason() {
  const month = new Date().getMonth(); // 0–11
  if (month >= 2 && month <= 4)  return 'spring';
  if (month >= 5 && month <= 7)  return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getSeasonFromAudio(audioFeatures) {
  // Allow audio features to slightly shift the season
  const { energy = 0.5, tempo = 100 } = audioFeatures || {};
  const base = getCurrentSeason();

  // Very high energy creatures get a "hotter" season
  if (energy > 0.9 && base !== 'summer') return 'summer';
  // Very quiet creatures get winter
  if (energy < 0.1 && base !== 'winter') return 'winter';

  return base;
}

export function getSeasonLore(season) {
  return SEASON_LORE[season] || SEASON_LORE.spring;
}
