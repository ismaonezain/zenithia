// Zenithia — Client Entry Point
import * as THREE from 'three';
import { buildTerrain, isWalkable, getWaterMeshes, getStreetLamps, getHouseLights } from './terrain.js';
import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment, blinkEyes, waveHand, idleArms, animateIdle } from './character.js';
import { DialogueSystem } from './dialogue_ui.js';
import { InventoryUI } from './inventory.js';
import { QuestUI } from './quest_ui.js';
import { PartyUI } from './party_ui.js';
import { ShopUI } from './shop_ui.js';
import { createMonsterModel, updateMonsterHPBar, animateMonster, monsterAttackAnim } from './monsters.js';

// --- State ---
const state = {
  playerId: null,
  player: null,
  ws: null,
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  players: {},
  npcs: {},
  connected: false,
  targetPos: null,
  interactTarget: null,
  persistentId: (() => {
    let id = localStorage.getItem('zenithia_persistent_id');
    if (!id) { id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); localStorage.setItem('zenithia_persistent_id', id); }
    return id;
  })(),
  customization: (() => {
    try { return JSON.parse(localStorage.getItem('zenithia_customization')) || {}; } catch(e) { return {}; }
  })() || {
    gender: 'male', classType: 'laborer', skinIdx: 0, hairColorIdx: 0, hairStyle: 'undercut', topColorIdx: 0, bottomColorIdx: 0, eyeColorIdx: 0,
  },
  walletAddress: null,
  previewScene: null,
  previewCamera: null,
  previewRenderer: null,
  previewModel: null,
  dialogue: null,
  inventoryUI: null,
  questUI: null,
  partyUI: null,
  shopUI: null,
  cameraDistance: window.innerWidth < 768 ? 30 : 20,
  cameraAngleX: 0,
  cameraAngleY: window.innerWidth < 768 ? 0.5 : 0.3,
  isOrbiting: false,
  lastMouseX: 0,
  lastMouseY: 0,
  monsters: {},
  damageNumbers: [],
  // Combat system
  targetedMonster: null,  // currently targeted monster id
  targetIndicator: null,  // visual ring mesh
  lastAttackTime: 0,      // client-side cooldown tracking
  autoAttacking: false,   // auto-attack loop active
  skillArmed: null,       // { classType, skill } — skill ready to cast, waiting for target click
  isAttacking: false,     // attack animation playing — skip walk/idle arm overrides
  attackEndTime: 0,       // when attack anim finishes
  isDead: false,          // death screen active
  // Hotbar system
  hotbar: (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('zenithia_hotbar'));
      if (Array.isArray(saved) && saved.length === 10) return saved;
    } catch(e) {}
    return null; // Will be initialized with defaults in initSkillUI
  })(),
  hotbarPickerSlot: null,  // which slot is being reassigned
  flashlightOn: false,
  flashlight: null,
  unlockedSkills: ['tier1'], // skill tree unlocks from server
  // Day/night cycle
  dayTime: 0.25,         // 0-1, 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
  daySpeed: 1 / 1200,    // full cycle = 1200 seconds (20 min, matches server)
  sunLight: null,
  ambientLight: null,
  moonMesh: null,
  starField: null,
};

const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const hud = document.getElementById('hud');

// ============================
// THREE.JS SCENE
// ============================
function initScene() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x87CEEB);
  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  state.camera.position.set(0, 15, 20);

  // Mobile: bigger camera distance so character doesn't dominate screen
  const isMobile = window.innerWidth < 768;
  state.cameraDistance = isMobile ? 30 : 20;

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  state.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  state.scene.add(state.ambientLight);
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(30, 50, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.0005;
  state.scene.add(sun);
  state.sunLight = sun;

  // === SUN MESH (visual) ===
  const sunMeshGeo = new THREE.SphereGeometry(4, 16, 16);
  const sunMeshMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
  state.sunMesh = new THREE.Mesh(sunMeshGeo, sunMeshMat);
  state.scene.add(state.sunMesh);

  // === MOON ===
  const moonGeo = new THREE.SphereGeometry(5, 20, 20);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
  state.moonMesh = new THREE.Mesh(moonGeo, moonMat);
  state.moonMesh.visible = false;
  state.scene.add(state.moonMesh);

  // Moon glow
  const moonGlowGeo = new THREE.SphereGeometry(7, 16, 16);
  const moonGlowMat = new THREE.MeshBasicMaterial({ color: 0xaaaacc, transparent: true, opacity: 0.15 });
  state.moonGlow = new THREE.Mesh(moonGlowGeo, moonGlowMat);
  state.moonGlow.visible = false;
  state.scene.add(state.moonGlow);

  // === STARS ===
  const starCount = 500;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 200;
    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
    if (starPositions[i * 3 + 1] < 20) starPositions[i * 3 + 1] = Math.abs(starPositions[i * 3 + 1]) + 20;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false });
  state.starField = new THREE.Points(starGeo, starMat);
  state.starField.visible = false;
  state.scene.add(state.starField);

  // === MOON LIGHT (dim light at night) ===
  state.moonLight = new THREE.DirectionalLight(0x6666aa, 0);
  state.moonLight.position.set(0, 50, -30);
  state.scene.add(state.moonLight);

  buildTerrain(state.scene);
  state.clock = new THREE.Clock();

  // Init dialogue system
  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
  state.questUI = new QuestUI(null, { name: 'Adventurer' });
  state.partyUI = new PartyUI(null, { name: 'Adventurer' });
  state.shopUI = new ShopUI(null, { name: 'Adventurer', zen: 50, inventory: [] });

  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Zoom in/out with mouse wheel
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    state.cameraDistance += e.deltaY * 0.02;
    state.cameraDistance = Math.max(5, Math.min(50, state.cameraDistance));
  }, { passive: false });

  // Orbit camera — hold right-click + drag to rotate
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      state.isOrbiting = true;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!state.isOrbiting) return;
    const dx = e.clientX - state.lastMouseX;
    const dy = e.clientY - state.lastMouseY;
    state.cameraAngleX -= dx * 0.005;
    state.cameraAngleY = Math.max(-0.2, Math.min(1.2, state.cameraAngleY + dy * 0.005));
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });
  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2) state.isOrbiting = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // === TOUCH CONTROLS ===
  let touchStartDist = 0;
  let touchStartAngle = 0;
  let touchStartTime = 0;
  let touchStartPos = { x: 0, y: 0 };
  let isTouchOrbit = false;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Two-finger: orbit + zoom
      isTouchOrbit = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist = Math.sqrt(dx * dx + dy * dy);
      state.lastMouseX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      state.lastMouseY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    } else if (e.touches.length === 1) {
      // Single tap: record start for move
      isTouchOrbit = false;
      touchStartTime = Date.now();
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && isTouchOrbit) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = touchStartDist - dist;
      state.cameraDistance = Math.max(5, Math.min(50, state.cameraDistance + delta * 0.05));
      touchStartDist = dist;

      // Orbit drag
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const odx = mx - state.lastMouseX;
      const ody = my - state.lastMouseY;
      state.cameraAngleX -= odx * 0.005;
      state.cameraAngleY = Math.max(-0.2, Math.min(1.2, state.cameraAngleY + ody * 0.005));
      state.lastMouseX = mx;
      state.lastMouseY = my;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length < 2) isTouchOrbit = false;

    // Single tap → move (if quick tap, not drag)
    if (e.changedTouches.length === 1 && !isTouchOrbit) {
      const touch = e.changedTouches[0];
      const elapsed = Date.now() - touchStartTime;
      const dist = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.x, 2) +
        Math.pow(touch.clientY - touchStartPos.y, 2)
      );
      // Quick tap (< 300ms, < 20px movement)
      if (elapsed < 300 && dist < 20) {
        // Simulate click event
        const clickEvent = new MouseEvent('click', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        canvas.dispatchEvent(clickEvent);
      }
    }
  }, { passive: false });

  // Combat: target indicator ring
  createTargetIndicator();

  // Init minimap canvas
  initMinimap();
}

// ============================
// PREVIEW SCENE
// ============================
function initPreview() {
  const pCanvas = document.getElementById('preview-canvas');
  state.previewScene = new THREE.Scene();
  state.previewScene.background = new THREE.Color(0x2a2a3e);

  state.previewCamera = new THREE.PerspectiveCamera(50, 220 / 300, 0.1, 10);
  state.previewCamera.position.set(0, 1.2, 3);
  state.previewCamera.lookAt(0, 0.8, 0);

  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
  state.previewRenderer.setSize(220, 300);

  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(2, 3, 2);
  state.previewScene.add(dir);

  updatePreviewModel();
}

const PANTS_COLORS = [0x5D4037, 0x37474F, 0x1B5E20, 0x4E342E, 0x212121, 0x0D47A1, 0xBF360C, 0x880E4F];
const CLASS_TRIM = { laborer: 0x8D6E63, miner: 0x78909C, gardener: 0x66BB6A, herbalist: 0xAB47BC, watchman: 0x455A64 };

// Class base stats — different playstyles
const CLASS_STATS = {
  laborer:  { hp: 120, mp: 30, atk: 8,  def: 7,  spd: 6,  crit: 0.05 },
  miner:    { hp: 90,  mp: 40, atk: 12, def: 4,  spd: 10, crit: 0.10 },
  gardener: { hp: 100, mp: 50, atk: 6,  def: 6,  spd: 8,  crit: 0.08 },
  herbalist:{ hp: 85,  mp: 70, atk: 5,  def: 5,  spd: 7,  crit: 0.05 },
  watchman: { hp: 110, mp: 35, atk: 10, def: 8,  spd: 7,  crit: 0.07 },
};

// Class descriptions — lore + gameplay role
const CLASS_INFO = {
  laborer:  { title: 'Guardian', desc: 'Tangguh dan kuat. Melindungi desa dengan pertahanan kokoh.', role: 'Tank', icon: '🛡️' },
  miner:    { title: 'Blade Dancer', desc: 'Cepat dan mematikan. Mengandalkan kecepatan serangan.', role: 'DPS', icon: '⚔️' },
  gardener: { title: 'Ranger', desc: 'Seimbang antara serangan dan pertahanan.', role: 'All-Rounder', icon: '🌿' },
  herbalist:{ title: 'Sage', desc: 'Ahli ramuan dan sihir. Lemah tapi paling berbakat.', role: 'Support', icon: '✨' },
  watchman: { title: 'Sentinel', desc: 'Waspada dan akurat. Keseimbangan kekuatan dan ketangkasan.', role: 'Bruiser', icon: '👁️' },
};

function updatePreviewModel() {
  if (state.previewModel) state.previewScene.remove(state.previewModel);
  const c = state.customization;
  state.previewModel = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx],
    hairColor: PALETTES.hair[c.hairColorIdx],
    hairStyle: c.hairStyle,
    bodyColor: PALETTES.body[c.topColorIdx],
    pantsColor: PANTS_COLORS[c.bottomColorIdx],
    eyeColor: PALETTES.eyes[c.eyeColorIdx],
    trimColor: CLASS_TRIM[c.classType] || 0xFFFFFF,
    gender: c.gender,
    classType: c.classType,
  });
  state.previewScene.add(state.previewModel);
}

// ============================
// CUSTOMIZATION UI
// ============================
function restoreCustomizationUI() {
  const c = state.customization;
  // Restore gender
  if (c.gender) {
    const gp = document.getElementById('gender-picker');
    if (gp) {
      gp.querySelectorAll('.option').forEach(o => {
        o.classList.toggle('selected', o.textContent.toLowerCase().includes(c.gender));
      });
    }
  }
  // Restore class
  if (c.classType) {
    const cp = document.getElementById('class-picker');
    if (cp) {
      cp.querySelectorAll('.option').forEach(o => {
        o.classList.toggle('selected', o.textContent.toLowerCase().includes(c.classType));
      });
    }
  }
  // Restore skin
  if (c.skinIdx !== undefined) {
    const sp = document.getElementById('skin-picker');
    if (sp) {
      sp.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('selected', i === c.skinIdx));
    }
  }
  // Restore hair color
  if (c.hairColorIdx !== undefined) {
    const hp = document.getElementById('hair-color-picker');
    if (hp) {
      hp.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('selected', i === c.hairColorIdx));
    }
  }
  // Restore hair style
  if (c.hairStyle) {
    const sp = document.getElementById('hair-style-picker');
    if (sp) {
      sp.querySelectorAll('.option').forEach(o => o.classList.toggle('selected', o.textContent === c.hairStyle));
    }
  }
  // Restore top color
  if (c.topColorIdx !== undefined) {
    const tp = document.getElementById('top-picker');
    if (tp) {
      tp.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('selected', i === c.topColorIdx));
    }
  }
  // Restore bottom color
  if (c.bottomColorIdx !== undefined) {
    const bp = document.getElementById('bottom-picker');
    if (bp) {
      bp.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('selected', i === c.bottomColorIdx));
    }
  }
  // Restore eye color
  if (c.eyeColorIdx !== undefined) {
    const ep = document.getElementById('eye-picker');
    if (ep) {
      ep.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('selected', i === c.eyeColorIdx));
    }
  }
  updatePreviewModel();
}

function initCustomization() {
  // Gender picker
  const genderPicker = document.getElementById('gender-picker');
  ['male', 'female'].forEach((g, i) => {
    const o = document.createElement('div');
    o.className = 'option' + (i === 0 ? ' selected' : '');
    o.textContent = g === 'male' ? '♂ Male' : '♀ Female';
    o.onclick = () => {
      genderPicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      state.customization.gender = g;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    genderPicker.appendChild(o);
  });

  // Class picker
  const classPicker = document.getElementById('class-picker');
  function showClassInfo(cls) {
    const info = CLASS_INFO[cls];
    const stats = CLASS_STATS[cls];
    if (!info) return;
    document.getElementById('class-info').style.display = 'flex';
    document.getElementById('class-info-icon').textContent = info.icon;
    document.getElementById('class-info-title').textContent = info.title;
    document.getElementById('class-info-role').textContent = info.role;
    document.getElementById('class-info-desc').textContent = info.desc;
    const statsEl = document.getElementById('class-info-stats');
    statsEl.innerHTML = [
      `<span class="stat-badge">HP <span class="stat-val">${stats.hp}</span></span>`,
      `<span class="stat-badge">MP <span class="stat-val">${stats.mp}</span></span>`,
      `<span class="stat-badge">ATK <span class="stat-val">${stats.atk}</span></span>`,
      `<span class="stat-badge">DEF <span class="stat-val">${stats.def}</span></span>`,
      `<span class="stat-badge">SPD <span class="stat-val">${stats.spd}</span></span>`,
      `<span class="stat-badge">CRIT <span class="stat-val">${(stats.crit*100).toFixed(0)}%</span></span>`,
    ].join('');
    document.getElementById('class-badge').textContent = `${info.icon} ${info.title}`;
  }
  ['laborer', 'miner', 'gardener', 'herbalist', 'watchman'].forEach((cls, i) => {
    const o = document.createElement('div');
    o.className = 'option' + (i === 0 ? ' selected' : '');
    o.textContent = `${CLASS_INFO[cls]?.icon || ''} ${cls}`;
    o.onclick = () => {
      classPicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      state.customization.classType = cls;
      showClassInfo(cls);
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    classPicker.appendChild(o);
  });
  // Show default class info
  if (state.customization.classType) showClassInfo(state.customization.classType);
  else showClassInfo('laborer');

  // Restore selected state from saved customization
  restoreCustomizationUI();

  // Restore saved name
  const savedName = localStorage.getItem('zenithia_name');
  if (savedName) {
    const nameInput = document.getElementById('name-input');
    if (nameInput) nameInput.value = savedName;
  }

  // Save to localStorage helper
  window._saveCustomization = () => {
    localStorage.setItem('zenithia_customization', JSON.stringify(state.customization));
  };

  // Skin picker
  const skinPicker = document.getElementById('skin-picker');
  PALETTES.skin.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.skinIdx = i;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    skinPicker.appendChild(s);
  });

  // Hair color picker
  const hairPicker = document.getElementById('hair-color-picker');
  PALETTES.hair.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.hairColorIdx = i;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    hairPicker.appendChild(s);
  });

  // Hair style picker
  const stylePicker = document.getElementById('hair-style-picker');
  ['undercut', 'pompadour', 'curtains', 'quiff', 'messy', 'hime', 'updo', 'layered', 'sidesweep', 'drills'].forEach(style => {
    const o = document.createElement('div');
    o.className = 'option' + (style === 'undercut' ? ' selected' : '');
    o.textContent = style;
    o.onclick = () => {
      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      state.customization.hairStyle = style;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    stylePicker.appendChild(o);
  });

  // Top color picker
  const topPicker = document.getElementById('top-picker');
  PALETTES.body.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      topPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.topColorIdx = i;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    topPicker.appendChild(s);
  });

  // Bottom color picker
  const bottomPicker = document.getElementById('bottom-picker');
  PANTS_COLORS.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      bottomPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.bottomColorIdx = i;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    bottomPicker.appendChild(s);
  });

  // Eye color picker
  const eyePicker = document.getElementById('eye-picker');
  PALETTES.eyes.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      eyePicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.eyeColorIdx = i;
      updatePreviewModel();
      if(window._saveCustomization)window._saveCustomization();
    };
    eyePicker.appendChild(s);
  });
}

