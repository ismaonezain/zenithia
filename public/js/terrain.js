// Zenithia — Terrain Renderer
// Builds 3D scene from TERRAIN data (fixed positions, unique landmarks)

import * as THREE from 'three';

// Collision boxes: { x, z, hw, hd } (half-width, half-depth) — player can't walk through
export const COLLISIONS = [
  // Elder's Hall
  { x: 0, z: -15, hw: 3.5, hd: 3 },
  // Stalls
  { x: 4, z: -4, hw: 1.5, hd: 1.5 },
  { x: 8, z: -4, hw: 1.5, hd: 1.5 },
  { x: 12, z: -4, hw: 1.5, hd: 1.5 },
  // Willow Cottage
  { x: -6, z: 8, hw: 2, hd: 2 },
  // River House
  { x: -6, z: 14, hw: 2, hd: 2 },
  // Green House
  { x: 5, z: 10, hw: 2, hd: 2 },
  // Herbalist
  { x: 18, z: -8, hw: 2, hd: 2 },
  // Gate
  { x: -2, z: 22, hw: 1.5, hd: 1.5 },
  // Barn
  { x: -18, z: 12, hw: 3, hd: 2.5 },
  // Trees (oak = 1.5 radius, willow = 2 radius, bush = 0.7)
  { x: 12, z: -12, hw: 1.2, hd: 1.2 },
  { x: -10, z: 5, hw: 1, hd: 1 },
  { x: 15, z: 15, hw: 1.4, hd: 1.4 },
  { x: -8, z: -25, hw: 2, hd: 2 },
  { x: -3, z: -28, hw: 1.5, hd: 1.5 },
  { x: 4, z: -26, hw: 2, hd: 2 },
  { x: 10, z: -24, hw: 1.3, hd: 1.3 },
  { x: -12, z: -30, hw: 1.6, hd: 1.6 },
  { x: 7, z: -30, hw: 1.5, hd: 1.5 },
  { x: -5, z: -33, hw: 2.1, hd: 2.1 },
  { x: 2, z: -35, hw: 1.8, hd: 1.8 },
  { x: -12, z: 0, hw: 2.3, hd: 2.3 },
  { x: -14, z: -3, hw: 1.5, hd: 1.5 },
  // Bushes
  { x: -20, z: -5, hw: 0.8, hd: 0.8 },
  { x: -22, z: 0, hw: 0.7, hd: 0.7 },
  { x: -18, z: -2, hw: 0.9, hd: 0.9 },
  // Creek — block walking in water (approx z = 0 to 4 area, full map)
  // Rocks
  { x: -15, z: -8, hw: 0.7, hd: 0.7 },
  { x: 14, z: 10, hw: 0.5, hd: 0.5 },
  { x: -8, z: 18, hw: 0.6, hd: 0.6 },
  // Creek (z=0 to z=4, x=-60 to x=60) — block in segments
  ...Array.from({ length: 31 }, (_, i) => ({ x: -60 + i * 4, z: 2, hw: 2.5, hd: 2 })),
];

export function isWalkable(x, z) {
  // Bridge exception — allow walking on bridge (x=-1 to 1, z=0 to 4)
  if (Math.abs(x) < 1 && z >= 0 && z <= 4) return true;
  for (const c of COLLISIONS) {
    if (Math.abs(x - c.x) < c.hw && Math.abs(z - c.z) < c.hd) return false;
  }
  return true;
}

export function buildTerrain(scene) {
  const group = new THREE.Group();
  group.name = 'terrain';
  houseLights = []; // reset for rebuild

  // === GROUND with river channel ===
  // Create ground with enough segments to deform for river channel
  const groundGeo = new THREE.PlaneGeometry(120, 100, 60, 50);
  const posAttr = groundGeo.getAttribute('position');

  // Push vertices down where the river channel is (z ≈ 0 to 4)
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // this is actually z in world space (before rotation)

    // River channel at y (local) = -48 to -44 (which is z=2 in world, since plane is 100 deep centered at 0)
    // In local coords: plane is 100 wide (x) and 100 tall (y), centered at 0
    // After rotation, local y becomes world z (negated), local x stays x
    // World z = -local_y, so river at world z=2 means local y = -2
    // River spans world z=0 to z=4, so local y = -4 to 0

    const localY = y; // local y coordinate
    const riverCenter = -2; // local y center of river
    const riverHalfWidth = 2.5; // local y half-width

    const distFromRiver = Math.abs(localY - riverCenter);

    if (distFromRiver < riverHalfWidth) {
      // Inside river — push down (create channel)
      const t = 1 - distFromRiver / riverHalfWidth; // 1 at center, 0 at edge
      const depth = -0.3 * t * t; // quadratic falloff, max depth 0.3
      posAttr.setZ(i, depth);
    } else if (distFromRiver < riverHalfWidth + 1.5) {
      // Riverbank slope — gentle transition
      const t = 1 - (distFromRiver - riverHalfWidth) / 1.5;
      posAttr.setZ(i, -0.05 * t);
    }
  }
  posAttr.needsUpdate = true;
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  group.add(ground);

  // === WATER (Mist Creek) ===
  addWater(group);

  // === PATHS ===
  addPaths(group);

  // === BUILDINGS ===
  addBuildings(group);

  // === TREES ===
  addTrees(group);

  // === ROCKS ===
  addRocks(group);

  // === FLOWERS ===
  addFlowers(group);

  // === FARMS ===
  addFarms(group);

  // === STREET LAMPS ===
  addStreetLamps(group);

  scene.add(group);
  return group;
}

// --- Water ---
let waterMeshes = []; // for animation
export function getWaterMeshes() { return waterMeshes; }

