// Zenithia — World Boss Definitions
// Bosses spawn periodically, require group effort, drop rare loot

const WORLD_BOSSES = {
  thornback_ancient: {
    name: 'Thornback Ancient',
    title: 'World Boss',
    zone: 'willowmere',
    level: 8,
    hp: 600,
    atk: 20,
    def: 12,
    spd: 4,
    xp: 500,
    color: 0x33691E,
    accentColor: 0x76FF03,
    size: 2.0,
    aggroRange: 20,
    attackRange: 2.5,
    attackSpeed: 1.5,
    behavior: 'boss',
    abilities: [
      { name: 'slam', damage: 30, radius: 4, cooldown: 8000, chance: 0.3, description: 'AoE slam damage' },
      { name: 'summon', count: 2, type: 'thorn_lizard', cooldown: 15000, chance: 0.2, description: 'Summons thorn lizard minions' },
      { name: 'charge', damage: 40, range: 10, cooldown: 10000, chance: 0.25, description: 'Charges at target' },
    ],
    spawnInterval: 20 * 60 * 1000, // 20 minutes
    spawnAreas: [
      { x: 0, z: -25, radius: 10 },
      { x: -15, z: -10, radius: 8 },
      { x: 15, z: -10, radius: 8 },
    ],
    loot: [
      { itemId: 'bramble_core', qty: [3, 5], chance: 1.0 },
      { itemId: 'turtle_shell', qty: [2, 3], chance: 0.8 },
      { itemId: 'boar_tusk', qty: [3, 5], chance: 0.9 },
      { itemId: 'ancient_heart', qty: [1, 1], chance: 0.15 },
    ],
    xpReward: 500,
    announceLeadTime: 60000, // announce 1 minute before spawn
  },

  // ═══════════════════════════════════════
  // THORNWOOD FOREST — Lv.5 Boss
  // ═══════════════════════════════════════
  forest_guardian: {
    name: 'Forest Guardian',
    title: 'Thornwood Boss',
    zone: 'thornwood',
    level: 5,
    hp: 350,
    atk: 14,
    def: 8,
    spd: 3,
    xp: 300,
    color: 0x1B5E20,
    accentColor: 0x76FF03,
    size: 1.8,
    aggroRange: 18,
    attackRange: 3,
    attackSpeed: 1.2,
    behavior: 'boss',
    abilities: [
      { name: 'root_trap', damage: 15, radius: 5, cooldown: 10000, chance: 0.35, description: 'Roots entangle players in area' },
      { name: 'summon', count: 3, type: 'thorn_lizard', cooldown: 12000, chance: 0.25, description: 'Summons thorn lizard guards' },
      { name: 'bark_slam', damage: 25, radius: 3, cooldown: 6000, chance: 0.3, description: 'Slams ground with massive branches' },
    ],
    spawnInterval: 25 * 60 * 1000, // 25 minutes
    spawnAreas: [
      { x: -20, z: 0, radius: 10 },
      { x: 0, z: -20, radius: 8 },
    ],
    loot: [
      { itemId: 'bramble_core', qty: [2, 4], chance: 1.0 },
      { itemId: 'thorn', qty: [5, 8], chance: 0.9 },
      { itemId: 'wind_essence', qty: [2, 3], chance: 0.7 },
      { itemId: 'ancient_heart', qty: [1, 1], chance: 0.1 },
    ],
    xpReward: 300,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // STORMCREST MOUNTAINS — Lv.7 Boss
  // ═══════════════════════════════════════
  storm_titan: {
    name: 'Storm Titan',
    title: 'Mountain Boss',
    zone: 'stormcrest',
    level: 7,
    hp: 500,
    atk: 18,
    def: 15,
    spd: 2,
    xp: 400,
    color: 0x546E7A,
    accentColor: 0xFFD54F,
    size: 2.2,
    aggroRange: 20,
    attackRange: 3.5,
    attackSpeed: 1.0,
    behavior: 'boss',
    abilities: [
      { name: 'boulder_throw', damage: 35, range: 12, cooldown: 8000, chance: 0.3, description: 'Hurls boulder at furthest target' },
      { name: 'lightning_strike', damage: 25, radius: 4, cooldown: 10000, chance: 0.25, description: 'Calls lightning on random area' },
      { name: 'earthquake', damage: 20, radius: 6, cooldown: 15000, chance: 0.2, description: 'Shakes entire battlefield' },
    ],
    spawnInterval: 30 * 60 * 1000, // 30 minutes
    spawnAreas: [
      { x: 0, z: -15, radius: 10 },
      { x: -15, z: 10, radius: 8 },
    ],
    loot: [
      { itemId: 'golem_core', qty: [2, 3], chance: 1.0 },
      { itemId: 'hawk_feather', qty: [3, 5], chance: 0.85 },
      { itemId: 'stone_fragment', qty: [5, 8], chance: 0.9 },
      { itemId: 'ancient_heart', qty: [1, 1], chance: 0.12 },
    ],
    xpReward: 400,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // MISTMARSH SWAMP — Lv.10 Boss
  // ═══════════════════════════════════════
  abyssal_hydra: {
    name: 'Abyssal Hydra',
    title: 'Swamp Boss',
    zone: 'mistmarsh',
    level: 10,
    hp: 800,
    atk: 25,
    def: 10,
    spd: 4,
    xp: 600,
    color: 0x4A148C,
    accentColor: 0xCE93D8,
    size: 2.5,
    aggroRange: 22,
    attackRange: 3,
    attackSpeed: 1.8,
    behavior: 'boss',
    abilities: [
      { name: 'poison_spit', damage: 20, radius: 3, cooldown: 6000, chance: 0.35, description: 'Spits toxic slime, DoT 5s' },
      { name: 'tail_swipe', damage: 30, radius: 4, cooldown: 8000, chance: 0.3, description: 'Massive tail sweep' },
      { name: 'regenerate', heal: 50, cooldown: 20000, chance: 0.2, description: 'Heals 50 HP' },
    ],
    spawnInterval: 35 * 60 * 1000, // 35 minutes
    spawnAreas: [
      { x: 0, z: 0, radius: 12 },
      { x: -10, z: -10, radius: 8 },
    ],
    loot: [
      { itemId: 'turtle_shell', qty: [3, 5], chance: 1.0 },
      { itemId: 'lurker_fang', qty: [2, 4], chance: 0.9 },
      { itemId: 'toxic_slime', qty: [3, 5], chance: 0.85 },
      { itemId: 'ancient_heart', qty: [1, 2], chance: 0.15 },
    ],
    xpReward: 600,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // VOLCANIC WASTES — Lv.18 Zone Boss
  // ═══════════════════════════════════════
  inferno_titan: {
    name: 'Inferno Titan',
    title: 'Volcanic Boss',
    zone: 'volcanic',
    level: 18,
    hp: 1200,
    atk: 35,
    def: 18,
    spd: 3,
    xp: 1200,
    color: 0xD84315,
    accentColor: 0xFF6D00,
    size: 2.8,
    aggroRange: 24,
    attackRange: 3.5,
    attackSpeed: 1.5,
    behavior: 'boss',
    abilities: [
      { name: 'lava_erupt', damage: 50, radius: 6, cooldown: 12000, chance: 0.3, description: 'Erupts lava in a wide AoE, burning all nearby' },
      { name: 'flame_charge', damage: 60, range: 10, cooldown: 8000, chance: 0.3, description: 'Charges through targets leaving a trail of fire' },
      { name: 'meteor_shower', damage: 40, radius: 8, cooldown: 18000, chance: 0.2, description: 'Calls down a volley of meteors on the battlefield' },
    ],
    spawnInterval: 30 * 60 * 1000, // 30 minutes
    spawnAreas: [
      { x: 0, z: -20, radius: 12 },
      { x: -15, z: 10, radius: 10 },
      { x: 15, z: -5, radius: 10 },
    ],
    loot: [
      { itemId: 'volcanic_core', qty: [3, 5], chance: 1.0 },
      { itemId: 'obsidian_shard', qty: [5, 8], chance: 0.9 },
      { itemId: 'magma_essence', qty: [2, 4], chance: 0.8 },
      { itemId: 'inferno_blade', qty: [1, 1], chance: 0.08 },
      { itemId: 'titans_gauntlet', qty: [1, 1], chance: 0.06 },
    ],
    xpReward: 1200,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // CRYSTAL CAVERNS — Lv.28 Zone Boss
  // ═══════════════════════════════════════
  crystal_queen: {
    name: 'Crystal Queen',
    title: 'Crystal Boss',
    zone: 'crystal',
    level: 28,
    hp: 2000,
    atk: 45,
    def: 22,
    spd: 3,
    xp: 2000,
    color: 0x7C4DFF,
    accentColor: 0xE040FB,
    size: 2.5,
    aggroRange: 22,
    attackRange: 4,
    attackSpeed: 1.3,
    behavior: 'boss',
    abilities: [
      { name: 'prism_beam', damage: 55, range: 15, cooldown: 10000, chance: 0.3, description: 'Fires a refracted beam that splits and hits multiple targets' },
      { name: 'crystal_shield', heal: 80, cooldown: 20000, chance: 0.2, description: 'Encases in crystal, gaining DEF boost and healing' },
      { name: 'gem_storm', damage: 45, radius: 7, cooldown: 14000, chance: 0.3, description: 'Unleashes a storm of razor-sharp gem shards' },
    ],
    spawnInterval: 35 * 60 * 1000, // 35 minutes
    spawnAreas: [
      { x: 0, z: 0, radius: 10 },
      { x: -12, z: -12, radius: 8 },
      { x: 12, z: 8, radius: 8 },
    ],
    loot: [
      { itemId: 'crystal_fragment', qty: [4, 7], chance: 1.0 },
      { itemId: 'prismatic_dust', qty: [3, 5], chance: 0.9 },
      { itemId: 'gemstone_shard', qty: [5, 8], chance: 0.85 },
      { itemId: 'queens_crown', qty: [1, 1], chance: 0.07 },
      { itemId: 'prismatic_staff', qty: [1, 1], chance: 0.05 },
    ],
    xpReward: 2000,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // SKY RUINS — Lv.38 Zone Boss
  // ═══════════════════════════════════════
  sky_dragon: {
    name: 'Sky Dragon',
    title: 'Ruins Boss',
    zone: 'sky_ruins',
    level: 38,
    hp: 3000,
    atk: 55,
    def: 25,
    spd: 5,
    xp: 3000,
    color: 0x0277BD,
    accentColor: 0x80D8FF,
    size: 3.2,
    aggroRange: 28,
    attackRange: 4,
    attackSpeed: 1.6,
    behavior: 'boss',
    abilities: [
      { name: 'wind_blast', damage: 60, radius: 6, cooldown: 10000, chance: 0.3, description: 'Unleashes a devastating cyclone that knocks back all players' },
      { name: 'tail_sweep', damage: 70, radius: 5, cooldown: 8000, chance: 0.3, description: 'Sweeps massive tail across a wide arc' },
      { name: 'dive_bomb', damage: 80, range: 20, cooldown: 15000, chance: 0.2, description: 'Dives from above and crashes into the ground' },
    ],
    spawnInterval: 38 * 60 * 1000, // 38 minutes
    spawnAreas: [
      { x: 0, z: -15, radius: 12 },
      { x: -10, z: 10, radius: 10 },
      { x: 10, z: 5, radius: 10 },
    ],
    loot: [
      { itemId: 'dragon_scale', qty: [4, 7], chance: 1.0 },
      { itemId: 'sky_feather', qty: [3, 6], chance: 0.9 },
      { itemId: 'wind_essence', qty: [4, 7], chance: 0.85 },
      { itemId: 'dragons_wing', qty: [1, 1], chance: 0.06 },
      { itemId: 'skybreaker_lance', qty: [1, 1], chance: 0.05 },
    ],
    xpReward: 3000,
    announceLeadTime: 60000,
  },

  // ═══════════════════════════════════════
  // THE ABYSS — Lv.50 Zone Boss
  // ═══════════════════════════════════════
  chaos_emperor: {
    name: 'Chaos Emperor',
    title: 'Abyss Boss',
    zone: 'abyss',
    level: 50,
    hp: 5000,
    atk: 70,
    def: 30,
    spd: 4,
    xp: 5000,
    color: 0x1A0033,
    accentColor: 0x651FFF,
    size: 3.5,
    aggroRange: 30,
    attackRange: 5,
    attackSpeed: 1.4,
    behavior: 'boss',
    abilities: [
      { name: 'void_blast', damage: 90, radius: 8, cooldown: 12000, chance: 0.3, description: 'Erupts a wave of void energy, devastating all in range' },
      { name: 'shadow_realm', damage: 0, radius: 10, cooldown: 25000, chance: 0.15, description: 'Opens a rift that disorrients players and reduces accuracy' },
      { name: 'oblivion_strike', damage: 120, range: 6, cooldown: 20000, chance: 0.2, description: 'A single cataclysmic blow that pierces all defenses' },
    ],
    spawnInterval: 40 * 60 * 1000, // 40 minutes
    spawnAreas: [
      { x: 0, z: 0, radius: 15 },
      { x: -15, z: -15, radius: 10 },
      { x: 15, z: 10, radius: 10 },
    ],
    loot: [
      { itemId: 'void_shard', qty: [5, 8], chance: 1.0 },
      { itemId: 'abyssal_essence', qty: [3, 6], chance: 0.9 },
      { itemId: 'shadow_iron', qty: [4, 7], chance: 0.85 },
      { itemId: 'emperors_crown', qty: [1, 1], chance: 0.04 },
      { itemId: 'void_edge', qty: [1, 1], chance: 0.03 },
      { itemId: 'oblivion_armor', qty: [1, 1], chance: 0.02 },
    ],
    xpReward: 5000,
    announceLeadTime: 60000,
  },
};

module.exports = { WORLD_BOSSES };
