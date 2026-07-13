// Zenithia — Character System
// Boxy player models + customization

import * as THREE from 'three';

// --- Color Palettes ---
export const PALETTES = {
  skin: [0xFFDBB4, 0xF5CBA7, 0xD4A574, 0xC68642, 0x8D5524, 0x5C3317],
  hair: [0x1A1A1A, 0x4E3524, 0x8B4513, 0xDAA520, 0xC0392B, 0x2C3E50, 0x7D3C98, 0xECEFF1],
  eyes: [0x000000, 0x1B5E20, 0x1565C0, 0x4E342E, 0x7B1FA2, 0x00838F, 0xD32F2F, 0xFF8F00, 0x9E9E9E, 0xE91E63, 0x00BCD4, 0xFFFFFF],
  body: [0x2196F3, 0x4CAF50, 0xFF9800, 0x9C27B0, 0xF44336, 0x607D8B, 0x795548, 0x00BCD4],
};

// --- Class Colors (tier 2) ---
export const CLASS_COLORS = {
  guardian:     { body: 0x455A64, trim: 0xB0BEC5 },
  blade_dancer: { body: 0xC62828, trim: 0xFFD600 },
  sage:         { body: 0x4A148C, trim: 0xFFFFFF },
  cleric:       { body: 0xF5F5F5, trim: 0xFFD600 },
  shadow:       { body: 0x212121, trim: 0xD32F2F },
};

