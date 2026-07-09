const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const PORT = 2567;
const SAVE_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(SAVE_DIR, 'world.json');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// --- Load World State ---
function loadWorld() {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      const data = fs.readFileSync(SAVE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[WARN] Failed to load world:', e.message);
  }
  return createFreshWorld();
}

function createFreshWorld() {
  return {
    players: {},
    npcs: initNPCs(),
    monsters: {},
    time: Date.now(),
    region: 'willowmere',
  };
}

function saveWorld() {
  try {
    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
    // Don't save connected players (they're ephemeral)
    const toSave = { ...world, players: {} };
    fs.writeFileSync(SAVE_FILE, JSON.stringify(toSave, null, 2));
  } catch (e) {
    console.error('[WARN] Failed to save world:', e.message);
  }
}

// --- NPC Definitions ---
function initNPCs() {
  return {
    elder_maren: {
      id: 'elder_maren',
      name: 'Elder Maren',
      title: 'Village Elder',
      x: 10, y: 0, z: -5,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: true,
    },
    sir_gendut: {
      id: 'sir_gendut',
      name: 'Sir Gendut',
      title: 'Merchant',
      x: 5, y: 0, z: 8,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: false,
    },
    miss_lira: {
      id: 'miss_lira',
      name: 'Miss Lira',
      title: 'Aspiring Adventurer',
      x: -8, y: 0, z: 3,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: true,
    },
    mr_tani: {
      id: 'mr_tani',
      name: 'Mr. Tani',
      title: 'Farmer',
      x: -15, y: 0, z: 10,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: true,
    },
    mrs_ningsih: {
      id: 'mrs_ningsih',
      name: 'Mrs. Ningsih',
      title: 'Cook',
      x: 8, y: 0, z: 12,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: false,
    },
    kris: {
      id: 'kris',
      name: 'Kris',
      title: 'Troublemaker',
      x: -3, y: 0, z: -10,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: false,
    },
    guard_ren: {
      id: 'guard_ren',
      name: 'Guard Ren',
      title: 'Gate Guard',
      x: 0, y: 0, z: 20,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: false,
    },
    herbalist_sari: {
      id: 'herbalist_sari',
      name: 'Herbalist Sari',
      title: 'Herbalist',
      x: 15, y: 0, z: -8,
      dialogue: 'greeting',
      reputation: 0,
      questAvailable: false,
    },
  };
}

// --- World State ---
let world = loadWorld();

// --- Player Management ---
const connectedPlayers = {}; // websocket → player data

function createPlayer(playerId, name, wallet) {
  // Check if player exists in saved data
  if (world.players[playerId]) {
    return world.players[playerId];
  }

  const player = {
    id: playerId,
    name: name || 'Adventurer',
    wallet: wallet || null,
    x: 0, y: 0, z: 0,
    class: null,
    className: null, // village name (Laborer, Miner, etc.)
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    atk: 10,
    def: 5,
    spd: 10,
    crit: 0.05,
    gold: 50,
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      shield: null,
      accessory1: null,
      accessory2: null,
    },
    quests: {},
    reputation: {},
    region: 'willowmere',
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };

  world.players[playerId] = player;
  return player;
}

function getPlayer(playerId) {
  return world.players[playerId] || null;
}

function removePlayer(playerId) {
  // Save before removing
  saveWorld();
}

// --- WebSocket Connection ---
wss.on('connection', (ws) => {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  console.log(`[CONNECT] ${playerId}`);

  ws.playerId = playerId;

  // Send welcome
  ws.send(JSON.stringify({
    type: 'welcome',
    playerId,
    world: {
      time: Date.now(),
      region: 'willowmere',
    },
  }));

  // Handle messages
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleMessage(ws, playerId, msg);
    } catch (e) {
      console.error('[ERROR] Invalid message:', e.message);
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    console.log(`[DISCONNECT] ${playerId}`);
    removePlayer(playerId);
    delete connectedPlayers[ws];
    broadcast({
      type: 'player_left',
      playerId,
    });
  });
});

// --- Message Handler ---
function handleMessage(ws, playerId, msg) {
  switch (msg.type) {
    case 'join': {
      const player = createPlayer(playerId, msg.name, msg.wallet);
      connectedPlayers[ws] = player;

      // Send current world state to joining player
      ws.send(JSON.stringify({
        type: 'joined',
        player,
        npcs: world.npcs,
        onlinePlayers: Object.values(connectedPlayers).filter(p => p.id !== playerId),
      }));

      // Notify others
      broadcast({
        type: 'player_joined',
        player,
      }, ws);
      break;
    }

    case 'move': {
      const player = connectedPlayers[ws];
      if (player) {
        player.x = msg.x;
        player.y = msg.y;
        player.z = msg.z;
        broadcast({
          type: 'player_moved',
          playerId,
          x: msg.x,
          y: msg.y,
          z: msg.z,
        }, ws);
      }
      break;
    }

    case 'chat': {
      const player = connectedPlayers[ws];
      if (player) {
        broadcast({
          type: 'chat',
          playerId,
          name: player.name,
          message: msg.message.slice(0, 200), // limit length
        });
      }
      break;
    }

    case 'interact_npc': {
      const player = connectedPlayers[ws];
      const npc = world.npcs[msg.npcId];
      if (player && npc) {
        // Send NPC dialogue to player
        ws.send(JSON.stringify({
          type: 'npc_dialogue',
          npcId: npc.id,
          name: npc.name,
          title: npc.title,
          dialogue: npc.dialogue,
          reputation: player.reputation[npc.id] || 0,
        }));
      }
      break;
    }

    case 'save': {
      saveWorld();
      ws.send(JSON.stringify({ type: 'saved' }));
      break;
    }

    default:
      console.log(`[WARN] Unknown message type: ${msg.type}`);
  }
}

// --- Broadcast ---
function broadcast(data, exclude = null) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client !== exclude && client.readyState === 1) {
      client.send(payload);
    }
  });
}

// --- Auto-save every 5 minutes ---
setInterval(() => {
  saveWorld();
  console.log('[SAVE] World saved');
}, 5 * 60 * 1000);

// --- Graceful shutdown ---
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Saving world...');
  saveWorld();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Saving world...');
  saveWorld();
  process.exit(0);
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket on ws://localhost:${PORT}`);
  console.log(`💾 Auto-save every 5 minutes\n`);
});