function addWater(group) {
  waterMeshes = [];

  // Small stones on riverbed
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
  for (let i = 0; i < 25; i++) {
    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.1, 5, 4),
      stoneMat
    );
    stone.position.set(
      (Math.random() - 0.5) * 100,
      -0.22,
      2 + (Math.random() - 0.5) * 3
    );
    stone.scale.y = 0.3;
    group.add(stone);
  }

  // Main creek — sits in channel
  const creekGeo = new THREE.PlaneGeometry(120, 4);
  const creekMat = new THREE.MeshLambertMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.85 });
  const creek = new THREE.Mesh(creekGeo, creekMat);
  creek.rotation.x = -Math.PI / 2;
  creek.position.set(0, -0.12, 2);
  group.add(creek);
  waterMeshes.push(creek);

  // Deep center stripe
  const deepGeo = new THREE.PlaneGeometry(120, 1.8);
  const deepMat = new THREE.MeshLambertMaterial({ color: 0x1E88E5, transparent: true, opacity: 0.5 });
  const deep = new THREE.Mesh(deepGeo, deepMat);
  deep.rotation.x = -Math.PI / 2;
  deep.position.set(0, -0.14, 2);
  group.add(deep);
  waterMeshes.push(deep);

  // Ripple layers (animated)
  for (let i = 0; i < 4; i++) {
    const rippleGeo = new THREE.PlaneGeometry(120, 0.4);
    const rippleMat = new THREE.MeshLambertMaterial({ color: 0x90CAF9, transparent: true, opacity: 0.3 });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(-30 + i * 20, -0.13, 2 + (Math.random() - 0.5) * 2);
    group.add(ripple);
    waterMeshes.push({ mesh: ripple, baseX: -30 + i * 20, speed: 0.3 + Math.random() * 0.2, amp: 0.5 + Math.random() * 0.5 });
  }

  // Water edge highlights
  const edgeMat = new THREE.MeshLambertMaterial({ color: 0xBBDEFB, transparent: true, opacity: 0.4 });
  [4.1, -0.1].forEach(z => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.4), edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(0, -0.16, z);
    group.add(edge);
    waterMeshes.push(edge);
  });

  // Foam line (white, animated)
  const foamGeo = new THREE.PlaneGeometry(120, 0.2);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.25 });
  const foam = new THREE.Mesh(foamGeo, foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.set(0, -0.12, 4.1);
  group.add(foam);
  waterMeshes.push({ mesh: foam, baseX: 0, speed: 0.5, amp: 0.3 });

  // Pond near big willow
  const pondGeo = new THREE.CircleGeometry(2.5, 20);
  const pondMat = new THREE.MeshLambertMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.85 });
  const pond = new THREE.Mesh(pondGeo, pondMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-10, -0.12, 2);
  group.add(pond);
  waterMeshes.push(pond);

  // Pond deeper center
  const pondDeep = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 14),
    new THREE.MeshLambertMaterial({ color: 0x1E88E5, transparent: true, opacity: 0.4 })
  );
  pondDeep.rotation.x = -Math.PI / 2;
  pondDeep.position.set(-10, -0.14, 2);
  group.add(pondDeep);

  // Pond ripple rings (animated)
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5 + i * 0.5, 0.6 + i * 0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0xBBDEFB, transparent: true, opacity: 0.2 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-10, -0.13, 2);
    group.add(ring);
    waterMeshes.push({ mesh: ring, type: 'ripple', baseR: 0.5 + i * 0.5, speed: 0.4 + i * 0.1 });
  }

  // Lily pads on pond
  const lilyMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
  [[-10.8, 2.5], [-9.2, 1.5], [-11, 1.3], [-9.8, 2.8]].forEach(([lx, lz]) => {
    const lily = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 10),
      lilyMat
    );
    lily.rotation.x = -Math.PI / 2;
    lily.position.set(lx, -0.12, lz);
    group.add(lily);
    waterMeshes.push({ mesh: lily, type: 'bob', baseY: -0.12 });
    // Tiny flower on some lilies
    if (Math.random() > 0.4) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 5, 4),
        new THREE.MeshBasicMaterial({ color: 0xF48FB1 })
      );
      flower.position.set(lx, -0.07, lz);
      group.add(flower);
      waterMeshes.push({ mesh: flower, type: 'bob', baseY: -0.07 });
    }
  });

  // Lily pads on creek (spread across map)
  const creekLilyMat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
  [[-40, 2.3], [-25, 1.7], [-15, 2.5], [-5, 1.9], [5, 2.2], [15, 1.6], [25, 2.4], [35, 1.8], [45, 2.1]].forEach(([lx, lz]) => {
    const lily = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 10),
      creekLilyMat
    );
    lily.rotation.x = -Math.PI / 2;
    lily.position.set(lx, -0.12, lz);
    group.add(lily);
    waterMeshes.push({ mesh: lily, type: 'bob', baseY: -0.12 });
  });

  // Bridge (detailed wooden planks) — spans channel
  const bridgeGroup = new THREE.Group();
  // Support beams (cross channel)
  const beamMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  [-0.8, 0.8].forEach(bx => {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.4, 5.5),
      beamMat
    );
    beam.position.set(bx, -0.1, 2);
    beam.castShadow = true;
    bridgeGroup.add(beam);
  });

  // Planks (individual boards) — at ground level
  const plankMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
  for (let z = -0.5; z < 5; z += 0.35) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.08, 0.28),
      plankMat
    );
    plank.position.set(0, 0.05, 0.3 + z);
    plank.castShadow = true;
    bridgeGroup.add(plank);
  }

  // Rope railings
  const ropeMat = new THREE.MeshLambertMaterial({ color: 0xA1887F });
  [-0.9, 0.9].forEach(rx => {
    // Vertical posts
    [0.0, 1.3, 2.3, 3.5, 4.5].forEach(pz => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5),
        ropeMat
      );
      post.position.set(rx, 0.5, pz);
      bridgeGroup.add(post);
    });
    // Horizontal rope
    const rope = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 4.8),
      new THREE.MeshLambertMaterial({ color: 0xBCAAA4 })
    );
    rope.position.set(rx, 0.9, 2.2);
    bridgeGroup.add(rope);
  });

  // Rope curve
  const curveMat = new THREE.MeshLambertMaterial({ color: 0xBCAAA4 });
  [-0.9, 0.9].forEach(rx => {
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const ropeDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 4, 3),
        curveMat
      );
      ropeDot.position.set(
        rx,
        0.9 - Math.sin(t * Math.PI) * 0.15,
        0.1 + t * 4.4
      );
      bridgeGroup.add(ropeDot);
    }
  });

  bridgeGroup.position.set(0, 0, 0);
  group.add(bridgeGroup);
}

// --- Paths ---
function addPathLabel(group, text, x, z, rot = 0) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.roundRect(0, 0, 256, 64, 8);
  ctx.fill();
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffff00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(4, 1, 1);
  sprite.position.set(x, 0.5, z);
  sprite.rotation.y = rot;
  group.add(sprite);
}

function addPaths(group) {
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xBCAAA4 });

  // [A] Main vertical path (Elder's Hall → Gate)
  const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 40), pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.02, 4);
  mainPath.receiveShadow = true;
  group.add(mainPath);
  // path label removed

  // [B] Herbalist horizontal (lurus ke timur, jauh dari sungai)
  const herbalPathH = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 1.2), pathMat);
  herbalPathH.rotation.x = -Math.PI / 2;
  herbalPathH.position.set(9, 0.02, -2);
  herbalPathH.receiveShadow = true;
  group.add(herbalPathH);
  // path label removed

  // [C] Herbalist vertical (from H path down to herbalist only)
  const herbalPathV = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 6.5), pathMat);
  herbalPathV.rotation.x = -Math.PI / 2;
  herbalPathV.position.set(18, 0.02, -4.75);
  herbalPathV.receiveShadow = true;
  group.add(herbalPathV);
  // path label removed

  // [D] Main → Herbalist H (vertical pendek)
  const mainToHerbal = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4), pathMat);
  mainToHerbal.rotation.x = -Math.PI / 2;
  mainToHerbal.position.set(0, 0.02, -1);
  mainToHerbal.receiveShadow = true;
  group.add(mainToHerbal);

  // [E] Bridge crossing (vertikal lewat sungai)
  const bridgePath = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4), pathMat);
  bridgePath.rotation.x = -Math.PI / 2;
  bridgePath.position.set(0, 0.02, 2);
  bridgePath.receiveShadow = true;
  group.add(bridgePath);
  // path label removed

  // [F] Main → Barn (lurus horizontal ke barat)
  const farmPath = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), pathMat);
  farmPath.rotation.x = -Math.PI / 2;
  farmPath.position.set(-9, 0.02, 12);
  farmPath.receiveShadow = true;
  group.add(farmPath);
  // path label removed

  // [G] Main → Houses (horizontal ke kiri, z=8)
  const housePath1 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath1.rotation.x = -Math.PI / 2;
  housePath1.position.set(-3, 0.02, 8);
  housePath1.receiveShadow = true;
  group.add(housePath1);
  // path label removed

  // [H] Main → Houses (horizontal ke kiri, z=14)
  const housePath2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath2.rotation.x = -Math.PI / 2;
  housePath2.position.set(-3, 0.02, 14);
  housePath2.receiveShadow = true;
  group.add(housePath2);
  // path label removed

  // [I] Main → Green House (5,10) — straight horizontal, nempel jalan utama
  const housePath3 = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), pathMat);
  housePath3.rotation.x = -Math.PI / 2;
  housePath3.position.set(2.5, 0.02, 10);
  housePath3.receiveShadow = true;
  group.add(housePath3);
  // path label removed
}