// --- Hair Styles — Real names, interesting geometry, connected pieces ---
const HAIR_STYLES = {
  // ========== MALE ==========
  undercut: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xD4A574 });
    // Shaved sides — skin tone visible
    for (const s of [-1, 1]) {
      const shave = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.2 * scale, 0.45 * scale), skinMat);
      shave.position.set(s * 0.28 * scale, 1.65 * scale, 0);
      group.add(shave);
    }
    // Big volume top — swept to one side
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.65 * scale, 0.22 * scale, 0.55 * scale), mat);
    top.position.y = 1.78 * scale;
    top.rotation.z = 0.08;
    group.add(top);
    const volume = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.12 * scale, 0.45 * scale), mat);
    volume.position.set(0.05 * scale, 1.92 * scale, 0);
    volume.rotation.z = 0.12;
    group.add(volume);
    // Swept strands — angled forward-right
    for (let i = 0; i < 4; i++) {
      const strand = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.08 * scale), mat);
      strand.position.set((-0.1 + i * 0.08) * scale, 1.95 * scale, (0.15 - i * 0.05) * scale);
      strand.rotation.z = 0.2 + i * 0.08;
      group.add(strand);
    }
    // Back — connects to top
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.4 * scale, 0.15 * scale, 0.1 * scale), mat);
    back.position.set(0, 1.62 * scale, -0.26 * scale);
    group.add(back);
  },

  pompadour: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Base on head
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.65 * scale, 0.2 * scale, 0.6 * scale), mat);
    base.position.y = 1.7 * scale;
    group.add(base);
    // Front wave — big volume swept BACKWARD and UP
    const wave1 = new THREE.Mesh(new THREE.BoxGeometry(0.45 * scale, 0.25 * scale, 0.3 * scale), mat);
    wave1.position.set(0, 1.9 * scale, 0.08 * scale);
    wave1.rotation.x = -0.2;
    group.add(wave1);
    const wave2 = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.2 * scale, 0.25 * scale), mat);
    wave2.position.set(0, 2.08 * scale, -0.02 * scale);
    wave2.rotation.x = -0.15;
    group.add(wave2);
    const wave3 = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.15 * scale, 0.2 * scale), mat);
    wave3.position.set(0, 2.2 * scale, -0.1 * scale);
    wave3.rotation.x = -0.1;
    group.add(wave3);
    // Side texture — angled strands
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.1 * scale, 0.07 * scale), mat);
        strand.position.set(s * 0.28 * scale, 1.7 * scale - i * 0.1 * scale, -0.05 * scale);
        strand.rotation.z = s * 0.3;
        group.add(strand);
      }
    }
    // Back — short
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45 * scale, 0.18 * scale, 0.1 * scale), mat);
    back.position.set(0, 1.6 * scale, -0.28 * scale);
    group.add(back);
  },

  curtains: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Volume top
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.22 * scale, 0.62 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const vol = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.1 * scale, 0.5 * scale), mat);
    vol.position.y = 1.9 * scale;
    group.add(vol);
    // Center part — gap in the middle
    // Left curtain
    for (let i = 0; i < 4; i++) {
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.12 * scale, 0.08 * scale), mat);
      chunk.position.set((-0.12 - i * 0.02) * scale, 1.7 * scale - i * 0.12 * scale, 0.26 * scale);
      chunk.rotation.z = -0.1 - i * 0.05;
      group.add(chunk);
    }
    // Right curtain
    for (let i = 0; i < 4; i++) {
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.12 * scale, 0.08 * scale), mat);
      chunk.position.set((0.12 + i * 0.02) * scale, 1.7 * scale - i * 0.12 * scale, 0.26 * scale);
      chunk.rotation.z = 0.1 + i * 0.05;
      group.add(chunk);
    }
    // Back — connects
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.2 * scale, 0.1 * scale), mat);
    back.position.set(0, 1.6 * scale, -0.28 * scale);
    group.add(back);
  },

  quiff: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.66 * scale, 0.2 * scale, 0.62 * scale), mat);
    base.position.y = 1.7 * scale;
    group.add(base);
    // Front quiff — swept UP and slightly back
    const quiff1 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.22 * scale, 0.2 * scale), mat);
    quiff1.position.set(0, 1.9 * scale, 0.1 * scale);
    quiff1.rotation.x = -0.25;
    group.add(quiff1);
    const quiff2 = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.18 * scale, 0.15 * scale), mat);
    quiff2.position.set(0, 2.05 * scale, 0.05 * scale);
    quiff2.rotation.x = -0.15;
    group.add(quiff2);
    // Texture — small forward spikes
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.12 * scale, 0.06 * scale), mat);
      spike.position.set((-0.08 + i * 0.08) * scale, 1.95 * scale, 0.15 * scale);
      spike.rotation.x = -0.4;
      group.add(spike);
    }
    // Short sides
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.15 * scale, 0.1 * scale), mat);
      side.position.set(s * 0.3 * scale, 1.65 * scale, 0);
      group.add(side);
    }
    // Back
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45 * scale, 0.16 * scale, 0.1 * scale), mat);
    back.position.set(0, 1.6 * scale, -0.28 * scale);
    group.add(back);
  },

  messy: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.22 * scale, 0.65 * scale), mat);
    base.position.y = 1.7 * scale;
    group.add(base);
    // Forward spikes — messy, angled different directions
    const spikes = [
      { x: 0, z: 0.12, h: 0.2, rx: -0.3, rz: 0 },
      { x: -0.1, z: 0.08, h: 0.18, rx: -0.2, rz: -0.15 },
      { x: 0.1, z: 0.08, h: 0.22, rx: -0.25, rz: 0.1 },
      { x: -0.18, z: 0.02, h: 0.15, rx: -0.1, rz: -0.2 },
      { x: 0.18, z: 0.02, h: 0.16, rx: -0.1, rz: 0.15 },
      { x: 0, z: -0.08, h: 0.18, rx: 0.15, rz: 0 },
      { x: -0.12, z: -0.05, h: 0.14, rx: 0.1, rz: -0.1 },
      { x: 0.12, z: -0.05, h: 0.15, rx: 0.1, rz: 0.1 },
    ];
    spikes.forEach(s => {
      const spike = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, s.h * scale, 0.07 * scale), mat);
      spike.position.set(s.x * scale, (1.85 + s.h * 0.35) * scale, s.z * scale);
      spike.rotation.x = s.rx;
      spike.rotation.z = s.rz;
      group.add(spike);
    });
    // Side texture
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.15 * scale, 0.08 * scale), mat);
      side.position.set(s * 0.3 * scale, 1.65 * scale, 0);
      side.rotation.z = s * 0.2;
      group.add(side);
    }
  },

  // ========== FEMALE ==========
  hime: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Volume top
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.24 * scale, 0.68 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const vol = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.1 * scale, 0.56 * scale), mat);
    vol.position.y = 1.92 * scale;
    group.add(vol);
    // Straight bangs — thick, even across forehead (hime signature)
    for (let i = 0; i < 6; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.12 * scale, 0.08 * scale), mat);
      bang.position.set((-0.25 + i * 0.1) * scale, 1.68 * scale, 0.3 * scale);
      group.add(bang);
    }
    // Side locks — straight, chin-length (hime signature)
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.14 * scale, 0.09 * scale), mat);
        lock.position.set(s * 0.32 * scale, 1.55 * scale - i * 0.13 * scale, 0.06 * scale);
        group.add(lock);
      }
    }
    // Back connector
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.16 * scale, 0.12 * scale), mat);
    bridge.position.set(0, 1.55 * scale, -0.28 * scale);
    group.add(bridge);
    // Long back — straight down
    for (let i = 0; i < 6; i++) {
      const layer = new THREE.Mesh(new THREE.BoxGeometry(0.46 * scale, 0.13 * scale, 0.12 * scale), mat);
      layer.position.set(0, 1.45 * scale - i * 0.13 * scale, -0.28 * scale);
      group.add(layer);
    }
  },

  updo: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.22 * scale, 0.68 * scale), mat);
    base.position.y = 1.7 * scale;
    group.add(base);
    // Bun — stacked, slightly messy
    const bun1 = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 0.22 * scale, 0.32 * scale), mat);
    bun1.position.set(0, 1.95 * scale, -0.08 * scale);
    bun1.rotation.z = 0.08;
    group.add(bun1);
    const bun2 = new THREE.Mesh(new THREE.BoxGeometry(0.26 * scale, 0.18 * scale, 0.26 * scale), mat);
    bun2.position.set(0.03 * scale, 2.12 * scale, -0.08 * scale);
    bun2.rotation.z = -0.05;
    group.add(bun2);
    const bun3 = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.14 * scale, 0.2 * scale), mat);
    bun3.position.set(-0.02 * scale, 2.25 * scale, -0.08 * scale);
    group.add(bun3);
    // Hair stick — angled through bun
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.03 * scale, 0.45 * scale, 0.03 * scale),
      new THREE.MeshLambertMaterial({ color: 0xFFD600 }));
    stick.position.set(0, 2.1 * scale, -0.08 * scale);
    stick.rotation.z = 0.35;
    group.add(stick);
    const ornament = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.07 * scale, 0.07 * scale),
      new THREE.MeshLambertMaterial({ color: 0xE91E63 }));
    ornament.position.set(0.16 * scale, 2.28 * scale, -0.08 * scale);
    group.add(ornament);
    // Side strands — loose pieces framing face
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.12 * scale, 0.07 * scale), mat);
        strand.position.set(s * 0.3 * scale, 1.55 * scale - i * 0.12 * scale, 0.06 * scale);
        group.add(strand);
      }
    }
    // Bangs
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.09 * scale, 0.07 * scale), mat);
      bang.position.set((-0.15 + i * 0.1) * scale, 1.68 * scale, 0.3 * scale);
      group.add(bang);
    }
  },

  layered: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Volume top
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.24 * scale, 0.68 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const vol = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.1 * scale, 0.56 * scale), mat);
    vol.position.y = 1.92 * scale;
    group.add(vol);
    // Face-framing layers — different lengths
    for (const s of [-1, 1]) {
      // Short layer (chin)
      for (let i = 0; i < 2; i++) {
        const short = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.12 * scale, 0.08 * scale), mat);
        short.position.set(s * 0.3 * scale, 1.55 * scale - i * 0.11 * scale, 0.06 * scale);
        group.add(short);
      }
      // Medium layer (shoulder)
      for (let i = 0; i < 3; i++) {
        const med = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.12 * scale, 0.09 * scale), mat);
        med.position.set(s * 0.32 * scale, 1.4 * scale - i * 0.11 * scale, 0.03 * scale);
        group.add(med);
      }
    }
    // Back connector
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.16 * scale, 0.12 * scale), mat);
    bridge.position.set(0, 1.55 * scale, -0.28 * scale);
    group.add(bridge);
    // Back layers — cascading
    for (let i = 0; i < 5; i++) {
      const w = 0.46 - i * 0.01;
      const layer = new THREE.Mesh(new THREE.BoxGeometry(w * scale, 0.12 * scale, 0.11 * scale), mat);
      layer.position.set(0, 1.45 * scale - i * 0.12 * scale, -0.28 * scale);
      group.add(layer);
    }
    // Bangs — wispy
    for (let i = 0; i < 5; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.09 * scale, 0.07 * scale), mat);
      bang.position.set((-0.18 + i * 0.09) * scale, 1.68 * scale, 0.3 * scale);
      bang.rotation.z = (i - 2) * 0.06;
      group.add(bang);
    }
  },

  sidesweep: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Volume — shifted to one side
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.24 * scale, 0.65 * scale), mat);
    top.position.set(0.05 * scale, 1.75 * scale, 0);
    top.rotation.z = 0.06;
    group.add(top);
    const vol = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.1 * scale, 0.52 * scale), mat);
    vol.position.set(0.08 * scale, 1.9 * scale, 0);
    vol.rotation.z = 0.1;
    group.add(vol);
    // Big sweep — flows to ONE side (right)
    for (let i = 0; i < 6; i++) {
      const sweep = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.13 * scale, 0.1 * scale), mat);
      sweep.position.set((0.15 + i * 0.03) * scale, 1.55 * scale - i * 0.13 * scale, (0.06 - i * 0.01) * scale);
      sweep.rotation.z = 0.15 + i * 0.03;
      group.add(sweep);
    }
    // Left side — shorter
    for (let i = 0; i < 2; i++) {
      const short = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.12 * scale, 0.08 * scale), mat);
      short.position.set(-0.3 * scale, 1.55 * scale - i * 0.11 * scale, 0.05 * scale);
      group.add(short);
    }
    // Back connector
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.16 * scale, 0.12 * scale), mat);
    bridge.position.set(0, 1.55 * scale, -0.28 * scale);
    group.add(bridge);
    // Back layers
    for (let i = 0; i < 4; i++) {
      const layer = new THREE.Mesh(new THREE.BoxGeometry(0.44 * scale, 0.12 * scale, 0.1 * scale), mat);
      layer.position.set(0, 1.45 * scale - i * 0.12 * scale, -0.28 * scale);
      group.add(layer);
    }
    // Bangs — swept with the flow
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.09 * scale, 0.07 * scale), mat);
      bang.position.set((-0.1 + i * 0.1) * scale, 1.68 * scale, 0.3 * scale);
      bang.rotation.z = -0.15 + i * 0.1;
      group.add(bang);
    }
  },

  drills: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Volume top
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.22 * scale, 0.68 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const vol = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.1 * scale, 0.56 * scale), mat);
    vol.position.y = 1.9 * scale;
    group.add(vol);
    // Two drill curls — stacked rotating blocks
    for (const s of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const drill = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.12 * scale, 0.1 * scale), mat);
        const angle = i * 0.8;
        const xOff = Math.sin(angle) * 0.03;
        drill.position.set(s * 0.32 * scale + xOff, 1.55 * scale - i * 0.12 * scale, 0.04 * scale);
        drill.rotation.z = s * (0.2 + i * 0.15);
        group.add(drill);
      }
      // Ribbon at top of drill
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.06 * scale, 0.06 * scale),
        new THREE.MeshLambertMaterial({ color: 0xFF69B4 }));
      ribbon.position.set(s * 0.32 * scale, 1.55 * scale, 0.04 * scale);
      group.add(ribbon);
    }
    // Bangs — straight across
    for (let i = 0; i < 5; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.09 * scale, 0.07 * scale), mat);
      bang.position.set((-0.18 + i * 0.09) * scale, 1.68 * scale, 0.3 * scale);
      group.add(bang);
    }
  },
};

