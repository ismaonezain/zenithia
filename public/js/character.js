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

// --- Hair Styles (Seal Online inspired — chunky blocks, big volume) ---
const HAIR_STYLES = {
  // ====== MALE STYLES ======
  short: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Big volume top (Seal Online signature — hair sits like a hat)
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.22 * scale, 0.56 * scale), mat);
    top.position.y = 1.76 * scale;
    group.add(top);
    // Second layer for poof
    const poof = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.1 * scale, 0.5 * scale), mat);
    poof.position.y = 1.88 * scale;
    group.add(poof);
    // Thick sideburns (chunky blocks)
    for (const s of [-1, 1]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.18 * scale, 0.1 * scale), mat);
      sb.position.set(s * 0.28 * scale, 1.52 * scale, 0.04 * scale);
      group.add(sb);
    }
    // Back chunk
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.2 * scale, 0.12 * scale), mat);
    back.position.set(0, 1.62 * scale, -0.26 * scale);
    group.add(back);
    // Side fringe wisps
    for (const s of [-1, 1]) {
      const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.1 * scale, 0.06 * scale), mat);
      wisp.position.set(s * 0.22 * scale, 1.65 * scale, 0.22 * scale);
      group.add(wisp);
    }
  },
  spiky: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Base volume
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.15 * scale, 0.52 * scale), mat);
    base.position.y = 1.75 * scale;
    group.add(base);
    // Big chunky spikes (Seal Online style — thick blocks pointing up)
    const spikes = [
      { x: 0, z: 0, h: 0.35, w: 0.12 },       // center — tallest
      { x: -0.12, z: -0.08, h: 0.28, w: 0.1 }, // back-left
      { x: 0.12, z: -0.08, h: 0.28, w: 0.1 },  // back-right
      { x: -0.15, z: 0.05, h: 0.22, w: 0.09 }, // front-left
      { x: 0.15, z: 0.05, h: 0.22, w: 0.09 },  // front-right
      { x: 0, z: -0.15, h: 0.25, w: 0.09 },    // back-center
      { x: 0, z: 0.12, h: 0.2, w: 0.08 },      // front-center
    ];
    spikes.forEach(s => {
      const spike = new THREE.Mesh(new THREE.BoxGeometry(s.w * scale, s.h * scale, s.w * scale), mat);
      spike.position.set(s.x * scale, (1.85 + s.h * 0.4) * scale, s.z * scale);
      spike.rotation.z = s.x * 1.5;
      spike.rotation.x = s.z * -1.2;
      group.add(spike);
    });
    // Thick sideburns
    for (const s of [-1, 1]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.15 * scale, 0.08 * scale), mat);
      sb.position.set(s * 0.27 * scale, 1.55 * scale, 0.04 * scale);
      group.add(sb);
    }
  },
  mohawk: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Shaved base (skin color)
    const shaveMat = new THREE.MeshLambertMaterial({ color: 0xD4A574 });
    const shave = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.08 * scale, 0.5 * scale), shaveMat);
    shave.position.y = 1.72 * scale;
    group.add(shave);
    // Center ridge — big chunky mohawk
    for (let i = 0; i < 6; i++) {
      const h = 0.25 + Math.sin(i * 0.7) * 0.08;
      const w = 0.12 - i * 0.005;
      const spike = new THREE.Mesh(new THREE.BoxGeometry(w * scale, h * scale, 0.1 * scale), mat);
      spike.position.set(0, (1.82 + h * 0.35) * scale, -0.18 * scale + i * 0.07 * scale);
      group.add(spike);
    }
  },
  buzz: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Very thin cap
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.05 * scale, 0.54 * scale), mat);
    hair.position.y = 1.73 * scale;
    group.add(hair);
    // Texture bumps
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bump = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.03 * scale, 0.05 * scale), mat);
      bump.position.set(Math.cos(angle) * 0.2 * scale, 1.76 * scale, Math.sin(angle) * 0.2 * scale);
      group.add(bump);
    }
  },
  sidepart: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Main volume
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.2 * scale, 0.56 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    // Part line — side swept bangs (thick chunks going one direction)
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.08 * scale, 0.06 * scale), mat);
      bang.position.set((-0.1 + i * 0.08) * scale, 1.68 * scale, 0.26 * scale);
      bang.rotation.z = -0.2 + i * 0.1;
      group.add(bang);
    }
    // Back coverage
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.18 * scale, 0.12 * scale), mat);
    back.position.set(0, 1.63 * scale, -0.26 * scale);
    group.add(back);
    // Thick sideburns
    for (const s of [-1, 1]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.16 * scale, 0.1 * scale), mat);
      sb.position.set(s * 0.28 * scale, 1.52 * scale, 0.04 * scale);
      group.add(sb);
    }
  },

  // ====== FEMALE STYLES ======
  long: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Big volume top
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.22 * scale, 0.6 * scale), mat);
    cap.position.y = 1.77 * scale;
    group.add(cap);
    const poof = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.1 * scale, 0.54 * scale), mat);
    poof.position.y = 1.9 * scale;
    group.add(poof);
    // Thick back curtain — wide chunky layers draping down
    for (let i = 0; i < 7; i++) {
      const w = 0.46 - i * 0.01;
      const layer = new THREE.Mesh(new THREE.BoxGeometry(w * scale, 0.16 * scale, 0.14 * scale), mat);
      layer.position.set(0, 1.25 * scale - i * 0.15 * scale, -0.28 * scale);
      group.add(layer);
    }
    // Thick side hair framing face — chunky strands
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.15 * scale, 0.12 * scale), mat);
        strand.position.set(s * 0.3 * scale, 1.45 * scale - i * 0.15 * scale, 0.05 * scale);
        group.add(strand);
      }
    }
    // Thick bangs — chunky blocks across forehead
    for (let i = 0; i < 5; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.08 * scale), mat);
      bang.position.set((-0.2 + i * 0.1) * scale, 1.68 * scale, 0.27 * scale);
      group.add(bang);
    }
  },
  twin_tails: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Top volume
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.2 * scale, 0.54 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    // Thick bangs
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.06 * scale), mat);
      bang.position.set((-0.15 + i * 0.1) * scale, 1.67 * scale, 0.27 * scale);
      group.add(bang);
    }
    // Two chunky tails (Seal Online signature — BIG ribbons)
    for (const s of [-1, 1]) {
      // Tail base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.12 * scale, 0.14 * scale), mat);
      base.position.set(s * 0.3 * scale, 1.7 * scale, -0.18 * scale);
      group.add(base);
      // Thick tail segments
      for (let i = 0; i < 4; i++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.16 * scale, 0.1 * scale), mat);
        seg.position.set(s * 0.32 * scale, 1.52 * scale - i * 0.16 * scale, -0.2 * scale);
        seg.rotation.x = 0.1 + i * 0.03;
        group.add(seg);
      }
      // BIG ribbon (Seal Online style — chunky bow)
      const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
      const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.08 * scale, 0.06 * scale), ribbonMat);
      bow.position.set(s * 0.3 * scale, 1.7 * scale, -0.18 * scale);
      group.add(bow);
      // Ribbon tails
      for (const d of [-1, 1]) {
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.1 * scale, 0.03 * scale), ribbonMat);
        tail.position.set(s * 0.3 * scale + d * 0.04 * scale, 1.62 * scale, -0.18 * scale);
        tail.rotation.z = d * 0.3;
        group.add(tail);
      }
    }
  },
  ponytail: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Top volume
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.2 * scale, 0.56 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const poof = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.08 * scale, 0.5 * scale), mat);
    poof.position.y = 1.88 * scale;
    group.add(poof);
    // Thick bangs
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.06 * scale), mat);
      bang.position.set((-0.15 + i * 0.1) * scale, 1.67 * scale, 0.27 * scale);
      group.add(bang);
    }
    // Side strands
    for (const s of [-1, 1]) {
      const strand = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.25 * scale, 0.08 * scale), mat);
      strand.position.set(s * 0.28 * scale, 1.5 * scale, 0.08 * scale);
      group.add(strand);
    }
    // Thick ponytail — chunky segments
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.05 * scale, 0.16 * scale),
      new THREE.MeshLambertMaterial({ color: 0xFFD600 }));
    band.position.set(0, 1.72 * scale, -0.28 * scale);
    group.add(band);
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.16 * scale, 0.14 * scale), mat);
      seg.position.set(0, 1.55 * scale - i * 0.15 * scale, -0.3 * scale - i * 0.02 * scale);
      seg.rotation.x = 0.15 + i * 0.04;
      group.add(seg);
    }
  },
  braids: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Top volume
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.2 * scale, 0.54 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    // Thick bangs
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.06 * scale), mat);
      bang.position.set((-0.15 + i * 0.1) * scale, 1.67 * scale, 0.27 * scale);
      group.add(bang);
    }
    // Two chunky braids — interlocking thick blocks
    for (const s of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const braid = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.1 * scale, 0.09 * scale), mat);
        const offset = (i % 2 === 0) ? 0.025 : -0.025;
        braid.position.set(s * 0.26 * scale + offset, 1.55 * scale - i * 0.11 * scale, -0.06 * scale);
        group.add(braid);
      }
      // Braid ties
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.04 * scale, 0.08 * scale),
        new THREE.MeshLambertMaterial({ color: 0xFFD600 }));
      tie.position.set(s * 0.26 * scale, 1.55 * scale - 5 * 0.11 * scale, -0.06 * scale);
      group.add(tie);
    }
  },
  bob: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Big volume top (bob = round shape)
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.24 * scale, 0.6 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    const poof = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.1 * scale, 0.56 * scale), mat);
    poof.position.y = 1.9 * scale;
    group.add(poof);
    // Side coverage — thick bob shape
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.15 * scale, 0.12 * scale), mat);
        side.position.set(s * 0.3 * scale, 1.55 * scale - i * 0.14 * scale, 0.02 * scale);
        group.add(side);
      }
    }
    // Back coverage
    for (let i = 0; i < 3; i++) {
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.48 - i * 0.02, 0.14 * scale, 0.12 * scale), mat);
      back.position.set(0, 1.55 * scale - i * 0.14 * scale, -0.26 * scale);
      group.add(back);
    }
    // Thick bangs
    for (let i = 0; i < 5; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.08 * scale), mat);
      bang.position.set((-0.2 + i * 0.1) * scale, 1.66 * scale, 0.27 * scale);
      group.add(bang);
    }
  },
  bun: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    // Top volume
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.18 * scale, 0.54 * scale), mat);
    top.position.y = 1.75 * scale;
    group.add(top);
    // Thick bangs
    for (let i = 0; i < 4; i++) {
      const bang = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.06 * scale), mat);
      bang.position.set((-0.15 + i * 0.1) * scale, 1.67 * scale, 0.27 * scale);
      group.add(bang);
    }
    // Side strands
    for (const s of [-1, 1]) {
      const strand = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.2 * scale, 0.07 * scale), mat);
      strand.position.set(s * 0.27 * scale, 1.5 * scale, 0.08 * scale);
      group.add(strand);
    }
    // Big chunky bun on top
    const bun1 = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.22 * scale, 0.28 * scale), mat);
    bun1.position.set(0, 1.92 * scale, -0.08 * scale);
    group.add(bun1);
    const bun2 = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.22 * scale), mat);
    bun2.position.set(0, 2.05 * scale, -0.08 * scale);
    group.add(bun2);
    // Hair stick
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.03 * scale, 0.35 * scale, 0.03 * scale),
      new THREE.MeshLambertMaterial({ color: 0xFFD600 }));
    stick.position.set(0, 1.98 * scale, -0.08 * scale);
    stick.rotation.z = 0.35;
    group.add(stick);
  },
};