function createDiagonalPath(x1, z1, x2, z2, width, material) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  const geo = new THREE.PlaneGeometry(width, length);
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = -angle;
  mesh.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
  mesh.receiveShadow = true;
  return mesh;
}

// --- Buildings ---
function addBuildings(group) {
  // Helper: add label sprite
  function addLabel(g, text, b, yOff) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(4, 1, 1);
    sprite.position.set(0, (yOff || b.h + 2.5), 0);
    g.add(sprite);
  }

  // Helper: window with frame
  function addWindow(g, x, y, z, rotY) {
    const wg = new THREE.Group();
    // Glass
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xFFF9C4 })
    );
    wg.add(glass);
    // Frame (4 bars)
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.07), frameMat);
    hBar.position.z = 0.01;
    wg.add(hBar);
    const hBar2 = hBar.clone();
    hBar2.position.y = 0.22;
    wg.add(hBar2);
    const hBar3 = hBar.clone();
    hBar3.position.y = -0.22;
    wg.add(hBar3);
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.07), frameMat);
    vBar.position.z = 0.01;
    wg.add(vBar);
    const vBar2 = vBar.clone();
    vBar2.position.x = 0.22;
    wg.add(vBar2);
    // Shutters
    const shutterMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
    const sL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.04), shutterMat);
    sL.position.set(-0.36, 0, 0.02);
    wg.add(sL);
    const sR = sL.clone();
    sR.position.x = 0.36;
    wg.add(sR);
    wg.position.set(x, y, z);
    if (rotY) wg.rotation.y = rotY;
    g.add(wg);
  }

  // Helper: door with frame and handle
  function addDoor(g, x, y, z, rotY, w, h) {
    w = w || 0.6; h = h || 1.2;
    const dg = new THREE.Group();
    // Door slab
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x3E2723 })
    );
    slab.position.y = h / 2;
    dg.add(slab);
    // Frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x2E1B0E });
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.1, 0.12), frameMat);
    top.position.y = h + 0.05;
    dg.add(top);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.1, h + 0.1, 0.12), frameMat);
    left.position.set(-w / 2 - 0.05, h / 2, 0);
    dg.add(left);
    const right = left.clone();
    right.position.x = w / 2 + 0.05;
    dg.add(right);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 4),
      new THREE.MeshLambertMaterial({ color: 0xB8860B })
    );
    handle.position.set(w / 2 - 0.1, h * 0.45, 0.06);
    dg.add(handle);
    // Cross planks
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.04, 0.02), plankMat);
    p1.position.set(0, h * 0.3, 0.05);
    dg.add(p1);
    const p2 = p1.clone();
    p2.position.y = h * 0.7;
    dg.add(p2);
    dg.position.set(x, y, z);
    if (rotY) dg.rotation.y = rotY;
    g.add(dg);
  }

  // Helper: chimney
  function addChimney(g, x, y, z) {
    const ch = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.0, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x795548 })
    );
    body.position.y = 0.5;
    ch.add(body);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x5D4037 })
    );
    top.position.y = 1.05;
    ch.add(top);
    ch.position.set(x, y, z);
    g.add(ch);
  }

  // Helper: porch/overhang
  function addPorch(g, x, z, width, depth, postH) {
    const pg = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    // Posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, postH, 6);
    [-1, 1].forEach(side => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(side * (width / 2 - 0.1), postH / 2, depth);
      post.castShadow = true;
      pg.add(post);
    });
    // Roof beam
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.08, depth + 0.2),
      new THREE.MeshLambertMaterial({ color: 0x795548 })
    );
    beam.position.set(0, postH + 0.04, depth / 2);
    pg.add(beam);
    // Planks
    for (let i = 0; i < 4; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.8, 0.04, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x8D6E63 })
      );
      plank.position.set(0, 0.02, depth * (i / 3));
      pg.add(plank);
    }
    pg.position.set(x, 0, z);
    g.add(pg);
  }

  // =============================================
  // ELDER'S HALL — grand, with columns + steps + torches
  // =============================================
  const elderHall = new THREE.Group();
  // Foundation
  const elderFound = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.3, 5.4),
    new THREE.MeshLambertMaterial({ color: 0x757575 })
  );
  elderFound.position.y = 0.15;
  elderFound.castShadow = true;
  elderFound.receiveShadow = true;
  elderHall.add(elderFound);
  // Walls
  const elderWall = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 5),
    new THREE.MeshLambertMaterial({ color: 0x8D6E63 })
  );
  elderWall.position.y = 2.3;
  elderWall.castShadow = true;
  elderWall.receiveShadow = true;
  elderHall.add(elderWall);
  // Roof — multi-layer (bigger)
  const elderRoofMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const elderRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.2, 2, 4),
    elderRoofMat
  );
  elderRoof.position.y = 5.3;
  elderRoof.rotation.y = Math.PI / 4;
  elderRoof.castShadow = true;
  elderHall.add(elderRoof);
  // Smaller roof peak
  const elderPeak = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 1.2, 4),
    new THREE.MeshLambertMaterial({ color: 0x4E342E })
  );
  elderPeak.position.y = 6.5;
  elderPeak.rotation.y = Math.PI / 4;
  elderHall.add(elderPeak);
  // Columns (4)
  const colMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
  const colGeo = new THREE.CylinderGeometry(0.15, 0.18, 4, 8);
  [-2.5, -0.8, 0.8, 2.5].forEach(xo => {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(xo, 2.3, 2.7);
    col.castShadow = true;
    elderHall.add(col);
  });
  // Steps (3)
  const stepMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
  [0, 1, 2].forEach(i => {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(2.5 - i * 0.1, 0.12, 0.35),
      stepMat
    );
    step.position.set(0, 0.36 - i * 0.12, 2.85 + i * 0.35);
    step.receiveShadow = true;
    elderHall.add(step);
  });
  // Grand door
  addDoor(elderHall, 0, 0.3, 2.56, 0, 1.2, 2.0);
  // Windows (both sides)
  addWindow(elderHall, -2.0, 2.5, 2.56, 0);
  addWindow(elderHall, 2.0, 2.5, 2.56, 0);
  // Torch lights
  const torchMat = new THREE.MeshBasicMaterial({ color: 0xFF9800 });
  [-3.2, 3.2].forEach(xo => {
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), torchMat);
    flame.position.set(xo, 3.2, 2.7);
    elderHall.add(flame);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4),
      new THREE.MeshLambertMaterial({ color: 0x4E342E })
    );
    pole.position.set(xo, 2.9, 2.7);
    elderHall.add(pole);
    // Point light for glow
    const pl = new THREE.PointLight(0xFF9800, 0.6, 8);
    pl.position.set(xo, 3.4, 2.8);
    elderHall.add(pl);
  });
  elderHall.position.set(0, 0, -15);
  group.add(elderHall);
  addLabel(elderHall, "Elder's Hall", { h: 4 }, 8);

  // =============================================
  // MARKET STALLS — wooden posts, awning, counter
  // =============================================
  [{ x: 4, label: 'Blacksmith' }, { x: 8, label: 'General' }, { x: 12, label: 'Food' }].forEach((st, idx) => {
    const sg = new THREE.Group();
    // Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x8D6E63 })
    );
    counter.position.set(0, 0.4, 0);
    counter.castShadow = true;
    sg.add(counter);
    // Counter top
    const cTop = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.08, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x6D4C41 })
    );
    cTop.position.set(0, 0.84, 0);
    sg.add(cTop);
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 0.12),
      new THREE.MeshLambertMaterial({ color: 0xFFCC80 })
    );
    backWall.position.set(0, 1.0, -0.65);
    backWall.castShadow = true;
    sg.add(backWall);
    // Wooden posts (4)
    const postMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6);
    [[-0.9, 0.55], [0.9, 0.55], [-0.9, -0.55], [0.9, -0.55]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, 1.25, pz);
      post.castShadow = true;
      sg.add(post);
    });
    // Awning (cloth)
    const awningMat = new THREE.MeshLambertMaterial({ color: [0xD32F2F, 0x1976D2, 0x388E3C][idx] });
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.06, 1.4),
      awningMat
    );
    awning.position.set(0, 2.5, 0.1);
    sg.add(awning);
    // Awning slope
    const slope = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.06, 0.6),
      awningMat
    );
    slope.position.set(0, 2.3, 0.9);
    slope.rotation.x = 0.3;
    sg.add(slope);
    // Some goods on counter (colored boxes = merchandise)
    const goodsMat = [
      new THREE.MeshLambertMaterial({ color: 0x90A4AE }),
      new THREE.MeshLambertMaterial({ color: 0xFFF176 }),
      new THREE.MeshLambertMaterial({ color: 0xEF9A9A })
    ];
    for (let i = 0; i < 3; i++) {
      const item = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.2, 0.25),
        goodsMat[i]
      );
      item.position.set(-0.5 + i * 0.5, 0.98, 0);
      sg.add(item);
    }
    sg.position.set(st.x, 0, -4);
    group.add(sg);
    addLabel(sg, st.label, { h: 2 }, 3.5);
  });

  // =============================================
  // HOUSES — detailed with porch, chimney, shutters, flower box
  // =============================================
  const houseData = [
    { x: -6, z: 8, color: 0xD7CCC8, roof: 0x5D4037, rot: Math.PI / 2, label: 'Willow Cottage' },
    { x: -6, z: 14, color: 0xBCAAA4, roof: 0x795548, rot: Math.PI / 2, label: 'River House' },
    { x: 5, z: 10, color: 0xC5E1A5, roof: 0x33691E, rot: -Math.PI / 2, label: 'Green House' },
  ];
  houseData.forEach(hd => {
    const hg = new THREE.Group();
    const w = 3, d = 3, bh = 2.5;
    // Foundation
    const found = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.2, 0.2, d + 0.2),
      new THREE.MeshLambertMaterial({ color: 0x757575 })
    );
    found.position.y = 0.1;
    hg.add(found);
    // Walls
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, bh, d),
      new THREE.MeshLambertMaterial({ color: hd.color })
    );
    wall.position.y = bh / 2 + 0.2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    hg.add(wall);
    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.6, 4),
      new THREE.MeshLambertMaterial({ color: hd.roof })
    );
    roof.position.y = bh + 1.0;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    hg.add(roof);
    // Door
    addDoor(hg, 0, 0.2, d / 2 + 0.06, 0, 0.55, 1.1);
    // Windows (front)
    addWindow(hg, -0.9, bh * 0.55 + 0.2, d / 2 + 0.06, 0);
    addWindow(hg, 0.9, bh * 0.55 + 0.2, d / 2 + 0.06, 0);
    // Side windows
    addWindow(hg, w / 2 + 0.06, bh * 0.55 + 0.2, 0, Math.PI / 2);
    addWindow(hg, -w / 2 - 0.06, bh * 0.55 + 0.2, 0, Math.PI / 2);
    // Chimney
    addChimney(hg, 0.8, bh + 0.2, -0.5);
    // Porch (front)
    addPorch(hg, 0, d / 2 + 0.1, 2, 1.2, 2.2);
    // Flower boxes under front windows
    const flowerColors = [0xE91E63, 0xFF9800, 0x9C27B0];
    [-0.9, 0.9].forEach((fx, i) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.15),
        new THREE.MeshLambertMaterial({ color: 0x5D4037 })
      );
      box.position.set(fx, bh * 0.42 + 0.2, d / 2 + 0.12);
      hg.add(box);
      // Flowers
      for (let f = 0; f < 3; f++) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 4, 3),
          new THREE.MeshLambertMaterial({ color: flowerColors[(i + f) % 3] })
        );
        flower.position.set(fx - 0.15 + f * 0.15, bh * 0.48 + 0.2, d / 2 + 0.12);
        hg.add(flower);
      }
    });
    // Window glow — warm point light inside house (visible through windows at night)
    const windowLight = new THREE.PointLight(0xFFE0B2, 0, 6, 2);
    windowLight.position.y = bh * 0.5 + 0.2;
    hg.add(windowLight);
    houseLights.push(windowLight);

    hg.position.set(hd.x, 0, hd.z);
    hg.rotation.y = hd.rot;
    group.add(hg);
    addLabel(hg, hd.label, { h: bh }, bh + 3.2);
  });

  // =============================================
  // HERBALIST HUT — rustic, hanging herbs, barrel, sign
  // =============================================
  const herbG = new THREE.Group();
  // Foundation
  const herbFound = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.2, 2.9),
    new THREE.MeshLambertMaterial({ color: 0x6D4C41 })
  );
  herbFound.position.y = 0.1;
  herbG.add(herbFound);
  // Walls
  const herbWall = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2, 2.5),
    new THREE.MeshLambertMaterial({ color: 0x6D4C41 })
  );
  herbWall.position.y = 1.2;
  herbWall.castShadow = true;
  herbG.add(herbWall);
  // Roof — thatched look (brown cone)
  const herbRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.0, 1.4, 6),
    new THREE.MeshLambertMaterial({ color: 0x827717 })
  );
  herbRoof.position.y = 2.9;
  herbRoof.castShadow = true;
  herbG.add(herbRoof);
  // Door
  addDoor(herbG, 0, 0.2, 1.31, 0, 0.5, 0.9);
  // Window
  addWindow(herbG, 0.8, 1.3, 1.31, 0);
  // Hanging herbs (green/yellow spheres above door)
  const herbColors = [0x4CAF50, 0x66BB6A, 0xFDD835, 0x8BC34A, 0xCDDC39];
  for (let i = 0; i < 5; i++) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 4, 3),
      new THREE.MeshLambertMaterial({ color: herbColors[i] })
    );
    h.position.set(-0.6 + i * 0.3, 2.0, 1.4);
    herbG.add(h);
    // String
    const str = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.3, 3),
      new THREE.MeshLambertMaterial({ color: 0x795548 })
    );
    str.position.set(-0.6 + i * 0.3, 2.15, 1.4);
    herbG.add(str);
  }
  // Barrel
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8),
    new THREE.MeshLambertMaterial({ color: 0x5D4037 })
  );
  barrel.position.set(1.0, 0.3, 1.0);
  herbG.add(barrel);
  // Barrel rings
  const ringMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
  [-0.15, 0.15].forEach(ry => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 4, 8), ringMat);
    ring.position.set(1.0, 0.3 + ry, 1.0);
    ring.rotation.x = Math.PI / 2;
    herbG.add(ring);
  });
  // Mushroom patch nearby
  const mushMat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
  const mushCap = new THREE.MeshLambertMaterial({ color: 0xD32F2F });
  [[1.6, 0.7], [1.8, 0.9], [1.5, 1.0]].forEach(([mx, mz]) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.15, 5), mushMat);
    stem.position.set(mx, 0.08, mz);
    herbG.add(stem);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mushCap);
    cap.position.set(mx, 0.16, mz);
    herbG.add(cap);
  });
  herbG.position.set(18, 0, -8);
  group.add(herbG);
  addLabel(herbG, 'Herbalist', { h: 2 }, 5);

  // =============================================
  // GUARD POST — tall, with lookout platform + flag
  // =============================================
  const guardG = new THREE.Group();
  // Base walls
  const guardWall = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 2),
    new THREE.MeshLambertMaterial({ color: 0x607D8B })
  );
  guardWall.position.y = 1.5;
  guardWall.castShadow = true;
  guardG.add(guardWall);
  // Lookout platform (extends above)
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.12, 2.4),
    new THREE.MeshLambertMaterial({ color: 0x5D4037 })
  );
  platform.position.y = 3.06;
  guardG.add(platform);
  // Railing
  const railMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
  [-1, 1].forEach(s => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.06), railMat);
    rail.position.set(0, 3.35, s * 1.15);
    guardG.add(rail);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 2.4), railMat);
    rail2.position.set(s * 1.15, 3.35, 0);
    guardG.add(rail2);
  });
  // Roof
  const guardRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 1.2, 4),
    new THREE.MeshLambertMaterial({ color: 0x455A64 })
  );
  guardRoof.position.y = 4.1;
  guardRoof.rotation.y = Math.PI / 4;
  guardRoof.castShadow = true;
  guardG.add(guardRoof);
  // Door
  addDoor(guardG, 0, 0.2, 1.06, 0, 0.5, 0.9);
  // Window
  addWindow(guardG, 0, 2.2, 1.06, 0);
  // Flag
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2.5, 4),
    new THREE.MeshLambertMaterial({ color: 0x9E9E9E })
  );
  flagPole.position.set(0.8, 4.5, 0);
  guardG.add(flagPole);
  // Flag cloth
  const flagCloth = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.03),
    new THREE.MeshLambertMaterial({ color: 0x1565C0 })
  );
  flagCloth.position.set(1.1, 5.4, 0);
  guardG.add(flagCloth);
  // Flag emblem (small yellow circle)
  const emblem = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 6),
    new THREE.MeshBasicMaterial({ color: 0xFDD835 })
  );
  emblem.position.set(1.1, 5.4, 0.02);
  guardG.add(emblem);
  guardG.position.set(-2, 0, 22);
  guardG.rotation.y = Math.PI / 2;
  group.add(guardG);
  addLabel(guardG, 'Gate', { h: 3 }, 6.5);

  // =============================================
  // BARN — large, with sliding door, hay bales, silo
  // =============================================
  const barnG = new THREE.Group();
  // Foundation
  const barnFound = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.2, 4.4),
    new THREE.MeshLambertMaterial({ color: 0x757575 })
  );
  barnFound.position.y = 0.1;
  barnG.add(barnFound);
  // Main walls
  const barnWall = new THREE.Mesh(
    new THREE.BoxGeometry(5, 3, 4),
    new THREE.MeshLambertMaterial({ color: 0xD32F2F })
  );
  barnWall.position.y = 1.7;
  barnWall.castShadow = true;
  barnWall.receiveShadow = true;
  barnG.add(barnWall);
  // Roof — gambrel (barn-style, 2 slopes) — attached to walls
  const barnRoofMat = new THREE.MeshLambertMaterial({ color: 0xB71C1C });
  // Lower slope (gentle) — front, outer edge at wall top (y≈3.2, z=2)
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 2.5), barnRoofMat);
  roofL.position.set(0, 3.35, 1.2);
  roofL.rotation.x = 0.15;
  roofL.castShadow = true;
  barnG.add(roofL);
  // Lower slope (gentle) — back
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 2.5), barnRoofMat);
  roofR.position.set(0, 3.35, -1.2);
  roofR.rotation.x = -0.15;
  roofR.castShadow = true;
  barnG.add(roofR);
  // Upper slope (steep) — front, outer edge connects to lower slope inner edge
  const roofT = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 1.2), barnRoofMat);
  roofT.position.set(0, 3.7, 0.55);
  roofT.rotation.x = 0.3;
  barnG.add(roofT);
  // Upper slope (steep) — back
  const roofT2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 1.2), barnRoofMat);
  roofT2.position.set(0, 3.7, -0.55);
  roofT2.rotation.x = -0.3;
  barnG.add(roofT2);
  // Ridge — attached to upper slope inner edge
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.15, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x8B0000 })
  );
  ridge.position.y = 3.9;
  barnG.add(ridge);
  // Big sliding door (front)
  const slideDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2.2, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x5D4037 })
  );
  slideDoor.position.set(0, 1.3, 2.06);
  barnG.add(slideDoor);
  // Door cross planks
  const crossMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.03), crossMat);
  crossH.position.set(0, 1.3, 2.13);
  barnG.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, 0.03), crossMat);
  crossV.position.set(0, 1.3, 2.13);
  barnG.add(crossV);
  // Door rail (top bar)
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.1, 0.1),
    new THREE.MeshLambertMaterial({ color: 0x9E9E9E })
  );
  rail.position.set(0, 2.55, 2.1);
  barnG.add(rail);
  // Hay bales (near barn)
  const hayMat = new THREE.MeshLambertMaterial({ color: 0xF9A825 });
  [[-2, 0.8, 2.5], [-2, 0.8, 1.8], [-2, 1.4, 2.15]].forEach(([hx, hy, hz]) => {
    const bale = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.5, 8),
      hayMat
    );
    bale.rotation.z = Math.PI / 2;
    bale.position.set(hx, hy, hz);
    bale.castShadow = true;
    barnG.add(bale);
  });
  // Silo (cylinder next to barn)
  const silo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 3.5, 10),
    new THREE.MeshLambertMaterial({ color: 0x9E9E9E })
  );
  silo.position.set(-3.2, 1.75, 0);
  silo.castShadow = true;
  barnG.add(silo);
  const siloRoof = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 0.8, 10),
    new THREE.MeshLambertMaterial({ color: 0x757575 })
  );
  siloRoof.position.set(-3.2, 3.9, 0);
  barnG.add(siloRoof);
  // Side windows (small)
  addWindow(barnG, 2.06, 2, 0, Math.PI / 2);
  addWindow(barnG, -2.06, 2, 0, Math.PI / 2);
  barnG.position.set(-18, 0, 12);
  group.add(barnG);
  addLabel(barnG, 'Barn', { h: 3 }, 6);
}