// --- Build Player Model ---
export function createPlayerModel(options = {}) {
  const {
    skinColor = PALETTES.skin[0],
    hairColor = PALETTES.hair[0],
    hairStyle = 'undercut',
    eyeColor = PALETTES.eyes[0],
    bodyColor = PALETTES.body[0],
    pantsColor = 0x5D4037,
    trimColor = 0xFFFFFF,
    gender = 'male',
    classType = 'laborer',
    scale = 1,
    isNPC = false,
  } = options;

  const group = new THREE.Group();
  const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

  // Gender proportions
  const isFemale = gender === 'female';
  const bodyW = isFemale ? 0.55 : 0.6;
  const shoulderW = isFemale ? 0.35 : 0.38;
  const hipW = isFemale ? 0.35 : 0.15;

  // === NECK ===
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.15 * scale, 0.2 * scale), skinMat);
  neck.position.y = 1.28 * scale;
  group.add(neck);

  // === BODY ===
  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW * scale, 0.8 * scale, 0.4 * scale), bodyMat);
  body.position.y = 0.8 * scale;
  body.castShadow = true;
  group.add(body);

  // Chest center stripe (vest/shirt detail)
  const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.5 * scale, 0.02 * scale), trimMat);
  chestStripe.position.set(0, 0.85 * scale, 0.21 * scale);
  group.add(chestStripe);

  // Shoulder pads
  const shoulderGeo = new THREE.BoxGeometry(0.2 * scale, 0.1 * scale, 0.25 * scale);
  const leftShoulder = new THREE.Mesh(shoulderGeo, trimMat);
  leftShoulder.position.set(-shoulderW * scale, 1.15 * scale, 0);
  group.add(leftShoulder);
  const rightShoulder = new THREE.Mesh(shoulderGeo, trimMat);
  rightShoulder.position.set(shoulderW * scale, 1.15 * scale, 0);
  group.add(rightShoulder);

  // Belt (thicker — uses hipW for female hip width)
  const beltW = isFemale ? 0.65 : 0.62;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(beltW * scale, 0.1 * scale, 0.42 * scale), trimMat);
  belt.position.y = 0.52 * scale;
  group.add(belt);

  // Belt buckle
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.03 * scale),
    new THREE.MeshLambertMaterial({ color: 0xFFD600 }));
  buckle.position.set(0, 0.52 * scale, 0.22 * scale);
  group.add(buckle);

  // === HEAD ===
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale), skinMat);
  head.position.y = 1.45 * scale;
  head.castShadow = true;
  group.add(head);

  // === EARS ===
  const earGeo = new THREE.BoxGeometry(0.06 * scale, 0.12 * scale, 0.1 * scale);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.28 * scale, 1.45 * scale, 0);
  group.add(leftEar);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.28 * scale, 1.45 * scale, 0);
  group.add(rightEar);

  // === EYES === (gender-aware)
  const eyeScaleW = isFemale ? 1.25 : 1.0;
  const eyeScaleH = isFemale ? 1.2 : 1.0;
  // Eye whites
  const whiteGeo = new THREE.BoxGeometry(0.12 * eyeScaleW * scale, 0.1 * eyeScaleH * scale, 0.04 * scale);
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const leftWhite = new THREE.Mesh(whiteGeo, whiteMat);
  leftWhite.name = 'leftWhite';
  leftWhite.position.set(-0.12 * scale, 1.5 * scale, 0.255 * scale);
  group.add(leftWhite);
  const rightWhite = new THREE.Mesh(whiteGeo, whiteMat);
  rightWhite.name = 'rightWhite';
  rightWhite.position.set(0.12 * scale, 1.5 * scale, 0.255 * scale);
  group.add(rightWhite);

  // Iris (colored ring around pupil — makes eyes pop)
  const irisGeo = new THREE.BoxGeometry(0.08 * eyeScaleW * scale, 0.08 * eyeScaleH * scale, 0.03 * scale);
  const irisMat = new THREE.MeshBasicMaterial({ color: eyeColor });
  const leftIris = new THREE.Mesh(irisGeo, irisMat);
  leftIris.name = 'leftEye';
  leftIris.position.set(-0.12 * scale, 1.5 * scale, 0.27 * scale);
  group.add(leftIris);
  const rightIris = new THREE.Mesh(irisGeo, irisMat);
  rightIris.name = 'rightEye';
  rightIris.position.set(0.12 * scale, 1.5 * scale, 0.27 * scale);
  group.add(rightIris);

  // Pupil (dark center — makes eyes look alive)
  const pupilGeo = new THREE.BoxGeometry(0.04 * scale, 0.04 * scale, 0.04 * scale);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.name = 'leftPupil';
  leftPupil.position.set(-0.12 * scale, 1.5 * scale, 0.28 * scale);
  group.add(leftPupil);
  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.name = 'rightPupil';
  rightPupil.position.set(0.12 * scale, 1.5 * scale, 0.28 * scale);
  group.add(rightPupil);

  // Eye shine (anime sparkle)
  const shineGeo = new THREE.BoxGeometry(0.025 * scale, 0.025 * scale, 0.02 * scale);
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const leftShine = new THREE.Mesh(shineGeo, shineMat);
  leftShine.position.set(-0.1 * scale, 1.52 * scale, 0.29 * scale);
  group.add(leftShine);
  const rightShine = new THREE.Mesh(shineGeo, shineMat);
  rightShine.position.set(0.14 * scale, 1.52 * scale, 0.29 * scale);
  group.add(rightShine);

  // === EYELASHES (female only — top line above eyes) ===
  if (isFemale) {
    const lashGeo = new THREE.BoxGeometry(0.14 * scale, 0.02 * scale, 0.04 * scale);
    const lashMat = new THREE.MeshBasicMaterial({ color: 0x1A1A1A });
    const leftLash = new THREE.Mesh(lashGeo, lashMat);
    leftLash.position.set(-0.12 * scale, 1.56 * scale, 0.26 * scale);
    group.add(leftLash);
    const rightLash = new THREE.Mesh(lashGeo, lashMat);
    rightLash.position.set(0.12 * scale, 1.56 * scale, 0.26 * scale);
    group.add(rightLash);
    // Outer corner flick (cat-eye)
    for (const s of [-1, 1]) {
      const flick = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.02 * scale, 0.03 * scale), lashMat);
      flick.position.set(s * 0.2 * scale, 1.57 * scale, 0.26 * scale);
      flick.rotation.z = s * -0.4;
      group.add(flick);
    }
  }

  // === EYEBROWS === (gender-aware)
  if (isFemale) {
    // Female: thinner, slightly arched
    const browGeo = new THREE.BoxGeometry(0.1 * scale, 0.025 * scale, 0.04 * scale);
    const browMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.12 * scale, 1.59 * scale, 0.26 * scale);
    leftBrow.rotation.z = 0.1; // slight arch
    group.add(leftBrow);
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.12 * scale, 1.59 * scale, 0.26 * scale);
    rightBrow.rotation.z = -0.1;
    group.add(rightBrow);
  } else {
    // Male: thicker, straight
    const browGeo = new THREE.BoxGeometry(0.12 * scale, 0.035 * scale, 0.04 * scale);
    const browMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.name = 'leftBrow';
    leftBrow.position.set(-0.12 * scale, 1.57 * scale, 0.26 * scale);
    group.add(leftBrow);
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.name = 'rightBrow';
    rightBrow.position.set(0.12 * scale, 1.57 * scale, 0.26 * scale);
    group.add(rightBrow);
  }

  // === NOSE === (smaller for female)
  const noseW = isFemale ? 0.04 : 0.06;
  const noseH = isFemale ? 0.04 : 0.06;
  const nose = new THREE.Mesh(new THREE.BoxGeometry(noseW * scale, noseH * scale, 0.05 * scale),
    new THREE.MeshLambertMaterial({ color: skinColor }));
  nose.position.set(0, 1.42 * scale, 0.28 * scale);
  group.add(nose);

  // === MOUTH === (gender-aware)
  if (isFemale) {
    // Female: slightly wider, pinker lips
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.025 * scale, 0.04 * scale),
      new THREE.MeshLambertMaterial({ color: 0xE91E63 }));
    lip.position.set(0, 1.34 * scale, 0.26 * scale);
    group.add(lip);
    // Upper lip (lighter)
    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.015 * scale, 0.03 * scale),
      new THREE.MeshLambertMaterial({ color: 0xF06292 }));
    upperLip.position.set(0, 1.35 * scale, 0.265 * scale);
    group.add(upperLip);
  } else {
    // Male: default mouth
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.03 * scale, 0.04 * scale),
      new THREE.MeshLambertMaterial({ color: 0xD32F2F }));
    mouth.position.set(0, 1.34 * scale, 0.26 * scale);
    group.add(mouth);
  }

  // === BLUSH (female only — pink cheeks) ===
  if (isFemale) {
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xFF8A80, transparent: true, opacity: 0.4 });
    const blushGeo = new THREE.BoxGeometry(0.08 * scale, 0.04 * scale, 0.02 * scale);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.18 * scale, 1.42 * scale, 0.26 * scale);
    group.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.18 * scale, 1.42 * scale, 0.26 * scale);
    group.add(rightBlush);
  }

  // === HAIR ===
  if (HAIR_STYLES[hairStyle]) {
    HAIR_STYLES[hairStyle](group, hairColor, scale);
  }

  // === LEGS ===
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.45 * scale, 0.3 * scale), pantsMat);
  leftLeg.name = 'leftLeg';
  leftLeg.position.set(-0.15 * scale, 0.28 * scale, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.45 * scale, 0.3 * scale), pantsMat);
  rightLeg.name = 'rightLeg';
  rightLeg.position.set(0.15 * scale, 0.28 * scale, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Knee pads
  const kneeGeo = new THREE.BoxGeometry(0.22 * scale, 0.1 * scale, 0.06 * scale);
  const kneeMat = new THREE.MeshLambertMaterial({ color: trimColor });
  const leftKnee = new THREE.Mesh(kneeGeo, kneeMat);
  leftKnee.position.set(-0.15 * scale, 0.28 * scale, 0.16 * scale);
  group.add(leftKnee);
  const rightKnee = new THREE.Mesh(kneeGeo, kneeMat);
  rightKnee.position.set(0.15 * scale, 0.28 * scale, 0.16 * scale);
  group.add(rightKnee);

  // === FEET / BOOTS ===
  const bootMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
  // Boot tops (slightly lighter)
  const bootTopMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const leftBootTop = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.08 * scale, 0.32 * scale), bootTopMat);
  leftBootTop.position.set(-0.15 * scale, 0.1 * scale, 0);
  group.add(leftBootTop);
  const rightBootTop = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.08 * scale, 0.32 * scale), bootTopMat);
  rightBootTop.position.set(0.15 * scale, 0.1 * scale, 0);
  group.add(rightBootTop);
  // Boot soles
  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24 * scale, 0.08 * scale, 0.36 * scale), bootMat);
  leftFoot.position.set(-0.15 * scale, 0.04 * scale, 0.02 * scale);
  group.add(leftFoot);
  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24 * scale, 0.08 * scale, 0.36 * scale), bootMat);
  rightFoot.position.set(0.15 * scale, 0.04 * scale, 0.02 * scale);
  group.add(rightFoot);

  // === ARMS ===
  const armMat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const armX = (shoulderW + 0.04) * scale;
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.5 * scale, 0.15 * scale), armMat);
  leftArm.name = 'leftArm';
  leftArm.position.set(-armX, 0.88 * scale, 0);
  leftArm.castShadow = true;
  group.add(leftArm);
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.5 * scale, 0.15 * scale), armMat);
  rightArm.name = 'rightArm';
  rightArm.position.set(armX, 0.88 * scale, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Arm cuffs (trim color) — parented to arms so they move together
  const cuffGeo = new THREE.BoxGeometry(0.17 * scale, 0.06 * scale, 0.17 * scale);
  const leftCuff = new THREE.Mesh(cuffGeo, trimMat);
  leftCuff.position.set(0, -0.23 * scale, 0);
  leftArm.add(leftCuff);
  const rightCuff = new THREE.Mesh(cuffGeo, trimMat);
  rightCuff.position.set(0, -0.23 * scale, 0);
  rightArm.add(rightCuff);

  // === HANDS — parented to arms ===
  const handGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.1 * scale);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.name = 'leftHand';
  leftHand.position.set(0, -0.30 * scale, 0);
  leftArm.add(leftHand);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.name = 'rightHand';
  rightHand.position.set(0, -0.30 * scale, 0);
  rightArm.add(rightHand);

  // Fingers (3 tiny boxes per hand) — parented to arms
  const fingerGeo = new THREE.BoxGeometry(0.025 * scale, 0.06 * scale, 0.025 * scale);
  for (let i = -1; i <= 1; i++) {
    const lf = new THREE.Mesh(fingerGeo, skinMat);
    lf.position.set(i * 0.03 * scale, -0.36 * scale, 0);
    leftArm.add(lf);
    const rf = new THREE.Mesh(fingerGeo, skinMat);
    rf.position.set(i * 0.03 * scale, -0.36 * scale, 0);
    rightArm.add(rf);
  }

  return group;
}

