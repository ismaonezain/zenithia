// Zenithia — Zone Definitions
// Each zone is a unique area with its own mobs, ground color, and portals

const ZONES = {
  willowmere: {
    id: 'willowmere',
    name: 'Willowmere Village',
    subtitle: 'Desa awal — zona aman',
    level: '1-2',
    groundColor: 0x7CBA3F,     // bright green grass
    ambientColor: 0x87CEEB,    // sky blue
    mobTypes: ['dust_mouse', 'moss_beetle', 'puddle_frog'],
    maxMobs: 12,
    spawnAreas: [
      { x: -10, z: -20, radius: 12 },
      { x: 8, z: -18, radius: 10 },
      { x: -12, z: 10, radius: 8 },
      { x: 10, z: 12, radius: 8 },
    ],
    portals: [
      { id: 'portal_thornwood', x: -45, z: -45, targetZone: 'thornwood', targetX: 40, targetZ: 40, name: '→ Thornwood Forest' },
      { id: 'portal_stormcrest', x: 45, z: -45, targetZone: 'stormcrest', targetX: -40, targetZ: 40, name: '→ Stormcrest Mountains' },
      { id: 'portal_mistmarsh', x: 0, z: 45, targetZone: 'mistmarsh', targetX: 0, targetZ: -40, name: '→ Mistmarsh Swamp' },
    ],
    decorations: [
      // Village buildings, fences, etc. — simple colored boxes
      { type: 'box', x: -5, z: -13, w: 3, h: 2.5, d: 3, color: 0x8D6E63, name: 'Elder House' },
      { type: 'box', x: 7, z: -4, w: 2.5, h: 2, d: 2.5, color: 0x5D4037, name: 'Shop' },
      { type: 'box', x: 4, z: 10, w: 2, h: 1.8, d: 2, color: 0x795548, name: 'Kitchen' },
    ],
  },

  thornwood: {
    id: 'thornwood',
    name: 'Thornwood Forest',
    subtitle: 'Hutan gelap — penuh duri',
    level: '3-5',
    groundColor: 0x33691E,     // dark green forest
    ambientColor: 0x556B2F,    // dark olive
    mobTypes: ['thorn_lizard', 'wind_sprite', 'bramble_boar'],
    maxMobs: 10,
    spawnAreas: [
      { x: -15, z: -10, radius: 15 },
      { x: 10, z: -20, radius: 12 },
      { x: -20, z: 10, radius: 10 },
      { x: 15, z: 15, radius: 10 },
    ],
    portals: [
      { id: 'portal_willowmere_back', x: 40, z: 40, targetZone: 'willowmere', targetX: -40, targetZ: -40, name: '→ Willowmere Village' },
      { id: 'portal_deep_forest', x: -40, z: -40, targetZone: 'mistmarsh', targetX: 30, targetZ: 30, name: '→ Mistmarsh Swamp (Deep Path)' },
    ],
    decorations: [
      // Trees — green cylinders
      { type: 'cylinder', x: -10, z: -5, r: 0.3, h: 4, color: 0x5D4037, name: 'Tree Trunk' },
      { type: 'sphere', x: -10, z: -5, y: 3, r: 2, color: 0x2E7D32, name: 'Tree Crown' },
      { type: 'cylinder', x: 20, z: -15, r: 0.3, h: 3.5, color: 0x5D4037, name: 'Tree Trunk' },
      { type: 'sphere', x: 20, z: -15, y: 2.8, r: 1.8, color: 0x1B5E20, name: 'Tree Crown' },
      { type: 'cylinder', x: -25, z: 15, r: 0.4, h: 5, color: 0x4E342E, name: 'Ancient Tree' },
      { type: 'sphere', x: -25, z: 15, y: 4, r: 2.5, color: 0x33691E, name: 'Ancient Crown' },
    ],
  },

  stormcrest: {
    id: 'stormcrest',
    name: 'Stormcrest Mountains',
    subtitle: 'Gunung berbatu — angin kencang',
    level: '5-8',
    groundColor: 0x757575,     // grey stone
    ambientColor: 0x90A4AE,    // blue grey
    mobTypes: ['rock_crawler', 'storm_hawk', 'stone_golem'],
    maxMobs: 8,
    spawnAreas: [
      { x: -20, z: -15, radius: 12 },
      { x: 15, z: -20, radius: 10 },
      { x: -10, z: 15, radius: 10 },
      { x: 20, z: 10, radius: 8 },
    ],
    portals: [
      { id: 'portal_willowmere_back2', x: -40, z: 40, targetZone: 'willowmere', targetX: 40, targetZ: -40, name: '→ Willowmere Village' },
      { id: 'portal_mistmarsh_mountain', x: 30, z: 30, targetZone: 'mistmarsh', targetX: -30, targetZ: -30, name: '→ Mistmarsh Swamp (Mountain Pass)' },
    ],
    decorations: [
      // Rocks — grey boxes
      { type: 'box', x: -15, z: -10, w: 3, h: 2, d: 2, color: 0x616161, name: 'Large Rock' },
      { type: 'box', x: 20, z: -12, w: 2, h: 1.5, d: 2, color: 0x757575, name: 'Boulder' },
      { type: 'cone', x: 0, z: -25, r: 5, h: 8, color: 0x9E9E9E, name: 'Mountain Peak' },
      { type: 'cone', x: -30, z: 0, r: 4, h: 6, color: 0xBDBDBD, name: 'Hill' },
    ],
  },

  mistmarsh: {
    id: 'mistmarsh',
    name: 'Mistmarsh Swamp',
    subtitle: 'Rawa beracun — hati-hati',
    level: '8-10',
    groundColor: 0x4E342E,     // dark brown mud
    ambientColor: 0x6D4C41,    // murky
    mobTypes: ['marsh_snapper', 'swamp_lurker', 'toxic_toad'],
    maxMobs: 8,
    spawnAreas: [
      { x: -15, z: -15, radius: 12 },
      { x: 15, z: -10, radius: 10 },
      { x: -10, z: 15, radius: 10 },
      { x: 20, z: 20, radius: 8 },
    ],
    portals: [
      { id: 'portal_willowmere_back3', x: 0, z: -40, targetZone: 'willowmere', targetX: 0, targetZ: 40, name: '→ Willowmere Village' },
      { id: 'portal_thornwood_back', x: 30, z: -30, targetZone: 'thornwood', targetX: -35, targetZ: 35, name: '→ Thornwood Forest' },
      { id: 'portal_stormcrest_back', x: -30, z: -30, targetZone: 'stormcrest', targetX: 25, targetZ: 25, name: '→ Stormcrest Mountains' },
    ],
    decorations: [
      // Dead trees, swamp pools
      { type: 'cylinder', x: -10, z: -8, r: 0.2, h: 3, color: 0x3E2723, name: 'Dead Tree' },
      { type: 'cylinder', x: 15, z: 12, r: 0.15, h: 2, color: 0x4E342E, name: 'Stump' },
      { type: 'cylinder', x: -20, z: 18, r: 3, h: 0.2, color: 0x5D4037, name: 'Swamp Pool' },
    ],
  },
};

// Add marsh_snapper to MONSTERS if not exists (it's referenced in mistmarsh)
// The monster should already exist from the loot tables, but let's make sure

module.exports = { ZONES };
