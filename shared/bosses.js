// Zenithia — World Boss Definitions
// Bosses spawn periodically, require group effort, drop rare loot

const WORLD_BOSSES = {
  thornback_ancient: {
    name: 'Thornback Ancient',
    title: 'World Boss',
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
};

module.exports = { WORLD_BOSSES };
