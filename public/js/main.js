// Zenithia — Client Entry Point
import * as THREE from 'three';
import { buildTerrain } from './terrain.js';
import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk } from './character.js';

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
  customization: {
    skinIdx: 0,
    hairColorIdx: 0,
    hairStyle: 'short',
    bodyIdx: 0,
  },
  previewScene: null,
  previewCamera: null,
  previewRenderer: null,
  previewModel: null,
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

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  state.scene.add(sun);

  // Build Willowmere terrain
  buildTerrain(state.scene);

  state.clock = new THREE.Clock();

  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ============================
// PREVIEW SCENE (character customization)
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

function updatePreviewModel() {
  if (state.previewModel) state.previewScene.remove(state.previewModel);
  const c = state.customization;
  state.previewModel = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx],
    hairColor: PALETTES.hair[c.hairColorIdx],
    hairStyle: c.hairStyle,
    bodyColor: PALETTES.body[c.bodyIdx],
  });
  state.previewScene.add(state.previewModel);
}

// ============================
// CUSTOMIZATION UI
// ============================
function initCustomization() {
  // Skin
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

  // Hair color
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

  // Hair style
  const stylePicker = document.getElementById('hair-style-picker');
  ['short', 'medium', 'long', 'spiky', 'ponytail'].forEach(style => {
    const o = document.createElement('div');
    o.className = 'option' + (style === 'short' ? ' selected' : '');
    o.textContent = style;
    o.onclick = () => {
      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      state.customization.hairStyle = style;
      updatePreviewModel();
    };
    stylePicker.appendChild(o);
  });

  // Body color
  const bodyPicker = document.getElementById('body-picker');
  PALETTES.body.forEach((color, i) => {
    const s = document.createElement('div');
    s.className = 'swatch' + (i === 0 ? ' selected' : '');
    s.style.background = '#' + color.toString(16).padStart(6, '0');
    s.onclick = () => {
      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      state.customization.bodyIdx = i;
      updatePreviewModel();
    };
    bodyPicker.appendChild(s);
  });
}

// ============================
// WEBSOCKET
// ============================
function connectWebSocket(playerName, wallet) {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  state.ws = new WebSocket(`${protocol}//${location.host}`);

  state.ws.onopen = () => {
    console.log('[WS] Connected');
    state.connected = true;
  };
  state.ws.onmessage = (event) => {
    handleServerMessage(JSON.parse(event.data));
  };
  state.ws.onclose = () => {
    console.log('[WS] Disconnected');
    state.connected = false;
  };
}

// ============================
// SERVER MESSAGES
// ============================
function handleServerMessage(msg) {
  switch (msg.type) {
    case 'welcome':
      state.playerId = msg.playerId;
      state.ws.send(JSON.stringify({
        type: 'join',
        name: document.getElementById('name-input').value || 'Adventurer',
        wallet: null,
      }));
      break;

    case 'joined':
      state.player = msg.player;
      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
        const model = createNPCModel(npc);
        state.scene.add(model);
        state.npcs[npc.id] = model;
      });
      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
      showHUD();
      createPlayerModelInWorld(state.player);
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
      showNPCDialogue(msg);
      break;
  }
}

// ============================
// PLAYER MODELS
// ============================
function createPlayerModelInWorld(player) {
  const c = state.customization;
  const model = createPlayerModel({
    skinColor: PALETTES.skin[c.skinIdx],
    hairColor: PALETTES.hair[c.hairColorIdx],
    hairStyle: c.hairStyle,
    bodyColor: PALETTES.body[c.bodyIdx],
  });
  model.position.set(player.x, player.y, player.z);
  model.userData = { id: player.id, name: player.name, type: 'player' };
  state.scene.add(model);
  state.players[player.id] = model;
}

function createOtherPlayer(player) {
  const model = createPlayerModel({});
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
// NPC DIALOGUE
// ============================
function showNPCDialogue(data) {
  let popup = document.getElementById('npc-dialogue');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'npc-dialogue';
    popup.style.cssText = `
      position:fixed; bottom:200px; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.9); color:white; padding:20px; border-radius:12px;
      border:2px solid #4CAF50; max-width:400px; text-align:center; z-index:20;
    `;
    document.body.appendChild(popup);
  }

  const dialogues = {
    elder_maren: 'Selamat datang, pemuda. Willowmere adalah rumah yang aman — setidaknya untuk sekarang.',
    sir_gendut: 'Halo! Butuh obat atau alat? Sir Gendut punya semua!',
    miss_lira: 'Hei! Kamu adventurer baru ya? Aku Lira! Aku mau jadi adventurer juga!',
    mr_tani: 'Hari yang panas untuk panen. Kamu mau bantu?',
    mrs_ningsih: 'Mau makan? Mrs. Ningsih masak nasi goreng spesial hari ini!',
    kris: 'Hehe, kamu kelihatan baru di sini. Hati-hati ya...',
    guard_ren: 'Hari yang tenang. Semoga terus begini.',
    herbalist_sari: 'Kamu... berbeda. Aku bisa merasakan sesuatu darimu.',
  };

  popup.innerHTML = `
    <div style="color:#4CAF50; font-weight:bold; margin-bottom:8px;">${data.name}</div>
    <div style="color:#aaa; font-size:0.8rem; margin-bottom:12px;">${data.title}</div>
    <div style="margin-bottom:16px;">${dialogues[data.npcId] || '...'}</div>
    <button onclick="this.parentElement.style.display='none'"
      style="padding:8px 24px; background:#4CAF50; border:none; color:white; border-radius:6px; cursor:pointer;">
      Close
    </button>
  `;
  popup.style.display = 'block';
}

// ============================
// CLICK TO MOVE
// ============================
canvas.addEventListener('click', (e) => {
  if (!state.connected || !state.player) return;

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

  // Check NPC proximity
  for (const npc of Object.values(state.npcs)) {
    if (npc.position.distanceTo(point) < 2) {
      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
      return;
    }
  }

  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
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
    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
    state.targetPos = null;
    return;
  }

  dir.normalize().multiplyScalar(0.15);
  model.position.add(dir);
  model.lookAt(state.targetPos);

  state.ws.send(JSON.stringify({
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
      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
      addChatMessage(state.player?.name || 'You', msg);
      e.target.value = '';
    }
  }
});

// ============================
// START GAME
// ============================
document.getElementById('start-game').addEventListener('click', () => {
  const name = document.getElementById('name-input').value.trim();
  if (name) connectWebSocket(name, null);
});

// ============================
// GAME LOOP
// ============================
function gameLoop() {
  requestAnimationFrame(gameLoop);
  updateMovement();

  // Walk animation
  const playerModel = state.players[state.playerId];
  if (state.targetPos) animateWalk(playerModel, 1);
  else stopWalk(playerModel);

  // Preview rotation
  if (state.previewModel) {
    state.previewModel.rotation.y += 0.01;
    state.previewRenderer.render(state.previewScene, state.previewCamera);
  }

  // Camera follow
  if (playerModel) {
    const t = playerModel.position;
    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
    state.camera.lookAt(t.x, t.y + 1, t.z);
  }

  if (state.scene && state.camera && state.renderer) {
    state.renderer.render(state.scene, state.camera);
  }
}

// ============================
// BOOT
// ============================
function boot() {
  initScene();
  initPreview();
  initCustomization();
  gameLoop();
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  }, 1500);
}

boot();