// --- Build Player Model ---
export function createPlayerModel(options = {}) {
  const {
    skinColor = PALETTES.skin[0],
    hairColor = PALETTES.hair[0],
    hairStyle = 'short',
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

  // Arm cuffs (trim color)
  const cuffGeo = new THREE.BoxGeometry(0.17 * scale, 0.06 * scale, 0.17 * scale);
  const leftCuff = new THREE.Mesh(cuffGeo, trimMat);
  leftCuff.position.set(-armX, 0.65 * scale, 0);
  group.add(leftCuff);
  const rightCuff = new THREE.Mesh(cuffGeo, trimMat);
  rightCuff.position.set(armX, 0.65 * scale, 0);
  group.add(rightCuff);

  // === HANDS ===
  const handGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.1 * scale);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.name = 'leftHand';
  leftHand.position.set(-armX, 0.58 * scale, 0);
  group.add(leftHand);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.name = 'rightHand';
  rightHand.position.set(armX, 0.58 * scale, 0);
  group.add(rightHand);

  // Fingers (3 tiny boxes per hand)
  const fingerGeo = new THREE.BoxGeometry(0.025 * scale, 0.06 * scale, 0.025 * scale);
  for (let i = -1; i <= 1; i++) {
    const lf = new THREE.Mesh(fingerGeo, skinMat);
    lf.position.set(-armX + i * 0.03 * scale, 0.52 * scale, 0);
    group.add(lf);
    const rf = new THREE.Mesh(fingerGeo, skinMat);
    rf.position.set(armX + i * 0.03 * scale, 0.52 * scale, 0);
    group.add(rf);
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
    elder_maren:     { skin: 5, hair: 1, hairStyle: 'sidepart', body: 0x8D6E63, trim: 0xFFD600, gender: 'male' },
    sir_gendut:      { skin: 1, hair: 2, hairStyle: 'short', body: 0xFF8F00, trim: 0xFFFFFF, gender: 'male' },
    miss_lira:       { skin: 0, hair: 3, hairStyle: 'ponytail', body: 0xE91E63, trim: 0xFFFFFF, gender: 'female' },
    mr_tani:         { skin: 2, hair: 1, hairStyle: 'short', body: 0x689F38, trim: 0x8D6E63, gender: 'male' },
    mrs_ningsih:     { skin: 1, hair: 0, hairStyle: 'bob', body: 0xAD1457, trim: 0xFFD600, gender: 'female' },
    kris:            { skin: 0, hair: 4, hairStyle: 'spiky', body: 0x42A5F5, trim: 0xFFFFFF, gender: 'male' },
    guard_ren:       { skin: 3, hair: 0, hairStyle: 'buzz', body: 0x607D8B, trim: 0xB0BEC5, gender: 'male' },
    herbalist_sari:  { skin: 2, hair: 6, hairStyle: 'long', body: 0x7B1FA2, trim: 0xFFFFFF, gender: 'female' },
  };

  const look = NPC_LOOKS[npc.id] || {};
  const model = createPlayerModel({
    skinColor: PALETTES.skin[look.skin ?? 0],
    hairColor: PALETTES.hair[look.hair ?? 0],
    hairStyle: look.hairStyle || 'short',
    bodyColor: look.body || 0x9E9E9E,
    trimColor: look.trim || 0xFFFFFF,
    gender: look.gender || 'male',
    isNPC: true,
  });

  model.position.set(npc.x, npc.y, npc.z);
  model.userData = { id: npc.id, name: npc.name, type: 'npc' };

  // Name tag
  const tagGeo = new THREE.BoxGeometry(1.2, 0.2, 0.05);
  const tagMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.y = 2.0;
  model.add(tag);

  return model;
}

// --- Walk Animation ---
export function animateWalk(model, dt) {
  if (!model) return;
  const leftLeg = model.getObjectByName('leftLeg');
  const rightLeg = model.getObjectByName('rightLeg');

  if (leftLeg && rightLeg) {
    const time = Date.now() * 0.005;
    leftLeg.rotation.x = Math.sin(time) * 0.3;
    rightLeg.rotation.x = -Math.sin(time) * 0.3;
  }
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