// Safe WS send — no-op if no connection
function wsSend(data) {
  if (state.ws && state.ws.readyState === 1) {
    state.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
  }
}

// ============================
// WEBSOCKET
// ============================
function connectWebSocket(playerName, wallet) {
  // Determine WS server URL
  let wsHost;
  const host = location.host;
  if (host.includes('vercel.app')) {
    // On Vercel → connect to Railway WS server
    wsHost = 'zenithia-production.up.railway.app';
  } else {
    // On localhost or Railway → same host
    wsHost = host;
  }
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

  console.log(`[WS] Connecting to ${protocol}//${wsHost}`);
  // Try WebSocket — if fails, run in single-player mode
  try {
    state.ws = new WebSocket(`${protocol}//${wsHost}`);
  } catch (e) {
    console.log('[WS] Connection failed, single-player mode');
    enterSinglePlayer(playerName, wallet);
    return;
  }

  state.ws.onopen = () => {
    console.log('[WS] Connected');
    state.connected = true;
  };
  state.ws.onmessage = (event) => {
    try {
      handleServerMessage(JSON.parse(event.data));
    } catch (e) {
      console.error('[WS ERROR]', e, 'data:', event.data?.substring?.(0, 200));
    }
  };
  state.ws.onclose = () => {
    console.log('[WS] Disconnected — single-player mode');
    state.connected = false;
    if (!state.player) enterSinglePlayer(playerName, wallet);
  };
  state.ws.onerror = () => {
    console.log('[WS] Error — single-player mode');
    state.connected = false;
    if (!state.player) enterSinglePlayer(playerName, wallet);
  };

  // Timeout — if WS doesn't connect in 3s, go single-player
  setTimeout(() => {
    if (!state.connected && !state.player) {
      console.log('[WS] Timeout — single-player mode');
      state.ws.close();
      enterSinglePlayer(playerName, wallet);
    }
  }, 3000);
}

function enterSinglePlayer(playerName, wallet) {
  state.connected = true; // allow gameplay
  const cls = state.customization.classType || 'laborer';
  const stats = CLASS_STATS[cls] || CLASS_STATS.laborer;
  state.player = {
    id: 'sp_' + Date.now(),
    name: playerName || 'Adventurer',
    wallet: wallet,
    hp: stats.hp, maxHp: stats.hp,
    mp: stats.mp, maxMp: stats.mp,
    level: 1, xp: 0,
    class: cls,
    atk: stats.atk, def: stats.def, spd: stats.spd, crit: stats.crit,
    x: 0, z: 0,
    inventory: [],
    equipment: {},
    zen: 0,
    customization: state.customization,
    unlockedSkills: ['tier1'],
  };
  state.playerId = state.player.id;

  // Show game
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';

  // Spawn player in world
  spawnPlayer(state.player);
  updatePlayerHP(state.player.hp, state.player.maxHp);
  updatePlayerMP(state.player.mp, state.player.maxMp);
  updatePlayerXP(state.player.xp, 100);
  updatePlayerLevel(state.player.level);

  // Add mode indicator
  const badge = document.createElement('div');
  badge.textContent = '⚡ SINGLE-PLAYER';
  badge.style.cssText = 'position:fixed;top:50px;left:50%;transform:translateX(-50%);background:rgba(255,152,0,0.8);color:#fff;padding:4px 12px;border-radius:12px;font-size:0.7rem;z-index:100;';
  document.body.appendChild(badge);

  console.log('[GAME] Single-player mode started');
}

// ============================
// SERVER MESSAGES
// ============================
function handleServerMessage(msg) {
  switch (msg.type) {
    case 'welcome':
      state.playerId = msg.playerId;
      console.log('[WS] Welcome! version:', msg.version, 'playerId:', msg.playerId);
      if (msg.dayTime !== undefined) state.dayTime = msg.dayTime;
      wsSend(JSON.stringify({
        type: 'join',
        persistentId: state.persistentId,
        name: (document.getElementById('name-input')?.value) || 'Adventurer',
        wallet: state.walletAddress || null,
        customization: state.customization,
      }));
      break;

    case 'joined':
      state.player = msg.player;
      state.dialogue.ws = state.ws;
      state.dialogue.playerState = state.player;
      state.shopUI.ws = state.ws;
      state.inventoryUI.ws = state.ws;
      state.questUI.ws = state.ws;

      // Reload from server — server data is the truth, full replace
      if (msg.player.customization && Object.keys(msg.player.customization).length > 0) {
        state.customization = { ...msg.player.customization };
      }
      // Sync localStorage to server data
      try { localStorage.setItem('zenithia_customization', JSON.stringify(state.customization)); } catch(e) {}
      if (msg.player.name) {
        try { localStorage.setItem('zenithia_name', msg.player.name); } catch(e) {}
        const nameInput = document.getElementById('name-input');
        if (nameInput) nameInput.value = msg.player.name;
      }

      if (msg.npcs) {
        state._npcRots = {}; // store default rotations
        console.log('[NPC] Received', Object.keys(msg.npcs).length, 'NPCs:', Object.keys(msg.npcs));
        Object.values(msg.npcs).forEach(npc => {
          try {
            const model = createNPCModel(npc);
            state.scene.add(model);
            state.npcs[npc.id] = model;
            state._npcRots[npc.id] = npc.rot || 0;
            console.log('[NPC] Added', npc.id, 'at', npc.x, npc.z);
          } catch(e) {
            console.error('[NPC] Failed to create', npc.id, e);
            // Fallback: simple colored cylinder
            const g = new THREE.Group();
            const body = new THREE.Mesh(
              new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8),
              new THREE.MeshLambertMaterial({ color: 0xFFD700 })
            );
            body.position.y = 0.75;
            g.add(body);
            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.35, 8, 8),
              new THREE.MeshLambertMaterial({ color: 0xFFCC00 })
            );
            head.position.y = 1.8;
            g.add(head);
            // Name label
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name, 128, 40);
            const tex = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
            sprite.scale.set(3, 0.8, 1);
            sprite.position.y = 2.5;
            g.add(sprite);
            g.position.set(npc.x, 0, npc.z);
            g.userData = { id: npc.id, name: npc.name, type: 'npc' };
            state.scene.add(g);
            state.npcs[npc.id] = g;
            console.log('[NPC] Fallback added', npc.id);
          }
        });
      }
      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
      // Spawn existing monsters
      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
      showHUD();
      createPlayerModelInWorld(state.player);

      // Always update HUD from server data
      const hudName = document.getElementById('hud-name');
      const hudLevel = document.getElementById('hud-level');
      if (hudName) hudName.textContent = state.player.name;
      if (hudLevel) hudLevel.textContent = 'Lv.' + state.player.level;
      updatePlayerHP(state.player.hp, state.player.maxHp);
      updatePlayerMP(state.player.mp, state.player.maxMp);
      // Sync XP bar
      const xpNeeded = 100 + (state.player.level - 1) * 200;
      updatePlayerXP(state.player.xp || 0, xpNeeded);
      // Sync skill points
      state.player.skillPoints = msg.player.skillPoints || 0;
      updateSkillPointsUI();
      // Sync unlocked skills from server
      if (msg.player.unlockedSkills) {
        state.unlockedSkills = msg.player.unlockedSkills;
      }
      initSkillUI();
      // Sync inventory/equipment UI from server data
      state.inventoryUI.updatePlayer(state.player);
      break;

    case 'player_joined':
      createOtherPlayer(msg.player);
      break;

    case 'player_moved':
      if (state.players[msg.playerId]) {
        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
      }
      break;

    case 'player_left':
      if (state.players[msg.playerId]) {
        state.scene.remove(state.players[msg.playerId]);
        delete state.players[msg.playerId];
      }
      break;

    case 'chat':
      addChatMessage(msg.name, msg.message);
      // Show bubble above speaking player
      if (msg.playerId && state.players[msg.playerId]) {
        showChatBubble(state.players[msg.playerId], msg.message);
      }
      break;

    case 'time_sync': {
      // Smooth interpolation toward server time (no jump)
      if (msg.dayTime !== undefined) {
        const serverTime = msg.dayTime;
        const localTime = state.dayTime;
        // Handle wraparound (e.g. 0.99 → 0.01 = small diff, not 0.98)
        let diff = serverTime - localTime;
        if (diff > 0.5) diff -= 1.0;
        if (diff < -0.5) diff += 1.0;
        // Lerp 20% toward server value (smooth correction over ~5 syncs)
        state.dayTime = (localTime + diff * 0.2 + 1.0) % 1.0;
      }
      break;
    }

    case 'npc_dialogue':
      state.dialogue.open(msg.npcId, msg.name, msg.title);
      // NPC faces player when talking
      { const npcModel = state.npcs[msg.npcId];
        const playerModel = state.players[state.playerId];
        if (npcModel && playerModel) {
          const dir = playerModel.position.clone().sub(npcModel.position);
          npcModel.rotation.y = Math.atan2(dir.x, dir.z);
        } }
      break;
      // Don't auto-open shop — let dialogue add Buy/Sell button for merchants
      break;

    case 'monster_killed': {
      // Server confirmed kill — update loot, XP, etc.
      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
      addChatMessage('System', `Defeated! +${msg.xp} XP | Loot: ${lootText}`);
      if (msg.hp !== undefined) updatePlayerHP(msg.hp, msg.maxHp);
      if (msg.mp !== undefined) updatePlayerMP(msg.mp, msg.maxMp);
      if (msg.xp !== undefined) state.player.xp = (state.player.xp || 0) + msg.xp;
      // Update XP bar
      const xpNeeded = 100 + ((state.player.level || 1) - 1) * 200;
      updatePlayerXP(state.player.xp || 0, xpNeeded);
      if (msg.leveledUp) {
        state.player.level = msg.level;
        state.player.maxHp = msg.maxHp;
        state.player.maxMp = msg.maxMp;
        state.player.hp = msg.hp;
        state.player.mp = msg.mp;
        state.player.skillPoints = (state.player.skillPoints || 0) + 1;
        updatePlayerLevel(msg.level);
        updatePlayerHP(msg.hp, msg.maxHp);
        updatePlayerMP(msg.mp, msg.maxMp);
        const newXpNeeded = 100 + (msg.level - 1) * 200;
        updatePlayerXP(state.player.xp || 0, newXpNeeded);
        updateSkillPointsUI();
        showLevelUpEffect();
        addChatMessage('System', `🎉 Level Up! Now Lv.${msg.level} (+1 SP)`);
      }
      if (msg.loot?.length > 0) showLootPopup(msg.loot);
      break;
    }

    case 'item_used': {
      state.player.hp = msg.hp;
      state.player.mp = msg.mp;
      state.player.inventory = msg.inventory;
      state.inventoryUI.updatePlayer(state.player);
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      break;
    }

    case 'item_equipped':
    case 'item_unequipped': {
      state.player.equipment = msg.equipment;
      state.player.inventory = msg.inventory;
      state.player.atk = msg.atk;
      state.player.def = msg.def;
      if (msg.spd !== undefined) state.player.spd = msg.spd;
      if (msg.crit !== undefined) state.player.crit = msg.crit;
      state.inventoryUI.updatePlayer(state.player);
      break;
    }

    case 'party_update': {
      state.partyUI.updateParty(msg.party);
      break;
    }
    case 'party_invite': {
      if (confirm(`${msg.from} invites you to a party. Accept?`)) {
      wsSend(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
      }
      break;
    }
    case 'online_list': {
      state.partyUI.updateOnline(msg.players);
      break;
    }

    case 'monster_spawn':
      spawnMonsterClient(msg.monster);
      break;

    case 'monster_move': {
      const mmob = state.monsters[msg.monsterId];
      if (mmob) {
        mmob.position.set(msg.x, 0, msg.z);
        // Monster faces the player when chasing
        const myModel = state.players[state.playerId];
        if (myModel) {
          const dir = myModel.position.clone().sub(mmob.position).normalize();
          mmob.lookAt(mmob.position.clone().add(dir));
        }
      }
      break;
    }

    case 'monster_hit': {
      const mob = state.monsters[msg.monsterId];
      if (mob) {
        updateMonsterHPBar(mob, msg.hp, msg.maxHp);
        mob.userData.hp = msg.hp;
        mob.userData.maxHp = msg.maxHp;
        // Monster flinch — brief scale punch
        const origScale = mob.scale.x;
        mob.scale.set(0.85, 1.1, 0.85);
        setTimeout(() => mob.scale.set(1.05, 0.95, 1.05), 80);
        setTimeout(() => mob.scale.set(origScale, origScale, origScale), 160);
      }
      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
      break;
    }

    case 'monster_died': {
      const mob = state.monsters[msg.monsterId];
      if (mob) {
        delete state.monsters[msg.monsterId];
        // Death animation — fade + shrink over 0.5s, then remove
        animateMonsterDeath(mob);
      }
      if (state.targetedMonster === msg.monsterId) cancelTarget();
      break;
    }

    case 'monster_attack': {
      // Monster attack lunge animation
      const attackerMob = state.monsters[msg.monsterId];
      if (attackerMob) monsterAttackAnim(attackerMob);
      if (msg.targetId === state.playerId) {
        state.player.hp = Math.max(0, (state.player.hp || 0) - msg.damage);
        updatePlayerHP(state.player.hp, state.player.maxHp);
        showDamageNumber(null, msg.damage, false, state.playerId);
        // Hit reaction — flinch + red flash
        const myModel = state.players[state.playerId];
        if (myModel) hitReaction(myModel);
        // Screen shake (Cahaya v2 pattern)
        document.body.style.transform = `translate(${Math.random()*6-3}px, ${Math.random()*6-3}px)`;
        setTimeout(() => document.body.style.transform = '', 100);
      }
      break;
    }

    case 'player_hit': {
      // Only apply damage if this message is for us
      if (msg.targetId && msg.targetId !== state.playerId) break;
      console.log('[COMBAT] player_hit received! damage:', msg.damage, 'hp:', msg.hp, '/', msg.maxHp);
      updatePlayerHP(msg.hp, msg.maxHp);
      state.player.hp = msg.hp;
      state.player.maxHp = msg.maxHp;
      const selfModel = state.players[state.playerId];
      if (selfModel) {
        showDamageNumber(null, msg.damage, false, state.playerId);
      }
      break;
    }

    case 'player_died': {
      if (msg.targetId && msg.targetId !== state.playerId) break;
      state.isDead = true;
      cancelTarget();
      addChatMessage('System', 'You died! Respawning in 5 seconds...');
      const deathEl = document.getElementById('death-screen');
      if (deathEl) deathEl.style.display = 'flex';
      break;
    }

    case 'xp_penalty': {
      state.player.xp = msg.xp;
      addChatMessage('System', `💀 XP penalty: -${msg.xpLoss} XP`);
      const xpNeeded = 100 + ((state.player.level || 1) - 1) * 200;
      updatePlayerXP(state.player.xp, xpNeeded);
      break;
    }

    case 'skill_unlocked': {
      state.player.skillPoints = msg.skillPoints;
      state.unlockedSkills = msg.unlockedSkills;
      updateSkillPointsUI();
      addChatMessage('System', `✨ Skill unlocked: ${msg.tier}!`);
      break;
    }

    case 'skill_error': {
      addChatMessage('System', `❌ ${msg.error}`);
      break;
    }

    case 'player_respawn': {
      if (msg.targetId && msg.targetId !== state.playerId) break;
      state.isDead = false;
      state.player.hp = msg.hp;
      state.player.maxHp = msg.maxHp;
      state.player.mp = msg.mp;
      state.player.maxMp = msg.maxMp;
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      // Move player back to spawn
      const model = state.players[state.playerId];
      if (model) model.position.set(msg.x || 0, 0, msg.z || 0);
      wsSend(JSON.stringify({ type: 'move', x: msg.x || 0, y: 0, z: msg.z || 0 }));
      const deathEl = document.getElementById('death-screen');
      if (deathEl) deathEl.style.display = 'none';
      addChatMessage('System', '🏠 Respawned at village!');
      break;
    }

    case 'level_up': {
      state.player.level = msg.level;
      state.player.maxHp = msg.maxHp;
      state.player.maxMp = msg.maxMp;
      if (msg.unlockedSkills) state.unlockedSkills = msg.unlockedSkills;
      showLevelUpEffect();
      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
      updatePlayerLevel(msg.level);
      updatePlayerHP(state.player.maxHp, state.player.maxHp);
      updatePlayerMP(state.player.maxMp, state.player.maxMp);
      break;
    }

    case 'quest_started': {
      state.questUI.startQuest(msg.quest);
      addChatMessage('Quest', `Started: ${msg.quest.name}`);
      break;
    }
    case 'quest_completed': {
      state.questUI.completeQuest(msg.questId);
      addChatMessage('Quest', `✅ Completed: ${msg.questName}! +${msg.xp} XP`);
      if (msg.items) {
        msg.items.forEach(l => {
          if (!state.player.inventory) state.player.inventory = [];
          const existing = state.player.inventory.find(i => i.id === l.id);
          if (existing) existing.quantity = (existing.quantity || 1) + (l.quantity || 1);
          else state.player.inventory.push({ ...l });
        });
        state.inventoryUI.updatePlayer(state.player);
      }
      state.player.hp = msg.hp;
      state.player.maxHp = msg.maxHp;
      state.player.mp = msg.mp;
      state.player.maxMp = msg.maxMp;
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      break;
    }
    case 'quest_progress': {
      state.questUI.updateObjective(msg.questId, msg.objectiveId, 1);
      break;
    }
    case 'combat_message': {
      addChatMessage('Combat', msg.text);
      break;
    }
    case 'respawned': {
      state.player.x = msg.x;
      state.player.z = msg.z;
      state.player.hp = msg.hp;
      state.player.maxHp = msg.maxHp;
      state.player.mp = msg.mp;
      state.player.maxMp = msg.maxMp;
      const model = state.players[state.playerId];
      if (model) model.position.set(msg.x, 0, msg.z);
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      addChatMessage('System', '🏠 Respawned at village!');
      break;
    }
    case 'skill_used': {
      state.player.mp = msg.mp;
      updatePlayerMP(msg.mp, state.player.maxMp);
      if (msg.heal) {
        state.player.hp = msg.hp;
        updatePlayerHP(msg.hp, state.player.maxHp);
        addChatMessage('Skill', `💚 ${msg.skillName || 'Heal'} — Healed ${msg.heal} HP!`);
      } else if (msg.buff) {
        addChatMessage('Skill', `⚡ ${msg.skillName || 'Buff'} — ${msg.buff.stat.toUpperCase()} buff active!`);
      } else {
        addChatMessage('Skill', `⚔️ ${msg.skillName || 'Skill'} used!`);
      }
      break;
    }
    case 'inventory_update': {
      state.player.inventory = msg.inventory;
      state.inventoryUI.updatePlayer(state.player);
      break;
    }
    case 'shop_catalog':
    case 'shop_result':
    case 'shop_error': {
      if (state.shopUI) {
        state.shopUI.playerState = state.player;
        state.shopUI.handleMsg(msg);
      }
      break;
    }
  }
}