// --- Trees ---
function addTrees(group) {
  // Willow tree (signature drooping branches)
  function createWillow(x, z, scale = 1) {
    const g = new THREE.Group();

    // Trunk with roots
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 3 * scale, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    // Roots (4 spreading from base)
    const rootMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.3;
      const root = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, 0.8 * scale, 5),
        rootMat
      );
      root.position.set(
        Math.cos(angle) * 0.3 * scale,
        0.15 * scale,
        Math.sin(angle) * 0.3 * scale
      );
      // Tilt root inward toward trunk center
      root.rotation.z = Math.cos(angle) * 0.5;
      root.rotation.x = -Math.sin(angle) * 0.5;
      g.add(root);
    }

    // Canopy — layered leaf clusters (spheres, clustered high to cover trunk)
    const leafColors = [0x66BB6A, 0x4CAF50, 0x81C784];
    for (let layer = 0; layer < 3; layer++) {
      const leafMat = new THREE.MeshLambertMaterial({ color: leafColors[layer] });
      const count = 5 + layer * 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + layer * 0.4;
        const r = (0.4 + layer * 0.3) * scale;
        const leafGeo = new THREE.SphereGeometry((0.5 + layer * 0.1) * scale, 6, 5);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
          Math.cos(angle) * r,
          (2.6 + layer * 0.15) * scale,
          Math.sin(angle) * r
        );
        leaf.scale.y = 0.55;
        leaf.castShadow = true;
        g.add(leaf);
      }
    }
    // Central top cluster (covers trunk top)
    const topLeaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.6 * scale, 7, 5),
      new THREE.MeshLambertMaterial({ color: 0x4CAF50 })
    );
    topLeaf.position.y = 2.9 * scale;
    topLeaf.scale.y = 0.6;
    topLeaf.castShadow = true;
    g.add(topLeaf);

    // Drooping vines (willow signature) — from canopy, drooping down
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x81C784 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = (0.6 + Math.random() * 0.4) * scale;
      const startY = (2.5 + Math.random() * 0.3) * scale;
      const endY = (0.8 + Math.random() * 0.4) * scale;

      // Vine stem (drooping from canopy)
      const vine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015 * scale, 0.03 * scale, startY - endY, 4),
        vineMat
      );
      vine.position.set(
        Math.cos(angle) * r,
        (startY + endY) / 2,
        Math.sin(angle) * r
      );
      g.add(vine);

      // Leaf cluster at vine tip (bottom)
      const tipLeaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 * scale, 5, 4),
        new THREE.MeshLambertMaterial({ color: 0xA5D6A7 })
      );
      tipLeaf.position.set(
        Math.cos(angle) * r,
        endY,
        Math.sin(angle) * r
      );
      tipLeaf.scale.y = 0.6;
      g.add(tipLeaf);
    }

    // Extra small leaf clusters around canopy base
    const extraLeafMat = new THREE.MeshLambertMaterial({ color: 0x81C784 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.2;
      const extraLeaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 * scale, 4, 3),
        extraLeafMat
      );
      extraLeaf.position.set(
        Math.cos(angle) * 0.8 * scale,
        2.3 * scale,
        Math.sin(angle) * 0.8 * scale
      );
      extraLeaf.scale.y = 0.5;
      g.add(extraLeaf);
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Oak tree (layered canopy, textured trunk)
  function createOak(x, z, scale = 1) {
    const g = new THREE.Group();

    // Trunk with slight curve
    const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.18 * scale, 2.2 * scale, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    // Branches (2-3 splitting off)
    const branchMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    [0.5, -0.7].forEach((offset, i) => {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.06 * scale, 0.8 * scale, 5),
        branchMat
      );
      branch.position.set(offset * scale, 1.8 * scale, (i - 0.5) * 0.3 * scale);
      branch.rotation.z = -offset * 0.8;
      g.add(branch);
    });

    // Layered canopy (3 spheres for natural shape)
    const leafColors = [0x388E3C, 0x43A047, 0x66BB6A];
    const canopyParts = [
      { y: 2.8, r: 0.9, s: 1.0 },
      { y: 3.2, r: 0.7, s: 0.8 },
      { y: 3.0, r: 0.6, s: 0.7 },
    ];
    canopyParts.forEach((p, i) => {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(p.r * scale, 8, 6),
        new THREE.MeshLambertMaterial({ color: leafColors[i] })
      );
      leaf.position.y = p.y * scale;
      leaf.scale.set(1, 0.7, 1);
      leaf.castShadow = true;
      g.add(leaf);
    });

    // Apple/fruits (small red spheres)
    const fruitMat = new THREE.MeshLambertMaterial({ color: 0xD32F2F });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 0.5;
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 * scale, 5, 4),
        fruitMat
      );
      fruit.position.set(
        Math.cos(angle) * 0.8 * scale,
        (2.6 + Math.random() * 0.4) * scale,
        Math.sin(angle) * 0.8 * scale
      );
      g.add(fruit);
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Bush (multiple spheres, berries)
  function createBush(x, z, scale = 1, flower = false) {
    const g = new THREE.Group();

    // Multiple overlapping spheres for natural shape
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
    const bushDark = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
    const parts = [
      { x: 0, y: 0.35, z: 0, r: 0.45 },
      { x: 0.2, y: 0.3, z: 0.15, r: 0.35 },
      { x: -0.2, y: 0.3, z: -0.1, r: 0.38 },
      { x: 0.1, y: 0.45, z: -0.15, r: 0.3 },
    ];
    parts.forEach((p, i) => {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(p.r * scale, 7, 5),
        i % 2 === 0 ? bushMat : bushDark
      );
      bush.position.set(p.x * scale, p.y * scale, p.z * scale);
      bush.castShadow = true;
      g.add(bush);
    });

    // Flowers or berries
    if (flower) {
      const colors = [0xFF69B4, 0xFFD700, 0xFF5722, 0xE91E63];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const r = 0.3 + Math.random() * 0.2;
        // Flower petals (5 small spheres around center)
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.04 * scale, 4, 3),
          new THREE.MeshBasicMaterial({ color: 0xFFF176 })
        );
        center.position.set(
          Math.cos(angle) * r * scale,
          0.55 * scale,
          Math.sin(angle) * r * scale
        );
        g.add(center);
        for (let p = 0; p < 4; p++) {
          const pa = (p / 4) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.03 * scale, 4, 3),
            new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
          );
          petal.position.set(
            Math.cos(angle) * r * scale + Math.cos(pa) * 0.06 * scale,
            0.55 * scale,
            Math.sin(angle) * r * scale + Math.sin(pa) * 0.06 * scale
          );
          g.add(petal);
        }
      }
    } else {
      // Berries (blue/purple)
      const berryMat = new THREE.MeshLambertMaterial({ color: 0x5C6BC0 });
      for (let i = 0; i < 4; i++) {
        const berry = new THREE.Mesh(
          new THREE.SphereGeometry(0.05 * scale, 4, 3),
          berryMat
        );
        berry.position.set(
          (Math.random() - 0.5) * 0.5 * scale,
          0.5 * scale,
          (Math.random() - 0.5) * 0.5 * scale
        );
        g.add(berry);
      }
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Pine tree (cone layers)
  function createPine(x, z, scale = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 2 * scale, 6),
      new THREE.MeshLambertMaterial({ color: 0x5D4037 })
    );
    trunk.position.y = 1 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    const pineMat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
    const pineLight = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
    [0.8, 1.4, 2.0].forEach((y, i) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry((0.7 - i * 0.15) * scale, (0.8 - i * 0.1) * scale, 7),
        i % 2 === 0 ? pineMat : pineLight
      );
      cone.position.y = y * scale;
      cone.castShadow = true;
      g.add(cone);
    });

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Place all trees
  const trees = [
    // Willow Forest
    { type: 'willow', x: -8, z: -25, s: 1.2 },
    { type: 'willow', x: -3, z: -28, s: 1.0 },
    { type: 'willow', x: 4, z: -26, s: 1.3 },
    { type: 'willow', x: 10, z: -24, s: 0.9 },
    { type: 'willow', x: -12, z: -30, s: 1.1 },
    { type: 'willow', x: 7, z: -30, s: 1.0 },
    { type: 'willow', x: -5, z: -33, s: 1.4 },
    { type: 'willow', x: 2, z: -35, s: 1.2 },

    // Iconic willow by creek
    { type: 'willow', x: -12, z: 0, s: 1.5 },
    { type: 'willow', x: -14, z: -3, s: 1.0 },

    // Village trees
    { type: 'oak', x: 12, z: -12, s: 0.8 },
    { type: 'oak', x: -10, z: 5, s: 0.7 },
    { type: 'oak', x: 15, z: 15, s: 0.9 },

    // Pines (near forest edge)
    { type: 'pine', x: -15, z: -18, s: 0.9 },
    { type: 'pine', x: 8, z: -20, s: 1.1 },
    { type: 'pine', x: -6, z: -22, s: 0.8 },

    // Bushes
    { type: 'bush', x: -20, z: -5, s: 0.6, flower: true },
    { type: 'bush', x: -22, z: 0, s: 0.5, flower: true },
    { type: 'bush', x: -18, z: -2, s: 0.7, flower: true },
    { type: 'bush', x: 16, z: -6, s: 0.5 },
    { type: 'bush', x: -8, z: 10, s: 0.4 },
  ];

  trees.forEach(t => {
    if (t.type === 'willow') createWillow(t.x, t.z, t.s);
    else if (t.type === 'oak') createOak(t.x, t.z, t.s);
    else if (t.type === 'pine') createPine(t.x, t.z, t.s);
    else if (t.type === 'bush') createBush(t.x, t.z, t.s, t.flower);
  });
}

