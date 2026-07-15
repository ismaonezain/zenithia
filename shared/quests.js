// Zenithia — Quest Data
// Main story + side quests

const QUESTS = {
  // ═══════════════════════════════════════
  // ACT 1: THE QUIET VILLAGE (Lv 1-10)
  // ═══════════════════════════════════════

  // --- Chapter 1: Newcomer ---
  meet_elder: {
    id: 'meet_elder',
    name: 'Meet the Elder',
    type: 'main',
    chapter: 1,
    description: 'Talk to Elder Maren in the Elder\'s Hall.',
    objectives: [
      { id: 'talk_maren', type: 'talk', target: 'elder_maren', current: 0, required: 1, text: 'Talk to Elder Maren' },
    ],
    rewards: { xp: 50, reputation: { elder_maren: 2 } },
    next: 'harvest_help',
    autoStart: true, // starts when player joins
  },

  harvest_help: {
    id: 'harvest_help',
    name: 'Harvest Help',
    type: 'main',
    chapter: 1,
    description: 'Help Mr. Tani protect the farm from Moss Beetles.',
    objectives: [
      { id: 'talk_tani', type: 'talk', target: 'mr_tani', current: 0, required: 1, text: 'Talk to Mr. Tani' },
      { id: 'kill_beetles', type: 'kill', target: 'moss_beetle', current: 0, required: 5, text: 'Defeat 5 Moss Beetles near the farm' },
      { id: 'return_tani', type: 'talk', target: 'mr_tani', current: 0, required: 1, text: 'Return to Mr. Tani' },
    ],
    rewards: { xp: 100, items: [{ id: 'willow_rice', quantity: 3 }], reputation: { mr_tani: 3 } },
    next: 'first_steps',
  },

  // --- Chapter 2: First Steps ---
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    type: 'main',
    chapter: 2,
    description: 'Learn combat basics and defeat your first monsters.',
    objectives: [
      { id: 'talk_ren', type: 'talk', target: 'guard_ren', current: 0, required: 1, text: 'Talk to Guard Ren' },
      { id: 'kill_beetles', type: 'kill', target: 'moss_beetle', current: 0, required: 3, text: 'Defeat 3 Moss Beetles' },
    ],
    rewards: { xp: 150, items: [{ id: 'potion_small', quantity: 5 }], reputation: { guard_ren: 2 } },
    next: 'gather_thorn',
  },

  gather_thorn: {
    id: 'gather_thorn',
    name: 'Thorn Collection',
    type: 'main',
    chapter: 2,
    description: 'Collect thorns from Thorn Lizards in the forest.',
    objectives: [
      { id: 'kill_lizards', type: 'kill', target: 'thorn_lizard', current: 0, required: 3, text: 'Defeat 3 Thorn Lizards' },
      { id: 'gather_thorns', type: 'gather', target: 'thorn', current: 0, required: 5, text: 'Collect 5 Thorns' },
    ],
    rewards: { xp: 200, items: [{ id: 'potion_small', quantity: 3 }, { id: 'mp_potion_small', quantity: 2 }], reputation: { guard_ren: 1 } },
    next: 'forest_mystery',
  },

  // --- Chapter 3: The Forest Mystery ---
  forest_mystery: {
    id: 'forest_mystery',
    name: 'The Forest Mystery',
    type: 'main',
    chapter: 3,
    description: 'Investigate strange activity in the Willow Forest.',
    objectives: [
      { id: 'talk_maren2', type: 'talk', target: 'elder_maren', current: 0, required: 1, text: 'Talk to Elder Maren' },
      { id: 'investigate', type: 'explore', target: 'willow_forest', current: 0, required: 1, text: 'Explore the Willow Forest' },
    ],
    rewards: { xp: 250, reputation: { elder_maren: 2 } },
    next: 'wind_sprites',
  },

  wind_sprites: {
    id: 'wind_sprites',
    name: 'Wind Essence',
    type: 'main',
    chapter: 3,
    description: 'WindSprites are stealing items! Collect Wind Essence.',
    objectives: [
      { id: 'kill_sprites', type: 'kill', target: 'wind_sprite', current: 0, required: 3, text: 'Defeat 3 Wind Sprites' },
      { id: 'gather_essence', type: 'gather', target: 'wind_essence', current: 0, required: 3, text: 'Collect 3 Wind Essences' },
    ],
    rewards: { xp: 350, items: [{ id: 'wind_charm', quantity: 1 }], reputation: { elder_maren: 3 } },
    next: null, // end of Chapter 3 for now
  },

  // ═══════════════════════════════════════
  // SIDE QUESTS
  // ═══════════════════════════════════════

  train_lira: {
    id: 'train_lira',
    name: 'Training with Lira',
    type: 'side',
    chapter: 1,
    description: 'Help Miss Lira practice combat.',
    objectives: [
      { id: 'talk_lira', type: 'talk', target: 'miss_lira', current: 0, required: 1, text: 'Talk to Miss Lira' },
      { id: 'train_beetles', type: 'kill', target: 'moss_beetle', current: 0, required: 2, text: 'Defeat 2 Moss Beetles (with Lira)' },
      { id: 'return_lira', type: 'talk', target: 'miss_lira', current: 0, required: 1, text: 'Return to Miss Lira' },
    ],
    rewards: { xp: 120, reputation: { miss_lira: 3 } },
  },

  guard_patrol: {
    id: 'guard_patrol',
    name: 'Guard Patrol',
    type: 'side',
    chapter: 1,
    description: 'Help Guard Ren patrol the village perimeter.',
    objectives: [
      { id: 'talk_ren2', type: 'talk', target: 'guard_ren', current: 0, required: 1, text: 'Talk to Guard Ren' },
      { id: 'patrol_mice', type: 'kill', target: 'dust_mouse', current: 0, required: 5, text: 'Clear 5 Dust Mice from the farm' },
      { id: 'return_ren', type: 'talk', target: 'guard_ren', current: 0, required: 1, text: 'Return to Guard Ren' },
    ],
    rewards: { xp: 130, items: [{ id: 'potion_small', quantity: 3 }], reputation: { guard_ren: 2 } },
  },

  sir_gendut_delivery: {
    id: 'sir_gendut_delivery',
    name: 'Supply Run',
    type: 'side',
    chapter: 1,
    description: 'Deliver supplies from Sir Gendut to Herbalist Sari.',
    objectives: [
      { id: 'talk_gendut', type: 'talk', target: 'sir_gendut', current: 0, required: 1, text: 'Talk to Sir Gendut' },
      { id: 'talk_sari', type: 'talk', target: 'herbalist_sari', current: 0, required: 1, text: 'Deliver to Herbalist Sari' },
      { id: 'return_gendut', type: 'talk', target: 'sir_gendut', current: 0, required: 1, text: 'Return to Sir Gendut' },
    ],
    rewards: { xp: 80, items: [{ id: 'potion_small', quantity: 2 }], reputation: { sir_gendut: 2, herbalist_sari: 1 } },
  },

  frog_legs_for_ningsih: {
    id: 'frog_legs_for_ningsih',
    name: 'Frog Legs Special',
    type: 'side',
    chapter: 1,
    description: 'Mrs. Ningsih needs frog legs for her special recipe.',
    objectives: [
      { id: 'talk_ningsih', type: 'talk', target: 'mrs_ningsih', current: 0, required: 1, text: 'Talk to Mrs. Ningsih' },
      { id: 'gather_frogs', type: 'gather', target: 'frog_leg', current: 0, required: 5, text: 'Collect 5 Frog Legs' },
      { id: 'return_ningsih', type: 'talk', target: 'mrs_ningsih', current: 0, required: 1, text: 'Return to Mrs. Ningsih' },
    ],
    rewards: { xp: 100, items: [{ id: 'chicken_stew', quantity: 3 }], reputation: { mrs_ningsih: 3 } },
  },

  kris_prank: {
    id: 'kris_prank',
    name: 'Kris\'s Prank',
    type: 'side',
    chapter: 1,
    description: 'Help Kris pull a prank on the village.',
    objectives: [
      { id: 'talk_kris', type: 'talk', target: 'kris', current: 0, required: 1, text: 'Talk to Kris' },
      { id: 'gather_moss', type: 'gather', target: 'moss_shell', current: 0, required: 3, text: 'Collect 3 Moss Shells (for the prank)' },
      { id: 'return_kris', type: 'talk', target: 'kris', current: 0, required: 1, text: 'Return to Kris' },
    ],
    rewards: { xp: 60, reputation: { kris: 2 } },
  },

  sari_aether_secret: {
    id: 'sari_aether_secret',
    name: 'Aether Research',
    type: 'side',
    chapter: 2,
    description: 'Help Herbalist Sari with her Aether research.',
    objectives: [
      { id: 'talk_sari2', type: 'talk', target: 'herbalist_sari', current: 0, required: 1, text: 'Talk to Herbalist Sari' },
      { id: 'gather_essences', type: 'gather', target: 'wind_essence', current: 0, required: 3, text: 'Collect 3 Wind Essences' },
      { id: 'gather_shells', type: 'gather', target: 'moss_shell', current: 0, required: 5, text: 'Collect 5 Moss Shells' },
      { id: 'return_sari', type: 'talk', target: 'herbalist_sari', current: 0, required: 1, text: 'Return to Herbalist Sari' },
    ],
    rewards: { xp: 250, items: [{ id: 'aether_pendant', quantity: 1 }], reputation: { herbalist_sari: 4 } },
  },

  bramble_hunt: {
    id: 'bramble_hunt',
    name: 'Bramble Boar Hunt',
    type: 'side',
    chapter: 2,
    description: 'A Bramble Boar is terrorizing the northern path.',
    objectives: [
      { id: 'talk_ren3', type: 'talk', target: 'guard_ren', current: 0, required: 1, text: 'Talk to Guard Ren' },
      { id: 'kill_boar', type: 'kill', target: 'bramble_boar', current: 0, required: 1, text: 'Defeat the Bramble Boar' },
      { id: 'return_ren3', type: 'talk', target: 'guard_ren', current: 0, required: 1, text: 'Report to Guard Ren' },
    ],
    rewards: { xp: 500, items: [{ id: 'boar_tusk', quantity: 3 }], reputation: { guard_ren: 3 } },
  },
  // ═══════════════════════════════════════
  // DAILY QUESTS (repeatable every 24h)
  // ═══════════════════════════════════════
  daily_beetle_hunt: {
    id: 'daily_beetle_hunt',
    name: 'Beetle Bounty',
    type: 'daily',
    description: 'Defeat 10 Moss Beetles for Mr. Tani. Resets daily.',
    objectives: [
      { id: 'kill_beetles', type: 'kill', target: 'moss_beetle', current: 0, required: 10, text: 'Defeat 10 Moss Beetles' },
    ],
    rewards: { xp: 150, gold: 50 },
    repeatable: true,
    cooldown: 24 * 60 * 60 * 1000,
  },
  daily_mouse_clear: {
    id: 'daily_mouse_clear',
    name: 'Mouse Menace',
    type: 'daily',
    description: 'Clear 15 Dust Mice from the village perimeter.',
    objectives: [
      { id: 'kill_mice', type: 'kill', target: 'dust_mouse', current: 0, required: 15, text: 'Defeat 15 Dust Mice' },
    ],
    rewards: { xp: 120, gold: 40 },
    repeatable: true,
    cooldown: 24 * 60 * 60 * 1000,
  },
  daily_herb_gather: {
    id: 'daily_herb_gather',
    name: 'Herb Collection',
    type: 'daily',
    description: 'Gather herbs for Herbalist Sari.',
    objectives: [
      { id: 'gather_herbs', type: 'gather', target: 'moss_shell', current: 0, required: 8, text: 'Collect 8 Moss Shells' },
    ],
    rewards: { xp: 100, gold: 30, items: [{ id: 'potion_small', quantity: 3 }] },
    repeatable: true,
    cooldown: 24 * 60 * 60 * 1000,
  },
  daily_fishing: {
    id: 'daily_fishing',
    name: 'Daily Catch',
    type: 'daily',
    description: 'Catch 5 fish for Mrs. Ningsih.',
    objectives: [
      { id: 'catch_fish', type: 'fish', current: 0, required: 5, text: 'Catch 5 Fish' },
    ],
    rewards: { xp: 80, gold: 25, items: [{ id: 'frog_leg', quantity: 2 }] },
    repeatable: true,
    cooldown: 24 * 60 * 60 * 1000,
  },
  // ═══════════════════════════════════════
  // REPEATABLE QUESTS (cooldown-based)
  // ═══════════════════════════════════════
  rep_lizard_hunt: {
    id: 'rep_lizard_hunt',
    name: 'Lizard Extermination',
    type: 'repeatable',
    description: 'Defeat Thorn Lizards in the forest.',
    objectives: [
      { id: 'kill_lizards', type: 'kill', target: 'thorn_lizard', current: 0, required: 8, text: 'Defeat 8 Thorn Lizards' },
    ],
    rewards: { xp: 200, gold: 60, items: [{ id: 'thorn', quantity: 3 }] },
    repeatable: true,
    cooldown: 30 * 60 * 1000,
  },
  rep_sprite_hunt: {
    id: 'rep_sprite_hunt',
    name: 'Sprite Slayers',
    type: 'repeatable',
    description: 'Defeat Wind Sprites in the mountains.',
    objectives: [
      { id: 'kill_sprites', type: 'kill', target: 'wind_sprite', current: 0, required: 5, text: 'Defeat 5 Wind Sprites' },
    ],
    rewards: { xp: 250, gold: 80, items: [{ id: 'wind_essence', quantity: 2 }] },
    repeatable: true,
    cooldown: 45 * 60 * 1000,
  },
  rep_boar_hunt: {
    id: 'rep_boar_hunt',
    name: 'Boar Buster',
    type: 'repeatable',
    description: 'Hunt Bramble Boars in the deep forest.',
    objectives: [
      { id: 'kill_boars', type: 'kill', target: 'bramble_boar', current: 0, required: 3, text: 'Defeat 3 Bramble Boars' },
    ],
    rewards: { xp: 350, gold: 100, items: [{ id: 'boar_tusk', quantity: 2 }] },
    repeatable: true,
    cooldown: 60 * 60 * 1000,
  },
  rep_stone_gather: {
    id: 'rep_stone_gather',
    name: 'Stone Collector',
    type: 'repeatable',
    description: 'Gather stone fragments from Rock Crawlers.',
    objectives: [
      { id: 'kill_crawlers', type: 'kill', target: 'rock_crawler', current: 0, required: 6, text: 'Defeat 6 Rock Crawlers' },
    ],
    rewards: { xp: 200, gold: 50, items: [{ id: 'stone_fragment', quantity: 4 }] },
    repeatable: true,
    cooldown: 30 * 60 * 1000,
  },
  rep_volcanic_scout: {
    id: 'rep_volcanic_scout',
    name: 'Volcanic Recon',
    type: 'repeatable',
    description: 'Scout the Volcanic Wastes. Defeat fire creatures.',
    objectives: [
      { id: 'kill_volcanic', type: 'kill', target: 'lava_slime', current: 0, required: 10, text: 'Defeat 10 Lava Slimes' },
      { id: 'kill_salamanders', type: 'kill', target: 'fire_salamander', current: 0, required: 5, text: 'Defeat 5 Fire Salamanders' },
    ],
    rewards: { xp: 500, gold: 150, items: [{ id: 'lava_essence', quantity: 3 }] },
    repeatable: true,
    cooldown: 2 * 60 * 60 * 1000,
  },
  rep_crystal_clear: {
    id: 'rep_crystal_clear',
    name: 'Crystal Purge',
    type: 'repeatable',
    description: 'Clear crystal creatures from the caverns.',
    objectives: [
      { id: 'kill_spiders', type: 'kill', target: 'crystal_spider', current: 0, required: 8, text: 'Defeat 8 Crystal Spiders' },
      { id: 'kill_scorpions', type: 'kill', target: 'gem_scorpion', current: 0, required: 5, text: 'Defeat 5 Gem Scorpions' },
    ],
    rewards: { xp: 800, gold: 250, items: [{ id: 'crystal_shard', quantity: 5 }] },
    repeatable: true,
    cooldown: 3 * 60 * 60 * 1000,
  },
};

// Quest availability by NPC
const NPC_QUESTS = {
  elder_maren: ['meet_elder', 'harvest_help', 'forest_mystery'],
  mr_tani: ['harvest_help', 'daily_beetle_hunt'],
  guard_ren: ['first_steps', 'guard_patrol', 'bramble_hunt', 'daily_mouse_clear'],
  miss_lira: ['train_lira'],
  sir_gendut: ['sir_gendut_delivery'],
  mrs_ningsih: ['frog_legs_for_ningsih', 'daily_fishing'],
  kris: ['kris_prank'],
  herbalist_sari: ['sari_aether_secret', 'daily_herb_gather', 'rep_stone_gather'],
  // Repeatable quest givers (can be assigned to various NPCs)
  forest_hunter: ['rep_lizard_hunt', 'rep_sprite_hunt', 'rep_boar_hunt'],
  zone_scout: ['rep_volcanic_scout', 'rep_crystal_clear'],
};

module.exports = { QUESTS, NPC_QUESTS };