// --- Idle Animation (breathing + subtle sway) ---
export function animateIdle(model, time) {
  if (!model) return;
  // Subtle breathing — body scale Y
  const body = model.children.find(c => c.position.y === 0.8 && c.geometry?.parameters?.height === 0.8);
  if (body) body.scale.y = 1.0 + Math.sin(time * 2) * 0.02;
  // Subtle arm sway
  const leftArm = model.getObjectByName('leftArm');
  const rightArm = model.getObjectByName('rightArm');
  if (leftArm) leftArm.rotation.x = Math.sin(time * 1.5) * 0.05;
  if (rightArm) rightArm.rotation.x = -Math.sin(time * 1.5) * 0.05;
}

// --- Create NPC with specific look ---
export function createNPCModel(npc) {
  const NPC_LOOKS = {
    elder_maren:     { skin: 5, hair: 1, hairStyle: 'pompadour', body: 0x8D6E63, trim: 0xFFD600, gender: 'male' },
    sir_gendut:      { skin: 1, hair: 2, hairStyle: 'undercut', body: 0xFF8F00, trim: 0xFFFFFF, gender: 'male' },
    miss_lira:       { skin: 0, hair: 3, hairStyle: 'drills', body: 0xE91E63, trim: 0xFFFFFF, gender: 'female' },
    mr_tani:         { skin: 2, hair: 1, hairStyle: 'messy', body: 0x689F38, trim: 0x8D6E63, gender: 'male' },
    mrs_ningsih:     { skin: 1, hair: 0, hairStyle: 'updo', body: 0xAD1457, trim: 0xFFD600, gender: 'female' },
    kris:            { skin: 0, hair: 4, hairStyle: 'quiff', body: 0x42A5F5, trim: 0xFFFFFF, gender: 'male' },
    guard_ren:       { skin: 3, hair: 0, hairStyle: 'curtains', body: 0x607D8B, trim: 0xB0BEC5, gender: 'male' },
    herbalist_sari:  { skin: 2, hair: 6, hairStyle: 'layered', body: 0x7B1FA2, trim: 0xFFFFFF, gender: 'female' },
  };

  const look = NPC_LOOKS[npc.id] || {};
  const model = createPlayerModel({
    skinColor: PALETTES.skin[look.skin ?? 0],
    hairColor: PALETTES.hair[look.hair ?? 0],
    hairStyle: look.hairStyle || 'undercut',
    bodyColor: look.body || 0x9E9E9E,
    trimColor: look.trim || 0xFFFFFF,
    gender: look.gender || 'male',
    isNPC: true,
  });

  model.position.set(npc.x, npc.y || 0, npc.z);
  if (npc.rot) model.rotation.y = npc.rot;
  model.userData = { id: npc.id, name: npc.name, type: 'npc' };

  // Name tag — always visible text sprite
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, 256, 64);
  }
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 28px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(npc.name, 128, 28);
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '18px Georgia';
  ctx.fillText(npc.title || '', 128, 52);
  const tex = new THREE.CanvasTexture(canvas);
  const tagMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const tag = new THREE.Sprite(tagMat);
  tag.scale.set(2.5, 0.6, 1);
  tag.position.y = 2.2;
  model.add(tag);

  // Glowing indicator ring on ground
  const ringGeo = new THREE.RingGeometry(0.6, 0.8, 16);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  model.add(ring);

  return model;
}

