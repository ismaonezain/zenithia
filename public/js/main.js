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
  players: {}, // other players
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
  state.scene.background = new THREE.Color(0x87CEEB); // sky blue
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

  // Ground (placeholder — green grass)
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  state.scene.add(ground);

  // Grid helper (debug)
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
      // Send join after receiving welcome
      state.ws.send(JSON.stringify({
        type: 'join',
        name: document.getElementById('name-input').value || 'Adventurer',
        wallet: null,
        x: 0,
        y: 0,
        z: 0,
      }));
      break;

    case 'joined':
      state.player = msg.player;
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
  group.userData = { id: player.id, name: player.name };

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

// --- Game Loop ---
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (state.scene && state.camera && state.renderer) {
    state.renderer.render(state.scene, state.camera);
  }
}

// --- Click to Move ---
canvas.addEventListener('click', (e) => {
  if (!state.connected || !state.player) return;

  // Raycast from camera to ground
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, state.camera);

  const ground = state.scene.children.find(c => c.geometry?.type === 'PlaneGeometry');
  if (ground) {
    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Update local player position (simple teleport for now)
      const model = state.players[state.playerId];
      if (model) {
        model.position.set(point.x, 0, point.z);

        // Send move to server
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

  // Hide loading, show login
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  }, 1500);
}

boot();
