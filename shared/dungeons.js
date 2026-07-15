// Zenithia — Dungeon Definitions
// Solo/party instanced content with timed runs and leaderboards

const DUNGEONS = {
  goblin_cave: {
    id: 'goblin_cave',
    name: 'Goblin Cave',
    description: 'Gua gelap penuh monster. Solo-friendly.',
    minLevel: 5,
    maxPlayers: 1,
    timeLimit: 300, // 5 minutes
    zone: 'thornwood',
    waves: [
      { mobs: [{ type: 'dust_mouse', count: 5 }], delay: 3000 },
      { mobs: [{ type: 'moss_beetle', count: 4 }, { type: 'thorn_lizard', count: 2 }], delay: 5000 },
      { mobs: [{ type: 'wind_sprite', count: 3 }], delay: 5000 },
      { boss: 'thornback_ancient', delay: 8000 },
    ],
    rewards: {
      xp: 200,
      gold: 50,
      items: [
        { itemId: 'potion_medium', qty: 3, chance: 1.0 },
        { itemId: 'bramble_core', qty: 2, chance: 0.5 },
        { itemId: 'ironclad_edge', qty: 1, chance: 0.05 },
      ],
    },
    cooldown: 0, // no cooldown for basic dungeons
    entryCost: 0,
  },

  volcanic_depths: {
    id: 'volcanic_depths',
    name: 'Volcanic Depths',
    description: 'Dalam gunung berapi. Panas dan berbahaya.',
    minLevel: 15,
    maxPlayers: 3,
    timeLimit: 420, // 7 minutes
    zone: 'volcanic',
    waves: [
      { mobs: [{ type: 'lava_slime', count: 6 }], delay: 3000 },
      { mobs: [{ type: 'fire_salamander', count: 4 }, { type: 'lava_slime', count: 3 }], delay: 5000 },
      { mobs: [{ type: 'magma_golem', count: 3 }], delay: 6000 },
      { mobs: [{ type: 'ember_hawk', count: 4 }, { type: 'magma_golem', count: 2 }], delay: 5000 },
      { boss: 'inferno_titan', delay: 10000 },
    ],
    rewards: {
      xp: 600,
      gold: 150,
      items: [
        { itemId: 'potion_large', qty: 3, chance: 1.0 },
        { itemId: 'magma_core', qty: 3, chance: 0.6 },
        { itemId: 'lava_essence', qty: 5, chance: 0.8 },
        { itemId: 'titan_breaker', qty: 1, chance: 0.03 },
        { itemId: 'titan_plate', qty: 1, chance: 0.03 },
      ],
    },
    cooldown: 60 * 60 * 1000, // 1 hour
    entryCost: 100,
  },

  crystal_maze: {
    id: 'crystal_maze',
    name: 'Crystal Maze',
    description: 'Labirin kristal. Membingungkan tapi penuh harta.',
    minLevel: 25,
    maxPlayers: 4,
    timeLimit: 540, // 9 minutes
    zone: 'crystal',
    waves: [
      { mobs: [{ type: 'crystal_spider', count: 6 }], delay: 3000 },
      { mobs: [{ type: 'gem_scorpion', count: 5 }, { type: 'crystal_spider', count: 3 }], delay: 5000 },
      { mobs: [{ type: 'prism_wraith', count: 4 }], delay: 6000 },
      { mobs: [{ type: 'diamond_golem', count: 3 }, { type: 'prism_wraith', count: 2 }], delay: 5000 },
      { boss: 'crystal_queen', delay: 12000 },
    ],
    rewards: {
      xp: 1200,
      gold: 300,
      items: [
        { itemId: 'potion_large', qty: 5, chance: 1.0 },
        { itemId: 'prism_core', qty: 3, chance: 0.6 },
        { itemId: 'crystal_shard', qty: 8, chance: 0.8 },
        { itemId: 'void_blade', qty: 1, chance: 0.02 },
        { itemId: 'ancient_staff', qty: 1, chance: 0.02 },
      ],
    },
    cooldown: 2 * 60 * 60 * 1000, // 2 hours
    entryCost: 300,
  },

  sky_temple: {
    id: 'sky_temple',
    name: 'Sky Temple',
    description: 'Kuil terbang di atas awan. Hanya yang terkuat.',
    minLevel: 35,
    maxPlayers: 5,
    timeLimit: 660, // 11 minutes
    zone: 'sky_ruins',
    waves: [
      { mobs: [{ type: 'storm_elemental', count: 6 }], delay: 3000 },
      { mobs: [{ type: 'cloud_serpent', count: 5 }, { type: 'storm_elemental', count: 3 }], delay: 5000 },
      { mobs: [{ type: 'sky_knight', count: 4 }], delay: 6000 },
      { mobs: [{ type: 'thunder_bird', count: 3 }, { type: 'sky_knight', count: 3 }], delay: 5000 },
      { boss: 'sky_dragon', delay: 15000 },
    ],
    rewards: {
      xp: 2500,
      gold: 600,
      items: [
        { itemId: 'potion_large', qty: 5, chance: 1.0 },
        { itemId: 'storm_essence', qty: 5, chance: 0.7 },
        { itemId: 'sky_feather', qty: 3, chance: 0.5 },
        { itemId: 'chaos_breaker', qty: 1, chance: 0.015 },
        { itemId: 'eternity_blade', qty: 1, chance: 0.015 },
        { itemId: 'cosmos_staff', qty: 1, chance: 0.015 },
      ],
    },
    cooldown: 3 * 60 * 60 * 1000, // 3 hours
    entryCost: 500,
  },

  abyss_gate: {
    id: 'abyss_gate',
    name: 'Abyss Gate',
    description: 'Gerbang ke kegelapan. Endgame dungeon.',
    minLevel: 45,
    maxPlayers: 5,
    timeLimit: 900, // 15 minutes
    zone: 'abyss',
    waves: [
      { mobs: [{ type: 'void_stalker', count: 6 }], delay: 3000 },
      { mobs: [{ type: 'shadow_beast', count: 5 }, { type: 'void_stalker', count: 3 }], delay: 5000 },
      { mobs: [{ type: 'abyssal_worm', count: 4 }], delay: 6000 },
      { mobs: [{ type: 'shadow_beast', count: 4 }, { type: 'abyssal_worm', count: 3 }], delay: 5000 },
      { mobs: [{ type: 'chaos_lord', count: 2 }], delay: 8000 },
      { boss: 'chaos_emperor', delay: 15000 },
    ],
    rewards: {
      xp: 5000,
      gold: 1500,
      items: [
        { itemId: 'potion_large', qty: 10, chance: 1.0 },
        { itemId: 'void_essence', qty: 5, chance: 0.7 },
        { itemId: 'chaos_core', qty: 3, chance: 0.5 },
        { itemId: 'worldsplitter', qty: 1, chance: 0.01 },
        { itemId: 'infinity_edge', qty: 1, chance: 0.01 },
        { itemId: 'omniscient_staff', qty: 1, chance: 0.01 },
        { itemId: 'worldplate', qty: 1, chance: 0.01 },
      ],
    },
    cooldown: 6 * 60 * 60 * 1000, // 6 hours
    entryCost: 1000,
  },
};

module.exports = { DUNGEONS };
