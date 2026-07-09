// Zenithia — Monster 3D Models (Boxy Style)
import * as THREE from 'three';

const MONSTER_MODELS = {
  moss_beetle: (group, m) => {
    // Shell (dome)
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.3, 0.5),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    shell.position.y = 0.25;
    shell.castShadow = true;
    group.add(shell);

    // Shell highlight
    const highlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.25),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    highlight.position.y = 0.42;
    group.add(highlight);

    // Legs (6 small cubes)
    const legMat = new THREE.MeshLambertMaterial({ color: 0x33691E });
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.08), legMat);
      leg.position.set(-0.25, 0.08, -0.15 + i * 0.15);
      group.add(leg);
      const leg2 = leg.clone();
      leg2.position.x = 0.25;
      group.add(leg2);
    }

    // Antennae
    const antMat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
    const ant1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), antMat);
    ant1.position.set(-0.1, 0.45, 0.2);
    ant1.rotation.z = 0.3;
    group.add(ant1);
    const ant2 = ant1.clone();
    ant2.position.x = 0.1;
    ant2.rotation.z = -0.3;
    group.add(ant2);
  },

  dust_mouse: (group, m) => {
    // Body (round-ish ball)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.25;
    body.castShadow = true;
    group.add(body);

    // Puffy tail
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.2),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    tail.position.set(0, 0.3, -0.2);
    group.add(tail);

    // Ears
    const earMat = new THREE.MeshLambertMaterial({ color: 0xD7CCC8 });
    const ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.05), earMat);
    ear1.position.set(-0.1, 0.48, 0.05);
    group.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = 0.1;
    group.add(ear2);

    // Eyes (beady)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), eyeMat);
    eye1.position.set(-0.08, 0.3, 0.16);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.08;
    group.add(eye2);
  },

  thorn_lizard: (group, m) => {
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.7),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.2;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.2, 0.2),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    head.position.set(0, 0.25, 0.4);
    group.add(head);

    // Thorns (3 rows on back)
    const thornMat = new THREE.MeshLambertMaterial({ color: m.accentColor });
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const thorn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.06), thornMat);
        thorn.position.set(-0.12 + j * 0.12, 0.4, -0.15 + i * 0.15);
        group.add(thorn);
      }
    }

    // Tail
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.3),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    tail.position.set(0, 0.15, -0.45);
    tail.rotation.x = -0.2;
    group.add(tail);
  },

  puddle_frog: (group, m) => {
    // Body (wide)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.45),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.2;
    body.castShadow = true;
    group.add(body);

    // Eyes (bulging on top)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), eyeMat);
    eye1.position.set(-0.12, 0.45, 0.1);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.12;
    group.add(eye2);

    // Pupils
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pupil1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.04), pupilMat);
    pupil1.position.set(-0.12, 0.45, 0.17);
    group.add(pupil1);
    const pupil2 = pupil1.clone();
    pupil2.position.x = 0.12;
    group.add(pupil2);

    // Back legs (bent)
    const legMat = new THREE.MeshLambertMaterial({ color: m.accentColor });
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.15), legMat);
    leg1.position.set(-0.2, 0.1, -0.2);
    leg1.rotation.x = 0.5;
    group.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.x = 0.2;
    group.add(leg2);
  },

  wind_sprite: (group, m) => {
    // Core (glowing orb)
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.8 })
    );
    core.position.y = 0.8;
    core.castShadow = true;
    group.add(core);

    // Inner glow
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.15),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    );
    glow.position.y = 0.8;
    group.add(glow);

    // Wind wisps (trailing cubes)
    const wispMat = new THREE.MeshBasicMaterial({ color: m.accentColor, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), wispMat);
      const angle = (i / 4) * Math.PI * 2;
      wisp.position.set(
        Math.cos(angle) * 0.3,
        0.8 + Math.sin(angle) * 0.2,
        Math.sin(angle) * 0.3
      );
      group.add(wisp);
    }
  },

  rock_crawler: (group, m) => {
    // Body (looks like a rock)
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.25, 0),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.2;
    body.castShadow = true;
    group.add(body);

    // Second rock piece
    const piece = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.15, 0),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    piece.position.set(0.1, 0.35, 0.05);
    group.add(piece);

    // Tiny eyes (hidden in cracks)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF5722 });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), eyeMat);
    eye1.position.set(-0.08, 0.25, 0.22);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.08;
    group.add(eye2);
  },

  bramble_boar: (group, m) => {
    // Body (large)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 1.0),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.4, 0.3),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    head.position.set(0, 0.6, 0.55);
    group.add(head);

    // Tusks
    const tuskMat = new THREE.MeshLambertMaterial({ color: 0xFFF9C4 });
    const tusk1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.06), tuskMat);
    tusk1.position.set(-0.15, 0.45, 0.65);
    tusk1.rotation.z = 0.3;
    group.add(tusk1);
    const tusk2 = tusk1.clone();
    tusk2.position.x = 0.15;
    tusk2.rotation.z = -0.3;
    group.add(tusk2);

    // Thorns on back
    const thornMat = new THREE.MeshLambertMaterial({ color: m.accentColor });
    for (let i = 0; i < 5; i++) {
      const thorn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), thornMat);
      thorn.position.set(
        (Math.random() - 0.5) * 0.4,
        0.9,
        -0.3 + i * 0.15
      );
      group.add(thorn);
    }

    // Legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
    const legPositions = [[-0.3, 0, 0.3], [0.3, 0, 0.3], [-0.3, 0, -0.3], [0.3, 0, -0.3]];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), legMat);
      leg.position.set(x, 0.18, z);
      group.add(leg);
    });
  },
};