// --- Walk Animation ---
export function animateWalk(model, dt) {
  if (!model) return;
  const leftLeg = model.getObjectByName('leftLeg');
  const rightLeg = model.getObjectByName('rightLeg');
  const leftArm = model.getObjectByName('leftArm');
  const rightArm = model.getObjectByName('rightArm');
  const body = model.getObjectByName('body');

  const time = Date.now() * 0.005;
  // Legs swing
  if (leftLeg) leftLeg.rotation.x = Math.sin(time) * 0.3;
  if (rightLeg) rightLeg.rotation.x = -Math.sin(time) * 0.3;
  // Arms swing opposite to legs (natural walk)
  if (leftArm) leftArm.rotation.x = -Math.sin(time) * 0.25;
  if (rightArm) rightArm.rotation.x = Math.sin(time) * 0.25;
  // Slight body bob
  if (body) body.position.y = 0.8 + Math.abs(Math.sin(time * 2)) * 0.03;
}

// --- Blink Animation ---
export function blinkEyes(model) {
  if (!model) return;
  const parts = ['leftEye', 'rightEye', 'leftWhite', 'rightWhite', 'leftPupil', 'rightPupil'];
  const origScales = {};
  parts.forEach(name => {
    const obj = model.getObjectByName(name);
    if (obj) {
      origScales[name] = obj.scale.y;
      obj.scale.y = 0.1;
    }
  });
  setTimeout(() => {
    parts.forEach(name => {
      const obj = model.getObjectByName(name);
      if (obj) obj.scale.y = origScales[name] || 1;
    });
  }, 150);
}

