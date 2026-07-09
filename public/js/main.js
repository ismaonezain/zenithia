// Zenithia — Client Entry Point
import * as THREE from 'three';
import { buildTerrain } from './terrain.js';
import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment, blinkEyes, waveHand, idleArms } from './character.js';
import { DialogueSystem } from './dialogue_ui.js';
import { InventoryUI } from './inventory.js';
import { QuestUI } from './quest_ui.js';
import { PartyUI } from './party_ui.js';
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
  dialogue: null,
  inventoryUI: null,
  questUI: null,
  partyUI: null,
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

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  state.scene.add(sun);

  buildTerrain(state.scene);
  state.clock = new THREE.Clock();

  // Init dialogue system
  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
  state.questUI = new QuestUI(null, { name: 'Adventurer' });
  state.partyUI = new PartyUI(null, { name: 'Adventurer' });

  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
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

  const stylePicker = document.getElementById('hair-style-picker');
  ['short', 'medium', 'long', 'spiky', 'ponytail', 'mohawk', 'braids', 'bun', 'buzz', 'twin_tails', 'bowl'].forEach(style => {
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
      state.dialogue.ws = state.ws;
      state.dialogue.playerState = state.player;

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
      state.dialogue.open(msg.npcId, msg.name, msg.title);
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
        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
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
        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
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
// CLICK TO MOVE
// ============================
canvas.addEventListener('click', (e) => {
  if (!state.connected || !state.player) return;
  // Don't move if dialogue is open
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

  // Check NPC proximity
  for (const npc of Object.values(state.npcs)) {
    if (npc.position.distanceTo(point) < 2) {
      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
      return;
    }
  }

  // Check Monster proximity — attack
  for (const mob of Object.values(state.monsters)) {
    if (mob.position.distanceTo(point) < 2) {
      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
      // Face the monster
      const model = state.players[state.playerId];
      if (model) model.lookAt(mob.position);
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

  const playerModel = state.players[state.playerId];
  if (state.targetPos) animateWalk(playerModel, 1);
  else stopWalk(playerModel);

  if (state.previewModel) {
    state.previewModel.rotation.y += 0.01;
    state.previewRenderer.render(state.previewScene, state.previewCamera);
  }

  if (playerModel) {
    const t = playerModel.position;
    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
    state.camera.lookAt(t.x, t.y + 1, t.z);
  }

  // Monster animation
  const time = Date.now() * 0.001;
  Object.values(state.monsters).forEach(m => animateMonster(m, time));

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
