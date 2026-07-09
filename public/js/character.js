// Zenithia — Character System
// Boxy player models + customization

import * as THREE from 'three';

// --- Color Palettes ---
export const PALETTES = {
  skin: [0xFFDBB4, 0xF5CBA7, 0xD4A574, 0xC68642, 0x8D5524, 0x5C3317],
  hair: [0x1A1A1A, 0x4E3524, 0x8B4513, 0xDAA520, 0xC0392B, 0x2C3E50, 0x7D3C98, 0xECEFF1],
  eyes: [0x000000, 0x1B5E20, 0x1565C0, 0x4E342E, 0x7B1FA2, 0x00838F],
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

// --- Hair Styles ---
const HAIR_STYLES = {
  short: (group, color, scale) => {
    const geo = new THREE.BoxGeometry(0.52 * scale, 0.15 * scale, 0.52 * scale);
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(geo, mat);
    hair.position.y = 1.72 * scale;
    group.add(hair);
  },
  medium: (group, color, scale) => {
    const geo = new THREE.BoxGeometry(0.54 * scale, 0.25 * scale, 0.54 * scale);
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(geo, mat);
    hair.position.y = 1.7 * scale;
    group.add(hair);
    const sideGeo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
    const side1 = new THREE.Mesh(sideGeo, mat);
    side1.position.set(-0.3 * scale, 1.5 * scale, 0);
    group.add(side1);
    const side2 = new THREE.Mesh(sideGeo, mat);
    side2.position.set(0.3 * scale, 1.5 * scale, 0);
    group.add(side2);
  },
  long: (group, color, scale) => {
    const geo = new THREE.BoxGeometry(0.54 * scale, 0.2 * scale, 0.6 * scale);
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(geo, mat);
    hair.position.y = 1.72 * scale;
    group.add(hair);
    const backGeo = new THREE.BoxGeometry(0.4 * scale, 0.8 * scale, 0.15 * scale);
    const back = new THREE.Mesh(backGeo, mat);
    back.position.set(0, 1.3 * scale, -0.3 * scale);
    group.add(back);
  },
  spiky: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
      const spike = new THREE.Mesh(geo, mat);
      const angle = (i / 5) * Math.PI - Math.PI / 2;
      spike.position.set(
        Math.sin(angle) * 0.2 * scale,
        1.85 * scale + (i % 2) * 0.1 * scale,
        Math.cos(angle) * 0.1 * scale
      );
      spike.rotation.z = Math.sin(angle) * 0.3;
      group.add(spike);
    }
  },
  ponytail: (group, color, scale) => {
    const geo = new THREE.BoxGeometry(0.52 * scale, 0.18 * scale, 0.52 * scale);
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(geo, mat);
    hair.position.y = 1.72 * scale;
    group.add(hair);
    const tailGeo = new THREE.BoxGeometry(0.12 * scale, 0.6 * scale, 0.12 * scale);
    const tail = new THREE.Mesh(tailGeo, mat);
    tail.position.set(0, 1.4 * scale, -0.35 * scale);
    tail.rotation.x = 0.3;
    group.add(tail);
  },
  mohawk: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.12 * scale, 0.4 * scale), mat);
    base.position.y = 1.75 * scale;
    group.add(base);
    for (let i = 0; i < 4; i++) {
      const spike = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.2 * scale, 0.08 * scale), mat);
      spike.position.set(0, 1.88 * scale + i * 0.05 * scale, -0.12 * scale + i * 0.08 * scale);
      group.add(spike);
    }
  },
  braids: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
    top.position.y = 1.72 * scale;
    group.add(top);
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const braid = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.15 * scale, 0.08 * scale), mat);
        braid.position.set(side * 0.25 * scale, 1.5 * scale - i * 0.15 * scale, -0.1 * scale);
        group.add(braid);
      }
    }
  },
  bun: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
    top.position.y = 1.72 * scale;
    group.add(top);
    const bun = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.25 * scale, 0.25 * scale), mat);
    bun.position.set(0, 1.85 * scale, -0.15 * scale);
    group.add(bun);
  },
  buzz: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.08 * scale, 0.52 * scale), mat);
    hair.position.y = 1.74 * scale;
    group.add(hair);
  },
  twin_tails: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
    top.position.y = 1.72 * scale;
    group.add(top);
    for (let side = -1; side <= 1; side += 2) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.5 * scale, 0.1 * scale), mat);
      tail.position.set(side * 0.3 * scale, 1.4 * scale, -0.2 * scale);
      tail.rotation.x = 0.2;
      group.add(tail);
    }
  },
  bowl: (group, color, scale) => {
    const mat = new THREE.MeshLambertMaterial({ color });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.2 * scale, 0.56 * scale), mat);
    hair.position.y = 1.72 * scale;
    group.add(hair);
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.12 * scale, 0.08 * scale), mat);
    fringe.position.set(0, 1.65 * scale, 0.28 * scale);
    group.add(fringe);
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
    trimColor = 0xFFFFFF,
    scale = 1,
    isNPC = false,
  } = options;

  const group = new THREE.Group();

  // === BODY ===
  const bodyGeo = new THREE.BoxGeometry(0.6 * scale, 0.8 * scale, 0.4 * scale);
  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8 * scale;
  body.castShadow = true;
  group.add(body);

  // Trim (belt/waist detail)
  const trimGeo = new THREE.BoxGeometry(0.62 * scale, 0.08 * scale, 0.42 * scale);
  const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.y = 0.55 * scale;
  group.add(trim);

  // === HEAD ===
  const headGeo = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.45 * scale;
  head.castShadow = true;
  group.add(head);

  // === EYES ===
  const eyeGeo = new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.05 * scale);
  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12 * scale, 1.5 * scale, 0.26 * scale);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12 * scale, 1.5 * scale, 0.26 * scale);
  group.add(rightEye);

  // Eye whites
  const whiteGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.04 * scale);
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const leftWhite = new THREE.Mesh(whiteGeo, whiteMat);
  leftWhite.position.set(-0.12 * scale, 1.5 * scale, 0.25 * scale);
  group.add(leftWhite);
  const rightWhite = new THREE.Mesh(whiteGeo, whiteMat);
  rightWhite.position.set(0.12 * scale, 1.5 * scale, 0.25 * scale);
  group.add(rightWhite);

  // === MOUTH ===
  const mouthGeo = new THREE.BoxGeometry(0.12 * scale, 0.03 * scale, 0.04 * scale);
  const mouthMat = new THREE.MeshLambertMaterial({ color: 0xD32F2F });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 1.32 * scale, 0.26 * scale);
  group.add(mouth);

  // === HAIR ===
  if (HAIR_STYLES[hairStyle]) {
    HAIR_STYLES[hairStyle](group, hairColor, scale);
  }

  // === LEGS ===
  const legGeo = new THREE.BoxGeometry(0.2 * scale, 0.5 * scale, 0.3 * scale);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.15 * scale, 0.25 * scale, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.15 * scale, 0.25 * scale, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // === FEET ===
  const footGeo = new THREE.BoxGeometry(0.22 * scale, 0.1 * scale, 0.35 * scale);
  const footMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-0.15 * scale, 0.05 * scale, 0.03 * scale);
  group.add(leftFoot);
  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightFoot.position.set(0.15 * scale, 0.05 * scale, 0.03 * scale);
  group.add(rightFoot);

  // === ARMS ===
  const armGeo = new THREE.BoxGeometry(0.15 * scale, 0.55 * scale, 0.15 * scale);
  const armMat = new THREE.MeshLambertMaterial({ color: skinColor });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.42 * scale, 0.9 * scale, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.name = 'rightArm';
  rightArm.position.set(0.42 * scale, 0.9 * scale, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // === HANDS ===
  const handGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.1 * scale);
  const handMat = new THREE.MeshLambertMaterial({ color: skinColor });

  const leftHand = new THREE.Mesh(handGeo, handMat);
  leftHand.name = 'leftHand';
  leftHand.position.set(-0.42 * scale, 0.58 * scale, 0);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, handMat);
  rightHand.name = 'rightHand';
  rightHand.position.set(0.42 * scale, 0.58 * scale, 0);
  group.add(rightHand);

  return group;
}

