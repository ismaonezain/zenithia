// Zenithia — Client Entry Point
import * as THREE from 'three';
import { buildTerrain, isWalkable, getWaterMeshes } from './terrain.js';
import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment, blinkEyes, waveHand, idleArms, animateIdle } from './character.js';
import { DialogueSystem } from './dialogue_ui.js';
import { InventoryUI } from './inventory.js';
import { QuestUI } from './quest_ui.js';
import { PartyUI } from './party_ui.js';
import { ShopUI } from './shop_ui.js';
import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';

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
  customization: {
    gender: 'male',
    classType: 'laborer',
    skinIdx: 0,
    hairColorIdx: 0,
    hairStyle: 'undercut',
    topColorIdx: 0,
    bottomColorIdx: 0,
    eyeColorIdx: 0,
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

  state.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
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
}

// ============================
// PREVIEW SCENE
// ============================
function initPreview() {
  const pCanvas = document.getElementById('preview-canvas');
  state.previewScene = new THREE.Scene();
  state.previewScene.background = new THREE.Color(0x2a2a3e);

  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
  state.previewCamera.position.set(0, 1.2, 3);
  state.previewCamera.lookAt(0, 0.8, 0);

  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
  state.previewRenderer.setSize(200, 250);

  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(2, 3, 2);
  state.previewScene.add(dir);

  updatePreviewModel();
}

