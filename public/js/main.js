// Zenithia — Client Entry Point
import * as THREE from 'three';

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
};

// --- DOM Elements ---
const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const hud = document.getElementById('hud');

// --- Initialize Three.js ---
function initScene() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x87CEEB);
  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  state.camera.position.set(0, 15, 20);
  state.camera.lookAt(0, 0, 0);

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  state.scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  state.scene.add(sun);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  state.scene.add(ground);

  // Grid helper
  const grid = new THREE.GridHelper(500, 100, 0x388E3C, 0x2E7D32);
  grid.position.y = 0.01;
  state.scene.add(grid);

  state.clock = new THREE.Clock();

  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --- WebSocket ---
function connectWebSocket(playerName, wallet) {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  state.ws = new WebSocket(`${protocol}//${location.host}`);

  state.ws.onopen = () => {
    console.log('[WS] Connected');
    state.connected = true;
  };

  state.ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    handleServerMessage(msg);
  };

  state.ws.onclose = () => {
    console.log('[WS] Disconnected');
    state.connected = false;
  };
}

// --- Server Messages ---
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
      // Spawn NPCs
      if (msg.npcs) {
        Object.values(msg.npcs).forEach(npc => createNPCModel(npc));
      }
      // Spawn existing players
      if (msg.onlinePlayers) {
        msg.onlinePlayers.forEach(p => createOtherPlayer(p));
      }
      showHUD();
      createPlayerModel(state.player);
      break;

    case 'player_joined':
      createOtherPlayer(msg.player);
      break;

    case 'player_moved':
      updateOtherPlayer(msg);
      break;

    case 'player_left':
      removeOtherPlayer(msg.playerId);
      break;

    case 'chat':
      addChatMessage(msg.name, msg.message);
      break;

    case 'npc_dialogue':
      showNPCDialogue(msg);
      break;

    case 'saved':
      console.log('[SERVER] World saved');
      break;
  }
}

// --- Player Model (Boxy Style) ---
function createPlayerModel(player) {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.45;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 1.5, 0.26);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 1.5, 0.26);
  group.add(rightEye);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.3);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.15, 0.25, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.15, 0.25, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  group.position.set(player.x, player.y, player.z);
  group.userData = { id: player.id, name: player.name, type: 'player' };

  state.scene.add(group);
  state.players[player.id] = group;
}

function createOtherPlayer(player) {
  createPlayerModel(player);
}

function updateOtherPlayer(msg) {
  const model = state.players[msg.playerId];
  if (model) {
    model.position.set(msg.x, msg.y, msg.z);
  }
}

function removeOtherPlayer(playerId) {
  const model = state.players[playerId];
  if (model) {
    state.scene.remove(model);
    delete state.players[playerId];
  }
}

// --- NPC Model ---
function createNPCModel(npc) {
  const group = new THREE.Group();

  // Body (slightly different color per NPC)
  const colors = {
    elder_maren: 0x8D6E63,
    sir_gendut: 0xFF8F00,
    miss_lira: 0xE91E63,
    mr_tani: 0x689F38,
    mrs_ningsih: 0xAD1457,
    kris: 0x42A5F5,
    guard_ren: 0x607D8B,
    herbalist_sari: 0x7B1FA2,
  };

  const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const bodyMat = new THREE.MeshLambertMaterial({ color: colors[npc.id] || 0x9E9E9E });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.45;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 1.5, 0.26);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 1.5, 0.26);
  group.add(rightEye);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.3);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.15, 0.25, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.15, 0.25, 0);
  group.add(rightLeg);

  // Name tag (floating text placeholder — simple box)
  const tagGeo = new THREE.BoxGeometry(1.2, 0.2, 0.05);
  const tagMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.y = 2.0;
  group.add(tag);

  group.position.set(npc.x, npc.y, npc.z);
  group.userData = { id: npc.id, name: npc.name, type: 'npc' };

  state.scene.add(group);
  state.npcs[npc.id] = group;
}

// --- HUD ---
function showHUD() {
  loadingScreen.style.display = 'none';
  loginScreen.style.display = 'none';
  hud.style.display = 'block';
}

// --- Chat ---
function addChatMessage(name, message) {
  const chatMessages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.innerHTML = `<strong>${name}:</strong> ${message}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- NPC Dialogue ---
function showNPCDialogue(data) {
  // Simple dialogue popup
  let popup = document.getElementById('npc-dialogue');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'npc-dialogue';
    popup.style.cssText = `
      position: fixed; bottom: 200px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 12px;
      border: 2px solid #4CAF50; max-width: 400px; text-align: center; z-index: 20;
    `;
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div style="color: #4CAF50; font-weight: bold; margin-bottom: 8px;">${data.name}</div>
    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 12px;">${data.title}</div>
    <div style="margin-bottom: 16px;">${getDialogueText(data)}</div>
    <button onclick="this.parentElement.style.display='none'" 
      style="padding: 8px 24px; background: #4CAF50; border: none; color: white; border-radius: 6px; cursor: pointer;">
      Close
    </button>
  `;
  popup.style.display = 'block';
}

function getDialogueText(data) {
  const dialogues = {
    greeting: {
      elder_maren: 'Selamat datang, pemuda. Willowmere adalah rumah yang aman — setidaknya untuk sekarang.',
      sir_gendut: 'Halo! Butuh obat atau alat? Sir Gendut punya semua!',
      miss_lira: 'Hei! Kamu adventurer baru ya? Aku Lira! Aku mau jadi adventurer juga!',
      mr_tani: 'Hari yang panas untuk panen. Kamu mau bantu?',
      mrs_ningsih: 'Mau makan? Mrs. Ningsih masak nasi goreng spesial hari ini!',
      kris: 'Hehe, kamu kelihatan baru di sini. Hati-hati ya...',
      guard_ren: 'Hari yang tenang. Semoga terus begini.',
      herbalist_sari: 'Kamu... berbeda. Aku bisa merasakan sesuatu darimu.',
    },
  };
  return dialogues[data.dialogue]?.[data.npcId] || '...';
}

// --- Click to Move ---
canvas.addEventListener('click', (e) => {
  if (!state.connected || !state.player) return;

  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, state.camera);

  const ground = state.scene.getObjectByName('ground');
  if (ground) {
    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Check NPC proximity
      let clickedNPC = null;
      Object.values(state.npcs).forEach(npc => {
        const dist = npc.position.distanceTo(point);
        if (dist < 2) clickedNPC = npc;
      });

      if (clickedNPC) {
        // Interact with NPC
        state.ws.send(JSON.stringify({
          type: 'interact_npc',
          npcId: clickedNPC.userData.id,
        }));
        return;
      }

      // Move player
      const model = state.players[state.playerId];
      if (model) {
        model.position.set(point.x, 0, point.z);
        state.ws.send(JSON.stringify({
          type: 'move',
          x: point.x,
          y: 0,
          z: point.z,
        }));
      }
    }
  }
});

// --- Chat Input ---
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = e.target;
    const message = input.value.trim();
    if (message && state.connected) {
      state.ws.send(JSON.stringify({ type: 'chat', message }));
      addChatMessage(state.player?.name || 'You', message);
      input.value = '';
    }
  }
});

// --- Start Game ---
document.getElementById('start-game').addEventListener('click', () => {
  const name = document.getElementById('name-input').value.trim();
  if (name) {
    connectWebSocket(name, null);
  }
});

// --- Boot ---
function boot() {
  initScene();
  gameLoop();

  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  }, 1500);
}

// --- Game Loop ---
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (state.scene && state.camera && state.renderer) {
    state.renderer.render(state.scene, state.camera);
  }
}

boot();