// ============================
// PLAYER MODELS
// ============================
function spawnPlayer(player) {
  createPlayerModelInWorld(player);
}

function createPlayerModelInWorld(player) {
  const c = state.customization;
  const model = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx],
    hairColor: PALETTES.hair[c.hairColorIdx],
    hairStyle: c.hairStyle,
    bodyColor: PALETTES.body[c.topColorIdx],
    pantsColor: PANTS_COLORS[c.bottomColorIdx],
    eyeColor: PALETTES.eyes[c.eyeColorIdx],
    trimColor: CLASS_TRIM[c.classType] || 0xFFFFFF,
    gender: c.gender,
    classType: c.classType,
  });
  model.position.set(player.x, player.y, player.z);
  model.userData = { id: player.id, name: player.name, type: 'player' };
  addNameHPBarToModel(model, player.name, player.hp ?? 100, player.maxHp ?? 100, player.mp ?? 50, player.maxMp ?? 50);
  state.scene.add(model);
  state.players[player.id] = model;
  state.playerModel = model;
}

function createOtherPlayer(player) {
  const c = player.customization || {};
  const model = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx || 0],
    hairColor: PALETTES.hair[c.hairColorIdx || 0],
    hairStyle: c.hairStyle || 'undercut',
    bodyColor: PALETTES.body[c.topColorIdx || 0],
    pantsColor: PANTS_COLORS[c.bottomColorIdx || 0],
    eyeColor: PALETTES.eyes[c.eyeColorIdx || 0],
    trimColor: CLASS_TRIM[c.classType] || 0xFFFFFF,
    gender: c.gender || 'male',
    classType: c.classType || 'laborer',
  });
  model.position.set(player.x, player.y, player.z);
  model.userData = { id: player.id, name: player.name, type: 'player' };
  addNameHPBarToModel(model, player.name, player.hp ?? 100, player.maxHp ?? 100, player.mp ?? 50, player.maxMp ?? 50);
  state.scene.add(model);
  state.players[player.id] = model;
}
function createNameHPBar(name, hp, maxHp, mp, maxMp) {
  // === NAME sprite (above head) ===
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 256; nameCanvas.height = 64;
  const nameTex = new THREE.CanvasTexture(nameCanvas);
  nameTex.minFilter = THREE.LinearFilter;
  const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex, transparent: true, depthWrite: false }));
  nameSprite.scale.set(3, 0.8, 1);
  nameSprite.position.y = 2.5;

  // === HP/MP sprite (below feet) ===
  const barCanvas = document.createElement('canvas');
  barCanvas.width = 256; barCanvas.height = 64;
  const barTex = new THREE.CanvasTexture(barCanvas);
  barTex.minFilter = THREE.LinearFilter;
  const barSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: barTex, transparent: true, depthWrite: false, depthTest: false }));
  barSprite.scale.set(3, 0.8, 1);
  barSprite.position.y = -0.6;
  barSprite.renderOrder = 999;

  function render() {
    // Name
    const nc = nameCanvas.getContext('2d');
    nc.clearRect(0, 0, 256, 64);
    nc.fillStyle = '#FFFFFF';
    nc.font = 'bold 24px Arial';
    nc.textAlign = 'center';
    nc.strokeStyle = '#000000';
    nc.lineWidth = 4;
    nc.strokeText(name, 128, 40);
    nc.fillText(name, 128, 40);
    nameTex.needsUpdate = true;

    // Bars
    const ctx = barCanvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);
    // HP bar
    const hpPct = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(48, 8, 160, 16);
    ctx.fillStyle = hpPct > 0.3 ? '#4CAF50' : hpPct > 0.15 ? '#FF9800' : '#F44336';
    ctx.fillRect(50, 9, 156 * hpPct, 14);
    ctx.fillStyle = '#FFF'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
    ctx.fillText('HP ' + Math.round(hp) + '/' + maxHp, 128, 20);
    // MP bar
    const mpPct = maxMp > 0 ? Math.max(0, Math.min(1, mp / maxMp)) : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(48, 30, 160, 14);
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(50, 31, 156 * mpPct, 12);
    ctx.fillStyle = '#FFF'; ctx.font = '10px Arial';
    ctx.fillText('MP ' + Math.round(mp) + '/' + maxMp, 128, 42);
    barTex.needsUpdate = true;
  }
  render();

  // Pack both sprites into a group-like object
  const group = new THREE.Group();
  group.add(nameSprite);
  group.add(barSprite);
  group.userData.canvas = { name: nameCanvas, bar: barCanvas };
  group.userData.texture = { name: nameTex, bar: barTex };
  group.userData.renderNameHPBar = function(n, h, mH, mp2, mMp) {
    name = n; hp = h; maxHp = mH; mp = mp2; maxMp = mMp;
    render();
  };
  return group;
}

function addNameHPBarToModel(model, name, hp, maxHp, mp, maxMp) {
  const group = createNameHPBar(name, hp, maxHp, mp, maxMp);
  model.add(group);
  model.userData.nameHPBar = group;
}

function updateNameHPBar(model, hp, maxHp, mp, maxMp) {
  if (model?.userData?.nameHPBar?.userData?.renderNameHPBar) {
    model.userData.nameHPBar.userData.renderNameHPBar(model.userData.name, hp, maxHp, mp, maxMp);
  }
}

// ============================
// CHAT BUBBLE (above character)
// ============================
function showChatBubble(model, message) {
  // Remove existing bubble
  if (model.userData.chatBubble) {
    model.remove(model.userData.chatBubble);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // Bubble background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  const radius = 16;
  const w = Math.min(ctx.measureText(message).width + 40, 480);
  const bx = (512 - w) / 2;
  ctx.beginPath();
  ctx.roundRect(bx, 10, w, 50, radius);
  ctx.fill();
  // Triangle pointer
  ctx.beginPath();
  ctx.moveTo(256 - 8, 60); ctx.lineTo(256, 72); ctx.lineTo(256 + 8, 60);
  ctx.fill();
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(message.length > 40 ? message.slice(0, 37) + '...' : message, 256, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(5, 1.2, 1);
  sprite.position.y = 4.0;
  model.add(sprite);
  model.userData.chatBubble = sprite;
  // Fade out after 5 seconds
  setTimeout(() => {
    if (model.userData.chatBubble === sprite) {
      model.remove(sprite);
      model.userData.chatBubble = null;
    }
  }, 5000);
}

// ============================
// HUD
// ============================
function showHUD() {
  loadingScreen.style.display = 'none';
  loginScreen.style.display = 'none';
  hud.style.display = 'block';
  // Show map name overlay
  showMapName('Willowmere Village', 'A peaceful village in the heart of Zenithia');
}

// Map name overlay
function showMapName(name, subtitle) {
  const overlay = document.getElementById('map-name-overlay');
  const textEl = document.getElementById('map-name-text');
  const subEl = document.getElementById('map-name-sub');
  if (!overlay || !textEl) return;
  textEl.textContent = name;
  if (subEl) subEl.textContent = subtitle || '';
  overlay.style.display = 'block';
  // Trigger fade in
  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });
  // Fade out after 3 seconds
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
  }, 3000);
}

// ============================
// CHAT
// ============================
function addChatMessage(name, message) {
  const el = document.getElementById('chat-messages');
  const div = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = name + ':';
  div.appendChild(strong);
  div.appendChild(document.createTextNode(' ' + message));
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
// ============================
// COMBAT HELPERS
// ============================
const MONSTER_DATA = {
  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, accentColor: 0x81C784, size: 0.6 },
  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, accentColor: 0xD7CCC8, size: 0.35 },
  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, accentColor: 0x8BC34A, size: 0.7 },
  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, accentColor: 0x4DD0E1, size: 0.55 },
  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, accentColor: 0xB3E5FC, size: 0.4 },
  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, accentColor: 0xBDBDBD, size: 0.45 },
  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, accentColor: 0x8D6E63, size: 1.2 },
};

function spawnMonsterClient(m) {
  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
  model.position.set(m.x, 0, m.z);
  // Preserve hpBar reference from createMonsterModel, add our fields
  const hpBarRef = model.userData.hpBar;
  const hpBarWidthRef = model.userData.hpBarWidth;
  Object.assign(model.userData, { id: m.id, type: 'monster', monsterType: m.type, hp: m.hp, maxHp: m.maxHp, monsterName: m.name });
  model.userData.hpBar = hpBarRef;
  model.userData.hpBarWidth = hpBarWidthRef;
  state.scene.add(model);
  state.monsters[m.id] = model;
}

// ============================
// SKILL DEFINITIONS (1 per class + skill tree)
// ============================
const SKILLS = {
  laborer: {
    name: 'Power Smash',
    icon: '🔨',
    mpCost: 15,
    cooldown: 8000,
    damageMulti: 2.5,
    range: 3.5,
    desc: 'Devastating blow dealing 2.5x ATK damage',
  },
  miner: {
    name: 'Avalanche',
    icon: '⛏️',
    mpCost: 20,
    cooldown: 10000,
    damageMulti: 3.0,
    range: 4,
    desc: 'Rock slam dealing 3x ATK damage',
  },
  gardener: {
    name: 'Thorn Whip',
    icon: '🌿',
    mpCost: 12,
    cooldown: 6000,
    damageMulti: 2.0,
    range: 4.5,
    desc: 'Ranged vine attack dealing 2x ATK',
  },
  herbalist: {
    name: 'Heal',
    icon: '💚',
    mpCost: 25,
    cooldown: 12000,
    damageMulti: 0,
    healMulti: 0.4,
    range: 0,
    desc: 'Restore 40% max HP',
  },
  watchman: {
    name: 'Shield Bash',
    icon: '🛡️',
    mpCost: 18,
    cooldown: 9000,
    damageMulti: 2.0,
    defBreak: 0.5,
    range: 3,
    desc: 'Bash dealing 2x ATK, reduces monster DEF',
  },
};

// Full skill tree (3 skills per class)
const SKILL_TREES = {
  laborer: {
    className: 'Guardian',
    color: '#8D6E63',
    tier1:  { id: 'tier1', name: 'Power Smash', icon: '🔨', mpCost: 15, cooldown: 8000, damageMulti: 2.5, range: 3.5, desc: 'Devastating blow dealing 2.5x ATK damage', reqLevel: 1 },
    tier2a: { id: 'tier2a', name: 'Earthquake', icon: '🌋', mpCost: 25, cooldown: 12000, damageMulti: 3.5, range: 4, desc: 'AoE shockwave dealing 3.5x ATK damage', reqLevel: 5 },
    tier2b: { id: 'tier2b', name: 'Iron Wall', icon: '🧱', mpCost: 20, cooldown: 15000, damageMulti: 0, healMulti: 0, range: 0, desc: 'DEF buff +50% for 10 seconds', reqLevel: 3, buff: { stat: 'def', value: 0.5, duration: 10 } },
  },
  miner: {
    className: 'Blade Dancer',
    color: '#78909C',
    tier1:  { id: 'tier1', name: 'Avalanche', icon: '⛏️', mpCost: 20, cooldown: 10000, damageMulti: 3.0, range: 4, desc: 'Rock slam dealing 3x ATK damage', reqLevel: 1 },
    tier2a: { id: 'tier2a', name: 'Blade Storm', icon: '🌀', mpCost: 30, cooldown: 14000, damageMulti: 4.0, range: 4.5, desc: 'Multi-hit storm dealing 4x ATK damage', reqLevel: 5 },
    tier2b: { id: 'tier2b', name: 'Shadow Step', icon: '👤', mpCost: 15, cooldown: 12000, damageMulti: 0, healMulti: 0, range: 0, desc: 'Dodge + speed buff for 8 seconds', reqLevel: 3, buff: { stat: 'spd', value: 0.5, duration: 8 } },
  },
  gardener: {
    className: 'Ranger',
    color: '#66BB6A',
    tier1:  { id: 'tier1', name: 'Thorn Whip', icon: '🌿', mpCost: 12, cooldown: 6000, damageMulti: 2.0, range: 5, desc: 'Ranged vine attack dealing 2x ATK', reqLevel: 1 },
    tier2a: { id: 'tier2a', name: "Nature's Wrath", icon: '🌸', mpCost: 20, cooldown: 10000, damageMulti: 3.0, range: 5, desc: 'Powerful vine strike dealing 3x ATK + slow', reqLevel: 5 },
    tier2b: { id: 'tier2b', name: 'Healing Bloom', icon: '🌺', mpCost: 18, cooldown: 10000, damageMulti: 0, healMulti: 0.4, range: 0, desc: 'Heal 40% max HP', reqLevel: 3 },
  },
  herbalist: {
    className: 'Sage',
    color: '#AB47BC',
    tier1:  { id: 'tier1', name: 'Mystic Heal', icon: '✨', mpCost: 25, cooldown: 12000, damageMulti: 0, healMulti: 0.4, range: 4, desc: 'Restore 40% max HP', reqLevel: 1 },
    tier2a: { id: 'tier2a', name: 'Rejuvenation', icon: '🌟', mpCost: 35, cooldown: 18000, damageMulti: 0, healMulti: 0.7, range: 0, desc: 'Restore 70% max HP', reqLevel: 5 },
    tier2b: { id: 'tier2b', name: 'Mana Surge', icon: '🔮', mpCost: 20, cooldown: 15000, damageMulti: 0, healMulti: 0, range: 0, desc: 'Restore 50% MP + ATK buff', reqLevel: 3, buff: { stat: 'atk', value: 0.3, duration: 12 } },
  },
  watchman: {
    className: 'Sentinel',
    color: '#455A64',
    tier1:  { id: 'tier1', name: 'Eagle Eye', icon: '👁️', mpCost: 15, cooldown: 7000, damageMulti: 2.5, range: 4.5, desc: 'Precise shot dealing 2.5x ATK', reqLevel: 1 },
    tier2a: { id: 'tier2a', name: 'Piercing Shot', icon: '🎯', mpCost: 25, cooldown: 12000, damageMulti: 4.0, range: 5, desc: 'Piercing arrow dealing 4x ATK, ignores DEF', reqLevel: 5, ignoreDef: true },
    tier2b: { id: 'tier2b', name: "Sentinel's Mark", icon: '🔮', mpCost: 18, cooldown: 10000, damageMulti: 0, healMulti: 0, range: 0, desc: 'Mark enemy +50% damage taken for 10s', reqLevel: 3, buff: { stat: 'dmgTaken', value: 0.5, duration: 10 } },
  },
};

