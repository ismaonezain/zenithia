// Zenithia — Fishing & Gathering System

// ═══════════════════════════════════════
// FISHING SPOTS (along the river)
// ═══════════════════════════════════════
const FISHING_SPOTS = [
  { id: 'fish_1', x: -8, z: 1, name: 'River Bank West', description: 'Spot tenang di barat jembatan.' },
  { id: 'fish_2', x: 8, z: 2, name: 'River Bank East', description: 'Area pancing di timur desa.' },
  { id: 'fish_3', x: 0, z: -1, name: 'Bridge Fishing', description: 'Pancing dari jembatan utama.' },
];

// Fishing loot table — itemId, chance (0-1), qty range
const FISHING_LOOT = [
  { itemId: 'smoked_fish', chance: 0.35, qty: [1, 1], name: 'Smoked Fish' },
  { itemId: 'frog_leg', chance: 0.25, qty: [1, 2], name: 'Frog Leg' },
  { itemId: 'moss_shell', chance: 0.15, qty: [1, 1], name: 'Moss Shell' },
  { itemId: 'wind_essence', chance: 0.08, qty: [1, 1], name: 'Wind Essence' },
  { itemId: 'stone_fragment', chance: 0.10, qty: [1, 1], name: 'Stone Fragment' },
  { itemId: 'herb_bundle', chance: 0.07, qty: [1, 1], name: 'Herb Bundle' },
];

// ═══════════════════════════════════════
// GATHERING NODES (scattered around map)
// ═══════════════════════════════════════
const GATHERING_NODES = [
  // Herb nodes — near village
  { id: 'herb_1', type: 'herb', x: -12, z: 8, name: 'Wild Herbs', respawnTime: 60 },
  { id: 'herb_2', type: 'herb', x: -18, z: -5, name: 'Forest Herbs', respawnTime: 60 },
  { id: 'herb_3', type: 'herb', x: 14, z: 10, name: 'Meadow Herbs', respawnTime: 60 },
  { id: 'herb_4', type: 'herb', x: -6, z: -15, name: 'River Herbs', respawnTime: 60 },

  // Rock nodes — near mountains
  { id: 'rock_1', type: 'rock', x: -20, z: -12, name: 'Stone Outcrop', respawnTime: 90 },
  { id: 'rock_2', type: 'rock', x: 18, z: -8, name: 'Rocky Terrain', respawnTime: 90 },
  { id: 'rock_3', type: 'rock', x: -15, z: 18, name: 'Stone Deposit', respawnTime: 90 },

  // Wood nodes — near trees
  { id: 'wood_1', type: 'wood', x: 10, z: 15, name: 'Fallen Log', respawnTime: 75 },
  { id: 'wood_2', type: 'wood', x: -10, z: -20, name: 'Old Stump', respawnTime: 75 },
  { id: 'wood_3', type: 'wood', x: 20, z: 5, name: 'Dry Branches', respawnTime: 75 },
];

// Gathering loot by node type
const GATHERING_LOOT = {
  herb: [
    { itemId: 'thorn', chance: 0.40, qty: [1, 2], name: 'Thorn' },
    { itemId: 'dust_pouch', chance: 0.25, qty: [1, 1], name: 'Dust Pouch' },
    { itemId: 'herb_bundle', chance: 0.20, qty: [1, 1], name: 'Herb Bundle' },
    { itemId: 'frog_leg', chance: 0.15, qty: [1, 1], name: 'Frog Leg' },
  ],
  rock: [
    { itemId: 'stone_fragment', chance: 0.45, qty: [1, 3], name: 'Stone Fragment' },
    { itemId: 'moss_shell', chance: 0.25, qty: [1, 1], name: 'Moss Shell' },
    { itemId: 'boar_tusk', chance: 0.15, qty: [1, 1], name: 'Boar Tusk' },
    { itemId: 'bramble_core', chance: 0.10, qty: [1, 1], name: 'Bramble Core' },
    { itemId: 'turtle_shell', chance: 0.05, qty: [1, 1], name: 'Turtle Shell' },
  ],
  wood: [
    { itemId: 'thorn', chance: 0.35, qty: [1, 2], name: 'Thorn' },
    { itemId: 'dust_pouch', chance: 0.30, qty: [1, 2], name: 'Dust Pouch' },
    { itemId: 'wind_essence', chance: 0.15, qty: [1, 1], name: 'Wind Essence' },
    { itemId: 'frog_leg', chance: 0.15, qty: [1, 1], name: 'Frog Leg' },
  ],
};

// Fishing mini-game settings
const FISHING_settings = {
  castTime: 2000,      // 2 seconds to cast
  biteWindow: 3000,    // 3 second window for fish to bite
  reelTime: 1500,      // 1.5 seconds to reel in
  difficulty: 0.6,     // 60% success rate base
};

module.exports = { FISHING_SPOTS, FISHING_LOOT, GATHERING_NODES, GATHERING_LOOT, FISHING_settings };