// --- Rocks ---
function addRocks(group) {
  // Rock cluster helper
  function createRockCluster(x, z, count, baseSize) {
    const g = new THREE.Group();
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
    const rockDark = new THREE.MeshLambertMaterial({ color: 0x757575 });
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x689F38 });

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = Math.random() * baseSize * 0.8;
      const size = baseSize * (0.5 + Math.random() * 0.5);

      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0),
        i % 2 === 0 ? rockMat : rockDark
      );
      rock.position.set(
        Math.cos(angle) * dist,
        size * 0.4,
        Math.sin(angle) * dist
      );
      rock.rotation.set(Math.random(), Math.random(), Math.random() * 0.3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      g.add(rock);

      // Moss on some rocks
      if (Math.random() > 0.5) {
        const moss = new THREE.Mesh(
          new THREE.SphereGeometry(size * 0.4, 5, 4),
          mossMat
        );
        moss.position.set(
          rock.position.x,
          rock.position.y + size * 0.3,
          rock.position.z
        );
        moss.scale.y = 0.3;
        g.add(moss);
      }
    }

    // Ground pebbles
    const pebbleMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
    for (let i = 0; i < 5; i++) {
      const pebble = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 5, 4),
        pebbleMat
      );
      pebble.position.set(
        (Math.random() - 0.5) * baseSize * 2,
        0.04,
        (Math.random() - 0.5) * baseSize * 2
      );
      pebble.scale.y = 0.4;
      g.add(pebble);
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  createRockCluster(-15, -8, 3, 0.5);
  createRockCluster(14, 10, 2, 0.3);
  createRockCluster(-8, 18, 2, 0.4);
  createRockCluster(20, 5, 4, 0.6);
}