function showDamageNumber(monsterId, damage, isCrit, targetId) {
  let pos;
  if (monsterId && state.monsters[monsterId]) {
    pos = state.monsters[monsterId].position.clone();
    pos.y += 1.5;
  } else if (targetId && state.players[targetId]) {
    pos = state.players[targetId].position.clone();
    pos.y += 1.5;
  } else {
    return;
  }

  // Create floating text sprite
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.copy(pos);
  sprite.scale.set(0.8, 0.4, 1);
  state.scene.add(sprite);

  // Animate up and fade
  const startTime = Date.now();
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > 1) {
      state.scene.remove(sprite);
      return;
    }
    sprite.position.y += 0.02;
    sprite.material.opacity = 1 - elapsed;
    requestAnimationFrame(animate);
  };
  animate();
}

// Level Up Visual Effect — Chaya Berkah (pillar of light + particles)
function showLevelUpEffect() {
  const playerModel = state.playerModel;
  if (!playerModel) return;
  const pos = playerModel.position.clone();

  // === LIGHT PILLAR ===
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.6, 5, 8, 1, true);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: 0xFFD700, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.set(pos.x, 2.5, pos.z);
  pillar.renderOrder = 1000;
  state.scene.add(pillar);

  // === INNER GLOW ===
  const glowGeo = new THREE.CylinderGeometry(0.15, 0.3, 5, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, transparent: true, opacity: 0.6, depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(pos.x, 2.5, pos.z);
  glow.renderOrder = 1001;
  state.scene.add(glow);

  // === RISING PARTICLES ===
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const size = 0.08 + Math.random() * 0.12;
    const pGeo = new THREE.BoxGeometry(size, size, size);
    const pMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xFFD700 : 0xFFF176,
      transparent: true, opacity: 0.9, depthWrite: false,
    });
    const p = new THREE.Mesh(pGeo, pMat);
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.8;
    p.position.set(
      pos.x + Math.cos(angle) * r,
      Math.random() * 2,
      pos.z + Math.sin(angle) * r
    );
    p.userData.vy = 1.5 + Math.random() * 2;
    p.userData.vx = (Math.random() - 0.5) * 0.5;
    p.userData.vz = (Math.random() - 0.5) * 0.5;
    p.renderOrder = 1002;
    state.scene.add(p);
    particles.push(p);
  }

  // === "LEVEL UP!" floating text ===
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 40px Courier New';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText('LEVEL UP!', 128, 42);
  ctx.fillText('LEVEL UP!', 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const textSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  textSprite.position.set(pos.x, 4, pos.z);
  textSprite.scale.set(3, 0.75, 1);
  textSprite.renderOrder = 1003;
  state.scene.add(textSprite);

  // === Animate ===
  const startTime = Date.now();
  const dur = 2.0; // seconds
  function tick() {
    const t = (Date.now() - startTime) / 1000;
    if (t > dur) {
      state.scene.remove(pillar);
      state.scene.remove(glow);
      state.scene.remove(textSprite);
      particles.forEach(p => state.scene.remove(p));
      pillar.geometry.dispose(); pillar.material.dispose();
      glow.geometry.dispose(); glow.material.dispose();
      tex.dispose(); textSprite.material.dispose();
      return;
    }
    const progress = t / dur;
    // Pillar fade out + pulse
    pillar.material.opacity = 0.4 * (1 - progress);
    pillar.scale.x = 1 + Math.sin(t * 8) * 0.15;
    glow.material.opacity = 0.6 * (1 - progress);
    // Text rises
    textSprite.position.y = 4 + t * 0.8;
    textSprite.material.opacity = 1 - progress;
    // Particles rise + fade
    particles.forEach(p => {
      p.position.y += p.userData.vy * 0.016;
      p.position.x += p.userData.vx * 0.016;
      p.position.z += p.userData.vz * 0.016;
      p.material.opacity = 1 - progress;
      p.rotation.x += 0.05;
      p.rotation.y += 0.08;
    });
    requestAnimationFrame(tick);
  }
  tick();
}

// ============================
// ATTACK IMPACT PARTICLES
// ============================
function spawnAttackImpact(position, color = 0xFF5252) {
  if (!position) return;
  const particles = [];
  for (let i = 0; i < 8; i++) {
    const size = 0.05 + Math.random() * 0.08;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthWrite: false });
    const p = new THREE.Mesh(geo, mat);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    p.position.copy(position);
    p.position.y += 0.5;
    p.userData.vx = Math.cos(angle) * speed;
    p.userData.vy = 1 + Math.random() * 2;
    p.userData.vz = Math.sin(angle) * speed;
    p.renderOrder = 999;
    state.scene.add(p);
    particles.push(p);
  }
  const start = Date.now();
  function tick() {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > 0.5) {
      particles.forEach(p => state.scene.remove(p));
      return;
    }
    particles.forEach(p => {
      p.position.x += p.userData.vx * 0.016;
      p.position.y += p.userData.vy * 0.016;
      p.position.z += p.userData.vz * 0.016;
      p.userData.vy -= 4 * 0.016; // gravity
      p.material.opacity = 1 - elapsed * 2;
      p.rotation.x += 0.1;
      p.rotation.z += 0.15;
    });
    requestAnimationFrame(tick);
  }
  tick();
}

// ============================
// HIT REACTION (flinch when taking damage)
// ============================
let _hitBodyTimer = null;
let _hitBodyTimer2 = null;
function hitReaction(model) {
  if (!model) return;
  const body = model.getObjectByName('body');
  if (body) {
    // Cancel previous hit timers so body doesn't stack rotations
    clearTimeout(_hitBodyTimer);
    clearTimeout(_hitBodyTimer2);
    const orig = body.rotation.x;
    body.rotation.x = 0.2; // lean back
    _hitBodyTimer = setTimeout(() => { body.rotation.x = -0.05; }, 80);
    _hitBodyTimer2 = setTimeout(() => { body.rotation.x = 0; }, 150);
  }
  // Flash effect — brief red tint on body mesh
  // Save original color in userData so rapid hits don't capture red as "original"
  const bodyMesh = model.getObjectByName('body');
  if (bodyMesh && bodyMesh.material) {
    if (bodyMesh.userData.origColor === undefined) {
      bodyMesh.userData.origColor = bodyMesh.material.color.getHex();
    }
    bodyMesh.material.color.setHex(0xFF0000);
    clearTimeout(bodyMesh.userData._flashTimer);
    bodyMesh.userData._flashTimer = setTimeout(() => {
      bodyMesh.material.color.setHex(bodyMesh.userData.origColor);
    }, 100);
  }
}

// ============================
// SKILL VISUAL EFFECTS
// ============================
function spawnSkillEffect(position, classType) {
  if (!position) return;
  const colors = {
    laborer: 0xFF8C00,  // orange smash
    miner: 0x8D6E63,    // brown rock
    gardener: 0x4CAF50,  // green vine
    herbalist: 0x76FF03, // green heal glow
    watchman: 0x42A5F5,  // blue shield
  };
  const color = colors[classType] || 0xFFFFFF;
  const particles = [];
  const count = classType === 'herbalist' ? 15 : 10;
  for (let i = 0; i < count; i++) {
    const size = 0.06 + Math.random() * 0.1;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false });
    const p = new THREE.Mesh(geo, mat);
    if (classType === 'herbalist') {
      // Heal: particles rise upward around player
      const angle = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 0.5;
      p.position.set(position.x + Math.cos(angle) * r, position.y + Math.random() * 0.5, position.z + Math.sin(angle) * r);
      p.userData.vy = 1.5 + Math.random() * 1.5;
      p.userData.vx = 0;
      p.userData.vz = 0;
    } else {
      // Attack: particles burst outward toward monster
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      p.position.copy(position);
      p.position.y += 0.8;
      p.userData.vx = Math.cos(angle) * speed;
      p.userData.vy = 0.5 + Math.random() * 1;
      p.userData.vz = Math.sin(angle) * speed;
    }
    p.renderOrder = 999;
    state.scene.add(p);
    particles.push(p);
  }
  const start = Date.now();
  const dur = classType === 'herbalist' ? 0.8 : 0.4;
  function tick() {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > dur) {
      particles.forEach(p => state.scene.remove(p));
      return;
    }
    particles.forEach(p => {
      p.position.x += p.userData.vx * 0.016;
      p.position.y += p.userData.vy * 0.016;
      p.position.z += p.userData.vz * 0.016;
      if (classType === 'herbalist') p.userData.vy -= 0.5 * 0.016;
      p.material.opacity = 1 - (elapsed / dur);
      p.rotation.x += 0.1;
    });
    requestAnimationFrame(tick);
  }
  tick();
}

