// Zenithia — Area Definitions (One Big Map)
// Each area is defined by coordinate bounds on the shared world map.
// World size: 240x240 (x: -120 to 120, z: -120 to 120)
// Player walks freely — no portals, no zone transitions.

const AREAS = [
  {
    id: 'willowmere',
    name: 'Willowmere Village',
    subtitle: 'Desa awal — zona aman',
    level: '1-2',
    groundColor: 0x7CBA3F,
    x1: -120, z1: -120, x2: -60, z2: -60,
    mobTypes: ['dust_mouse', 'moss_beetle', 'puddle_frog'],
    maxMobs: 12,
    spawnAreas: [
      { x: -105, z: -105, radius: 12 },
      { x: -85, z: -100, radius: 10 },
      { x: -108, z: -78, radius: 8 },
      { x: -80, z: -75, radius: 8 },
    ],
    decorations: [
      { type: 'box', x: -95, z: -98, w: 3, h: 2.5, d: 3, color: 0x8D6E63, name: 'Elder House' },
      { type: 'box', x: -80, z: -90, w: 2.5, h: 2, d: 2.5, color: 0x5D4037, name: 'Shop' },
      { type: 'box', x: -82, z: -78, w: 2, h: 1.8, d: 2, color: 0x795548, name: 'Kitchen' },
    ],
  },
  {
    id: 'thornwood',
    name: 'Thornwood Forest',
    subtitle: 'Hutan gelap — penuh duri',
    level: '3-5',
    groundColor: 0x33691E,
    x1: -60, z1: -120, x2: 0, z2: -60,
    mobTypes: ['thorn_lizard', 'wind_sprite', 'bramble_boar'],
    maxMobs: 10,
    spawnAreas: [
      { x: -45, z: -105, radius: 15 },
      { x: -20, z: -100, radius: 12 },
      { x: -50, z: -78, radius: 10 },
      { x: -15, z: -75, radius: 10 },
    ],
    decorations: [
      { type: 'cylinder', x: -40, z: -95, r: 0.3, h: 4, color: 0x5D4037, name: 'Tree Trunk' },
      { type: 'sphere', x: -40, z: -95, y: 3, r: 2, color: 0x2E7D32, name: 'Tree Crown' },
      { type: 'cylinder', x: -15, z: -105, r: 0.3, h: 3.5, color: 0x5D4037, name: 'Tree Trunk' },
      { type: 'sphere', x: -15, z: -105, y: 2.8, r: 1.8, color: 0x1B5E20, name: 'Tree Crown' },
      { type: 'cylinder', x: -55, z: -75, r: 0.4, h: 5, color: 0x4E342E, name: 'Ancient Tree' },
      { type: 'sphere', x: -55, z: -75, y: 4, r: 2.5, color: 0x33691E, name: 'Ancient Crown' },
    ],
  },
  {
    id: 'stormcrest',
    name: 'Stormcrest Mountains',
    subtitle: 'Gunung berbatu — angin kencang',
    level: '5-8',
    groundColor: 0x757575,
    x1: 0, z1: -120, x2: 60, z2: -60,
    mobTypes: ['rock_crawler', 'storm_hawk', 'stone_golem'],
    maxMobs: 8,
    spawnAreas: [
      { x: 15, z: -105, radius: 12 },
      { x: 40, z: -100, radius: 10 },
      { x: 10, z: -78, radius: 10 },
      { x: 45, z: -75, radius: 8 },
    ],
    decorations: [
      { type: 'box', x: 10, z: -100, w: 3, h: 2, d: 2, color: 0x616161, name: 'Large Rock' },
      { type: 'box', x: 40, z: -102, w: 2, h: 1.5, d: 2, color: 0x757575, name: 'Boulder' },
      { type: 'cone', x: 25, z: -110, r: 5, h: 8, color: 0x9E9E9E, name: 'Mountain Peak' },
      { type: 'cone', x: 5, z: -80, r: 4, h: 6, color: 0xBDBDBD, name: 'Hill' },
    ],
  },
  {
    id: 'mistmarsh',
    name: 'Mistmarsh Swamp',
    subtitle: 'Rawa beracun — hati-hati',
    level: '8-10',
    groundColor: 0x4E342E,
    x1: 60, z1: -120, x2: 120, z2: -60,
    mobTypes: ['marsh_snapper', 'swamp_lurker', 'toxic_toad'],
    maxMobs: 8,
    spawnAreas: [
      { x: 75, z: -105, radius: 12 },
      { x: 100, z: -100, radius: 10 },
      { x: 70, z: -78, radius: 10 },
      { x: 105, z: -75, radius: 8 },
    ],
    decorations: [
      { type: 'cylinder', x: 80, z: -98, r: 0.2, h: 3, color: 0x3E2723, name: 'Dead Tree' },
      { type: 'cylinder', x: 100, z: -85, r: 0.15, h: 2, color: 0x4E342E, name: 'Stump' },
      { type: 'cylinder', x: 70, z: -80, r: 3, h: 0.2, color: 0x5D4037, name: 'Swamp Pool' },
    ],
  },
  {
    id: 'volcanic',
    name: 'Volcanic Wastes',
    subtitle: 'Tanah magma — panas dan berbahaya',
    level: '10-20',
    groundColor: 0x4A0000,
    x1: -120, z1: -60, x2: -60, z2: 0,
    mobTypes: ['lava_slime', 'fire_salamander', 'magma_golem', 'ember_hawk'],
    maxMobs: 12,
    spawnAreas: [
      { x: -105, z: -45, radius: 15 },
      { x: -80, z: -40, radius: 12 },
      { x: -110, z: -18, radius: 10 },
      { x: -75, z: -15, radius: 10 },
    ],
    decorations: [
      { type: 'cylinder', x: -100, z: -40, r: 3, h: 0.3, color: 0xFF4500, name: 'Lava Pool' },
      { type: 'cone', x: -75, z: -25, r: 4, h: 6, color: 0x8B0000, name: 'Volcano' },
      { type: 'box', x: -90, z: -15, w: 4, h: 3, d: 2, color: 0x3E2723, name: 'Obsidian Pillar' },
      { type: 'sphere', x: -80, z: -48, y: 1, r: 1.5, color: 0xFF6600, name: 'Fire Orb' },
    ],
  },
  {
    id: 'crystal',
    name: 'Crystal Caverns',
    subtitle: 'Gua kristal — berkilauan dan berbahaya',
    level: '20-30',
    groundColor: 0x1A237E,
    x1: -60, z1: -60, x2: 0, z2: 0,
    mobTypes: ['crystal_spider', 'gem_scorpion', 'prism_wraith', 'diamond_golem'],
    maxMobs: 10,
    spawnAreas: [
      { x: -45, z: -45, radius: 12 },
      { x: -20, z: -40, radius: 10 },
      { x: -50, z: -18, radius: 10 },
      { x: -15, z: -15, radius: 8 },
    ],
    decorations: [
      { type: 'cone', x: -45, z: -42, r: 1, h: 4, color: 0x00BCD4, name: 'Crystal Spike' },
      { type: 'cone', x: -15, z: -20, r: 0.8, h: 3.5, color: 0x7C4DFF, name: 'Amethyst Spire' },
      { type: 'sphere', x: -30, z: -30, y: 2, r: 2, color: 0xE1BEE7, name: 'Crystal Ball' },
      { type: 'box', x: -55, z: -15, w: 2, h: 2, d: 2, color: 0x4A148C, name: 'Gem Block' },
    ],
  },
  {
    id: 'sky_ruins',
    name: 'Sky Ruins',
    subtitle: 'Puingan langit — melayang di awan',
    level: '30-40',
    groundColor: 0xB0BEC5,
    x1: 0, z1: -60, x2: 60, z2: 0,
    mobTypes: ['storm_elemental', 'cloud_serpent', 'sky_knight', 'thunder_bird'],
    maxMobs: 8,
    spawnAreas: [
      { x: 15, z: -45, radius: 12 },
      { x: 40, z: -42, radius: 10 },
      { x: 10, z: -18, radius: 10 },
      { x: 45, z: -15, radius: 8 },
    ],
    decorations: [
      { type: 'box', x: 10, z: -40, w: 5, h: 4, d: 3, color: 0x9E9E9E, name: 'Ancient Column' },
      { type: 'box', x: 45, z: -20, w: 4, h: 3, d: 4, color: 0xBDBDBD, name: 'Fallen Temple' },
      { type: 'cylinder', x: 15, z: -15, r: 2, h: 0.2, color: 0x78909C, name: 'Floating Platform' },
      { type: 'cone', x: 35, z: -48, r: 2, h: 5, color: 0xCFD8DC, name: 'Spire' },
    ],
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    subtitle: 'Jurang kegelapan — dunia bawah',
    level: '40-50',
    groundColor: 0x0D0D0D,
    x1: 60, z1: -60, x2: 120, z2: 0,
    mobTypes: ['void_stalker', 'shadow_beast', 'abyssal_worm', 'chaos_lord'],
    maxMobs: 10,
    spawnAreas: [
      { x: 75, z: -45, radius: 15 },
      { x: 100, z: -42, radius: 12 },
      { x: 70, z: -18, radius: 10 },
      { x: 105, z: -15, radius: 10 },
    ],
    decorations: [
      { type: 'cone', x: 85, z: -48, r: 6, h: 10, color: 0x4A0080, name: 'Void Spire' },
      { type: 'sphere', x: 70, z: -20, y: 3, r: 2.5, color: 0x1A0033, name: 'Shadow Orb' },
      { type: 'cylinder', x: 100, z: -45, r: 0.3, h: 6, color: 0x6A0DAD, name: 'Dark Pillar' },
      { type: 'box', x: 75, z: -50, w: 3, h: 1, d: 3, color: 0x0D0D0D, name: 'Abyss Gate' },
    ],
  },
];

// Helper: find area by player position
function getAreaAtPosition(x, z) {
  for (const area of AREAS) {
    if (x >= area.x1 && x <= area.x2 && z >= area.z1 && z <= area.z2) {
      return area;
    }
  }
  return null; // outside all defined areas
}

// Default spawn position (center of willowmere)
const DEFAULT_SPAWN = { x: -90, z: -90 };

module.exports = { AREAS, getAreaAtPosition, DEFAULT_SPAWN };