// --- Wave Animation ---
export function waveHand(model) {
  if (!model) return;
  const rightArm = model.getObjectByName('rightArm');
  const rightHand = model.getObjectByName('rightHand');
  if (!rightArm || !rightHand) return;
  let t = 0;
  const anim = () => {
    t += 0.15;
    rightArm.rotation.z = -0.8 + Math.sin(t * 3) * 0.3;
    rightHand.position.y = 1.0 + Math.sin(t * 3) * 0.1;
    if (t < Math.PI * 2) requestAnimationFrame(anim);
    else {
      rightArm.rotation.z = 0;
      rightHand.position.y = 0.35;
    }
  };
  anim();
}

// --- Idle Arm Swing ---
export function idleArms(model, time) {
  if (!model) return;
  const leftArm = model.getObjectByName('leftArm');
  const rightArm = model.getObjectByName('rightArm');
  if (leftArm) leftArm.rotation.x = Math.sin(time * 1.5) * 0.1;
  if (rightArm) rightArm.rotation.x = -Math.sin(time * 1.5) * 0.1;
}

export function stopWalk(model) {
  if (!model) return;
  model.children.forEach(c => {
    if (c.position.y < 0.4) c.rotation.x = 0;
  });
  // Reset arms
  const leftArm = model.getObjectByName('leftArm');
  const rightArm = model.getObjectByName('rightArm');
  if (leftArm) leftArm.rotation.x = 0;
  if (rightArm) rightArm.rotation.x = 0;
  // Reset body bob
  const body = model.getObjectByName('body');
  if (body) body.position.y = 0.8;
}