// ============================
// MONSTER DEATH ANIMATION (fade + shrink)
// ============================
function animateMonsterDeath(model) {
  if (!model) return;
  const start = Date.now();
  const dur = 0.5;
  // Store original scale
  const origScale = { x: model.scale.x, y: model.scale.y, z: model.scale.z };
  function tick() {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > dur) {
      state.scene.remove(model);
      return;
    }
    const progress = elapsed / dur;
    // Shrink + rise + fade
    model.scale.set(
      origScale.x * (1 - progress),
      origScale.y * (1 - progress),
      origScale.z * (1 - progress)
    );
    model.position.y += 0.02;
    // Fade all meshes
    model.traverse(child => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = 1 - progress;
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
}

function updatePlayerHP(hp, maxHp) {
  const fill = document.getElementById('hp-fill');
  const text = document.getElementById('hp-text');
  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
  // Update 3D name plate
  if (state.player && state.playerModel) {
    state.player.hp = hp; state.player.maxHp = maxHp;
    updateNameHPBar(state.playerModel, hp, maxHp, state.player.mp ?? 0, state.player.maxMp ?? maxHp);
  }
}

function updatePlayerXP(xp, maxXp) {
  const fill = document.getElementById('xp-fill');
  const text = document.getElementById('xp-text');
  if (fill) fill.style.width = `${(xp / maxXp) * 100}%`;
  if (text) text.textContent = `XP ${xp}/${maxXp}`;
}

function updateSkillPointsUI() {
  const sp = document.getElementById('hud-sp');
  const pts = state.player?.skillPoints || 0;
  if (sp) {
    sp.textContent = `✦ SP: ${pts}`;
    sp.style.display = pts > 0 ? 'block' : 'none';
  }
}

function updatePlayerLevel(level) {
  const el = document.getElementById('hud-level');
  if (el) el.textContent = `Lv.${level}`;
}

function updatePlayerMP(mp, maxMp) {
  const fill = document.getElementById('mp-fill');
  const text = document.getElementById('mp-text');
  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
  // Update 3D name plate
  if (state.player && state.playerModel) {
    state.player.mp = mp; state.player.maxMp = maxMp;
    updateNameHPBar(state.playerModel, state.player.hp ?? 0, state.player.maxHp ?? 100, mp, maxMp);
  }
}

// ============================
// A* PATHFINDING
// ============================
function findPath(startX, startZ, endX, endZ) {
  const gridMin = -60, gridMax = 60;
  const size = gridMax - gridMin + 1;
  const key = (x, z) => `${x},${z}`;

  // Build walkable set
  const walkable = new Set();
  for (let x = gridMin; x <= gridMax; x++) {
    for (let z = gridMin; z <= gridMax; z++) {
      if (isWalkable(x, z)) walkable.add(key(x, z));
    }
  }

  const startKey = key(startX, startZ);
  const endKey = key(endX, endZ);

  // If target not walkable, find nearest walkable tile
  if (!walkable.has(endKey)) {
    let bestDist = Infinity, bestKey = null;
    for (const k of walkable) {
      const [bx, bz] = k.split(',').map(Number);
      const d = Math.abs(bx - endX) + Math.abs(bz - endZ);
      if (d < bestDist) { bestDist = d; bestKey = k; }
    }
    if (!bestKey) return null;
    var finalEndX = parseInt(bestKey.split(',')[0]);
    var finalEndZ = parseInt(bestKey.split(',')[1]);
  } else {
    var finalEndX = endX;
    var finalEndZ = endZ;
  }

  // A* with 8-directional movement
  const open = new Map();
  const closed = new Set();
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();

  gScore.set(startKey, 0);
  fScore.set(startKey, Math.abs(startX - finalEndX) + Math.abs(startZ - finalEndZ));
  open.set(startKey, fScore.get(startKey));

  const dirs = [
    [1,0],[-1,0],[0,1],[0,-1],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];

  let iterations = 0;
  while (open.size > 0 && iterations < 2000) {
    iterations++;
    // Find lowest fScore in open
    let currentKey = null, lowestF = Infinity;
    for (const [k, f] of open) {
      if (f < lowestF) { lowestF = f; currentKey = k; }
    }

    const [cx, cz] = currentKey.split(',').map(Number);
    if (cx === finalEndX && cz === finalEndZ) {
      // Reconstruct path
      const path = [];
      let cur = currentKey;
      while (cur) {
        const [px, pz] = cur.split(',').map(Number);
        path.unshift({ x: px, z: pz });
        cur = cameFrom.get(cur);
      }
      return path;
    }

    open.delete(currentKey);
    closed.add(currentKey);

    for (const [dx, dz] of dirs) {
      const nx = cx + dx, nz = cz + dz;
      const nk = key(nx, nz);
      if (closed.has(nk) || !walkable.has(nk)) continue;

      // Diagonal movement: check both adjacent tiles are walkable
      if (dx !== 0 && dz !== 0) {
        if (!walkable.has(key(cx + dx, cz)) || !walkable.has(key(cx, cz + dz))) continue;
      }

      const moveCost = (dx !== 0 && dz !== 0) ? 1.414 : 1;
      const tentG = gScore.get(currentKey) + moveCost;

      if (!gScore.has(nk) || tentG < gScore.get(nk)) {
        cameFrom.set(nk, currentKey);
        gScore.set(nk, tentG);
        fScore.set(nk, tentG + Math.abs(nx - finalEndX) + Math.abs(nz - finalEndZ));
        open.set(nk, fScore.get(nk));
      }
    }
  }
  return null; // no path
}

// ============================
// CLICK INDICATOR
// ============================
let clickIndicator = null;
function showClickIndicator(x, z) {
  if (!clickIndicator) {
    const geo = new THREE.RingGeometry(0.3, 0.6, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    clickIndicator = new THREE.Mesh(geo, mat);
    clickIndicator.rotation.x = -Math.PI / 2;
    clickIndicator.position.y = 0.05;
    state.scene.add(clickIndicator);
  }
  clickIndicator.position.set(x, 0.05, z);
  clickIndicator.material.opacity = 0.8;
  clickIndicator.scale.set(1, 1, 1);
  // Pulse animation
  const startTime = Date.now();
  const pulse = () => {
    const elapsed = (Date.now() - startTime) / 500;
    if (elapsed > 1) { clickIndicator.material.opacity = 0; return; }
    clickIndicator.material.opacity = 0.8 * (1 - elapsed);
    clickIndicator.scale.set(1 + elapsed * 0.5, 1 + elapsed * 0.5, 1 + elapsed * 0.5);
    requestAnimationFrame(pulse);
  };
  pulse();
}

// ============================
// CLICK TO MOVE
// ============================
canvas.addEventListener('click', (e) => {
  if (!state.connected || !state.player) return;
  if (state.isDead) return;
  if (state.dialogue.container.style.display === 'block') return;

  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, state.camera);

  const ground = state.scene.getObjectByName('ground');
  if (!ground) return;

  const intersects = raycaster.intersectObject(ground);
  if (intersects.length === 0) return;

  const point = intersects[0].point;

  // Check NPC proximity — walk to NPC then interact
  for (const npc of Object.values(state.npcs)) {
    const dist = npc.position.distanceTo(point);
    if (dist < 1.5) {
      const model = state.players[state.playerId];
      if (model) {
        const playerDist = model.position.distanceTo(npc.position);
        if (playerDist < 2) {
          // Close enough — interact directly
          const faceDir = npc.position.clone().sub(model.position).normalize();
          state.lastFacing = model.position.clone().add(faceDir);
          model.lookAt(state.lastFacing);
          wsSend(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
          return;
        } else {
          // Walk toward NPC, then interact when close
          state.interactTarget = { type: 'npc', id: npc.userData.id, position: npc.position.clone() };
          const dx = npc.position.x - model.position.x;
          const dz = npc.position.z - model.position.z;
          const len = Math.sqrt(dx * dx + dz * dz);
          // Target: 1.5 units away from NPC (face it)
          const targetX = npc.position.x - (dx / len) * 1.5;
          const targetZ = npc.position.z - (dz / len) * 1.5;
          const snapX = Math.round(targetX);
          const snapZ = Math.round(targetZ);
          const startX = Math.round(model.position.x);
          const startZ = Math.round(model.position.z);
          const path = findPath(startX, startZ, snapX, snapZ);
          if (path && path.length > 1) {
            state.pathWaypoints = path.slice(1);
            state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
          } else if (path && path.length === 1) {
            state.targetPos = new THREE.Vector3(path[0].x, 0, path[0].z);
          }
          return;
        }
      }
    }
  }

  // Check Monster proximity — attack via combat system
  for (const mob of Object.values(state.monsters)) {
    if (mob.position.distanceTo(point) < 2) {
      setTarget(mob.userData.id); // sets target + visual indicator

      // If skill is armed — walk to skill range, then cast
      if (state.skillArmed) {
        const model = state.players[state.playerId];
        if (model) {
          const skill = state.skillArmed.skill;
          const dist = model.position.distanceTo(mob.position);
          if (dist > skill.range) {
            // Walk to monster — but stop at skill range distance
            // Use pathfinding to monster, we'll stop when close enough
            const startX = Math.round(model.position.x);
            const startZ = Math.round(model.position.z);
            const targetX = Math.round(mob.position.x);
            const targetZ = Math.round(mob.position.z);
            const path = findPath(startX, startZ, targetX, targetZ);
            if (path && path.length > 1) {
              state.pathWaypoints = path.slice(1);
              state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
            }
            addChatMessage('Skill', `Walking to ${skill.name} range...`);
          } else {
            // Already in range — cast now
            executeSkill(state.skillArmed.classType, skill, mob);
          }
        }
      } else {
        performAttack(); // attack immediately if in range
      }
      return;
    }
  }

  // Find nearest walkable tile to click point (don't need exact center)
  let snapX = Math.round(point.x);
  let snapZ = Math.round(point.z);
  if (!isWalkable(snapX, snapZ)) {
    // Search nearby tiles for nearest walkable
    let found = false;
    for (let r = 1; r <= 3 && !found; r++) {
      for (let dx = -r; dx <= r && !found; dx++) {
        for (let dz = -r; dz <= r && !found; dz++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          if (isWalkable(snapX + dx, snapZ + dz)) {
            snapX += dx;
            snapZ += dz;
            found = true;
          }
        }
      }
    }
    if (!found) return;
  }

  // Click ground = stop auto-attack + disarm skill, keep target locked
  state.autoAttacking = false;
  disarmSkill();
  state.targetPos = null;
  state.pathWaypoints = null;

  // Show click indicator at exact click point
  showClickIndicator(point.x, point.z);

  // A* pathfinding — route around obstacles
  const model = state.players[state.playerId];
  if (!model) return;
  const startX = Math.round(model.position.x);
  const startZ = Math.round(model.position.z);
  const path = findPath(startX, startZ, snapX, snapZ);
  if (path && path.length > 1) {
    const waypoints = path.slice(1);
    // Replace last waypoint with exact click position for smooth ending
    if (waypoints.length > 0) {
      waypoints[waypoints.length - 1] = { x: point.x, z: point.z };
    }
    state.pathWaypoints = waypoints;
    state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
  } else if (path && path.length === 1) {
    state.targetPos = new THREE.Vector3(point.x, 0, point.z);
  }
});

// ============================
// SMOOTH MOVEMENT
// ============================
function updateMovement() {
  if (!state.targetPos) return;
  if (state.isDead) return; // don't move while dead
  const model = state.players[state.playerId];
  if (!model) return;

  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
  if (dir.length() < 0.1) {
    model.position.copy(state.targetPos);
    wsSend(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));

    // Next waypoint
    if (state.pathWaypoints && state.pathWaypoints.length > 0) {
      const next = state.pathWaypoints.shift();
      state.targetPos = new THREE.Vector3(next.x, 0, next.z);
    } else {
      state.targetPos = null;
      // Auto-interact with NPC if we walked to one
      if (state.interactTarget && state.interactTarget.type === 'npc') {
        const target = state.interactTarget;
        state.interactTarget = null;
        // Face the NPC and interact
        const npc = state.npcs[target.id];
        if (npc) {
          const faceDir = npc.position.clone().sub(model.position).normalize();
          model.lookAt(model.position.clone().add(faceDir));
        }
        wsSend(JSON.stringify({ type: 'interact_npc', npcId: target.id }));
      }
      // Execute pending skill when arriving at monster
      if (pendingSkill && state.targetedMonster) {
        const mob = state.monsters[state.targetedMonster];
        if (mob) {
          const dist = model.position.distanceTo(mob.position);
          if (dist <= pendingSkill.skill.range) {
            executeSkill(pendingSkill.classType, pendingSkill.skill, mob);
          }
        }
      }
      // Execute armed skill when arriving at monster
      if (state.skillArmed && state.targetedMonster) {
        const mob = state.monsters[state.targetedMonster];
        if (mob) {
          const dist = model.position.distanceTo(mob.position);
          if (dist <= state.skillArmed.skill.range) {
            executeSkill(state.skillArmed.classType, state.skillArmed.skill, mob);
          } else {
            // Not in range yet — keep walking toward monster
            const startX = Math.round(model.position.x);
            const startZ = Math.round(model.position.z);
            const targetX = Math.round(mob.position.x);
            const targetZ = Math.round(mob.position.z);
            const path = findPath(startX, startZ, targetX, targetZ);
            if (path && path.length > 1) {
              state.pathWaypoints = path.slice(1);
              state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
            } else {
              // No path found — try direct walk toward monster (for adjacent tiles)
              const dir = mob.position.clone().sub(model.position).normalize();
              state.targetPos = model.position.clone().add(dir.multiplyScalar(1.5));
            }
          }
        }
      }
    }
    return;
  }

  // Check next step collision — stop if blocked
  const step = dir.clone().normalize().multiplyScalar(0.08);
  const nextX = model.position.x + step.x;
  const nextZ = model.position.z + step.z;
  if (!isWalkable(nextX, nextZ)) {
    state.targetPos = null;
    state.pathWaypoints = null;
    return;
  }

  model.position.add(step);

  // Face direction of movement (store last direction)
  const lookTarget = model.position.clone().add(dir.normalize());
  state.lastFacing = lookTarget;
  model.lookAt(lookTarget);

  wsSend(JSON.stringify({
    type: 'move',
    x: model.position.x,
    y: 0,
    z: model.position.z,
  }));
}

// ============================
// CHAT INPUT
// ============================
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg && state.connected) {
      wsSend(JSON.stringify({ type: 'chat', message: msg }));
      addChatMessage(state.player?.name || 'You', msg);
      // Show bubble above own character
      if (state.playerModel) showChatBubble(state.playerModel, msg);
      e.target.value = '';
    }
  }
});

// ============================
// COMBAT SYSTEM — Auto-Target + Auto-Attack
// ============================

// Create target indicator ring
function createTargetIndicator() {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.0, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF4444, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  ring.visible = false;
  state.scene.add(ring);
  state.targetIndicator = ring;
}

// Set target on a monster
function setTarget(monsterId) {
  state.targetedMonster = monsterId;
  state.autoAttacking = true;
  if (state.targetIndicator) {
    state.targetIndicator.visible = true;
  }
  // Clear pathfinding so player doesn't walk away
  state.targetPos = null;
  state.pathWaypoints = null;
}

// Cancel targeting
function cancelTarget() {
  state.targetedMonster = null;
  state.autoAttacking = false;
  if (state.targetIndicator) {
    state.targetIndicator.visible = false;
  }
}

// Find nearest monster to player
function findNearestMonster() {
  const model = state.players[state.playerId];
  if (!model) return null;
  let nearest = null;
  let nearestDist = Infinity;
  for (const mob of Object.values(state.monsters)) {
    const dist = model.position.distanceTo(mob.position);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = mob;
    }
  }
  return nearest;
}

// Perform attack on targeted monster
function performAttack() {
  const mobId = state.targetedMonster;
  if (!mobId) return;
  const mob = state.monsters[mobId];
  if (!mob) { cancelTarget(); return; }

  const model = state.players[state.playerId];
  if (!model) return;

  const dist = model.position.distanceTo(mob.position);
  if (dist <= 1.8) {
    const now = Date.now();
    const spd = state.player?.spd || 7;
    const aspdCooldown = 600 + (10 - spd) * 80;
    if (now - state.lastAttackTime < aspdCooldown) return;
    state.lastAttackTime = now;
    // Face the monster
    const faceDir = mob.position.clone().sub(model.position).normalize();
    state.lastFacing = model.position.clone().add(faceDir);
    model.lookAt(state.lastFacing);
    // Swing animation — class-specific
    classAttackAnim(model, state.player?.class || 'laborer');
    // Attack impact particles on monster
    spawnAttackImpact(mob.position.clone());
    // Send attack to server (Cahaya v2: just targetId)
    wsSend(JSON.stringify({ type: 'attack', monsterId: mobId }));
  } else {
    // Walk to monster
    const startX = Math.round(model.position.x);
    const startZ = Math.round(model.position.z);
    const targetX = Math.round(mob.position.x);
    const targetZ = Math.round(mob.position.z);
    const path = findPath(startX, startZ, targetX, targetZ);
    if (path && path.length > 1) {
      state.pathWaypoints = path.slice(1);
      state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
    }
  }
}

// Simple attack swing animation
function attackSwing(model) {
  if (!model) return;
  const rightArm = model.getObjectByName('rightArm');
  if (rightArm) {
    const origRot = rightArm.rotation.x;
    rightArm.rotation.x = -1.2; // swing forward
    setTimeout(() => { rightArm.rotation.x = origRot; }, 200);
  }
}

// Class-specific attack animation — full body: arms + legs + body lunge
function classAttackAnim(model, classType) {
  if (!model) return;
  const rightArm = model.getObjectByName('rightArm');
  const leftArm = model.getObjectByName('leftArm');

  // Helper: animate property — supports 'rotation.x' style dot paths
  const anim = (obj, prop, val, dur) => {
    if (!obj) return;
    const parts = prop.split('.');
    const target = parts.length > 1 ? obj[parts[0]] : obj;
    const key = parts.length > 1 ? parts[1] : prop;
    if (!target) return;
    const orig = target[key];
    target[key] = val;
    setTimeout(() => { target[key] = orig; }, dur);
  };

  // Mark attacking so game loop doesn't overwrite arm rotations
  state.isAttacking = true;
  state.attackEndTime = Date.now() + 400;

  switch (classType) {
    case 'laborer': {
      // Heavy overhead smash — both arms raise then slam down
      if (rightArm) {
        anim(rightArm, 'rotation.x', -2.2, 150);
        setTimeout(() => anim(rightArm, 'rotation.x', 1.0, 100), 150);
        setTimeout(() => anim(rightArm, 'rotation.x', 0, 200), 250);
      }
      if (leftArm) {
        anim(leftArm, 'rotation.x', -1.8, 150);
        setTimeout(() => anim(leftArm, 'rotation.x', 0.6, 100), 150);
        setTimeout(() => anim(leftArm, 'rotation.x', 0, 200), 250);
      }
      break;
    }
    case 'miner': {
      // Quick dual slash — forward right then left
      if (rightArm) {
        anim(rightArm, 'rotation.x', -1.6, 100);
        setTimeout(() => anim(rightArm, 'rotation.x', 0, 100), 150);
      }
      if (leftArm) {
        setTimeout(() => {
          anim(leftArm, 'rotation.x', -1.4, 100);
          setTimeout(() => anim(leftArm, 'rotation.x', 0, 100), 150);
        }, 100);
      }
      break;
    }
    case 'gardener': {
      // Ranged cast — extend arm forward
      if (rightArm) {
        anim(rightArm, 'rotation.x', -1.4, 200);
        setTimeout(() => anim(rightArm, 'rotation.x', 0, 300), 400);
      }
      if (leftArm) {
        anim(leftArm, 'rotation.x', -0.8, 200);
        setTimeout(() => anim(leftArm, 'rotation.x', 0, 300), 400);
      }
      break;
    }
    case 'herbalist': {
      // Heal — arms open wide
      if (rightArm) anim(rightArm, 'rotation.z', -0.8, 200);
      if (leftArm) anim(leftArm, 'rotation.z', 0.8, 200);
      setTimeout(() => {
        if (rightArm) anim(rightArm, 'rotation.z', 0, 300);
        if (leftArm) anim(leftArm, 'rotation.z', 0, 300);
      }, 300);
      break;
    }
    case 'watchman': {
      // Quick thrust — fast forward jab
      if (rightArm) {
        anim(rightArm, 'rotation.x', -1.8, 80);
        setTimeout(() => anim(rightArm, 'rotation.x', -0.3, 60), 80);
        setTimeout(() => anim(rightArm, 'rotation.x', 0, 100), 140);
      }
      if (leftArm) {
        anim(leftArm, 'rotation.x', 0.4, 80);
        setTimeout(() => anim(leftArm, 'rotation.x', 0, 120), 80);
      }
      break;
    }
    default: {
      // Simple arm swing
      if (rightArm) {
        anim(rightArm, 'rotation.x', -1.2, 200);
      }
    }
  }
}

// ============================
// POTION SHORTCUT
// ============================
function usePotion(specificId) {
  if (!state.connected || !state.player || state.isDead) return;
  const inv = state.player.inventory || [];
  const potion = specificId
    ? inv.find(i => i.id === specificId && (i.count || 1) > 0)
    : inv.find(i => {
        const id = i.id;
        return id === 'potion_small' || id === 'potion_medium' || id === 'mp_potion_small' || id === 'antidote';
      });
  if (!potion) {
    addChatMessage('System', specificId ? `No ${specificId.replace(/_/g, ' ')} in inventory!` : 'No potion in inventory!');
    return;
  }
  wsSend(JSON.stringify({ type: 'use_item', itemId: potion.id }));
  addChatMessage('System', `Using ${potion.id.replace(/_/g, ' ')}...`);
}

// ============================
// FLASHLIGHT
// ============================
function toggleFlashlight() {
  state.flashlightOn = !state.flashlightOn;
  // Find which hotbar slot has the flashlight
  const slotF = document.querySelector('#skill-hotbar .skill-slot[data-type="flashlight"]');
  if (state.flashlightOn) {
    if (!state.flashlight) {
      state.flashlight = new THREE.PointLight(0xFFF3D4, 1.5, 15);
      state.scene.add(state.flashlight);
    }
    state.flashlight.visible = true;
    if (slotF) slotF.classList.add('skill-armed');
    addChatMessage('System', '🔦 Flashlight ON');
  } else {
    if (state.flashlight) state.flashlight.visible = false;
    if (slotF) slotF.classList.remove('skill-armed');
    addChatMessage('System', 'Flashlight OFF');
  }
}