// --- Flowers ---
function addFlowers(group) {
  function createFlower(x, z, color, height) {
    const g = new THREE.Group();

    // Stem with slight curve
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, height, 5),
      new THREE.MeshLambertMaterial({ color: 0x388E3C })
    );
    stem.position.y = height / 2;
    g.add(stem);

    // Leaves on stem
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    [0.3, 0.6].forEach(h => {
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.06, 0.08),
        leafMat
      );
      leaf.position.set(0.06, height * h, 0);
      leaf.rotation.z = -0.3;
      g.add(leaf);
    });

    // Flower head — petals around center
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xFFF176 });
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 5, 4),
      centerMat
    );
    center.position.y = height + 0.05;
    g.add(center);

    const petalMat = new THREE.MeshBasicMaterial({ color });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 4, 3),
        petalMat
      );
      petal.position.set(
        Math.cos(angle) * 0.08,
        height + 0.05,
        Math.sin(angle) * 0.08
      );
      petal.scale.set(1, 0.6, 1);
      g.add(petal);
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  const flowerData = [
    { x: -20, z: -8, color: 0xFF69B4, h: 0.5 },
    { x: -22, z: -6, color: 0xFFD700, h: 0.45 },
    { x: -19, z: -10, color: 0xFF69B4, h: 0.55 },
    { x: -21, z: -9, color: 0xFFD700, h: 0.4 },
    { x: -23, z: -7, color: 0xFF69B4, h: 0.5 },
    { x: -18, z: -7, color: 0xFFD700, h: 0.48 },
    { x: -20.5, z: -7.5, color: 0xE91E63, h: 0.42 },
    { x: -21.5, z: -8.5, color: 0xFF5722, h: 0.52 },
  ];

  flowerData.forEach(f => createFlower(f.x, f.z, f.color, f.h));
}

