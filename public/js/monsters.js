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

  // ═══════════════════════════════════════
  // STORMCREST MOUNTAINS — Lv.5-8
  // ═══════════════════════════════════════
  storm_hawk: (group, m) => {
    // Body — sleek bird shape
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.25, 0.6),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.25),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    head.position.set(0, 0.95, 0.3);
    group.add(head);

    // Beak
    const beak = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, 0.15),
      new THREE.MeshLambertMaterial({ color: 0xFF8F00 })
    );
    beak.position.set(0, 0.92, 0.45);
    group.add(beak);

    // Wings (2 flat boxes)
    const wingMat = new THREE.MeshLambertMaterial({ color: m.color });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.3), wingMat);
    wingL.position.set(-0.35, 0.85, 0);
    wingL.rotation.z = 0.2;
    group.add(wingL);
    const wingR = wingL.clone();
    wingR.position.x = 0.35;
    wingR.rotation.z = -0.2;
    group.add(wingR);

    // Tail feathers
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.04, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x546E7A })
    );
    tail.position.set(0, 0.82, -0.35);
    group.add(tail);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.03), eyeMat);
    eye1.position.set(-0.08, 0.98, 0.38);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.08;
    group.add(eye2);

    // Talons
    const talonMat = new THREE.MeshLambertMaterial({ color: 0xFF8F00 });
    [-0.1, 0.1].forEach(x => {
      const talon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.06), talonMat);
      talon.position.set(x, 0.55, 0.05);
      group.add(talon);
    });
  },

  stone_golem: (group, m) => {
    // Body — massive block
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.9, 0.6),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    // Head — small block on top
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.35, 0.35),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    head.position.y = 1.25;
    group.add(head);

    // Eyes — glowing crystal
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.04), eyeMat);
    eye1.position.set(-0.1, 1.3, 0.18);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.1;
    group.add(eye2);

    // Arms — thick blocks
    const armMat = new THREE.MeshLambertMaterial({ color: 0x757575 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), armMat);
    armL.position.set(-0.55, 0.55, 0);
    group.add(armL);
    const armR = armL.clone();
    armR.position.x = 0.55;
    group.add(armR);

    // Fists — bigger blocks
    const fistMat = new THREE.MeshLambertMaterial({ color: 0x616161 });
    const fistL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), fistMat);
    fistL.position.set(-0.55, 0.15, 0);
    group.add(fistL);
    const fistR = fistL.clone();
    fistR.position.x = 0.55;
    group.add(fistR);

    // Legs — short thick
    const legMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
    [-0.2, 0.2].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), legMat);
      leg.position.set(x, 0.18, 0);
      group.add(leg);
    });

    // Crystal on chest
    const crystal = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xFFD54F })
    );
    crystal.position.set(0, 0.7, 0.32);
    group.add(crystal);
  },

  // ═══════════════════════════════════════
  // MISTMARSH SWAMP — Lv.8-10
  // ═══════════════════════════════════════
  marsh_snapper: (group, m) => {
    // Shell — dome shape
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.35, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x2E7D32 })
    );
    shell.position.y = 0.35;
    shell.castShadow = true;
    group.add(shell);

    // Shell pattern
    const pattern = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.5),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    pattern.position.y = 0.55;
    group.add(pattern);

    // Head — long snout
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.2, 0.35),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    head.position.set(0, 0.25, 0.45);
    group.add(head);

    // Snout
    const snout = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x1B5E20 })
    );
    snout.position.set(0, 0.22, 0.6);
    group.add(snout);

    // Eyes — on top of head
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), eyeMat);
    eye1.position.set(-0.1, 0.35, 0.5);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.1;
    group.add(eye2);

    // Tail
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.3),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    tail.position.set(0, 0.2, -0.5);
    group.add(tail);

    // Legs — 4 short stubs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x33691E });
    [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.12), legMat);
      leg.position.set(x, 0.1, z);
      group.add(leg);
    });
  },

  swamp_lurker: (group, m) => {
    // Body — hunched humanoid
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.4),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Head — angular
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    head.position.set(0, 0.95, 0.1);
    group.add(head);

    // Eyes — red glow
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xF44336 });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.03), eyeMat);
    eye1.position.set(-0.08, 0.98, 0.26);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.08;
    group.add(eye2);

    // Arms — long, clawed
    const armMat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), armMat);
    armL.position.set(-0.35, 0.4, 0.15);
    armL.rotation.z = 0.3;
    group.add(armL);
    const armR = armL.clone();
    armR.position.x = 0.35;
    armR.rotation.z = -0.3;
    group.add(armR);

    // Claws
    const clawMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
    [-0.45, 0.45].forEach(x => {
      for (let i = 0; i < 3; i++) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.03), clawMat);
        claw.position.set(x + (i - 1) * 0.04, 0.12, 0.2);
        group.add(claw);
      }
    });

    // Legs — bent
    const legMat = new THREE.MeshLambertMaterial({ color: 0x33691E });
    [-0.15, 0.15].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.15), legMat);
      leg.position.set(x, 0.15, -0.05);
      group.add(leg);
    });

    // Swamp vines on body
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x558B2F });
    for (let i = 0; i < 3; i++) {
      const vine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), vineMat);
      vine.position.set(-0.15 + i * 0.15, 0.7, 0.21);
      vine.rotation.z = (i - 1) * 0.2;
      group.add(vine);
    }
  },

  toxic_toad: (group, m) => {
    // Body — round blob
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.55),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.3;
    body.castShadow = true;
    group.add(body);

    // Belly — lighter
    const belly = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.25, 0.4),
      new THREE.MeshLambertMaterial({ color: m.accentColor })
    );
    belly.position.set(0, 0.2, 0.1);
    group.add(belly);

    // Head — wide
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.25, 0.3),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    head.position.set(0, 0.55, 0.2);
    group.add(head);

    // Eyes — bulging on top
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.08), eyeMat);
    eye1.position.set(-0.15, 0.72, 0.25);
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.x = 0.15;
    group.add(eye2);

    // Pupils
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pupil1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), pupilMat);
    pupil1.position.set(-0.15, 0.72, 0.3);
    group.add(pupil1);
    const pupil2 = pupil1.clone();
    pupil2.position.x = 0.15;
    group.add(pupil2);

    // Mouth — wide grin
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.03, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x4A148C })
    );
    mouth.position.set(0, 0.45, 0.36);
    group.add(mouth);

    // Legs — squat
    const legMat = new THREE.MeshLambertMaterial({ color: 0x6A1B9A });
    [-0.25, 0.25].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.22), legMat);
      leg.position.set(x, 0.1, 0.1);
      group.add(leg);
    });

    // Back legs (jumping legs)
    [-0.2, 0.2].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.25), legMat);
      leg.position.set(x, 0.12, -0.15);
      group.add(leg);
    });

    // Toxic bubbles
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xCE93D8, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 3; i++) {
      const bubble = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), bubbleMat);
      bubble.position.set(-0.2 + i * 0.2, 0.75 + i * 0.05, 0.1);
      group.add(bubble);
    }
  },

  // ═══════════════════════════════════════
  // WORLD BOSSES
  // ═══════════════════════════════════════
  thornback_ancient: (group, m) => {
    // Massive body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.0, 1.0),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x2E7D32 })
    );
    head.position.set(0, 1.5, 0.2);
    group.add(head);

    // Horns
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    [-0.2, 0.2].forEach(x => {
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), hornMat);
      horn.position.set(x, 1.8, 0.15);
      horn.rotation.z = x > 0 ? -0.3 : 0.3;
      group.add(horn);
    });

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x76FF03 });
    [-0.12, 0.12].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), eyeMat);
      eye.position.set(x, 1.55, 0.42);
      group.add(eye);
    });

    // Arms
    const armMat = new THREE.MeshLambertMaterial({ color: 0x33691E });
    [-0.7, 0.7].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), armMat);
      arm.position.set(x, 0.6, 0);
      group.add(arm);
    });

    // Thorns on body
    const thornMat = new THREE.MeshLambertMaterial({ color: 0x76FF03 });
    for (let i = 0; i < 5; i++) {
      const thorn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), thornMat);
      thorn.position.set(-0.4 + i * 0.2, 1.35, -0.3);
      group.add(thorn);
    }

    // Legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
    [[-0.35, 0.3], [0.35, 0.3], [-0.35, -0.3], [0.35, -0.3]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.25), legMat);
      leg.position.set(x, 0.2, z);
      group.add(leg);
    });
  },

  forest_guardian: (group, m) => {
    // Massive tree-like body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.2, 0.8),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // Canopy (head)
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 1.0),
      new THREE.MeshLambertMaterial({ color: 0x2E7D32 })
    );
    canopy.position.y = 1.8;
    group.add(canopy);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x76FF03 });
    [-0.2, 0.2].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.04), eyeMat);
      eye.position.set(x, 1.9, 0.52);
      group.add(eye);
    });

    // Root arms
    const rootMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    [-0.6, 0.6].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), rootMat);
      arm.position.set(x, 0.5, 0.1);
      arm.rotation.z = x > 0 ? -0.2 : 0.2;
      group.add(arm);
    });

    // Roots at base
    for (let i = 0; i < 4; i++) {
      const root = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.4), rootMat);
      root.position.set(-0.3 + i * 0.2, 0.05, 0.3);
      group.add(root);
    }

    // Leaves
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x76FF03 });
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.15), leafMat);
      leaf.position.set(-0.4 + i * 0.16, 2.2 + Math.random() * 0.2, -0.3 + Math.random() * 0.6);
      group.add(leaf);
    }
  },

  storm_titan: (group, m) => {
    // Massive stone body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.3, 0.9),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Head — angular
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.45, 0.45),
      new THREE.MeshLambertMaterial({ color: 0x78909C })
    );
    head.position.y = 1.9;
    group.add(head);

    // Eyes — lightning
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F });
    [-0.12, 0.12].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.04), eyeMat);
      eye.position.set(x, 1.95, 0.24);
      group.add(eye);
    });

    // Massive arms
    const armMat = new THREE.MeshLambertMaterial({ color: 0x616161 });
    [-0.65, 0.65].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), armMat);
      arm.position.set(x, 0.7, 0);
      group.add(arm);
    });

    // Fists
    const fistMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
    [-0.65, 0.65].forEach(x => {
      const fist = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), fistMat);
      fist.position.set(x, 0.15, 0);
      group.add(fist);
    });

    // Lightning crystal on chest
    const crystal = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xFFD54F })
    );
    crystal.position.set(0, 1.1, 0.47);
    group.add(crystal);

    // Legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x546E7A });
    [-0.25, 0.25].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), legMat);
      leg.position.set(x, 0.2, 0);
      group.add(leg);
    });
  },

  abyssal_hydra: (group, m) => {
    // Massive serpentine body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.7, 1.2),
      new THREE.MeshLambertMaterial({ color: m.color })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // 3 heads
    const headMat = new THREE.MeshLambertMaterial({ color: 0x6A1B9A });
    [-0.3, 0, 0.3].forEach((x, i) => {
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), headMat);
      neck.position.set(x, 1.1, 0.3);
      neck.rotation.x = -0.2 + i * 0.1;
      group.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.25), headMat);
      head.position.set(x, 1.4, 0.4);
      group.add(head);

      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
      [-0.04, 0.04].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), eyeMat);
        eye.position.set(x + ex, 1.43, 0.54);
        group.add(eye);
      });

      // Fangs
      const fangMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      [-0.03, 0.03].forEach(fx => {
        const fang = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), fangMat);
        fang.position.set(x + fx, 1.32, 0.53);
        group.add(fang);
      });
    });

    // Tail
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.25, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x4A148C })
    );
    tail.position.set(0, 0.35, -0.7);
    group.add(tail);

    // Scales
    const scaleMat = new THREE.MeshLambertMaterial({ color: 0xCE93D8 });
    for (let i = 0; i < 4; i++) {
      const scale = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), scaleMat);
      scale.position.set(-0.2 + i * 0.13, 0.9, -0.2 + i * 0.15);
      group.add(scale);
    }

    // Toxic bubbles
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xCE93D8, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const bubble = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), bubbleMat);
      bubble.position.set(-0.3 + i * 0.2, 0.15 + Math.random() * 0.3, 0.5 + Math.random() * 0.3);
      group.add(bubble);
    }
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

  // HP bar — bigger, always visible
  const hpBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x333333, depthTest: false })
  );
  hpBg.position.y = (monsterData.size || 0.5) + 0.35;
  hpBg.renderOrder = 998;
  group.add(hpBg);

  const hpFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xF44336, depthTest: false })
  );
  hpFill.position.y = (monsterData.size || 0.5) + 0.35;
  hpFill.position.z = 0.001;
  hpFill.renderOrder = 999;
  group.add(hpFill);
  group.userData.hpBar = hpFill;
  group.userData.hpBarWidth = 1.0;

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

// Monster attack lunge — called on monster_attack event
export function monsterAttackAnim(model, duration = 400) {
  if (!model) return;
  const startY = model.position.y;
  const startRot = model.rotation.x;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    if (p < 0.3) {
      // Wind up — lean back
      const lp = p / 0.3;
      model.rotation.x = startRot - 0.15 * lp;
      model.position.y = startY + 0.08 * lp;
    } else if (p < 0.6) {
      // Lunge forward
      const lp = (p - 0.3) / 0.3;
      model.rotation.x = startRot - 0.15 + 0.3 * lp;
      model.position.y = startY + 0.08 - 0.15 * lp;
    } else {
      // Recover
      const lp = (p - 0.6) / 0.4;
      model.rotation.x = startRot + 0.15 * (1 - lp);
      model.position.y = startY - 0.07 * (1 - lp);
    }
    if (p < 1) requestAnimationFrame(step);
    else { model.rotation.x = startRot; model.position.y = startY; }
  }
  requestAnimationFrame(step);
}
