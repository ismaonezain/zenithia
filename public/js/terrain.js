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
  { x: 3, z: 12, hw: 2, hd: 2 },
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
  // Creek — block walking in water (approx z = -1 to 1.5 area)
  // Rocks
  { x: -15, z: -8, hw: 0.7, hd: 0.7 },
  { x: 14, z: 10, hw: 0.5, hd: 0.5 },
  { x: -8, z: 18, hw: 0.6, hd: 0.6 },
  // Creek (z=0.5 to z=3.5, x=-25 to x=25) — block in segments
  ...Array.from({ length: 13 }, (_, i) => ({ x: -24 + i * 4, z: 2, hw: 2.5, hd: 1.8 })),
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

  // === GROUND ===
  const groundGeo = new THREE.PlaneGeometry(100, 100);
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

  scene.add(group);
  return group;
}

// --- Water ---
function addWater(group) {
  // Main creek
  const creekGeo = new THREE.PlaneGeometry(50, 3);
  const creekMat = new THREE.MeshLambertMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.7 });
  const creek = new THREE.Mesh(creekGeo, creekMat);
  creek.rotation.x = -Math.PI / 2;
  creek.position.set(0, 0.05, 2);
  group.add(creek);

  // Pond near big willow
  const pondGeo = new THREE.CircleGeometry(2, 16);
  const pondMat = new THREE.MeshLambertMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.7 });
  const pond = new THREE.Mesh(pondGeo, pondMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-10, 0.05, 2);
  group.add(pond);

  // Bridge (wooden planks) — rotated 90° to cross creek
  const bridgeGeo = new THREE.BoxGeometry(2, 0.15, 4);
  const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 0.15, 2);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  group.add(bridge);

  // Bridge railings
  const railGeo = new THREE.BoxGeometry(0.1, 0.5, 4);
  const railMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
  const rail1 = new THREE.Mesh(railGeo, railMat);
  rail1.position.set(-1, 0.4, 2);
  rail1.castShadow = true;
  group.add(rail1);
  const rail2 = new THREE.Mesh(railGeo, railMat);
  rail2.position.set(1, 0.4, 2);
  rail2.castShadow = true;
  group.add(rail2);
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
  addPathLabel(group, 'JALAN UTAMA', 0, 4);

  // [B] Herbalist horizontal (lurus ke timur, jauh dari sungai)
  const herbalPathH = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 1.2), pathMat);
  herbalPathH.rotation.x = -Math.PI / 2;
  herbalPathH.position.set(9, 0.02, -2);
  herbalPathH.receiveShadow = true;
  group.add(herbalPathH);
  addPathLabel(group, 'JALAN HERBALIST H', 9, -2);

  // [C] Herbalist vertical (from H path down to herbalist only)
  const herbalPathV = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 6.5), pathMat);
  herbalPathV.rotation.x = -Math.PI / 2;
  herbalPathV.position.set(18, 0.02, -4.75);
  herbalPathV.receiveShadow = true;
  group.add(herbalPathV);
  addPathLabel(group, 'JALAN HERBALIST V', 18, -4.75);

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
  addPathLabel(group, 'JALAN BRIDGE', 0, 2);

  // [F] Main → Barn (lurus horizontal ke barat)
  const farmPath = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), pathMat);
  farmPath.rotation.x = -Math.PI / 2;
  farmPath.position.set(-9, 0.02, 12);
  farmPath.receiveShadow = true;
  group.add(farmPath);
  addPathLabel(group, 'JALAN BARN', -9, 12);

  // [G] Main → Houses (horizontal ke kiri, z=8)
  const housePath1 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath1.rotation.x = -Math.PI / 2;
  housePath1.position.set(-3, 0.02, 8);
  housePath1.receiveShadow = true;
  group.add(housePath1);
  addPathLabel(group, 'JALAN RUMAH 1', -3, 8);

  // [H] Main → Houses (horizontal ke kiri, z=14)
  const housePath2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath2.rotation.x = -Math.PI / 2;
  housePath2.position.set(-3, 0.02, 14);
  housePath2.receiveShadow = true;
  group.add(housePath2);
  addPathLabel(group, 'JALAN RUMAH 2', -3, 14);

  // [I] Main → House (2,12) (horizontal ke kanan)
  const housePath3 = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), pathMat);
  housePath3.rotation.x = -Math.PI / 2;
  housePath3.position.set(1, 0.02, 12);
  housePath3.receiveShadow = true;
  group.add(housePath3);
  addPathLabel(group, 'JALAN RUMAH 3', 1, 12);
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
    { x: 3, z: 12, color: 0xC5E1A5, roof: 0x33691E, rot: -Math.PI / 2, label: 'Green House' },
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
  // Roof — gambrel (barn-style, 2 slopes) — lower↔upper swapped
  const barnRoofMat = new THREE.MeshLambertMaterial({ color: 0xB71C1C });
  // Lower slope (gentle — was upper)
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 2.5), barnRoofMat);
  roofL.position.set(0, 3.8, 1.2);
  roofL.rotation.x = -0.15;
  roofL.castShadow = true;
  barnG.add(roofL);
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 2.5), barnRoofMat);
  roofR.position.set(0, 3.8, -1.2);
  roofR.rotation.x = 0.15;
  roofR.castShadow = true;
  barnG.add(roofR);
  // Upper slope (steep — was lower)
  const roofT = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 1.2), barnRoofMat);
  roofT.position.y = 4.3;
  roofT.rotation.x = -0.3;
  barnG.add(roofT);
  const roofT2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 1.2), barnRoofMat);
  roofT2.position.y = 4.3;
  roofT2.rotation.x = 0.3;
  barnG.add(roofT2);
  // Ridge
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.15, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x8B0000 })
  );
  ridge.position.y = 4.5;
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

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 3 * scale, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    // Canopy (layered drooping leaf cubes)
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const leafGeo = new THREE.BoxGeometry(1.2 * scale, 0.3 * scale, 0.8 * scale);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(
        Math.cos(angle) * 1.5 * scale,
        2.5 * scale - Math.abs(Math.cos(angle)) * 0.5 * scale,
        Math.sin(angle) * 1.5 * scale
      );
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      g.add(leaf);
    }

    // Drooping vine-like leaves
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x81C784 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const vineGeo = new THREE.BoxGeometry(0.15 * scale, 2 * scale, 0.15 * scale);
      const vine = new THREE.Mesh(vineGeo, vineMat);
      vine.position.set(
        Math.cos(angle) * 2 * scale,
        1.5 * scale,
        Math.sin(angle) * 2 * scale
      );
      g.add(vine);
    }

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Oak tree (regular)
  function createOak(x, z, scale = 1) {
    const g = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 2 * scale, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    const leafGeo = new THREE.BoxGeometry(2 * scale, 1.5 * scale, 2 * scale);
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x43A047 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = 2.5 * scale;
    leaf.castShadow = true;
    g.add(leaf);

    g.position.set(x, 0, z);
    group.add(g);
  }

  // Bush (with optional flowers)
  function createBush(x, z, scale = 1, flower = false) {
    const g = new THREE.Group();

    const bushGeo = new THREE.BoxGeometry(1 * scale, 0.6 * scale, 1 * scale);
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.y = 0.3 * scale;
    bush.castShadow = true;
    g.add(bush);

    if (flower) {
      const colors = [0xFF69B4, 0xFFD700, 0xFF5722, 0xE91E63];
      for (let i = 0; i < 3; i++) {
        const fGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const fMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
        const f = new THREE.Mesh(fGeo, fMat);
        f.position.set(
          (Math.random() - 0.5) * 0.6 * scale,
          0.6 * scale,
          (Math.random() - 0.5) * 0.6 * scale
        );
        g.add(f);
      }
    }

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

    // Bushes
    { type: 'bush', x: -20, z: -5, s: 0.6, flower: true },
    { type: 'bush', x: -22, z: 0, s: 0.5, flower: true },
    { type: 'bush', x: -18, z: -2, s: 0.7, flower: true },
  ];

  trees.forEach(t => {
    if (t.type === 'willow') createWillow(t.x, t.z, t.s);
    else if (t.type === 'oak') createOak(t.x, t.z, t.s);
    else if (t.type === 'bush') createBush(t.x, t.z, t.s, t.flower);
  });
}