const PANTS_COLORS = [0x5D4037, 0x37474F, 0x1B5E20, 0x4E342E, 0x212121, 0x0D47A1, 0xBF360C, 0x880E4F];
const CLASS_TRIM = { laborer: 0x8D6E63, miner: 0x78909C, gardener: 0x66BB6A, herbalist: 0xAB47BC, watchman: 0x455A64 };

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
    };
    genderPicker.appendChild(o);
  });

  // Class picker
  const classPicker = document.getElementById('class-picker');
  ['laborer', 'miner', 'gardener', 'herbalist', 'watchman'].forEach((cls, i) => {
    const o = document.createElement('div');
    o.className = 'option' + (i === 0 ? ' selected' : '');
    o.textContent = cls;
    o.onclick = () => {
      classPicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      state.customization.classType = cls;
      updatePreviewModel();
    };
    classPicker.appendChild(o);
  });

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
    handleServerMessage(JSON.parse(event.data));
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
  state.player = {
    id: 'sp_' + Date.now(),
    name: playerName || 'Adventurer',
    wallet: wallet,
    hp: 100, maxHp: 100,
    mp: 50, maxMp: 50,
    level: 1, xp: 0,
    class: 'laborer',
    attack: 5, defense: 2,
    x: 0, z: 0,
    inventory: [],
    equipment: {},
    zen: 0,
    customization: state.customization,
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
      wsSend(JSON.stringify({
        type: 'join',
        name: document.getElementById('name-input').value || 'Adventurer',
        wallet: state.walletAddress || null,
        customization: state.customization,
      }));
      break;

    case 'joined':
      state.player = msg.player;
      state.dialogue.ws = state.ws;
      state.dialogue.playerState = state.player;

      // Restore saved customization
      if (msg.player.customization && Object.keys(msg.player.customization).length > 0) {
        Object.assign(state.customization, msg.player.customization);
      }

      if (msg.npcs) {
        console.log('[NPC] Received', Object.keys(msg.npcs).length, 'NPCs:', Object.keys(msg.npcs));
        Object.values(msg.npcs).forEach(npc => {
          try {
            const model = createNPCModel(npc);
            state.scene.add(model);
            state.npcs[npc.id] = model;
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
            if (npc.rot) g.rotation.y = npc.rot;
            g.userData = { id: npc.id, name: npc.name, type: 'npc' };
            state.scene.add(g);
            state.npcs[npc.id] = g;
            console.log('[NPC] Fallback added', npc.id);
          }
        });
      }
      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
      showHUD();
      createPlayerModelInWorld(state.player);

      // Update HUD name for returning players
      if (msg.returning) {
        document.getElementById('hud-name').textContent = state.player.name;
        document.getElementById('hud-level').textContent = 'Lv.' + state.player.level;
      }
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
      break;

    case 'npc_dialogue':
      state.dialogue.open(msg.npcId, msg.name, msg.title);
      // Don't auto-open shop — let dialogue add Buy/Sell button for merchants
      break;

    case 'monster_killed': {
      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP | Loot: ${lootText}`);
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      if (msg.loot) {
        msg.loot.forEach(l => {
          if (!state.player.inventory) state.player.inventory = [];
          const existing = state.player.inventory.find(i => i.id === l.id);
          if (existing) existing.quantity = (existing.quantity || 1) + l.quantity;
          else state.player.inventory.push({ ...l });
        });
        state.inventoryUI.player = state.player;
      }
      break;
    }

    case 'item_used': {
      state.player.hp = msg.hp;
      state.player.mp = msg.mp;
      state.player.inventory = msg.inventory;
      state.inventoryUI.player = state.player;
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
      state.inventoryUI.player = state.player;
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
    case 'quest_started':
      addChatMessage('System', `Quest started: ${msg.questName}`);
      break;

    case 'joined':
      // Spawn existing monsters
      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
      break;

    case 'monster_spawn':
      spawnMonsterClient(msg.monster);
      break;

    case 'monster_move':
      if (state.monsters[msg.monsterId]) {
        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
      }
      break;

    case 'monster_hit': {
      const mob = state.monsters[msg.monsterId];
      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
      break;
    }

    case 'monster_died': {
      const mob = state.monsters[msg.monsterId];
      if (mob) {
        state.scene.remove(mob);
        delete state.monsters[msg.monsterId];
      }
      break;
    }

    case 'monster_attack': {
      showDamageNumber(null, msg.damage, false, msg.targetId);
      break;
    }

    case 'player_hit': {
      updatePlayerHP(msg.hp, msg.maxHp);
      break;
    }

    case 'player_died': {
      updatePlayerHP(msg.hp, msg.hp);
      addChatMessage('System', 'You died! Respawning at village...');
      break;
    }

    case 'monster_killed': {
      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      break;
    }

    case 'level_up': {
      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
      updatePlayerHP(msg.maxHp, msg.maxHp);
      updatePlayerMP(msg.maxMp, msg.maxMp);
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
        state.inventoryUI.player = state.player;
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
    case 'shop_catalog':
    case 'shop_result':
    case 'shop_error': {
      if (state.shopUI) {
        state.shopUI.player = state.player;
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
  state.scene.add(model);
  state.players[player.id] = model;
}

function createOtherPlayer(player) {
  const c = player.customization || {};
  const model = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx || 0],
    hairColor: PALETTES.hair[c.hairColorIdx || 0],
    hairStyle: look.hairStyle || 'undercut',
    bodyColor: PALETTES.body[c.topColorIdx || 0],
    pantsColor: PANTS_COLORS[c.bottomColorIdx || 0],
    eyeColor: PALETTES.eyes[c.eyeColorIdx || 0],
    trimColor: CLASS_TRIM[c.classType] || 0xFFFFFF,
    gender: c.gender || 'male',
    classType: c.classType || 'laborer',
  });
  model.position.set(player.x, player.y, player.z);
  model.userData = { id: player.id, name: player.name, type: 'player' };
  state.scene.add(model);
  state.players[player.id] = model;
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
  div.innerHTML = `<strong>${name}:</strong> ${message}`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
// ============================
// COMBAT HELPERS
// ============================
const MONSTER_DATA = {
  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
};

function spawnMonsterClient(m) {
  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
  model.position.set(m.x, 0, m.z);
  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
  state.scene.add(model);
  state.monsters[m.id] = model;
}

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

function updatePlayerHP(hp, maxHp) {
  const fill = document.getElementById('hp-fill');
  const text = document.getElementById('hp-text');
  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
}

function updatePlayerMP(mp, maxMp) {
  const fill = document.getElementById('mp-fill');
  const text = document.getElementById('mp-text');
  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
}

// ============================
// A* PATHFINDING
// ============================
function findPath(startX, startZ, endX, endZ) {
  const gridMin = -30, gridMax = 30;
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
    if (dist < 3) {
      const model = state.players[state.playerId];
      if (model) {
        const playerDist = model.position.distanceTo(npc.position);
        if (playerDist < 2.5) {
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

  // Check Monster proximity — attack
  for (const mob of Object.values(state.monsters)) {
    if (mob.position.distanceTo(point) < 2) {
      const model = state.players[state.playerId];
      if (model) {
        const faceDir = mob.position.clone().sub(model.position).normalize();
        state.lastFacing = model.position.clone().add(faceDir);
        model.lookAt(state.lastFacing);
      }
      wsSend(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
      return;
    }
  }

  // Grid snap — round to nearest integer (tile center)
  const snapX = Math.round(point.x);
  const snapZ = Math.round(point.z);

  // Collision check
  if (!isWalkable(snapX, snapZ)) return;

  // Show click indicator
  showClickIndicator(snapX, snapZ);

  // A* pathfinding — route around obstacles
  const model = state.players[state.playerId];
  if (!model) return;
  const startX = Math.round(model.position.x);
  const startZ = Math.round(model.position.z);
  const path = findPath(startX, startZ, snapX, snapZ);

  if (path && path.length > 1) {
    state.pathWaypoints = path.slice(1); // skip current position
    state.targetPos = new THREE.Vector3(state.pathWaypoints[0].x, 0, state.pathWaypoints[0].z);
  } else if (path && path.length === 1) {
    state.targetPos = new THREE.Vector3(path[0].x, 0, path[0].z);
  }
});

// ============================
// SMOOTH MOVEMENT
// ============================
function updateMovement() {
  if (!state.targetPos) return;
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
    }
    return;
  }

  // Check next step collision — stop if blocked
  const step = dir.clone().normalize().multiplyScalar(0.15);
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
      e.target.value = '';
    }
  }
});

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
  if (name) connectWebSocket(name, state.walletAddress);
});

// ============================
// GAME LOOP
// ============================
// Blink timer state
let lastBlinkTime = 0;
let nextBlinkDelay = 3000 + Math.random() * 3000;

function gameLoop() {
  requestAnimationFrame(gameLoop);
  updateMovement();

  const playerModel = state.players[state.playerId];
  const time = Date.now() * 0.001;

  if (state.targetPos) {
    animateWalk(playerModel, 1);
  } else {
    stopWalk(playerModel);
    // Idle animation when not walking
    if (playerModel) animateIdle(playerModel, time);
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