// --- Equipment Visuals ---
export function applyEquipment(model, equipment) {
  if (!model || !equipment) return;

  // Remove old equipment visuals
  removeEquipment(model);

  const eqGroup = new THREE.Group();
  eqGroup.name = 'equipment';

  // WEAPON — attached to right hand
  if (equipment.weapon) {
    const weaponGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    const weaponMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.4, 0.6, 0.1);
    weapon.rotation.z = -0.3;
    eqGroup.add(weapon);

    // Handle
    const handleGeo = new THREE.BoxGeometry(0.05, 0.15, 0.05);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.4, 0.35, 0.1);
    handle.rotation.z = -0.3;
    eqGroup.add(handle);
  }

  // SHIELD — attached to left hand
  if (equipment.shield) {
    const shieldGeo = new THREE.BoxGeometry(0.05, 0.35, 0.3);
    const shieldMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.45, 0.7, 0.15);
    eqGroup.add(shield);
  }

  // HELMET — on top of head
  if (equipment.helmet) {
    const helmGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
    const helmMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.set(0, 1.75, 0);
    eqGroup.add(helm);
  }

  // ARMOR — change body color tint
  if (equipment.armor) {
    const body = model.children.find(c => c.position.y === 0.8 && c.geometry?.parameters?.width === 0.6);
    if (body) {
      body.material = new THREE.MeshLambertMaterial({ color: 0x607D8B });
    }
  }

  // ACCESSORY — small glow
  if (equipment.accessory) {
    const glowGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x7B1FA2, transparent: true, opacity: 0.6 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 1.2, 0.3);
    glow.name = 'accessory_glow';
    eqGroup.add(glow);
  }

  model.add(eqGroup);
}

export function removeEquipment(model) {
  if (!model) return;
  const eq = model.getObjectByName('equipment');
  if (eq) model.remove(eq);
}
