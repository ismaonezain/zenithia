// Zenithia — Willowmere Terrain Generator
// Fixed positions, unique landmarks, memorable layout

const TERRAIN = {
  // Village center
  center: { x: 0, z: 0 },

  // === BUILDINGS ===
  buildings: [
    // Elder's Hall (large, north)
    { type: 'building', subtype: 'elder_hall', x: 0, z: -15, w: 6, h: 4, d: 5, color: 0x8D6E63, roofColor: 0x5D4037 },

    // Market stalls (center-east)
    { type: 'building', subtype: 'stall', x: 8, z: 0, w: 2, h: 2, d: 2, color: 0xFFCC80, roofColor: 0xE65100 },
    { type: 'building', subtype: 'stall', x: 8, z: 4, w: 2, h: 2, d: 2, color: 0xFFCC80, roofColor: 0xE65100 },
    { type: 'building', subtype: 'stall', x: 8, z: 8, w: 2, h: 2, d: 2, color: 0xFFCC80, roofColor: 0xE65100 },

    // Houses (south cluster)
    { type: 'building', subtype: 'house', x: -6, z: 8, w: 3, h: 2.5, d: 3, color: 0xBCAAA4, roofColor: 0x795548 },
    { type: 'building', subtype: 'house', x: -6, z: 14, w: 3, h: 2.5, d: 3, color: 0xBCAAA4, roofColor: 0x795548 },
    { type: 'building', subtype: 'house', x: 2, z: 12, w: 3, h: 2.5, d: 3, color: 0xBCAAA4, roofColor: 0x795548 },

    // Herbalist Sari's hut (east, secluded)
    { type: 'building', subtype: 'hut', x: 18, z: -8, w: 2.5, h: 2, d: 2.5, color: 0x6D4C41, roofColor: 0x33691E },

    // Guard post (south gate)
    { type: 'building', subtype: 'guard_post', x: 0, z: 22, w: 2, h: 3, d: 2, color: 0x607D8B, roofColor: 0x455A64 },

    // Mr. Tani's barn (west, farm area)
    { type: 'building', subtype: 'barn', x: -18, z: 12, w: 5, h: 3, d: 4, color: 0xD32F2F, roofColor: 0xB71C1C },
  ],

  // === TREES (Willowmere signature: drooping willow trees) ===
  trees: [
    // Willow Forest (north) — dense willow trees
    { type: 'willow', x: -8, z: -25, scale: 1.2 },
    { type: 'willow', x: -3, z: -28, scale: 1.0 },
    { type: 'willow', x: 4, z: -26, scale: 1.3 },
    { type: 'willow', x: 10, z: -24, scale: 0.9 },
    { type: 'willow', x: -12, z: -30, scale: 1.1 },
    { type: 'willow', x: 7, z: -30, scale: 1.0 },
    { type: 'willow', x: -5, z: -33, scale: 1.4 },
    { type: 'willow', x: 2, z: -35, scale: 1.2 },

    // Willow near Mist Creek (iconic)
    { type: 'willow', x: -12, z: 0, scale: 1.5 },  // THE big willow by the creek
    { type: 'willow', x: -14, z: -3, scale: 1.0 },

    // Scattered village trees
    { type: 'oak', x: 12, z: -12, scale: 0.8 },
    { type: 'oak', x: -10, z: 5, scale: 0.7 },
    { type: 'oak', x: 15, z: 15, scale: 0.9 },

    // Seruni Hills (west) — flower bushes
    { type: 'bush', x: -20, z: -5, scale: 0.6, flower: true },
    { type: 'bush', x: -22, z: 0, scale: 0.5, flower: true },
    { type: 'bush', x: -18, z: -2, scale: 0.7, flower: true },
  ],

  // === WATER (Mist Creek — runs west to east) ===
  water: [
    { type: 'creek', x: -25, z: 2, w: 50, d: 3 },  // main creek
    { type: 'pond', x: -10, z: 2, w: 4, d: 4 },     // pond near big willow
  ],

  // === PATHS (dirt paths connecting areas) ===
  paths: [
    // Main path: Elder's Hall → Market → South houses
    { from: { x: 0, z: -12 }, to: { x: 0, z: 0 }, width: 1.5 },
    { from: { x: 0, z: 0 }, to: { x: 0, z: 10 }, width: 1.5 },
    { from: { x: 0, z: 10 }, to: { x: 0, z: 22 }, width: 1.5 },

    // Market → Herbalist
    { from: { x: 8, z: 0 }, to: { x: 18, z: -8 }, width: 1.0 },

    // Market → Farm
    { from: { x: 0, z: 5 }, to: { x: -18, z: 12 }, width: 1.0 },

    // Bridge over Mist Creek
    { from: { x: -5, z: 2 }, to: { x: 5, z: 2 }, width: 2.0 },
  ],

  // === ROCKS ===
  rocks: [
    { x: -15, z: -8, scale: 0.5 },
    { x: 14, z: 10, scale: 0.3 },
    { x: -8, z: 18, scale: 0.4 },
    { x: 20, z: 5, scale: 0.6 },
  ],

  // === FLOWERS (Seruni Hills signature) ===
  flowers: [
    { x: -20, z: -8, color: 0xFF69B4 },
    { x: -22, z: -6, color: 0xFFD700 },
    { x: -19, z: -10, color: 0xFF69B4 },
    { x: -21, z: -9, color: 0xFFD700 },
    { x: -23, z: -7, color: 0xFF69B4 },
    { x: -18, z: -7, color: 0xFFD700 },
  ],

  // === FARM FIELDS (south-west) ===
  farms: [
    { x: -20, z: 15, w: 8, d: 6, crop: 'wheat' },
    { x: -20, z: 22, w: 8, d: 6, crop: 'carrot' },
  ],

  // === BOUNDARY ===
  bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 35 },
};

// Export for server + client
if (typeof module !== 'undefined') {
  module.exports = TERRAIN;
}