// --- Farms ---
function addFarms(group) {
  // Soil bed base
  const soilMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const soilDark = new THREE.MeshLambertMaterial({ color: 0x4E342E });

  // Wheat field (3 rows with soil beds)
  for (let row = 0; row < 3; row++) {
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.15, 1.5),
      row % 2 === 0 ? soilMat : soilDark
    );
    bed.position.set(-20, 0.07, 13 + row * 2);
    bed.receiveShadow = true;
    group.add(bed);

    // Wheat stalks
    const wheatMat = new THREE.MeshLambertMaterial({ color: 0xF9A825 });
    const wheatTop = new THREE.MeshLambertMaterial({ color: 0xFFD54F });
    for (let x = -23.5; x < -16.5; x += 0.4) {
      for (let z = 12.3 + row * 2; z < 13.7 + row * 2; z += 0.4) {
        // Stalk
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.015, 0.5 + Math.random() * 0.2, 4),
          wheatMat
        );
        stalk.position.set(x, 0.35, z);
        stalk.rotation.x = (Math.random() - 0.5) * 0.1;
        group.add(stalk);
        // Wheat head
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.06),
          wheatTop
        );
        head.position.set(x, 0.65, z);
        group.add(head);
      }
    }
  }

  // Carrot field (2 rows)
  for (let row = 0; row < 2; row++) {
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.15, 1.5),
      soilDark
    );
    bed.position.set(-20, 0.07, 19 + row * 2);
    bed.receiveShadow = true;
    group.add(bed);

    // Carrot tops
    const carrotMat = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
    const carrotOrange = new THREE.MeshLambertMaterial({ color: 0xFF9800 });
    for (let x = -23.5; x < -16.5; x += 0.5) {
      for (let z = 18.3 + row * 2; z < 19.7 + row * 2; z += 0.5) {
        // Green top
        const top = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.2, 5),
          carrotMat
        );
        top.position.set(x, 0.25, z);
        group.add(top);
        // Orange carrot (partially visible)
        const carrot = new THREE.Mesh(
          new THREE.ConeGeometry(0.04, 0.15, 5),
          carrotOrange
        );
        carrot.position.set(x, 0.08, z);
        carrot.rotation.x = Math.PI;
        group.add(carrot);
      }
    }
  }

  // Scarecrow
  const scarecrow = new THREE.Group();
  // Post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6),
    new THREE.MeshLambertMaterial({ color: 0x795548 })
  );
  post.position.y = 1.25;
  scarecrow.add(post);
  // Crossbar
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.06, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x6D4C41 })
  );
  bar.position.y = 2.0;
  scarecrow.add(bar);
  // Head (straw color)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0xFDD835 })
  );
  head.position.y = 2.6;
  scarecrow.add(head);
  // Hat
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8),
    new THREE.MeshLambertMaterial({ color: 0x5D4037 })
  );
  hatBrim.position.y = 2.75;
  scarecrow.add(hatBrim);
  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8),
    new THREE.MeshLambertMaterial({ color: 0x5D4037 })
  );
  hatTop.position.y = 2.9;
  scarecrow.add(hatTop);
  // Shirt (torn cloth)
  const shirt = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.6, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x1565C0 })
  );
  shirt.position.y = 1.7;
  scarecrow.add(shirt);
  scarecrow.position.set(-16, 0, 15);
  scarecrow.castShadow = true;
  group.add(scarecrow);

  // Fence around farms (with horizontal rails)
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
  const railMat = new THREE.MeshLambertMaterial({ color: 0xA1887F });

  // Top fence (z=11)
  for (let x = -24; x <= -16; x += 0.8) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), fenceMat);
    post.position.set(x, 0.35, 11);
    post.castShadow = true;
    group.add(post);
  }
  // Top rails
  [0.25, 0.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.06, 0.06), railMat);
    rail.position.set(-20, y, 11);
    group.add(rail);
  });

  // Bottom fence (z=26)
  for (let x = -24; x <= -16; x += 0.8) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), fenceMat);
    post.position.set(x, 0.35, 26);
    post.castShadow = true;
    group.add(post);
  }
  [0.25, 0.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.06, 0.06), railMat);
    rail.position.set(-20, y, 26);
    group.add(rail);
  });

  // Left fence (x=-24.5)
  for (let z = 11; z <= 26; z += 0.8) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), fenceMat);
    post.position.set(-24.5, 0.35, z);
    post.castShadow = true;
    group.add(post);
  }
  [0.25, 0.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 15), railMat);
    rail.position.set(-24.5, y, 18.5);
    group.add(rail);
  });

  // Right fence (x=-15.5)
  for (let z = 11; z <= 26; z += 0.8) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), fenceMat);
    post.position.set(-15.5, 0.35, z);
    post.castShadow = true;
    group.add(post);
  }
  [0.25, 0.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 15), railMat);
    rail.position.set(-15.5, y, 18.5);
    group.add(rail);
  });

  // Gate (front opening)
  const gatePost1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), fenceMat);
  gatePost1.position.set(-17.5, 0.5, 11);
  gatePost1.castShadow = true;
  group.add(gatePost1);
  const gatePost2 = gatePost1.clone();
  gatePost2.position.x = -16.5;
  group.add(gatePost2);
  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), railMat);
  gateTop.position.set(-17, 0.9, 11);
  group.add(gateTop);
}

