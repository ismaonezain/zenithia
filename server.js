const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const PORT = 2567;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// --- World State ---
const world = {
  players: {},
  npcs: {},
  monsters: {},
  items: {},
};

// --- WebSocket Connection ---
wss.on('connection', (ws) => {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  console.log(`[CONNECT] ${playerId}`);

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
    delete world.players[playerId];
    broadcast({
      type: 'player_left',
      playerId,
    });
  });
});

// --- Message Handler ---
function handleMessage(ws, playerId, msg) {
  switch (msg.type) {
    case 'join':
      // Player joins with name + wallet
      world.players[playerId] = {
        id: playerId,
        name: msg.name || 'Adventurer',
        wallet: msg.wallet || null,
        x: msg.x || 0,
        y: msg.y || 0,
        z: msg.z || 0,
        class: null, // Not chosen yet
        level: 1,
        hp: 100,
        mp: 50,
      };
      ws.send(JSON.stringify({
        type: 'joined',
        player: world.players[playerId],
      }));
      broadcast({
        type: 'player_joined',
        player: world.players[playerId],
      }, ws);
      break;

    case 'move':
      // Player movement update
      if (world.players[playerId]) {
        world.players[playerId].x = msg.x;
        world.players[playerId].y = msg.y;
        world.players[playerId].z = msg.z;
        broadcast({
          type: 'player_moved',
          playerId,
          x: msg.x,
          y: msg.y,
          z: msg.z,
        }, ws);
      }
      break;

    case 'chat':
      // Global chat
      broadcast({
        type: 'chat',
        playerId,
        name: world.players[playerId]?.name || 'Unknown',
        message: msg.message,
      });
      break;

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

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket on ws://localhost:${PORT}\n`);
});
