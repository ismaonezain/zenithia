// Zenithia — Shared Constants

const CONSTANTS = {
  // Server
  PORT: 2567,
  TICK_RATE: 20, // server ticks per second

  // World
  WORLD_SIZE: 500, // world units
  TILE_SIZE: 2,

  // Player
  PLAYER_SPEED: 5,
  PLAYER_HEIGHT: 1.6,
  PLAYER_SIZE: { w: 0.6, h: 1.6, d: 0.4 },

  // Combat
  BASE_HP: 100,
  BASE_MP: 50,
  BASE_ATK: 10,
  BASE_DEF: 5,
  BASE_SPD: 10,
  BASE_CRIT: 0.05,
  DAMAGE_CAP: 99999,

  // XP
  XP_TABLE: {
    1: 100, 2: 100, 3: 100, 4: 100, 5: 100,
    6: 100, 7: 100, 8: 100, 9: 100, 10: 100,
    11: 300, 12: 300, 13: 300, 14: 300, 15: 300,
    16: 300, 17: 300, 18: 300, 19: 300, 20: 300,
    21: 800, 22: 800, 23: 800, 24: 800, 25: 800,
    26: 800, 27: 800, 28: 800, 29: 800, 30: 800,
  },

  // Stat growth per level
  CLASS_GROWTH: {
    guardian:     { hp: 15, mp: 3, atk: 2, def: 4, spd: 1 },
    blade_dancer: { hp: 8,  mp: 5, atk: 5, def: 1, spd: 4 },
    sage:         { hp: 7,  mp: 8, atk: 4, def: 2, spd: 3 },
    cleric:       { hp: 12, mp: 7, atk: 1, def: 3, spd: 2 },
    shadow:       { hp: 9,  mp: 5, atk: 4, def: 2, spd: 5 },
  },

  // Village → True class names
  CLASS_NAMES: {
    laborer:      'guardian',
    miner:        'blade_dancer',
    gardener:     'sage',
    herbalist:    'cleric',
    watchman:     'shadow',
  },

  // Regions
  REGIONS: {
    willowmere:    { name: 'Willowmere',    level: [1, 10] },
    emerald_plains:{ name: 'Emerald Plains', level: [10, 25] },
    frostmere:     { name: 'Frostmere',     level: [20, 40] },
    ember_peaks:   { name: 'Ember Peaks',   level: [30, 50] },
    deepwood:      { name: 'Deepwood',      level: [40, 60] },
  },
};

// Server-side use
if (typeof module !== 'undefined') {
  module.exports = CONSTANTS;
}