// Global keyboard handler
document.addEventListener('keydown', (e) => {
  // Don't process if typing in chat or any input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Escape') {
    cancelTarget();
    disarmSkill();
    hideHotbarPicker();
    hideSkillDetail();
    return;
  }

  // Hotbar keys 1-9, 0 → slots 0-9
  const hotbarKeys = { '1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,'9':8,'0':9 };
  if (hotbarKeys[e.key] !== undefined) {
    e.preventDefault();
    const idx = hotbarKeys[e.key];
    activateHotbarSlot(idx);
    return;
  }

  if (e.key === 'w' || e.key === 'W') {
    e.preventDefault();
    // If no target, auto-target nearest monster
    if (!state.targetedMonster) {
      const nearest = findNearestMonster();
      if (nearest) {
        setTarget(nearest.userData.id);
      }
    } else {
      // Already targeted — resume auto-attack
      state.autoAttacking = true;
    }
  }
});

// ============================
// DEATH SCREEN
// ============================
let pendingLoot = [];
let pendingRespawn = null;

function showDeathScreen(hp, maxHp) {
  const screen = document.getElementById('death-screen');
  screen.style.display = 'flex';
  // Pause game input
  state.isDead = true;
  cancelTarget();
}

function hideDeathScreen() {
  document.getElementById('death-screen').style.display = 'none';
  state.isDead = false;
}

document.getElementById('respawn-city').addEventListener('click', () => {
  wsSend(JSON.stringify({ type: 'respawn', location: 'city' }));
  hideDeathScreen();
});

document.getElementById('respawn-checkpoint').addEventListener('click', () => {
  if (pendingRespawn) {
    wsSend(JSON.stringify({ type: 'respawn', location: 'checkpoint', checkpointId: pendingRespawn }));
    hideDeathScreen();
    pendingRespawn = null;
  }
});

// ============================
// LOOT POPUP
// ============================
function showLootPopup(loot) {
  if (!loot || loot.length === 0) return;
  pendingLoot = loot;
  const popup = document.getElementById('loot-popup');
  const itemsEl = document.getElementById('loot-items');
  itemsEl.innerHTML = '';

  loot.forEach((item, i) => {
    const tier = item.tier || 0;
    const chance = item.dropChance || 0.5;
    // Drop difficulty based on chance
    const difficulty = chance >= 0.5 ? 'easy' : chance >= 0.1 ? 'medium' : 'hard';
    const diffLabel = { easy: 'Common', medium: 'Uncommon', hard: 'Rare' }[difficulty];

    const div = document.createElement('div');
    div.className = 'loot-item';
    const iconBg = '#555';

    // Stats text for equipment
    let statsText = '';
    if (item.type === 'equipment' && item.stats) {
      const parts = [];
      if (item.stats.atk) parts.push(`ATK+${item.stats.atk}`);
      if (item.stats.def) parts.push(`DEF+${item.stats.def}`);
      if (item.stats.hp) parts.push(`HP+${item.stats.hp}`);
      if (item.stats.mp) parts.push(`MP+${item.stats.mp}`);
      if (item.stats.spd) parts.push(`SPD+${item.stats.spd}`);
      if (item.stats.crit) parts.push(`CRIT+${Math.round(item.stats.crit*100)}%`);
      statsText = parts.join(' ');
    } else if (item.healAmount) {
      statsText = `Heals ${item.healAmount} HP`;
    } else if (item.manaAmount) {
      statsText = `Restores ${item.manaAmount} MP`;
    }

    div.innerHTML = `
      <div class="loot-item-icon" style="background:${iconBg}">${item.icon?.symbol || '📦'}</div>
      <div class="loot-item-info">
        <div class="loot-item-name">${item.name}</div>
        <div class="loot-item-type">${item.type || 'item'}${item.slot ? ' • ' + item.slot : ''} ×${item.quantity || 1} <span class="loot-drop-${difficulty}">• ${diffLabel}</span></div>
        ${statsText ? `<div class="loot-item-stats">${statsText}</div>` : ''}
      </div>
    `;
    itemsEl.appendChild(div);
  });

  popup.style.display = 'block';
  // Auto-hide after 8 seconds
  clearTimeout(state._lootTimer);
  state._lootTimer = setTimeout(() => { popup.style.display = 'none'; }, 8000);
}

document.getElementById('loot-pickup-all').addEventListener('click', () => {
  if (pendingLoot.length > 0) {
    wsSend(JSON.stringify({ type: 'pickup_loot' }));
    pendingLoot = [];
    document.getElementById('loot-popup').style.display = 'none';
    addChatMessage('System', '📦 Loot collected!');
  }
});

// ============================
// SKILL SYSTEM
// ============================
let skillCooldownEnd = 0;
let pendingSkill = null; // { classType, skill } — waiting to walk to monster
let skillDetailTimer = null;

function getSlotLabel(slot) {
  if (!slot || !slot.type) return '';
  if (slot.type === 'skill') {
    const classType = state.player?.class || 'laborer';
    const tier = slot.skillTier || 'tier1';
    const tree = SKILL_TREES[classType];
    if (tree && tree[tier]) return tree[tier].icon;
    const skill = SKILLS[classType];
    return skill ? skill.icon : '';
  }
  if (slot.type === 'potion') {
    const item = typeof ITEMS !== 'undefined' ? ITEMS[slot.id] : null;
    return item ? (slot.id.includes('mp') ? '💙' : slot.id.includes('antidote') ? '💚' : '🧪') : '🧪';
  }
  if (slot.type === 'flashlight') return '🔦';
  return '';
}

function getSlotTitle(slot) {
  if (!slot || !slot.type) return 'Empty slot';
  if (slot.type === 'skill') {
    const classType = state.player?.class || 'laborer';
    const tier = slot.skillTier || 'tier1';
    const tree = SKILL_TREES[classType];
    if (tree && tree[tier]) {
      const sk = tree[tier];
      return `${sk.name} (${sk.mpCost} MP) — ${sk.desc}`;
    }
    const skill = SKILLS[classType];
    return skill ? `${skill.name} (${skill.mpCost} MP) — ${skill.desc}` : 'Skill';
  }
  if (slot.type === 'potion') {
    const item = typeof ITEMS !== 'undefined' ? ITEMS[slot.id] : null;
    return item ? `${item.name} — ${item.description}` : slot.id;
  }
  if (slot.type === 'flashlight') return 'Toggle Flashlight';
  return '';
}

function saveHotbar() {
  try { localStorage.setItem('zenithia_hotbar', JSON.stringify(state.hotbar)); } catch(e) {}
}

function renderHotbar() {
  const container = document.getElementById('skill-hotbar');
  if (!container) return;
  container.innerHTML = '';
  const keys = ['1','2','3','4','5','6','7','8','9','0'];
  for (let i = 0; i < 10; i++) {
    const slot = state.hotbar[i];
    const div = document.createElement('div');
    div.className = 'skill-slot';
    div.dataset.index = i;
    div.dataset.key = keys[i];
    if (slot && slot.type) div.dataset.type = slot.type;
    if (slot && slot.type === 'skill' && slot.skillTier) div.dataset.skillTier = slot.skillTier;
    div.title = getSlotTitle(slot);

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.textContent = getSlotLabel(slot);
    div.appendChild(icon);

    // Cooldown overlay (for skill slots)
    if (slot && slot.type === 'skill') {
      const cd = document.createElement('div');
      cd.className = 'skill-cd-overlay';
      div.appendChild(cd);
    }

    const keyLabel = document.createElement('span');
    keyLabel.className = 'skill-key';
    keyLabel.textContent = keys[i];
    div.appendChild(keyLabel);

    // Left click → activate
    div.addEventListener('click', (e) => {
      e.preventDefault();
      activateHotbarSlot(i);
    });

    // Right click → show picker
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showHotbarPicker(i, e.clientX, e.clientY);
    });

    container.appendChild(div);
  }
}

function activateHotbarSlot(idx) {
  const slot = state.hotbar[idx];
  if (!slot || !slot.type) return;

  if (slot.type === 'skill') {
    const skillTier = slot.skillTier || 'tier1';
    useSkill(skillTier);
    // Show skill detail panel briefly
    const classType = state.player?.class || 'laborer';
    const tree = SKILL_TREES[classType];
    const skill = tree ? tree[skillTier] : null;
    if (skill) {
      const slotEl = document.querySelector(`#skill-hotbar .skill-slot[data-index="${idx}"]`);
      if (slotEl) showSkillDetail(skill, classType, slotEl);
      // Show skill info in chat
      const multiText = skill.healMulti
        ? `Heal ${(skill.healMulti * 100).toFixed(0)}% HP`
        : `${skill.damageMulti}x ATK`;
      addChatMessage('Skill', `[${skill.name}] — ${multiText}, ${skill.mpCost} MP`);
    }
  } else if (slot.type === 'potion') {
    usePotion(slot.id);
  } else if (slot.type === 'flashlight') {
    toggleFlashlight();
  }
}

// ============================
// HOTBAR PICKER (right-click)
// ============================
function showHotbarPicker(slotIdx, x, y) {
  hideSkillDetail();
  const picker = document.getElementById('hotbar-picker');
  if (!picker) return;
  state.hotbarPickerSlot = slotIdx;

  let html = '<div class="picker-header">Assign to Slot ' + (slotIdx + 1 === 10 ? '0' : slotIdx + 1) + '</div>';

  // Show all unlocked skills from skill tree
  const classType = state.player?.class || 'laborer';
  const tree = SKILL_TREES[classType];
  if (tree) {
    ['tier1', 'tier2a', 'tier2b'].forEach(tier => {
      if (state.unlockedSkills.includes(tier) && tree[tier]) {
        const sk = tree[tier];
        html += `<div class="picker-item" data-type="skill" data-id="${classType}" data-skill-tier="${tier}">
          <span class="picker-icon">${sk.icon}</span>
          <span class="picker-label">${sk.name}</span>
        </div>`;
      }
    });
  }

  // Consumables from inventory
  const inv = state.player?.inventory || [];
  const consumables = inv.filter(i => {
    const item = typeof ITEMS !== 'undefined' ? ITEMS[i.id] : null;
    return item && item.type === 'consumable';
  });
  if (consumables.length > 0) {
    html += '<div class="picker-header">Consumables</div>';
    for (const item of consumables) {
      const def = typeof ITEMS !== 'undefined' ? ITEMS[item.id] : null;
      const count = item.quantity || item.count || 1;
      const icon = item.id.includes('mp') ? '💙' : item.id.includes('antidote') ? '💚' : '🧪';
      html += `<div class="picker-item" data-type="potion" data-id="${item.id}">
        <span class="picker-icon">${icon}</span>
        <span class="picker-label">${def ? def.name : item.id}</span>
        <span class="picker-count">x${count}</span>
      </div>`;
    }
  }

  // Flashlight
  html += `<div class="picker-item" data-type="flashlight" data-id="flashlight">
    <span class="picker-icon">🔦</span>
    <span class="picker-label">Flashlight</span>
  </div>`;

  // Clear option
  html += `<div class="picker-item" data-type="clear" data-id="">
    <span class="picker-icon">❌</span>
    <span class="picker-label">Clear Slot</span>
  </div>`;

  picker.innerHTML = html;
  picker.style.display = 'block';
  picker.style.left = Math.min(x, window.innerWidth - 200) + 'px';
  picker.style.top = Math.min(y, window.innerHeight - 320) + 'px';

  // Attach click handlers
  picker.querySelectorAll('.picker-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const id = item.dataset.id;
      const skillTier = item.dataset.skillTier || null;
      if (type === 'clear') {
        state.hotbar[state.hotbarPickerSlot] = { type: null, id: null };
      } else if (type === 'skill') {
        state.hotbar[state.hotbarPickerSlot] = { type, id, skillTier };
      } else {
        state.hotbar[state.hotbarPickerSlot] = { type, id };
      }
      saveHotbar();
      renderHotbar();
      hideHotbarPicker();
    });
  });
}

function hideHotbarPicker() {
  const picker = document.getElementById('hotbar-picker');
  if (picker) picker.style.display = 'none';
  state.hotbarPickerSlot = null;
}

// Close picker on click outside
document.addEventListener('click', (e) => {
  const picker = document.getElementById('hotbar-picker');
  if (picker && picker.style.display === 'block' && !picker.contains(e.target)) {
    hideHotbarPicker();
  }
  // Also hide skill detail on outside click
  const detail = document.getElementById('skill-detail-panel');
  if (detail && detail.style.display === 'block' && !detail.contains(e.target)) {
    hideSkillDetail();
  }
});

// ============================
// SKILL DETAIL PANEL
// ============================
function showSkillDetail(skill, classType, anchorEl) {
  const panel = document.getElementById('skill-detail-panel');
  if (!panel || !skill) return;

  document.getElementById('skill-detail-icon').textContent = skill.icon;
  document.getElementById('skill-detail-name').textContent = skill.name;
  document.getElementById('skill-detail-class').textContent = classType.charAt(0).toUpperCase() + classType.slice(1);

  const costEl = document.getElementById('skill-detail-cost');
  costEl.innerHTML = `<span class="stat-label">MP Cost:</span> ${skill.mpCost}`;

  const cdEl = document.getElementById('skill-detail-cd');
  cdEl.innerHTML = `<span class="stat-label">Cooldown:</span> ${skill.cooldown / 1000}s`;

  const multiEl = document.getElementById('skill-detail-multi');
  if (skill.healMulti) {
    multiEl.innerHTML = `<span class="stat-label">Heal:</span> ${(skill.healMulti * 100).toFixed(0)}% max HP`;
  } else {
    multiEl.innerHTML = `<span class="stat-label">Damage:</span> ${skill.damageMulti}x ATK`;
  }

  const rangeEl = document.getElementById('skill-detail-range');
  rangeEl.innerHTML = skill.range > 0
    ? `<span class="stat-label">Range:</span> ${skill.range}`
    : `<span class="stat-label">Range:</span> Self`;

  document.getElementById('skill-detail-desc').textContent = skill.desc;

  // Position above the anchor slot
  const rect = anchorEl.getBoundingClientRect();
  panel.style.left = Math.max(10, rect.left + rect.width / 2 - 110) + 'px';
  panel.style.top = Math.max(10, rect.top - panel.offsetHeight - 10) + 'px';
  panel.style.display = 'block';

  // Auto-hide after 3 seconds
  clearTimeout(skillDetailTimer);
  skillDetailTimer = setTimeout(hideSkillDetail, 3000);
}

function hideSkillDetail() {
  clearTimeout(skillDetailTimer);
  const panel = document.getElementById('skill-detail-panel');
  if (panel) panel.style.display = 'none';
}

function initSkillUI() {
  const classType = state.player?.class || 'laborer';
  const skill = SKILLS[classType];
  if (!skill) return;

  // Initialize default hotbar if no saved loadout
  if (!state.hotbar) {
    state.hotbar = Array(10).fill(null).map(() => ({ type: null, id: null }));
    state.hotbar[0] = { type: 'skill', id: classType, skillTier: 'tier1' };
    state.hotbar[1] = { type: 'potion', id: 'potion_small' };
    saveHotbar();
  }

  const hotbar = document.getElementById('skill-hotbar');
  hotbar.style.display = 'flex';
  renderHotbar();

  // Show skill tree button
  const treeBtn = document.getElementById('skill-tree-btn');
  if (treeBtn) {
    treeBtn.style.display = 'block';
    treeBtn.onclick = () => renderSkillTree();
  }

  // Close skill tree on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('skill-tree-modal');
      if (modal) modal.classList.remove('show');
    }
  });
}