// --- Street Lamps ---
let streetLamps = []; // for night lighting
export function getStreetLamps() { return streetLamps; }
let houseLights = []; // window glow at night
export function getHouseLights() { return houseLights; }

function addStreetLamps(group) {
  streetLamps = [];
  const lampPositions = [
    // Main path (north-south) — alternating left/right
    { x: 1.5, z: -10 },
    { x: -1.5, z: -5 },
    { x: 1.5, z: 0 },
    { x: -1.5, z: 5 },
    { x: 1.5, z: 10 },
    { x: -1.5, z: 15 },
    // Market area
    { x: 3, z: -6 },
    { x: 13, z: -6 },
    // Bridge approaches (offset from road)
    { x: 3.5, z: -1 },
    // Village paths
    { x: 4, z: 11 },
  ];

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });

  lampPositions.forEach(pos => {
    const lamp = new THREE.Group();

    // Wooden pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 2.5, 6),
      poleMat
    );
    pole.position.y = 1.25;
    pole.castShadow = true;
    lamp.add(pole);

    // Lamp housing — open-bottom box (visible bulb underneath)
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.35),
      new THREE.MeshLambertMaterial({ color: 0x5D4037 })
    );
    housing.position.y = 2.65;
    lamp.add(housing);

    // Lamp bulb — hangs below housing, visible!
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x8D6E63 }) // OFF by default (dark)
    );
    bulb.position.y = 2.52;
    lamp.add(bulb);

    // Glow sphere — large, transparent, only visible at night
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFF3D4,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 6),
      glowMat
    );
    glow.position.y = 2.55;
    lamp.add(glow);

    // Point light (for night illumination)
    const pointLight = new THREE.PointLight(0xFFE0B2, 0, 8, 2);
    pointLight.position.y = 2.55;
    lamp.add(pointLight);

    lamp.position.set(pos.x, 0, pos.z);
    group.add(lamp);

    streetLamps.push({ group: lamp, bulb, glow, glowMat, pointLight });
  });
}