// --- Create NPC with specific look ---
export function createNPCModel(npc) {
  const NPC_LOOKS = {
    elder_maren:     { skin: 5, hair: 1, hairStyle: 'medium', body: 0x8D6E63, trim: 0xFFD600 },
    sir_gendut:      { skin: 1, hair: 2, hairStyle: 'short', body: 0xFF8F00, trim: 0xFFFFFF },
    miss_lira:       { skin: 0, hair: 3, hairStyle: 'ponytail', body: 0xE91E63, trim: 0xFFFFFF },
    mr_tani:         { skin: 2, hair: 1, hairStyle: 'short', body: 0x689F38, trim: 0x8D6E63 },
    mrs_ningsih:     { skin: 1, hair: 0, hairStyle: 'medium', body: 0xAD1457, trim: 0xFFD600 },
    kris:            { skin: 0, hair: 4, hairStyle: 'spiky', body: 0x42A5F5, trim: 0xFFFFFF },
    guard_ren:       { skin: 3, hair: 0, hairStyle: 'short', body: 0x607D8B, trim: 0xB0BEC5 },
    herbalist_sari:  { skin: 2, hair: 6, hairStyle: 'long', body: 0x7B1FA2, trim: 0xFFFFFF },
  };

  const look = NPC_LOOKS[npc.id] || {};
  const model = createPlayerModel({
    skinColor: PALETTES.skin[look.skin ?? 0],
    hairColor: PALETTES.hair[look.hair ?? 0],
    hairStyle: look.hairStyle || 'short',
    bodyColor: look.body || 0x9E9E9E,
    trimColor: look.trim || 0xFFFFFF,
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
  const leftLeg = model.children.find(c => c.position.x < 0 && c.position.y < 0.4);
  const rightLeg = model.children.find(c => c.position.x > 0 && c.position.y < 0.4);

  if (leftLeg && rightLeg) {
    const time = Date.now() * 0.005;
    leftLeg.rotation.x = Math.sin(time) * 0.3;
    rightLeg.rotation.x = -Math.sin(time) * 0.3;
  }
}

// --- Blink Animation ---
export function blinkEyes(model) {
  if (!model) return;
  const leftEye = model.getObjectByName('leftEye');
  const rightEye = model.getObjectByName('rightEye');
  const leftWhite = model.getObjectByName('leftWhite');
  const rightWhite = model.getObjectByName('rightWhite');
  if (leftEye) leftEye.scale.y = 0.1;
  if (rightEye) rightEye.scale.y = 0.1;
  if (leftWhite) leftWhite.scale.y = 0.1;
  if (rightWhite) rightWhite.scale.y = 0.1;
  setTimeout(() => {
    if (leftEye) leftEye.scale.y = 1;
    if (rightEye) rightEye.scale.y = 1;
    if (leftWhite) leftWhite.scale.y = 1;
    if (rightWhite) rightWhite.scale.y = 1;
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
