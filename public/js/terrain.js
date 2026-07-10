// Zenithia — Terrain Renderer
// Builds 3D scene from TERRAIN data (fixed positions, unique landmarks)

import * as THREE from 'three';

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
function addPaths(group) {
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xBCAAA4 });

  // Main vertical path (Elder's Hall → Gate, full village length)
  const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 40), pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.02, 4);
  mainPath.receiveShadow = true;
  group.add(mainPath);

  // Main path → Market stalls (short horizontal)
  const stallPath = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  stallPath.rotation.x = -Math.PI / 2;
  stallPath.position.set(3, 0.02, 4);
  stallPath.receiveShadow = true;
  group.add(stallPath);

  // Main path → Herbalist (diagonal, ends at herbalist door x=16.75)
  const herbalPath = createDiagonalPath(0, 2, 16.75, -8, 1.5, pathMat);
  group.add(herbalPath);

  // Main path → Barn (diagonal, ends at barn door z=14)
  const farmPath = createDiagonalPath(0, 8, -18, 14, 1.5, pathMat);
  group.add(farmPath);

  // Main path → House cluster (horizontal at z=8)
  const housePath1 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath1.rotation.x = -Math.PI / 2;
  housePath1.position.set(-3, 0.02, 8);
  housePath1.receiveShadow = true;
  group.add(housePath1);

  // Main path → House cluster (horizontal at z=14)
  const housePath2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), pathMat);
  housePath2.rotation.x = -Math.PI / 2;
  housePath2.position.set(-3, 0.02, 14);
  housePath2.receiveShadow = true;
  group.add(housePath2);

  // Main path → House at (2,12) (short horizontal)
  const housePath3 = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), pathMat);
  housePath3.rotation.x = -Math.PI / 2;
  housePath3.position.set(1, 0.02, 12);
  housePath3.receiveShadow = true;
  group.add(housePath3);
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
  const buildings = [
    // Elder's Hall — face south toward main path
    { x: 0, z: -15, w: 6, h: 4, d: 5, color: 0x8D6E63, roof: 0x5D4037, label: 'Elder\'s Hall', rot: 0 },

    // Market stalls — neat row facing main path (west)
    { x: 6, z: 0, w: 2, h: 2, d: 2, color: 0xFFCC80, roof: 0xE65100, label: 'Stall', rot: Math.PI / 2 },
    { x: 6, z: 4, w: 2, h: 2, d: 2, color: 0xFFCC80, roof: 0xE65100, label: 'Stall', rot: Math.PI / 2 },
    { x: 6, z: 8, w: 2, h: 2, d: 2, color: 0xFFCC80, roof: 0xE65100, label: 'Stall', rot: Math.PI / 2 },

    // Houses — varied colors, face nearest road
    { x: -6, z: 8, w: 3, h: 2.5, d: 3, color: 0xD7CCC8, roof: 0x5D4037, rot: -Math.PI / 2, label: 'Willow Cottage' },
    { x: -6, z: 14, w: 3, h: 2.5, d: 3, color: 0xBCAAA4, roof: 0x795548, rot: -Math.PI / 2, label: 'River House' },
    { x: 2, z: 12, w: 3, h: 2.5, d: 3, color: 0xC5E1A5, roof: 0x33691E, rot: Math.PI / 2, label: 'Green House' },

    // Herbalist's hut — face west toward path
    { x: 18, z: -8, w: 2.5, h: 2, d: 2.5, color: 0x6D4C41, roof: 0x33691E, label: 'Herbalist', rot: Math.PI / 2 },

    // Guard post — face south toward gate
    { x: 0, z: 22, w: 2, h: 3, d: 2, color: 0x607D8B, roof: 0x455A64, label: 'Gate', rot: 0 },

    // Mr. Tani's barn — face south
    { x: -18, z: 12, w: 5, h: 3, d: 4, color: 0xD32F2F, roof: 0xB71C1C, label: 'Barn', rot: 0 },
  ];

  buildings.forEach(b => {
    const g = new THREE.Group();

    // Walls
    const wallGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
    const wallMat = new THREE.MeshLambertMaterial({ color: b.color });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = b.h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);

    // Roof (triangular prism) — local rotation only, group handles building rot
    const roofGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.7, 1.5, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: b.roof });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = b.h + 0.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    // Door (small dark box)
    const doorGeo = new THREE.BoxGeometry(0.6, 1.2, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.6, b.d / 2 + 0.05);
    g.add(door);

    // Window (small light box)
    const winGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xFFF9C4 });
    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(-b.w / 4, b.h * 0.6, b.d / 2 + 0.05);
    g.add(win1);
    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(b.w / 4, b.h * 0.6, b.d / 2 + 0.05);
    g.add(win2);

    g.position.set(b.x, 0, b.z);
    g.rotation.y = b.rot || 0;
    group.add(g);

    // Label (text sprite above building)
    if (b.label) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = 256;
      canvas2.height = 64;
      const ctx = canvas2.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.roundRect(0, 0, 256, 64, 8);
      ctx.fill();
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, 128, 32);
      const tex = new THREE.CanvasTexture(canvas2);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4, 1, 1);
      sprite.position.set(b.x, b.h + 2.5, b.z);
      group.add(sprite);
    }
  });
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