// Create monster model
export function createMonsterModel(monsterType, monsterData) {
  const group = new THREE.Group();

  const modelFn = MONSTER_MODELS[monsterType];
  if (modelFn) {
    modelFn(group, monsterData);
  } else {
    // Fallback: simple box
    const geo = new THREE.BoxGeometry(monsterData.size, monsterData.size, monsterData.size);
    const mat = new THREE.MeshLambertMaterial({ color: monsterData.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = monsterData.size / 2;
    mesh.castShadow = true;
    group.add(mesh);
  }

  // HP bar
  const hpBg = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  hpBg.position.y = (monsterData.size || 0.5) + 0.3;
  hpBg.rotation.x = -0.3;
  group.add(hpBg);

  const hpFill = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xF44336 })
  );
  hpFill.position.y = (monsterData.size || 0.5) + 0.3;
  hpFill.position.z = 0.001;
  hpFill.rotation.x = -0.3;
  group.add(hpFill);
  group.userData.hpBar = hpFill;
  group.userData.hpBarWidth = 0.8;

  // Name tag
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 256;
  nameCanvas.height = 64;
  const ctx = nameCanvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.roundRect(0, 0, 256, 64, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '24px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(monsterData.name, 128, 40);

  const nameTexture = new THREE.CanvasTexture(nameCanvas);
  const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTexture, transparent: true }));
  nameSprite.position.y = (monsterData.size || 0.5) + 0.5;
  nameSprite.scale.set(1.2, 0.3, 1);
  group.add(nameSprite);

  return group;
}

// Update HP bar
export function updateMonsterHPBar(model, currentHp, maxHp) {
  const hpBar = model.userData.hpBar;
  if (hpBar) {
    const ratio = Math.max(0, currentHp / maxHp);
    hpBar.scale.x = ratio;
    hpBar.position.x = -(1 - ratio) * model.userData.hpBarWidth * 0.5;
  }
}

// Monster idle animation
export function animateMonster(model, time) {
  if (!model) return;
  // Gentle bob
  model.position.y = Math.sin(time * 2) * 0.05;
  // Slight rotation wobble
  model.rotation.y += Math.sin(time * 1.5) * 0.002;
}