// ============================
// SKILL TREE UI
// ============================
function renderSkillTree() {
  const modal = document.getElementById('skill-tree-modal');
  const content = document.getElementById('skill-tree-content');
  if (!modal || !content) return;

  const classType = state.player?.class || 'laborer';
  const tree = SKILL_TREES[classType];
  if (!tree) return;

  const level = state.player?.level || 1;
  const unlocked = state.unlockedSkills || ['tier1'];

  let html = `<div class="st-class-label">${tree.className} — Level ${level}</div>`;

  // Tier 1 (always unlocked)
  const t1 = tree.tier1;
  html += `
    <div class="st-node unlocked" data-tier="tier1">
      <div class="st-node-icon">${t1.icon}</div>
      <div class="st-node-info">
        <div class="st-node-name">${t1.name}</div>
        <div class="st-node-desc">${t1.desc}</div>
      </div>
      <div class="st-node-badge">Active</div>
    </div>
  `;

  // Connector
  html += `<div class="st-connector"><div class="st-connector-line"></div></div>`;

  // Tier 2a (level 5)
  const t2a = tree.tier2a;
  const t2aUnlocked = unlocked.includes('tier2a');
  html += `
    <div class="st-node ${t2aUnlocked ? 'unlocked' : 'locked'}" data-tier="tier2a">
      <div class="st-node-icon">${t2a.icon}</div>
      <div class="st-node-info">
        <div class="st-node-name">${t2a.name}</div>
        <div class="st-node-desc">${t2a.desc}</div>
        ${!t2aUnlocked ? `<div class="st-node-req">🔒 Requires Level ${t2a.reqLevel}</div>` : ''}
      </div>
      <div class="st-node-badge">${t2aUnlocked ? 'Active' : `Lv.${t2a.reqLevel}`}</div>
    </div>
  `;

  // Branch connector
  html += `<div class="st-connector"><div class="st-connector-line"></div></div>`;

  // Tier 2b (level 3)
  const t2b = tree.tier2b;
  const t2bUnlocked = unlocked.includes('tier2b');
  html += `
    <div class="st-node ${t2bUnlocked ? 'unlocked' : 'locked'}" data-tier="tier2b">
      <div class="st-node-icon">${t2b.icon}</div>
      <div class="st-node-info">
        <div class="st-node-name">${t2b.name}</div>
        <div class="st-node-desc">${t2b.desc}</div>
        ${!t2bUnlocked ? `<div class="st-node-req">🔒 Requires Level ${t2b.reqLevel}</div>` : ''}
      </div>
      <div class="st-node-badge">${t2bUnlocked ? 'Active' : `Lv.${t2b.reqLevel}`}</div>
    </div>
  `;

  content.innerHTML = html;

  // Bind clicks on unlocked nodes → assign to next empty hotbar slot
  content.querySelectorAll('.st-node.unlocked').forEach(node => {
    node.addEventListener('click', () => {
      const tier = node.dataset.tier;
      // Find first empty hotbar slot, or replace slot 0
      let targetIdx = state.hotbar.findIndex(s => !s || !s.type);
      if (targetIdx === -1) targetIdx = 0;
      state.hotbar[targetIdx] = { type: 'skill', id: classType, skillTier: tier };
      saveHotbar();
      renderHotbar();
      addChatMessage('Skill', `Assigned ${tree[tier].name} to Slot ${targetIdx + 1 === 10 ? '0' : targetIdx + 1}`);
    });
  });

  modal.classList.add('show');
}

function useSkill(skillTier = 'tier1') {
  if (state.isDead) return;
  const classType = state.player?.class || 'laborer';
  const tree = SKILL_TREES[classType];
  const skill = tree ? tree[skillTier] : null;
  if (!skill) return;

  const now = Date.now();

  // If same skill already armed → disarm (toggle off)
  if (state.skillArmed && state.skillArmed.skillTier === skillTier) {
    disarmSkill();
    return;
  }

  // Cooldown check
  if (now < skillCooldownEnd) {
    const sec = Math.ceil((skillCooldownEnd - now) / 1000);
    addChatMessage('Skill', `${skill.name} on cooldown (${sec}s)`);
    return;
  }

  // MP check
  if ((state.player?.mp || 0) < skill.mpCost) {
    addChatMessage('Skill', `Not enough MP! Need ${skill.mpCost}`);
    return;
  }

  // Buff skill — cast immediately (no target needed)
  if (skill.buff && skill.range === 0) {
    const myModel = state.players[state.playerId];
    if (myModel) {
      spawnSkillEffect(myModel.position.clone(), classType);
      classAttackAnim(myModel, classType);
    }
    wsSend(JSON.stringify({ type: 'use_skill', skillTier, skillId: classType }));
    skillCooldownEnd = now + skill.cooldown;
    startSkillCooldownUI(skill.cooldown, skillTier);
    return;
  }

  // Heal skill — cast immediately (no target needed)
  if (skill.healMulti && skill.healMulti > 0 && skill.range === 0) {
    const myModel = state.players[state.playerId];
    if (myModel) {
      spawnSkillEffect(myModel.position.clone(), 'herbalist');
      classAttackAnim(myModel, 'herbalist');
    }
    wsSend(JSON.stringify({ type: 'use_skill', skillTier, skillId: classType }));
    skillCooldownEnd = now + skill.cooldown;
    startSkillCooldownUI(skill.cooldown, skillTier);
    return;
  }

  // Arm the skill
  state.skillArmed = { classType, skill, skillTier };

  // If already targeting a monster (auto-attack active) → use that target
  if (state.targetedMonster) {
    const mob = state.monsters[state.targetedMonster];
    const model = state.players[state.playerId];
    if (mob && model) {
      const dist = model.position.distanceTo(mob.position);
      if (dist <= skill.range) {
        // In range — cast now
        executeSkill(classType, skill, mob, skillTier);
        return;
      } else {
        // Out of range — walk to monster
        state.autoAttacking = false;
        const startX = Math.round(model.position.x);
        const startZ = Math.round(model.position.z);
        const targetX = Math.round(mob.position.x);
        const targetZ = Math.round(mob.position.z);
        const path = findPath(startX, startZ, targetX, targetZ);
        if (path && path.length > 1) {
          state.pathWaypoints = path.slice(1);
          state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
        }
        // Visual feedback
        const skillSlotEl = document.querySelector(`#skill-hotbar .skill-slot[data-skill-tier="${skillTier}"]`);
        if (skillSlotEl) skillSlotEl.classList.add('skill-armed');
        addChatMessage('Skill', `${skill.name} — walking to range...`);
        return;
      }
    }
  }

  // No target — wait for player to click a monster
  state.autoAttacking = false;

  // Visual feedback — glow the skill icon
  const skillSlotEl = document.querySelector(`#skill-hotbar .skill-slot[data-skill-tier="${skillTier}"]`);
  if (skillSlotEl) skillSlotEl.classList.add('skill-armed');
  addChatMessage('Skill', `${skill.name} ready — click a monster to cast`);
}

function disarmSkill() {
  if (!state.skillArmed) return;
  const tier = state.skillArmed.skillTier;
  state.skillArmed = null;
  const skillSlotEl = document.querySelector(`#skill-hotbar .skill-slot[data-skill-tier="${tier}"]`);
  if (skillSlotEl) skillSlotEl.classList.remove('skill-armed');
  // Also remove from any other skill slots
  document.querySelectorAll('#skill-hotbar .skill-slot.skill-armed').forEach(el => el.classList.remove('skill-armed'));
  // Resume auto-attack if we have a target
  if (state.targetedMonster) {
    state.autoAttacking = true;
  }
}

function executeSkill(classType, skill, mob, skillTier = 'tier1') {
  const model = state.players[state.playerId];
  if (!model) return;

  const now = Date.now();

  // Re-check cooldown (might have changed while walking)
  if (now < skillCooldownEnd) {
    disarmSkill();
    pendingSkill = null;
    return;
  }

  // Face + attack animation
  const faceDir = mob.position.clone().sub(model.position).normalize();
  state.lastFacing = model.position.clone().add(faceDir);
  model.lookAt(state.lastFacing);
  classAttackAnim(model, classType);
  // Skill visual effect
  spawnSkillEffect(model.position.clone(), classType);
  // Attack impact on monster
  spawnAttackImpact(mob.position.clone(), {laborer:0xFF8C00,miner:0x8D6E63,gardener:0x4CAF50,watchman:0x42A5F5}[classType] || 0xFFFFFF);

  // Send to server
  wsSend(JSON.stringify({ type: 'use_skill', skillTier, skillId: classType, monsterId: mob.userData.id }));
  skillCooldownEnd = now + skill.cooldown;
  startSkillCooldownUI(skill.cooldown, skillTier);
  disarmSkill();
  pendingSkill = null;
}

function startSkillCooldownUI(durationMs, skillTier = 'tier1') {
  const skillSlotEl = document.querySelector(`#skill-hotbar .skill-slot[data-skill-tier="${skillTier}"]`);
  if (!skillSlotEl) return;
  const cdEl = skillSlotEl.querySelector('.skill-cd-overlay');
  if (!cdEl) return;
  skillSlotEl.classList.add('on-cd');
  cdEl.style.height = '100%';

  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const pct = Math.max(0, 1 - elapsed / durationMs);
    cdEl.style.height = (pct * 100) + '%';
    if (pct > 0) requestAnimationFrame(tick);
    else skillSlotEl.classList.remove('on-cd');
  };
  requestAnimationFrame(tick);
}

// ============================
// TARGET HP BAR (HUD)
// ============================
function updateTargetHPBar() {
  const bar = document.getElementById('target-hp-bar');
  if (!state.targetedMonster) {
    bar.style.display = 'none';
    return;
  }
  const mob = state.monsters[state.targetedMonster];
  if (!mob) {
    bar.style.display = 'none';
    return;
  }

  // Get monster HP from userData (stored on spawn from server)
  const hp = mob.userData?.hp ?? 0;
  const maxHp = mob.userData?.maxHp ?? 1;
  const name = mob.userData?.monsterName || 'Monster';

  bar.style.display = 'block';
  const fill = document.getElementById('target-hp-fill');
  const text = document.getElementById('target-hp-text');
  fill.style.width = `${Math.max(0, hp / maxHp) * 100}%`;
  text.textContent = `${name} ${Math.round(hp)}/${maxHp}`;
}

// ============================
// PHANTOM WALLET (Solana) + CAPTCHA + SIWS
// ============================
let captchaMessage = null;

async function connectPhantom() {
  const btn = document.getElementById('connect-wallet');
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      state.walletAddress = resp.publicKey.toString();
      localStorage.setItem('zenithia_wallet', state.walletAddress);
      btn.textContent = '✓ ' + state.walletAddress.slice(0, 6) + '...' + state.walletAddress.slice(-4);
      btn.style.background = '#4CAF50';
      console.log('[WALLET] Connected:', state.walletAddress);

      // Fetch captcha challenge
      await loadCaptcha();
    } catch (err) {
      console.error('[WALLET] Connection failed:', err);
      btn.textContent = 'Connect Failed — Retry';
    }
  } else {
    btn.textContent = 'Phantom Not Found — Install It';
    window.open('https://phantom.app/', '_blank');
  }
}

async function loadCaptcha() {
  const section = document.getElementById('captcha-section');
  const question = document.getElementById('captcha-question');
  const status = document.getElementById('captcha-status');

  try {
    const res = await fetch(`/api/captcha?wallet=${state.walletAddress}`);
    const data = await res.json();
    question.textContent = data.captcha;
    captchaMessage = data.message;
    section.style.display = 'block';
    status.textContent = '';
  } catch (e) {
    status.textContent = 'Failed to load captcha. Refresh.';
  }
}

async function signAndLogin() {
  const status = document.getElementById('captcha-status');
  const captchaAnswer = document.getElementById('captcha-input').value.trim();

  if (!captchaAnswer) { status.textContent = 'Enter captcha answer'; return; }
  if (!captchaMessage) { status.textContent = 'No challenge. Click Connect again.'; return; }

  status.textContent = 'Signing with Phantom...';

  try {
    // Sign message with Phantom
    const encodedMessage = new TextEncoder().encode(captchaMessage);

    if (!window.solana.signMessage) {
      status.textContent = '❌ Phantom too old. Update Phantom wallet.';
      return;
    }

    const signed = await window.solana.signMessage(encodedMessage, 'utf8');

    // Base58 encode signature
    const sigBase58 = bs58Encode(signed.signature);

    // Verify with server
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: state.walletAddress,
        signature: sigBase58,
        captchaAnswer,
      }),
    });

    const data = await res.json();
    if (data.verified) {
      status.textContent = '✓ Verified! Joining...';
      localStorage.setItem('zenithia_verified', 'true');
      // Proceed to game
      const name = document.getElementById('name-input').value.trim() || 'Adventurer';
      connectWebSocket(name, state.walletAddress);
    } else {
      status.textContent = '❌ ' + (data.error || 'Verification failed');
      await loadCaptcha(); // refresh captcha
    }
  } catch (e) {
    status.textContent = '❌ Sign failed: ' + e.message;
  }
}

// Base58 encode (browser-safe, no Buffer needed)
function bs58Encode(bytes) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; bytes[i] === 0 && i < bytes.length - 1; i++) {
    result += ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += ALPHABET[digits[i]];
  }
  return result;
}

document.getElementById('connect-wallet').addEventListener('click', connectPhantom);
document.getElementById('sign-wallet').addEventListener('click', signAndLogin);

// ============================
// START GAME
// ============================
document.getElementById('start-game').addEventListener('click', () => {
  const name = document.getElementById('name-input').value.trim();
  if (name) {
    localStorage.setItem('zenithia_name', name);
    connectWebSocket(name, state.walletAddress);
  }
});

// ============================
// GAME LOOP
// ============================
// Blink timer state
let lastBlinkTime = 0;
let nextBlinkDelay = 3000 + Math.random() * 3000;

// ============================
// DAY / NIGHT CYCLE
// ============================
function lerpColor(a, b, t) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  ca.lerp(cb, t);
  return ca;
}