// --- Rocks ---
function addRocks(group) {
  const rocks = [
    { x: -15, z: -8, s: 0.5 },
    { x: 14, z: 10, s: 0.3 },
    { x: -8, z: 18, s: 0.4 },
    { x: 20, z: 5, s: 0.6 },
  ];

  const rockMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });

  rocks.forEach(r => {
    const geo = new THREE.DodecahedronGeometry(r.s, 0);
    const rock = new THREE.Mesh(geo, rockMat);
    rock.position.set(r.x, r.s * 0.5, r.z);
    rock.rotation.set(Math.random(), Math.random(), 0);
    rock.castShadow = true;
    group.add(rock);
  });
}

// --- Flowers ---
function addFlowers(group) {
  const flowers = [
    { x: -20, z: -8, color: 0xFF69B4 },
    { x: -22, z: -6, color: 0xFFD700 },
    { x: -19, z: -10, color: 0xFF69B4 },
    { x: -21, z: -9, color: 0xFFD700 },
    { x: -23, z: -7, color: 0xFF69B4 },
    { x: -18, z: -7, color: 0xFFD700 },
  ];

  flowers.forEach(f => {
    const g = new THREE.Group();

    // Stem
    const stemGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.2;
    g.add(stem);

    // Flower head
    const headGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const headMat = new THREE.MeshBasicMaterial({ color: f.color });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.5;
    g.add(head);

    g.position.set(f.x, 0, f.z);
    group.add(g);
  });
}

// --- Farms ---
function addFarms(group) {
  // Wheat field
  const wheatMat = new THREE.MeshLambertMaterial({ color: 0xF9A825 });
  for (let x = -24; x < -16; x += 0.8) {
    for (let z = 12; z < 18; z += 0.8) {
      const geo = new THREE.BoxGeometry(0.3, 0.5, 0.3);
      const wheat = new THREE.Mesh(geo, wheatMat);
      wheat.position.set(x, 0.25, z);
      group.add(wheat);
    }
  }

  // Carrot field (green tops)
  const carrotMat = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
  for (let x = -24; x < -16; x += 0.8) {
    for (let z = 19; z < 25; z += 0.8) {
      const geo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
      const carrot = new THREE.Mesh(geo, carrotMat);
      carrot.position.set(x, 0.2, z);
      group.add(carrot);
    }
  }

  // Fence around farms
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
  const fencePositions = [
    // Top
    ...Array.from({ length: 11 }, (_, i) => ({ x: -24 + i * 0.8, z: 11 })),
    // Bottom
    ...Array.from({ length: 11 }, (_, i) => ({ x: -24 + i * 0.8, z: 26 })),
    // Left
    ...Array.from({ length: 20 }, (_, i) => ({ x: -24.5, z: 11 + i * 0.8 })),
    // Right
    ...Array.from({ length: 20 }, (_, i) => ({ x: -15.5, z: 11 + i * 0.8 })),
  ];

  fencePositions.forEach(p => {
    const geo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const post = new THREE.Mesh(geo, fenceMat);
    post.position.set(p.x, 0.3, p.z);
    group.add(post);
  });
}