function updateDayNight(dt) {
  // Always advance locally for smooth real-time feel
  // Server sync corrects drift every 30s via smooth interpolation
  state.dayTime = (state.dayTime + dt * state.daySpeed) % 1.0;
  const t = state.dayTime;

  // Sun angle: t=0.25 → east (sunrise), t=0.5 → top (noon), t=0.75 → sunset
  const sunAngle = (t - 0.25) * Math.PI * 2;
  const sunY = Math.sin(sunAngle) * 80;
  const sunX = Math.cos(sunAngle) * 80;

  state.sunLight.position.set(sunX, Math.max(sunY, -10), 30);

  // Sky color phases — smoother transitions
  let skyColor;
  let fogColor;
  let sunIntensity;
  let ambientIntensity;
  let ambientColor;
  let sunColor;

  if (t < 0.15) {
    // Deep night (0 → 0.15)
    skyColor = new THREE.Color(0x0a0a2a);
    fogColor = new THREE.Color(0x0a0a2a);
    sunIntensity = 0.05;
    ambientIntensity = 0.08;
    ambientColor = new THREE.Color(0x111133);
    sunColor = new THREE.Color(0x334466);
  } else if (t < 0.25) {
    // Pre-dawn (0.15 → 0.25) — sky lightens slowly
    const p = (t - 0.15) / 0.1;
    skyColor = lerpColor(0x0a0a2a, 0x1a1a3a, p);
    fogColor = lerpColor(0x0a0a2a, 0x1a1a3a, p);
    sunIntensity = 0.05 + p * 0.1;
    ambientIntensity = 0.08 + p * 0.07;
    ambientColor = lerpColor(0x111133, 0x222244, p);
    sunColor = lerpColor(0x334466, 0x665544, p);
  } else if (t < 0.35) {
    // Sunrise (0.25 → 0.35) — orange/pink horizon, gradual blue
    const p = (t - 0.25) / 0.1;
    skyColor = lerpColor(0x1a1a3a, 0x87CEEB, p);
    fogColor = lerpColor(0x2a1a2a, 0x87CEEB, p);
    sunIntensity = 0.15 + p * 0.85;
    ambientIntensity = 0.15 + p * 0.25;
    ambientColor = lerpColor(0x332233, 0xffffff, p);
    sunColor = lerpColor(0xff8866, 0xfff5e0, p);
  } else if (t < 0.5) {
    // Morning → noon (0.35 → 0.5) — bright day
    const p = (t - 0.35) / 0.15;
    skyColor = lerpColor(0x87CEEB, 0x5eb8f5, p);
    fogColor = lerpColor(0x87CEEB, 0x5eb8f5, p);
    sunIntensity = 1.0;
    ambientIntensity = 0.4;
    ambientColor = new THREE.Color(0xffffff);
    sunColor = new THREE.Color(0xfff5e0);
  } else if (t < 0.65) {
    // Noon → golden hour (0.5 → 0.65) — warm light
    const p = (t - 0.5) / 0.15;
    skyColor = lerpColor(0x5eb8f5, 0xFFB347, p);
    fogColor = lerpColor(0x5eb8f5, 0xFFB347, p);
    sunIntensity = 1.0 - p * 0.2;
    ambientIntensity = 0.4 - p * 0.1;
    ambientColor = lerpColor(0xffffff, 0xffccaa, p);
    sunColor = lerpColor(0xfff5e0, 0xffaa44, p);
  } else if (t < 0.8) {
    // Sunset (0.65 → 0.8) — slow transition to dusk
    const p = (t - 0.65) / 0.15;
    skyColor = lerpColor(0xFFB347, 0x2a1a3a, p);
    fogColor = lerpColor(0xFFB347, 0x2a1a3a, p);
    sunIntensity = 0.8 - p * 0.7;
    ambientIntensity = 0.3 - p * 0.2;
    ambientColor = lerpColor(0xffccaa, 0x332244, p);
    sunColor = lerpColor(0xffaa44, 0x443355, p);
  } else if (t < 0.9) {
    // Dusk → night (0.8 → 0.9) — last light fades
    const p = (t - 0.8) / 0.1;
    skyColor = lerpColor(0x2a1a3a, 0x0a0a2a, p);
    fogColor = lerpColor(0x2a1a3a, 0x0a0a2a, p);
    sunIntensity = 0.1 - p * 0.05;
    ambientIntensity = 0.1 - p * 0.02;
    ambientColor = lerpColor(0x332244, 0x111133, p);
    sunColor = lerpColor(0x443355, 0x334466, p);
  } else {
    // Night (0.9 → 1.0)
    skyColor = new THREE.Color(0x0a0a2a);
    fogColor = new THREE.Color(0x0a0a2a);
    sunIntensity = 0.05;
    ambientIntensity = 0.08;
    ambientColor = new THREE.Color(0x111133);
    sunColor = new THREE.Color(0x334466);
  }

  state.scene.background.set(skyColor);
  state.scene.fog.color.set(fogColor);
  state.sunLight.intensity = sunIntensity;
  state.sunLight.color.set(sunColor);
  state.ambientLight.intensity = ambientIntensity;
  state.ambientLight.color.set(ambientColor);

  // DEBUG: log lighting values every 5 seconds
  if (!state._lastLightLog || Date.now() - state._lastLightLog > 5000) {
    const sunHex = state.sunLight.color.getHexString ? state.sunLight.color.getHexString() : String(state.sunLight.color);
    const bgHex = state.scene.background?.getHexString ? state.scene.background.getHexString() : 'N/A';
    console.log(`[LIGHT] t=${t.toFixed(3)} h=${(t*24).toFixed(1)} sunInt=${state.sunLight.intensity.toFixed(3)} ambInt=${state.ambientLight.intensity.toFixed(3)} sunColor=${sunHex} bg=${bgHex}`);
    state._lastLightLog = Date.now();
  }

  // Update sun mesh position (follows light)
  if (state.sunMesh) {
    state.sunMesh.position.set(sunX, Math.max(sunY, -10), 30);
    state.sunMesh.visible = sunY > -5;
  }

  // Moon: visible during night, fade in/out at edges
  const moonVisible = t < 0.25 || t > 0.75;
  state.moonMesh.visible = moonVisible;
  if (state.moonGlow) state.moonGlow.visible = moonVisible;
  if (moonVisible) {
    const moonAngle = (t < 0.25 ? t + 0.75 : t - 0.75);
    const moonX = Math.cos(moonAngle * Math.PI * 2) * 80;
    const moonY = Math.sin(moonAngle * Math.PI * 2) * 80;
    state.moonMesh.position.set(moonX, moonY, -30);
    if (state.moonGlow) state.moonGlow.position.set(moonX, moonY, -30);
    // Smooth fade
    let moonAlpha = 1;
    if (t > 0.75 && t < 0.9) moonAlpha = (t - 0.75) / 0.15;
    else if (t > 0.9) moonAlpha = 1;
    else if (t < 0.25 && t > 0.1) moonAlpha = 1 - (t - 0.1) / 0.15;
    else if (t <= 0.1) moonAlpha = 1;
    const alpha = Math.max(0, Math.min(1, moonAlpha));
    state.moonMesh.material.opacity = alpha;
    state.moonMesh.material.transparent = true;
    if (state.moonGlow) {
      state.moonGlow.material.opacity = alpha * 0.15;
      state.moonGlow.material.transparent = true;
    }
    // Moon light at night
    if (state.moonLight) {
      state.moonLight.intensity = alpha * 0.3;
      state.moonLight.position.set(moonX, moonY, -30);
    }
  } else {
    if (state.moonLight) state.moonLight.intensity = 0;
  }

  // Stars — fade with moon
  state.starField.visible = moonVisible;
  if (moonVisible) {
    let starAlpha = 1;
    if (t > 0.75 && t < 0.9) starAlpha = (t - 0.75) / 0.15;
    else if (t > 0.9) starAlpha = 1;
    else if (t < 0.25 && t > 0.1) starAlpha = 1 - (t - 0.1) / 0.15;
    else if (t <= 0.1) starAlpha = 1;
    state.starField.material.opacity = Math.max(0, Math.min(1, starAlpha));
    state.starField.material.transparent = true;
  }

  // Street lamps — on at night, off during day
  const lamps = getStreetLamps();
  let lampIntensity = 0;
  if (t > 0.75) lampIntensity = Math.min(1, (t - 0.75) / 0.1);
  else if (t < 0.25) lampIntensity = Math.max(0, 1 - (t - 0.1) / 0.15);
  else lampIntensity = 0;

  lamps.forEach(lamp => {
    // Point light intensity
    lamp.pointLight.intensity = lampIntensity * 1.8;
    // Bulb color: warm glow when on, dark when off
    if (lampIntensity > 0.2) {
      lamp.bulb.material.color.setHex(0xFFF3D4);
    } else {
      lamp.bulb.material.color.setHex(0x5D4037);
    }
    // Glow sphere: fade in/out with lampIntensity
    lamp.glowMat.opacity = lampIntensity * 0.35;
  });

  // House window glow — on at night, off during day
  const houseLightsArr = getHouseLights();
  const windowGlow = lampIntensity * 1.2; // same timing as street lamps
  houseLightsArr.forEach(hl => { hl.intensity = windowGlow; });

  // Update time display
  updateDayTimeDisplay(t);
}

function updateDayTimeDisplay(t) {
  const el = document.getElementById('time-display');
  if (!el) return;
  // Map t to 24h: t=0 → 0:00, t=0.25 → 6:00, t=0.5 → 12:00, t=0.75 → 18:00
  const hours24 = (t * 24) % 24;
  const hours = Math.floor(hours24);
  const mins = Math.floor((hours24 - hours) * 60);
  const h = hours.toString().padStart(2, '0');
  const m = mins.toString().padStart(2, '0');

  let icon = '☀️';
  if (t >= 0.2 && t < 0.3) icon = '🌅';
  else if (t >= 0.3 && t < 0.7) icon = '☀️';
  else if (t >= 0.7 && t < 0.8) icon = '🌇';
  else icon = '🌙';

  el.textContent = `${icon} ${h}:${m}`;
}

// ============================
// COMPASS
// ============================
function updateCompass() {
  const ring = document.getElementById('compass-ring');
  if (!ring) return;
  // cameraAngleX: 0 = camera at +Z (south), increases counterclockwise
  // Ring rotates SAME direction as camera orbit so N always points to actual north
  const degrees = state.cameraAngleX * 180 / Math.PI;
  ring.style.transform = `rotate(${degrees}deg)`;
}


// ============================
// MINIMAP
// ============================
let minimapCanvas, minimapCtx;
const MINIMAP_RANGE = 60; // world units visible on minimap

function initMinimap() {
  const el = document.getElementById('mini-map');
  if (!el) return;
  minimapCanvas = document.createElement('canvas');
  minimapCanvas.width = 150;
  minimapCanvas.height = 150;
  minimapCanvas.style.cssText = 'width:100%;height:100%;border-radius:50%;';
  el.appendChild(minimapCanvas);
  minimapCtx = minimapCanvas.getContext('2d');
}

function updateMinimap() {
  if (!minimapCtx || !state.player) return;
  const ctx = minimapCtx;
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / (MINIMAP_RANGE * 2);

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Background (dark green village)
  ctx.fillStyle = 'rgba(20, 40, 20, 0.8)';
  ctx.beginPath();
  ctx.arc(cx, cy, cx, 0, Math.PI * 2);
  ctx.fill();

  // Grid lines
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.15)';
  ctx.lineWidth = 0.5;
  for (let i = -MINIMAP_RANGE; i <= MINIMAP_RANGE; i += 15) {
    const x = cx + i * scale;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    const y = cy + i * scale;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const px = state.player.x || 0;
  const pz = state.player.z || 0;

  // Draw NPCs (yellow dots)
  Object.values(state.npcs).forEach(npc => {
    const dx = (npc.position.x - px) * scale;
    const dz = (npc.position.z - pz) * scale;
    const sx = cx + dx;
    const sy = cy + dz;
    if (sx < -5 || sx > w + 5 || sy < -5 || sy > h + 5) return;
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Monsters (red dots)
  Object.values(state.monsters).forEach(m => {
    const dx = (m.position.x - px) * scale;
    const dz = (m.position.z - pz) * scale;
    const sx = cx + dx;
    const sy = cy + dz;
    if (sx < -5 || sx > w + 5 || sy < -5 || sy > h + 5) return;
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw other players (cyan dots)
  Object.entries(state.players).forEach(([id, model]) => {
    if (id === state.playerId) return;
    const dx = (model.position.x - px) * scale;
    const dz = (model.position.z - pz) * scale;
    const sx = cx + dx;
    const sy = cy + dz;
    if (sx < -5 || sx > w + 5 || sy < -5 || sy > h + 5) return;
    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw player (white dot, always center)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Clip to circle
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(cx, cy, cx, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  let dt = state.clock ? state.clock.getDelta() : 0.016;
  if (isNaN(dt) || dt > 1) dt = 0.016; // safety clamp
  updateMovement();

  // Sync HUD HP/MP from state.player using existing update functions
  if (state.player && state.player.hp !== undefined) {
    updatePlayerHP(state.player.hp, state.player.maxHp);
    updatePlayerMP(state.player.mp, state.player.maxMp);
  }

  const playerModel = state.players[state.playerId];
  const time = Date.now() * 0.001;

  if (state.targetPos) {
    animateWalk(playerModel, 1, state.isAttacking);
  } else {
    stopWalk(playerModel, state.isAttacking);
    // Idle animation when not walking (skip arms if attacking)
    if (playerModel) {
      if (Date.now() >= state.attackEndTime) {
        state.isAttacking = false;
        animateIdle(playerModel, time);
      }
    }
  }

  // Auto blink (every 3-6 seconds)
  if (Date.now() - lastBlinkTime > nextBlinkDelay) {
    blinkEyes(playerModel);
    // Also blink NPCs
    Object.values(state.npcs).forEach(npc => blinkEyes(npc));
    lastBlinkTime = Date.now();
    nextBlinkDelay = 3000 + Math.random() * 3000;
  }

  // Water animation
  const water = getWaterMeshes();
  water.forEach(w => {
    if (w.type === 'bob') {
      // Lily pads bob up and down
      w.mesh.position.y = w.baseY + Math.sin(time * 1.5 + w.mesh.position.x * 0.5) * 0.015;
    } else if (w.type === 'ripple') {
      // Expanding ripple rings
      const scale = 1 + Math.sin(time * w.speed) * 0.3;
      w.mesh.scale.set(scale, scale, 1);
      w.mesh.material.opacity = 0.2 * (1 - Math.sin(time * w.speed) * 0.5);
    } else if (w.speed) {
      // Flowing water layers (horizontal movement)
      w.mesh.position.x = w.baseX + Math.sin(time * w.speed) * w.amp;
      if (w.mesh.material.opacity !== undefined) {
        w.mesh.material.opacity = 0.25 + Math.sin(time * 0.8 + w.baseX * 0.1) * 0.1;
      }
    }
  });

  if (state.previewModel) {
    state.previewModel.rotation.y += 0.01;
    state.previewRenderer.render(state.previewScene, state.previewCamera);
  }

  if (playerModel) {
    const t = playerModel.position;
    const dist = state.cameraDistance;
    const ax = state.cameraAngleX;
    const ay = state.cameraAngleY;
    const targetX = t.x + Math.sin(ax) * dist * Math.cos(ay);
    const targetY = t.y + dist * Math.sin(ay) + 3;
    const targetZ = t.z + Math.cos(ax) * dist * Math.cos(ay);
    state.camera.position.x += (targetX - state.camera.position.x) * 0.08;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.08;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;
    state.camera.lookAt(t.x, t.y + 1, t.z);
  }

  // Monster animation
  Object.values(state.monsters).forEach(m => animateMonster(m, time));

  // --- COMBAT: Target indicator + auto-attack ---
  if (state.targetedMonster) {
    const mob = state.monsters[state.targetedMonster];
    if (!mob) {
      cancelTarget();
    } else {
      // Move indicator ring
      if (state.targetIndicator) {
        state.targetIndicator.position.x = mob.position.x;
        state.targetIndicator.position.z = mob.position.z;
        state.targetIndicator.position.y = 0.05;
        const pulse = 1 + Math.sin(time * 4) * 0.15;
        state.targetIndicator.scale.set(pulse, pulse, 1);
      }
      // Auto-attack (skip if skill is armed — skill handles its own walk+cast)
      if (state.autoAttacking && !state.targetPos && !state.skillArmed) {
        const model = state.players[state.playerId];
        if (model) {
          const dist = model.position.distanceTo(mob.position);
          if (dist <= 1.8) {
            performAttack();
          } else {
            performAttack(); // will pathfind to monster
          }
        }
      }
    }
  } else if (state.targetIndicator) {
    state.targetIndicator.visible = false;
  }

  // Day/night cycle + compass
  updateDayNight(dt);
  // Flashlight follows player
  if (state.flashlightOn && state.flashlight && playerModel) {
    state.flashlight.position.set(playerModel.position.x, playerModel.position.y + 2.5, playerModel.position.z);
  }
  updateCompass();
  updateTargetHPBar();
  updateMinimap();

  if (state.scene && state.camera && state.renderer) {
    state.renderer.render(state.scene, state.camera);
  }
}

// ============================
// BOOT
// ============================
async function boot() {
  initScene();
  initPreview();
  initCustomization();

  // Restore NPC default rotation when dialogue closes
  document.addEventListener('dialogue-closed', (e) => {
    const npcId = e.detail.npcId;
    if (!npcId) return;
    // Find NPC data from server to get default rot
    const npcModel = state.npcs[npcId];
    if (npcModel && state._npcRots && state._npcRots[npcId] !== undefined) {
      npcModel.rotation.y = state._npcRots[npcId];
    }
  });
  gameLoop();

  // Check localStorage for saved wallet
  const savedWallet = localStorage.getItem('zenithia_wallet');
  const isVerified = localStorage.getItem('zenithia_verified') === 'true';

  // If previously verified in this session, auto-join (no captcha needed)
  if (savedWallet && isVerified) {
    state.walletAddress = savedWallet;
    loadingScreen.style.display = 'none';
    connectWebSocket('Adventurer', savedWallet);
    return;
  }

  // Try Phantom auto-connect
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect({ onlyIfTrusted: true });
      state.walletAddress = resp.publicKey.toString();
      localStorage.setItem('zenithia_wallet', state.walletAddress);
      const btn = document.getElementById('connect-wallet');
      btn.textContent = '✓ ' + state.walletAddress.slice(0, 6) + '...' + state.walletAddress.slice(-4);
      btn.style.background = '#4CAF50';
      console.log('[WALLET] Auto-connected:', state.walletAddress);

      // Show captcha for verification
      loadingScreen.style.display = 'none';
      loginScreen.style.display = 'flex';
      await loadCaptcha();
      return;
    } catch (e) {
      console.log('[WALLET] Phantom auto-connect failed');
    }
  }

  // Fallback: use saved wallet from localStorage
  if (savedWallet) {
    state.walletAddress = savedWallet;
    const btn = document.getElementById('connect-wallet');
    btn.textContent = '✓ ' + savedWallet.slice(0, 6) + '...' + savedWallet.slice(-4);
    btn.style.background = '#4CAF50';
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    await loadCaptcha();
    return;
  }

  // No wallet — show login screen
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  }, 1500);
}

boot();
